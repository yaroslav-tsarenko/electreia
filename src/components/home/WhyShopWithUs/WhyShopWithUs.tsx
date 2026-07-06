"use client";

import { Shield, Zap, Heart, RefreshCw, Award, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const reasons = [
  {
    icon: Shield,
    title: "Secure shopping",
    desc: "Your data is protected with enterprise-grade encryption and secure payments.",
  },
  {
    icon: Zap,
    title: "Fast delivery",
    desc: "Free shipping on orders over £100 with express options available.",
  },
  {
    icon: Heart,
    title: "Certified products",
    desc: "Every electrical material is sourced from certified manufacturers and meets professional standards.",
  },
  {
    icon: RefreshCw,
    title: "Easy returns",
    desc: "Changed your mind? Return within 14 days — no questions asked.",
  },
  {
    icon: Award,
    title: "Best prices",
    desc: "We guarantee competitive pricing. Found it cheaper? We'll match it.",
  },
  {
    icon: Headphones,
    title: "24/7 support",
    desc: "Our team is available around the clock to help with anything.",
  },
];

export function WhyShopWithUs() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center gap-2 border-b border-[color:var(--color-line)] pb-6 text-center">
          <span className="eyebrow">Why Electreia</span>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
            Why choose Electreia
          </h2>
          <p className="max-w-xl text-sm text-[color:var(--color-text-secondary)]">
            Professional-grade electrical materials with expert support and fast delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl font-medium tracking-tight text-[color:var(--color-text)]">
                  {reason.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                  {reason.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
