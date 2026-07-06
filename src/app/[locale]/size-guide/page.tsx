import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ruler, Info, Cable, Battery } from "lucide-react";

export const metadata: Metadata = {
  title: "Spec Reference",
  description:
    "Electreia spec reference — dimensions, weight and connector guide across laptops, monitors, audio, mobile and accessories.",
};

const LAPTOP_SIZES = [
  { size: "13\"",  screen: "13.3–13.6",  weight: "0.9–1.2", best: "Ultra-portable · commute" },
  { size: "14\"",  screen: "14.0–14.2",  weight: "1.1–1.5", best: "Work + travel · daily driver" },
  { size: "15\"",  screen: "15.3–15.6",  weight: "1.4–1.8", best: "Content · light gaming" },
  { size: "16\"",  screen: "16.0–16.2",  weight: "1.8–2.2", best: "Pro workflows · creators" },
  { size: "17\"",  screen: "17.0–17.3",  weight: "2.3–2.9", best: "Desktop replacement · gaming" },
];

const MONITOR_SIZES = [
  { size: "24\"",  resolution: "1920×1080 / 2560×1440", best: "Office · productivity" },
  { size: "27\"",  resolution: "2560×1440 / 3840×2160", best: "General · light creative" },
  { size: "32\"",  resolution: "2560×1440 / 3840×2160", best: "Immersive · dev · video edit" },
  { size: "34\"",  resolution: "3440×1440 ultrawide",   best: "Multitasking · trading" },
  { size: "49\"",  resolution: "5120×1440 super-ultra", best: "Pro workstations" },
];

const CONNECTORS = [
  {
    title: "USB-C · Thunderbolt 4",
    detail:
      "Universal connector for data, power and display. Thunderbolt 4 delivers up to 40 Gbps, 100W charging and dual 4K displays.",
  },
  {
    title: "HDMI 2.1",
    detail:
      "4K @ 120Hz or 8K @ 60Hz, VRR, ALLM. Standard for consoles, TVs and modern monitors.",
  },
  {
    title: "DisplayPort 2.1",
    detail:
      "Up to 80 Gbps, 8K @ 60Hz HDR. Preferred for desktop PC → monitor connections at high refresh.",
  },
];

const AUDIO_TIERS = [
  { tier: "Entry",     price: "£30–£120",  detail: "Great for daily commute, calls and casual listening." },
  { tier: "Enthusiast", price: "£120–£350", detail: "Balanced tuning, ANC, better drivers, all-day comfort." },
  { tier: "Pro",       price: "£350–£1,200", detail: "Reference tuning, planar/balanced-armature drivers, studio-grade." },
  { tier: "Reference", price: "£1,200+",   detail: "Flagship cans, tuned DACs, mastering-grade monitors." },
];

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[color:var(--color-line)]">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead className="bg-[color:var(--color-bg-secondary)] text-left text-[color:var(--color-text)]">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-[color:var(--color-line)] px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={
                i % 2 === 0
                  ? "bg-[color:var(--color-bg-elevated)]"
                  : "bg-[color:var(--color-bg)]"
              }
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`border-b border-[color:var(--color-line)] px-4 py-3 ${
                    j === 0
                      ? "font-mono font-semibold text-[color:var(--color-text)] tabular-nums"
                      : "text-[color:var(--color-text-secondary)]"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <div className="mx-auto w-full max-w-[var(--container-content)] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 flex flex-col gap-3 border-b border-[color:var(--color-line)] pb-8 sm:mb-14">
        <span className="eyebrow">Electreia · Reference</span>
        <h1 className="font-display text-[36px] font-semibold leading-tight tracking-tight text-[color:var(--color-text)] sm:text-[52px]">
          Spec reference
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-[color:var(--color-text-secondary)] sm:text-lg">
          Quick reference for the things people ask before they buy: laptop
          form factors, monitor resolutions, connector standards and audio
          tiers. If you&apos;re still unsure — ping our support team, we answer
          in under 2 hours.
        </p>
      </div>

      {/* Laptops */}
      <section className="mb-14">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <span className="eyebrow">Compute</span>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
              Laptop form factors
            </h2>
          </div>
          <Link
            href="/catalog/laptops-computers"
            className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)] hover:underline sm:inline-flex sm:items-center sm:gap-1"
          >
            Shop laptops <ArrowRight size={14} />
          </Link>
        </div>
        <Table
          headers={["Size", "Screen (in)", "Weight (kg)", "Best for"]}
          rows={LAPTOP_SIZES.map((r) => [r.size, r.screen, r.weight, r.best])}
        />
      </section>

      {/* Monitors */}
      <section className="mb-14">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <span className="eyebrow">Displays</span>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
              Monitor sizes &amp; resolutions
            </h2>
          </div>
          <Link
            href="/catalog/displays-monitors"
            className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)] hover:underline sm:inline-flex sm:items-center sm:gap-1"
          >
            Shop monitors <ArrowRight size={14} />
          </Link>
        </div>
        <Table
          headers={["Size", "Resolution", "Best for"]}
          rows={MONITOR_SIZES.map((r) => [r.size, r.resolution, r.best])}
        />
      </section>

      {/* Connectors */}
      <section className="mb-14">
        <div className="mb-6 flex items-center gap-2 text-[color:var(--color-text)]">
          <Cable size={18} className="text-[color:var(--color-primary)]" />
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Connectors
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CONNECTORS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5"
            >
              <h3 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Audio tiers */}
      <section className="mb-14">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <span className="eyebrow">Audio</span>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[color:var(--color-text)]">
              Audio tiers
            </h2>
          </div>
          <Link
            href="/catalog/audio-headphones"
            className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-primary)] hover:underline sm:inline-flex sm:items-center sm:gap-1"
          >
            Shop audio <ArrowRight size={14} />
          </Link>
        </div>
        <Table
          headers={["Tier", "Price", "What you get"]}
          rows={AUDIO_TIERS.map((r) => [r.tier, r.price, r.detail])}
        />
      </section>

      {/* Note */}
      <section className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6">
        <div className="mb-2 flex items-center gap-2 text-[color:var(--color-text)]">
          <Info size={16} className="text-[color:var(--color-primary)]" />
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
            Battery &amp; compatibility notes
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
          Advertised laptop battery life is measured under standard test
          conditions — real-world figures typically run 70-85% of the rated
          time depending on brightness, workload and radio use. Charger
          wattage should match the manufacturer&apos;s spec: too low won&apos;t
          charge, higher is safe.
        </p>
      </section>

      <div className="mt-10 flex items-center justify-center">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-primary)] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[color:var(--color-primary-hover)]"
        >
          <Battery size={13} /> Browse catalog <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
