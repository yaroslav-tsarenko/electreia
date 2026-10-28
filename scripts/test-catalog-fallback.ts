import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

/**
 * Runs the storefront's query shapes against the live database and against the
 * catalog snapshot (src/lib/catalog-db.ts) and reports any difference, so the
 * DB-down fallback is known to render the same catalog.
 *
 * Run right after scripts/export-catalog-snapshot.ts:
 *   npx tsx scripts/test-catalog-fallback.ts
 */

const card = {
  id: true, name: true, slug: true, sku: true, price: true, comparePrice: true, quantity: true, status: true,
  images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" }, take: 1 },
  categories: { select: { category: { select: { name: true, slug: true } } }, take: 3 },
};
const listed = { status: "ACTIVE", images: { some: {} } };

const CASES: [string, string, string, Record<string, unknown>][] = [
  ["home featured", "product", "findMany", { where: { ...listed, isFeatured: true }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 10, select: card }],
  ["home sale", "product", "findMany", { where: { ...listed, comparePrice: { not: null } }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 15, select: card }],
  ["home popular", "product", "findMany", { where: listed, orderBy: [{ quantity: "desc" }, { id: "asc" }], take: 10, select: card }],
  ["home brands", "product", "findMany", { where: { ...listed, brand: { in: ["APPLE", "DELL", "LOGITECH"] } }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 120, select: card }],
  ["category counts", "productCategory", "groupBy", { by: ["categoryId"], where: { product: listed }, _count: { productId: true } }],
  ["categories + _count", "category", "findMany", { orderBy: { name: "asc" }, include: { _count: { select: { products: { where: { product: listed } } } } } }],
  ["banners", "banner", "findMany", { where: { isActive: true, type: "HERO" }, orderBy: { sortOrder: "asc" } }],
  ["homepage sections", "homepageSection", "findMany", { where: { isActive: true }, orderBy: { sortOrder: "asc" } }],
  ["category page", "product", "findMany", { where: { ...listed, categories: { some: { category: { slug: "smartphones" } } } }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], skip: 60, take: 60, select: card }],
  ["category count", "product", "count", { where: { ...listed, categories: { some: { category: { slug: "smartphones" } } } } }],
  ["search", "product", "findMany", {
    where: { ...listed, OR: [{ name: { contains: "iphone 16", mode: "insensitive" } }, { sku: { contains: "iphone 16", mode: "insensitive" } }, { brand: { contains: "iphone 16", mode: "insensitive" } }] },
    orderBy: [{ name: "asc" }, { id: "asc" }], take: 20, select: card,
  }],
  ["filters", "product", "findMany", {
    where: { ...listed, price: { gte: 100, lte: 900 }, brand: { equals: "logitech", mode: "insensitive" }, AND: [{ OR: [{ trackInventory: false }, { quantity: { gt: 0 } }] }, { comparePrice: { gt: 0 } }] },
    orderBy: [{ price: "asc" }, { id: "asc" }], take: 24, select: card,
  }],
  ["popular sort", "product", "findMany", { where: listed, orderBy: [{ orderItems: { _count: "desc" } }, { isFeatured: "desc" }, { quantity: "desc" }, { createdAt: "desc" }, { id: "asc" }], take: 12, select: { id: true } }],
  ["brands distinct", "product", "findMany", { where: { ...listed, brand: { not: null } }, select: { brand: true }, distinct: ["brand"], orderBy: { brand: "asc" } }],
  ["product page", "product", "findUnique", {
    where: { slug: "headset-hyperx-cloud-alpha-s-hx-hscas-bl-ww-hyperx" },
    select: {
      id: true, name: true, description: true, price: true, characteristics: true, createdAt: true,
      images: { select: { id: true, url: true, alt: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
      categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
      variants: true,
      reviews: { where: { isApproved: true }, select: { id: true, rating: true, user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 },
    },
  }],
  ["sitemap", "product", "findMany", { where: listed, select: { slug: true, updatedAt: true }, orderBy: { slug: "asc" } }],
];

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { snapshotQuery } = await import("../src/lib/catalog-db");
  // Decimals as numbers, object keys sorted (Prisma's key order is not part of the contract).
  const normalise = (v: unknown) =>
    JSON.stringify(v, (_k, x) => {
      if (x && typeof x === "object" && !Array.isArray(x)) {
        if ("toFixed" in x) return Number(x);
        return Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b)));
      }
      return x;
    });
  const sortGroups = (v: unknown) => (Array.isArray(v) ? [...v].sort((a, b) => normalise(a).localeCompare(normalise(b))) : v);

  let failed = 0;
  for (const [label, delegate, method, args] of CASES) {
    const model = delegate.charAt(0).toUpperCase() + delegate.slice(1);
    const client = prisma as unknown as Record<string, Record<string, (a: unknown) => Promise<unknown>>>;
    let live = await client[delegate][method](args);
    let snap = snapshotQuery(model, method, args);
    if (method === "groupBy") [live, snap] = [sortGroups(live), sortGroups(snap)];
    const ok = normalise(live) === normalise(snap);
    if (!ok) failed++;
    const size = Array.isArray(live) ? `${live.length} rows` : typeof live === "number" ? `= ${live}` : live ? "1 row" : "null";
    console.log(`${ok ? "✓" : "✗"} ${label.padEnd(22)} ${size}`);
    if (!ok && Array.isArray(live) && Array.isArray(snap)) {
      const i = live.findIndex((row, n) => normalise(row) !== normalise(snap[n]));
      console.log(`   first difference at row ${i}:`);
      console.log("   live:", normalise(live[i]).slice(0, 300));
      console.log("   snap:", normalise(snap[i]).slice(0, 300));
    } else if (!ok) {
      console.log("   live:", normalise(live).slice(0, 300));
      console.log("   snap:", normalise(snap).slice(0, 300));
    }
  }
  await prisma.$disconnect();
  if (failed) {
    console.error(`${failed} case(s) differ`);
    process.exit(1);
  }
}

main();
