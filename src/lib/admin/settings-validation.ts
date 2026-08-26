import { z } from "zod";
import type { SiteSocialLink } from "./settings";

const trimmedNullableString = (maxLength: number, labelName: string) =>
  z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length <= maxLength, {
      message: `${labelName} cannot exceed ${maxLength} characters.`,
    })
    .transform((val) => (val.length === 0 ? null : val))
    .nullable()
    .optional();

export const siteSettingsCoreSchema = z.object({
  site_title: z
    .string({ error: "Site title is required." })
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: "Site title cannot be blank.",
    })
    .refine((val) => val.length <= 120, {
      message: "Site title cannot exceed 120 characters.",
    }),
  tagline: trimmedNullableString(200, "Tagline"),
  homepage_intro: trimmedNullableString(1200, "Homepage introduction"),
  disclaimer_text: trimmedNullableString(1500, "Compact medical disclaimer"),
  default_seo_description: trimmedNullableString(
    320,
    "Default SEO description",
  ),
});

export interface RawSocialLinkInput {
  label?: string | null;
  url?: string | null;
}

export interface ParseSocialLinksResult {
  links: SiteSocialLink[];
  errors: string[];
}

/**
 * Validates and normalizes raw social link row inputs.
 * - Blank label + blank URL pairs are omitted cleanly.
 * - Partial rows (label without URL or URL without label) produce validation errors.
 * - Valid URLs must be well-formed HTTPS URLs.
 * - Preserves array order without inferring or enforcing platform enums.
 */
export function validateSocialLinks(
  rawInputs: RawSocialLinkInput[],
): ParseSocialLinksResult {
  const links: SiteSocialLink[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rawInputs.length; i++) {
    const raw = rawInputs[i];
    const label = (raw.label || "").trim();
    const urlStr = (raw.url || "").trim();

    // Both blank: omit row
    if (!label && !urlStr) {
      continue;
    }

    // Partial row: label without URL
    if (label && !urlStr) {
      errors.push(`Social link #${i + 1} ("${label}") is missing a URL.`);
      continue;
    }

    // Partial row: URL without label
    if (!label && urlStr) {
      errors.push(`Social link #${i + 1} has a URL but is missing a label.`);
      continue;
    }

    // Label length check
    if (label.length > 80) {
      errors.push(`Social link #${i + 1} label cannot exceed 80 characters.`);
      continue;
    }

    // URL validation: must be valid HTTPS
    try {
      const parsedUrl = new URL(urlStr);
      if (parsedUrl.protocol !== "https:") {
        errors.push(
          `Social link #${i + 1} ("${label}") must use a secure HTTPS URL.`,
        );
        continue;
      }
      links.push({
        label,
        url: urlStr,
      });
    } catch {
      errors.push(
        `Social link #${i + 1} ("${label}") contains an invalid URL format.`,
      );
    }
  }

  return { links, errors };
}
