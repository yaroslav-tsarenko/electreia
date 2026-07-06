"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, Sparkles, ShieldCheck, Truck } from "lucide-react";

const bullets = [
  "Same-day dispatch on orders placed before 14:00 GMT",
  "Free UK returns within 30 days, no questions asked",
  "Manufacturer-certified inventory with batch traceability",
  "Bulk pricing tiers automatically applied at checkout",
];

export function ServicePromise() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0, x: -32 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-primary)]">
            <Sparkles size={14} /> Our service promise
          </span>
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
            Built for professionals who can&apos;t afford to wait.
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-[color:var(--color-text-secondary)]">
            Every order at Electreia is handled by a team that knows what an installer
            needs on a Monday morning. Spec-correct, certified, and out the door fast.
          </p>
          <ul className="mt-2 flex flex-col gap-3">
            {bullets.map((b, i) => (
              <motion.li
                key={b}
                className="flex items-start gap-3 text-sm text-[color:var(--color-text)]"
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[color:var(--color-success)]" />
                <span>{b}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="col-span-2 flex items-center gap-4 rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-primary)] p-6 text-[color:var(--color-primary-fg)]">
            <Truck size={38} strokeWidth={1.5} />
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-4xl font-medium">24h</span>
              <span className="text-xs text-white/70">Average UK delivery</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] p-5">
            <ShieldCheck size={26} className="text-[color:var(--color-primary)]" strokeWidth={1.5} />
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-2xl font-medium text-[color:var(--color-text)]">2y</span>
              <span className="text-xs text-[color:var(--color-text-secondary)]">Standard warranty</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-primary-tint)] p-5">
            <Sparkles size={26} className="text-[color:var(--color-primary)]" strokeWidth={1.5} />
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-2xl font-medium text-[color:var(--color-text)]">4.9</span>
              <span className="text-xs text-[color:var(--color-text-secondary)]">Out of 5 customer score</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
