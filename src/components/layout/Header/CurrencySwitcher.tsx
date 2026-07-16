"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
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
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Anchor the menu right below the trigger, portalled into <body> so no
  // parent overflow / stacking-context ever hides it.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const compute = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Use pointerdown (not mousedown) so it fires uniformly for mouse/touch,
    // and check the whole event path so nested nodes inside the menu don't
    // accidentally slip through Node.contains().
    const onDown = (e: PointerEvent | MouseEvent) => {
      const path = typeof (e as PointerEvent).composedPath === "function"
        ? (e as PointerEvent).composedPath()
        : [];
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      const t = e.target as Node | null;
      const inTrigger = !!(trigger && (path.includes(trigger) || (t && trigger.contains(t))));
      const inMenu = !!(menu && (path.includes(menu) || (t && menu.contains(t))));
      if (inTrigger || inMenu) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const current = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  const triggerClass =
    variant === "chrome"
      ? "h-6 px-2 border border-white/25 text-white/85 hover:bg-white/10 hover:text-white"
      : "h-10 px-3 border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]";

  const handleSelect = (code: Currency) => {
    setCurrency(code);
    setOpen(false);
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${current.code}. Click to change.`}
        className={[
          "inline-flex items-center justify-center gap-1.5 rounded-md font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
          triggerClass,
        ].join(" ")}
      >
        <span className="tabular-nums">{current.symbol}</span>
        <span>{current.code}</span>
        {showLabel && (
          <span className="hidden font-normal normal-case tracking-normal text-[color:var(--color-text-tertiary)] xl:inline">
            · {current.label}
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted && open && pos &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Choose currency"
            style={{
              position: "fixed",
              top: pos.top,
              right: pos.right,
              zIndex: 9999,
              minWidth: 220,
            }}
            className="overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-1 shadow-[0_16px_40px_-12px_rgba(6,10,20,0.35)]"
          >
            <ul className="flex flex-col">
              {CURRENCIES.map((c) => {
                const isActive = c.code === currency;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(c.code);
                      }}
                      className={[
                        "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]"
                          : "text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)]",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={[
                            "inline-flex h-7 w-7 items-center justify-center rounded-md font-mono text-[12px] font-bold",
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
          </div>,
          document.body,
        )}
    </div>
  );
}
