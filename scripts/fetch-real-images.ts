import "dotenv/config";
import { config } from "dotenv";
import fs from "fs";
import pg from "pg";

config({ path: ".env.local", quiet: true });

/**
 * Replace the dead images.electreia.co.uk product photos with real
 * manufacturer images. Every product SKU is its EAN-13, so we look each one up:
 *   1. BigBuy catalog by EAN (bulk endpoints, one request each)
 *   2. Open Icecat by GTIN
 *   3. Open Icecat by brand + MPN parsed from the product name
 *
 * Results are cached in data/real-images.json so re-runs only query misses.
 *
 * Run:  npx tsx scripts/fetch-real-images.ts           # collect + report
 *       npx tsx scripts/fetch-real-images.ts --apply   # also rewrite ProductImage rows
 */

const APPLY = process.argv.includes("--apply");
const CACHE_FILE = "data/real-images.json";
const MAX_IMAGES = 5;
const ICECAT_CONCURRENCY = 4;

const BIGBUY_KEY = process.env.BIGBUY_API_PRODUCTION;
const connectionString = process.env.DIRECT_URL;
if (!BIGBUY_KEY) throw new Error("BIGBUY_API_PRODUCTION not set in .env");
if (!connectionString) throw new Error("DIRECT_URL not set");

interface Found {
  source: "bigbuy" | "icecat-gtin" | "icecat-mpn" | "none";
  title?: string;
  images: string[];
}
type Cache = Record<string, Found>;

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function bigbuy<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.bigbuy.eu${path}`, {
    headers: { Authorization: `Bearer ${BIGBUY_KEY}` },
  });
  if (!res.ok) throw new Error(`BigBuy ${path} -> HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function fromBigBuy(eans: Set<string>): Promise<Map<string, string[]>> {
  console.log("BigBuy: downloading catalog…");
  const products = await bigbuy<{ id: number; ean13: string }[]>("/rest/catalog/products.json?isoCode=en");
  const idToEan = new Map<number, string>();
  for (const p of products) if (eans.has(p.ean13)) idToEan.set(p.id, p.ean13);
  console.log(`  ${idToEan.size} EAN matches in ${products.length} BigBuy products`);
  if (idToEan.size === 0) return new Map();

  console.log("BigBuy: downloading image index…");
  const images = await bigbuy<{ id: number; images: { url: string; isCover: boolean; position: number; logo: boolean }[] }[]>(
    "/rest/catalog/productsimages.json",
  );
  const out = new Map<string, string[]>();
  for (const row of images) {
    const ean = idToEan.get(row.id);
    if (!ean) continue;
    const urls = row.images
      .filter((im) => !im.logo)
      .sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.position - b.position)
      .map((im) => im.url)
      .slice(0, MAX_IMAGES);
    if (urls.length) out.set(ean, urls);
  }
  return out;
}

interface IcecatImage { Pic?: string; Pic500x500?: string; IsMain?: string; No?: string }

async function icecat(query: string): Promise<{ title: string; images: string[] } | null> {
  const url = `https://live.icecat.biz/api?UserName=openIcecat-live&Language=en&${query}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url);
    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    const json = (await res.json().catch(() => null)) as { data?: { GeneralInfo?: { Title?: string }; Image?: { Pic500x500?: string; HighPic?: string }; Gallery?: IcecatImage[] } } | null;
    const data = json?.data;
    if (!data) return null;
    const gallery = (data.Gallery ?? [])
      .slice()
      .sort((a, b) => Number(b.IsMain === "Y") - Number(a.IsMain === "Y") || Number(a.No) - Number(b.No))
      .map((g) => g.Pic500x500 || g.Pic)
      .filter((u): u is string => !!u);
    if (gallery.length === 0) {
      const main = data.Image?.Pic500x500 || data.Image?.HighPic;
      if (main) gallery.push(main);
    }
    if (gallery.length === 0) return null;
    return { title: data.GeneralInfo?.Title ?? "", images: [...new Set(gallery)].slice(0, MAX_IMAGES) };
  }
  return null;
}

/** Manufacturer part number candidates parsed from supplier-style names. */
function mpnCandidates(name: string, brand: string | null): string[] {
  const out: string[] = [];
  const pipes = name.split("|").map((s) => s.trim()).filter(Boolean);
  if (pipes.length > 2) out.push(pipes[pipes.length - 1]);
  const brandUpper = brand?.toUpperCase();
  for (const token of name.split(/[\s/|]+/)) {
    const t = token.replace(/[(),]/g, "");
    if (t.length < 5 || !/\d/.test(t) || !/^[A-Za-z0-9][A-Za-z0-9.\-]+$/.test(t)) continue;
    if (/^\d+(GB|TB|MHZ|HZ|W|MM)?$/i.test(t) || t.toUpperCase() === brandUpper) continue;
    out.push(t);
  }
  return [...new Set(out)].slice(0, 3);
}

async function lookupIcecat(p: Product): Promise<Found> {
  const byGtin = await icecat(`GTIN=${encodeURIComponent(p.sku)}`);
  if (byGtin) return { source: "icecat-gtin", ...byGtin };
  if (p.brand) {
    for (const mpn of mpnCandidates(p.name, p.brand)) {
      const byMpn = await icecat(`Brand=${encodeURIComponent(p.brand)}&ProductCode=${encodeURIComponent(mpn)}`);
      if (byMpn) return { source: "icecat-mpn", ...byMpn };
    }
  }
  return { source: "none", images: [] };
}

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const products: Product[] = (await client.query(`SELECT id, sku, name, brand FROM "Product" ORDER BY name`)).rows;
  console.log(`${products.length} products`);

  const cache: Cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) : {};
  const save = () => fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1));

  // 1. BigBuy — always refreshed, it is two bulk requests.
  const bb = await fromBigBuy(new Set(products.map((p) => p.sku)));
  for (const [ean, images] of bb) cache[ean] = { source: "bigbuy", images };
  save();

  // 2/3. Icecat for everything BigBuy did not cover and we have not tried yet.
  const todo = products.filter((p) => !cache[p.sku]);
  console.log(`Icecat: ${todo.length} products to look up`);
  let done = 0;
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: ICECAT_CONCURRENCY }, async () => {
      for (let p = queue.shift(); p; p = queue.shift()) {
        try {
          cache[p.sku] = await lookupIcecat(p);
        } catch (err) {
          console.error(`\n  ${p.sku}: ${err instanceof Error ? err.message : err}`);
        }
        if (++done % 50 === 0) {
          process.stdout.write(`\r  ${done}/${todo.length}`);
          save();
        }
      }
    }),
  );
  save();

  const bySource: Record<string, number> = {};
  for (const p of products) {
    const s = cache[p.sku]?.source ?? "none";
    bySource[s] = (bySource[s] ?? 0) + 1;
  }
  console.log("\nCoverage:", bySource);

  if (APPLY) {
    console.log("Rewriting ProductImage rows for matched products…");
    let updated = 0;
    for (const p of products) {
      const found = cache[p.sku];
      if (!found || found.images.length === 0) continue;
      await client.query("BEGIN");
      await client.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [p.id]);
      const values: unknown[] = [];
      const rows = found.images.map((url, i) => {
        values.push(`${p.id}-img${i}`, url, p.name, i, p.id);
        return `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`;
      });
      await client.query(
        `INSERT INTO "ProductImage" (id, url, alt, "sortOrder", "productId") VALUES ${rows.join(",")}`,
        values,
      );
      await client.query("COMMIT");
      updated++;
    }
    console.log(`  ${updated} products now use real images`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
