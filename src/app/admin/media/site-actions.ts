"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_MEDIA_FILE_SIZE,
  sanitizeFilename,
} from "@/lib/admin/media-validation";

import { getStorageObjectFacts } from "@/lib/admin/media";

import {
  assignSiteMediaSchema,
  clearSiteMediaSchema,
  siteMediaPresentationSchema,
  SITE_MEDIA_SLOT_META,
  type AssignSiteMediaInput,
  type ClearSiteMediaInput,
  type SiteMediaPresentationInput,
  type SiteMediaSlot,
} from "@/lib/admin/site-media-validation";

import {
  getSiteMediaPublicUrl,
  type AdminSiteMediaPlacement,
} from "@/lib/admin/site-media";

interface Result {
  success: boolean;
  error?: string;
  placement?: AdminSiteMediaPlacement;
}

function placementFromRow(
  supabase: Awaited<ReturnType<typeof createClient>>,

  row: {
    slot: SiteMediaSlot;
    storage_path: string;
    alt_text: string | null;
    is_decorative: boolean;
    desktop_focal_x: number;
    desktop_focal_y: number;
    mobile_focal_x: number;
    mobile_focal_y: number;
  },
): AdminSiteMediaPlacement {
  const meta = SITE_MEDIA_SLOT_META[row.slot];

  return {
    slot: row.slot,

    label: meta.label,
    description: meta.description,
    mobileRule: meta.mobileRule,

    storagePath: row.storage_path,
    altText: row.alt_text,
    isDecorative: row.is_decorative,

    desktopFocalX: row.desktop_focal_x,
    desktopFocalY: row.desktop_focal_y,

    mobileFocalX: row.mobile_focal_x,
    mobileFocalY: row.mobile_focal_y,

    previewUrl: getSiteMediaPublicUrl(supabase, row.storage_path),
  };
}

async function removeOldSiteCopy(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null,
) {
  if (!path || !path.startsWith("site/")) {
    return;
  }

  const { data, error } = await supabase
    .from("site_media_slots")
    .select("slot")
    .eq("storage_path", path)
    .limit(1);

  if (error) {
    return;
  }

  if ((data?.length ?? 0) > 0) {
    return;
  }

  await supabase.storage.from("public-assets").remove([path]);
}

export async function assignSiteMediaAction(
  input: AssignSiteMediaInput,
): Promise<Result> {
  await requireAdmin();

  const parsed = assignSiteMediaSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ?? "Invalid website image assignment.",
    };
  }

  const {
    slot,
    sourceBucket,
    sourcePath,
    altText,
    isDecorative,
    desktopFocalX,
    desktopFocalY,
    mobileFocalX,
    mobileFocalY,
  } = parsed.data;

  const supabase = await createClient();

  const facts = await getStorageObjectFacts(supabase, sourceBucket, sourcePath);

  if (!facts) {
    return {
      success: false,
      error: "The selected source image no longer exists.",
    };
  }

  if (
    facts.size === null ||
    facts.size <= 0 ||
    facts.size > MAX_MEDIA_FILE_SIZE
  ) {
    return {
      success: false,
      error: "Website images must not exceed 5 MB.",
    };
  }

  if (
    !facts.mimeType ||
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      facts.mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return {
      success: false,
      error: "Website images support JPEG, PNG, WebP and AVIF.",
    };
  }

  const { data: previous, error: previousError } = await supabase
    .from("site_media_slots")
    .select("storage_path")
    .eq("slot", slot)
    .maybeSingle();

  if (previousError) {
    return {
      success: false,
      error: "Unable to inspect the current website image.",
    };
  }

  const filename = sanitizeFilename(sourcePath.split("/").pop() || "image");

  const destinationPath = `site/${slot}/${crypto.randomUUID()}-${filename}`;

  let copyError = null;

  if (sourceBucket === "public-assets") {
    const copy = await supabase.storage
      .from("public-assets")
      .copy(sourcePath, destinationPath);

    copyError = copy.error;
  } else {
    const copy = await supabase.storage
      .from("draft-assets")
      .copy(sourcePath, destinationPath, {
        destinationBucket: "public-assets",
      });

    copyError = copy.error;
  }

  if (copyError) {
    return {
      success: false,
      error: "Unable to create the website-owned image copy.",
    };
  }

  const { data: saved, error: saveError } = await supabase
    .from("site_media_slots")
    .upsert(
      {
        slot,

        storage_path: destinationPath,

        alt_text: isDecorative ? null : altText?.trim() || null,

        is_decorative: isDecorative,

        desktop_focal_x: desktopFocalX,

        desktop_focal_y: desktopFocalY,

        mobile_focal_x: mobileFocalX,

        mobile_focal_y: mobileFocalY,
      },

      {
        onConflict: "slot",
      },
    )
    .select(
      `
      slot,
      storage_path,
      alt_text,
      is_decorative,
      desktop_focal_x,
      desktop_focal_y,
      mobile_focal_x,
      mobile_focal_y
    `,
    )
    .single();

  if (saveError || !saved) {
    await supabase.storage.from("public-assets").remove([destinationPath]);

    return {
      success: false,
      error:
        "The assignment failed. The new copy was automatically cleaned up.",
    };
  }

  const oldPath =
    typeof previous?.storage_path === "string" ? previous.storage_path : null;

  if (oldPath && oldPath !== destinationPath) {
    await removeOldSiteCopy(supabase, oldPath);
  }

  revalidatePath("/admin/media");

  return {
    success: true,

    placement: placementFromRow(
      supabase,
      saved as Parameters<typeof placementFromRow>[1],
    ),
  };
}

export async function updateSiteMediaPresentationAction(
  input: SiteMediaPresentationInput,
): Promise<Result> {
  await requireAdmin();

  const parsed = siteMediaPresentationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid image presentation.",
    };
  }

  const {
    slot,
    altText,
    isDecorative,
    desktopFocalX,
    desktopFocalY,
    mobileFocalX,
    mobileFocalY,
  } = parsed.data;

  const supabase = await createClient();

  const { data: saved, error } = await supabase
    .from("site_media_slots")
    .update({
      alt_text: isDecorative ? null : altText?.trim() || null,

      is_decorative: isDecorative,

      desktop_focal_x: desktopFocalX,

      desktop_focal_y: desktopFocalY,

      mobile_focal_x: mobileFocalX,

      mobile_focal_y: mobileFocalY,
    })
    .eq("slot", slot)
    .select(
      `
      slot,
      storage_path,
      alt_text,
      is_decorative,
      desktop_focal_x,
      desktop_focal_y,
      mobile_focal_x,
      mobile_focal_y
    `,
    )
    .maybeSingle();

  if (error || !saved) {
    return {
      success: false,
      error: "No saved image exists for this placement.",
    };
  }

  revalidatePath("/admin/media");

  return {
    success: true,

    placement: placementFromRow(
      supabase,
      saved as Parameters<typeof placementFromRow>[1],
    ),
  };
}

export async function clearSiteMediaAction(
  input: ClearSiteMediaInput,
): Promise<Result> {
  await requireAdmin();

  const parsed = clearSiteMediaSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid website placement.",
    };
  }

  const supabase = await createClient();

  const { data: existing, error: lookupError } = await supabase
    .from("site_media_slots")
    .select("storage_path")
    .eq("slot", parsed.data.slot)
    .maybeSingle();

  if (lookupError) {
    return {
      success: false,
      error: "Unable to inspect this placement.",
    };
  }

  if (!existing) {
    return {
      success: true,
    };
  }

  const { error } = await supabase
    .from("site_media_slots")
    .delete()
    .eq("slot", parsed.data.slot);

  if (error) {
    return {
      success: false,
      error: "Unable to clear this placement.",
    };
  }

  const oldPath =
    typeof existing.storage_path === "string" ? existing.storage_path : null;

  await removeOldSiteCopy(supabase, oldPath);

  revalidatePath("/admin/media");

  return {
    success: true,
  };
}
