"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight, X, Search, ArrowRight,
  LayoutGrid, Sparkles,
  Shirt, Layers, PersonStanding, Baby, User,
  Waves, Footprints, Tag, Leaf, Package,
  Sun, Ruler,
} from "lucide-react";

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
  children?: CatalogCategory[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  categories: CatalogCategory[];
}

const ICON_MAP: { kw: string; icon: React.ElementType }[] = [
  { kw: "swim", icon: Waves },
  { kw: "bikini", icon: Waves },
  { kw: "beach", icon: Waves },
  { kw: "trunks", icon: Waves },
  { kw: "hoodie", icon: Layers },
  { kw: "sweatshirt", icon: Layers },
  { kw: "sweater", icon: Layers },
  { kw: "jumper", icon: Layers },
  { kw: "pullover", icon: Layers },
  { kw: "jacket", icon: Layers },
  { kw: "outerwear", icon: Layers },
  { kw: "t-shirt", icon: Shirt },
  { kw: "tshirt", icon: Shirt },
  { kw: "tee", icon: Shirt },
  { kw: "shirt", icon: Shirt },
  { kw: "top", icon: Shirt },
  { kw: "polo", icon: Shirt },
  { kw: "jersey", icon: Shirt },
  { kw: "tank", icon: Shirt },
  { kw: "crew", icon: Shirt },
  { kw: "vest", icon: Shirt },
  { kw: "all-over", icon: Shirt },
  { kw: "bottom", icon: Footprints },
  { kw: "shorts", icon: Footprints },
  { kw: "pant", icon: Footprints },
  { kw: "trouser", icon: Footprints },
  { kw: "legging", icon: Footprints },
  { kw: "jean", icon: Footprints },
  { kw: "joggers", icon: Footprints },
  { kw: "sweatpants", icon: Footprints },
  { kw: "skirt", icon: Ruler },
  { kw: "dress", icon: Ruler },
  { kw: "men", icon: User },
  { kw: "male", icon: User },
  { kw: "women", icon: PersonStanding },
  { kw: "ladies", icon: PersonStanding },
  { kw: "female", icon: PersonStanding },
  { kw: "kids", icon: Baby },
  { kw: "kid", icon: Baby },
  { kw: "youth", icon: Baby },
  { kw: "child", icon: Baby },
  { kw: "toddler", icon: Baby },
  { kw: "baby", icon: Baby },
  { kw: "accessor", icon: Tag },
  { kw: "bag", icon: Package },
  { kw: "hat", icon: Package },
  { kw: "cap", icon: Package },
  { kw: "sale", icon: Tag },
  { kw: "outlet", icon: Tag },
  { kw: "new", icon: Sparkles },
  { kw: "featured", icon: Sparkles },
  { kw: "sustainable", icon: Leaf },
  { kw: "organic", icon: Leaf },
  { kw: "eco", icon: Leaf },
  { kw: "summer", icon: Sun },
];

function getIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const { kw, icon } of ICON_MAP) {
    if (lower.includes(kw)) return icon;
  }
  return LayoutGrid;
}

function subtreeCount(cat: CatalogCategory): number {
  const own = cat._count?.products || 0;
  return own + (cat.children || []).reduce((s, c) => s + subtreeCount(c), 0);
}

function pickDepartments(categories: CatalogCategory[]): CatalogCategory[] {
  const sorted = [...categories].sort((a, b) => subtreeCount(b) - subtreeCount(a));
  if (sorted.length <= 2 && sorted[0]?.children?.length) {
    return [...(sorted[0].children || [])].sort((a, b) => subtreeCount(b) - subtreeCount(a));
  }
  return sorted;
}

export function CatalogMenu({ open, onClose, categories }: Props) {
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const departments = useMemo(() => pickDepartments(categories), [categories]);
  const activeId = pinnedId ?? departments[0]?.id ?? null;
  const setActiveId = setPinnedId;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const active = departments.find((d) => d.id === activeId) || departments[0];
  const activeChildren = useMemo(() => {
    if (!active) return [] as CatalogCategory[];
    return [...(active.children || [])].sort((a, b) => subtreeCount(b) - subtreeCount(a));
  }, [active]);

  const filteredDepartments = useMemo(() => {
    if (!query.trim()) return departments;
    const q = query.trim().toLowerCase();
    return departments.filter((d) => {
      if (d.name.toLowerCase().includes(q)) return true;
      return (d.children || []).some((c) => c.name.toLowerCase().includes(q));
    });
  }, [departments, query]);

  const filteredChildren = useMemo(() => {
    if (!query.trim()) return activeChildren;
    const q = query.trim().toLowerCase();
    return activeChildren.filter((c) => c.name.toLowerCase().includes(q));
  }, [activeChildren, query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[color:var(--color-text)]/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            className="fixed inset-x-4 top-[76px] z-50 mx-auto flex max-h-[calc(100vh-96px)] w-auto max-w-[var(--container-content)] flex-col overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-2xl"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Catalog"
            aria-modal="true"
          >
            {/* Toolbar */}
            <div className="flex items-center gap-3 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-5 py-3">
              <div className="flex items-center gap-2 text-[color:var(--color-primary)]">
                <Sparkles size={16} />
                <span className="font-serif text-lg font-medium text-[color:var(--color-text)]">Catalog</span>
              </div>
              <div className="ml-auto flex flex-1 items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3 py-1.5 md:max-w-md">
                <Search size={14} className="text-[color:var(--color-text-tertiary)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search categories…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-line)]"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close catalog"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {departments.length === 0 ? (
                <div className="flex flex-1 items-center justify-center p-10 text-sm text-[color:var(--color-text-tertiary)]">
                  Loading catalog…
                </div>
              ) : (
                <>
                  <nav
                    className="w-[280px] shrink-0 overflow-y-auto border-r border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-2"
                    aria-label="Departments"
                  >
                    {filteredDepartments.map((dept) => {
                      const Icon = getIcon(dept.name);
                      const isActive = active?.id === dept.id;
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onMouseEnter={() => setActiveId(dept.id)}
                          onFocus={() => setActiveId(dept.id)}
                          onClick={() => setActiveId(dept.id)}
                          className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                            isActive
                              ? "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]"
                              : "text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                          }`}
                        >
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
                              isActive
                                ? "bg-[color:var(--color-primary)] text-white"
                                : "bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-secondary)] group-hover:bg-[color:var(--color-primary-tint)] group-hover:text-[color:var(--color-primary)]"
                            }`}
                          >
                            <Icon size={15} />
                          </span>
                          <span className="flex-1 truncate font-medium">{dept.name}</span>
                          <ChevronRight
                            size={14}
                            className={`shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-30"}`}
                          />
                        </button>
                      );
                    })}
                    {filteredDepartments.length === 0 && (
                      <div className="px-4 py-6 text-center text-xs text-[color:var(--color-text-tertiary)]">
                        No departments match &ldquo;{query}&rdquo;
                      </div>
                    )}
                    <Link
                      href="/catalog"
                      onClick={onClose}
                      className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-[color:var(--color-line)] px-3 py-2.5 text-sm font-semibold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-tint)]"
                    >
                      Browse all <ArrowRight size={14} />
                    </Link>
                  </nav>

                  <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    {active && (
                      <motion.div
                        key={active.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex flex-col gap-6"
                      >
                        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--color-line)] pb-5">
                          <div>
                            <span className="eyebrow">Department</span>
                            <h3 className="font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)]">
                              {active.name}
                            </h3>
                            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                              {subtreeCount(active).toLocaleString("en-US")} products in stock
                            </p>
                          </div>
                          <Link
                            href={`/catalog/${active.slug}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-hover)]"
                          >
                            Shop all <ArrowRight size={14} />
                          </Link>
                        </div>

                        {filteredChildren.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredChildren.map((child) => {
                              const Icon = getIcon(child.name);
                              const count = subtreeCount(child);
                              return (
                                <Link
                                  key={child.id}
                                  href={`/catalog/${child.slug}`}
                                  onClick={onClose}
                                  className="group flex items-center gap-3 rounded-xl border border-[color:var(--color-line)] p-3 transition-colors hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-tint)]"
                                >
                                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-secondary)] transition-colors group-hover:bg-[color:var(--color-primary)] group-hover:text-white">
                                    <Icon size={16} />
                                  </span>
                                  <span className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-sm font-medium text-[color:var(--color-text)]">
                                      {child.name}
                                    </span>
                                    <span className="text-xs text-[color:var(--color-text-tertiary)]">
                                      {count.toLocaleString("en-US")} items
                                    </span>
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <Link
                            href={`/catalog/${active.slug}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[color:var(--color-line)] px-5 py-4 text-sm text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                          >
                            <Sparkles size={16} />
                            Browse all {subtreeCount(active).toLocaleString("en-US")} products in {active.name} →
                          </Link>
                        )}

                        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-5 sm:flex-row sm:items-center">
                          <div className="flex flex-col">
                            <span className="eyebrow text-[color:var(--color-accent)]">Free UK shipping</span>
                            <span className="mt-0.5 font-serif text-lg font-medium text-[color:var(--color-text)]">
                              On {active.name} orders over £100
                            </span>
                            <span className="text-xs text-[color:var(--color-text-tertiary)]">
                              Same-day dispatch · 14-day returns · Genuine warranty
                            </span>
                          </div>
                          <Link
                            href={`/catalog/${active.slug}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--color-accent-hover)]"
                          >
                            Shop now <ArrowRight size={14} />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
