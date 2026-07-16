import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs/ProductTabs";
import { RelatedProducts } from "@/components/product/RelatedProducts/RelatedProducts";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { JsonLd } from "@/components/shared/SEO/JsonLd";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

type CategoryRow = { id: string; name: string; slug: string; parentId: string | null };

const getCategoryLookup = unstable_cache(
  async (): Promise<CategoryRow[]> => {
    return prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
    });
  },
  ["product-page-category-lookup-v2"],
  { revalidate: 300, tags: ["categories"] },
);

async function getCategoryChain(categoryId: string): Promise<{ name: string; slug: string }[]> {
  const rows = await getCategoryLookup();
  const map = new Map<string, CategoryRow>();
  for (const r of rows) map.set(r.id, r);

  const chain: { name: string; slug: string }[] = [];
  let currentId: string | null = categoryId;
  const guard = new Set<string>();

  while (currentId && !guard.has(currentId)) {
    guard.add(currentId);
    const cat = map.get(currentId);
    if (!cat) break;
    chain.unshift({ name: cat.name, slug: cat.slug });
    currentId = cat.parentId;
  }

  return chain;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, metaTitle: true, metaDescription: true, shortDescription: true },
  });

  if (!product) return {};

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || product.name,
    alternates: { canonical: `/${locale}/product/${slug}` },
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription || undefined,
      url: `/${locale}/product/${slug}`,
    },
  };
}

const cardSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  price: true,
  comparePrice: true,
  quantity: true,
  status: true,
  images: {
    select: { url: true, alt: true },
    orderBy: { sortOrder: "asc" as const },
    take: 1,
  },
  categories: {
    select: { category: { select: { name: true } } },
    take: 1,
  },
} as const;

async function getRelatedProducts(productId: string, categoryId: string | undefined) {
  if (!categoryId) return [];
  const rows = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: productId },
      images: { some: {} },
      categories: { some: { categoryId } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: cardSelect,
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: Number(p.price),
    comparePrice: p.comparePrice == null ? null : Number(p.comparePrice),
    quantity: p.quantity,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    categories: p.categories.map((pc) => ({ category: { name: pc.category.name } })),
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      shortDescription: true,
      price: true,
      comparePrice: true,
      quantity: true,
      lowStockAlert: true,
      status: true,
      brand: true,
      condition: true,
      ean: true,
      gtin: true,
      characteristics: true,
      images: { select: { id: true, url: true, alt: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
      categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
      variants: true,
      reviews: {
        where: { isApproved: true },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!product || product.status === "ARCHIVED") notFound();

  const primaryCategory = product.categories[0]?.category;
  const categoryChain = primaryCategory
    ? await getCategoryChain(primaryCategory.id)
    : [];

  const reviewCount = product.reviews.length;
  const avgRating = reviewCount > 0
    ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
    : 0;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://electreia.co.uk";

  const characteristics = product.characteristics as Record<string, Record<string, string>> | null;

  const relatedProducts = await getRelatedProducts(product.id, primaryCategory?.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortDescription || product.name,
    sku: product.sku,
    gtin13: product.ean || product.gtin || undefined,
    image: product.images[0]?.url,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "GBP",
      availability: product.quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/en/product/${product.slug}`,
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount,
      },
    }),
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/catalog" },
    ...categoryChain.map((cat) => ({
      label: cat.name,
      href: `/catalog/${cat.slug}`,
    })),
    { label: product.name },
  ];

  return (
    <div className="mx-auto w-full max-w-[var(--max-width)] px-4 pb-20">
      <JsonLd data={jsonLd} />

      <Breadcrumbs items={breadcrumbItems} />

      {/* 1 · Hero block — gallery + info side by side */}
      <section
        aria-label="Product overview"
        className="mt-2 grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-8 lg:gap-12"
      >
        <div className="md:sticky md:top-[calc(var(--header-height)+1rem)]">
          <ProductGallery images={product.images} productName={product.name} />
        </div>
        <ProductInfo
          id={product.id}
          name={product.name}
          slug={product.slug}
          sku={product.sku}
          price={Number(product.price)}
          comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
          quantity={product.quantity}
          shortDescription={product.shortDescription}
          description={product.description}
          brand={product.brand}
          condition={product.condition}
          lowStockAlert={product.lowStockAlert}
          imageUrl={product.images[0]?.url}
          ean={product.ean}
          reviewCount={reviewCount}
          avgRating={avgRating}
          categoryPath={categoryChain}
        />
      </section>

      {/* 2 · Detail block — description / specs / reviews as sequential tabs */}
      <ProductTabs
        description={product.description}
        characteristics={characteristics}
        reviews={product.reviews.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
      />

      {/* 3 · Related products — same-category recommendations */}
      <RelatedProducts
        products={relatedProducts}
        categorySlug={primaryCategory?.slug}
        categoryName={primaryCategory?.name}
      />
    </div>
  );
}
