"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Package, Users, Truck, Globe2 } from "lucide-react";

const stats = [
  { icon: Package, value: "12k+", label: "Products in catalog" },
  { icon: Users, value: "48k+", label: "Happy customers" },
  { icon: Truck, value: "98%", label: "On-time delivery" },
  { icon: Globe2, value: "26", label: "Countries served" },
];

export function StatsBand() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] px-6 py-8 sm:px-10 sm:py-10">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: i * 0.08 }}
          >
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]">
              <stat.icon size={22} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-2xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-3xl">
                {stat.value}
              </span>
              <span className="text-xs text-[color:var(--color-text-secondary)]">
                {stat.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
