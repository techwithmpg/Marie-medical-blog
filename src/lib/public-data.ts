import { createClient } from "@/lib/supabase/server";

export interface PublicProfile {
  display_name: string;
  professional_tagline: string | null;
  short_bio: string | null;
  long_bio: string | null;
  education_summary: string | null;
  interests: string[] | null;
  social_links: Record<string, string> | null;
  cv_storage_path: string | null;
}

export interface PublicSiteSettings {
  site_title: string;
  tagline: string | null;
  default_seo_description: string | null;
  disclaimer_text: string | null;
  homepage_intro: string | null;
}

const DEFAULT_PROFILE: PublicProfile = {
  display_name: "Marie Medere",
  professional_tagline: "Medical Writing Portfolio & Educational Blog",
  short_bio:
    "Evidence-led medical writer specializing in translating complex clinical data, regulatory documentation, and healthcare science into rigorous, readable educational publications.",
  long_bio: null,
  education_summary: null,
  interests: null,
  social_links: null,
  cv_storage_path: null,
};

const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  site_title: "Marie Medere",
  tagline: "Medical Writing Portfolio & Educational Blog",
  default_seo_description:
    "Evidence-led medical writing portfolio and educational blog by Marie Medere, translating complex healthcare research and clinical evidence into clear, authoritative communication.",
  disclaimer_text:
    "This publication provides educational content only and does not constitute medical advice.",
  homepage_intro:
    "Translating complex clinical evidence, healthcare research, and regulatory documentation into precise, accessible communication.",
};

export async function getPublicProfile(): Promise<PublicProfile> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "display_name, professional_tagline, short_bio, long_bio, education_summary, interests, social_links, cv_storage_path",
      )
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_PROFILE;
    }

    return {
      display_name: data.display_name || DEFAULT_PROFILE.display_name,
      professional_tagline:
        data.professional_tagline || DEFAULT_PROFILE.professional_tagline,
      short_bio: data.short_bio || DEFAULT_PROFILE.short_bio,
      long_bio: data.long_bio,
      education_summary: data.education_summary,
      interests: Array.isArray(data.interests) ? data.interests : null,
      social_links:
        typeof data.social_links === "object" && data.social_links !== null
          ? (data.social_links as Record<string, string>)
          : null,
      cv_storage_path: data.cv_storage_path,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "site_title, tagline, default_seo_description, disclaimer_text, homepage_intro",
      )
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    return {
      site_title: data.site_title || DEFAULT_SITE_SETTINGS.site_title,
      tagline: data.tagline || DEFAULT_SITE_SETTINGS.tagline,
      default_seo_description:
        data.default_seo_description ||
        DEFAULT_SITE_SETTINGS.default_seo_description,
      disclaimer_text:
        data.disclaimer_text || DEFAULT_SITE_SETTINGS.disclaimer_text,
      homepage_intro:
        data.homepage_intro || DEFAULT_SITE_SETTINGS.homepage_intro,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
