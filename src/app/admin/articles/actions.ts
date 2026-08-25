"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  generateCanonicalSlug,
  isValidCanonicalSlug,
  normalizeSlugCandidate,
} from "@/lib/admin/publishing";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SaveDraftReferenceInput {
  title: string;
  source_name: string;
  url?: string | null;
  citation_details?: string | null;
}

export interface SaveDraftPayload {
  articleId?: string | null;
  title: string;
  excerpt?: string | null;
  content_json: Record<string, unknown>;
  category_id?: string | null;
  featured_image_path?: string | null;
  featured_image_alt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  references: SaveDraftReferenceInput[];
}

export interface SaveDraftResult {
  success: boolean;
  articleId?: string;
  slug?: string;
  updatedAt?: string;
  error?: string;
}

export interface PublishArticlePayload {
  articleId: string;
  slug?: string | null;
  title: string;
  excerpt?: string | null;
  content_json: Record<string, unknown>;
  category_id?: string | null;
  featured_image_path?: string | null;
  featured_image_alt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  references: SaveDraftReferenceInput[];
}

export interface PublishArticleResult {
  success: boolean;
  articleId?: string;
  slug?: string;
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
  error?: string;
}

export interface UpdatePublishedArticlePayload {
  articleId: string;
  title: string;
  excerpt?: string | null;
  content_json: Record<string, unknown>;
  category_id?: string | null;
  featured_image_path?: string | null;
  featured_image_alt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  references: SaveDraftReferenceInput[];
}

export interface UpdatePublishedArticleResult {
  success: boolean;
  articleId?: string;
  slug?: string;
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
  error?: string;
}

export interface LifecycleActionResult {
  success: boolean;
  articleId?: string;
  slug?: string;
  status?: string;
  publishedAt?: string | null;
  updatedAt?: string;
  deleted?: boolean;
  error?: string;
}

/**
 * Sanitizes and validates a list of structured references.
 */
function sanitizeReferences(
  rawReferences: SaveDraftReferenceInput[],
):
  | { valid: true; data: SaveDraftReferenceInput[] }
  | { valid: false; error: string } {
  const referencesArray = Array.isArray(rawReferences) ? rawReferences : [];
  const sanitized: SaveDraftReferenceInput[] = [];

  for (let i = 0; i < referencesArray.length; i++) {
    const ref = referencesArray[i];
    const refTitle = ref.title?.trim();
    const refSource = ref.source_name?.trim();
    const refUrl = ref.url?.trim() || null;
    const refDetails = ref.citation_details?.trim() || null;

    if (!refTitle) {
      return { valid: false, error: `Reference #${i + 1} must have a title.` };
    }

    if (!refSource) {
      return {
        valid: false,
        error: `Reference #${i + 1} must have a source/journal name.`,
      };
    }

    if (refUrl && !/^https?:\/\//i.test(refUrl)) {
      return {
        valid: false,
        error: `Reference #${i + 1} URL must begin with http:// or https://`,
      };
    }

    sanitized.push({
      title: refTitle,
      source_name: refSource,
      url: refUrl,
      citation_details: refDetails,
    });
  }

  return { valid: true, data: sanitized };
}

/**
 * Generates a unique, collision-resistant storage path for promoted/demoted assets.
 */
function generateUniqueAssetPath(
  articleId: string,
  existingPath: string,
): string {
  const segments = existingPath.split("/");
  const originalFilename = segments.pop() || "image.png";
  const sanitizedFilename = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
  return `articles/${articleId}/featured/${crypto.randomUUID()}-${sanitizedFilename}`;
}

/**
 * Server Action: Atomically saves or creates an article draft and its references.
 * Strictly verifies admin credentials and enforces schema & RPC validation boundaries.
 */
export async function saveDraftAction(
  payload: SaveDraftPayload,
): Promise<SaveDraftResult> {
  await requireAdmin();

  try {
    const trimmedTitle = payload.title?.trim();
    if (!trimmedTitle || trimmedTitle.length === 0) {
      return { success: false, error: "Article title is required." };
    }

    if (
      !payload.content_json ||
      typeof payload.content_json !== "object" ||
      payload.content_json.type !== "doc"
    ) {
      return {
        success: false,
        error:
          "Invalid document format: content must be a valid ProseMirror doc.",
      };
    }

    const isNewArticle = !payload.articleId;
    if (payload.articleId && !UUID_REGEX.test(payload.articleId)) {
      return { success: false, error: "Invalid article ID format." };
    }
    const articleId = isNewArticle ? crypto.randomUUID() : payload.articleId!;
    const provisionalSlug = `draft-${articleId}`;

    if (payload.category_id && !UUID_REGEX.test(payload.category_id)) {
      return { success: false, error: "Invalid category ID format." };
    }

    const trimmedImagePath = payload.featured_image_path?.trim() || null;
    const trimmedImageAlt = payload.featured_image_alt?.trim() || null;

    if (trimmedImagePath) {
      if (!trimmedImageAlt) {
        return {
          success: false,
          error:
            "Featured image alt text is required when an image is attached.",
        };
      }
      const expectedPrefix = `articles/${articleId}/featured/`;
      if (!trimmedImagePath.startsWith(expectedPrefix)) {
        return {
          success: false,
          error: "Featured image path does not belong to this article.",
        };
      }
    }

    const refResult = sanitizeReferences(payload.references);
    if (!refResult.valid) {
      return { success: false, error: refResult.error };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("save_article_draft", {
      p_article_id: articleId,
      p_provisional_slug: provisionalSlug,
      p_title: trimmedTitle,
      p_excerpt: payload.excerpt?.trim() || null,
      p_content_json: payload.content_json,
      p_category_id: payload.category_id || null,
      p_featured_image_path: trimmedImagePath,
      p_featured_image_alt: trimmedImageAlt,
      p_seo_title: payload.seo_title?.trim() || null,
      p_seo_description: payload.seo_description?.trim() || null,
      p_references: refResult.data,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const savedRow = Array.isArray(data) ? data[0] : data;
    if (!savedRow) {
      return {
        success: false,
        error: "Failed to receive saved article data from database.",
      };
    }

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${articleId}`);

    return {
      success: true,
      articleId: savedRow.article_id || articleId,
      slug: savedRow.slug || provisionalSlug,
      updatedAt: savedRow.updated_at || new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Transitions an article from draft to published under D030.
 * Promotes private draft image to public storage, enforces canonical slug invariants,
 * invokes public.publish_article RPC, and revalidates public and admin routes.
 */
export async function publishArticleAction(
  payload: PublishArticlePayload,
): Promise<PublishArticleResult> {
  await requireAdmin();

  try {
    const articleId = payload.articleId;
    if (!articleId || !UUID_REGEX.test(articleId)) {
      return { success: false, error: "Invalid article ID format." };
    }

    const trimmedTitle = payload.title?.trim();
    if (!trimmedTitle || trimmedTitle.length === 0) {
      return { success: false, error: "Article title cannot be blank." };
    }

    if (
      !payload.content_json ||
      typeof payload.content_json !== "object" ||
      payload.content_json.type !== "doc"
    ) {
      return {
        success: false,
        error:
          "Invalid document format: content must be a valid ProseMirror doc.",
      };
    }

    const docContent = payload.content_json.content;
    if (!Array.isArray(docContent) || docContent.length === 0) {
      return {
        success: false,
        error: "Cannot publish an article with empty document content.",
      };
    }

    if (payload.category_id && !UUID_REGEX.test(payload.category_id)) {
      return { success: false, error: "Invalid category ID format." };
    }

    const trimmedImagePath = payload.featured_image_path?.trim() || null;
    const trimmedImageAlt = payload.featured_image_alt?.trim() || null;

    if (trimmedImagePath) {
      if (!trimmedImageAlt) {
        return {
          success: false,
          error:
            "Featured image alt text is required when an image is attached.",
        };
      }
      const expectedPrefix = `articles/${articleId}/featured/`;
      if (!trimmedImagePath.startsWith(expectedPrefix)) {
        return {
          success: false,
          error: "Featured image path must belong to this article.",
        };
      }
    }

    const refResult = sanitizeReferences(payload.references);
    if (!refResult.valid) {
      return { success: false, error: refResult.error };
    }

    const supabase = await createClient();

    // Verify existing article state
    const { data: existingArticle, error: fetchError } = await supabase
      .from("articles")
      .select(
        "id, status, slug, published_at, category_id, featured_image_path, categories ( slug )",
      )
      .eq("id", articleId)
      .maybeSingle();

    if (fetchError || !existingArticle) {
      return {
        success: false,
        error: fetchError ? fetchError.message : "Article not found.",
      };
    }

    if (existingArticle.status !== "draft") {
      return {
        success: false,
        error: `Cannot publish article: source status must be draft (current status: ${existingArticle.status}).`,
      };
    }

    // Resolve candidate slug
    let candidateSlug: string;
    if (existingArticle.published_at) {
      // Ever-published article: slug is permanently frozen
      candidateSlug = existingArticle.slug;
    } else {
      // First publication: derive or sanitize candidate slug
      const rawSlugCandidate = payload.slug?.trim() || "";
      if (rawSlugCandidate) {
        candidateSlug = normalizeSlugCandidate(rawSlugCandidate);
      } else {
        candidateSlug = generateCanonicalSlug(trimmedTitle);
      }

      if (!isValidCanonicalSlug(candidateSlug)) {
        return {
          success: false,
          error:
            "Canonical slug must be kebab-case, at most 80 characters, and cannot match provisional draft patterns.",
        };
      }
    }

    // Storage Asset Promotion: Promote draft asset to public-assets if needed
    let targetPublicImagePath: string | null = null;
    let copiedPublicPath: string | null = null;
    let sourceDraftPathToClean: string | null = null;

    if (trimmedImagePath) {
      // Check if the image is in private draft-assets
      const { data: draftObject } = await supabase.storage
        .from("draft-assets")
        .list(`articles/${articleId}/featured`);

      const filename = trimmedImagePath.split("/").pop();
      const existsInDraft =
        Array.isArray(draftObject) &&
        draftObject.some((obj) => obj.name === filename);

      if (existsInDraft) {
        // Private draft asset requires cross-bucket promotion
        const destinationPath = generateUniqueAssetPath(
          articleId,
          trimmedImagePath,
        );

        const { error: copyError } = await supabase.storage
          .from("draft-assets")
          .copy(trimmedImagePath, destinationPath, {
            destinationBucket: "public-assets",
          });

        if (copyError) {
          return {
            success: false,
            error: `Failed to promote featured image to public storage: ${copyError.message}`,
          };
        }

        targetPublicImagePath = destinationPath;
        copiedPublicPath = destinationPath;
        sourceDraftPathToClean = trimmedImagePath;
      } else {
        // Image already in public-assets (e.g. republishing with existing public image)
        targetPublicImagePath = trimmedImagePath;
      }
    }

    // Invoke public.publish_article RPC
    const { data: publishData, error: rpcError } = await supabase.rpc(
      "publish_article",
      {
        p_article_id: articleId,
        p_slug: candidateSlug,
        p_title: trimmedTitle,
        p_excerpt: payload.excerpt?.trim() || null,
        p_content_json: payload.content_json,
        p_category_id: payload.category_id || null,
        p_featured_image_path: targetPublicImagePath,
        p_featured_image_alt: trimmedImageAlt,
        p_seo_title: payload.seo_title?.trim() || null,
        p_seo_description: payload.seo_description?.trim() || null,
        p_references: refResult.data,
      },
    );

    if (rpcError) {
      // Rollback promoted public asset if DB RPC failed
      if (copiedPublicPath) {
        await supabase.storage.from("public-assets").remove([copiedPublicPath]);
      }
      return { success: false, error: rpcError.message };
    }

    // RPC succeeded: clean up private source asset in draft-assets
    if (sourceDraftPathToClean) {
      await supabase.storage
        .from("draft-assets")
        .remove([sourceDraftPathToClean]);
    }

    const publishedRow = Array.isArray(publishData)
      ? publishData[0]
      : publishData;
    const finalSlug = publishedRow?.slug || candidateSlug;

    // Determine category slug for cache revalidation
    let categorySlug: string | null = null;
    if (payload.category_id) {
      const { data: categoryData } = await supabase
        .from("categories")
        .select("slug")
        .eq("id", payload.category_id)
        .maybeSingle();
      if (categoryData?.slug) {
        categorySlug = categoryData.slug;
      }
    }

    // Cache Revalidation
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${finalSlug}`);
    revalidatePath("/portfolio");
    if (categorySlug) {
      revalidatePath(`/topics/${categorySlug}`);
    }
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${articleId}`);

    return {
      success: true,
      articleId,
      slug: finalSlug,
      status: publishedRow?.status || "published",
      publishedAt: publishedRow?.published_at || new Date().toISOString(),
      updatedAt: publishedRow?.updated_at || new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Updates content and references for an active published article under D030.
 * Strictly preserves canonical slug, published_at timestamp, and published status.
 * Handles replacement image promotion and superseded asset cleanup.
 */
export async function updatePublishedArticleAction(
  payload: UpdatePublishedArticlePayload,
): Promise<UpdatePublishedArticleResult> {
  await requireAdmin();

  try {
    const articleId = payload.articleId;
    if (!articleId || !UUID_REGEX.test(articleId)) {
      return { success: false, error: "Invalid article ID format." };
    }

    const trimmedTitle = payload.title?.trim();
    if (!trimmedTitle || trimmedTitle.length === 0) {
      return { success: false, error: "Article title cannot be blank." };
    }

    if (
      !payload.content_json ||
      typeof payload.content_json !== "object" ||
      payload.content_json.type !== "doc"
    ) {
      return {
        success: false,
        error:
          "Invalid document format: content must be a valid ProseMirror doc.",
      };
    }

    const docContent = payload.content_json.content;
    if (!Array.isArray(docContent) || docContent.length === 0) {
      return {
        success: false,
        error: "Cannot update published article with empty document content.",
      };
    }

    if (payload.category_id && !UUID_REGEX.test(payload.category_id)) {
      return { success: false, error: "Invalid category ID format." };
    }

    const trimmedImagePath = payload.featured_image_path?.trim() || null;
    const trimmedImageAlt = payload.featured_image_alt?.trim() || null;

    if (trimmedImagePath) {
      if (!trimmedImageAlt) {
        return {
          success: false,
          error:
            "Featured image alt text is required when an image is attached.",
        };
      }
      const expectedPrefix = `articles/${articleId}/featured/`;
      if (!trimmedImagePath.startsWith(expectedPrefix)) {
        return {
          success: false,
          error: "Featured image path must belong to this article.",
        };
      }
    }

    const refResult = sanitizeReferences(payload.references);
    if (!refResult.valid) {
      return { success: false, error: refResult.error };
    }

    const supabase = await createClient();

    // Verify existing article state
    const { data: existingArticle, error: fetchError } = await supabase
      .from("articles")
      .select(
        "id, status, slug, published_at, category_id, featured_image_path, categories ( slug )",
      )
      .eq("id", articleId)
      .maybeSingle();

    if (fetchError || !existingArticle) {
      return {
        success: false,
        error: fetchError ? fetchError.message : "Article not found.",
      };
    }

    if (existingArticle.status !== "published") {
      return {
        success: false,
        error: `Cannot update non-published article via updatePublishedArticleAction (current status: ${existingArticle.status}).`,
      };
    }

    const oldPublicImagePath = existingArticle.featured_image_path;
    let targetPublicImagePath: string | null = oldPublicImagePath;
    let copiedPublicPath: string | null = null;
    let sourceDraftPathToClean: string | null = null;
    let supersededPublicPathToClean: string | null = null;

    if (trimmedImagePath !== oldPublicImagePath) {
      if (trimmedImagePath) {
        // Check if the new image is in draft-assets
        const { data: draftObject } = await supabase.storage
          .from("draft-assets")
          .list(`articles/${articleId}/featured`);

        const filename = trimmedImagePath.split("/").pop();
        const existsInDraft =
          Array.isArray(draftObject) &&
          draftObject.some((obj) => obj.name === filename);

        if (existsInDraft) {
          const destinationPath = generateUniqueAssetPath(
            articleId,
            trimmedImagePath,
          );

          const { error: copyError } = await supabase.storage
            .from("draft-assets")
            .copy(trimmedImagePath, destinationPath, {
              destinationBucket: "public-assets",
            });

          if (copyError) {
            return {
              success: false,
              error: `Failed to promote replacement image: ${copyError.message}`,
            };
          }

          targetPublicImagePath = destinationPath;
          copiedPublicPath = destinationPath;
          sourceDraftPathToClean = trimmedImagePath;
          supersededPublicPathToClean = oldPublicImagePath;
        } else {
          targetPublicImagePath = trimmedImagePath;
        }
      } else {
        // Image was removed
        targetPublicImagePath = null;
        supersededPublicPathToClean = oldPublicImagePath;
      }
    }

    // Call update_published_article RPC
    const { data: updateData, error: rpcError } = await supabase.rpc(
      "update_published_article",
      {
        p_article_id: articleId,
        p_title: trimmedTitle,
        p_excerpt: payload.excerpt?.trim() || null,
        p_content_json: payload.content_json,
        p_category_id: payload.category_id || null,
        p_featured_image_path: targetPublicImagePath,
        p_featured_image_alt: trimmedImageAlt,
        p_seo_title: payload.seo_title?.trim() || null,
        p_seo_description: payload.seo_description?.trim() || null,
        p_references: refResult.data,
      },
    );

    if (rpcError) {
      if (copiedPublicPath) {
        await supabase.storage.from("public-assets").remove([copiedPublicPath]);
      }
      return { success: false, error: rpcError.message };
    }

    // Cleanup storage assets post-success
    if (sourceDraftPathToClean) {
      await supabase.storage
        .from("draft-assets")
        .remove([sourceDraftPathToClean]);
    }
    if (supersededPublicPathToClean) {
      await supabase.storage
        .from("public-assets")
        .remove([supersededPublicPathToClean]);
    }

    const updatedRow = Array.isArray(updateData) ? updateData[0] : updateData;
    const finalSlug = updatedRow?.slug || existingArticle.slug;

    // Cache Revalidation
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${finalSlug}`);
    revalidatePath("/portfolio");

    // Revalidate category paths if changed
    if (existingArticle.category_id !== payload.category_id) {
      if (existingArticle.category_id) {
        const { data: oldCat } = await supabase
          .from("categories")
          .select("slug")
          .eq("id", existingArticle.category_id)
          .maybeSingle();
        if (oldCat?.slug) revalidatePath(`/topics/${oldCat.slug}`);
      }
      if (payload.category_id) {
        const { data: newCat } = await supabase
          .from("categories")
          .select("slug")
          .eq("id", payload.category_id)
          .maybeSingle();
        if (newCat?.slug) revalidatePath(`/topics/${newCat.slug}`);
      }
    } else if (payload.category_id) {
      const { data: currentCat } = await supabase
        .from("categories")
        .select("slug")
        .eq("id", payload.category_id)
        .maybeSingle();
      if (currentCat?.slug) revalidatePath(`/topics/${currentCat.slug}`);
    }

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${articleId}`);

    return {
      success: true,
      articleId,
      slug: finalSlug,
      status: "published",
      publishedAt: updatedRow?.published_at || existingArticle.published_at,
      updatedAt: updatedRow?.updated_at || new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Unpublishes an active article back to draft status under D030.
 * Demotes public featured image to draft-assets, clears public featured flags,
 * preserves canonical slug and original published_at timestamp, and purges public caches.
 */
export async function unpublishArticleAction(
  articleId: string,
): Promise<LifecycleActionResult> {
  await requireAdmin();

  try {
    if (!articleId || !UUID_REGEX.test(articleId)) {
      return { success: false, error: "Invalid article ID format." };
    }

    const supabase = await createClient();

    const { data: existingArticle, error: fetchError } = await supabase
      .from("articles")
      .select(
        "id, status, slug, published_at, category_id, featured_image_path",
      )
      .eq("id", articleId)
      .maybeSingle();

    if (fetchError || !existingArticle) {
      return {
        success: false,
        error: fetchError ? fetchError.message : "Article not found.",
      };
    }

    if (existingArticle.status !== "published") {
      return {
        success: false,
        error: `Cannot unpublish non-published article (current status: ${existingArticle.status}).`,
      };
    }

    const currentPublicImagePath = existingArticle.featured_image_path;
    let privateDestinationPath: string | null = null;
    let copiedPrivatePath: string | null = null;

    if (currentPublicImagePath) {
      privateDestinationPath = generateUniqueAssetPath(
        articleId,
        currentPublicImagePath,
      );

      const { error: copyError } = await supabase.storage
        .from("public-assets")
        .copy(currentPublicImagePath, privateDestinationPath, {
          destinationBucket: "draft-assets",
        });

      if (copyError) {
        return {
          success: false,
          error: `Failed to demote featured image to private storage: ${copyError.message}`,
        };
      }

      copiedPrivatePath = privateDestinationPath;
    }

    const { data: unpublishData, error: rpcError } = await supabase.rpc(
      "unpublish_article",
      {
        p_article_id: articleId,
        p_private_image_path: privateDestinationPath,
      },
    );

    if (rpcError) {
      if (copiedPrivatePath) {
        await supabase.storage.from("draft-assets").remove([copiedPrivatePath]);
      }
      return { success: false, error: rpcError.message };
    }

    // Clean up public image
    if (currentPublicImagePath) {
      await supabase.storage
        .from("public-assets")
        .remove([currentPublicImagePath]);
    }

    const unpublishRow = Array.isArray(unpublishData)
      ? unpublishData[0]
      : unpublishData;

    // Revalidate public and admin routes
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${existingArticle.slug}`);
    revalidatePath("/portfolio");
    if (existingArticle.category_id) {
      const { data: cat } = await supabase
        .from("categories")
        .select("slug")
        .eq("id", existingArticle.category_id)
        .maybeSingle();
      if (cat?.slug) revalidatePath(`/topics/${cat.slug}`);
    }
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${articleId}`);

    return {
      success: true,
      articleId,
      slug: unpublishRow?.slug || existingArticle.slug,
      status: "draft",
      publishedAt: unpublishRow?.published_at || existingArticle.published_at,
      updatedAt: unpublishRow?.updated_at || new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Retires a draft or published article to archived status under D030.
 * Demotes public assets if published, preserves canonical slug and history, and clears public feeds.
 */
export async function archiveArticleAction(
  articleId: string,
): Promise<LifecycleActionResult> {
  await requireAdmin();

  try {
    if (!articleId || !UUID_REGEX.test(articleId)) {
      return { success: false, error: "Invalid article ID format." };
    }

    const supabase = await createClient();

    const { data: existingArticle, error: fetchError } = await supabase
      .from("articles")
      .select(
        "id, status, slug, published_at, category_id, featured_image_path",
      )
      .eq("id", articleId)
      .maybeSingle();

    if (fetchError || !existingArticle) {
      return {
        success: false,
        error: fetchError ? fetchError.message : "Article not found.",
      };
    }

    if (
      existingArticle.status !== "published" &&
      existingArticle.status !== "draft"
    ) {
      return {
        success: false,
        error: `Cannot archive article with status ${existingArticle.status} (must be published or draft).`,
      };
    }

    const wasPublished = existingArticle.status === "published";
    const currentImagePath = existingArticle.featured_image_path;
    let privateDestinationPath: string | null = null;
    let copiedPrivatePath: string | null = null;

    if (wasPublished && currentImagePath) {
      privateDestinationPath = generateUniqueAssetPath(
        articleId,
        currentImagePath,
      );

      const { error: copyError } = await supabase.storage
        .from("public-assets")
        .copy(currentImagePath, privateDestinationPath, {
          destinationBucket: "draft-assets",
        });

      if (copyError) {
        return {
          success: false,
          error: `Failed to demote featured image to private storage: ${copyError.message}`,
        };
      }

      copiedPrivatePath = privateDestinationPath;
    }

    const { data: archiveData, error: rpcError } = await supabase.rpc(
      "archive_article",
      {
        p_article_id: articleId,
        p_private_image_path: privateDestinationPath,
      },
    );

    if (rpcError) {
      if (copiedPrivatePath) {
        await supabase.storage.from("draft-assets").remove([copiedPrivatePath]);
      }
      return { success: false, error: rpcError.message };
    }

    if (wasPublished && currentImagePath) {
      await supabase.storage.from("public-assets").remove([currentImagePath]);
    }

    const archiveRow = Array.isArray(archiveData)
      ? archiveData[0]
      : archiveData;

    if (wasPublished) {
      revalidatePath("/");
      revalidatePath("/blog");
      revalidatePath(`/blog/${existingArticle.slug}`);
      revalidatePath("/portfolio");
      if (existingArticle.category_id) {
        const { data: cat } = await supabase
          .from("categories")
          .select("slug")
          .eq("id", existingArticle.category_id)
          .maybeSingle();
        if (cat?.slug) revalidatePath(`/topics/${cat.slug}`);
      }
    }

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${articleId}`);

    return {
      success: true,
      articleId,
      slug: archiveRow?.slug || existingArticle.slug,
      status: "archived",
      publishedAt: archiveRow?.published_at || existingArticle.published_at,
      updatedAt: archiveRow?.updated_at || new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Restores an archived article back to draft status under D030.
 * Preserves canonical slug, publication timestamp, and draft asset paths.
 */
export async function restoreArticleAction(
  articleId: string,
): Promise<LifecycleActionResult> {
  await requireAdmin();

  try {
    if (!articleId || !UUID_REGEX.test(articleId)) {
      return { success: false, error: "Invalid article ID format." };
    }

    const supabase = await createClient();

    const { data: existingArticle, error: fetchError } = await supabase
      .from("articles")
      .select("id, status, slug, published_at")
      .eq("id", articleId)
      .maybeSingle();

    if (fetchError || !existingArticle) {
      return {
        success: false,
        error: fetchError ? fetchError.message : "Article not found.",
      };
    }

    if (existingArticle.status !== "archived") {
      return {
        success: false,
        error: `Cannot restore non-archived article (current status: ${existingArticle.status}).`,
      };
    }

    const { data: restoreData, error: rpcError } = await supabase.rpc(
      "restore_article",
      {
        p_article_id: articleId,
      },
    );

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    const restoreRow = Array.isArray(restoreData)
      ? restoreData[0]
      : restoreData;

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${articleId}`);

    return {
      success: true,
      articleId,
      slug: restoreRow?.slug || existingArticle.slug,
      status: "draft",
      publishedAt: restoreRow?.published_at || existingArticle.published_at,
      updatedAt: restoreRow?.updated_at || new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

/**
 * Server Action: Permanently deletes a never-published draft or archived article under D030.
 * Rejects deletion of ever-published records (published_at !== null) to preserve canonical URL ownership.
 * Cleans up draft storage objects and cascades reference deletion.
 */
export async function deleteArticleAction(
  articleId: string,
): Promise<LifecycleActionResult> {
  await requireAdmin();

  try {
    if (!articleId || !UUID_REGEX.test(articleId)) {
      return { success: false, error: "Invalid article ID format." };
    }

    const supabase = await createClient();

    const { data: existingArticle, error: fetchError } = await supabase
      .from("articles")
      .select("id, status, slug, published_at, featured_image_path")
      .eq("id", articleId)
      .maybeSingle();

    if (fetchError || !existingArticle) {
      return {
        success: false,
        error: fetchError ? fetchError.message : "Article not found.",
      };
    }

    if (
      existingArticle.status !== "draft" &&
      existingArticle.status !== "archived"
    ) {
      return {
        success: false,
        error: `Cannot delete article with status ${existingArticle.status} (must be draft or archived).`,
      };
    }

    if (existingArticle.published_at !== null) {
      return {
        success: false,
        error:
          "Cannot delete ever-published article (published_at is non-null). Archive instead.",
      };
    }

    const { error: rpcError } = await supabase.rpc("delete_article", {
      p_article_id: articleId,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    // Clean up draft storage assets if present
    if (existingArticle.featured_image_path) {
      await supabase.storage
        .from("draft-assets")
        .remove([existingArticle.featured_image_path]);
    }

    revalidatePath("/admin/articles");

    return {
      success: true,
      articleId,
      slug: existingArticle.slug,
      deleted: true,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
