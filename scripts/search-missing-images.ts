import "dotenv/config";
import { config } from "dotenv";
import fs from "fs";
import pg from "pg";
import sharp from "sharp";

config({ path: ".env.local", quiet: true });

/**
 * Second pass after fetch-real-images.ts: products that neither BigBuy nor
 * Open Icecat know about get a photo from a web image search on
 * "<name> <MPN>". A result is only accepted when its title or source page
 * names the product's MPN (or, without an MPN, every model token plus brand
 * and colour). The accepted image is downloaded, normalised to a white-
 * background JPEG and served from public/products/<sku>.jpg, so we never
 * depend on a third-party shop's hotlinking.
 *
 * Run:  npx tsx scripts/search-missing-images.ts           # search + download
 *       npx tsx scripts/search-missing-images.ts --apply   # also point ProductImage at the files
 */

const APPLY = process.argv.includes("--apply");
const SOURCE_CACHE = "data/real-images.json";
const RESULT_FILE = "data/searched-images.json";
// Images rejected during manual review (watermarks, wrong product, spec overlays…), keyed by SKU.
const REJECTED_FILE = "data/rejected-images.json";
const OUT_DIR = "public/products";
const CONCURRENCY = 2;
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? Infinity);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL not set");

interface Product { id: string; sku: string; name: string; brand: string | null }
interface Hit { t?: string; purl?: string; murl?: string }
interface Result {
  match: "mpn" | "model" | "none";
  query: string;
  title?: string;
  page?: string;
  image?: string;
  file?: string;
}

const COLORS = [
  "black", "white", "silver", "grey", "gray", "gold", "blue", "red", "green", "purple", "pink",
  "orange", "yellow", "navy", "graphite", "titanium", "midnight", "starlight", "lavender", "mint",
  "cream", "beige", "brown", "violet", "coral", "teal", "obsidian", "porcelain", "hazel", "snow",
];
const STORE_DOMAINS_TO_SKIP = /(aliexpress|alicdn|shopee|susercontent|slatic|lazada|temu|ebayimg|ebay\.|pinterest|pinimg|youtube|ytimg|facebook|fbcdn|instagram|tiktok|olx\.|picclick|manuals\.plus|device\.report|notebookspec|tme\.eu)/i;
// Shops whose product photos carry their own watermark or promo overlays (found in manual review).
const WATERMARKED_DOMAINS = /(portativ\.ua|smartonly\.eu|mobileplanet\.ua|thrive\.co\.id|zonet\.by|amd\.by|evelatus\.lv|techzone\.com\.ua|lensviewpro\.com)/i;
const rejected: Record<string, string[]> = fs.existsSync(REJECTED_FILE) ? JSON.parse(fs.readFileSync(REJECTED_FILE, "utf8")) : {};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Strong identifiers: manufacturer part numbers, which pin colour/variant too. */
function strongIds(name: string, brand: string | null): string[] {
  const ids = new Set<string>();
  const pipes = name.split("|").map((s) => s.trim()).filter(Boolean);
  const tokens = name.split(/[\s|/]+/).map((t) => t.replace(/[(),]/g, ""));
  if (pipes.length > 2) tokens.push(pipes[pipes.length - 1]);
  for (const t of tokens) {
    if (!/\d/.test(t) || !/[a-z]/i.test(t) || t.toUpperCase() === brand?.toUpperCase()) continue;
    if (/^\d+(GB|TB|MHZ|GHZ|HZ|W|MM|MP|MAH|G)$/i.test(t) || /^\d+\/\d+/.test(t)) continue;
    const apple = t.match(/^([MN][A-Z0-9]{4})(?:[A-Z]{1,2})?$/);
    if (brand === "APPLE" && apple) ids.add(apple[1]);
    else if (t.length >= 7 || (t.length >= 6 && /[-.]/.test(t))) ids.add(t);
  }
  return [...ids].map(norm).filter((id) => id.length >= 5);
}

/** Weak identifiers: model tokens like "BV5200", used only together with brand + colour. */
function modelTokens(name: string): string[] {
  return name
    .split(/[\s|/,()]+/)
    .filter((t) => /\d/.test(t) && /[a-z]/i.test(t))
    .filter((t) => !/^\d+(GB|TB|MHZ|GHZ|HZ|W|MM|MP|MAH|G|")$/i.test(t) && !/^\d+\/\d+/.test(t))
    .map(norm)
    .filter((t) => t.length >= 3);
}

function buildQuery(p: Product): string {
  const pieces = p.name.includes("|")
    ? p.name.split("|").slice(1, 4).concat(p.name.split("|").slice(-1))
    : [p.name.replace(/^(MOBILE PHONE|HEADSET|MOUSE|KEYBOARD|TABLET|DRONE|CPU|PRINTER\/COP\/SCAN( A4)?)\s+/i, "")];
  const q = pieces.join(" ").replace(/\s+/g, " ").trim();
  return p.brand && !q.toUpperCase().includes(p.brand) ? `${p.brand} ${q}` : q;
}

async function bingImages(query: string): Promise<Hit[]> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(
      `https://www.bing.com/images/async?q=${encodeURIComponent(query)}&first=0&count=35&mmasync=1`,
      { headers: { "User-Agent": UA, "Accept-Language": "en-GB,en;q=0.9" } },
    );
    if (res.status === 429 || res.status >= 500) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    const html = await res.text();
    return [...html.matchAll(/ m="([^"]+)"/g)]
      .map((m) => {
        try {
          return JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")) as Hit;
        } catch {
          return null;
        }
      })
      .filter((h): h is Hit => !!h?.murl);
  }
  throw new Error("Bing kept throttling");
}

function classify(p: Product, hit: Hit): "mpn" | "model" | null {
  const hay = norm(`${hit.t ?? ""} ${decodeURIComponent(hit.purl ?? "")}`);
  if (strongIds(p.name, p.brand).some((id) => hay.includes(id))) return "mpn";
  const models = modelTokens(p.name);
  if (models.length === 0 || !models.every((m) => hay.includes(m))) return null;
  if (p.brand && !hay.includes(norm(p.brand))) return null;
  const nameLower = p.name.toLowerCase();
  const color = COLORS.find((c) => new RegExp(`\\b${c}\\b`).test(nameLower));
  if (color && !hay.includes(color)) return null;
  return "model";
}

async function download(url: string, file: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
    if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("image/")) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 8000) return false;
    const img = sharp(buf);
    const { width = 0, height = 0 } = await img.metadata();
    if (Math.min(width, height) < 300 || width / height > 2 || height / width > 2) return false;
    await img
      .flatten({ background: "#ffffff" })
      .resize(700, 700, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(file);
    return true;
  } catch {
    return false;
  }
}

async function findImage(p: Product): Promise<Result> {
  const query = buildQuery(p);
  const hits = (await bingImages(query)).filter(
    (h) =>
      !STORE_DOMAINS_TO_SKIP.test(`${h.purl} ${h.murl}`) &&
      !WATERMARKED_DOMAINS.test(`${h.purl} ${h.murl}`) &&
      !rejected[p.sku]?.includes(h.murl!),
  );
  const ranked = hits
    .map((h) => ({ h, match: classify(p, h) }))
    .filter((x): x is { h: Hit; match: "mpn" | "model" } => !!x.match)
    .sort((a, b) => Number(b.match === "mpn") - Number(a.match === "mpn"));
  const file = `${OUT_DIR}/${p.sku}.jpg`;
  for (const { h, match } of ranked.slice(0, 6)) {
    if (await download(h.murl!, file)) {
      return { match, query, title: h.t, page: h.purl, image: h.murl, file: `/products/${p.sku}.jpg` };
    }
  }
  return { match: "none", query };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const sourceCache: Record<string, { images: string[] }> = JSON.parse(fs.readFileSync(SOURCE_CACHE, "utf8"));
  const results: Record<string, Result> = fs.existsSync(RESULT_FILE) ? JSON.parse(fs.readFileSync(RESULT_FILE, "utf8")) : {};
  const save = () => fs.writeFileSync(RESULT_FILE, JSON.stringify(results, null, 1));

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const products: Product[] = (await client.query(`SELECT id, sku, name, brand FROM "Product" ORDER BY name`)).rows;
  const missing = products.filter((p) => !sourceCache[p.sku]?.images?.length);
  const todo = missing.filter((p) => !results[p.sku]).sort(() => Math.random() - 0.5).slice(0, LIMIT);
  console.log(`${missing.length} products without a supplier photo, ${todo.length} still to search`);

  let done = 0;
  let emptyStreak = 0;
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let p = queue.shift(); p; p = queue.shift()) {
        try {
          results[p.sku] = await findImage(p);
          emptyStreak = results[p.sku].match === "none" ? emptyStreak + 1 : 0;
          if (emptyStreak >= 25) throw new Error("25 misses in a row — search is probably blocked, stopping");
        } catch (err) {
          queue.length = 0;
          console.error(`\n${p.sku}: ${err instanceof Error ? err.message : err}`);
        }
        if (++done % 25 === 0) {
          process.stdout.write(`\r  ${done}/${todo.length}`);
          save();
        }
        await sleep(800);
      }
    }),
  );
  save();

  const counts: Record<string, number> = {};
  for (const p of missing) {
    const m = results[p.sku]?.match ?? "unsearched";
    counts[m] = (counts[m] ?? 0) + 1;
  }
  console.log("\nResults:", counts);

  if (APPLY) {
    const found = missing.filter((p) => results[p.sku]?.file && fs.existsSync(`public${results[p.sku].file}`));
    console.log(`Pointing ${found.length} products at their downloaded photo…`);
    await client.query("BEGIN");
    await client.query(`DELETE FROM "ProductImage" WHERE "productId" = ANY($1)`, [found.map((p) => p.id)]);
    for (let i = 0; i < found.length; i += 500) {
      const chunk = found.slice(i, i + 500);
      const values: unknown[] = [];
      const rows = chunk.map((p, j) => {
        values.push(`${p.id}-img0`, results[p.sku].file, p.name, 0, p.id);
        return `($${j * 5 + 1}, $${j * 5 + 2}, $${j * 5 + 3}, $${j * 5 + 4}, $${j * 5 + 5})`;
      });
      await client.query(`INSERT INTO "ProductImage" (id, url, alt, "sortOrder", "productId") VALUES ${rows.join(",")}`, values);
    }
    await client.query("COMMIT");
    console.log("  done");
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
