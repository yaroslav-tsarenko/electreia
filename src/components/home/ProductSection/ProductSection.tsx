"use client";

import { useState, useMemo, useRef } from "react";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { MarketplaceProductCard } from "../MarketplaceProductCard/MarketplaceProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  comparePrice?: number | string | null;
  images: { url: string; alt?: string | null }[];
  categories?: { category: { name: string; slug: string } }[];
  quantity?: number;
  status?: string;
  isFeatured?: boolean;
  brand?: string | null;
}

interface TabInput {
  label: string;
  slugs: string[];
}

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  tabs?: TabInput[] | string[];
  bg?: "white" | "gray";
  columns?: number;
}

function normalizeTabs(tabs: Props["tabs"]): TabInput[] {
  if (!tabs || tabs.length === 0) return [];
  if (typeof tabs[0] === "string") {
    return (tabs as string[]).map((label) => ({ label, slugs: [] }));
  }
  return tabs as TabInput[];
}

const colClass: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6",
};

export function ProductSection({
  title, subtitle, products, viewAllHref, viewAllLabel, tabs, bg = "white", columns = 5,
}: Props) {
  const normalizedTabs = useMemo(() => normalizeTabs(tabs), [tabs]);
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "100px" });

  const filtered = useMemo(() => {
    if (normalizedTabs.length === 0 || activeTab === 0) return products;
    const tab = normalizedTabs[activeTab];
    if (!tab) return products;
    const slugSet = new Set(tab.slugs);
    if (slugSet.size > 0) {
      const matched = products.filter((p) =>
        p.categories?.some((c) => slugSet.has(c.category.slug))
      );
      return matched.length > 0 ? matched : products;
    }
    const matched = products.filter((p) =>
      p.categories?.some((c) => c.category.name === tab.label)
    );
    return matched.length > 0 ? matched : products;
  }, [products, normalizedTabs, activeTab]);

  if (!products.length) return null;

  return (
    <section
      ref={ref}
      className={
        bg === "gray"
          ? "-mx-4 rounded-3xl bg-[color:var(--color-bg-secondary)] px-4 py-12 sm:-mx-6 sm:px-6 sm:py-14 lg:-mx-8 lg:px-8"
          : ""
      }
    >
      <motion.div
        className="mb-8 flex flex-col gap-6 border-b border-[color:var(--color-line)] pb-6 md:flex-row md:items-end md:justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
            {title}
          </h2>
          {subtitle && (
            <span className="text-sm text-[color:var(--color-text-secondary)]">{subtitle}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {normalizedTabs.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {normalizedTabs.map((tab, i) => (
                <button
                  key={`${tab.label}-${i}`}
                  onClick={() => setActiveTab(i)}
                  className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition-colors ${
                    i === activeTab
                      ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
                      : "border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-primary-hover)]"
            >
              {viewAllLabel || "View all"} <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </motion.div>

      <div className={`grid gap-4 sm:gap-6 xl:gap-8 ${colClass[columns] ?? colClass[5]}`}>
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.25) }}
          >
            <MarketplaceProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
