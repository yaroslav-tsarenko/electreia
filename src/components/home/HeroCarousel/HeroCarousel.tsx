"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
  Sparkles,
  Repeat,
  Play,
  Pause,
  Headphones,
  Cpu,
  Smartphone,
  Monitor,
  Gamepad2,
  Keyboard,
  Camera,
  Printer,
} from "lucide-react";

/**
 * Modular hero zone for the electronics store.
 *
 * Structure:
 *   ┌────────────────────────────────────────┬────────────────────┐
 *   │                                        │  New arrivals tile │
 *   │  Primary auto-playing carousel         ├────────────────────┤
 *   │  (headline · sub · price-from · CTA)   │  Deal of the week  │
 *   │                                        ├────────────────────┤
 *   │                                        │  Trade-in / finance│
 *   └────────────────────────────────────────┴────────────────────┘
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Category quick-access rail (dept icons)                    │
 *   └─────────────────────────────────────────────────────────────┘
 */

interface Slide {
  id: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  sub: string;
  priceFrom: string;
  cta: { label: string; href: string };
  secondary: { label: string; href: string };
  image: string;
  gradientFrom: string;
  gradientTo: string;
}

const slides: Slide[] = [
  {
    id: "audio",
    eyebrow: "Series 01 · Reference Audio",
    headline: "Precision-engineered",
    headlineAccent: "audio.",
    sub: "Studio-grade headphones, spatial speakers and DACs — hand-picked for spec, tuned by ear.",
    priceFrom: "£299",
    cta: { label: "Shop audio", href: "/catalog/audio-headphones" },
    secondary: { label: "Explore series", href: "/catalog?sort=newest" },
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&q=80&auto=format&fit=crop",
    gradientFrom: "#0B0E14",
    gradientTo: "#12233F",
  },
  {
    id: "laptops",
    eyebrow: "Series 02 · Compute",
    headline: "Ultra-portable",
    headlineAccent: "compute.",
    sub: "Silicon-native laptops with sustained performance — ProMotion, 20-hour batteries, sub-1kg.",
    priceFrom: "£1,299",
    cta: { label: "Shop laptops", href: "/catalog/laptops-computers" },
    secondary: { label: "Compare specs", href: "/catalog?sort=newest" },
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80&auto=format&fit=crop",
    gradientFrom: "#0B0E14",
    gradientTo: "#1F1A3A",
  },
  {
    id: "smart-home",
    eyebrow: "Series 03 · Ambient",
    headline: "The house,",
    headlineAccent: "aware.",
    sub: "Matter-native hubs, sensors and lighting that responds. Fewer boxes on the wall, more calm.",
    priceFrom: "£89",
    cta: { label: "Shop smart home", href: "/catalog/smart-home" },
    secondary: { label: "See sale", href: "/catalog?onSale=true" },
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80&auto=format&fit=crop",
    gradientFrom: "#141821",
    gradientTo: "#1F1A3A",
  },
];

const promoTiles = [
  {
    id: "new-arrivals",
    label: "New arrivals",
    title: "Fresh drops this week",
    href: "/catalog?sort=newest",
    accent: "primary" as const,
    icon: Sparkles,
    image:
      "https://images.unsplash.com/photo-1593642532871-8b12e02d091c?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "deal",
    label: "Deal of the week",
    title: "Save up to 40% on select audio",
    href: "/catalog?onSale=true",
    accent: "violet" as const,
    icon: Zap,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "trade-in",
    label: "Trade-in / 0% finance",
    title: "Level up. Pay flexibly.",
    href: "/contact",
    accent: "success" as const,
    icon: Repeat,
    image:
      "https://images.unsplash.com/photo-1512446733611-9099a758e63c?w=800&q=80&auto=format&fit=crop",
  },
];

const quickAccess = [
  { label: "Audio",       icon: Headphones, href: "/catalog/audio-headphones" },
  { label: "Laptops",     icon: Cpu,        href: "/catalog/laptops-computers" },
  { label: "Smartphones", icon: Smartphone, href: "/catalog/smartphones-tablets" },
  { label: "Monitors",    icon: Monitor,    href: "/catalog/displays-monitors" },
  { label: "Gaming",      icon: Gamepad2,   href: "/catalog/gaming-consoles" },
  { label: "Peripherals", icon: Keyboard,   href: "/catalog/peripherals" },
  { label: "Cameras",     icon: Camera,     href: "/catalog/cameras-drones" },
  { label: "Printers",    icon: Printer,    href: "/catalog/printers-office" },
];

interface Props {
  slides?: unknown[];
  deals?: unknown[];
}

export function HeroCarousel(_props: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const slide = slides[current];

  const go = useCallback(
    (idx: number) => {
      setDir(idx > current ? 1 : -1);
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
      setDir(1);
      setCurrent((p) => (p + 1) % slides.length);
    }, 7500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative w-full bg-[color:var(--color-bg)]"
      aria-label="Featured campaigns"
    >
      <div className="mx-auto max-w-[var(--container-content)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ── Modular grid — primary carousel + stacked promo tiles ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr] lg:gap-4">
          {/* Primary carousel */}
          <div
            className="relative overflow-hidden rounded-2xl border border-[color:var(--color-line)]"
            style={{
              background: `linear-gradient(135deg, ${slide.gradientFrom} 0%, ${slide.gradientTo} 100%)`,
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 tech-grid opacity-30"
            />

            {/* Smooth gradient background transition */}
            <AnimatePresence mode="sync">
              <motion.div
                key={`bg-${slide.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${slide.gradientFrom} 0%, ${slide.gradientTo} 100%)`,
                }}
                aria-hidden
              />
            </AnimatePresence>

            <div className="relative grid min-h-[440px] grid-cols-1 md:grid-cols-2 md:min-h-[520px]">
              {/* Copy */}
              <div className="flex flex-col justify-center gap-5 p-8 md:p-10 lg:p-12">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, x: dir * 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -20 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-5"
                  >
                    <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                      {slide.eyebrow}
                    </span>
                    <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-white md:text-5xl lg:text-6xl">
                      {slide.headline}{" "}
                      <span
                        className="bg-clip-text text-transparent"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, #4C93FF 0%, #9B84FF 100%)",
                        }}
                      >
                        {slide.headlineAccent}
                      </span>
                    </h1>
                    <p className="max-w-md text-sm leading-relaxed text-white/80 md:text-base">
                      {slide.sub}
                    </p>

                    {/* Price-from tag */}
                    <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
                        From
                      </span>
                      <span className="font-mono text-lg font-semibold tabular-nums text-white">
                        {slide.priceFrom}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <Link
                        href={slide.cta.href}
                        className="group inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-primary)] px-5 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_0_20px_var(--color-primary-tint)] transition-all hover:bg-[color:var(--color-primary-hover)] hover:shadow-[0_0_28px_rgba(46,125,255,0.5)]"
                      >
                        {slide.cta.label}
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                      <Link
                        href={slide.secondary.href}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-white/90 transition-colors hover:border-white/60 hover:text-white"
                      >
                        {slide.secondary.label}
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Image */}
              <div className="relative overflow-hidden md:block">
                <AnimatePresence mode="sync">
                  <motion.div
                    key={`img-${slide.id}`}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={slide.image}
                      alt={slide.headline + " " + slide.headlineAccent}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(90deg, ${slide.gradientFrom} 0%, transparent 40%)`,
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={[
                      "h-1 rounded-full transition-all",
                      i === current
                        ? "w-8 bg-white"
                        : "w-2 bg-white/40 hover:bg-white/70",
                    ].join(" ")}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? "Play" : "Pause"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors hover:border-white/40 hover:bg-white/20"
                >
                  {paused ? <Play size={12} /> : <Pause size={12} />}
                </button>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous slide"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors hover:border-white/40 hover:bg-white/20"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next slide"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors hover:border-white/40 hover:bg-white/20"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Promo tiles column */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {promoTiles.map((tile) => {
              const gradient =
                tile.accent === "primary"
                  ? "from-[#12233F] to-[#0B0E14]"
                  : tile.accent === "violet"
                    ? "from-[#1F1A3A] to-[#0B0E14]"
                    : "from-[#0F2A20] to-[#0B0E14]";
              return (
                <Link
                  key={tile.id}
                  href={tile.href}
                  className={`group relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-gradient-to-br ${gradient} p-5 text-white transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-primary)]/50 hover:shadow-[0_10px_28px_-8px_rgba(46,125,255,0.35)]`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 tech-grid opacity-25"
                  />
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 33vw, 25vw"
                    className="absolute inset-0 -z-0 object-cover opacity-20 transition-transform duration-500 group-hover:scale-105"
                    aria-hidden
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
                      <tile.icon
                        size={11}
                        className={
                          tile.accent === "primary"
                            ? "text-[#4C93FF]"
                            : tile.accent === "violet"
                              ? "text-[#9B84FF]"
                              : "text-[#3ED598]"
                        }
                      />
                      {tile.label}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-white/70 transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                  <div className="relative z-10 font-display text-base font-semibold leading-tight text-white md:text-lg">
                    {tile.title}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Category quick-access rail ──────────────────────────── */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]">
          <div className="scrollbar-none flex items-stretch overflow-x-auto">
            {quickAccess.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group flex min-w-[100px] flex-1 shrink-0 items-center justify-center gap-2 border-r border-[color:var(--color-line)] px-4 py-3 text-[color:var(--color-text)] transition-colors last:border-r-0 hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)]"
              >
                <c.icon
                  size={16}
                  className="text-[color:var(--color-text-tertiary)] transition-colors group-hover:text-[color:var(--color-primary)]"
                />
                <span className="whitespace-nowrap text-xs font-semibold">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
