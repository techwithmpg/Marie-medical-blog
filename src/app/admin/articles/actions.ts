"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SaveDraftReferenceInput {
  title: string;
  source_name: string;
  url?: string | null;
  citation_details?: string | null;
}

export interface SaveDraftPayload {
  articleId?: string | null;
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

export interface SaveDraftResult {
  success: boolean;
  articleId?: string;
  slug?: string;
  updatedAt?: string;
  error?: string;
}

/**
 * Server Action: Atomically saves or creates an article draft and its references.
 * Strictly verifies admin credentials and enforces schema & RPC validation boundaries.
 */
export async function saveDraftAction(
  payload: SaveDraftPayload,
): Promise<SaveDraftResult> {
  try {
    // 1. Authorize caller against admin allowlist
    await requireAdmin();

    // 2. Validate application input
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

    // Determine article identity
    const isNewArticle = !payload.articleId;
    const articleId = isNewArticle ? crypto.randomUUID() : payload.articleId!;
    const provisionalSlug = isNewArticle
      ? `draft-${articleId}`
      : payload.slug || `draft-${articleId}`;

    // Featured image validation
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

    // References validation
    const rawReferences = Array.isArray(payload.references)
      ? payload.references
      : [];
    const sanitizedReferences: SaveDraftReferenceInput[] = [];

    for (let i = 0; i < rawReferences.length; i++) {
      const ref = rawReferences[i];
      const refTitle = ref.title?.trim();
      const refSource = ref.source_name?.trim();
      const refUrl = ref.url?.trim() || null;
      const refDetails = ref.citation_details?.trim() || null;

      if (!refTitle) {
        return {
          success: false,
          error: `Reference #${i + 1} must have a title.`,
        };
      }

      if (!refSource) {
        return {
          success: false,
          error: `Reference #${i + 1} must have a source/journal name.`,
        };
      }

      if (refUrl && !/^https?:\/\//i.test(refUrl)) {
        return {
          success: false,
          error: `Reference #${i + 1} URL must begin with http:// or https://`,
        };
      }

      sanitizedReferences.push({
        title: refTitle,
        source_name: refSource,
        url: refUrl,
        citation_details: refDetails,
      });
    }

    // 3. Call public.save_article_draft RPC
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
      p_references: sanitizedReferences,
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

    // 4. Revalidate admin paths only
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
