"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import {
  ChevronLeft, ChevronRight, ArrowRight, Truck, RotateCcw, ShieldCheck, Zap,
} from "lucide-react";

/**
 * Full-bleed editorial hero for the Electreia apparel store.
 *
 * Layout — asymmetric two-panel split that spans the entire viewport width:
 *   ┌────────────────────────────┬────────────────────────────┐
 *   │  copy panel (tinted)       │  full-bleed product image   │
 *   │  eyebrow · headline · CTAs │  editor's pick badge        │
 *   │  4-badge feature strip     │  bottom price card          │
 *   └────────────────────────────┴────────────────────────────┘
 *   ┌────────────────────────────────────────────────────────┐
 *   │  Controls + slide indicators (full-width strip)         │
 *   └────────────────────────────────────────────────────────┘
 *
 * We intentionally break out of the parent container's `max-w` by giving the
 * section `w-full`; padding on inner content is left-aligned to a virtual
 * container column so the text still reads as part of the site grid.
 */

interface Slide {
  id: string;
  eyebrow: string;
  titlePre: string;
  titleAccent: string;
  subtitle: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  productName: string;
  productPrice: string;
  productHref: string;
  categoryLabel: string;
  image: string;
  bg: string;         // solid background of the copy panel
  fg: string;         // main text color on the copy panel
  fgMuted: string;    // secondary text on the copy panel
  accent: string;     // accent buttons/badges
  accentFg: string;   // text color on accent buttons
  imageTint: string;  // background under image (visible before load)
}

const slides: Slide[] = [
  {
    id: "audio-drop",
    eyebrow: "Series 01 · Signal / Reference",
    titlePre: "Precision-engineered",
    titleAccent: "audio.",
    subtitle:
      "Studio-grade headphones, spatial speakers and reference DACs — hand-picked for spec, tuned for taste.",
    primary: { label: "Shop audio", href: "/catalog/audio" },
    secondary: { label: "Reference series", href: "/catalog?sort=newest" },
    productName: "Reference Studio Monitors — Pair",
    productPrice: "£1,249.00",
    productHref: "/catalog/audio",
    categoryLabel: "Audio · Monitors",
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&q=80&auto=format&fit=crop",
    bg: "#0B0E14",
    fg: "#EDF1F5",
    fgMuted: "rgba(237,241,245,0.72)",
    accent: "#2E7DFF",
    accentFg: "#FFFFFF",
    imageTint: "#141821",
  },
  {
    id: "laptops-pro",
    eyebrow: "Series 02 · Compute / Mobile",
    titlePre: "Ultra-portable",
    titleAccent: "compute.",
    subtitle:
      "Silicon-native laptops with sustained performance — ProMotion displays, 20-hour batteries, sub-1kg chassis.",
    primary: { label: "Shop laptops", href: "/catalog/laptops" },
    secondary: { label: "Compare specs", href: "/catalog?sort=newest" },
    productName: "Pro 14 · M-series · 32GB",
    productPrice: "£2,199.00",
    productHref: "/catalog/laptops",
    categoryLabel: "Laptops · Pro",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80&auto=format&fit=crop",
    bg: "#12233F",
    fg: "#EDF1F5",
    fgMuted: "rgba(237,241,245,0.72)",
    accent: "#4C93FF",
    accentFg: "#FFFFFF",
    imageTint: "#0F1B33",
  },
  {
    id: "smart-home",
    eyebrow: "Series 03 · Ambient / Smart",
    titlePre: "The house,",
    titleAccent: "aware.",
    subtitle:
      "Smart hubs, matter-native sensors and lighting that responds. Fewer boxes on the wall, more moments of calm.",
    primary: { label: "Shop smart home", href: "/catalog/smart-home" },
    secondary: { label: "See sale", href: "/catalog?onSale=true" },
    productName: "Matter Hub · 4-Bulb Starter Kit",
    productPrice: "£189.00",
    productHref: "/catalog/smart-home",
    categoryLabel: "Smart Home · Hubs",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80&auto=format&fit=crop",
    bg: "#1F1A3A",
    fg: "#EDF1F5",
    fgMuted: "rgba(237,241,245,0.72)",
    accent: "#7C5CFF",
    accentFg: "#FFFFFF",
    imageTint: "#191534",
  },
];

const features = [
  { icon: Truck,       title: "Free UK delivery",     subtitle: "Over £100" },
  { icon: RotateCcw,   title: "14-day returns",       subtitle: "No fine print" },
  { icon: ShieldCheck, title: "2-year warranty",      subtitle: "Manufacturer backed" },
  { icon: Zap,         title: "Same-day dispatch",    subtitle: "Order before 14:00 GMT" },
];

interface Props {
  // Props accepted from parent but not used — hero is fully hand-designed for
  // brand-critical placement. Left in the signature so existing call sites
  // keep working without a refactor.
  slides?: unknown[];
  deals?: unknown[];
}

export function HeroCarousel(_props: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const slide = slides[current];

  const go = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      const wrapped = ((idx % slides.length) + slides.length) % slides.length;
      setCurrent(wrapped);
    },
    [current],
  );
  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % slides.length);
    }, 8000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ background: slide.bg }}
    >
      {/* Colored background transitions smoothly between slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${slide.id}`}
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{ background: slide.bg }}
          aria-hidden
        />
      </AnimatePresence>

      <div className="relative grid min-h-[560px] w-full grid-cols-1 lg:min-h-[720px] lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)] xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* ── Left panel · copy ────────────────────────────────────── */}
        <div className="relative flex items-center py-16 sm:py-20 lg:py-24">
          <div
            className="relative z-10 flex w-full max-w-[720px] flex-col gap-8 px-6 sm:px-10 lg:px-14"
            style={{
              marginLeft: "max(0px, calc((100vw - var(--container-content, 1400px)) / 2))",
            }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-7"
              >
                <span
                  className="inline-flex w-fit items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: slide.fgMuted }}
                >
                  <span
                    className="h-px w-8"
                    style={{ background: `${slide.fg}55` }}
                  />
                  {slide.eyebrow}
                </span>

                <h1
                  className="font-serif text-[46px] font-medium leading-[0.98] tracking-tight sm:text-[64px] lg:text-[86px] xl:text-[104px]"
                  style={{ color: slide.fg }}
                >
                  {slide.titlePre}{" "}
                  <em
                    className="not-italic font-serif italic"
                    style={{ color: slide.accent }}
                  >
                    {slide.titleAccent}
                  </em>
                </h1>

                <p
                  className="max-w-xl text-base leading-relaxed sm:text-[17px]"
                  style={{ color: slide.fgMuted }}
                >
                  {slide.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={slide.primary.href}
                    className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                    style={{
                      background: slide.accent,
                      color: slide.accentFg,
                    }}
                  >
                    {slide.primary.label}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                  <Link
                    href={slide.secondary.href}
                    className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors"
                    style={{
                      borderColor: `${slide.fg}33`,
                      color: slide.fg,
                    }}
                  >
                    {slide.secondary.label}
                  </Link>
                </div>

                <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4 border-t pt-6 sm:gap-x-6 sm:grid-cols-4"
                    style={{ borderColor: `${slide.fg}20` }}>
                  {features.map(({ icon: Icon, title, subtitle }) => (
                    <li key={title} className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: `${slide.accent}22`,
                          color: slide.accent,
                        }}
                      >
                        <Icon size={14} strokeWidth={1.6} />
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[12px] font-semibold" style={{ color: slide.fg }}>
                          {title}
                        </span>
                        <span className="text-[11px]" style={{ color: slide.fgMuted }}>
                          {subtitle}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right panel · full-bleed product image ─────────────── */}
        <div
          className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:min-h-full"
          style={{ background: slide.imageTint }}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={`img-${slide.id}`}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading={current === 0 ? "eager" : "lazy"}
              />
            </motion.div>
          </AnimatePresence>

          {/* Category pill · top left */}
          <div className="pointer-events-none absolute left-6 top-6 z-10">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] shadow-sm backdrop-blur"
              style={{ color: slide.bg }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: slide.accent }}
              />
              {slide.categoryLabel}
            </span>
          </div>

          {/* Editor's pick badge · top right */}
          <div className="pointer-events-none absolute right-6 top-6 z-10 hidden sm:block">
            <div
              className="rounded-full border bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] shadow-sm backdrop-blur"
              style={{ color: slide.bg, borderColor: `${slide.bg}22` }}
            >
              Editor's pick
            </div>
          </div>

          {/* Shop-this-look card · bottom right */}
          <Link
            href={slide.productHref}
            className="group absolute inset-x-6 bottom-6 z-10 flex items-center gap-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur transition-transform hover:-translate-y-1 sm:inset-x-auto sm:right-6 sm:max-w-md"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Shop this look
              </span>
              <span className="mt-0.5 truncate text-sm font-semibold text-neutral-900">
                {slide.productName}
              </span>
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ background: slide.accent, color: slide.accentFg }}
            >
              {slide.productPrice}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>

      {/* ── Controls strip · full-width ─────────────────────────── */}
      <div
        className="relative z-10 border-t"
        style={{ borderColor: `${slide.fg}18`, background: `${slide.bg}` }}
      >
        <div
          className="mx-auto flex items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-14"
          style={{ maxWidth: "var(--container-content)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
              style={{
                borderColor: `${slide.fg}33`,
                color: slide.fg,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
              style={{
                borderColor: `${slide.fg}33`,
                color: slide.fg,
              }}
            >
              <ChevronRight size={16} />
            </button>
            <div className="ml-2 hidden items-center gap-3 sm:flex">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="group flex items-center gap-2"
                >
                  <span
                    className="text-[10px] font-semibold tabular-nums tracking-widest"
                    style={{
                      color: i === current ? slide.fg : `${slide.fg}66`,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="h-[2px] rounded-full transition-all"
                    style={{
                      width: i === current ? 40 : 16,
                      background: i === current ? slide.accent : `${slide.fg}33`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span
              className="hidden text-[11px] font-medium uppercase tracking-[0.18em] sm:inline"
              style={{ color: slide.fgMuted }}
            >
              {String(current + 1).padStart(2, "0")} <span style={{ opacity: 0.5 }}>/</span>{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
              style={{ background: `${slide.fg}12`, color: slide.fg }}
            >
              All collections <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
