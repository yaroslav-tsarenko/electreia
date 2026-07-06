"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white p-3 text-[color:var(--color-text-tertiary)] shadow-[0_1px_2px_rgba(28,26,23,0.04)] sm:aspect-[4/3] sm:p-5">
          No Image
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white p-3 shadow-[0_1px_2px_rgba(28,26,23,0.04)] sm:aspect-[4/3] sm:p-5">
        <Image
          src={images[selectedIndex].url}
          alt={images[selectedIndex].alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1 transition-all sm:h-[72px] sm:w-[72px] ${
                index === selectedIndex
                  ? "border-[color:var(--color-primary)] shadow-[0_0_0_2px_rgba(31,77,63,0.18)]"
                  : "border-[color:var(--color-line)] hover:-translate-y-px hover:border-[color:var(--color-primary)]"
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                sizes="72px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
