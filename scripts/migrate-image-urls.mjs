import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
config();

/**
 * Rewrite every product/category image URL onto the images.electreia.co.uk
 * CDN. Uses a single UPDATE per legacy host so we never bump into interactive
 * transaction timeouts on 3k+ rows.
 */

const NEW_HOST = "https://images.electreia.co.uk";
const LEGACY_HOSTS = [
  "https://electreia.co.uk",
  "https://www.electreia.co.uk",
  "https://ravora.co.uk",
  "https://www.ravora.co.uk",
  "http://electreia.co.uk",
  "http://www.electreia.co.uk",
  "http://ravora.co.uk",
  "http://www.ravora.co.uk",
];

const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
  console.error("DIRECT_URL is not set. Aborting.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function rewrite(table, column) {
  let totalRewrites = 0;
  for (const host of LEGACY_HOSTS) {
    // regexp anchored at the start so we only rewrite the origin, not the path
    const pattern = `^${host.replace(/\./g, "\\.")}`;
    const rows = await prisma.$executeRawUnsafe(
      `UPDATE "${table}"
         SET "${column}" = regexp_replace("${column}", $1, $2)
       WHERE "${column}" ~ $1`,
      pattern,
      NEW_HOST,
    );
    if (rows > 0) {
      console.log(`  ${table}.${column}: ${rows} rows rewrote from ${host}`);
      totalRewrites += rows;
    }
  }
  return totalRewrites;
}

console.log("Rewriting ProductImage.url…");
const productImages = await rewrite("ProductImage", "url");

console.log("\nRewriting Category.imageUrl…");
const categories = await rewrite("Category", "imageUrl");

console.log(`\nDone.`);
console.log(`  product images rewritten: ${productImages}`);
console.log(`  category images rewritten: ${categories}`);

const sample = await prisma.productImage.findMany({
  take: 5,
  select: { url: true },
});
console.log(`\nSample URLs after migration:`);
sample.forEach((row) => console.log(`  ${row.url}`));

await prisma.$disconnect();
