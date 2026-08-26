"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  siteSettingsCoreSchema,
  validateSocialLinks,
  type RawSocialLinkInput,
} from "@/lib/admin/settings-validation";

export interface SiteSettingsActionResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  error?: string;
}

export async function updateSiteSettingsAction(
  _prevState: SiteSettingsActionResult | null,
  formData: FormData,
): Promise<SiteSettingsActionResult> {
  await requireAdmin();

  // 1. Parse core text fields
  const rawTitle = formData.get("site_title")?.toString() || "";
  const rawTagline = formData.get("tagline")?.toString() ?? "";
  const rawIntro = formData.get("homepage_intro")?.toString() ?? "";
  const rawDisclaimer = formData.get("disclaimer_text")?.toString() ?? "";
  const rawSeoDesc = formData.get("default_seo_description")?.toString() ?? "";

  const coreParse = siteSettingsCoreSchema.safeParse({
    site_title: rawTitle,
    tagline: rawTagline,
    homepage_intro: rawIntro,
    disclaimer_text: rawDisclaimer,
    default_seo_description: rawSeoDesc,
  });

  const fieldErrors: Record<string, string[]> = {};

  if (!coreParse.success) {
    const formatted = coreParse.error.flatten().fieldErrors;
    for (const [key, msgs] of Object.entries(formatted)) {
      if (msgs && msgs.length > 0) {
        fieldErrors[key] = msgs;
      }
    }
  }

  // 2. Parse social links
  const socialLabels = formData.getAll("socialLabel");
  const socialUrls = formData.getAll("socialUrl");

  const rawSocialInputs: RawSocialLinkInput[] = [];
  const maxRows = Math.max(socialLabels.length, socialUrls.length);

  for (let i = 0; i < maxRows; i++) {
    rawSocialInputs.push({
      label: socialLabels[i]?.toString() || "",
      url: socialUrls[i]?.toString() || "",
    });
  }

  const socialParse = validateSocialLinks(rawSocialInputs);

  if (socialParse.errors.length > 0) {
    fieldErrors.social_links = socialParse.errors;
  }

  if (Object.keys(fieldErrors).length > 0 || !coreParse.success) {
    return {
      success: false,
      message: "Please correct the highlighted form errors before saving.",
      fieldErrors,
      error: "VALIDATION_FAILED",
    };
  }

  const validatedCore = coreParse.data;
  const validatedSocialLinks = socialParse.links;

  // 3. Persist singleton id = 1 via authenticated server client
  const supabase = await createClient();

  const { error: upsertError } = await supabase.from("site_settings").upsert(
    {
      id: 1,
      site_title: validatedCore.site_title,
      tagline: validatedCore.tagline,
      homepage_intro: validatedCore.homepage_intro,
      disclaimer_text: validatedCore.disclaimer_text,
      default_seo_description: validatedCore.default_seo_description,
      social_links: validatedSocialLinks,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (upsertError) {
    return {
      success: false,
      message: "Failed to save site settings. Please try again.",
      error: "PERSISTENCE_FAILED",
    };
  }

  // 4. Targeted revalidation
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Site settings saved successfully.",
  };
}
