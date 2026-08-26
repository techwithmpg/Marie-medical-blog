"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function togglePortfolioFeaturedAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const articleId = formData.get("articleId")?.toString().trim() || "";
  const operation = formData.get("operation")?.toString().trim() || "";

  if (!UUID_REGEX.test(articleId)) {
    throw new Error("Invalid article identifier.");
  }

  if (operation !== "feature" && operation !== "unfeature") {
    throw new Error("Invalid portfolio featuring operation.");
  }

  const shouldFeature = operation === "feature";
  const supabase = await createClient();

  // Enforce status = 'published' in the update predicate to uphold publication invariants.
  // updated_at is maintained by the database trigger (trg_articles_updated_at).
  const { error } = await supabase
    .from("articles")
    .update({
      is_portfolio_featured: shouldFeature,
    })
    .eq("id", articleId)
    .eq("status", "published");

  if (error) {
    throw new Error("Unable to update Selected Writing right now.");
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function setLeadFeaturedArticleAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const rawArticleId = formData.get("articleId")?.toString().trim() || "";
  let targetArticleId: string | null = null;

  if (rawArticleId && rawArticleId !== "none" && rawArticleId !== "null") {
    if (!UUID_REGEX.test(rawArticleId)) {
      throw new Error("Invalid lead article identifier.");
    }
    targetArticleId = rawArticleId;
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("set_featured_article", {
    p_article_id: targetArticleId,
  });

  if (error) {
    throw new Error("Unable to update the lead article right now.");
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/blog");
}
