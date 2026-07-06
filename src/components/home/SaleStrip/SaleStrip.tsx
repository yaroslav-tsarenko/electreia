"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { formatPrice } from "@/lib/utils/format-price";
import { getProductImage, getProductImageFallback } from "@/lib/utils/product-image";
import { getDiscountPercent, type HomepageProduct } from "@/lib/homepage-products";

interface Props {
  products: HomepageProduct[];
}

export function SaleStrip({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-40px" });

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section ref={sectionRef}>
      <motion.div
        className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--color-line)] pb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]"
            animate={isInView ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, repeatDelay: 3 }}
          >
            <Flame size={18} />
          </motion.div>
          <div className="flex flex-col gap-0.5">
            <span className="eyebrow">Hot right now</span>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-3xl">
              Hot deals
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/catalog?sort=price-asc&onSale=true"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)]"
          >
            View all <ChevronRight size={14} />
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-line)] text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p, i) => {
            const discount = getDiscountPercent(p);
            const imgUrl = getProductImage(p.images?.[0]?.url, p.name);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
              >
                <Link
                  href={`/product/${p.slug}`}
                  className="group relative flex w-[220px] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-4 transition-colors hover:border-[color:var(--color-primary)]"
                >
                  {discount > 0 && (
                    <span className="absolute left-3 top-3 z-10 inline-flex h-6 items-center rounded-full bg-[color:var(--color-accent)] px-2.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      -{discount}%
                    </span>
                  )}
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-[color:var(--color-bg)] p-4">
                    <Image
                      src={imgUrl}
                      alt={p.name}
                      width={120}
                      height={100}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getProductImageFallback("120x100");
                      }}
                    />
                  </div>
                  <h4 className="line-clamp-2 text-sm font-medium text-[color:var(--color-text)]">
                    {p.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-[color:var(--color-accent)]">
                      {formatPrice(Number(p.price))}
                    </span>
                    {p.comparePrice && (
                      <span className="text-xs text-[color:var(--color-text-tertiary)] line-through">
                        {formatPrice(Number(p.comparePrice))}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
