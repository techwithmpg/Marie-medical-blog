import { createClient } from "@/lib/supabase/server";

export interface SiteSocialLink {
  label: string;
  url: string;
}

export interface AdminSiteSettings {
  id: number;
  site_title: string;
  tagline: string | null;
  homepage_intro: string | null;
  disclaimer_text: string | null;
  default_seo_description: string | null;
  social_links: SiteSocialLink[];
  updated_at: string;
}

/**
 * Loads the singleton site settings record (id = 1) for the admin workspace.
 * Explicit SELECT only.
 * If no record exists, returns null without mutating the database.
 */
export async function getAdminSiteSettings(): Promise<AdminSiteSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "id, site_title, tagline, homepage_intro, disclaimer_text, default_seo_description, social_links, updated_at",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load site settings: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  let parsedSocialLinks: SiteSocialLink[] = [];
  if (Array.isArray(data.social_links)) {
    parsedSocialLinks = data.social_links.flatMap((item: unknown) => {
      if (typeof item !== "object" || item === null) return [];
      const raw = item as Record<string, unknown>;
      if (typeof raw.label !== "string" || typeof raw.url !== "string")
        return [];
      return [{ label: raw.label, url: raw.url }];
    });
  }

  return {
    id: data.id,
    site_title: data.site_title,
    tagline: data.tagline,
    homepage_intro: data.homepage_intro,
    disclaimer_text: data.disclaimer_text,
    default_seo_description: data.default_seo_description,
    social_links: parsedSocialLinks,
    updated_at: data.updated_at,
  };
}
