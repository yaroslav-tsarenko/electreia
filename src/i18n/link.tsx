"use client";

import { useState, type ComponentProps } from "react";
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing-config";

const { Link: BaseLink } = createNavigation(routing);

type LinkProps = ComponentProps<typeof BaseLink>;

/**
 * Locale-aware Link that prefetches on intent (hover, focus, touch) instead of
 * as soon as it scrolls into view. Catalogue pages render 50–100 links, and
 * viewport prefetching fired one request per link, which tripped the
 * per-IP rate limit after a couple of page views. Pass `prefetch` explicitly
 * to opt back into the default behaviour for a specific link.
 */
export function Link({ prefetch, onMouseEnter, onTouchStart, onFocus, ...props }: LinkProps) {
  const [intent, setIntent] = useState(false);
  const resolvedPrefetch = prefetch !== undefined ? prefetch : intent ? null : false;

  return (
    <BaseLink
      {...props}
      prefetch={resolvedPrefetch}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
    />
  );
}
