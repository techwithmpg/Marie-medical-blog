import test from "node:test";
import assert from "node:assert/strict";
import {
  generateCanonicalSlug,
  isValidCanonicalSlug,
  isProvisionalSlug,
  normalizeSlugCandidate,
  hasMeaningfulArticleContent,
} from "../src/lib/admin/publishing.ts";

test("generateCanonicalSlug creates clean kebab-case from standard titles", () => {
  assert.equal(
    generateCanonicalSlug("Evidence-Based Thyroid Management"),
    "evidence-based-thyroid-management",
  );
  assert.equal(
    generateCanonicalSlug(
      "Cardiovascular Disease in 2026: Clinical Insights & Trials!",
    ),
    "cardiovascular-disease-in-2026-clinical-insights-trials",
  );
});

test("generateCanonicalSlug strips accents and diacritics via NFKD normalization", () => {
  assert.equal(
    generateCanonicalSlug("Café au Lait Macules & Neurofibromatosis"),
    "cafe-au-lait-macules-neurofibromatosis",
  );
  assert.equal(
    generateCanonicalSlug("Über die Schilddrüse und Hormontherapie"),
    "uber-die-schilddruse-und-hormontherapie",
  );
});

test("generateCanonicalSlug enforces 80 character maximum length", () => {
  const longTitle =
    "A Very Long Medical Article Title That Exceeds Eighty Characters In Order To Test The Dynamic Base Truncation Mechanism";
  const slug = generateCanonicalSlug(longTitle);
  assert.ok(slug.length <= 80, `Slug length ${slug.length} must be <= 80`);
  assert.ok(!slug.endsWith("-"), "Slug must not end with a trailing hyphen");
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});

test("generateCanonicalSlug produces deterministic fallback based on articleId", () => {
  const id1 = "80000000-0000-0000-0000-000000000001";
  const id2 = "90000000-0000-0000-0000-000000000002";

  // Same article ID produces same fallback repeatedly
  const fallback1a = generateCanonicalSlug("", id1);
  const fallback1b = generateCanonicalSlug("   ", id1);
  const fallback1c = generateCanonicalSlug("!@#$%", id1);

  assert.equal(fallback1a, "article-80000000");
  assert.equal(fallback1b, "article-80000000");
  assert.equal(fallback1c, "article-80000000");

  // Different article ID produces different fallback
  const fallback2 = generateCanonicalSlug("", id2);
  assert.equal(fallback2, "article-90000000");
  assert.notEqual(fallback1a, fallback2);

  // Fallback is valid kebab-case and <= 80 chars
  assert.ok(isValidCanonicalSlug(fallback1a));
  assert.ok(isValidCanonicalSlug(fallback2));
});

test("isValidCanonicalSlug validates format and length correctly", () => {
  assert.equal(isValidCanonicalSlug("thyroid-management-2026"), true);
  assert.equal(isValidCanonicalSlug("clinical-trials-phase-3"), true);

  // Rejects invalid characters
  assert.equal(isValidCanonicalSlug("Thyroid-Management"), false);
  assert.equal(isValidCanonicalSlug("thyroid_management"), false);
  assert.equal(isValidCanonicalSlug("thyroid--management"), false);
  assert.equal(isValidCanonicalSlug("-thyroid-management"), false);
  assert.equal(isValidCanonicalSlug("thyroid-management-"), false);
  assert.equal(isValidCanonicalSlug("thyroid management"), false);

  // Rejects length > 80
  const eightyOneChars = "a".repeat(81);
  assert.equal(isValidCanonicalSlug(eightyOneChars), false);

  // Rejects provisional draft pattern
  assert.equal(
    isValidCanonicalSlug("draft-80000000-0000-0000-0000-000000000001"),
    false,
  );
});

test("isProvisionalSlug correctly identifies system draft UUID slugs", () => {
  assert.equal(
    isProvisionalSlug("draft-80000000-0000-0000-0000-000000000001"),
    true,
  );
  assert.equal(
    isProvisionalSlug("DRAFT-80000000-0000-0000-0000-000000000001"),
    true,
  );
  assert.equal(isProvisionalSlug("evidence-based-thyroid-management"), false);
  assert.equal(isProvisionalSlug("draft-article-notes"), false);
});

test("normalizeSlugCandidate trims, lowercases, and sanitizes user input", () => {
  assert.equal(
    normalizeSlugCandidate("  Clinical Endocrinology Update 2026!  "),
    "clinical-endocrinology-update-2026",
  );
  assert.equal(
    normalizeSlugCandidate("custom--slug---test"),
    "custom-slug-test",
  );
});

test("hasMeaningfulArticleContent rejects empty and whitespace-only documents", () => {
  assert.equal(hasMeaningfulArticleContent(null), false);
  assert.equal(hasMeaningfulArticleContent(undefined), false);
  assert.equal(hasMeaningfulArticleContent(""), false);
  assert.equal(hasMeaningfulArticleContent({}), false);
  assert.equal(hasMeaningfulArticleContent({ type: "doc" }), false);
  assert.equal(
    hasMeaningfulArticleContent({ type: "doc", content: [] }),
    false,
  );
  assert.equal(
    hasMeaningfulArticleContent({
      type: "doc",
      content: [{ type: "paragraph" }],
    }),
    false,
  );
  assert.equal(
    hasMeaningfulArticleContent({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "" }],
        },
      ],
    }),
    false,
  );
  assert.equal(
    hasMeaningfulArticleContent({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "   \n\t  " }],
        },
      ],
    }),
    false,
  );
});

test("hasMeaningfulArticleContent accepts genuine text across node hierarchies", () => {
  // Simple paragraph with text
  assert.equal(
    hasMeaningfulArticleContent({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Clinical finding notes." }],
        },
      ],
    }),
    true,
  );

  // Heading with text
  assert.equal(
    hasMeaningfulArticleContent({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Methodology" }],
        },
      ],
    }),
    true,
  );

  // Nested bulletList -> listItem -> paragraph -> text
  assert.equal(
    hasMeaningfulArticleContent({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Item 1" }],
                },
              ],
            },
          ],
        },
      ],
    }),
    true,
  );
});
