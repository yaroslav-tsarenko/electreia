"use client";

import { useRef } from "react";
import { Link } from "@/i18n/routing";
import { motion, useInView } from "framer-motion";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount: number;
}

interface Props {
  categories: CategoryItem[];
}

/**
 * Fallback imagery per department slug. We host these from Unsplash's CDN
 * (already allow-listed in next.config.ts) so the tiles never fall back to a
 * bare "Package" glyph even when the DB has no imageUrl.
 */
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "audio-headphones":
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
  "laptops-computers":
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
  "smartphones-tablets":
    "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80",
  "displays-monitors":
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
  "gaming-consoles":
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
  peripherals:
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
  "cameras-drones":
    "https://images.unsplash.com/photo-1519638399535-1b036603ac77?auto=format&fit=crop&w=800&q=80",
  "printers-office":
    "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80",
  "smart-home":
    "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
  wearables:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";

function resolveCategoryImage(cat: CategoryItem): string {
  if (cat.imageUrl && (cat.imageUrl.startsWith("http") || cat.imageUrl.startsWith("/"))) {
    return cat.imageUrl;
  }
  return CATEGORY_IMAGE_MAP[cat.slug] ?? DEFAULT_CATEGORY_IMAGE;
}

export function CategoryShowcase({ categories }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  if (categories.length === 0) return null;

  return (
    <section ref={ref}>
      <motion.div
        className="mb-8 flex flex-col gap-1 border-b border-[color:var(--color-line)] pb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow">Departments</span>
        <h2 className="font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
          Shop by category
        </h2>
      </motion.div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((cat, i) => {
          const src = resolveCategoryImage(cat);
          return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Link
              href={`/catalog/${cat.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] transition-colors hover:border-[color:var(--color-primary)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-bg-secondary)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== DEFAULT_CATEGORY_IMAGE) {
                      img.src = DEFAULT_CATEGORY_IMAGE;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="flex flex-col gap-0.5 p-4">
                <h3 className="text-sm font-semibold text-[color:var(--color-text)]">
                  {cat.name}
                </h3>
                <span className="text-xs text-[color:var(--color-text-tertiary)]">
                  {cat.productCount} products
                </span>
              </div>
            </Link>
          </motion.div>
          );
        })}
      </div>
    </section>
  );
}
