"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_MEDIA_FILE_SIZE,
  prepareMediaUploadSchema,
  copyMediaToArticleSchema,
  deleteMediaSchema,
  compensateImageSchema,
  sanitizeFilename,
  type PrepareMediaUploadInput,
  type CopyMediaToArticleInput,
  type DeleteMediaInput,
  type CompensateImageInput,
} from "@/lib/admin/media-validation";
import {
  checkAssetUsage,
  getAdminMediaInventory,
  getStorageObjectFacts,
  type AdminMediaRecord,
} from "@/lib/admin/media";

export interface PrepareUploadResult {
  success: boolean;
  path?: string;
  token?: string;
  error?: string;
}

export interface CopyMediaResult {
  success: boolean;
  destinationPath?: string;
  error?: string;
}

export interface DeleteMediaResult {
  success: boolean;
  message: string;
  error?: "INVALID_PAYLOAD" | "IN_USE" | "NOT_FOUND" | "DELETE_FAILED";
}

export interface CompensateResult {
  success: boolean;
  error?: string;
}

export interface LoadMediaResult {
  success: boolean;
  items: AdminMediaRecord[];
  error?: string;
}

export async function loadMediaPickerAction(): Promise<LoadMediaResult> {
  await requireAdmin();
  try {
    return { success: true, items: await getAdminMediaInventory() };
  } catch {
    return { success: false, items: [], error: "Media inventory is unavailable. Please try again." };
  }
}

/**
 * Server Action: Prepares a private-by-default signed upload URL for a new media asset.
 * Enforces admin authorization, MIME validation, 5 MB file size limit, and immutable unique paths.
 */
export async function prepareMediaUploadAction(
  input: PrepareMediaUploadInput,
): Promise<PrepareUploadResult> {
  await requireAdmin();

  const parsed = prepareMediaUploadSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid upload parameters.";
    return { success: false, error: firstError };
  }

  const sanitized = sanitizeFilename(parsed.data.filename);
  const uniqueId = crypto.randomUUID();
  const storagePath = `library/${uniqueId}-${sanitized}`;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("draft-assets")
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      return {
        success: false,
        error: "Unable to prepare upload destination. Please try again.",
      };
    }

    return {
      success: true,
      path: storagePath,
      token: data.token,
    };
  } catch {
    return { success: false, error: "Unable to prepare upload destination. Please try again." };
  }
}

/**
 * Server Action: Copies an eligible media library asset into a private article-owned path.
 * Never shares a single physical object between articles; creates a unique private copy.
 */
export async function copyMediaToArticleAction(
  input: CopyMediaToArticleInput,
): Promise<CopyMediaResult> {
  await requireAdmin();

  const parsed = copyMediaToArticleSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid media selection parameters.";
    return { success: false, error: firstError };
  }

  const { articleId, sourceBucket, sourcePath } = parsed.data;

  const supabase = await createClient();

  // 1. Verify article exists
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id, status")
    .eq("id", articleId)
    .maybeSingle();

  if (articleError || !article) {
    return {
      success: false,
      error: "Article not found. Please save the draft before selecting an image.",
    };
  }

  // 2. Validate authoritative exact-path facts from Storage.
  const sourceFacts = await getStorageObjectFacts(supabase, sourceBucket, sourcePath);
  if (!sourceFacts) {
    return {
      success: false,
      error: "Source image not found in storage.",
    };
  }

  const { size, mimeType: mime } = sourceFacts;

  if (size === null || size <= 0 || size > MAX_MEDIA_FILE_SIZE) {
    return {
      success: false,
      error: "Selected image has missing or unsupported size metadata, or exceeds the 5 MB draft limit.",
    };
  }

  if (!mime || !ALLOWED_IMAGE_MIME_TYPES.includes(mime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return {
      success: false,
      error: "Selected image format is not supported for article reuse.",
    };
  }

  // 3. Generate unique article-owned private destination
  const sanitized = sanitizeFilename(sourcePath.split("/").pop() || "image");
  const destinationPath = `articles/${articleId}/featured/${crypto.randomUUID()}-${sanitized}`;

  // 4. Perform authenticated copy into draft-assets
  try {
    if (sourceBucket === "draft-assets") {
      const { error: copyError } = await supabase.storage
        .from("draft-assets")
        .copy(sourcePath, destinationPath);

      if (copyError) {
        return {
          success: false,
          error: "Unable to copy the selected image. No article changes were saved.",
        };
      }
    } else {
      // Cross-bucket copy: public-assets -> draft-assets
      const { error: copyError } = await supabase.storage
        .from("public-assets")
        .copy(sourcePath, destinationPath, {
          destinationBucket: "draft-assets",
        });

      if (copyError) {
        return {
          success: false,
          error: "Unable to copy the selected image. No article changes were saved.",
        };
      }
    }

    return {
      success: true,
      destinationPath,
    };
  } catch {
    return { success: false, error: "Unable to copy the selected image. No article changes were saved." };
  }
}

/**
 * Server Action: Deletes an unreferenced media asset.
 * Strictly checks usage before removal and blocks deletion if referenced by any article or profile.
 */
export async function deleteMediaAction(
  input: DeleteMediaInput,
): Promise<DeleteMediaResult> {
  await requireAdmin();

  const parsed = deleteMediaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid deletion request.",
      error: "INVALID_PAYLOAD",
    };
  }

  const { bucket, path } = parsed.data;
  const supabase = await createClient();

  const facts = await getStorageObjectFacts(supabase, bucket, path);
  if (!facts) {
    return { success: false, message: "Asset was not found.", error: "NOT_FOUND" };
  }
  if (
    facts.size === null ||
    facts.size <= 0 ||
    !facts.mimeType ||
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      facts.mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return { success: false, message: "Only verified Media image assets can be deleted here.", error: "INVALID_PAYLOAD" };
  }

  // Check usage twice, immediately around mutation, and fail closed if either lookup fails.
  let usage;
  try {
    usage = await checkAssetUsage(supabase, bucket, path);
  } catch {
    return { success: false, message: "Usage could not be verified. Nothing was deleted.", error: "DELETE_FAILED" };
  }
  if (usage.isUsed) {
    return {
      success: false,
      message: `Cannot delete asset: ${usage.locationDescription || "it is currently referenced"}.`,
      error: "IN_USE",
    };
  }

  try {
    usage = await checkAssetUsage(supabase, bucket, path);
  } catch {
    return { success: false, message: "Usage could not be rechecked. Nothing was deleted.", error: "DELETE_FAILED" };
  }
  if (usage.isUsed) {
    return { success: false, message: `Cannot delete asset: ${usage.locationDescription || "it is currently referenced"}.`, error: "IN_USE" };
  }

  const { error: removeError } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (removeError) {
    return {
      success: false,
      message: "Unable to delete asset from storage. Please try again.",
      error: "DELETE_FAILED",
    };
  }

  revalidatePath("/admin/media");

  return {
    success: true,
    message: "Asset deleted successfully.",
  };
}

/**
 * Server Action: Compensates (removes) an unpersisted article image copy if draft save fails
 * or if the user replaces an unsaved candidate before persistence.
 */
export async function compensateUnsavedArticleImageAction(
  input: CompensateImageInput,
): Promise<CompensateResult> {
  await requireAdmin();

  const parsed = compensateImageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid compensation request." };
  }

  const { articleId, path } = parsed.data;
  const expectedPrefix = `articles/${articleId}/featured/`;
  if (!path.startsWith(expectedPrefix)) {
    return { success: false, error: "Path does not match article namespace." };
  }

  const supabase = await createClient();

  // Ensure this path is NOT currently persisted in articles table
  const { data: persistedArticle, error: usageError } = await supabase
    .from("articles")
    .select("id")
    .eq("featured_image_path", path)
    .maybeSingle();

  if (usageError) return { success: false, error: "Unable to verify image usage; cleanup was not attempted." };
  if (persistedArticle) {
    // Do NOT delete already-persisted article images
    return { success: true };
  }

  const { error: removeError } = await supabase.storage
    .from("draft-assets")
    .remove([path]);

  if (removeError) {
    return { success: false, error: "Unable to clean up the unpersisted image copy." };
  }

  return { success: true };
}
