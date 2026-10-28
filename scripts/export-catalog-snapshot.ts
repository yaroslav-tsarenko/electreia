import "dotenv/config";
import { config } from "dotenv";
import fs from "fs";
import zlib from "zlib";
import pg from "pg";

config({ path: ".env.local", quiet: true });

/**
 * Write data/catalog-snapshot.json.gz — a read-only copy of every table the
 * storefront reads, so src/lib/catalog-db.ts can keep serving products when
 * the database is unreachable.
 *
 * Only storefront data goes in: no orders, no customer data (reviewers are
 * reduced to id + name) and no cost prices.
 *
 * Run:  npx tsx scripts/export-catalog-snapshot.ts
 *       npx tsx scripts/export-catalog-snapshot.ts --soft   # build step: keep the old file if the DB is down
 */

const SOFT = process.argv.includes("--soft");

// Prisma stores DateTime as UTC "timestamp without time zone"; pg would read it as local time.
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value) => new Date(`${value.replace(" ", "T")}Z`));
const OUT = "data/catalog-snapshot.json.gz";

// table -> SQL. Column names match the Prisma model fields.
const TABLES: Record<string, string> = {
  Product: `SELECT * FROM "Product" WHERE status <> 'ARCHIVED'`,
  ProductImage: `SELECT * FROM "ProductImage"`,
  ProductCategory: `SELECT * FROM "ProductCategory"`,
  ProductVariant: `SELECT * FROM "ProductVariant"`,
  Category: `SELECT * FROM "Category"`,
  Banner: `SELECT * FROM "Banner"`,
  Brand: `SELECT * FROM "Brand"`,
  HomepageSection: `SELECT * FROM "HomepageSection"`,
  HomepageTab: `SELECT * FROM "HomepageTab"`,
  UtilityLink: `SELECT * FROM "UtilityLink"`,
  PromoStripItem: `SELECT * FROM "PromoStripItem"`,
  Page: `SELECT * FROM "Page" WHERE "isActive" = true`,
  Review: `SELECT * FROM "Review" WHERE "isApproved" = true`,
  // Only what the "popular" sort needs (order-item count per product) — no order or customer data.
  OrderItem: `SELECT id, "productId" FROM "OrderItem" WHERE "productId" IS NOT NULL`,
  User: `SELECT u.id, u.name FROM "User" u WHERE u.id IN (SELECT "userId" FROM "Review" WHERE "isApproved" = true)`,
};
const DROP_COLUMNS: Record<string, string[]> = { Product: ["costPrice"] };

async function main() {
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) throw new Error("DIRECT_URL not set");
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  await client.connect();

  const tables: Record<string, Record<string, unknown>[]> = {};
  for (const [name, sql] of Object.entries(TABLES)) {
    const rows = (await client.query(sql)).rows;
    for (const col of DROP_COLUMNS[name] ?? []) for (const row of rows) delete row[col];
    tables[name] = rows;
  }
  await client.end();

  if ((tables.Product?.length ?? 0) === 0) throw new Error("Snapshot would contain no products — refusing to overwrite");

  const json = JSON.stringify({ generatedAt: new Date().toISOString(), tables });
  fs.writeFileSync(OUT, zlib.gzipSync(json, { level: 9 }));
  const counts = Object.entries(tables).map(([k, v]) => `${k}=${v.length}`).join(" ");
  console.log(`Catalog snapshot: ${(json.length / 1e6).toFixed(1)} MB raw → ${(fs.statSync(OUT).size / 1e6).toFixed(1)} MB gz (${counts})`);
}

main().catch((err) => {
  if (SOFT && fs.existsSync(OUT)) {
    console.warn(`Catalog snapshot not refreshed (${err instanceof Error ? err.message : err}); keeping the existing ${OUT}`);
    return;
  }
  console.error(err);
  process.exit(1);
});
