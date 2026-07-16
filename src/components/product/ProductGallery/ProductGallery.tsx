"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ImageOff, Maximize2 } from "lucide-react";
import { getProductImage, getPicsumFallback } from "@/lib/utils/product-image";

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--color-line)] p-3 text-[color:var(--color-text-tertiary)] sm:aspect-[4/3] sm:p-5"
          style={{ backgroundColor: "rgb(247, 247, 247)" }}
        >
          <div className="absolute inset-0 tech-grid opacity-30" />
          <div className="relative flex flex-col items-center gap-2">
            <ImageOff size={28} strokeWidth={1.4} />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
              No image
            </span>
          </div>
        </div>
      </div>
    );
  }

  const active = images[selectedIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Primary image */}
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-[color:var(--color-line)] sm:aspect-[4/3]"
        style={{ backgroundColor: "rgb(247, 247, 247)" }}
      >
        <div className="pointer-events-none absolute inset-0 tech-grid opacity-30" />

        {/* Frame index badge */}
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/90 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] backdrop-blur">
          <span className="tabular-nums">
            {(selectedIndex + 1).toString().padStart(2, "0")}
          </span>
          <span className="opacity-50">/</span>
          <span className="tabular-nums opacity-70">
            {images.length.toString().padStart(2, "0")}
          </span>
        </span>

        {/* Zoom hint */}
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/90 px-2 py-1 text-[color:var(--color-text-secondary)] opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Maximize2 size={11} />
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full w-full"
          >
            <Image
              src={getProductImage(active.url, productName)}
              alt={active.alt || productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-[1.03] sm:p-10"
              priority
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                const fallback = getPicsumFallback(productName);
                if (img.src !== fallback) img.src = fallback;
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Subtle bottom hairline glow */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-primary)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-40"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="scrollbar-none flex gap-2 overflow-x-auto p-1">
          {images.map((image, index) => {
            const isActive = index === selectedIndex;
            return (
              <motion.button
                key={image.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedIndex(index)}
                aria-label={`Show image ${index + 1}`}
                style={{ backgroundColor: "rgb(247, 247, 247)" }}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 p-1 transition-all sm:h-[76px] sm:w-[76px] ${
                  isActive
                    ? "border-[color:var(--color-primary)] shadow-[0_0_0_3px_var(--color-primary-tint)]"
                    : "border-[color:var(--color-line)] hover:-translate-y-px hover:border-[color:var(--color-primary)]/60"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 tech-grid opacity-25" />
                <Image
                  src={getProductImage(image.url, productName)}
                  alt={image.alt || `${productName} ${index + 1}`}
                  fill
                  sizes="76px"
                  className="relative object-contain"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const fallback = getPicsumFallback(`${productName}-${index}`);
                    if (img.src !== fallback) img.src = fallback;
                  }}
                />
                {isActive && (
                  <motion.span
                    layoutId="gallery-active-underline"
                    aria-hidden
                    className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-[color:var(--color-primary)]"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
