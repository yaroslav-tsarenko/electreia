"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { formatPrice } from "@/lib/utils/format-price";
import { getProductImage, getProductImageFallback } from "@/lib/utils/product-image";
import { getDiscountPercent, type HomepageProduct } from "@/lib/homepage-products";

interface Props {
  product: HomepageProduct;
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export function DealOfTheDay({ product }: Props) {
  const [time, setTime] = useState<ReturnType<typeof getTimeUntilMidnight> | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    const update = () => setTime(getTimeUntilMidnight());
    const initialId = window.setTimeout(update, 0);
    const intervalId = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initialId);
      window.clearInterval(intervalId);
    };
  }, []);

  const discount = getDiscountPercent(product);
  const imgUrl = getProductImage(product.images?.[0]?.url, product.name);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.section
      ref={ref}
      className="grid grid-cols-1 gap-6 overflow-hidden rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-primary)] p-6 text-[color:var(--color-primary-fg)] sm:p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <motion.span
            className="inline-flex items-center rounded-full bg-[color:var(--color-accent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
            animate={isInView ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
          >
            Deal of the day
          </motion.span>
          <div className="flex items-center gap-1 text-sm font-medium">
            <span className="rounded-md bg-white/10 px-2 py-1 font-mono tabular-nums">
              {time ? pad(time.h) : "--"}
            </span>
            <span className="text-white/60">:</span>
            <span className="rounded-md bg-white/10 px-2 py-1 font-mono tabular-nums">
              {time ? pad(time.m) : "--"}
            </span>
            <span className="text-white/60">:</span>
            <span className="rounded-md bg-white/10 px-2 py-1 font-mono tabular-nums">
              {time ? pad(time.s) : "--"}
            </span>
          </div>
        </div>
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight sm:text-[40px]">
          {product.name}
        </h2>
        <p className="max-w-md text-sm text-white/70">
          Limited time offer &mdash; grab it before the deal expires.
        </p>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-serif text-4xl font-medium text-[color:var(--color-accent)] sm:text-5xl">
            {formatPrice(Number(product.price))}
          </span>
          {product.comparePrice && (
            <span className="text-lg text-white/50 line-through">
              {formatPrice(Number(product.comparePrice))}
            </span>
          )}
          {discount > 0 && (
            <span className="inline-flex items-center rounded-full bg-[color:var(--color-accent)]/20 px-2.5 py-1 text-xs font-semibold text-[color:var(--color-accent)]">
              -{discount}%
            </span>
          )}
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-accent-hover)]"
        >
          Shop now <ArrowRight size={16} />
        </Link>
      </motion.div>
      <motion.div
        className="flex items-center justify-center"
        initial={{ opacity: 0, x: 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <motion.div
          className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-2xl bg-white/5 p-6"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Image
            src={imgUrl}
            alt={product.name}
            width={240}
            height={200}
            className="h-full w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getProductImageFallback("240x200");
            }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
