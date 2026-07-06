"use client";

import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowRight, Package, MessageCircle, UserPlus } from "lucide-react";

const cards = [
  {
    icon: Package,
    title: "See our full range",
    subtitle: "Browse the entire catalog of electrical materials and supplies.",
    cta: "Shop catalog",
    href: "/catalog",
    tone: "primary" as const,
  },
  {
    icon: MessageCircle,
    title: "Have a question?",
    subtitle: "Contact our team and we will help you find what you need.",
    cta: "Get in touch",
    href: "/contact",
    tone: "neutral" as const,
  },
  {
    icon: UserPlus,
    title: "Create an account",
    subtitle: "Shop securely, track orders, and unlock a 10% welcome discount.",
    cta: "Sign up",
    href: "/auth/register",
    tone: "accent" as const,
  },
];

const toneStyles = {
  primary: {
    bg: "bg-[color:var(--color-primary-tint)]",
    icon: "bg-[color:var(--color-bg-elevated)] text-[color:var(--color-primary)]",
    cta: "text-[color:var(--color-primary)]",
  },
  neutral: {
    bg: "bg-[color:var(--color-bg-secondary)]",
    icon: "bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)]",
    cta: "text-[color:var(--color-text)]",
  },
  accent: {
    bg: "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]",
    icon: "bg-white/10 text-[color:var(--color-primary-fg)]",
    cta: "text-[color:var(--color-accent)]",
  },
};

export function HomeCTABanners() {
  return (
    <section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          const styles = toneStyles[card.tone];
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Link
                href={card.href}
                className={`group flex h-full flex-col gap-4 rounded-2xl border border-[color:var(--color-line)] p-6 transition-colors hover:border-[color:var(--color-line-strong)] ${styles.bg}`}
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${styles.icon}`}>
                  <Icon size={22} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-serif text-xl font-medium tracking-tight">
                    {card.title}
                  </h3>
                  <p className={`text-sm ${card.tone === "accent" ? "text-white/75" : "text-[color:var(--color-text-secondary)]"}`}>
                    {card.subtitle}
                  </p>
                </div>
                <span className={`mt-auto inline-flex items-center gap-1.5 text-sm font-semibold transition-transform group-hover:translate-x-1 ${styles.cta}`}>
                  {card.cta}
                  <ArrowRight size={16} />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
