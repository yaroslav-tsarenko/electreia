"use client";

import { useState, useRef } from "react";
import { CheckCircle, Copy, Check } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { toast } from "sonner";

export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Subscribe failed");
      setDiscountCode(data.discountCode ?? null);
      if (data.alreadySubscribed) toast.success("Welcome back!");
    } catch {
      toast.error("Could not subscribe. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    if (!discountCode) return;
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <motion.section
      ref={ref}
      className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] p-6 sm:p-10 md:grid-cols-[1fr_1fr]"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex items-center gap-5"
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full bg-[color:var(--color-accent)] text-white shadow-sm"
          animate={isInView ? { rotate: [0, -8, 8, -4, 0] } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <span className="font-serif text-3xl font-medium leading-none">10%</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]">Off</span>
        </motion.div>
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Electreia dispatch</span>
          <h2 className="font-serif text-2xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-3xl">
            Subscribe &amp; save 10%
          </h2>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Exclusive deals, new arrivals &amp; special offers straight to your inbox.
          </p>
        </div>
      </motion.div>
      <motion.div
        className="flex w-full flex-col items-stretch"
        initial={{ opacity: 0, x: 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {discountCode ? (
          <motion.div
            className="flex flex-col items-center gap-2 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-5 py-4 text-[color:var(--color-text)]"
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <span className="flex items-center gap-2 text-sm text-[color:var(--color-success)]">
              <CheckCircle size={16} /> You&apos;re in! Use code:
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-2 font-mono text-base font-semibold tracking-wide text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary)]"
            >
              {discountCode}
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={submitting}
              className="flex-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition-colors placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-primary)]"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-accent-hover)] disabled:opacity-70"
            >
              {submitting ? "…" : "Subscribe"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.section>
  );
}
