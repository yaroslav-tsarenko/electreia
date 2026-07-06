"use client";

import { useRef } from "react";
import { Link } from "@/i18n/routing";
import { motion, useInView } from "framer-motion";
import { Building2, Home, Factory, Lightbulb, ShieldCheck, Wrench, ArrowRight } from "lucide-react";

const purposes = [
  {
    icon: Home,
    title: "Residential",
    desc: "Switches, sockets, lighting and household wiring kits.",
    href: "/catalog?purpose=residential",
  },
  {
    icon: Building2,
    title: "Commercial",
    desc: "Distribution boards, smart panels and energy meters.",
    href: "/catalog?purpose=commercial",
  },
  {
    icon: Factory,
    title: "Industrial",
    desc: "High-current cables, motor protection and PLC accessories.",
    href: "/catalog?purpose=industrial",
  },
  {
    icon: Lightbulb,
    title: "Lighting",
    desc: "LED fixtures, drivers, dimmers and outdoor luminaires.",
    href: "/catalog?purpose=lighting",
  },
  {
    icon: ShieldCheck,
    title: "Protection",
    desc: "RCDs, MCBs, fuses, surge protection devices.",
    href: "/catalog?purpose=protection",
  },
  {
    icon: Wrench,
    title: "Tools & accessories",
    desc: "Conduit, mounting, terminals, professional hand tools.",
    href: "/catalog?purpose=tools",
  },
];

export function ShopByPurpose() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--color-line)] pb-6">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Curated paths</span>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
            Shop by purpose
          </h2>
        </div>
        <p className="max-w-lg text-sm text-[color:var(--color-text-secondary)]">
          Six tailored entry points into the catalog — every product is filtered, spec-matched, and ready to install.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {purposes.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link
              href={p.href}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 transition-colors hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-tint)]"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)] transition-colors group-hover:bg-[color:var(--color-primary)] group-hover:text-white">
                <p.icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl font-medium tracking-tight text-[color:var(--color-text)]">
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                {p.desc}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-primary)] transition-transform group-hover:translate-x-1">
                Browse <ArrowRight size={14} />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
