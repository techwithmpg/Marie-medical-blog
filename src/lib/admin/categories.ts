import { createClient } from "@/lib/supabase/server";

export interface AdminCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  article_count: number;
}

interface RawAdminCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  articles?: { count?: number | null } | { count?: number | null }[] | null;
}

function readArticleCount(
  articles: RawAdminCategoryRecord["articles"],
): number {
  const countValue = Array.isArray(articles)
    ? articles[0]?.count
    : articles?.count;
  const count = Number(countValue ?? 0);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

/**
 * Loads the admin Category inventory with a live aggregate article count.
 * No usage counter is persisted; the existing relationship remains authoritative.
 */
export async function getAdminCategoryRecords(): Promise<
  AdminCategoryRecord[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, created_at, updated_at, articles(count)",
    )
    .order("name", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error("Unable to load Category management.");
  }

  return ((data ?? []) as unknown as RawAdminCategoryRecord[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
    article_count: readArticleCount(row.articles),
  }));
}
