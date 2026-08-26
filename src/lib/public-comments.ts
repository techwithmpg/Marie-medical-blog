import { createClient } from "@/lib/supabase/server";

export interface PublicApprovedComment {
  id: string;
  article_id: string;
  commenter_name: string;
  body: string;
  created_at: string;
}

/**
 * Fetch approved comments for a published article.
 * Explicitly selects only safe public columns: id, article_id, commenter_name, body, created_at.
 * Filters strictly on article_id and status = 'approved', ordered ascending by created_at.
 */
export async function getApprovedCommentsByArticleId(
  articleId: string,
): Promise<PublicApprovedComment[]> {
  if (!articleId) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id, article_id, commenter_name, body, created_at")
    .eq("article_id", articleId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return (data as PublicApprovedComment[]) || [];
}
