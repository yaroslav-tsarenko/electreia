import { NextResponse } from "next/server";

let cachedRates: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
    return NextResponse.json({ rates: cachedRates.rates });
  }

  try {
    const res = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=GBP&symbols=EUR",
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error("Failed to fetch rates");

    const data = await res.json();
    cachedRates = {
      rates: { GBP: 1, EUR: data.rates.EUR },
      timestamp: Date.now(),
    };

    return NextResponse.json({ rates: cachedRates.rates });
  } catch {
    return NextResponse.json({
      rates: { GBP: 1, EUR: 1.17 },
    });
  }
}
