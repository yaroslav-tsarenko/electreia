import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { getDescendantCategoryIds } from "@/lib/category-tree";

export const revalidate = 60;

const PAGE_SIZE = 60;

interface CategoryPageProps {
  params: Promise<{ category: string; locale: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug, locale } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true, slug: true },
  });

  if (!category) return {};

  return {
    title: category.name,
    description:
      category.description ||
      `Shop ${category.name} products at Electreia. Browse electronics, accessories, electrical materials and installation supplies.`,
    alternates: { canonical: `/${locale}/catalog/${category.slug}` },
    openGraph: {
      title: `${category.name} | Electreia`,
      description:
        category.description ||
        `Shop ${category.name} products at Electreia.`,
      url: `/${locale}/catalog/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug, locale } = await params;
  const sp = (await searchParams) || {};
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, description: true, slug: true },
  });

  if (!category) notFound();

  const categoryIds = await getDescendantCategoryIds(category.id);

  const where = {
    status: "ACTIVE" as const,
    images: { some: {} },
    categories: { some: { categoryId: { in: categoryIds } } },
  };

  const [productsRaw, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        comparePrice: true,
        quantity: true,
        images: {
          select: { url: true, alt: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        categories: {
          select: { category: { select: { name: true } } },
          take: 1,
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const products = productsRaw.map((p) => ({
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const basePath = `/${locale}/catalog/${category.slug}`;

  return (
    <div className="mx-auto w-full max-w-[var(--max-width)] px-4 pb-12 [overflow-wrap:anywhere]">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Catalog", href: "/catalog" },
          { label: category.name },
        ]}
      />

      <span className="eyebrow">Category</span>
      <h1 className="mb-3 mt-2 break-words font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
        {category.name}
      </h1>

      {category.description && (
        <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-[color:var(--color-text-secondary)]">
          {category.description}
        </p>
      )}

      <p className="mb-6 text-[13px] text-[color:var(--color-text-tertiary)]">
        {total.toLocaleString()} product{total === 1 ? "" : "s"}
      </p>

      <ProductGrid products={products} />

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {page > 1 && (
            <Link
              href={`${basePath}?page=${page - 1}`}
              className="rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3.5 py-2 text-sm font-semibold text-[color:var(--color-text)] hover:border-[color:var(--color-line-strong)]"
            >
              Previous
            </Link>
          )}
          <span className="px-3.5 py-2 text-sm text-[color:var(--color-text-secondary)]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`${basePath}?page=${page + 1}`}
              className="rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3.5 py-2 text-sm font-semibold text-[color:var(--color-text)] hover:border-[color:var(--color-line-strong)]"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
