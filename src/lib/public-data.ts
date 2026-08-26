import { cache } from "react";
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

export interface PublicSiteSocialLink {
  label: string;
  url: string;
}

export interface PublicSiteSettings {
  site_title: string;
  tagline: string | null;
  default_seo_description: string | null;
  disclaimer_text: string | null;
  homepage_intro: string | null;
  social_links: PublicSiteSocialLink[];
}

const DEFAULT_PROFILE: PublicProfile = {
  display_name: "Marie Medere",
  professional_tagline: null,
  short_bio: null,
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
    "Medical Writing Portfolio & Educational Blog by Marie Medere.",
  disclaimer_text:
    "This publication provides educational content only and does not constitute medical advice.",
  homepage_intro: null,
  social_links: [],
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
      professional_tagline: data.professional_tagline || null,
      short_bio: data.short_bio || null,
      long_bio: data.long_bio || null,
      education_summary: data.education_summary || null,
      interests: Array.isArray(data.interests) ? data.interests : null,
      social_links:
        typeof data.social_links === "object" && data.social_links !== null
          ? (data.social_links as Record<string, string>)
          : null,
      cv_storage_path: data.cv_storage_path || null,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

async function getPublicSiteSettingsUncached(): Promise<PublicSiteSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "site_title, tagline, default_seo_description, disclaimer_text, homepage_intro, social_links",
      )
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    let parsedSocialLinks: PublicSiteSocialLink[] = [];
    if (Array.isArray(data.social_links)) {
      parsedSocialLinks = data.social_links.flatMap((item: unknown) => {
        if (typeof item !== "object" || item === null) return [];
        const raw = item as Record<string, unknown>;
        if (typeof raw.label !== "string" || typeof raw.url !== "string")
          return [];
        const label = raw.label.trim();
        const urlStr = raw.url.trim();
        if (!label || !urlStr) return [];
        try {
          const parsed = new URL(urlStr);
          if (parsed.protocol !== "https:") return [];
          return [{ label, url: urlStr }];
        } catch {
          return [];
        }
      });
    }

    return {
      site_title: data.site_title || DEFAULT_SITE_SETTINGS.site_title,
      tagline: data.tagline || DEFAULT_SITE_SETTINGS.tagline,
      default_seo_description:
        data.default_seo_description ||
        DEFAULT_SITE_SETTINGS.default_seo_description,
      disclaimer_text:
        data.disclaimer_text || DEFAULT_SITE_SETTINGS.disclaimer_text,
      homepage_intro: data.homepage_intro || null,
      social_links: parsedSocialLinks,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export const getPublicSiteSettings = cache(getPublicSiteSettingsUncached);

export async function getPublicAssetUrl(
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  try {
    const supabase = await createClient();
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    return data.publicUrl || null;
  } catch {
    return null;
  }
}

export async function getPublicCvUrl(
  cvStoragePath: string | null,
): Promise<string | null> {
  return getPublicAssetUrl(cvStoragePath);
}
