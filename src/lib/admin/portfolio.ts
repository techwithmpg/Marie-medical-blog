import { createClient } from "@/lib/supabase/server";

export interface AdminPortfolioArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  updated_at: string;
  is_featured: boolean;
  is_portfolio_featured: boolean;
  category_name: string | null;
}

/**
 * Loads published articles for portfolio curation and homepage lead featuring.
 * Explicit SELECT only.
 * Guaranteed to return published-only articles.
 */
export async function getAdminPortfolioArticles(): Promise<
  AdminPortfolioArticle[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, status, published_at, updated_at, is_featured, is_portfolio_featured, categories(name)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw new Error(`Failed to load portfolio articles: ${error.message}`);
  }

  return (data || []).map((row) => {
    const cat = row.categories as unknown as { name: string } | null;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      published_at: row.published_at,
      updated_at: row.updated_at,
      is_featured: Boolean(row.is_featured),
      is_portfolio_featured: Boolean(row.is_portfolio_featured),
      category_name: cat?.name || null,
    };
  });
}
