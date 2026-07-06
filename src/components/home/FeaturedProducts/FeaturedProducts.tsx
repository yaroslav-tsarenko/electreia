"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { AnimatedSection } from "@/components/shared/AnimatedSection/AnimatedSection";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  quantity: number;
  images: { url: string; alt?: string | null }[];
  categories?: { category: { name: string } }[];
}

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const t = useTranslations("home");
  const common = useTranslations("common");

  if (products.length === 0) return null;

  return (
    <AnimatedSection>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--color-line)] pb-6">
            <div className="flex flex-col gap-1">
              <span className="eyebrow">Editor&apos;s picks</span>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
                {t("featured")}
              </h2>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Handpicked products just for you
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-primary-hover)]"
            >
              {common("viewAll")} <ArrowRight size={16} />
            </Link>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
    </AnimatedSection>
  );
}
