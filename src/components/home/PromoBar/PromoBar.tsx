"use client";

import { useTranslations } from "next-intl";
import { Truck, RotateCcw, Headphones, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const promos = [
  { icon: Truck, titleKey: "promoFreeShipping" as const, descKey: "promoFreeShippingDesc" as const },
  { icon: RotateCcw, titleKey: "promoReturns" as const, descKey: "promoReturnsDesc" as const },
  { icon: Headphones, titleKey: "promoSupport" as const, descKey: "promoSupportDesc" as const },
  { icon: ShieldCheck, titleKey: "promoSecure" as const, descKey: "promoSecureDesc" as const },
];

export function PromoBar() {
  const t = useTranslations("home");

  return (
    <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]">
      <div className="mx-auto grid max-w-[var(--container-content)] grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
        {promos.map((promo, i) => {
          const Icon = promo.icon;
          return (
            <motion.div
              key={promo.titleKey}
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]">
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col leading-tight">
                <p className="text-sm font-semibold text-[color:var(--color-text)]">
                  {t(promo.titleKey)}
                </p>
                <p className="text-xs text-[color:var(--color-text-tertiary)]">
                  {t(promo.descKey)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
