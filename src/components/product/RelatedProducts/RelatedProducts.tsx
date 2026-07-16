import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard/ProductCard";

interface RelatedProductsProps {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    comparePrice: number | null;
    quantity: number;
    images: { url: string; alt: string | null }[];
    categories?: { category: { name: string } }[];
  }>;
  categorySlug?: string;
  categoryName?: string;
}

/**
 * Bottom-of-PDP module — same visual language as the homepage sections so
 * the whole storefront feels stitched together. Only renders when we have
 * at least one candidate.
 */
export function RelatedProducts({ products, categorySlug, categoryName }: RelatedProductsProps) {
  if (!products.length) return null;

  const viewAllHref = categorySlug ? `/catalog/${categorySlug}` : "/catalog";

  return (
    <section className="mt-16 sm:mt-20" aria-labelledby="related-heading">
      <header className="mb-6 flex items-end justify-between gap-4 border-b border-[color:var(--color-line)] pb-4">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)]">
            You might also like
          </span>
          <h2
            id="related-heading"
            className="font-display text-2xl font-semibold tracking-tight text-[color:var(--color-text)] sm:text-[28px]"
          >
            {categoryName ? `More from ${categoryName}` : "Related products"}
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[color:var(--color-line)] px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
        >
          Browse all <ArrowRight size={12} />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            slug={p.slug}
            sku={p.sku}
            price={p.price}
            comparePrice={p.comparePrice}
            quantity={p.quantity}
            imageUrl={p.images[0]?.url}
            category={p.categories?.[0]?.category?.name}
          />
        ))}
      </div>
    </section>
  );
}
