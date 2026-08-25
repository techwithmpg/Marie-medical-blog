/**
 * Publishing and canonical URL utilities for Marie Medical Blog (D030).
 * Implements canonical slug generation, validation, normalization, provisional slug checks,
 * and ProseMirror meaningful text content verification.
 */

const KEBAB_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROVISIONAL_UUID_SLUG_REGEX =
  /^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SLUG_LENGTH = 80;

/**
 * Extracts an 8-character hex fallback identifier from an article UUID.
 */
function getDeterministicFallbackSuffix(articleId?: string): string {
  if (typeof articleId === "string") {
    const hex = articleId.replace(/[^a-f0-9]/gi, "").toLowerCase();
    if (hex.length >= 8) {
      return hex.slice(0, 8);
    }
  }
  return "fallback";
}

/**
 * Normalizes a candidate title into a canonical kebab-case slug candidate.
 * 1. Unicode NFKD normalization to strip diacritics / accents.
 * 2. Lowercases string.
 * 3. Converts non-alphanumeric character sequences into single hyphens.
 * 4. Strips leading and trailing hyphens.
 * 5. Truncates to max 80 characters without trailing hyphen.
 * 6. Falls back to a deterministic fallback (article-<id_prefix>) if empty.
 */
export function generateCanonicalSlug(
  title: string,
  articleId?: string,
): string {
  if (!title || typeof title !== "string") {
    return `article-${getDeterministicFallbackSuffix(articleId)}`;
  }

  // 1. Strip accents / diacritics via NFKD normalization
  const normalized = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // 2. Convert non-alphanumerics into hyphens
  let slug = normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  // 3. Truncate to maximum 80 characters without trailing hyphen
  if (slug.length > MAX_SLUG_LENGTH) {
    slug = slug.slice(0, MAX_SLUG_LENGTH).replace(/-+$/, "");
  }

  // 4. Fallback if empty
  if (!slug || slug.length === 0) {
    return `article-${getDeterministicFallbackSuffix(articleId)}`;
  }

  return slug;
}

/**
 * Validates whether a slug string satisfies the canonical kebab-case format and length restrictions.
 */
export function isValidCanonicalSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_SLUG_LENGTH) return false;
  if (PROVISIONAL_UUID_SLUG_REGEX.test(trimmed)) return false;
  return KEBAB_REGEX.test(trimmed);
}

/**
 * Checks whether a slug is an internal provisional draft slug pattern.
 */
export function isProvisionalSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false;
  return PROVISIONAL_UUID_SLUG_REGEX.test(slug.trim());
}

/**
 * Sanitizes and normalizes user-provided slug input.
 */
export function normalizeSlugCandidate(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, "");
}

/**
 * Recursively inspects a ProseMirror document object to verify whether
 * it contains at least one text node with non-whitespace characters.
 * Empty documents, empty paragraphs ({ "type": "paragraph" }), and whitespace-only text
 * nodes will return false.
 */
export function hasMeaningfulArticleContent(content: unknown): boolean {
  if (!content || typeof content !== "object") return false;
  const doc = content as { type?: string; content?: unknown[] };
  if (doc.type !== "doc" || !Array.isArray(doc.content)) return false;

  function traverse(nodes: unknown[]): boolean {
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      const n = node as { type?: string; text?: unknown; content?: unknown[] };
      if (
        n.type === "text" &&
        typeof n.text === "string" &&
        n.text.trim().length > 0
      ) {
        return true;
      }
      if (Array.isArray(n.content) && traverse(n.content)) {
        return true;
      }
    }
    return false;
  }

  return traverse(doc.content);
}
