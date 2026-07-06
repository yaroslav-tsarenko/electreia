"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  ShoppingBag, Search, Menu, X, User as UserIcon, UserRound, Shield,
  ChevronLeft, ChevronRight, ChevronDown, Heart, Bell,
  Shirt, Layers, PersonStanding, Baby,
  Waves, Footprints, Tag, Leaf, Package, Sparkles, Ruler,
  Sun, Flame, Wind, Award, Trophy, Zap, Palette, Scissors,
  Droplets, Gift, Star, Move, Dumbbell, Triangle, LayoutGrid,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { ElectreiaLogo } from "../ElectreiaLogo";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { CatalogMenu } from "../CatalogMenu/CatalogMenu";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
  children?: Category[];
}

function subtreeCount(cat: Category): number {
  const own = cat._count?.products || 0;
  return own + (cat.children || []).reduce((s, c) => s + subtreeCount(c), 0);
}

/**
 * Flatten the tree into a single list (excluding roots that have 0 own
 * products) then sort by subtree size — this lets us blend top departments
 * and their most-populated subcategories into a single dense strip.
 */
function flattenForStrip(cats: Category[]): Category[] {
  const acc: Category[] = [];
  const walk = (list: Category[]) => {
    for (const c of list) {
      acc.push(c);
      if (c.children?.length) walk(c.children);
    }
  };
  walk(cats);
  return acc.sort((a, b) => subtreeCount(b) - subtreeCount(a));
}

function collectAllSubcategories(cats: Category[]): Category[] {
  const acc: Category[] = [];
  const walk = (list: Category[]) => {
    for (const c of list) {
      if (c.children?.length) walk(c.children);
      else acc.push(c);
    }
  };
  walk(cats);
  return acc.sort((a, b) => subtreeCount(b) - subtreeCount(a));
}

/**
 * One distinctive icon per category slug — hand-picked so no two adjacent
 * categories in the strip repeat the same glyph.
 */
const SLUG_ICONS: Record<string, React.ElementType> = {
  // Top-level departments
  men: UserIcon,
  women: UserRound,
  kids: Baby,
  accessories: Tag,

  // Level 2 subcategories
  "men-bottoms": Footprints,
  "men-sweatshirts": Layers,
  "men-t-shirts": Shirt,
  "women-bottoms": Ruler,
  "women-swimwear": Waves,
  "women-t-shirts": Shirt,
  "kids-all-over-shirts": Palette,
  "kids-hoodies-sweatshirts": Layers,
  "kids-t-shirts": Shirt,

  // Level 3 — Men Bottoms
  "men-bottoms-sweatpants": Footprints,
  "men-bottoms-shorts": Sun,
  "men-bottoms-leggings": Dumbbell,
  "men-bottoms-swim-trunks": Waves,
  "men-bottoms-trousers": Move,

  // Level 3 — Men T-shirts
  "men-t-shirts-jerseys": Trophy,
  "men-t-shirts-athletic": Zap,
  "men-t-shirts-graphic": Palette,
  "men-t-shirts-all-over": Sparkles,
  "men-t-shirts-long-sleeve": Wind,
  "men-t-shirts-tanks": Sun,
  "men-t-shirts-polos": Award,

  // Level 3 — Men Sweatshirts
  "men-sweatshirts-hoodies": Layers,
  "men-sweatshirts-zip-hoodies": Layers,
  "men-sweatshirts-crewnecks": UserRound,
  "men-sweatshirts-performance": Zap,

  // Level 3 — Women Bottoms
  "women-bottoms-leggings": Dumbbell,
  "women-bottoms-sweatpants": Footprints,
  "women-bottoms-shorts": Sun,
  "women-bottoms-skirts": Wind,
  "women-bottoms-trousers": Move,

  // Level 3 — Women T-shirts
  "women-t-shirts-crop": Scissors,
  "women-t-shirts-sports-bras": Heart,
  "women-t-shirts-tanks": Sun,
  "women-t-shirts-long-sleeve": Wind,
  "women-t-shirts-v-neck": Triangle,
  "women-t-shirts-polos": Award,
  "women-t-shirts-athletic": Zap,
  "women-t-shirts-all-over": Sparkles,

  // Level 3 — Women Swimwear
  "women-swimwear-bikinis": Waves,
  "women-swimwear-one-piece": Droplets,
  "women-swimwear-cover-ups": Sun,
  "women-swimwear-shorts": Waves,

  // Level 3 — Kids Hoodies
  "kids-hoodies-youth": Star,
  "kids-hoodies-toddler": Baby,
  "kids-hoodies-zip": Layers,

  // Level 3 — Kids T-shirts
  "kids-t-shirts-youth": Star,
  "kids-t-shirts-toddler": Baby,
  "kids-t-shirts-baby": Gift,
  "kids-t-shirts-long-sleeve": Wind,
  "kids-t-shirts-all-over": Sparkles,
};

const ICON_RULES: { kw: string; icon: React.ElementType }[] = [
  { kw: "bikini", icon: Waves },
  { kw: "swim", icon: Waves },
  { kw: "beach", icon: Waves },
  { kw: "trunk", icon: Waves },
  { kw: "cover", icon: Sun },
  { kw: "one-piece", icon: Droplets },
  { kw: "sports bra", icon: Heart },
  { kw: "bralette", icon: Heart },
  { kw: "bustier", icon: Heart },
  { kw: "crop", icon: Scissors },
  { kw: "v-neck", icon: Triangle },
  { kw: "long sleeve", icon: Wind },
  { kw: "long-sleeve", icon: Wind },
  { kw: "tank", icon: Sun },
  { kw: "polo", icon: Award },
  { kw: "jersey", icon: Trophy },
  { kw: "athletic", icon: Zap },
  { kw: "performance", icon: Zap },
  { kw: "compression", icon: Zap },
  { kw: "graphic", icon: Palette },
  { kw: "all-over", icon: Sparkles },
  { kw: "all over", icon: Sparkles },
  { kw: "print", icon: Palette },
  { kw: "hoodie", icon: Layers },
  { kw: "crewneck", icon: UserRound },
  { kw: "crew neck", icon: UserRound },
  { kw: "crew", icon: UserRound },
  { kw: "sweatshirt", icon: Layers },
  { kw: "sweater", icon: Layers },
  { kw: "jumper", icon: Layers },
  { kw: "pullover", icon: Layers },
  { kw: "t-shirt", icon: Shirt },
  { kw: "tshirt", icon: Shirt },
  { kw: "tee", icon: Shirt },
  { kw: "shirt", icon: Shirt },
  { kw: "top", icon: Shirt },
  { kw: "legging", icon: Dumbbell },
  { kw: "sweatpant", icon: Footprints },
  { kw: "jogger", icon: Footprints },
  { kw: "short", icon: Sun },
  { kw: "trouser", icon: Move },
  { kw: "pants", icon: Move },
  { kw: "bottom", icon: Footprints },
  { kw: "skirt", icon: Wind },
  { kw: "dress", icon: Ruler },
  { kw: "youth", icon: Star },
  { kw: "toddler", icon: Baby },
  { kw: "baby", icon: Gift },
  { kw: "kids", icon: Baby },
  { kw: "ladies", icon: UserRound },
  { kw: "women", icon: UserRound },
  { kw: "men", icon: UserIcon },
  { kw: "accessor", icon: Tag },
  { kw: "sale", icon: Tag },
  { kw: "outlet", icon: Tag },
  { kw: "new", icon: Sparkles },
  { kw: "trending", icon: Flame },
  { kw: "sustainable", icon: Leaf },
  { kw: "organic", icon: Leaf },
  { kw: "eco", icon: Leaf },
];

function getIconForCategory(slug: string, name: string) {
  const bySlug = SLUG_ICONS[slug];
  if (bySlug) return bySlug;
  const lower = name.toLowerCase();
  for (const { kw, icon } of ICON_RULES) {
    if (lower.includes(kw)) return icon;
  }
  return Package;
}

/**
 * Build a slug → top-level department name map so we can prefix ambiguous
 * child labels (e.g. three "T-shirts" siblings become "Men T-shirts",
 * "Women T-shirts", "Kids T-shirts").
 */
function buildDeptMap(cats: Category[]): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (list: Category[], dept: string) => {
    for (const c of list) {
      map.set(c.slug, dept);
      if (c.children?.length) walk(c.children, dept);
    }
  };
  for (const top of cats) walk(top.children || [], top.name);
  return map;
}

const LABEL_OVERRIDES: { pattern: RegExp; label: string }[] = [
  { pattern: /^hoodies?\s?&\s?sweatshirts?$/i, label: "Hoodies" },
  { pattern: /^all-over shirts?$/i, label: "All-over prints" },
  { pattern: /^one-piece$/i, label: "One-Piece" },
];

function shortenCategoryLabel(name: string, max = 22): string {
  for (const { pattern, label } of LABEL_OVERRIDES) {
    if (pattern.test(name)) return label;
  }
  if (name.length <= max) return name;
  return name.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Curated 24-slot numbered navigation broken into 3 pages of 8, chosen from
 * real DB categories (verified populations in the current catalog). Rotates
 * with a smooth crossfade every ~5s. Pauses when megamenu / mobile drawer
 * is open so users can act on what they're looking at.
 */
const NAV_PAGES: { label: string; href: string }[][] = [
  // Page 1 · Departments & marketing shortcuts
  [
    { label: "Women",     href: "/catalog/women" },
    { label: "Men",       href: "/catalog/men" },
    { label: "Kids",      href: "/catalog/kids" },
    { label: "Sale",      href: "/catalog?onSale=true" },
    { label: "New in",    href: "/catalog?sort=newest" },
    { label: "Swim",      href: "/catalog/women-swimwear" },
    { label: "Hoodies",   href: "/catalog/kids-hoodies-sweatshirts" },
    { label: "Bikinis",   href: "/catalog/women-swimwear-bikinis" },
  ],
  // Page 2 · Bestselling subcategories
  [
    { label: "T-shirts",     href: "/catalog/women-t-shirts" },
    { label: "Sweatshirts",  href: "/catalog/men-sweatshirts" },
    { label: "Crewnecks",    href: "/catalog/men-sweatshirts-crewnecks" },
    { label: "Bottoms",      href: "/catalog/women-bottoms" },
    { label: "Youth Tees",   href: "/catalog/kids-t-shirts-youth" },
    { label: "Athletic",     href: "/catalog/men-t-shirts-athletic" },
    { label: "Jerseys",      href: "/catalog/men-t-shirts-jerseys" },
    { label: "Shorts",       href: "/catalog/women-bottoms-shorts" },
  ],
  // Page 3 · Niche & discovery
  [
    { label: "Leggings",     href: "/catalog/women-bottoms-leggings" },
    { label: "Crop Tops",    href: "/catalog/women-t-shirts-crop" },
    { label: "Skirts",       href: "/catalog/women-bottoms-skirts" },
    { label: "One-Piece",    href: "/catalog/women-swimwear-one-piece" },
    { label: "Swim Trunks",  href: "/catalog/men-bottoms-swim-trunks" },
    { label: "V-Neck",       href: "/catalog/women-t-shirts-v-neck" },
    { label: "Baby Tees",    href: "/catalog/kids-t-shirts-baby" },
    { label: "Graphic Tees", href: "/catalog/men-t-shirts-graphic" },
  ],
];

function NumberedNavRotator({ paused }: { paused: boolean }) {
  const [page, setPage] = useState(0);
  const [hover, setHover] = useState(false);
  const active = paused || hover;

  useEffect(() => {
    if (active) return;
    const t = setInterval(() => {
      setPage((p) => (p + 1) % NAV_PAGES.length);
    }, 5000);
    return () => clearInterval(t);
  }, [active]);

  const items = NAV_PAGES[page];
  const baseIndex = page * 8;

  return (
    <div
      className="hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] md:block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative mx-auto flex h-12 max-w-[var(--container-content)] items-center px-4 sm:px-6 lg:px-8">
        {/* Left ambient chevron indicator */}
        <button
          type="button"
          aria-label="Previous categories"
          onClick={() => setPage((p) => (p - 1 + NAV_PAGES.length) % NAV_PAGES.length)}
          className="absolute left-2 z-10 hidden h-6 w-6 items-center justify-center rounded-full text-[color:var(--color-text-tertiary)] transition-colors hover:bg-[color:var(--color-bg-elevated)] hover:text-[color:var(--color-primary)] lg:inline-flex"
        >
          <ChevronLeft size={12} />
        </button>

        <div className="relative mx-auto flex h-full w-full items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center justify-center gap-x-7 gap-y-1 lg:gap-x-9"
            >
              {items.map((item, i) => (
                <Link
                  key={`${page}-${item.href}-${i}`}
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 text-[color:var(--color-text)] transition-colors hover:text-[color:var(--color-primary)]"
                >
                  <span className="font-mono text-[10px] font-semibold tabular-nums tracking-widest text-[color:var(--color-text-tertiary)] group-hover:text-[color:var(--color-primary)]">
                    {String(baseIndex + i + 1).padStart(2, "0")}
                  </span>
                  <span className="whitespace-nowrap font-serif text-[13px] font-medium tracking-tight lg:text-[14px]">
                    {item.label}
                  </span>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right ambient chevron + page dots */}
        <div className="absolute right-2 z-10 hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-1">
            {NAV_PAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show page ${i + 1}`}
                onClick={() => setPage(i)}
                className={`h-1 rounded-full transition-all ${
                  i === page
                    ? "w-4 bg-[color:var(--color-primary)]"
                    : "w-1 bg-[color:var(--color-line-strong)] hover:bg-[color:var(--color-primary)]/60"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next categories"
            onClick={() => setPage((p) => (p + 1) % NAV_PAGES.length)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[color:var(--color-text-tertiary)] transition-colors hover:bg-[color:var(--color-bg-elevated)] hover:text-[color:var(--color-primary)]"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal strip with left/right scroll arrows that appear only when
 * there's overflow in that direction. Native scrollbar stays hidden.
 */
function CategoryStrip({
  children,
  containerBg,
  ariaLabel,
}: {
  children: ReactNode;
  containerBg: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const scrollByAmount = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        className="scrollbar-none overflow-x-auto scroll-smooth"
      >
        {children}
      </div>

      {/* Left fade + arrow */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-14 transition-opacity ${
          canPrev ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: `linear-gradient(90deg, ${containerBg} 15%, transparent 100%)` }}
      />
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        aria-label="Scroll categories left"
        className={`absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] shadow-sm transition-all hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] md:inline-flex ${
          canPrev ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Right fade + arrow */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-14 transition-opacity ${
          canNext ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: `linear-gradient(270deg, ${containerBg} 15%, transparent 100%)` }}
      />
      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        aria-label="Scroll categories right"
        className={`absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] shadow-sm transition-all hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] md:inline-flex ${
          canNext ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

const topBarBase =
  "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] dark:bg-[color:var(--color-header)]";
const utilityLink =
  "inline-flex items-center text-[12px] font-medium tracking-wide text-white/80 transition-colors hover:text-white";

export function Header() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { itemCount, cartBounce } = useCart();
  const { user, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const megaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/en/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Level 3 chip strip: top departments blended with their strongest sub-cats.
  const topLevel = [...categories].sort((a, b) => subtreeCount(b) - subtreeCount(a));
  const strongestSubs = flattenForStrip(categories)
    .filter((c) => !topLevel.some((t) => t.id === c.id))
    .slice(0, 18);
  const topStripCategories = [...topLevel, ...strongestSubs].slice(0, 20);

  // Level 4 trending strip: 25 densest leaf/sub categories across whole tree.
  const trendingSubs = collectAllSubcategories(categories).slice(0, 25);

  // Disambiguate labels when a base name repeats across departments —
  // e.g. Men/Women/Kids each have "T-shirts" → "Men T-shirts" etc.
  const deptMap = buildDeptMap(categories);
  const nameCountLevel3 = new Map<string, number>();
  for (const c of topStripCategories) {
    const key = c.name.toLowerCase();
    nameCountLevel3.set(key, (nameCountLevel3.get(key) ?? 0) + 1);
  }
  const nameCountLevel4 = new Map<string, number>();
  for (const c of trendingSubs) {
    const key = c.name.toLowerCase();
    nameCountLevel4.set(key, (nameCountLevel4.get(key) ?? 0) + 1);
  }
  const labelFor = (
    cat: Category,
    countMap: Map<string, number>,
    max = 22,
  ): string => {
    const base = shortenCategoryLabel(cat.name, max);
    const isTopLevel = topLevel.some((t) => t.id === cat.id);
    if (isTopLevel) return base;
    const dept = deptMap.get(cat.slug);
    const isDuplicate = (countMap.get(cat.name.toLowerCase()) ?? 0) > 1;
    if (dept && isDuplicate) return `${dept} ${base}`;
    return base;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]/95 backdrop-blur-md transition-shadow ${
          scrolled ? "shadow-[0_1px_0_0_var(--color-line)]" : ""
        }`}
      >
        {/* Level 1 — Top utility bar */}
        <div className={topBarBase}>
          <div className="mx-auto flex h-9 max-w-[var(--container-content)] items-center justify-between px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-4 sm:gap-5">
              <Link href="/catalog" className={`${utilityLink} !text-white`}>
                Shopping
              </Link>
              <span aria-hidden className="h-3 w-px bg-white/20" />
              <Link href="/about" className={utilityLink}>
                About
              </Link>
              <span aria-hidden className="h-3 w-px bg-white/20" />
              <Link href="/contact" className={utilityLink}>
                Contact
              </Link>
              <span aria-hidden className="h-3 w-px bg-white/20 hidden sm:inline-block" />
              <Link href="/catalog?onSale=true" className={`${utilityLink} hidden sm:inline-flex`}>
                Sale
              </Link>
            </nav>
            <div className="flex items-center gap-2 text-white">
              <span className="hidden font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-white/70 sm:inline">
                Free UK shipping · £100+
              </span>
              <span aria-hidden className="hidden h-3 w-px bg-white/20 sm:inline-block" />
              <ThemeToggle />
              <CurrencySwitcher />
            </div>
          </div>
        </div>

        {/* Level 2 — Branding row (centered wordmark, editorial masthead) */}
        <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]">
          <div className="mx-auto flex max-w-[var(--container-content)] items-center justify-center gap-4 px-4 py-4 sm:py-5 lg:py-6">
            <span aria-hidden className="hidden h-px w-8 shrink-0 bg-[color:var(--color-line-strong)] lg:block" />
            <Link
              href="/"
              className="flex flex-col items-center text-[color:var(--color-text)]"
              aria-label="Electreia"
            >
              <ElectreiaLogo size={30} />
              <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-tertiary)] sm:mt-2 sm:text-[10px]">
                est. 2026 · United Kingdom
              </span>
            </Link>
            <span aria-hidden className="hidden h-px w-8 shrink-0 bg-[color:var(--color-line-strong)] lg:block" />
          </div>
        </div>

        {/* Level 3 — Functional bar: filled catalog + full-width search + actions */}
        <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]">
          <div className="mx-auto flex h-16 max-w-[var(--container-content)] items-center gap-3 px-4 sm:px-6 lg:h-[68px] lg:gap-4 lg:px-8">
            {/* Custom Catalog button — filled brand pill with grid icon + chevron */}
            <button
              className={`group inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-sm transition-all hover:-translate-y-0.5 lg:px-5 lg:py-3 lg:text-[13px] ${
                megaOpen
                  ? "bg-[color:var(--color-accent)] shadow-md ring-2 ring-[color:var(--color-accent)]/30"
                  : "bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-hover)]"
              }`}
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              aria-controls="catalog-dropdown"
              ref={megaRef}
            >
              <LayoutGrid size={14} strokeWidth={2.5} className="shrink-0" />
              <span className="hidden sm:inline">{t("catalog")}</span>
              <ChevronDown
                size={12}
                strokeWidth={2.5}
                className={`shrink-0 transition-transform ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Search — full-width inline on desktop */}
            <form
              className="hidden h-11 min-w-0 flex-1 items-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] pl-4 pr-1 transition-shadow focus-within:border-[color:var(--color-primary)] focus-within:shadow-[0_0_0_3px_var(--color-primary-tint)] md:flex"
              onSubmit={handleSearch}
            >
              <Search size={15} className="text-[color:var(--color-text-tertiary)]" />
              <input
                type="text"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
                placeholder="Search laptops, headphones, cameras, smart home…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                aria-label="Search"
                className="inline-flex h-9 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[color:var(--color-primary-hover)]"
              >
                Search
              </button>
            </form>

            {/* Spacer for mobile — pushes actions right */}
            <span className="flex-1 md:hidden" />

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Link
                href="/search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)] md:hidden"
                aria-label={t("search")}
              >
                <Search size={18} />
              </Link>
              {user && (
                <Link
                  href="/account/wishlist"
                  className="hidden h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)] lg:inline-flex"
                  aria-label="Wishlist"
                >
                  <Heart size={18} />
                </Link>
              )}
              {user && (
                <Link
                  href="/account/orders"
                  className="relative hidden h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)] lg:inline-flex"
                  aria-label="Alerts"
                >
                  <Bell size={18} />
                </Link>
              )}
              <Link
                href={user ? "/account" : "/auth/login"}
                className="hidden h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)] md:inline-flex"
                aria-label={user ? t("account") : t("login")}
              >
                <UserIcon size={18} />
              </Link>
              {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
                <NextLink
                  href="/admin"
                  className="hidden h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)] lg:inline-flex"
                  aria-label="Admin"
                >
                  <Shield size={18} />
                </NextLink>
              )}
              <Link
                href="/cart"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)]"
                aria-label={t("cart")}
              >
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <motion.span
                    key={cartBounce}
                    className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-1 text-[10px] font-bold text-white"
                    initial={cartBounce > 0 ? { scale: 0.5 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 400 }}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </Link>
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)] lg:hidden"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Mobile search row */}
          <div className="border-t border-[color:var(--color-line)] px-4 py-2 md:hidden">
            <form
              className="flex items-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] pl-3 pr-1"
              onSubmit={handleSearch}
            >
              <Search size={14} className="text-[color:var(--color-text-tertiary)]" />
              <input
                type="text"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
                placeholder="Search Electreia"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                aria-label="Search"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white"
              >
                <Search size={12} />
              </button>
            </form>
          </div>
        </div>

        {/* Level 4 — Editorial numbered nav with auto-rotating pages (24 curated categories) */}
        <NumberedNavRotator paused={megaOpen || mobileOpen} />

        {/* Level 4 — Trending strip (25 leaf subs across whole tree) */}
        {trendingSubs.length > 0 && (
          <div className="hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] md:block">
            <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
              <CategoryStrip containerBg="var(--color-bg-secondary)" ariaLabel="Trending categories">
                <div className="flex items-center gap-2 py-2">
                  <span className="mr-1 inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-accent)]">
                    <Flame size={11} strokeWidth={2} /> Trending
                  </span>
                  {trendingSubs.map((sub) => {
                    const Icon = getIconForCategory(sub.slug, sub.name);
                    const label = labelFor(sub, nameCountLevel4, 28);
                    return (
                      <Link
                        key={sub.id}
                        href={`/catalog/${sub.slug}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3 py-1 text-[12px] font-medium text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                        title={sub.name}
                      >
                        <Icon size={12} strokeWidth={1.75} />
                        {label}
                      </Link>
                    );
                  })}
                  <Link
                    href="/catalog"
                    className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-[color:var(--color-primary)] px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[color:var(--color-primary-hover)]"
                  >
                    All categories <ChevronRight size={12} />
                  </Link>
                </div>
              </CategoryStrip>
            </div>
          </div>
        )}
      </header>

      <CatalogMenu open={megaOpen} onClose={() => setMegaOpen(false)} categories={categories} />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-[color:var(--color-text)]/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-[color:var(--color-bg)] shadow-xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-5 py-4">
                <span className="font-serif text-lg font-medium text-[color:var(--color-text)]">
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)]"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                <nav className="flex flex-col">
                  {[
                    { href: "/", label: t("home") },
                    { href: "/catalog", label: t("catalog") },
                    { href: "/catalog?sort=newest", label: "New Arrivals" },
                    { href: "/catalog?onSale=true", label: "Sale" },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                      <ChevronRight size={16} className="text-[color:var(--color-text-tertiary)]" />
                    </Link>
                  ))}

                  <div className="my-2 h-px bg-[color:var(--color-line)]" />

                  {topStripCategories.slice(0, 16).map((cat) => {
                    const Icon = getIconForCategory(cat.slug, cat.name);
                    const label = labelFor(cat, nameCountLevel3);
                    return (
                      <Link
                        key={cat.id}
                        href={`/catalog/${cat.slug}`}
                        className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="flex items-center gap-3 text-[color:var(--color-text-secondary)]">
                          <Icon size={16} />
                          <span className="text-[color:var(--color-text)]">{label}</span>
                        </span>
                        <ChevronRight size={16} className="text-[color:var(--color-text-tertiary)]" />
                      </Link>
                    );
                  })}

                  <div className="my-2 h-px bg-[color:var(--color-line)]" />

                  <Link
                    href="/contact"
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("contact")}
                    <ChevronRight size={16} className="text-[color:var(--color-text-tertiary)]" />
                  </Link>

                  {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <NextLink
                      href="/admin"
                      className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                      onClick={() => setMobileOpen(false)}
                    >
                      Admin Panel
                      <ChevronRight size={16} className="text-[color:var(--color-text-tertiary)]" />
                    </NextLink>
                  )}
                </nav>
              </div>

              <div className="flex flex-col gap-2 border-t border-[color:var(--color-line)] px-5 py-4">
                {user ? (
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-sm font-semibold text-white hover:bg-[color:var(--color-accent-hover)]"
                  >
                    My Account
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-sm font-semibold text-white hover:bg-[color:var(--color-accent-hover)]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-primary)] text-sm font-semibold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-tint)]"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
