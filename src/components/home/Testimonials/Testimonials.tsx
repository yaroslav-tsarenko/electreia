"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Markus W.",
    role: "Electrician · London",
    quote:
      "Ordered cables and conduits late Friday — delivered Monday morning. Everything bundled cleanly with the spec sheet. This is the only supplier I trust for time-sensitive jobs.",
    rating: 5,
    initials: "MW",
  },
  {
    name: "Aurélie R.",
    role: "Site manager · Manchester",
    quote:
      "I run procurement for a 14-person crew. The catalog filters by amp rating and cross-section saved me hours every week. Pricing is transparent, no surprise duties on delivery.",
    rating: 5,
    initials: "AR",
  },
  {
    name: "Tom B.",
    role: "Industrial installer · Bristol",
    quote:
      "Needed a niche Schneider distribution block on short notice. Support found a compatible OEM equivalent within an hour and shipped it same day. Above and beyond.",
    rating: 5,
    initials: "TB",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref}>
      <div className="mb-8 flex max-w-2xl flex-col gap-2 border-b border-[color:var(--color-line)] pb-6">
        <span className="eyebrow">Customer voices</span>
        <h2 className="font-serif text-3xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-[40px]">
          Trusted by professionals across the UK
        </h2>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Real feedback from electricians, contractors, and procurement teams who buy from Electreia every week.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {reviews.map((r, i) => (
          <motion.article
            key={r.name}
            className="relative flex flex-col gap-4 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: i * 0.1 }}
          >
            <Quote size={28} className="text-[color:var(--color-primary-tint)]" strokeWidth={1.5} />
            <div className="flex items-center gap-0.5 text-[color:var(--color-accent)]">
              {Array.from({ length: r.rating }).map((_, idx) => (
                <Star key={idx} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="mt-auto flex items-center gap-3 border-t border-[color:var(--color-line)] pt-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-sm font-semibold text-white">
                {r.initials}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-[color:var(--color-text)]">
                  {r.name}
                </span>
                <span className="text-xs text-[color:var(--color-text-tertiary)]">
                  {r.role}
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
