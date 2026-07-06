"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import {
  Flame, Apple, Wind, Gift, Smartphone, Gamepad2,
  Lightbulb, Sparkles, Tag, Package, Star, Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Flame, Apple, Wind, Gift, Smartphone, Gamepad2,
  Lightbulb, Sparkles, Tag, Package, Star, Zap,
};

interface TabData {
  id: string;
  label: string;
  icon?: string | null;
  linkUrl: string;
  color: string;
}

interface Props {
  tabs: TabData[];
}

export function HorizontalTabs({ tabs }: Props) {
  const [active, setActive] = useState(0);

  if (!tabs.length) return null;

  return (
    <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]">
      <div className="mx-auto flex max-w-[var(--container-content)] gap-1.5 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab, i) => {
          const Icon = tab.icon ? ICON_MAP[tab.icon] : Tag;
          const isActive = i === active;
          return (
            <Link
              key={tab.id}
              href={tab.linkUrl}
              onClick={() => setActive(i)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
                  : "border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white" : "text-[color:var(--color-primary)]"} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
