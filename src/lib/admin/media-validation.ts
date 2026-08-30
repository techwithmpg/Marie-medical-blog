import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const ALLOWED_MEDIA_BUCKETS = ["draft-assets", "public-assets"] as const;

export type AllowedMediaBucket = (typeof ALLOWED_MEDIA_BUCKETS)[number];

export const MAX_MEDIA_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Sanitizes a filename to ensure safe, predictable storage object paths.
 * Normalizes to lowercase and replaces unsafe characters with hyphens.
 */
export function sanitizeFilename(rawFilename: string): string {
  const baseName = rawFilename.split(/[/\\]/).pop() || "image";
  const lastDot = baseName.lastIndexOf(".");
  const rawStem = lastDot > 0 ? baseName.slice(0, lastDot) : baseName;
  const rawExtension = lastDot > 0 ? baseName.slice(lastDot + 1) : "";
  const stem =
    rawStem
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
  const extension = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "");
  return extension
    ? `${stem.slice(0, 220)}.${extension.slice(0, 16)}`
    : stem.slice(0, 237);
}

/**
 * Validates that a storage path is safe and normalized (no path traversal, etc.).
 */
export function isValidStoragePath(path: string): boolean {
  if (!path || typeof path !== "string" || path.length > 1024) return false;
  if (path.startsWith("/") || path.endsWith("/") || path.includes("//")) {
    return false;
  }
  // Disallow backslashes and control characters
  if (/[\\]|[\x00-\x1f]/.test(path)) {
    return false;
  }
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return false;
  }
  if (decoded !== path || decoded.includes("\\")) return false;
  return path
    .split("/")
    .every(
      (segment) => segment.length > 0 && segment !== "." && segment !== "..",
    );
}

export const prepareMediaUploadSchema = z
  .object({
    filename: z
      .string()
      .trim()
      .min(1, "Filename is required.")
      .max(255, "Filename is too long."),
    mimeType: z
      .string()
      .refine(
        (mime): mime is AllowedImageMimeType =>
          ALLOWED_IMAGE_MIME_TYPES.includes(mime as AllowedImageMimeType),
        {
          message: "Only JPEG, PNG, WebP, and AVIF images are supported.",
        },
      ),
    size: z
      .number()
      .int("File size must be an integer.")
      .positive("File size must be greater than 0.")
      .max(MAX_MEDIA_FILE_SIZE, "File size must not exceed 5 MB."),
  })
  .strict();

export type PrepareMediaUploadInput = z.infer<typeof prepareMediaUploadSchema>;

export const copyMediaToArticleSchema = z
  .object({
    articleId: z
      .string()
      .trim()
      .regex(UUID_REGEX, "Invalid article ID format."),
    sourceBucket: z.enum(ALLOWED_MEDIA_BUCKETS, {
      message: "Invalid source bucket.",
    }),
    sourcePath: z
      .string()
      .trim()
      .min(1, "Source path is required.")
      .refine(isValidStoragePath, { message: "Invalid source storage path." }),
  })
  .strict();

export type CopyMediaToArticleInput = z.infer<typeof copyMediaToArticleSchema>;

export const deleteMediaSchema = z
  .object({
    bucket: z.enum(ALLOWED_MEDIA_BUCKETS, {
      message: "Invalid storage bucket.",
    }),
    path: z
      .string()
      .trim()
      .min(1, "Storage path is required.")
      .refine(isValidStoragePath, { message: "Invalid storage path." }),
  })
  .strict();

export type DeleteMediaInput = z.infer<typeof deleteMediaSchema>;

export const compensateImageSchema = z
  .object({
    articleId: z
      .string()
      .trim()
      .regex(UUID_REGEX, "Invalid article ID format."),
    path: z
      .string()
      .trim()
      .min(1, "Storage path is required.")
      .refine(isValidStoragePath, { message: "Invalid storage path." }),
  })
  .strict();

export type CompensateImageInput = z.infer<typeof compensateImageSchema>;
