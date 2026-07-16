"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type Currency = "USD" | "GBP";

interface Rates {
  USD: number;
  GBP: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  /**
   * Convert an amount stored in GBP (the base currency) into the currently
   * selected display currency.
   */
  convert: (amountInGbp: number) => number;
  rates: Rates;
  symbol: string;
}

/**
 * Base currency is GBP (£). Rates express "1 GBP in target currency".
 * If the /api/exchange-rates endpoint returns rates keyed against EUR
 * (as it did previously), we normalise them relative to GBP.
 */
const DEFAULT_RATES: Rates = { GBP: 1, USD: 1.27 };
const SYMBOLS: Record<Currency, string> = { GBP: "£", USD: "$" };

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("GBP");
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);

  useEffect(() => {
    const stored = localStorage.getItem("currency") as Currency | null;
    if (stored === "USD" || stored === "GBP") {
      setCurrencyState(stored);
    }
  }, []);

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.rates) return;
        const usdPerEur = Number(data.rates.USD);
        const gbpPerEur = Number(data.rates.GBP);
        if (usdPerEur > 0 && gbpPerEur > 0) {
          setRates({ GBP: 1, USD: usdPerEur / gbpPerEur });
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  };

  const convert = useCallback(
    (amountInGbp: number) => {
      if (currency === "GBP") return amountInGbp;
      return Math.round(amountInGbp * rates[currency] * 100) / 100;
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, convert, rates, symbol: SYMBOLS[currency] }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
