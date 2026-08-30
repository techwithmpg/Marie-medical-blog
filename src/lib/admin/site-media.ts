import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import {
  SITE_MEDIA_SLOTS,
  SITE_MEDIA_SLOT_META,
  type SiteMediaSlot,
} from "@/lib/admin/site-media-validation";

export interface AdminSiteMediaPlacement {
  slot: SiteMediaSlot;

  label: string;
  description: string;
  mobileRule: string;

  storagePath: string | null;
  altText: string | null;
  isDecorative: boolean;

  desktopFocalX: number;
  desktopFocalY: number;

  mobileFocalX: number;
  mobileFocalY: number;

  previewUrl: string | null;
}

interface SiteMediaRow {
  slot: SiteMediaSlot;
  storage_path: string;
  alt_text: string | null;
  is_decorative: boolean;
  desktop_focal_x: number;
  desktop_focal_y: number;
  mobile_focal_x: number;
  mobile_focal_y: number;
}

export function getSiteMediaPublicUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
) {
  return supabase.storage.from("public-assets").getPublicUrl(path).data
    .publicUrl;
}

export async function getAdminSiteMediaPlacements(): Promise<
  AdminSiteMediaPlacement[]
> {
  await requireAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase.from("site_media_slots").select(`
      slot,
      storage_path,
      alt_text,
      is_decorative,
      desktop_focal_x,
      desktop_focal_y,
      mobile_focal_x,
      mobile_focal_y
    `);

  if (error) {
    throw new Error(
      "Unable to load website image placements. Apply the local D036 migration first.",
    );
  }

  const rows = new Map<SiteMediaSlot, SiteMediaRow>();

  for (const row of (data ?? []) as SiteMediaRow[]) {
    if (SITE_MEDIA_SLOTS.includes(row.slot)) {
      rows.set(row.slot, row);
    }
  }

  return SITE_MEDIA_SLOTS.map((slot) => {
    const row = rows.get(slot);
    const meta = SITE_MEDIA_SLOT_META[slot];

    return {
      slot,

      label: meta.label,
      description: meta.description,
      mobileRule: meta.mobileRule,

      storagePath: row?.storage_path ?? null,
      altText: row?.alt_text ?? null,
      isDecorative: row?.is_decorative ?? false,

      desktopFocalX: row?.desktop_focal_x ?? 50,
      desktopFocalY: row?.desktop_focal_y ?? 50,

      mobileFocalX: row?.mobile_focal_x ?? 50,
      mobileFocalY: row?.mobile_focal_y ?? 50,

      previewUrl: row?.storage_path
        ? getSiteMediaPublicUrl(supabase, row.storage_path)
        : null,
    };
  });
}
