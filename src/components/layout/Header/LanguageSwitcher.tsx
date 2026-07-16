"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  lv: "LV",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--color-text-secondary)] transition-colors hover:bg-[color:var(--color-bg-secondary)] hover:text-[color:var(--color-text)]"
        onClick={() => setOpen(!open)}
        aria-label="Change language"
      >
        <Globe size={18} strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[5rem] overflow-hidden rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[0_4px_14px_rgba(28,26,23,0.06)]">
          {Object.entries(LOCALE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => switchLocale(key)}
              className={`block w-full cursor-pointer border-none px-4 py-2 text-left text-sm text-[color:var(--color-text)] hover:bg-[color:var(--color-bg-secondary)] ${
                key === locale
                  ? "bg-[color:var(--color-bg-secondary)] font-bold"
                  : "bg-transparent font-normal"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
