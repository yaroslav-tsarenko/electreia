"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useCurrency, type Currency } from "@/providers/CurrencyProvider";

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "USD", symbol: "$", label: "US Dollar" },
];

type Variant = "chrome" | "solid";

interface CurrencySwitcherProps {
  /**
   * `chrome` — for the dark utility strip in the top header tier.
   * `solid` — for the main bar (light-neutral background).
   */
  variant?: Variant;
  showLabel?: boolean;
}

export function CurrencySwitcher({ variant = "chrome", showLabel = false }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  const triggerClass =
    variant === "chrome"
      ? "border border-white/25 text-white/85 hover:bg-white/10 hover:text-white"
      : "border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]";

  const heightClass = variant === "chrome" ? "h-6" : "h-10";
  const paddingClass = variant === "chrome" ? "px-2" : "px-3";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${current.code}`}
        className={[
          "inline-flex items-center justify-center gap-1.5 rounded-md font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
          heightClass,
          paddingClass,
          triggerClass,
        ].join(" ")}
      >
        <span className="tabular-nums">{current.symbol}</span>
        <span>{current.code}</span>
        {showLabel && (
          <span className="hidden text-[color:var(--color-text-tertiary)] normal-case tracking-normal xl:inline">
            · {current.label}
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Choose currency"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[196px] overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-1 shadow-[0_16px_40px_-12px_rgba(6,10,20,0.35)]"
        >
          {CURRENCIES.map((c) => {
            const isActive = c.code === currency;
            return (
              <li key={c.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]"
                      : "text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={[
                        "inline-flex h-6 w-6 items-center justify-center rounded-md font-mono text-[11px] font-bold",
                        isActive
                          ? "bg-[color:var(--color-primary)] text-white"
                          : "bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text)]",
                      ].join(" ")}
                    >
                      {c.symbol}
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                        {c.code}
                      </span>
                      <span className="text-[11px] font-normal text-[color:var(--color-text-tertiary)]">
                        {c.label}
                      </span>
                    </span>
                  </span>
                  {isActive && <Check size={14} strokeWidth={2.5} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
