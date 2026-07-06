"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { getProductImage, getProductImageFallback } from "@/lib/utils/product-image";

interface Props {
  product: {
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
  };
}

export function MarketplaceProductCard({ product }: Props) {
  const { addItem } = useCart();
  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const hasDiscount = !!(comparePrice && comparePrice > price);
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice! - price) / comparePrice!) * 100)
    : 0;
  const inStock = product.quantity === undefined || product.quantity > 0;
  const imageUrl = product.images?.[0]?.url;
  const imgSrc = getProductImage(imageUrl, product.name);
  const category = product.categories?.[0]?.category;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price,
      imageUrl: imgSrc,
      quantity: 1,
      slug: product.slug,
      sku: product.id,
      maxQuantity: product.quantity ?? 99,
    });
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--color-line-strong)] hover:shadow-[0_10px_28px_rgba(28,26,23,0.08)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[color:var(--color-bg)]">
        <Image
          src={imgSrc}
          alt={product.images?.[0]?.alt || product.name}
          width={280}
          height={280}
          className="h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04] dark:mix-blend-normal"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getProductImageFallback();
          }}
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 inline-flex h-6 items-center rounded-full bg-[color:var(--color-accent)] px-2.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            −{discountPercent}%
          </span>
        )}
        {!inStock && (
          <span className="absolute inset-x-3 top-3 rounded-md bg-[color:var(--color-text)]/85 py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
            Out of stock
          </span>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Add to wishlist"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/90 text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
          >
            <Heart size={13} strokeWidth={1.75} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Quick view"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/90 text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
          >
            <Eye size={13} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {category && (
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
            {category.name}
          </span>
        )}
        <h4 className="line-clamp-2 min-h-[2.6em] text-sm font-medium leading-snug text-[color:var(--color-text)] transition-colors group-hover:text-[color:var(--color-primary)]">
          {product.name}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-[color:var(--color-text-tertiary)]">
          <div className="flex items-center gap-0.5 text-[color:var(--color-accent)]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={10}
                strokeWidth={0}
                className={s <= 4 ? "fill-current" : "fill-current opacity-25"}
              />
            ))}
          </div>
          <span>(12)</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col leading-tight">
            <span
              className={`text-base font-semibold tracking-tight ${
                hasDiscount ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-text)]"
              }`}
            >
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-[color:var(--color-text-tertiary)] line-through">
                {formatPrice(comparePrice!)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label="Add to cart"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              inStock
                ? "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]"
                : "cursor-not-allowed bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-tertiary)]"
            }`}
          >
            <ShoppingBag size={14} strokeWidth={1.75} />
          </button>
        </div>

        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
            inStock ? "text-[color:var(--color-success)]" : "text-[color:var(--color-text-tertiary)]"
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              inStock ? "bg-[color:var(--color-success)]" : "bg-[color:var(--color-text-tertiary)]"
            }`}
          />
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>
    </Link>
  );
}
