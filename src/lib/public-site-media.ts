import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type PublicSiteMediaSlot =
  | "home_hero"
  | "about_hero"
  | "portfolio_hero"
  | "contact_hero"
  | "author_portrait"
  | "default_social";

export interface PublicSiteMediaPlacement {
  slot: PublicSiteMediaSlot;
  publicUrl: string;
  altText: string;
  isDecorative: boolean;
  desktopFocalX: number;
  desktopFocalY: number;
  mobileFocalX: number;
  mobileFocalY: number;
}

/*
 * Compatibility type used by the existing ManagedSiteImage
 * component and earlier public-page implementation.
 */
export type PublicSiteMedia = PublicSiteMediaPlacement;

/*
 * D036 site_media_slots was introduced after the original
 * generated Supabase Database types. Keep this narrow local
 * row definition until generated types are formally refreshed.
 */
interface SiteMediaRow {
  slot: string;
  storage_path: string;
  alt_text: string | null;
  is_decorative: boolean;
  desktop_focal_x: number | null;
  desktop_focal_y: number | null;
  mobile_focal_x: number | null;
  mobile_focal_y: number | null;
}

function normalizeFocal(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 50;
  }

  return Math.max(0, Math.min(100, parsed));
}

async function getPublicSiteMediaPlacementUncached(
  slot: PublicSiteMediaSlot,
): Promise<PublicSiteMediaPlacement | null> {
  try {
    const supabase = await createClient();

    const { data: rawData, error } = await supabase
      .from("site_media_slots")
      .select(
        [
          "slot",
          "storage_path",
          "alt_text",
          "is_decorative",
          "desktop_focal_x",
          "desktop_focal_y",
          "mobile_focal_x",
          "mobile_focal_y",
        ].join(", "),
      )
      .eq("slot", slot)
      .maybeSingle();

    /*
     * The local D036 table exists, but generated Database
     * types do not yet include it. Convert only this result
     * boundary to the known D036 row contract.
     */
    const data = rawData as unknown as SiteMediaRow | null;

    if (
      error ||
      !data ||
      typeof data.storage_path !== "string" ||
      !data.storage_path.trim()
    ) {
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("public-assets")
      .getPublicUrl(data.storage_path);

    if (!publicData.publicUrl) {
      return null;
    }

    return {
      slot,
      publicUrl: publicData.publicUrl,
      altText: data.is_decorative ? "" : (data.alt_text ?? ""),
      isDecorative: data.is_decorative,
      desktopFocalX: normalizeFocal(data.desktop_focal_x),
      desktopFocalY: normalizeFocal(data.desktop_focal_y),
      mobileFocalX: normalizeFocal(data.mobile_focal_x),
      mobileFocalY: normalizeFocal(data.mobile_focal_y),
    };
  } catch {
    return null;
  }
}

export const getPublicSiteMediaPlacement = cache(
  getPublicSiteMediaPlacementUncached,
);

/*
 * Existing Home / About / managed-image API.
 * Keep both names so previous and newer page code coexist.
 */
export const getPublicSiteMediaSlot = getPublicSiteMediaPlacement;
