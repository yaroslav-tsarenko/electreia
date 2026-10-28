import "dotenv/config";
import { config } from "dotenv";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import pg from "pg";

config({ path: ".env.local", quiet: true });

/**
 * Self-contained catalog backup in backup-<timestamp>/ at the project root:
 *   db.dump        pg_dump -Fc of the whole database (restore with pg_restore)
 *   images/<sku>/  every ProductImage file, downloaded from wherever it lives
 *   manifest.json  ProductImage id -> original url + local file
 *
 * Run:  npx tsx scripts/backup-catalog.ts
 */

const PG_DUMP = process.env.PG_DUMP ?? "/opt/homebrew/opt/postgresql@18/bin/pg_dump";
const CONCURRENCY = 8;
const raw = process.env.DIRECT_URL;
if (!raw) throw new Error("DIRECT_URL not set");

// pg_dump wants the direct (non-pooler) host and rejects Neon's libpq-compat flag.
const dumpUrl = new URL(raw);
dumpUrl.hostname = dumpUrl.hostname.replace("-pooler.", ".");
dumpUrl.searchParams.delete("uselibpqcompat");
if (!dumpUrl.searchParams.has("sslmode")) dumpUrl.searchParams.set("sslmode", "require");

const stamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
const dir = `backup-${stamp}`;

async function main() {
  fs.mkdirSync(`${dir}/images`, { recursive: true });

  console.log(`Dumping ${dumpUrl.hostname}…`);
  execFileSync(PG_DUMP, [dumpUrl.toString(), "-Fc", "--no-owner", "--no-privileges", "-f", `${dir}/db.dump`], { stdio: "inherit" });

  const client = new pg.Client({ connectionString: raw, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const rows: { id: string; url: string; sortOrder: number; sku: string }[] = (
    await client.query(`SELECT i.id, i.url, i."sortOrder", p.sku FROM "ProductImage" i JOIN "Product" p ON p.id = i."productId"`)
  ).rows;
  await client.end();
  console.log(`Downloading ${rows.length} images…`);

  const manifest: Record<string, { sku: string; url: string; file: string | null }> = {};
  const queue = [...rows];
  let done = 0;
  let failed = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let r = queue.shift(); r; r = queue.shift()) {
        const ext = path.extname(new URL(r.url, "https://x").pathname).toLowerCase() || ".jpg";
        const file = `images/${r.sku}/${r.sortOrder}${ext}`;
        fs.mkdirSync(`${dir}/images/${r.sku}`, { recursive: true });
        let ok = false;
        try {
          if (r.url.startsWith("/")) {
            fs.copyFileSync(`public${r.url}`, `${dir}/${file}`);
            ok = true;
          } else {
            const res = await fetch(r.url, { signal: AbortSignal.timeout(20000) });
            if (res.ok) {
              fs.writeFileSync(`${dir}/${file}`, Buffer.from(await res.arrayBuffer()));
              ok = true;
            }
          }
        } catch {
          // recorded as failed below
        }
        if (!ok) failed++;
        manifest[r.id] = { sku: r.sku, url: r.url, file: ok ? file : null };
        if (++done % 250 === 0) process.stdout.write(`\r  ${done}/${rows.length}`);
      }
    }),
  );
  fs.writeFileSync(`${dir}/manifest.json`, JSON.stringify(manifest, null, 1));
  console.log(`\nBackup in ${dir}: ${rows.length - failed} images saved, ${failed} unavailable (dead URLs).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
