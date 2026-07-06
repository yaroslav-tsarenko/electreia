"use client";

import {
  Truck, RotateCcw, Shield, Gift, Award, Headphones,
  Zap, Heart, Star, Package, Clock, CheckCircle,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Truck, RotateCcw, Shield, Gift, Award, Headphones,
  Zap, Heart, Star, Package, Clock, CheckCircle,
};

interface PromoItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
}

interface Props {
  items: PromoItem[];
}

const defaultItems: PromoItem[] = [
  { id: "1", icon: "Truck", title: "Free delivery", subtitle: "Orders over £100" },
  { id: "2", icon: "RotateCcw", title: "Easy returns", subtitle: "14-day policy" },
  { id: "3", icon: "Shield", title: "2-year warranty", subtitle: "On all products" },
  { id: "4", icon: "Award", title: "Premium quality", subtitle: "Certified goods" },
  { id: "5", icon: "Headphones", title: "24/7 support", subtitle: "Always here" },
];

export function PromoStrip({ items }: Props) {
  const data = items.length > 0 ? items : defaultItems;

  return (
    <div className="hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] md:block">
      <div className="mx-auto flex max-w-[var(--container-content)] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
        {data.map((b) => {
          const Icon = ICON_MAP[b.icon] || Package;
          return (
            <div key={b.id} className="flex items-center gap-2.5">
              <Icon size={18} className="text-[color:var(--color-primary)]" strokeWidth={1.5} />
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-[color:var(--color-text)]">
                  {b.title}
                </span>
                {b.subtitle && (
                  <span className="text-[11px] text-[color:var(--color-text-tertiary)]">
                    {b.subtitle}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
