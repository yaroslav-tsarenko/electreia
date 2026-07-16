"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  quantity: number;
  images: { url: string; alt?: string | null }[];
  categories?: { category: { name: string; slug: string } }[];
}

export default function SearchPage() {
  const t = useTranslations("common");
  const nav = useTranslations("nav");
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const url = new URL("/api/search", window.location.origin);
      url.searchParams.set("q", query);
      url.searchParams.set("limit", "40");
      if (category) url.searchParams.set("category", category);

      fetch(url.toString())
        .then((res) => res.json())
        .then((d) => setResults(Array.isArray(d) ? d : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, category]);

  const scopeLabel = useMemo(() => {
    if (!category) return null;
    // Prettify slug for badge display — "audio-headphones" → "Audio Headphones"
    return category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [category]);

  const clearCategory = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    router.replace(url.pathname + url.search);
  };

  return (
    <div className="mx-auto w-full max-w-[var(--max-width)] px-4 pb-16">
      <Breadcrumbs
        items={[{ label: nav("home"), href: "/" }, { label: t("search") }]}
      />

      <div className="mb-7 text-center">
        <span className="eyebrow">{t("search")}</span>
        <h1 className="mb-4 mt-2 font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
          Search
        </h1>
        <div className="relative mx-auto max-w-lg">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-tertiary)]">
            <Search size={20} />
          </div>
          <input
            placeholder={nav("search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] py-3.5 pl-11 pr-4 text-base text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
          />
        </div>

        {scopeLabel && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary-tint)] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
            Scope · {scopeLabel}
            <button
              type="button"
              onClick={clearCategory}
              aria-label="Clear category filter"
              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-primary)]/15 text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/25"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {query.length >= 2 && !loading && (
          <p className="mt-3 text-sm text-[color:var(--color-text-tertiary)]">
            {results.length}{" "}
            {results.length === 1 ? "result" : "results"} for{" "}
            <span className="font-semibold text-[color:var(--color-text)]">
              &ldquo;{query}&rdquo;
            </span>
          </p>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : results.length > 0 ? (
        <ProductGrid products={results} />
      ) : query.length >= 2 ? (
        <EmptyState title={t("noResults")} actionLabel={nav("catalog")} actionHref="/catalog" />
      ) : null}
    </div>
  );
}
