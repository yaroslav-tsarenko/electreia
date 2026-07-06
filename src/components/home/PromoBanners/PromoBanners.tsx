"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";
import banner3 from "@/assets/banner3.png";

const banners = [
  {
    image: banner1,
    tag: "Professional grade",
    title: "Switchgear & distribution boards",
    desc: "Certified panels, circuit breakers, and modular enclosures for residential and commercial installations.",
    href: "/catalog",
    cta: "Shop switchgear",
  },
  {
    image: banner2,
    tag: "Complete range",
    title: "Industrial control & automation",
    desc: "From compact enclosures to full-size distribution cabinets — everything for your next project.",
    href: "/catalog",
    cta: "Browse equipment",
  },
  {
    image: banner3,
    tag: "Top quality",
    title: "Cables, wiring & connectors",
    desc: "Premium copper cables, flexible wiring, terminal blocks, and accessories at wholesale prices.",
    href: "/catalog",
    cta: "View cables",
  },
];

export function PromoBanners() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {banners.map((b, i) => (
          <motion.div
            key={b.title}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--color-bg-secondary)]">
              <Image
                src={b.image}
                alt={b.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-text)]/40 via-transparent to-transparent" />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
              <span className="w-fit rounded-full bg-[color:var(--color-primary-tint)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                {b.tag}
              </span>
              <h3 className="font-serif text-xl font-medium leading-snug tracking-tight text-[color:var(--color-text)]">
                {b.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                {b.desc}
              </p>
              <Link
                href={b.href}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-primary)] transition-transform group-hover:translate-x-1"
              >
                {b.cta} <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
