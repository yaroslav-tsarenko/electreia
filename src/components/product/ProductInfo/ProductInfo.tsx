"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  Heart,
  ShoppingCart,
  Gift,
  Truck,
  RotateCcw,
  Lock,
  Zap,
  Check,
  Star,
} from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { QuantitySelector } from "@/components/shared/QuantitySelector/QuantitySelector";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";

/**
 * Optional electronics add-ons on the PDP. Keys align with the
 * "warrantyOption{n}year" translation keys.
 */
const EXTRAS_OPTIONS = [
  { key: "none", labelKey: "noWarranty" as const,          nameSuffix: "",                             price: 0 },
  { key: "ext",  labelKey: "warrantyOption1year" as const, nameSuffix: "+ extended 3-yr warranty",     price: 24.99 },
  { key: "adp",  labelKey: "warrantyOption2year" as const, nameSuffix: "+ accidental damage cover",    price: 34.99 },
  { key: "prio", labelKey: "warrantyOption3year" as const, nameSuffix: "+ priority dispatch",          price: 4.99 },
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
  const [addedFlash, setAddedFlash] = useState(false);
  const { addItem } = useCart();
  const { currency, convert } = useCurrency();
  const router = useRouter();

  const outOfStock = stockQuantity <= 0;
  const lowStock = stockQuantity > 0 && stockQuantity <= lowStockAlert;

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
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1200);
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
      if (data.action === "added") toast.success(t("addToWishlist"));
      else toast.success(t("removeFromWishlist"));
    } catch {
      toast.error("Please log in to use wishlist");
    }
  };

  const isOnSale = !!(comparePrice && comparePrice > price);
  const savingsPercent = isOnSale
    ? Math.round(((comparePrice! - price) / comparePrice!) * 100)
    : 0;

  return (
    <motion.div
      className="flex flex-col gap-5 sm:gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Title block */}
      <div>
        {brand && (
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-primary)]">
            {brand}
          </span>
        )}
        <h1 className="mt-2 break-words font-display text-2xl font-semibold leading-[1.15] tracking-tight text-[color:var(--color-text)] sm:text-3xl md:text-[36px] [overflow-wrap:anywhere]">
          {name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">
            SKU · <span className="tabular-nums">{sku}</span>
          </span>
          {ean && (
            <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">
              EAN · <span className="tabular-nums">{ean}</span>
            </span>
          )}
          {reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--color-warning)]">
              <span className="inline-flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    strokeWidth={0}
                    className={
                      i < Math.round(avgRating)
                        ? "fill-current"
                        : "opacity-25 fill-current"
                    }
                  />
                ))}
              </span>
              <span className="font-mono text-[11px] text-[color:var(--color-text-tertiary)] tabular-nums">
                ({reviewCount})
              </span>
            </span>
          )}
        </div>
      </div>

      {shortDescription && (
        <p className="text-[15px] leading-relaxed text-[color:var(--color-text-secondary)]">
          {shortDescription}
        </p>
      )}

      <hr className="h-px border-0 bg-[color:var(--color-line)]" />

      {/* Price block */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="font-mono">
            <PriceDisplay price={price} comparePrice={comparePrice} size="lg" />
          </div>
          {isOnSale && (
            <motion.span
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", damping: 12 }}
              className="inline-flex h-6 items-center rounded-md bg-[color:var(--color-primary)] px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_0_16px_var(--color-primary-tint)]"
            >
              −{savingsPercent}% off
            </motion.span>
          )}
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
          VAT included · Free UK shipping over £100
        </span>
      </div>

      {/* Stock status */}
      <AnimatePresence mode="wait">
        <motion.p
          key={outOfStock ? "out" : lowStock ? "low" : "in"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`inline-flex w-fit items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] ${
            outOfStock
              ? "border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]"
              : lowStock
                ? "border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]"
                : "border-[color:var(--color-success)]/30 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]"
          }`}
        >
          <motion.span
            aria-hidden
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              outOfStock
                ? "bg-[color:var(--color-danger)]"
                : lowStock
                  ? "bg-[color:var(--color-warning)]"
                  : "bg-[color:var(--color-success)] shadow-[0_0_8px_rgba(62,213,152,0.7)]"
            }`}
            animate={!outOfStock ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          {outOfStock
            ? t("outOfStock")
            : lowStock
              ? t("onlyLeft", { count: stockQuantity })
              : t("inStock")}
        </motion.p>
      </AnimatePresence>

      <hr className="h-px border-0 bg-[color:var(--color-line)]" />

      {/* Add-ons & extras */}
      <div className="flex flex-col gap-2.5">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text)]">
          <Gift size={13} className="text-[color:var(--color-primary)]" />
          {t("warranty")}
        </span>
        <p className="mb-1 text-xs text-[color:var(--color-text-secondary)]">
          {t("warrantyStandard")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {EXTRAS_OPTIONS.map((opt, idx) => {
            const active = idx === selectedWarranty;
            return (
              <motion.button
                key={opt.key}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", damping: 20, stiffness: 400 }}
                onClick={() => setSelectedWarranty(idx)}
                className={`relative flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition-all ${
                  active
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)] shadow-[0_0_0_3px_var(--color-primary-tint)]"
                    : "border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] hover:border-[color:var(--color-primary)]/60"
                }`}
              >
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white"
                  >
                    <Check size={10} strokeWidth={3} />
                  </motion.span>
                )}
                <span className="pr-6">{t(opt.labelKey)}</span>
                <span
                  className={`font-mono text-[11px] font-normal tabular-nums ${
                    active
                      ? "text-[color:var(--color-primary)]"
                      : "text-[color:var(--color-text-tertiary)]"
                  }`}
                >
                  {opt.price > 0 ? `+${formatPrice(convert(opt.price), currency)}` : "Included"}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CTAs */}
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
          startContent={
            <AnimatePresence mode="wait">
              {addedFlash ? (
                <motion.span
                  key="ok"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Check size={18} strokeWidth={2.5} />
                </motion.span>
              ) : (
                <motion.span
                  key="cart"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <ShoppingCart size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          }
          className="flex-1 !font-mono !text-[12px] !font-semibold !uppercase !tracking-[0.14em] shadow-[0_0_0_transparent] transition-shadow hover:shadow-[0_0_24px_var(--color-primary-tint)]"
        >
          {addedFlash
            ? "Added"
            : selectedWarranty > 0
              ? t("addToCartWithWarranty")
              : t("addToCart")}
        </Button>
        <Button
          size="lg"
          onPress={handleBuyNow}
          isDisabled={outOfStock}
          startContent={<Zap size={16} />}
          className="!bg-[color:var(--color-text)] !font-mono !text-[12px] !font-semibold !uppercase !tracking-[0.14em] !text-[color:var(--color-bg)] transition-opacity hover:opacity-85"
        >
          {t("buyNow")}
        </Button>
        <Button
          isIconOnly
          variant="bordered"
          size="lg"
          onPress={handleWishlist}
          aria-label={t("addToWishlist")}
          className="!border-[color:var(--color-line)] transition-colors hover:!border-[color:var(--color-primary)] hover:!text-[color:var(--color-primary)]"
        >
          <Heart size={18} />
        </Button>
      </div>

      {/* Spec table */}
      <div className="mt-1 overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]">
        {brand && (
          <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-4 py-2.5 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
              {t("brand")}
            </span>
            <span className="font-mono font-semibold text-[color:var(--color-text)]">
              {brand}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-4 py-2.5 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
            {t("condition")}
          </span>
          <span className="font-mono font-semibold uppercase text-[color:var(--color-text)]">
            {condition}
          </span>
        </div>
        <div
          className={`flex items-center justify-between px-4 py-2.5 text-sm ${
            ean ? "border-b border-[color:var(--color-line)]" : ""
          }`}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
            {t("sku")}
          </span>
          <span className="font-mono font-semibold text-[color:var(--color-text)] tabular-nums">
            {sku}
          </span>
        </div>
        {ean && (
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
              {t("ean")}
            </span>
            <span className="font-mono font-semibold text-[color:var(--color-text)] tabular-nums">
              {ean}
            </span>
          </div>
        )}
      </div>

      {/* Trust badges — precision-tech style */}
      <div className="grid grid-cols-1 gap-2 pt-1 xs:grid-cols-3 sm:grid-cols-3 sm:gap-3">
        {[
          { Icon: Truck, title: t("freeShipping"), desc: t("freeShippingDesc") },
          { Icon: RotateCcw, title: t("easyReturns"), desc: t("easyReturnsDesc") },
          { Icon: Lock, title: t("securePayment"), desc: t("securePaymentDesc") },
        ].map(({ Icon, title, desc }) => (
          <motion.div
            key={title}
            whileHover={{ y: -1 }}
            transition={{ type: "spring", damping: 20, stiffness: 400 }}
            className="group flex flex-row items-center gap-2.5 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3 py-2.5 transition-colors hover:border-[color:var(--color-primary)]/40 xs:flex-col xs:text-center sm:flex-col sm:px-3 sm:py-3 sm:text-center"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] text-[color:var(--color-primary)] transition-all group-hover:border-[color:var(--color-primary)]/50 group-hover:shadow-[0_0_16px_var(--color-primary-tint)]">
              <Icon size={15} strokeWidth={1.75} />
            </span>
            <div className="flex flex-col leading-tight xs:items-center sm:items-center">
              <span className="text-[12px] font-semibold text-[color:var(--color-text)]">
                {title}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-text-tertiary)]">
                {desc}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
