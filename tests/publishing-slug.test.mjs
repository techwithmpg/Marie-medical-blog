import test from "node:test";
import assert from "node:assert/strict";
import {
  generateCanonicalSlug,
  isValidCanonicalSlug,
  isProvisionalSlug,
  normalizeSlugCandidate,
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

test("generateCanonicalSlug handles empty or non-string inputs safely with fallback", () => {
  const fallbackEmpty = generateCanonicalSlug("");
  assert.match(fallbackEmpty, /^article-[a-z0-9]{8}$/);

  const fallbackSpecial = generateCanonicalSlug("!@#$%^&*()");
  assert.match(fallbackSpecial, /^article-[a-z0-9]{8}$/);
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
