"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User as UserIcon,
  Shield,
  ChevronDown,
  ChevronRight,
  Heart,
  Bell,
  Package,
  MapPin,
  HelpCircle,
  Truck,
  GitCompare,
  LayoutGrid,
  Headphones,
  Cpu,
  Smartphone,
  Monitor,
  Gamepad2,
  Keyboard,
  Camera,
  Printer,
  Zap,
  Sparkles,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useLocale } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { ElectreiaLogo } from "../ElectreiaLogo";
import { CurrencySwitcher } from "./CurrencySwitcher";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
  children?: Category[];
}

/**
 * Electronics department taxonomy — the 8 departments we group the leaf
 * categories under. Icons + accent copy are hand-picked. When live category
 * data comes back from /api/categories we cross-reference by slug so counts
 * and children stay in sync with the DB.
 */
const DEPARTMENTS: Array<{
  slug: string;
  name: string;
  short: string;
  Icon: React.ElementType;
  tagline: string;
  featured: { label: string; slug: string }[];
  promo: { title: string; subtitle: string; href: string; badge: string };
}> = [
  {
    slug: "audio-headphones",
    name: "Audio & Headphones",
    short: "Audio",
    Icon: Headphones,
    tagline: "Studio-grade cans, IEMs & speakers",
    featured: [
      { label: "Over-ear headphones", slug: "headphones" },
      { label: "Gaming headsets", slug: "headsets" },
      { label: "Microphones", slug: "microphones" },
    ],
    promo: {
      title: "Reference Series",
      subtitle: "Studio monitors on trade-in",
      href: "/catalog/audio-headphones",
      badge: "Save up to £400",
    },
  },
  {
    slug: "laptops-computers",
    name: "Laptops & Computers",
    short: "Laptops",
    Icon: Cpu,
    tagline: "Silicon-native laptops, desktops & CPUs",
    featured: [
      { label: "Ultra-portable notebooks", slug: "notebooks" },
      { label: "Desktop workstations", slug: "desktop-computers" },
      { label: "CPUs", slug: "cpu" },
    ],
    promo: {
      title: "Pro 14 Series",
      subtitle: "M-series · 32GB · sub-1kg",
      href: "/catalog/laptops-computers",
      badge: "0% finance",
    },
  },
  {
    slug: "smartphones-tablets",
    name: "Smartphones & Tablets",
    short: "Mobile",
    Icon: Smartphone,
    tagline: "Flagship phones & pro tablets",
    featured: [
      { label: "Flagship smartphones", slug: "smartphones" },
      { label: "Pro tablets", slug: "tablets" },
    ],
    promo: {
      title: "Trade in, level up",
      subtitle: "Get up to £700 credit",
      href: "/catalog/smartphones-tablets",
      badge: "Trade-in",
    },
  },
  {
    slug: "displays-monitors",
    name: "Displays & Monitors",
    short: "Displays",
    Icon: Monitor,
    tagline: "4K IPS, ultrawide & gaming panels",
    featured: [
      { label: "Ultrawide", slug: "monitors" },
      { label: "Gaming monitors", slug: "monitors" },
      { label: "Home office", slug: "monitors" },
    ],
    promo: {
      title: "OLED calibrated",
      subtitle: "Colour-accurate panels for pros",
      href: "/catalog/displays-monitors",
      badge: "New",
    },
  },
  {
    slug: "gaming-consoles",
    name: "Gaming & Consoles",
    short: "Gaming",
    Icon: Gamepad2,
    tagline: "Consoles, controllers & VR",
    featured: [{ label: "Consoles", slug: "consoles" }],
    promo: {
      title: "Console bundles",
      subtitle: "Free game + extra pad",
      href: "/catalog/gaming-consoles",
      badge: "Bundle",
    },
  },
  {
    slug: "peripherals",
    name: "Peripherals",
    short: "Peripherals",
    Icon: Keyboard,
    tagline: "Mechanical boards, mice & desk gear",
    featured: [
      { label: "Keyboards", slug: "keyboards" },
      { label: "Mice", slug: "mouse-devices" },
    ],
    promo: {
      title: "Deskmate deals",
      subtitle: "Build the setup",
      href: "/catalog/peripherals",
      badge: "Save 20%",
    },
  },
  {
    slug: "cameras-drones",
    name: "Cameras & Drones",
    short: "Cameras",
    Icon: Camera,
    tagline: "Mirrorless, cinema drones, gimbals",
    featured: [{ label: "Drones", slug: "drones" }],
    promo: {
      title: "Aerial cinema",
      subtitle: "Pro drones with LiDAR",
      href: "/catalog/cameras-drones",
      badge: "Pro",
    },
  },
  {
    slug: "printers-office",
    name: "Printers & Office",
    short: "Office",
    Icon: Printer,
    tagline: "Laser, MFP, home office",
    featured: [{ label: "Printers", slug: "printers" }],
    promo: {
      title: "Business bundles",
      subtitle: "Printer + toner starter",
      href: "/catalog/printers-office",
      badge: "B2B",
    },
  },
];

const SEARCH_SCOPES = [
  { value: "all", label: "All departments" },
  ...DEPARTMENTS.map((d) => ({ value: d.slug, label: d.short })),
];

const ROTATING_PROMOS = [
  { icon: Truck, text: "Free UK delivery on orders over £100" },
  { icon: Package, text: "Same-day dispatch — order before 14:00 GMT" },
  { icon: Zap, text: "0% interest financing available at checkout" },
  { icon: Sparkles, text: "Trade in your old device — up to £700 credit" },
];

function useDropdownDismiss(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);
  return ref;
}

export function Header() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { itemCount, cartBounce, cart, removeItem } = useCart();
  const items = cart.items;
  const subtotal = cart.subtotal;
  const { user, role } = useAuth();
  const { currency, symbol } = useCurrency();
  const locale = useLocale();
  const localeLabel = locale.toUpperCase();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<string>(DEPARTMENTS[0].slug);
  const [accountOpen, setAccountOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [scope, setScope] = useState<string>("all");
  const [scopeOpen, setScopeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [promoIdx, setPromoIdx] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchFocus, setSearchFocus] = useState(false);
  const [mobileAcc, setMobileAcc] = useState<string | null>(null);

  const megaRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // — Scroll condensing
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // — Mobile drawer lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // — Rotating promo
  useEffect(() => {
    const t = setInterval(
      () => setPromoIdx((p) => (p + 1) % ROTATING_PROMOS.length),
      4500,
    );
    return () => clearInterval(t);
  }, []);

  // — Live categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  // — Recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem("electreia-recent-search");
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const pushRecent = (q: string) => {
    setRecentSearches((prev) => {
      const next = [q, ...prev.filter((v) => v !== q)].slice(0, 6);
      try {
        localStorage.setItem("electreia-recent-search", JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    pushRecent(q);
    const scopePath = scope === "all" ? "" : `&category=${scope}`;
    router.push(`/en/search?q=${encodeURIComponent(q)}${scopePath}`);
    setSearchFocus(false);
  };

  const findLiveDept = (slug: string) =>
    categories.find((c) => c.slug === slug);
  const activeDeptData = DEPARTMENTS.find((d) => d.slug === activeDept)!;
  const activeDeptLive = findLiveDept(activeDept);

  const openMega = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setMegaOpen(true);
  };
  const closeMegaSoon = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const megaDismissRef = useDropdownDismiss(() => setMegaOpen(false));
  const accountDismissRef = useDropdownDismiss(() => setAccountOpen(false));
  const cartDismissRef = useDropdownDismiss(() => setMiniCartOpen(false));
  const searchDismissRef = useDropdownDismiss(() => {
    setScopeOpen(false);
    setSearchFocus(false);
  });

  const productCountForDept = (slug: string) => {
    const live = findLiveDept(slug);
    if (live) return live._count?.products ?? 0;
    return 0;
  };

  return (
    <>
      <header
        className={[
          "sticky top-0 z-40 w-full transition-shadow duration-300",
          "border-b border-[color:var(--color-line)]",
          "bg-[color:var(--color-bg)]/95 backdrop-blur-xl",
          scrolled
            ? "shadow-[0_1px_0_0_var(--color-line)]"
            : "shadow-none",
        ].join(" ")}
        role="banner"
      >
        {/* ── Tier 1 · Utility strip (collapses on scroll) ─────────────── */}
        <div
          className={[
            "overflow-hidden bg-[color:var(--color-header)] text-[color:var(--color-header-fg)] transition-[max-height,opacity] duration-300",
            scrolled ? "max-h-0 opacity-0" : "max-h-9 opacity-100",
          ].join(" ")}
          aria-hidden={scrolled}
        >
          <div className="mx-auto flex h-9 max-w-[var(--container-content)] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 text-white/85">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide transition-colors hover:text-white"
              >
                <HelpCircle size={12} /> Help centre
              </Link>
              <span className="h-3 w-px bg-white/20" />
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide transition-colors hover:text-white"
              >
                <Package size={12} /> Track order
              </Link>
              <span className="hidden h-3 w-px bg-white/20 sm:inline-block" />
              <Link
                href="/contact"
                className="hidden items-center gap-1.5 text-[11px] font-medium tracking-wide transition-colors hover:text-white sm:inline-flex"
              >
                <MapPin size={12} /> Store & stock
              </Link>
            </div>

            {/* Center — rotating shipping / promo message */}
            <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[11px] font-medium tracking-wide text-white/85 md:inline-flex">
              <AnimatePresence mode="wait">
                <motion.span
                  key={promoIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex items-center gap-1.5"
                >
                  {(() => {
                    const P = ROTATING_PROMOS[promoIdx];
                    return (
                      <>
                        <P.icon size={12} className="text-[color:var(--color-primary)]" />
                        <span>{P.text}</span>
                      </>
                    );
                  })()}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 text-white">
              <ThemeToggle />
              <span className="hidden h-3 w-px bg-white/20 sm:inline-block" />
              <CurrencySwitcher />
              <span className="hidden h-3 w-px bg-white/20 sm:inline-block" />
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 sm:inline">
                {localeLabel} · {currency} {symbol}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tier 2 · Main bar (logo · search · account/compare/wishlist/cart) ── */}
        <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]">
          <div className="mx-auto flex max-w-[var(--container-content)] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 text-[color:var(--color-text)]"
              aria-label="Electreia"
            >
              <ElectreiaLogo size={scrolled ? 22 : 26} />
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)] lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* High-intent search with scope dropdown */}
            <div
              ref={searchDismissRef}
              className="relative hidden min-w-0 flex-1 lg:block"
            >
              <form
                onSubmit={handleSearch}
                className={[
                  "relative flex h-11 min-w-0 items-stretch overflow-hidden rounded-xl border bg-[color:var(--color-bg-elevated)] transition-all",
                  searchFocus
                    ? "border-[color:var(--color-primary)] shadow-[0_0_0_4px_var(--color-primary-tint)]"
                    : "border-[color:var(--color-line)]",
                ].join(" ")}
              >
                {/* Scope selector */}
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={scopeOpen}
                    onClick={() => setScopeOpen((v) => !v)}
                    className="inline-flex h-full items-center gap-1.5 border-r border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text)]"
                  >
                    <LayoutGrid size={13} className="text-[color:var(--color-primary)]" />
                    <span className="max-w-[110px] truncate">
                      {SEARCH_SCOPES.find((s) => s.value === scope)?.label}
                    </span>
                    <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {scopeOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        role="listbox"
                        className="absolute left-0 top-full z-30 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] py-1 shadow-lg"
                      >
                        {SEARCH_SCOPES.map((s) => (
                          <li key={s.value}>
                            <button
                              type="button"
                              onClick={() => {
                                setScope(s.value);
                                setScopeOpen(false);
                              }}
                              role="option"
                              aria-selected={scope === s.value}
                              className={[
                                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                                scope === s.value
                                  ? "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]"
                                  : "text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]",
                              ].join(" ")}
                            >
                              {s.label}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  type="text"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:outline-none"
                  placeholder="Search laptops, headphones, drones, cameras…"
                  value={searchQuery}
                  onFocus={() => setSearchFocus(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="inline-flex items-center gap-1.5 bg-[color:var(--color-primary)] px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[color:var(--color-primary-hover)] hover:shadow-[0_0_20px_var(--color-primary-tint)]"
                >
                  <Search size={14} /> Search
                </button>
              </form>

              {/* Suggestions dropdown */}
              <AnimatePresence>
                {searchFocus && (recentSearches.length > 0 || searchQuery.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-2 shadow-lg"
                    role="listbox"
                  >
                    {recentSearches.length > 0 && (
                      <div className="mb-1">
                        <div className="px-2 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                          Recent searches
                        </div>
                        {recentSearches.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchQuery(q);
                              router.push(`/en/search?q=${encodeURIComponent(q)}`);
                              setSearchFocus(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                          >
                            <Search size={13} className="text-[color:var(--color-text-tertiary)]" />
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="px-2 pb-1 pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                      Popular departments
                    </div>
                    {DEPARTMENTS.slice(0, 6).map((d) => (
                      <Link
                        key={d.slug}
                        href={`/catalog/${d.slug}`}
                        onClick={() => setSearchFocus(false)}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <d.Icon size={14} className="text-[color:var(--color-primary)]" />
                          {d.name}
                        </span>
                        <ArrowRight size={12} className="text-[color:var(--color-text-tertiary)]" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right cluster — Account · Compare · Wishlist · Cart */}
            <div className="hidden items-center gap-1 lg:flex">
              {/* Account */}
              <div
                ref={accountDismissRef}
                className="relative"
                onMouseEnter={() => setAccountOpen(true)}
                onMouseLeave={() => setAccountOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-text)]"
                >
                  <UserIcon size={18} />
                  <span className="hidden text-left leading-tight xl:inline-flex xl:flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                      {user ? "Signed in" : "Hello"}
                    </span>
                    <span className="text-xs font-semibold text-[color:var(--color-text)]">
                      {user ? "Account" : "Sign in"}
                    </span>
                  </span>
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      role="menu"
                      className="absolute right-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-2 shadow-lg"
                    >
                      {!user ? (
                        <>
                          <Link
                            href="/auth/login"
                            role="menuitem"
                            className="flex items-center justify-center rounded-lg bg-[color:var(--color-primary)] px-3 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[color:var(--color-primary-hover)]"
                          >
                            Sign in
                          </Link>
                          <Link
                            href="/auth/register"
                            role="menuitem"
                            className="mt-1 flex items-center justify-center rounded-lg border border-[color:var(--color-line)] px-3 py-2 text-center text-xs font-semibold text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                          >
                            Create account
                          </Link>
                          <div className="my-2 h-px bg-[color:var(--color-line)]" />
                        </>
                      ) : (
                        <div className="mb-2 rounded-lg bg-[color:var(--color-bg-secondary)] p-3">
                          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                            Signed in as
                          </div>
                          <div className="mt-0.5 truncate text-sm font-semibold text-[color:var(--color-text)]">
                            {user.email}
                          </div>
                        </div>
                      )}
                      {[
                        { href: "/account", icon: UserIcon, label: "My account" },
                        { href: "/account/orders", icon: Package, label: "Orders" },
                        { href: "/account/wishlist", icon: Heart, label: "Wishlist" },
                        { href: "/account/orders", icon: Bell, label: "Alerts" },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          role="menuitem"
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-bg-secondary)]"
                        >
                          <item.icon size={14} className="text-[color:var(--color-primary)]" />
                          {item.label}
                        </Link>
                      ))}
                      {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
                        <NextLink
                          href="/admin"
                          role="menuitem"
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-bg-secondary)]"
                        >
                          <Shield size={14} className="text-[color:var(--color-primary)]" />
                          Admin panel
                        </NextLink>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Compare */}
              <Link
                href="/account/wishlist"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-text)]"
                aria-label="Compare"
              >
                <GitCompare size={18} />
                <span className="hidden text-left leading-tight xl:inline-flex xl:flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                    Compare
                  </span>
                  <span className="text-xs font-semibold text-[color:var(--color-text)]">
                    0 items
                  </span>
                </span>
              </Link>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-text)]"
                aria-label="Wishlist"
              >
                <Heart size={18} />
                <span className="hidden text-left leading-tight xl:inline-flex xl:flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                    Wishlist
                  </span>
                  <span className="text-xs font-semibold text-[color:var(--color-text)]">
                    Saved
                  </span>
                </span>
              </Link>

              {/* Cart with mini-cart hover */}
              <div
                ref={cartDismissRef}
                className="relative"
                onMouseEnter={() => setMiniCartOpen(true)}
                onMouseLeave={() => setMiniCartOpen(false)}
              >
                <Link
                  href="/cart"
                  className="relative inline-flex h-10 items-center gap-2 rounded-lg bg-[color:var(--color-primary)] px-3 text-white transition-all hover:bg-[color:var(--color-primary-hover)] hover:shadow-[0_0_20px_var(--color-primary-tint)]"
                  aria-label={t("cart")}
                >
                  <div className="relative">
                    <ShoppingCart size={18} />
                    {itemCount > 0 && (
                      <motion.span
                        key={cartBounce}
                        initial={cartBounce > 0 ? { scale: 0.5 } : false}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 400 }}
                        className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 font-mono text-[9px] font-bold text-[color:var(--color-primary)]"
                      >
                        {itemCount > 99 ? "99+" : itemCount}
                      </motion.span>
                    )}
                  </div>
                  <span className="hidden text-left leading-tight xl:inline-flex xl:flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/70">
                      Basket
                    </span>
                    <span className="font-mono text-xs font-semibold tabular-nums">
                      £{subtotal.toFixed(2)}
                    </span>
                  </span>
                </Link>

                <AnimatePresence>
                  {miniCartOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-30 mt-1 w-80 overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between pb-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                          Basket · {itemCount} item{itemCount === 1 ? "" : "s"}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[color:var(--color-text)]">
                          £{subtotal.toFixed(2)}
                        </span>
                      </div>
                      {items.length === 0 ? (
                        <div className="py-6 text-center text-sm text-[color:var(--color-text-tertiary)]">
                          Your basket is empty
                        </div>
                      ) : (
                        <>
                          <ul className="max-h-72 space-y-2 overflow-y-auto">
                            {items.slice(0, 4).map((it) => (
                              <li
                                key={it.productId}
                                className="flex items-center gap-3 rounded-lg border border-[color:var(--color-line)] p-2"
                              >
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[color:var(--color-bg-secondary)]">
                                  {it.imageUrl && (
                                    <Image
                                      src={it.imageUrl}
                                      alt={it.name}
                                      fill
                                      sizes="48px"
                                      className="object-contain p-1"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-xs font-medium text-[color:var(--color-text)]">
                                    {it.name}
                                  </div>
                                  <div className="mt-0.5 font-mono text-[11px] text-[color:var(--color-text-tertiary)] tabular-nums">
                                    {it.quantity} × £{it.price.toFixed(2)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(it.productId)}
                                  aria-label="Remove item"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--color-text-tertiary)] hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-danger)]"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </li>
                            ))}
                          </ul>
                          {items.length > 4 && (
                            <div className="pt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-tertiary)]">
                              + {items.length - 4} more
                            </div>
                          )}
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link
                              href="/cart"
                              className="inline-flex items-center justify-center rounded-lg border border-[color:var(--color-line)] px-2 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                            >
                              View basket
                            </Link>
                            <Link
                              href="/checkout"
                              className="inline-flex items-center justify-center rounded-lg bg-[color:var(--color-primary)] px-2 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[color:var(--color-primary-hover)]"
                            >
                              Checkout
                            </Link>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile search row */}
          <div className="border-t border-[color:var(--color-line)] px-4 py-2 lg:hidden">
            <form
              className="flex items-center rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] pl-3 pr-1"
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
                className="inline-flex h-8 items-center justify-center rounded-lg bg-[color:var(--color-primary)] px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* ── Tier 3 · Persistent primary nav — All Categories + departments ── */}
        <div
          ref={megaDismissRef}
          className="hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)] lg:block"
          onMouseLeave={closeMegaSoon}
        >
          <div className="mx-auto flex h-11 max-w-[var(--container-content)] items-center gap-1 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMegaOpen((v) => !v)}
              onMouseEnter={openMega}
              aria-expanded={megaOpen}
              aria-haspopup="true"
              className={[
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-all",
                megaOpen
                  ? "bg-[color:var(--color-primary)] text-white shadow-[0_0_16px_var(--color-primary-tint)]"
                  : "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white",
              ].join(" ")}
            >
              <LayoutGrid size={13} />
              Shop by department
              <ChevronDown
                size={11}
                className={`transition-transform ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>

            {DEPARTMENTS.map((d) => (
              <button
                key={d.slug}
                type="button"
                onMouseEnter={() => {
                  openMega();
                  setActiveDept(d.slug);
                }}
                onClick={() => {
                  router.push(`/en/catalog/${d.slug}`);
                }}
                className={[
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-colors",
                  activeDept === d.slug && megaOpen
                    ? "bg-[color:var(--color-bg-secondary)] text-[color:var(--color-primary)]"
                    : "text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]",
                ].join(" ")}
              >
                <d.Icon size={13} className="text-[color:var(--color-primary)]" />
                {d.short}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
              <Link
                href="/catalog?onSale=true"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[color:var(--color-danger)] transition-colors hover:bg-[color:var(--color-danger-tint)]"
              >
                <Zap size={12} /> Deals
              </Link>
              <Link
                href="/catalog?sort=newest"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[color:var(--color-primary)] transition-colors hover:bg-[color:var(--color-primary-tint)]"
              >
                <Sparkles size={12} /> New in
              </Link>
            </div>
          </div>

          {/* Mega-menu panel */}
          <AnimatePresence>
            {megaOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-x-0 top-full z-30 border-t border-[color:var(--color-line)] bg-[color:var(--color-bg)]/95 backdrop-blur-xl shadow-[0_20px_50px_-24px_rgba(14,17,22,0.35)]"
                onMouseEnter={openMega}
                onMouseLeave={closeMegaSoon}
                role="dialog"
                aria-label="Shop by department"
              >
                <div className="mx-auto grid max-w-[var(--container-content)] grid-cols-[220px_1fr_260px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
                  {/* Rail — departments list */}
                  <nav
                    aria-label="Departments"
                    className="flex flex-col gap-1 border-r border-[color:var(--color-line)] pr-2"
                  >
                    {DEPARTMENTS.map((d) => (
                      <button
                        key={d.slug}
                        type="button"
                        onMouseEnter={() => setActiveDept(d.slug)}
                        onClick={() => router.push(`/en/catalog/${d.slug}`)}
                        className={[
                          "group flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                          activeDept === d.slug
                            ? "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]"
                            : "text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]",
                        ].join(" ")}
                      >
                        <span className="inline-flex items-center gap-2">
                          <d.Icon size={14} className="text-[color:var(--color-primary)]" />
                          <span className="font-medium">{d.short}</span>
                        </span>
                        <ChevronRight
                          size={12}
                          className={`transition-transform ${activeDept === d.slug ? "translate-x-0.5" : ""}`}
                        />
                      </button>
                    ))}
                  </nav>

                  {/* Center — sub-categories from live DB + featured */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-baseline justify-between">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)]">
                          Department
                        </span>
                        <Link
                          href={`/catalog/${activeDeptData.slug}`}
                          className="font-display text-lg font-semibold text-[color:var(--color-text)] hover:text-[color:var(--color-primary)]"
                        >
                          {activeDeptData.name}
                        </Link>
                        <span className="mt-0.5 text-xs text-[color:var(--color-text-tertiary)]">
                          {activeDeptData.tagline}
                        </span>
                      </div>
                      {activeDeptLive?._count && (
                        <span className="font-mono text-[11px] text-[color:var(--color-text-tertiary)] tabular-nums">
                          {activeDeptLive._count.products.toLocaleString()} products
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {activeDeptLive?.children?.length ? (
                        activeDeptLive.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/catalog/${sub.slug}`}
                            className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)]"
                          >
                            <span>{sub.name}</span>
                            <span className="font-mono text-[10px] text-[color:var(--color-text-tertiary)] tabular-nums">
                              {sub._count?.products ?? 0}
                            </span>
                          </Link>
                        ))
                      ) : (
                        activeDeptData.featured.map((f) => (
                          <Link
                            key={f.slug + f.label}
                            href={`/catalog/${f.slug}`}
                            className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-primary)]"
                          >
                            <span>{f.label}</span>
                            <ChevronRight
                              size={11}
                              className="opacity-0 group-hover:opacity-100"
                            />
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 border-t border-[color:var(--color-line)] pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)]">
                        Featured brands
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {["Apple", "Samsung", "LG", "HP", "Lenovo", "Sony"].map((b) => (
                          <Link
                            key={b}
                            href={`/search?q=${encodeURIComponent(b)}`}
                            className="inline-flex items-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                          >
                            {b}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right — promo tile */}
                  <Link
                    href={activeDeptData.promo.href}
                    className="group relative flex flex-col justify-end overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-violet)] p-5 text-white"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 tech-grid opacity-30"
                    />
                    <span className="relative z-10 mb-2 inline-flex w-fit items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur">
                      {activeDeptData.promo.badge}
                    </span>
                    <div className="relative z-10 font-display text-lg font-semibold leading-tight">
                      {activeDeptData.promo.title}
                    </div>
                    <div className="relative z-10 mt-1 text-xs text-white/80">
                      {activeDeptData.promo.subtitle}
                    </div>
                    <div className="relative z-10 mt-4 inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-transform group-hover:translate-x-0.5">
                      Shop now <ArrowRight size={12} />
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-[color:var(--color-text)]/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-[92%] max-w-sm flex-col bg-[color:var(--color-bg)] shadow-xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-5 py-4">
                <ElectreiaLogo size={20} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-secondary)]"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                {/* Departments accordion */}
                <div className="mb-4">
                  <div className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)]">
                    Shop by department
                  </div>
                  {DEPARTMENTS.map((d) => {
                    const live = findLiveDept(d.slug);
                    const isOpen = mobileAcc === d.slug;
                    return (
                      <div
                        key={d.slug}
                        className="border-b border-[color:var(--color-line)]"
                      >
                        <button
                          type="button"
                          onClick={() => setMobileAcc(isOpen ? null : d.slug)}
                          className="flex w-full items-center justify-between gap-3 px-2 py-3 text-left text-sm font-medium text-[color:var(--color-text)]"
                          aria-expanded={isOpen}
                        >
                          <span className="inline-flex items-center gap-3">
                            <d.Icon size={16} className="text-[color:var(--color-primary)]" />
                            {d.name}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`text-[color:var(--color-text-tertiary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-1 py-2 pl-9 pr-2">
                                <Link
                                  href={`/catalog/${d.slug}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="rounded-md px-2 py-1.5 text-sm font-semibold text-[color:var(--color-primary)]"
                                >
                                  Shop all {d.short}
                                </Link>
                                {(live?.children ?? []).map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/catalog/${sub.slug}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                                  >
                                    {sub.name}
                                    <span className="font-mono text-[10px] text-[color:var(--color-text-tertiary)] tabular-nums">
                                      {sub._count?.products ?? 0}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Utility links */}
                <div className="mb-4 flex flex-col gap-1">
                  <div className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-tertiary)]">
                    Quick links
                  </div>
                  {[
                    { href: "/catalog?onSale=true", label: "Deals & clearance", icon: Zap },
                    { href: "/catalog?sort=newest", label: "New arrivals", icon: Sparkles },
                    { href: "/account/orders", label: "Track order", icon: Package },
                    { href: "/contact", label: "Help centre", icon: HelpCircle },
                    { href: "/contact", label: "Store & stock", icon: MapPin },
                  ].map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
                    >
                      <l.icon size={14} className="text-[color:var(--color-primary)]" />
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer of the drawer — account CTAs */}
              <div className="border-t border-[color:var(--color-line)] px-5 py-4">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-lg bg-[color:var(--color-primary)] text-sm font-semibold text-white"
                    >
                      My account
                    </Link>
                    {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                      <NextLink
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex h-11 items-center justify-center rounded-lg border border-[color:var(--color-line)] text-sm font-semibold text-[color:var(--color-text)]"
                      >
                        Admin panel
                      </NextLink>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-lg bg-[color:var(--color-primary)] text-sm font-semibold text-white"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-[color:var(--color-primary)] text-sm font-semibold text-[color:var(--color-primary)]"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
