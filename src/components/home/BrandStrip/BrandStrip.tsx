"use client";

import { useRef } from "react";
import type { IconType } from "react-icons";
import {
  SiApple,
  SiSamsung,
  SiLg,
  SiSony,
  SiHp,
  SiDell,
  SiLenovo,
  SiAsus,
  SiAcer,
  SiMsi,
  SiLogitech,
  SiIntel,
  SiAmd,
} from "react-icons/si";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BrandData {
  id: string;
  name: string;
  logoUrl?: string | null;
  linkUrl?: string | null;
}

// Real brand logos (Simple Icons) keyed by normalized brand name, with each
// brand's official color. Microsoft is omitted from Simple Icons for trademark
// reasons, so it falls back to a styled wordmark.
const BRAND_ICONS: Record<string, { Icon: IconType; color: string }> = {
  apple: { Icon: SiApple, color: "#000000" },
  samsung: { Icon: SiSamsung, color: "#1428A0" },
  lg: { Icon: SiLg, color: "#A50034" },
  sony: { Icon: SiSony, color: "#000000" },
  hp: { Icon: SiHp, color: "#0096D6" },
  dell: { Icon: SiDell, color: "#007DB8" },
  lenovo: { Icon: SiLenovo, color: "#E2231A" },
  asus: { Icon: SiAsus, color: "#000000" },
  acer: { Icon: SiAcer, color: "#83B81A" },
  msi: { Icon: SiMsi, color: "#EA1B22" },
  logitech: { Icon: SiLogitech, color: "#00B8FC" },
  intel: { Icon: SiIntel, color: "#0071C5" },
  amd: { Icon: SiAmd, color: "#ED1C24" },
};

function brandIcon(name: string) {
  return BRAND_ICONS[name.trim().toLowerCase()] ?? null;
}

interface Props {
  brands: BrandData[];
}

export function BrandStrip({ brands }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  if (!brands.length) return null;

  return (
    <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Curated</span>
          <h3 className="font-serif text-2xl font-medium tracking-tight text-[color:var(--color-text)]">
            Popular brands
          </h3>
        </div>
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
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((brand) => {
          const href = brand.linkUrl && brand.linkUrl.trim() !== "" && brand.linkUrl !== "#"
            ? brand.linkUrl
            : `/catalog?brand=${encodeURIComponent(brand.name)}`;
          const icon = brandIcon(brand.name);
          const externalLogo = brand.logoUrl && /^https?:\/\//i.test(brand.logoUrl)
            ? brand.logoUrl
            : null;
          return (
            <a
              key={brand.id}
              href={href}
              aria-label={`Shop ${brand.name}`}
              className="group flex h-20 w-40 shrink-0 snap-start items-center justify-center rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-4 transition-colors hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-tint)]"
            >
              {icon ? (
                <icon.Icon
                  aria-label={brand.name}
                  role="img"
                  size={40}
                  color={icon.color}
                  className="max-h-10 w-auto opacity-80 transition-opacity group-hover:opacity-100"
                />
              ) : externalLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={externalLogo}
                  alt={brand.name}
                  className="max-h-10 max-w-full object-contain opacity-80 transition-opacity group-hover:opacity-100"
                />
              ) : (
                <span className="text-lg font-semibold tracking-tight text-[color:var(--color-text-secondary)] transition-colors group-hover:text-[color:var(--color-primary)]">
                  {brand.name}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
