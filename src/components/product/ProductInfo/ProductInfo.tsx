"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Heart, ShoppingCart, Gift, Truck, RotateCcw, Lock } from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { QuantitySelector } from "@/components/shared/QuantitySelector/QuantitySelector";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";

/**
 * Optional apparel add-ons offered on the PDP alongside the main product —
 * flat-priced, unlike the retired warranty tiers that scaled with product
 * cost. Naming keys are kept aligned with the "warrantyOption{n}year"
 * translations so we don't have to churn every locale.
 */
const EXTRAS_OPTIONS = [
  { key: "none", labelKey: "noWarranty" as const,          nameSuffix: "",                        price: 0 },
  { key: "gift", labelKey: "warrantyOption1year" as const, nameSuffix: "+ gift wrap",             price: 3.99 },
  { key: "care", labelKey: "warrantyOption2year" as const, nameSuffix: "+ care kit",              price: 6.99 },
  { key: "prio", labelKey: "warrantyOption3year" as const, nameSuffix: "+ priority dispatch",     price: 4.99 },
];

function calcExtraPrice(option: typeof EXTRAS_OPTIONS[number]): number {
  return option.price;
}

interface ProductInfoProps {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  quantity: number;
  shortDescription?: string | null;
  description?: string | null;
  brand?: string | null;
  condition: string;
  lowStockAlert: number;
  imageUrl?: string | null;
  ean?: string | null;
  reviewCount?: number;
  avgRating?: number;
  categoryPath?: { name: string; slug: string }[];
}

export function ProductInfo({
  id,
  name,
  slug,
  sku,
  price,
  comparePrice,
  quantity: stockQuantity,
  shortDescription,
  brand,
  condition,
  lowStockAlert,
  imageUrl,
  ean,
  reviewCount = 0,
  avgRating = 0,
}: ProductInfoProps) {
  const t = useTranslations("product");
  const [qty, setQty] = useState(1);
  const [selectedWarranty, setSelectedWarranty] = useState(0);
  const { addItem } = useCart();
  const { currency, convert } = useCurrency();
  const router = useRouter();

  const outOfStock = stockQuantity <= 0;
  const lowStock = stockQuantity > 0 && stockQuantity <= lowStockAlert;

  const extrasAvailable = true;
  const extraOption = EXTRAS_OPTIONS[selectedWarranty] ?? EXTRAS_OPTIONS[0];
  const extraPrice = calcExtraPrice(extraOption);
  const totalPrice = price + extraPrice;
  const cartName = extraOption.nameSuffix ? `${name} ${extraOption.nameSuffix}` : name;

  const handleAddToCart = () => {
    addItem({
      productId: id,
      name: cartName,
      slug,
      sku,
      price: totalPrice,
      quantity: qty,
      imageUrl: imageUrl || null,
      maxQuantity: stockQuantity,
    });
  };

  const handleBuyNow = () => {
    addItem({
      productId: id,
      name: cartName,
      slug,
      sku,
      price: totalPrice,
      quantity: qty,
      imageUrl: imageUrl || null,
      maxQuantity: stockQuantity,
    });
    router.push("/checkout");
  };

  const handleWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      const data = await res.json();
      if (data.action === "added") {
        toast.success(t("addToWishlist"));
      } else {
        toast.success(t("removeFromWishlist"));
      }
    } catch {
      toast.error("Please log in to use wishlist");
    }
  };

  const isOnSale = comparePrice && comparePrice > price;
  const savingsPercent = isOnSale
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div>
        {brand && <span className="eyebrow">{brand}</span>}
        <h1 className="mt-2 break-words font-serif text-2xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-3xl md:text-[40px] [overflow-wrap:anywhere]">
          {name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="text-xs text-[color:var(--color-text-tertiary)]">{t("sku")}: {sku}</span>
          {ean && <span className="text-xs text-[color:var(--color-text-tertiary)]">{t("ean")}: {ean}</span>}
          {reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--color-accent)]">
              {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
              <span className="font-normal text-[color:var(--color-text-tertiary)]">({reviewCount})</span>
            </span>
          )}
        </div>
      </div>

      {shortDescription && <p className="text-[15px] leading-relaxed text-[color:var(--color-text-secondary)]">{shortDescription}</p>}

      <hr className="h-px border-0 bg-[color:var(--color-line)]" />

      <div className="flex items-center gap-4">
        <PriceDisplay price={price} comparePrice={comparePrice} size="lg" />
        {isOnSale && (
          <span className="inline-flex h-6 items-center rounded-full bg-[color:var(--color-accent)] px-2.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            −{savingsPercent}%
          </span>
        )}
      </div>

      <p
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
          outOfStock
            ? "bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]"
            : lowStock
            ? "bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]"
            : "bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]"
        }`}
      >
        {outOfStock
          ? t("outOfStock")
          : lowStock
            ? t("onlyLeft", { count: stockQuantity })
            : t("inStock")}
      </p>

      <hr className="h-px border-0 bg-[color:var(--color-line)]" />

      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-[13px] font-bold text-[color:var(--color-text)]">
          <Gift size={14} /> {t("warranty")}
        </span>
        <p className="mb-2 text-xs text-[color:var(--color-text-secondary)]">
          {t("warrantyStandard")}
        </p>
        {extrasAvailable && (
          <div className="grid grid-cols-2 gap-2">
            {EXTRAS_OPTIONS.map((opt, idx) => (
              <button
                key={opt.key}
                className={`flex flex-col items-center gap-0.5 rounded-lg border-2 px-2 py-2.5 text-center text-[13px] font-semibold transition-all ${
                  idx === selectedWarranty
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)] shadow-[0_0_0_1px_var(--color-primary)]"
                    : "border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-tint)]"
                }`}
                onClick={() => setSelectedWarranty(idx)}
              >
                {t(opt.labelKey)}
                {opt.price > 0 && (
                  <span className="text-[11px] font-normal text-[color:var(--color-text-secondary)]">+{formatPrice(convert(opt.price), currency)}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <QuantitySelector
          quantity={qty}
          maxQuantity={stockQuantity}
          onChange={setQty}
        />
        <Button
          color="primary"
          size="lg"
          onPress={handleAddToCart}
          isDisabled={outOfStock}
          startContent={<ShoppingCart size={18} />}
          className="flex-1"
        >
          {selectedWarranty > 0 ? t("addToCartWithWarranty") : t("addToCart")}
        </Button>
        <Button
          size="lg"
          onPress={handleBuyNow}
          isDisabled={outOfStock}
          className="!bg-[color:var(--color-text)] font-bold !text-[color:var(--color-bg)] hover:opacity-85"
        >
          {t("buyNow")}
        </Button>
        <Button
          isIconOnly
          variant="bordered"
          size="lg"
          onPress={handleWishlist}
          aria-label={t("addToWishlist")}
        >
          <Heart size={18} />
        </Button>
      </div>

      <div className="border-t border-[color:var(--color-line)] pt-4">
        {brand && (
          <div className="flex justify-between border-b border-[color:var(--color-line)]/50 py-2 text-sm last:border-b-0">
            <span className="text-[color:var(--color-text-secondary)]">{t("brand")}</span>
            <span className="font-semibold text-[color:var(--color-text)]">{brand}</span>
          </div>
        )}
        <div className="flex justify-between border-b border-[color:var(--color-line)]/50 py-2 text-sm last:border-b-0">
          <span className="text-[color:var(--color-text-secondary)]">{t("condition")}</span>
          <span className="font-semibold text-[color:var(--color-text)]">{condition}</span>
        </div>
        <div className="flex justify-between border-b border-[color:var(--color-line)]/50 py-2 text-sm last:border-b-0">
          <span className="text-[color:var(--color-text-secondary)]">{t("sku")}</span>
          <span className="font-semibold text-[color:var(--color-text)]">{sku}</span>
        </div>
        {ean && (
          <div className="flex justify-between py-2 text-sm">
            <span className="text-[color:var(--color-text-secondary)]">{t("ean")}</span>
            <span className="font-semibold text-[color:var(--color-text)]">{ean}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 pt-2 xs:grid-cols-3 sm:grid-cols-3 sm:gap-3">
        <div className="flex flex-row items-center gap-2 rounded-lg bg-[color:var(--color-bg-secondary)] px-3 py-2.5 xs:flex-col xs:text-center sm:flex-col sm:px-2 sm:py-3 sm:text-center">
          <Truck size={18} className="shrink-0 text-[color:var(--color-primary)]" strokeWidth={1.5} />
          <div className="flex flex-col leading-tight xs:items-center sm:items-center">
            <span className="text-[11px] font-bold text-[color:var(--color-text)]">{t("freeShipping")}</span>
            <span className="text-[10px] text-[color:var(--color-text-tertiary)]">{t("freeShippingDesc")}</span>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 rounded-lg bg-[color:var(--color-bg-secondary)] px-3 py-2.5 xs:flex-col xs:text-center sm:flex-col sm:px-2 sm:py-3 sm:text-center">
          <RotateCcw size={18} className="shrink-0 text-[color:var(--color-primary)]" strokeWidth={1.5} />
          <div className="flex flex-col leading-tight xs:items-center sm:items-center">
            <span className="text-[11px] font-bold text-[color:var(--color-text)]">{t("easyReturns")}</span>
            <span className="text-[10px] text-[color:var(--color-text-tertiary)]">{t("easyReturnsDesc")}</span>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 rounded-lg bg-[color:var(--color-bg-secondary)] px-3 py-2.5 xs:flex-col xs:text-center sm:flex-col sm:px-2 sm:py-3 sm:text-center">
          <Lock size={18} className="shrink-0 text-[color:var(--color-primary)]" strokeWidth={1.5} />
          <div className="flex flex-col leading-tight xs:items-center sm:items-center">
            <span className="text-[11px] font-bold text-[color:var(--color-text)]">{t("securePayment")}</span>
            <span className="text-[10px] text-[color:var(--color-text-tertiary)]">{t("securePaymentDesc")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
