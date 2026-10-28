/**
 * Neutral placeholder for products without a working photo. Never a random
 * stock photo — a picture of something else misrepresents the product.
 */
export const PRODUCT_PLACEHOLDER = "/product-placeholder.svg";

/**
 * Hosts we know are dead (the old WordPress site was decommissioned and its
 * uploads never reached the images.electreia.co.uk CDN) — any URL pointing at
 * them is swapped to the placeholder so we never render a broken image.
 */
const DEAD_HOSTS = [
  "electreia.co.uk",
  "www.electreia.co.uk",
  "images.electreia.co.uk",
  "ravora.co.uk",
  "www.ravora.co.uk",
];

function isDeadHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return DEAD_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function getProductImage(imageUrl: string | null | undefined): string {
  if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/")) && !isDeadHost(imageUrl)) {
    return imageUrl;
  }
  return PRODUCT_PLACEHOLDER;
}

