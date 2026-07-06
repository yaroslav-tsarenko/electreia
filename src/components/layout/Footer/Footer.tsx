"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  FaLinkedinIn,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaFacebookF,
  FaTiktok,
} from "react-icons/fa6";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Truck,
  RotateCcw,
  ShieldCheck,
  Globe,
  Repeat,
  Award,
  Lock,
  Star,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import { ElectreiaLogo } from "../ElectreiaLogo";
import { brand } from "@/lib/brand";
import visaLogo from "@/assets/visa-logo.svg";
import mastercardLogo from "@/assets/mastercard-logo.svg";
import pciDssLogo from "@/assets/pci-dss-compliant-logo-vector.svg";

/**
 * Utility mega-footer — 4 tiers (very different structure from a simple
 * multi-column footer):
 *
 *   Tier A · Conversion band (newsletter + trade-in / app CTA)
 *   Tier B · Wide multi-column link grid (5 columns)
 *   Tier C · Trust & reassurance row (payment, PCI, warranty, Trustpilot, social)
 *   Tier D · Bottom legal bar (copyright · reg. company · country/currency · legal)
 */

const departments = [
  { href: "/catalog/audio-headphones",    label: "Audio & Headphones" },
  { href: "/catalog/laptops-computers",   label: "Laptops & Computers" },
  { href: "/catalog/smartphones-tablets", label: "Smartphones & Tablets" },
  { href: "/catalog/displays-monitors",   label: "Displays & Monitors" },
  { href: "/catalog/gaming-consoles",     label: "Gaming & Consoles" },
  { href: "/catalog/peripherals",         label: "Peripherals" },
  { href: "/catalog/cameras-drones",      label: "Cameras & Drones" },
  { href: "/catalog/printers-office",     label: "Printers & Office" },
];

const dealsLinks = [
  { href: "/catalog?onSale=true",       label: "All deals" },
  { href: "/catalog?onSale=true",       label: "Clearance" },
  { href: "/catalog?sort=newest",       label: "New arrivals" },
  { href: "/catalog?onSale=true",       label: "Weekly deal" },
  { href: "/contact",                   label: "Trade-in offers" },
  { href: "/contact",                   label: "0% finance" },
  { href: "/contact",                   label: "Bundles" },
];

const serviceLinks = [
  { href: "/contact",                   label: "Contact us" },
  { href: "/account/orders",            label: "Track order" },
  { href: "/policies/returns",          label: "Returns & refunds" },
  { href: "/policies/warranty",         label: "Warranty" },
  { href: "/policies/shipping",         label: "Delivery info" },
  { href: "/policies/payment",          label: "Payment options" },
  { href: "/faq",                       label: "FAQ" },
];

const companyLinks = [
  { href: "/about",                     label: "About Electreia" },
  { href: "/contact",                   label: "Careers" },
  { href: "/contact",                   label: "Press" },
  { href: "/policies",                  label: "Sustainability" },
  { href: "/contact",                   label: "Affiliates" },
  { href: "/contact",                   label: "For business" },
  { href: "/policies",                  label: "Policies" },
];

const helpLegalLinks = [
  { href: "/policies/privacy",          label: "Privacy centre" },
  { href: "/policies/terms",            label: "Terms & conditions" },
  { href: "/policies/cookies",          label: "Cookie preferences" },
  { href: "/policies",                  label: "Modern Slavery" },
  { href: "/policies",                  label: "Accessibility" },
  { href: "/policies",                  label: "WEEE recycling" },
];

const legalLinks = [
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms",   label: "Terms" },
  { href: "/policies/cookies", label: "Cookies" },
];

const trustBadges = [
  { icon: Truck,       label: "Free UK delivery over £100" },
  { icon: RotateCcw,   label: "30-day returns" },
  { icon: ShieldCheck, label: "2-year warranty" },
  { icon: Repeat,      label: "Trade-in credit" },
];

const socialLinks = [
  { icon: FaLinkedinIn, label: "LinkedIn",  env: process.env.NEXT_PUBLIC_LINKEDIN_URL },
  { icon: FaInstagram,  label: "Instagram", env: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
  { icon: FaXTwitter,   label: "X",         env: process.env.NEXT_PUBLIC_TWITTER_URL },
  { icon: FaFacebookF,  label: "Facebook",  env: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  { icon: FaYoutube,    label: "YouTube",   env: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  { icon: FaTiktok,     label: "TikTok",    env: process.env.NEXT_PUBLIC_TIKTOK_URL },
];

interface Column {
  key: string;
  title: string;
  items: Array<{ href: string; label: string }>;
}

const linkColumns: Column[] = [
  { key: "shop",     title: "Shop by department",  items: departments },
  { key: "deals",    title: "Deals & clearance",   items: dealsLinks },
  { key: "service",  title: "Customer service",    items: serviceLinks },
  { key: "company",  title: "About & company",     items: companyLinks },
  { key: "help",     title: "Help & legal",        items: helpLegalLinks },
];

function AccordionColumn({ col }: { col: Column }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#232A36] md:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left md:hidden"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#EDF1F5]/85">
          {col.title}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#8A94A6] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <h3 className="hidden pb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#EDF1F5]/85 md:block">
        {col.title}
      </h3>
      <ul
        className={`space-y-2.5 pb-4 md:block ${open ? "block" : "hidden"}`}
        aria-hidden={!open}
      >
        {col.items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              className="text-sm text-[#EDF1F5]/70 transition-colors hover:text-[color:var(--color-primary)]"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer
      className="mt-auto relative bg-[#0B0E14] text-[#EDF1F5]"
      role="contentinfo"
    >
      {/* Top accent glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-primary)] to-transparent opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 tech-grid opacity-20"
      />

      {/* ── Tier A · Conversion band ──────────────────────────────────── */}
      <div className="relative border-b border-[#232A36]">
        <div className="mx-auto grid max-w-[var(--container-content)] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
          {/* Newsletter */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#232A36] bg-[#141821]/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-primary)]/15 text-[color:var(--color-primary)]">
                <Mail size={16} />
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A94A6]">
                  Electreia Signal
                </span>
                <span className="font-display text-lg font-semibold text-[#EDF1F5]">
                  Deals, drops & specs — direct to your inbox
                </span>
              </div>
            </div>
            <p className="text-sm text-[#8A94A6]">
              Weekly technical picks, restock alerts and members-only pricing.
              One click to unsubscribe.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email) return;
                try {
                  await fetch("/api/newsletter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                } catch {
                  /* silent */
                }
                setSubscribed(true);
                setEmail("");
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@electreia.co.uk"
                className="min-w-0 flex-1 rounded-xl border border-[#232A36] bg-[#0B0E14] px-4 py-2.5 font-mono text-sm text-[#EDF1F5] placeholder:text-[#5A6478] transition-colors focus:border-[color:var(--color-primary)] focus:outline-none focus:shadow-[0_0_0_4px_rgba(46,125,255,0.15)]"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[color:var(--color-primary-hover)] hover:shadow-[0_0_20px_var(--color-primary-tint)]"
              >
                Subscribe <ArrowRight size={13} />
              </button>
            </form>
            {subscribed && (
              <p className="flex items-center gap-2 font-mono text-xs text-[color:var(--color-success)]">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)] shadow-[0_0_8px_rgba(62,213,152,0.65)]"
                />
                Signal locked — welcome aboard.
              </p>
            )}
          </div>

          {/* Trade-in / App download callout */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4 xl:grid-cols-2">
            <Link
              href="/contact"
              className="group flex flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-[#232A36] bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-violet)] p-6 text-white transition-all hover:shadow-[0_10px_28px_-8px_rgba(46,125,255,0.4)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 tech-grid opacity-25"
              />
              <div className="relative z-10 flex items-center gap-2">
                <Repeat size={16} className="text-white/85" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/85">
                  Trade-in
                </span>
              </div>
              <div className="relative z-10">
                <div className="font-display text-lg font-semibold leading-tight">
                  Level up your kit — up to £700 credit
                </div>
                <p className="mt-1 text-xs text-white/80">
                  Send us your old device, we&apos;ll assess and credit.
                </p>
              </div>
              <div className="relative z-10 inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-transform group-hover:translate-x-0.5">
                Start trade-in <ArrowRight size={12} />
              </div>
            </Link>
            <div className="flex flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-[#232A36] bg-[#141821] p-6">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-[color:var(--color-primary)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A94A6]">
                  App
                </span>
              </div>
              <div>
                <div className="font-display text-lg font-semibold leading-tight text-[#EDF1F5]">
                  Electreia app — early drops
                </div>
                <p className="mt-1 text-xs text-[#8A94A6]">
                  Get restock alerts before they hit the web.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex flex-1 items-center justify-center rounded-lg border border-[#232A36] bg-[#0B0E14] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#EDF1F5]/80">
                  App Store
                </span>
                <span className="inline-flex flex-1 items-center justify-center rounded-lg border border-[#232A36] bg-[#0B0E14] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#EDF1F5]/80">
                  Google Play
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier B · Wide multi-column link grid ──────────────────────── */}
      <div className="relative border-b border-[#232A36]">
        <div className="mx-auto grid max-w-[var(--container-content)] gap-x-8 gap-y-0 px-4 py-10 sm:px-6 md:grid-cols-3 lg:grid-cols-5 lg:gap-y-4 lg:px-8">
          {linkColumns.map((col) => (
            <AccordionColumn key={col.key} col={col} />
          ))}
        </div>
      </div>

      {/* ── Tier C · Trust & reassurance row ──────────────────────────── */}
      <div className="relative border-b border-[#232A36]">
        <div className="mx-auto flex max-w-[var(--container-content)] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8">
          {/* Brand + trust badges */}
          <div className="flex flex-col gap-4 lg:max-w-md">
            <Link href="/" aria-label="Electreia" className="text-[#EDF1F5]">
              <ElectreiaLogo size={22} />
            </Link>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#232A36] bg-[#141821]/60 px-2.5 py-2 text-xs text-[#EDF1F5]/80"
                >
                  <Icon size={13} className="text-[color:var(--color-primary)]" />
                  <span className="line-clamp-1">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment / security / rating */}
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap items-center gap-3">
              {[
                { src: visaLogo, alt: "Visa" },
                { src: mastercardLogo, alt: "Mastercard" },
                { src: pciDssLogo, alt: "PCI DSS Compliant" },
              ].map(({ src, alt }) => (
                <span
                  key={alt}
                  className="inline-flex h-8 items-center rounded-md border border-[#232A36] bg-[#141821] px-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src.src}
                    alt={alt}
                    style={{
                      height: 18,
                      width: "auto",
                      maxWidth: "none",
                      display: "inline-block",
                      filter: "grayscale(0.2) brightness(1.1)",
                    }}
                    className="shrink-0"
                  />
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#232A36] bg-[#141821] px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#EDF1F5]/85">
                <Lock size={11} className="text-[color:var(--color-success)]" />
                256-bit SSL
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#232A36] bg-[#141821] px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#EDF1F5]/85">
                <Award size={11} className="text-[color:var(--color-warning)]" />
                Buyer Protection
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-md border border-[#232A36] bg-[#141821] px-3 py-1.5">
                <div className="flex items-center gap-0.5 text-[color:var(--color-warning)]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={11} className="fill-current" strokeWidth={0} />
                  ))}
                </div>
                <span className="font-mono text-[11px] font-semibold text-[#EDF1F5] tabular-nums">
                  4.9
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A94A6]">
                  Trustpilot · 12,400 reviews
                </span>
              </div>
              <div className="flex items-center gap-1">
                {socialLinks
                  .filter((s) => s.env)
                  .map(({ icon: Icon, label, env }) => (
                    <a
                      key={label}
                      href={env}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#232A36] bg-[#141821] text-[#8A94A6] transition-all hover:border-[color:var(--color-primary)] hover:text-[#EDF1F5] hover:shadow-[0_0_16px_rgba(46,125,255,0.35)]"
                    >
                      <Icon size={11} />
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier D · Bottom legal bar ─────────────────────────────────── */}
      <div className="relative">
        <div className="mx-auto flex max-w-[var(--container-content)] flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex flex-col gap-1 text-xs text-[#8A94A6]">
            <p>{t("copyright", { year: currentYear, storeName: brand.displayName })}</p>
            <p className="font-mono text-[11px] tracking-wide">
              {brand.company.legalName} · Company No. {brand.company.number} ·{" "}
              {brand.company.address.line1}, {brand.company.address.line2},{" "}
              {brand.company.address.city}, {brand.company.address.postcode},{" "}
              {brand.company.address.country}
            </p>
            <p className="flex flex-wrap items-center gap-2 text-[11px] text-[#5A6478]">
              <a
                href={`mailto:${brand.contact.email}`}
                className="inline-flex items-center gap-1 transition-colors hover:text-[color:var(--color-primary)]"
              >
                <Mail size={10} /> {brand.contact.email}
              </a>
              <span aria-hidden>·</span>
              <a
                href={brand.contact.phoneHref}
                className="inline-flex items-center gap-1 transition-colors hover:text-[color:var(--color-primary)]"
              >
                <Phone size={10} /> {brand.contact.phone}
              </a>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={10} /> {brand.company.address.city}, UK
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#232A36] bg-[#141821] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A94A6]">
              <Globe size={11} className="text-[color:var(--color-primary)]" />
              <span>United Kingdom · English · GBP £</span>
            </div>
            <nav
              aria-label="Legal"
              className="flex flex-wrap items-center gap-3"
            >
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-[#8A94A6] transition-colors hover:text-[color:var(--color-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
