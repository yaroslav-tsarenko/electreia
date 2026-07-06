"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

interface BannerData {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string | null;
  bgColor: string;
  textColor: string;
  badgeText?: string | null;
}

interface Props {
  smallBanners: BannerData[];
  wideBanners: BannerData[];
}

const defaultWide: BannerData[] = [
  {
    id: "w1",
    badgeText: "Pro Account",
    title: "Register & Get 10% Off Your First Order",
    subtitle: "Free shipping over £100, trade pricing, and priority support",
    bgColor: "",
    textColor: "",
    linkUrl: "/auth/register",
    ctaLabel: "Join Free",
  },
];

export function PromoBannerGrid({ smallBanners, wideBanners }: Props) {
  const small = smallBanners;
  const wide = wideBanners.length > 0 ? wideBanners : defaultWide;

  return (
    <div className="flex flex-col gap-4">
      {small.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {small.map((b) => (
            <Link
              key={b.id}
              href={b.linkUrl || "#"}
              className="group relative flex min-h-[200px] flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-[color:var(--color-line)] p-6 transition-colors hover:border-[color:var(--color-primary)]"
              style={{
                backgroundColor: b.bgColor || "var(--color-bg-secondary)",
                color: b.textColor || "var(--color-text)",
              }}
            >
              {b.imageUrl && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.imageUrl}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${b.bgColor || "#0f172a"} 0%, transparent 70%)` }}
                  />
                </>
              )}
              <div className="relative flex flex-col gap-2">
                {b.badgeText && (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
                    {b.badgeText}
                  </span>
                )}
                <h3 className="font-serif text-xl font-medium leading-snug tracking-tight">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <span className="text-sm opacity-80">{b.subtitle}</span>
                )}
              </div>
              <span className="relative mt-2 inline-flex items-center gap-1 self-start rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[color:var(--color-primary)] transition-transform group-hover:translate-x-1">
                {b.ctaLabel || "Shop now"} <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      )}
      {wide.map((b) => (
        <Link
          key={b.id}
          href={b.linkUrl || "#"}
          className="group relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-3xl border border-[color:var(--color-line)] px-6 py-6 transition-colors sm:px-10 sm:py-8"
          style={{
            backgroundColor: b.bgColor || "var(--color-primary)",
            color: b.textColor || "var(--color-primary-fg)",
          }}
        >
          {b.imageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.imageUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(90deg, ${b.bgColor || "#0f172a"} 20%, transparent 90%)` }}
              />
            </>
          )}
          <div className="relative flex flex-1 flex-col gap-1">
            {b.badgeText && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">
                {b.badgeText}
              </span>
            )}
            <h3 className="font-serif text-2xl font-medium tracking-tight sm:text-3xl">
              {b.title}
            </h3>
            {b.subtitle && (
              <p className="max-w-2xl text-sm opacity-80">{b.subtitle}</p>
            )}
          </div>
          {b.ctaLabel && (
            <span className="relative inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-semibold text-[color:var(--color-primary)] transition-transform group-hover:translate-x-1">
              {b.ctaLabel} <ArrowRight size={16} />
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
