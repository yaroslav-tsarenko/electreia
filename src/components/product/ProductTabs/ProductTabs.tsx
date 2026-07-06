"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { sanitizeProductDescription } from "@/lib/utils/sanitize-html";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

interface ProductTabsProps {
  description?: string | null;
  characteristics?: Record<string, Record<string, string>> | null;
  reviews: Review[];
}

function countCharacteristics(chars: Record<string, Record<string, string>>): number {
  return Object.values(chars).reduce((sum, group) => sum + Object.keys(group).length, 0);
}

const DESCRIPTION_CLASS = [
  "max-w-[78ch] text-[15px] leading-[1.75] text-[color:var(--color-text-secondary)]",
  "[&_p]:mb-4 [&_p:last-child]:mb-0",
  "[&_b]:font-bold [&_b]:text-[color:var(--color-text)] [&_strong]:font-bold [&_strong]:text-[color:var(--color-text)]",
  "[&_i]:italic [&_em]:italic",
  "[&_u]:underline",
  "[&_h1]:mb-3 [&_h1]:mt-7 [&_h1]:text-[1.35rem] [&_h1]:font-serif [&_h1]:font-medium [&_h1]:tracking-tight [&_h1]:text-[color:var(--color-text)]",
  "[&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-[1.2rem] [&_h2]:font-serif [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-[color:var(--color-text)]",
  "[&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-[1.05rem] [&_h3]:font-serif [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:text-[color:var(--color-text)]",
  "[&_h4]:mb-3 [&_h4]:mt-7 [&_h4]:text-[0.95rem] [&_h4]:font-semibold [&_h4]:text-[color:var(--color-text)]",
  "[&_a]:font-semibold [&_a]:text-[color:var(--color-primary)] [&_a]:underline hover:[&_a]:text-[color:var(--color-primary-hover)]",
  "[&_ul]:mb-5 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:my-1 [&_li]:leading-relaxed",
  "[&_hr]:my-6 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[color:var(--color-line)]",
].join(" ");

export function ProductTabs({ description, characteristics, reviews }: ProductTabsProps) {
  const t = useTranslations("product");
  const [activeTab, setActiveTab] = useState<"description" | "characteristics" | "reviews">("description");

  const groups = characteristics ? Object.entries(characteristics) : [];
  const totalCharCount = characteristics ? countCharacteristics(characteristics) : 0;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const safeDescription = useMemo(
    () => (description ? sanitizeProductDescription(description) : ""),
    [description]
  );

  const TABS = [
    { key: "description" as const,     label: t("description") },
    { key: "characteristics" as const, label: t("characteristics"), count: totalCharCount },
    { key: "reviews" as const,         label: t("reviews", { count: reviews.length }) },
  ];

  return (
    <div className="mt-10 md:mt-14">
      <div
        className="scrollbar-none relative flex overflow-x-auto border-b border-[color:var(--color-line)]"
        role="tablist"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              className={`relative shrink-0 whitespace-nowrap bg-transparent px-4 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors sm:px-6 sm:py-4 sm:text-[12px] ${
                isActive
                  ? "text-[color:var(--color-primary)]"
                  : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text)]"
              }`}
              onClick={() => setActiveTab(tab.key)}
              role="tab"
              aria-selected={isActive}
            >
              {tab.label}
              {"count" in tab && tab.count && tab.count > 0 ? (
                <span className="ml-1.5 rounded-md bg-[color:var(--color-bg-secondary)] px-1.5 py-0.5 text-[10px] font-normal text-[color:var(--color-text-tertiary)] tabular-nums">
                  {tab.count}
                </span>
              ) : null}
              {isActive && (
                <motion.span
                  layoutId="product-tab-underline"
                  aria-hidden
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[color:var(--color-primary)]"
                  transition={{ type: "spring", damping: 24, stiffness: 380 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="py-8 sm:py-10" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "description" &&
              (safeDescription ? (
                <div
                  className={DESCRIPTION_CLASS}
                  dangerouslySetInnerHTML={{ __html: safeDescription }}
                />
              ) : (
                <p className="py-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                  No description available
                </p>
              ))}

            {activeTab === "characteristics" &&
              (groups.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                  {groups.map(([groupName, entries]) => (
                    <div
                      key={groupName}
                      className="overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]"
                    >
                      <h3 className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-secondary)] px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text)]">
                        {groupName}
                      </h3>
                      <table className="w-full border-collapse">
                        <tbody>
                          {Object.entries(entries).map(([key, value], i) => (
                            <tr
                              key={key}
                              className={
                                i % 2 === 1
                                  ? "bg-[color:var(--color-bg-secondary)]/40"
                                  : ""
                              }
                            >
                              <td className="w-[55%] border-b border-[color:var(--color-line)] px-4 py-2.5 align-top text-sm text-[color:var(--color-text-secondary)]">
                                {key}
                              </td>
                              <td className="border-b border-[color:var(--color-line)] px-4 py-2.5 align-top font-mono text-sm font-semibold text-[color:var(--color-text)] tabular-nums">
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                  No characteristics available
                </p>
              ))}

            {activeTab === "reviews" &&
              (reviews.length > 0 ? (
                <>
                  <div className="mb-6 flex items-center gap-6 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 sm:gap-8 sm:p-6">
                    <div className="text-center">
                      <div className="font-display text-4xl font-semibold tracking-tight text-[color:var(--color-text)] sm:text-5xl">
                        {avgRating.toFixed(1)}
                      </div>
                      <div className="mt-1 flex justify-center gap-0.5 text-[color:var(--color-warning)]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            strokeWidth={0}
                            className={
                              i < Math.round(avgRating)
                                ? "fill-current"
                                : "opacity-25 fill-current"
                            }
                          />
                        ))}
                      </div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)] tabular-nums">
                        {reviews.length} reviews
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 transition-all hover:border-[color:var(--color-primary)]/40 hover:shadow-[0_4px_14px_rgba(46,125,255,0.15)] sm:p-6"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-[color:var(--color-text)]">
                            {review.user.name || "Anonymous"}
                          </span>
                          <span className="flex gap-0.5 text-[color:var(--color-warning)]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={11}
                                strokeWidth={0}
                                className={
                                  i < review.rating
                                    ? "fill-current"
                                    : "opacity-25 fill-current"
                                }
                              />
                            ))}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                            {review.comment}
                          </p>
                        )}
                        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text-tertiary)]">
                  {t("noReviews")}
                </p>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
