import { createClient } from "@/lib/supabase/server";

export type ArticleStatus = "draft" | "published" | "archived";

export interface AdminArticleListItem {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  category_id: string | null;
  category_name: string | null;
  published_at: string | null;
  updated_at: string;
  created_at: string;
}

export interface AdminCategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface AdminArticleReference {
  id?: string;
  title: string;
  source_name: string;
  url?: string | null;
  citation_details?: string | null;
  sort_order?: number;
}

export interface AdminArticleDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: Record<string, unknown>;
  category_id: string | null;
  featured_image_path: string | null;
  featured_image_alt: string | null;
  status: ArticleStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RawAdminArticleRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  category_id: string | null;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  categories?: { name: string } | { name: string }[] | null;
}

/**
 * Loads articles for the admin article index with optional status filtering.
 * Deterministically sorted by updated_at DESC, id DESC.
 */
export async function getAdminArticles(
  statusFilter?: string,
): Promise<AdminArticleListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select(
      `
      id,
      title,
      slug,
      status,
      category_id,
      published_at,
      updated_at,
      created_at,
      categories (
        name
      )
    `,
    )
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false });

  if (
    statusFilter === "draft" ||
    statusFilter === "published" ||
    statusFilter === "archived"
  ) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load admin articles: ${error.message}`);
  }

  const rows = (data || []) as unknown as RawAdminArticleRow[];

  return rows.map((row) => {
    let categoryName: string | null = null;
    if (Array.isArray(row.categories) && row.categories.length > 0) {
      categoryName = row.categories[0].name;
    } else if (row.categories && typeof row.categories === "object") {
      categoryName = (row.categories as { name: string }).name || null;
    }

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status as ArticleStatus,
      category_id: row.category_id,
      category_name: categoryName,
      published_at: row.published_at,
      updated_at: row.updated_at,
      created_at: row.created_at,
    };
  });
}

/**
 * Loads all category options ordered alphabetically.
 */
export async function getAdminCategories(): Promise<AdminCategoryOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`);
  }

  return (data || []) as AdminCategoryOption[];
}

/**
 * Loads a single article draft/record by ID.
 */
export async function getAdminArticleById(
  id: string,
): Promise<AdminArticleDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      content_json,
      category_id,
      featured_image_path,
      featured_image_alt,
      status,
      seo_title,
      seo_description,
      published_at,
      created_at,
      updated_at
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load article detail: ${error.message}`);
  }

  if (!data) return null;

  return data as AdminArticleDetail;
}

/**
 * Loads references associated with an article by article_id ordered by sort_order.
 */
export async function getAdminArticleReferences(
  articleId: string,
): Promise<AdminArticleReference[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("article_references")
    .select("id, title, source_name, url, citation_details, sort_order")
    .eq("article_id", articleId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load article references: ${error.message}`);
  }

  return (data || []) as AdminArticleReference[];
}
