const PLACEHOLDER_BASE = "https://placehold.co";

/**
 * Hosts we know are dead (the old WordPress site was decommissioned) — any
 * URL pointing at them is swapped to a deterministic picsum placeholder so we
 * never render a broken image on the storefront.
 */
const DEAD_HOSTS = [
  "electreia.co.uk",
  "www.electreia.co.uk",
  "ravora.co.uk",
  "www.ravora.co.uk",
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic photo fallback for a given seed — picsum returns a real image
 * that matches the product's visual weight far better than a grey rectangle.
 */
export function getPicsumFallback(seed: string, size = 400): string {
  const id = (hashString(seed) % 1000) + 1;
  return `https://picsum.photos/seed/electreia-${id}/${size}/${size}`;
}

function isDeadHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return DEAD_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function getProductImage(
  imageUrl: string | null | undefined,
  productName?: string,
  size = 400
): string {
  if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/"))) {
    if (isDeadHost(imageUrl)) {
      return getPicsumFallback(productName || imageUrl, size);
    }
    return imageUrl;
  }

  return getPicsumFallback(productName || "product", size);
}

export function getProductImageFallback(size = "400x400"): string {
  return `${PLACEHOLDER_BASE}/${size}/E0E0E0/999999?text=No+Image`;
}

