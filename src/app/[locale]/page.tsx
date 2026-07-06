import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/shared/SEO/JsonLd";
import { MarketplaceHome } from "@/components/home/MarketplaceHome/MarketplaceHome";
import {
  getBrandSections,
  TOP_BRANDS,
  type CategorySection,
  type HomepageCategory,
  type HomepageProduct,
} from "@/lib/homepage-products";

export const revalidate = 60;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: { canonical: `/${locale}` },
    openGraph: { url: `/${locale}` },
  };
}

// Minimal product columns for card rendering — keeps payload small.
const cardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  comparePrice: true,
  quantity: true,
  status: true,
  isFeatured: true,
  brand: true,
  createdAt: true,
  images: {
    select: { url: true, alt: true },
    orderBy: { sortOrder: "asc" as const },
    take: 1,
  },
  categories: {
    select: { category: { select: { name: true, slug: true } } },
    take: 3,
  },
} as const;

type CategoryFlat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
};

type CategoryNode = CategoryFlat & {
  children: CategoryNode[];
  productCount: number;
  descendantProductCount: number;
};

function serializeProducts<T>(items: T[]): HomepageProduct[] {
  return JSON.parse(JSON.stringify(items)) as HomepageProduct[];
}

function buildCategoryTree(
  categories: CategoryFlat[],
  countsById: Map<string, number>,
): CategoryNode[] {
  const nodeMap = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const category of categories) {
    nodeMap.set(category.id, {
      ...category,
      children: [],
      productCount: countsById.get(category.id) || 0,
      descendantProductCount: 0,
    });
  }

  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const fillDescendantCount = (node: CategoryNode): number => {
    let total = node.productCount;
    for (const child of node.children) total += fillDescendantCount(child);
    node.descendantProductCount = total;
    return total;
  };
  for (const root of roots) fillDescendantCount(root);

  return roots;
}

function collectDescendantIds(node: CategoryNode): string[] {
  const out: string[] = [node.id];
  for (const child of node.children) out.push(...collectDescendantIds(child));
  return out;
}

function collectDescendantSlugs(node: CategoryNode): string[] {
  const out: string[] = [node.slug];
  for (const child of node.children) out.push(...collectDescendantSlugs(child));
  return out;
}

function toHomepageCategory(node: CategoryNode): HomepageCategory {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    description: node.description,
    imageUrl: node.imageUrl,
    _count: { products: node.productCount },
    children: node.children.map(toHomepageCategory),
  };
}

const getActiveCategoriesFlat = unstable_cache(
  async (): Promise<CategoryFlat[]> => {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
      },
    });
  },
  ["home-active-categories-v1"],
  { revalidate: 300, tags: ["categories"] },
);

const getCategoryProductCounts = unstable_cache(
  async (): Promise<Array<[string, number]>> => {
    const grouped = await prisma.productCategory.groupBy({
      by: ["categoryId"],
      where: { product: { status: "ACTIVE", images: { some: {} } } },
      _count: { productId: true },
    });
    return grouped.map((row) => [row.categoryId, row._count.productId] as [string, number]);
  },
  ["home-category-product-counts-v2"],
  { revalidate: 60, tags: ["products", "categories"] },
);

async function fetchProducts(args: {
  where: import("@prisma/client").Prisma.ProductWhereInput;
  orderBy: import("@prisma/client").Prisma.ProductOrderByWithRelationInput;
  take: number;
}) {
  return prisma.product.findMany({
    where: args.where,
    orderBy: args.orderBy,
    take: args.take,
    select: cardSelect,
  });
}

async function getHomeData() {
  try {
    const [
      heroSlides,
      dealCards,
      promoSmall,
      promoWide,
      brands,
      sections,
      tabs,
      utilityLinks,
      promoStripItems,
      categoriesFlat,
      countsMap,
      featuredRows,
      saleRows,
      newRows,
      popularRows,
      brandRows,
    ] = await Promise.all([
      prisma.banner.findMany({ where: { isActive: true, type: "HERO" }, orderBy: { sortOrder: "asc" } }),
      prisma.banner.findMany({ where: { isActive: true, type: "DEAL_CARD" }, orderBy: { sortOrder: "asc" } }),
      prisma.banner.findMany({ where: { isActive: true, type: "PROMO_SMALL" }, orderBy: { sortOrder: "asc" } }),
      prisma.banner.findMany({ where: { isActive: true, type: "PROMO_WIDE" }, orderBy: { sortOrder: "asc" } }),
      prisma.brand.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.homepageSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.homepageTab.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.utilityLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.promoStripItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      getActiveCategoriesFlat(),
      getCategoryProductCounts().then((entries) => new Map(entries)),
      fetchProducts({
        where: { status: "ACTIVE", isFeatured: true, images: { some: {} } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      fetchProducts({
        where: { status: "ACTIVE", comparePrice: { not: null }, images: { some: {} } },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      fetchProducts({
        where: { status: "ACTIVE", images: { some: {} } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      fetchProducts({
        where: { status: "ACTIVE", images: { some: {} } },
        orderBy: { quantity: "desc" },
        take: 10,
      }),
      fetchProducts({
        where: { status: "ACTIVE", brand: { in: TOP_BRANDS }, images: { some: {} } },
        orderBy: { createdAt: "desc" },
        take: 120,
      }),
    ]);

    const categoryTree = buildCategoryTree(categoriesFlat, countsMap);
    const homepageCategories = categoryTree.map(toHomepageCategory);

    // Build category sections: pick top categories by descendant product count, then fetch products per section.
    const candidateNodes = [
      ...categoryTree,
      ...categoryTree.flatMap((root) => root.children),
    ]
      .filter((node) => node.descendantProductCount > 0)
      .sort((a, b) => b.descendantProductCount - a.descendantProductCount)
      .slice(0, 6);

    const sectionResults = await Promise.all(
      candidateNodes.map(async (node) => {
        const ids = collectDescendantIds(node);
        const items = await fetchProducts({
          where: {
            status: "ACTIVE",
            images: { some: {} },
            categories: { some: { categoryId: { in: ids } } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        return { node, items };
      }),
    );

    const categorySections: CategorySection[] = sectionResults.map(({ node, items }) => {
      const tabChildren = node.children.filter((c) => c.descendantProductCount > 0);
      return {
        category: toHomepageCategory(node),
        products: serializeProducts(items),
        tabs:
          tabChildren.length > 0
            ? [
                { label: "All", slugs: collectDescendantSlugs(node) },
                ...tabChildren.map((c) => ({ label: c.name, slugs: collectDescendantSlugs(c) })),
              ]
            : [],
        totalCount: node.descendantProductCount,
      };
    });

    // Admin-configured sections — use the targeted lists we already fetched.
    const featuredProducts = serializeProducts(featuredRows);
    const saleProducts = serializeProducts(saleRows);
    const newProducts = serializeProducts(newRows);
    const popularProducts = serializeProducts(popularRows);
    const brandProducts = serializeProducts(brandRows);

    const sectionProducts: Record<string, HomepageProduct[]> = {};
    for (const section of sections) {
      let pool: HomepageProduct[] = [];
      switch (section.filterType) {
        case "featured":
          pool = featuredProducts;
          break;
        case "onSale":
          pool = saleProducts;
          break;
        case "popular":
          pool = popularProducts;
          break;
        case "category":
          if (section.categorySlug) {
            const node = findNodeBySlug(categoryTree, section.categorySlug);
            if (node) {
              const ids = collectDescendantIds(node);
              const items = await fetchProducts({
                where: {
                  status: "ACTIVE",
                  images: { some: {} },
                  categories: { some: { categoryId: { in: ids } } },
                },
                orderBy: { createdAt: "desc" },
                take: section.maxProducts,
              });
              pool = serializeProducts(items);
            }
          }
          break;
        case "newest":
        case "all":
        default:
          pool = newProducts;
          break;
      }
      sectionProducts[section.slug] = pool.slice(0, section.maxProducts);
    }

    const brandSections = getBrandSections(brandProducts, TOP_BRANDS, 8);

    const categoryShowcase = categoryTree
      .map((node) => ({
        id: node.id,
        name: node.name,
        slug: node.slug,
        imageUrl: node.imageUrl,
        productCount: node.descendantProductCount,
      }))
      .filter((c) => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 8);

    return {
      heroSlides,
      dealCards,
      promoSmall,
      promoWide,
      brands,
      sections,
      tabs,
      utilityLinks,
      promoStripItems,
      sectionProducts,
      categories: homepageCategories,
      featuredProducts,
      saleProducts,
      newProducts,
      popularProducts,
      categorySections,
      brandSections,
      categoryShowcase,
    };
  } catch (e) {
    console.error("Homepage data fetch error:", e);
    return {
      heroSlides: [], dealCards: [], promoSmall: [], promoWide: [],
      brands: [], sections: [], tabs: [], utilityLinks: [],
      promoStripItems: [], sectionProducts: {}, categories: [],
      featuredProducts: [], saleProducts: [], newProducts: [],
      popularProducts: [], categorySections: [], brandSections: [],
      categoryShowcase: [],
    };
  }
}

function findNodeBySlug(roots: CategoryNode[], slug: string): CategoryNode | null {
  for (const root of roots) {
    if (root.slug === slug) return root;
    const found = findNodeBySlug(root.children, slug);
    if (found) return found;
  }
  return null;
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Electreia",
          legalName: "LORDCARE LIMITED",
          alternateName: ["electreia.co.uk"],
          url: "https://electreia.co.uk",
          sameAs: ["https://electreia.co.uk"],
          description:
            "Electreia — precision-engineered electronics from LORDCARE LIMITED. Premium audio, laptops, smart devices and accessories. Shipped from the United Kingdom.",
        }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <MarketplaceHome data={data as any} />
    </>
  );
}
