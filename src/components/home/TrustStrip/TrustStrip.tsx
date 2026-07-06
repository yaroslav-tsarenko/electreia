"use client";

import { useRef } from "react";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { motion, useInView } from "framer-motion";

const items = [
  { icon: Truck, label: "Free shipping", desc: "On orders over £100" },
  { icon: ShieldCheck, label: "Secure payment", desc: "100% protected checkout" },
  { icon: RotateCcw, label: "Easy returns", desc: "14-day return policy" },
  { icon: Headphones, label: "24/7 support", desc: "We're always here to help" },
];

export function TrustStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <section
      ref={ref}
      className="grid grid-cols-2 gap-6 rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-primary)] px-6 py-8 text-[color:var(--color-primary-fg)] sm:px-10 lg:grid-cols-4"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <motion.div
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <item.icon size={20} strokeWidth={1.5} />
          </motion.div>
          <div className="flex flex-col leading-tight">
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="text-xs text-white/60">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </section>
  );
}
