"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ChevronRight, ChevronDown, Menu, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
  children?: Category[];
}

function CategoryItem({ cat, depth = 0, onNavigate }: { cat: Category; depth?: number; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = cat.children && cat.children.length > 0;
  const count = cat._count?.products || 0;

  return (
    <>
      <div
        className="group flex items-center justify-between py-1.5 pr-2 transition-colors hover:bg-[color:var(--color-primary-tint)]"
        style={{ paddingLeft: `${0.75 + depth * 0.75}rem` }}
      >
        <Link
          href={`/catalog/${cat.slug}`}
          className="flex flex-1 items-center justify-between gap-2 text-sm text-[color:var(--color-text-secondary)] transition-colors hover:text-[color:var(--color-primary)]"
          onClick={onNavigate}
        >
          <span className="truncate">{cat.name}</span>
          {count > 0 && (
            <span className="ml-2 text-[11px] text-[color:var(--color-text-tertiary)]">
              {count}
            </span>
          )}
        </Link>
        {hasChildren && (
          <button
            type="button"
            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-[color:var(--color-text-tertiary)] hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)]"
            onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>
      {hasChildren && expanded && cat.children!.map((child) => (
        <CategoryItem key={child.id} cat={child} depth={depth + 1} onNavigate={onNavigate} />
      ))}
    </>
  );
}

export function CategorySidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] transition-colors hover:bg-[color:var(--color-primary-tint)] lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open categories"
      >
        <Menu size={18} />
        <span>Categories</span>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] transition-transform lg:relative lg:z-auto lg:h-auto lg:w-full lg:max-w-none lg:translate-x-0 lg:rounded-2xl lg:border ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text)]">
            <Menu size={14} />
            Catalog
          </h3>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)] lg:hidden"
            onClick={closeMobile}
            aria-label="Close categories"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {categories.length === 0 ? (
            <div className="flex flex-col gap-2 px-3 py-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="h-3 animate-pulse rounded bg-[color:var(--color-bg-secondary)]"
                    style={{ width: `${55 + (i * 17) % 35}%`, flexShrink: 0 }}
                  />
                  <div
                    className="ml-auto h-3 animate-pulse rounded bg-[color:var(--color-bg-secondary)]"
                    style={{ width: "24px" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            categories.map((cat) => (
              <CategoryItem key={cat.id} cat={cat} onNavigate={closeMobile} />
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
