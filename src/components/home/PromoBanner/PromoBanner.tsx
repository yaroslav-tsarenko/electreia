"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function PromoBanner() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/catalog?onSale=true"
              className="group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-primary)] p-8 text-[color:var(--color-primary-fg)]"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                  Limited offer
                </span>
                <h3 className="font-serif text-3xl font-medium tracking-tight sm:text-[40px]">
                  Up to 40% off
                </h3>
                <p className="max-w-md text-sm text-white/70">
                  Don&apos;t miss our biggest sale of the season.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent)] transition-transform group-hover:translate-x-1">
                Shop now <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="/catalog?sort=newest"
              className="group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] p-8 text-[color:var(--color-text)]"
            >
              <div className="flex flex-col gap-2">
                <span className="eyebrow text-[color:var(--color-primary)]">
                  Just arrived
                </span>
                <h3 className="font-serif text-3xl font-medium tracking-tight sm:text-[40px]">
                  New collection
                </h3>
                <p className="max-w-md text-sm text-[color:var(--color-text-secondary)]">
                  Explore the latest trends and must-have items.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-primary)] transition-transform group-hover:translate-x-1">
                Explore <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
