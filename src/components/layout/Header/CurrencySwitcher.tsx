"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency, type Currency } from "@/providers/CurrencyProvider";

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
];

export function CurrencySwitcher() {
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

  const current = CURRENCIES.find((c) => c.code === currency)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Currency"
        className="inline-flex items-center justify-center gap-1 rounded-md border border-current/25 px-2 py-1 text-[11px] font-semibold tracking-wide text-current/80 transition-colors hover:bg-current/10 hover:text-current"
      >
        <span>{current.symbol}</span>
        <span>{current.code}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[128px] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-lg">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c.code);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                c.code === currency
                  ? "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]"
                  : "text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
