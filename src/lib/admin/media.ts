import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_MEDIA_FILE_SIZE,
  type AllowedMediaBucket,
} from "./media-validation";

export interface MediaUsageInfo {
  state: "unused" | "used" | "unknown";
  isUsed: boolean;
  canDelete: boolean;
  locationDescription?: string;
  articleId?: string;
  articleTitle?: string;
}

export interface AdminMediaRecord {
  id: string;
  bucket: AllowedMediaBucket;
  path: string;
  name: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  isPrivate: boolean;
  isEligibleForReuse: boolean;
  ineligibilityReason: string | null;
  usage: MediaUsageInfo;
  previewUrl: string | null;
}

interface RawStorageObject {
  name: string;
  id: string | null;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag?: string;
    size?: number;
    mimetype?: string;
    cacheControl?: string;
    lastModified?: string;
    contentLength?: number;
    httpStatusCode?: number;
  } | null;
}

interface ArticleUsageRow {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  featured_image_path: string | null;
}

interface ProfileUsageRow {
  id: string;
  cv_storage_path: string | null;
}

interface SiteMediaUsageRow {
  slot:
    | "home_hero"
    | "about_hero"
    | "portfolio_hero"
    | "contact_hero"
    | "author_portrait"
    | "default_social";

  storage_path: string;
}

/**
 * Recursively lists all objects in a bucket namespace up to maxDepth.
 * Handles pagination and skips directory markers cleanly.
 */
async function listBucketObjects(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: AllowedMediaBucket,
  prefix: string = "",
  currentDepth: number = 0,
  maxDepth: number = 12,
): Promise<
  Array<{
    path: string;
    name: string;
    metadata: RawStorageObject["metadata"];
    created_at: string;
    updated_at: string;
  }>
> {
  if (currentDepth > maxDepth) {
    throw new Error(`Storage traversal exceeded the safe depth for ${bucket}.`);
  }

  const results: Array<{
    path: string;
    name: string;
    metadata: RawStorageObject["metadata"];
    created_at: string;
    updated_at: string;
  }> = [];

  const PAGE_SIZE = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error || !data) throw new Error(`Unable to list ${bucket}.`);

    const items = data as unknown as RawStorageObject[];
    if (items.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      offset += PAGE_SIZE;
    }

    for (const item of items) {
      // If id is null or metadata is null, item is a directory prefix
      const isDirectory = item.id === null || item.metadata === null;
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (isDirectory) {
        const subItems = await listBucketObjects(
          supabase,
          bucket,
          itemPath,
          currentDepth + 1,
          maxDepth,
        );
        results.push(...subItems);
      } else {
        results.push({
          path: itemPath,
          name: item.name,
          metadata: item.metadata,
          created_at: item.created_at,
          updated_at: item.updated_at,
        });
      }
    }
  }

  return results;
}

/**
 * Resolves exact-path usage for storage assets against articles and profile CV.
 */
async function resolveUsageMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Map<string, MediaUsageInfo>> {
  const usageMap = new Map<string, MediaUsageInfo>();

  const [articlesResult, profilesResult, siteMediaResult] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, slug, status, featured_image_path")
      .not("featured_image_path", "is", null),

    supabase
      .from("profiles")
      .select("id, cv_storage_path")
      .not("cv_storage_path", "is", null),

    supabase
      .from("site_media_slots")
      .select("slot, storage_path")
      .not("storage_path", "is", null),
  ]);

  if (articlesResult.error || profilesResult.error || siteMediaResult.error) {
    throw new Error("Unable to establish exact media usage.");
  }

  if (articlesResult.data) {
    for (const article of articlesResult.data as ArticleUsageRow[]) {
      if (!article.featured_image_path) continue;
      const canonicalBucket: AllowedMediaBucket =
        article.status === "published" ? "public-assets" : "draft-assets";
      const key = `${canonicalBucket}:${article.featured_image_path}`;
      usageMap.set(key, {
        state: "used",
        isUsed: true,
        canDelete: false,
        locationDescription: `Used in ${article.status} article “${article.title}”`,
        articleId: article.id,
        articleTitle: article.title,
      });
    }
  }

  if (profilesResult.data) {
    for (const profile of profilesResult.data as ProfileUsageRow[]) {
      if (!profile.cv_storage_path) {
        continue;
      }

      const key = `public-assets:${profile.cv_storage_path}`;

      usageMap.set(key, {
        state: "used",
        isUsed: true,
        canDelete: false,
        locationDescription: "Used as Marie's public CV document",
      });
    }
  }

  if (siteMediaResult.data) {
    const names: Record<SiteMediaUsageRow["slot"], string> = {
      home_hero: "Homepage Hero",

      about_hero: "About Hero",

      portfolio_hero: "Portfolio Hero",

      contact_hero: "Contact Hero",

      author_portrait: "Author Portrait",

      default_social: "Default Social Image",
    };

    for (const placement of siteMediaResult.data as SiteMediaUsageRow[]) {
      if (!placement.storage_path) {
        continue;
      }

      const key = `public-assets:${placement.storage_path}`;

      usageMap.set(key, {
        state: "used",

        isUsed: true,

        canDelete: false,

        locationDescription: `Used as website media: ${names[placement.slot]}`,
      });
    }
  }

  return usageMap;
}

/**
 * Loads the unified admin Media inventory from draft-assets and public-assets.
 * Performs safe bucket traversal, filters out PDFs, generates private signed previews,
 * and maps truthful usage and reuse eligibility facts.
 */
export async function getAdminMediaInventory(): Promise<AdminMediaRecord[]> {
  await requireAdmin();
  const supabase = await createClient();

  // 1. Traverse draft-assets and public-assets in parallel
  const [draftItems, publicItems, usageMap] = await Promise.all([
    listBucketObjects(supabase, "draft-assets"),
    listBucketObjects(supabase, "public-assets"),
    resolveUsageMap(supabase),
  ]);

  // Combine raw items with bucket tag
  const allRawItems: Array<{
    bucket: AllowedMediaBucket;
    path: string;
    name: string;
    metadata: RawStorageObject["metadata"];
    created_at: string;
    updated_at: string;
  }> = [
    ...draftItems.map((item) => ({ ...item, bucket: "draft-assets" as const })),
    ...publicItems.map((item) => ({
      ...item,
      bucket: "public-assets" as const,
    })),
  ];

  // 2. Filter to images only (strictly exclude PDFs and non-image types)
  const imageItems = allRawItems.filter((item) => {
    const declaredMime = item.metadata?.mimetype?.toLowerCase();
    if (
      declaredMime === "application/pdf" ||
      item.name.toLowerCase().endsWith(".pdf")
    ) {
      return false; // PDFs are excluded from Media Management
    }

    return Boolean(
      declaredMime &&
      ALLOWED_IMAGE_MIME_TYPES.includes(
        declaredMime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
      ),
    );
  });

  // 3. Batch generate signed preview URLs for private draft-assets
  const privateDraftPaths = imageItems
    .filter((item) => item.bucket === "draft-assets")
    .map((item) => item.path);

  const signedUrlMap = new Map<string, string>();
  if (privateDraftPaths.length > 0) {
    try {
      const { data: signedUrls, error: signError } = await supabase.storage
        .from("draft-assets")
        .createSignedUrls(privateDraftPaths, 3600);

      if (!signError && signedUrls) {
        for (const entry of signedUrls) {
          if (entry.path && entry.signedUrl && !entry.error) {
            signedUrlMap.set(entry.path, entry.signedUrl);
          }
        }
      }
    } catch {
      // Graceful degradation: individual signed URLs will fall back to per-item attempt if needed
    }
  }

  // 4. Map to transient AdminMediaRecord
  const records: AdminMediaRecord[] = [];

  for (const item of imageItems) {
    const isPrivate = item.bucket === "draft-assets";
    const rawSize = item.metadata?.size ?? item.metadata?.contentLength;
    const size =
      typeof rawSize === "number" && Number.isFinite(rawSize) ? rawSize : null;
    const mimeType = item.metadata?.mimetype?.toLowerCase() ?? null;

    // Reuse eligibility:
    // Must have known approved MIME (JPEG, PNG, WebP, AVIF)
    // Must have size > 0 and <= 5 MB
    let isEligibleForReuse = true;
    let ineligibilityReason: string | null = null;

    if (
      !mimeType ||
      !ALLOWED_IMAGE_MIME_TYPES.includes(
        mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
      )
    ) {
      isEligibleForReuse = false;
      ineligibilityReason =
        "Format not supported for article reuse (requires JPEG, PNG, WebP, or AVIF).";
    } else if (size === null || size <= 0) {
      isEligibleForReuse = false;
      ineligibilityReason = "Missing or invalid file size metadata.";
    } else if (size > MAX_MEDIA_FILE_SIZE) {
      isEligibleForReuse = false;
      ineligibilityReason = `File size (${(size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB draft limit.`;
    }

    // Preview URL
    let previewUrl: string | null = null;
    if (isPrivate) {
      previewUrl = signedUrlMap.get(item.path) ?? null;
      // Fallback single sign if batched missing
      if (!previewUrl) {
        try {
          const { data } = await supabase.storage
            .from("draft-assets")
            .createSignedUrl(item.path, 3600);
          previewUrl = data?.signedUrl ?? null;
        } catch {
          previewUrl = null;
        }
      }
    } else {
      previewUrl = supabase.storage
        .from("public-assets")
        .getPublicUrl(item.path).data.publicUrl;
    }

    // Usage
    const usageKey = `${item.bucket}:${item.path}`;
    const usage = usageMap.get(usageKey) ?? {
      state: "unused" as const,
      isUsed: false,
      canDelete: true,
    };

    records.push({
      id: `${item.bucket}:${item.path}`,
      bucket: item.bucket,
      path: item.path,
      name: item.name,
      mimeType,
      size,
      createdAt: item.created_at || null,
      updatedAt: item.updated_at || null,
      isPrivate,
      isEligibleForReuse,
      ineligibilityReason,
      usage,
      previewUrl,
    });
  }

  // Sort by createdAt descending (newest first)
  records.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return a.name.localeCompare(b.name);
  });

  return records;
}

/**
 * Resolves exact-path usage for a single asset to protect against race conditions before deletion.
 */
export async function checkAssetUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: AllowedMediaBucket,
  path: string,
): Promise<MediaUsageInfo> {
  const usageMap = await resolveUsageMap(supabase);
  const key = `${bucket}:${path}`;
  return (
    usageMap.get(key) ?? {
      state: "unused",
      isUsed: false,
      canDelete: true,
    }
  );
}

/** Reads authoritative object facts for exact-path mutation checks. */
export async function getStorageObjectFacts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: AllowedMediaBucket,
  path: string,
): Promise<{ size: number | null; mimeType: string | null } | null> {
  const { data, error } = await supabase.storage.from(bucket).info(path);
  if (error || !data) return null;
  return {
    size: typeof data.size === "number" ? data.size : null,
    mimeType:
      typeof data.contentType === "string"
        ? data.contentType.toLowerCase()
        : null,
  };
}
