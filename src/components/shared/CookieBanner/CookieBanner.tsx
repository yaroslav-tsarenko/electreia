"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X, Shield, ChartLine, Megaphone } from "lucide-react";
import { Link } from "@/i18n/routing";

const STORAGE_KEY = "electreia-cookie-consent-v1";

type ConsentValue = "all" | "essential" | "custom";
type Prefs = { analytics: boolean; marketing: boolean };

interface StoredConsent {
  value: ConsentValue;
  prefs: Prefs;
  savedAt: string;
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ analytics: true, marketing: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const t = setTimeout(() => setOpen(true), 400);
        return () => clearTimeout(t);
      }
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const persist = (value: ConsentValue, next: Prefs) => {
    const record: StoredConsent = {
      value,
      prefs: next,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* noop */
    }
    setOpen(false);
  };

  const acceptAll = () => persist("all", { analytics: true, marketing: true });
  const rejectAll = () => persist("essential", { analytics: false, marketing: false });
  const saveCustom = () => persist("custom", prefs);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cookie-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            key="cookie-banner"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-heading"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="fixed inset-x-0 bottom-0 z-[81] px-3 pb-3 sm:px-6 sm:pb-6"
          >
            <div className="mx-auto max-w-[var(--container-content)] overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[0_24px_60px_-12px_rgba(6,10,20,0.55)]">
              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 tech-grid opacity-25"
                />
                <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:gap-8">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)] shadow-[0_0_18px_var(--color-primary-tint)]">
                      <Cookie size={20} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p
                        id="cookie-heading"
                        className="font-display text-base font-semibold text-[color:var(--color-text)] sm:text-lg"
                      >
                        We use cookies to power Electreia
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                        Essential cookies keep the basket, sign-in and checkout
                        working. Optional cookies help us understand traffic and
                        personalise offers. You can change your mind any time in{" "}
                        <Link
                          href="/policies/cookies"
                          className="font-medium text-[color:var(--color-primary)] underline-offset-2 hover:underline"
                        >
                          Cookie preferences
                        </Link>
                        .
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={rejectAll}
                      aria-label="Close and reject non-essential cookies"
                      className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--color-text-tertiary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-text)] lg:hidden"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 lg:ml-auto lg:flex-row lg:items-center">
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((v) => !v)}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-[color:var(--color-line)] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                    >
                      {settingsOpen ? "Hide preferences" : "Manage preferences"}
                    </button>
                    <button
                      type="button"
                      onClick={rejectAll}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-[color:var(--color-line)] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-text)]"
                    >
                      Reject non-essential
                    </button>
                    <button
                      type="button"
                      onClick={acceptAll}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[color:var(--color-primary-hover)] hover:shadow-[0_0_24px_var(--color-primary-tint)]"
                    >
                      Accept all
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {settingsOpen && (
                    <motion.div
                      key="settings"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative overflow-hidden border-t border-[color:var(--color-line)]"
                    >
                      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                        <ToggleRow
                          icon={Shield}
                          title="Strictly necessary"
                          description="Basket, sign-in, checkout, security."
                          checked
                          locked
                        />
                        <ToggleRow
                          icon={ChartLine}
                          title="Analytics"
                          description="Anonymous stats so we can improve pages."
                          checked={prefs.analytics}
                          onChange={(v) =>
                            setPrefs((p) => ({ ...p, analytics: v }))
                          }
                        />
                        <ToggleRow
                          icon={Megaphone}
                          title="Marketing"
                          description="Personalised offers and remarketing."
                          checked={prefs.marketing}
                          onChange={(v) =>
                            setPrefs((p) => ({ ...p, marketing: v }))
                          }
                        />
                      </div>
                      <div className="flex justify-end border-t border-[color:var(--color-line)] px-5 py-3 sm:px-6">
                        <button
                          type="button"
                          onClick={saveCustom}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-[color:var(--color-text)] px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-bg)] transition-opacity hover:opacity-90"
                        >
                          Save preferences
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ToggleRowProps {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}

function ToggleRow({ icon: Icon, title, description, checked, locked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-4">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]">
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[color:var(--color-text)]">
            {title}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={locked}
            onClick={() => !locked && onChange?.(!checked)}
            className={[
              "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
              locked
                ? "cursor-not-allowed bg-[color:var(--color-primary)]/60"
                : checked
                  ? "bg-[color:var(--color-primary)]"
                  : "bg-[color:var(--color-line-strong)]",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                checked ? "translate-x-[18px]" : "translate-x-[2px]",
              ].join(" ")}
            />
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-text-tertiary)]">
          {description}
        </p>
      </div>
    </div>
  );
}
