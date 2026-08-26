"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export interface CommentModerationResult {
  success: boolean;
  message: string;
  error?: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_OPERATIONS = ["approve", "hide", "delete"] as const;
type ModerationOperation = (typeof ALLOWED_OPERATIONS)[number];

export async function moderateCommentAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const commentId = formData.get("commentId");
  const operation = formData.get("operation");

  if (typeof commentId !== "string" || !UUID_REGEX.test(commentId)) {
    return;
  }

  if (
    typeof operation !== "string" ||
    !ALLOWED_OPERATIONS.includes(operation as ModerationOperation)
  ) {
    return;
  }

  const op = operation as ModerationOperation;
  const supabase = await createClient();

  // Retrieve comment and article context for targeted revalidation
  const { data: existingComment, error: fetchError } = await supabase
    .from("comments")
    .select("id, article_id, articles(slug)")
    .eq("id", commentId)
    .maybeSingle();

  if (fetchError || !existingComment) {
    return;
  }

  let articleSlug: string | null = null;
  if (existingComment.articles) {
    if (Array.isArray(existingComment.articles)) {
      articleSlug =
        (existingComment.articles[0] as { slug?: string })?.slug || null;
    } else if (typeof existingComment.articles === "object") {
      articleSlug =
        (existingComment.articles as { slug?: string }).slug || null;
    }
  }

  const nowIso = new Date().toISOString();

  if (op === "approve") {
    const { error: updateError } = await supabase
      .from("comments")
      .update({
        status: "approved",
        moderated_at: nowIso,
      })
      .eq("id", commentId);

    if (updateError) {
      return;
    }
  } else if (op === "hide") {
    const { error: updateError } = await supabase
      .from("comments")
      .update({
        status: "hidden",
        moderated_at: nowIso,
      })
      .eq("id", commentId);

    if (updateError) {
      return;
    }
  } else if (op === "delete") {
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      return;
    }
  }

  // Targeted revalidation
  revalidatePath("/admin/comments");
  if (articleSlug) {
    revalidatePath(`/blog/${articleSlug}`);
  }
}
