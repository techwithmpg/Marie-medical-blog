import { createClient } from "@/lib/supabase/server";

export type AdminCommentStatus = "pending" | "approved" | "hidden";

export interface AdminCommentItem {
  id: string;
  article_id: string;
  commenter_name: string;
  commenter_email: string;
  body: string;
  status: AdminCommentStatus;
  created_at: string;
  moderated_at: string | null;
  article_title: string;
  article_slug: string;
  article_status: string;
}

interface RawCommentRow {
  id: string;
  article_id: string;
  commenter_name: string;
  commenter_email: string;
  body: string;
  status: string;
  created_at: string;
  moderated_at: string | null;
}

interface RawArticleRow {
  id: string;
  title: string;
  slug: string;
  status: string;
}

/**
 * Loads comments for the admin moderation workspace with optional status filtering.
 * Explicitly selects only required admin columns.
 * Orders comments: created_at DESC, id DESC.
 */
export async function getAdminComments(
  statusFilter?: string,
): Promise<AdminCommentItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("comments")
    .select(
      "id, article_id, commenter_name, commenter_email, body, status, created_at, moderated_at",
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (
    statusFilter === "pending" ||
    statusFilter === "approved" ||
    statusFilter === "hidden"
  ) {
    query = query.eq("status", statusFilter);
  }

  const { data: commentsData, error: commentsError } = await query;

  if (commentsError) {
    throw new Error(`Failed to load admin comments: ${commentsError.message}`);
  }

  const comments = (commentsData || []) as RawCommentRow[];

  if (comments.length === 0) {
    return [];
  }

  // Collect distinct article IDs to query article context
  const distinctArticleIds = Array.from(
    new Set(comments.map((c) => c.article_id)),
  );

  const { data: articlesData, error: articlesError } = await supabase
    .from("articles")
    .select("id, title, slug, status")
    .in("id", distinctArticleIds);

  if (articlesError) {
    throw new Error(
      `Failed to load article context for comments: ${articlesError.message}`,
    );
  }

  const articleMap = new Map<string, RawArticleRow>();
  for (const article of (articlesData || []) as RawArticleRow[]) {
    articleMap.set(article.id, article);
  }

  return comments.map((comment) => {
    const article = articleMap.get(comment.article_id);
    return {
      id: comment.id,
      article_id: comment.article_id,
      commenter_name: comment.commenter_name,
      commenter_email: comment.commenter_email,
      body: comment.body,
      status: comment.status as AdminCommentStatus,
      created_at: comment.created_at,
      moderated_at: comment.moderated_at,
      article_title: article ? article.title : "Unknown Article",
      article_slug: article ? article.slug : "",
      article_status: article ? article.status : "unknown",
    };
  });
}

/**
 * Loads a single comment by ID with article context.
 */
export async function getAdminCommentById(
  id: string,
): Promise<AdminCommentItem | null> {
  const supabase = await createClient();

  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select(
      "id, article_id, commenter_name, commenter_email, body, status, created_at, moderated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (commentError) {
    throw new Error(`Failed to load comment: ${commentError.message}`);
  }

  if (!comment) return null;

  const rawComment = comment as RawCommentRow;

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id, title, slug, status")
    .eq("id", rawComment.article_id)
    .maybeSingle();

  if (articleError) {
    throw new Error(`Failed to load article context: ${articleError.message}`);
  }

  const rawArticle = article as RawArticleRow | null;

  return {
    id: rawComment.id,
    article_id: rawComment.article_id,
    commenter_name: rawComment.commenter_name,
    commenter_email: rawComment.commenter_email,
    body: rawComment.body,
    status: rawComment.status as AdminCommentStatus,
    created_at: rawComment.created_at,
    moderated_at: rawComment.moderated_at,
    article_title: rawArticle ? rawArticle.title : "Unknown Article",
    article_slug: rawArticle ? rawArticle.slug : "",
    article_status: rawArticle ? rawArticle.status : "unknown",
  };
}
