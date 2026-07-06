"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { FaLinkedinIn, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Truck,
  RotateCcw,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { ElectreiaLogo } from "../ElectreiaLogo";
import { brand, brandAddressLine } from "@/lib/brand";
import visaLogo from "@/assets/visa-logo.svg";
import mastercardLogo from "@/assets/mastercard-logo.svg";
import pciDssLogo from "@/assets/pci-dss-compliant-logo-vector.svg";

const shopLinks = [
  { href: "/catalog", label: "All products" },
  { href: "/catalog/audio", label: "Audio" },
  { href: "/catalog/laptops", label: "Laptops" },
  { href: "/catalog/smart-home", label: "Smart home" },
  { href: "/catalog/accessories", label: "Accessories" },
  { href: "/catalog?sort=newest", label: "New arrivals" },
  { href: "/catalog?onSale=true", label: "Sale" },
];

const serviceLinks = [
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/returns", label: "Returns" },
  { href: "/policies/warranty", label: "Warranty" },
  { href: "/policies/payment", label: "Payment" },
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const companyLinks = [
  { href: "/about", label: "About Electreia" },
  { href: "/policies", label: "Policies" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
  { href: "/policies/cookies", label: "Cookies" },
];

const trustBadges = [
  { icon: Truck, label: "Free UK shipping over £100" },
  { icon: RotateCcw, label: "14-day returns" },
  { icon: ShieldCheck, label: "2-year manufacturer warranty" },
];

export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="mt-auto relative bg-[#0B0E14] text-[#EDF1F5]">
      {/* thin top accent glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2E7DFF] to-transparent opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 tech-grid opacity-30"
      />

      <div className="relative mx-auto max-w-[var(--container-content)] px-4 pt-16 sm:px-6 lg:px-8">
        {/* Trust strip */}
        <div className="grid gap-4 border-b border-[#232A36] pb-10 sm:grid-cols-3">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="group flex items-center gap-3 rounded-xl border border-[#232A36] bg-[#141821]/60 px-4 py-3 backdrop-blur-sm transition-colors hover:border-[#2E7DFF]/40"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#232A36] bg-[#0B0E14] text-[#2E7DFF] transition-colors group-hover:border-[#2E7DFF]/50 group-hover:shadow-[0_0_20px_rgba(46,125,255,0.35)]">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <span className="text-sm font-medium text-[#EDF1F5]/90">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Main columns */}
        <div className="grid gap-10 py-14 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="flex flex-col gap-2 text-[#EDF1F5]"
              aria-label="Electreia"
            >
              <ElectreiaLogo size={28} />
              <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[#8A94A6]">
                est. 2026 · United Kingdom
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#8A94A6]">
              Precision-engineered electronics — audio, laptops, and smart
              devices — hand-picked for spec, shipped from the United Kingdom.
            </p>

            <div className="mt-6 flex flex-col gap-2 text-sm text-[#8A94A6]">
              <a
                href={`mailto:${brand.contact.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-[#EDF1F5]"
              >
                <Mail size={14} className="text-[#2E7DFF]" />{" "}
                <span className="font-mono">{brand.contact.email}</span>
              </a>
              <a
                href={brand.contact.phoneHref}
                className="inline-flex items-center gap-2 transition-colors hover:text-[#EDF1F5]"
              >
                <Phone size={14} className="text-[#2E7DFF]" />{" "}
                <span className="font-mono">{brand.contact.phone}</span>
              </a>
              <span className="inline-flex items-start gap-2 text-[#8A94A6]">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#2E7DFF]" />
                <span className="leading-relaxed">{brandAddressLine}</span>
              </span>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {[
                {
                  href: process.env.NEXT_PUBLIC_LINKEDIN_URL,
                  icon: FaLinkedinIn,
                  label: "LinkedIn",
                },
                {
                  href: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
                  icon: FaInstagram,
                  label: "Instagram",
                },
                {
                  href: process.env.NEXT_PUBLIC_TWITTER_URL,
                  icon: FaXTwitter,
                  label: "X",
                },
                {
                  href: process.env.NEXT_PUBLIC_YOUTUBE_URL,
                  icon: FaYoutube,
                  label: "YouTube",
                },
              ]
                .filter((s) => s.href)
                .map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#232A36] bg-[#141821] text-[#8A94A6] transition-all hover:border-[#2E7DFF]/60 hover:text-[#EDF1F5] hover:shadow-[0_0_16px_rgba(46,125,255,0.35)]"
                  >
                    <Icon size={13} />
                  </a>
                ))}
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A94A6]">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#EDF1F5]/80 transition-colors hover:text-[#2E7DFF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div className="lg:col-span-2">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A94A6]">
              Service
            </h3>
            <ul className="mt-4 space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#EDF1F5]/80 transition-colors hover:text-[#2E7DFF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-1">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A94A6]">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#EDF1F5]/80 transition-colors hover:text-[#2E7DFF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A94A6]">
              Electreia Signal
            </h3>
            <p className="mt-4 text-sm text-[#8A94A6]">
              Occasional dispatches on drops, restocks and technical deep-dives.
              Zero noise.
            </p>
            <form
              className="mt-4"
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
            >
              <div className="group flex overflow-hidden rounded-xl border border-[#232A36] bg-[#141821] transition-colors focus-within:border-[#2E7DFF]/60 focus-within:shadow-[0_0_0_4px_rgba(46,125,255,0.12)]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@electreia.co.uk"
                  className="min-w-0 flex-1 bg-transparent px-4 py-2.5 font-mono text-sm text-[#EDF1F5] placeholder:text-[#5A6478] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="inline-flex items-center gap-1.5 bg-[#2E7DFF] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[#1E68E6] hover:shadow-[0_0_20px_rgba(46,125,255,0.55)]"
                >
                  Subscribe <ArrowRight size={13} />
                </button>
              </div>
              {subscribed && (
                <p className="mt-2 flex items-center gap-2 font-mono text-xs text-[#3ED598]">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[#3ED598] shadow-[0_0_8px_rgba(62,213,152,0.65)]"
                  />
                  Signal locked — welcome aboard.
                </p>
              )}
            </form>

            {/* Language / currency selector */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#232A36] bg-[#141821] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#8A94A6]">
              <Globe size={12} className="text-[#2E7DFF]" />
              <span>EN · GBP</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-6 border-t border-[#232A36] py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1 text-xs text-[#8A94A6]">
            <p>{t("copyright", { year: currentYear, storeName: brand.displayName })}</p>
            <p className="font-mono text-[11px] tracking-wide">
              {brand.company.legalName} · Company No. {brand.company.number} ·{" "}
              {brand.company.address.city}, {brand.company.address.country}
            </p>
          </div>

          <div className="flex items-center gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-[#8A94A6] transition-colors hover:text-[#2E7DFF]"
              >
                {link.label}
              </Link>
            ))}
          </div>

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
                    height: 20,
                    width: "auto",
                    maxWidth: "none",
                    display: "inline-block",
                    filter: "grayscale(0.2) brightness(1.1)",
                  }}
                  className="shrink-0"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
