"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort/ProductSort";
import { ProductSkeleton } from "@/components/product/ProductSkeleton/ProductSkeleton";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";

export default function CatalogPage() {
  const t = useTranslations("product");
  const nav = useTranslations("nav");
  const searchParams = useSearchParams();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
  const onSale = searchParams.get("onSale") === "true";
  const selectedBrand = searchParams.get("brand") || "";
  const search = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => { setSearchInput(search); }, [search]);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!("page" in updates)) params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      updateParams({ search: value, page: "1" });
    }, 350);
  };

  const clearAll = () => {
    setSearchInput("");
    router.push("?");
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
    fetch("/api/products/brands")
      .then((res) => res.json())
      .then((data) => setBrands(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("sort", sort);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", "true");
    if (onSale) params.set("onSale", "true");
    if (selectedBrand) params.set("brand", selectedBrand);
    if (search) params.set("search", search);

    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, sort, category, minPrice, maxPrice, inStock, onSale, selectedBrand, search]);

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  const activeFilterCount = [category, minPrice, maxPrice, inStock, onSale, selectedBrand, search].filter(Boolean).length;

  const view = (() => {
    if (search) return { title: `Search: "${search}"`, subtitle: t("showing", { count: products.length, total }) };
    if (onSale) return { title: "Sale", subtitle: "Discounted products across the catalog" };
    if (sort === "popular") return { title: "Best Sellers", subtitle: "Most ordered products" };
    if (selectedBrand) return { title: selectedBrand, subtitle: `Products by ${selectedBrand}` };
    if (searchParams.has("sort") && sort === "newest") return { title: "New Arrivals", subtitle: "Just landed in store" };
    return { title: nav("catalog"), subtitle: t("showing", { count: products.length, total }) };
  })();

  return (
    <div className="mx-auto w-full max-w-[var(--max-width)] px-4">
      <Breadcrumbs
        items={[
          { label: nav("home"), href: "/" },
          ...(view.title !== nav("catalog")
            ? [{ label: nav("catalog"), href: "/catalog" }, { label: view.title }]
            : [{ label: nav("catalog") }]),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">{nav("catalog")}</span>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
            {view.title}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">{view.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 max-[480px]:w-full max-[480px]:justify-between">
          <div className="relative min-w-0 flex-1 basis-[220px]">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-tertiary)]" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-full rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] py-2 pl-8 pr-3 text-[13px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
            />
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-4 py-2 text-[13px] font-semibold text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] lg:hidden"
            type="button"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[color:var(--color-accent)] px-1.5 py-[1px] text-[11px] font-bold text-white">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-line)] bg-transparent px-3 py-2 text-[13px] font-semibold text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-line-strong)]"
            >
              <X size={14} /> Clear
            </button>
          )}
          <ProductSort value={sort} onChange={(v) => updateParams({ sort: v, page: "1" })} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden self-start lg:sticky lg:top-[calc(var(--header-height)+var(--announcement-height)+1rem)] lg:block">
          <ProductFilters
            categories={categories}
            selectedCategory={category}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            onSale={onSale}
            brands={brands}
            selectedBrand={selectedBrand}
            onCategoryChange={(v) => updateParams({ category: v, page: "1" })}
            onMinPriceChange={(v) => updateParams({ minPrice: v, page: "1" })}
            onMaxPriceChange={(v) => updateParams({ maxPrice: v, page: "1" })}
            onInStockChange={(v) => updateParams({ inStock: v ? "true" : "", page: "1" })}
            onSaleChange={(v) => updateParams({ onSale: v ? "true" : "", page: "1" })}
            onBrandChange={(v) => updateParams({ brand: v, page: "1" })}
          />
        </aside>

        <div className="min-w-0">
          {loading ? (
            <ProductSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState
              title={t("filterBy")}
              subtitle={t("priceRange")}
              actionLabel={nav("home")}
              actionHref="/"
            />
          ) : (
            <>
              <ProductGrid products={products} />
              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5 pb-12">
                  <button
                    onClick={() => updateParams({ page: String(page - 1) })}
                    disabled={page <= 1}
                    className={`inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-4 text-[13px] font-medium text-[color:var(--color-text)] ${page <= 1 ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    Prev
                  </button>
                  {(() => {
                    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (page > 3) pages.push("ellipsis-start");
                      const start = Math.max(2, page - 1);
                      const end = Math.min(totalPages - 1, page + 1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (page < totalPages - 2) pages.push("ellipsis-end");
                      pages.push(totalPages);
                    }
                    return pages.map((p) =>
                      typeof p === "string" ? (
                        <span key={p} className="flex h-9 w-9 items-center justify-center text-[13px] text-[color:var(--color-text-secondary)]">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => updateParams({ page: String(p) })}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-[13px] ${
                            p === page
                              ? "bg-[color:var(--color-primary)] font-bold text-white"
                              : "border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] font-medium text-[color:var(--color-text)]"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
                  <button
                    onClick={() => updateParams({ page: String(page + 1) })}
                    disabled={page >= totalPages}
                    className={`inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-4 text-[13px] font-medium text-[color:var(--color-text)] ${page >= totalPages ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col overflow-auto rounded-t-2xl bg-[color:var(--color-bg-elevated)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold text-[color:var(--color-text)]">Filters</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text)]"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <ProductFilters
              categories={categories}
              selectedCategory={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStock={inStock}
              onSale={onSale}
              brands={brands}
              selectedBrand={selectedBrand}
              onCategoryChange={(v) => { updateParams({ category: v, page: "1" }); setMobileFiltersOpen(false); }}
              onMinPriceChange={(v) => updateParams({ minPrice: v, page: "1" })}
              onMaxPriceChange={(v) => updateParams({ maxPrice: v, page: "1" })}
              onInStockChange={(v) => updateParams({ inStock: v ? "true" : "", page: "1" })}
              onSaleChange={(v) => updateParams({ onSale: v ? "true" : "", page: "1" })}
              onBrandChange={(v) => { updateParams({ brand: v, page: "1" }); setMobileFiltersOpen(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
