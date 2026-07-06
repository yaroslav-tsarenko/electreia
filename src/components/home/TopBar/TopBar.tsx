"use client";

import { Link } from "@/i18n/routing";
import { MapPin, Phone, Globe, Info, HelpCircle, Truck, RotateCcw, CreditCard, Package } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Phone, Globe, Info, HelpCircle, Truck, RotateCcw, CreditCard, Package,
};

interface UtilityLink {
  id: string;
  label: string;
  linkUrl: string;
  icon?: string | null;
  position: string;
}

interface Props {
  links: UtilityLink[];
}

const defaultLinks: UtilityLink[] = [
  { id: "1", label: "About", linkUrl: "/about", position: "left" },
  { id: "2", label: "Payment", linkUrl: "/policies/payment", position: "left" },
  { id: "3", label: "Delivery", linkUrl: "/policies/shipping", position: "left" },
  { id: "4", label: "Returns", linkUrl: "/policies/returns", position: "left" },
  { id: "5", label: "Warranty", linkUrl: "/policies/warranty", position: "left" },
  { id: "7", label: "Contacts", linkUrl: "/contact", icon: "Phone", position: "right" },
];

export function TopBar({ links }: Props) {
  const items = links.length > 0 ? links : defaultLinks;
  const leftLinks = items.filter((l) => l.position === "left");
  const rightLinks = items.filter((l) => l.position === "right");

  return (
    <div className="hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-secondary)] md:block">
      <div className="mx-auto flex max-w-[var(--container-content)] items-center justify-between gap-6 px-4 py-2 text-xs sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {leftLinks.map((link) => {
            const Icon = link.icon ? ICON_MAP[link.icon] : null;
            return (
              <Link
                key={link.id}
                href={link.linkUrl}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--color-primary)]"
              >
                {Icon && <Icon size={12} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          {rightLinks.map((link) => {
            const Icon = link.icon ? ICON_MAP[link.icon] : null;
            return (
              <Link
                key={link.id}
                href={link.linkUrl}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--color-primary)]"
              >
                {Icon && <Icon size={12} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
