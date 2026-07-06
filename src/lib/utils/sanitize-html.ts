/**
 * Sanitize product description HTML coming from vendor feeds (e.g. BigBuy).
 *
 * Strategy:
 *   1. Strip whole dangerous elements (script/style/iframe/embed/object/svg…)
 *      including their contents.
 *   2. Drop `on*` event handler attributes and `javascript:` URLs.
 *   3. Walk every remaining tag and keep it only if it's in the allow-list.
 *      Unknown tags are removed but their text content is preserved.
 *   4. For `<a>` allow only safe href schemes (http, https, mailto, tel, "/")
 *      and force target="_blank" rel="noopener noreferrer".
 *
 * Notes:
 *   - Pure regex-based sanitizer is good enough for trusted product descriptions.
 *   - It is NOT a general-purpose XSS firewall; do not use it for user-generated
 *     content. For that, use isomorphic-dompurify.
 */

const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "br",
  "p",
  "ul",
  "ol",
  "li",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
  "div",
  "hr",
  "small",
  "sub",
  "sup",
]);

const VOID_TAGS = new Set(["br", "hr"]);

// Remove dangerous elements and their inner content
const DANGEROUS_BLOCKS = /<(script|style|iframe|embed|object|form|svg|math|link|meta)\b[\s\S]*?<\/\1\s*>/gi;
// Self-closing or otherwise unmatched dangerous tags
const DANGEROUS_VOID = /<(script|style|iframe|embed|object|input|button|select|textarea|form|svg|math|link|meta)\b[^>]*\/?>/gi;
// HTML comments
const COMMENTS = /<!--[\s\S]*?-->/g;

const EVENT_HANDLER_ATTR = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const STYLE_ATTR = /\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const CLASS_ATTR = /\sclass\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

function extractAttr(attrs: string, name: string): string | null {
  const re = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const m = attrs.match(re);
  if (!m) return null;
  return m[2] ?? m[3] ?? m[4] ?? null;
}

function safeHref(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^(https?:|mailto:|tel:|\/)/i.test(trimmed)) return trimmed;
  return null;
}

export function sanitizeProductDescription(html: string): string {
  if (!html) return "";

  let s = html
    .replace(DANGEROUS_BLOCKS, "")
    .replace(DANGEROUS_VOID, "")
    .replace(COMMENTS, "");

  s = s.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g, (_match, slash, tagRaw, attrs) => {
    const tag = tagRaw.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      // Drop the tag, keep its text content
      return "";
    }

    // For void tags, allow nothing fancy
    if (VOID_TAGS.has(tag)) {
      return slash ? "" : `<${tag}>`;
    }

    if (tag === "a") {
      if (slash) return "</a>";
      const href = safeHref(extractAttr(attrs, "href"));
      if (!href) return ""; // strip the link entirely, keep its text
      const escaped = href.replace(/"/g, "&quot;");
      return `<a href="${escaped}" target="_blank" rel="noopener noreferrer">`;
    }

    // Drop all attributes (event handlers, style, class) for other tags
    void attrs;
    void EVENT_HANDLER_ATTR;
    void STYLE_ATTR;
    void CLASS_ATTR;

    return `<${slash}${tag}>`;
  });

  // Collapse multiple consecutive <br> and trim whitespace inside <p>
  s = s.replace(/(<br>\s*){3,}/g, "<br><br>");

  // If the source had no real <p>/<ul> structure but lots of <br><br>,
  // wrap each chunk in a <p> for better typography.
  if (!/<p\b|<ul\b|<ol\b/i.test(s)) {
    s = s
      .split(/<br>\s*<br>/i)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => `<p>${chunk}</p>`)
      .join("");
  }

  return s.trim();
}
