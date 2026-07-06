"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function Newsletter() {
  const t = useTranslations("home");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      if (data.discountCode) {
        setDiscountCode(data.discountCode);
        toast.success(data.alreadySubscribed ? "Welcome back!" : "Thanks! Use your code at checkout.");
      } else {
        toast.success("Subscribed!");
      }
      setEmail("");
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
      className="relative overflow-hidden rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-primary)] px-6 py-12 text-[color:var(--color-primary-fg)] sm:px-10 sm:py-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
          <span className="h-px w-6 bg-white/40" />
          Electreia dispatch
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-[40px]">
            {t("newsletter")}
          </h2>
          <p className="text-sm text-white/70 sm:text-base">
            {t("newsletterSubtitle")}
          </p>
        </div>
        {discountCode ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 text-[color:var(--color-primary)]">
            <Check size={18} />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-medium uppercase tracking-widest text-[color:var(--color-text-tertiary)]">
                Your 10% code
              </span>
              <span className="text-base font-semibold tracking-wide">{discountCode}</span>
            </div>
            <button
              type="button"
              onClick={copyCode}
              aria-label="Copy code"
              className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[color:var(--color-accent-hover)]"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        ) : (
          <form
            className="flex w-full max-w-lg flex-col gap-2 sm:flex-row"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletterPlaceholder")}
              required
              disabled={submitting}
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none transition-colors focus:border-white/50"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-accent-hover)] disabled:opacity-70"
            >
              <Send size={16} />
              {submitting ? "…" : t("newsletterCta")}
            </button>
          </form>
        )}
      </div>
    </motion.section>
  );
}
