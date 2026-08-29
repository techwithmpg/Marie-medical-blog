import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface PublicArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_path: string | null;
  featured_image_alt: string | null;
  category_id: string | null;
  category: PublicCategory | null;
  published_at: string | null;
  created_at: string;
  is_featured: boolean;
  is_portfolio_featured: boolean;
  reading_time_minutes: number;
}

export interface PublicArticleReference {
  id: string;
  title: string;
  source_name: string;
  url: string | null;
  citation_details: string | null;
  sort_order: number;
}

export interface PublicArticleDetail extends PublicArticleSummary {
  content_json: unknown;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
  references: PublicArticleReference[];
}

export interface PublicArticleListResult {
  articles: PublicArticleSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PublicBlogViewData {
  leadArticle: PublicArticleSummary | null;
  isLeadExplicitlyFeatured: boolean;
  articles: PublicArticleSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PublicSitemapArticle {
  slug: string;
  status: string;
  published_at: string | null;
  updated_at: string | null;
  topic_slug: string | null;
}

export function sanitizeSearchQuery(raw: string | undefined | null): string {
  if (!raw) return "";

  // 1. Unicode normalize using NFKC
  let normalized = raw.normalize("NFKC");

  // 2. Trim whitespace
  normalized = normalized.trim();

  // 3. Collapse internal whitespace to a single space
  normalized = normalized.replace(/\s+/g, " ");

  // 4. Limit length to 100 characters
  normalized = normalized.slice(0, 100);

  // 5. Remove PostgREST structural/pattern characters: ( ) , " \ % * _
  normalized = normalized.replace(/[(),"\x5c%*_]/g, "");

  // 6. Trim again
  normalized = normalized.trim();

  // 7. If empty after sanitization, return empty string
  return normalized;
}

export function calculateReadingTime(contentJson: unknown): number {
  if (!contentJson || typeof contentJson !== "object") return 1;

  let text = "";
  function extractText(node: unknown): void {
    if (!node || typeof node !== "object") return;
    const n = node as { text?: string; content?: unknown[] };
    if (typeof n.text === "string") {
      text += " " + n.text;
    }
    if (Array.isArray(n.content)) {
      n.content.forEach(extractText);
    }
  }

  extractText(contentJson);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  // 200 words per minute for scientific/medical editorial text
  return Math.max(1, Math.ceil(wordCount / 200));
}

interface RawArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_json?: unknown;
  featured_image_path: string | null;
  featured_image_alt: string | null;
  category_id: string | null;
  status: string;
  is_featured: boolean;
  is_portfolio_featured: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
  category?: PublicCategory | PublicCategory[] | null;
  categories?: PublicCategory | PublicCategory[] | null;
}

function mapArticleSummary(row: RawArticleRow): PublicArticleSummary {
  const categoryRaw = row.categories || row.category;
  let category: PublicCategory | null = null;
  if (Array.isArray(categoryRaw) && categoryRaw.length > 0) {
    category = categoryRaw[0];
  } else if (categoryRaw && typeof categoryRaw === "object") {
    category = categoryRaw as PublicCategory;
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    featured_image_path: row.featured_image_path,
    featured_image_alt: row.featured_image_alt,
    category_id: row.category_id,
    category,
    published_at: row.published_at,
    created_at: row.created_at,
    is_featured: Boolean(row.is_featured),
    is_portfolio_featured: Boolean(row.is_portfolio_featured),
    reading_time_minutes: calculateReadingTime(row.content_json),
  };
}

export async function getPublishedCategories(): Promise<PublicCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Unable to load categories.");
  }

  return (data || []) as PublicCategory[];
}

async function getCategoryBySlugUncached(
  slug: string,
): Promise<PublicCategory | null> {
  if (!slug) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load category.");
  }

  return data as PublicCategory | null;
}

export const getCategoryBySlug = cache(getCategoryBySlugUncached);

export async function getPublishedArticles(options?: {
  page?: number;
  pageSize?: number;
  topicSlug?: string;
  searchQuery?: string;
  excludeArticleId?: string;
}): Promise<PublicArticleListResult> {
  const supabase = await createClient();
  const page = Math.max(1, options?.page || 1);
  const pageSize = options?.pageSize || 6;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let topicCategoryId: string | null = null;
  if (options?.topicSlug) {
    const category = await getCategoryBySlug(options.topicSlug);
    if (category) {
      topicCategoryId = category.id;
    } else {
      // Category slug requested does not exist
      return {
        articles: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
  }

  let query = supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, content_json, featured_image_path, featured_image_alt, category_id, status, is_featured, is_portfolio_featured, published_at, created_at, categories ( id, name, slug, description )",
      { count: "exact" },
    )
    .eq("status", "published");

  if (topicCategoryId) {
    query = query.eq("category_id", topicCategoryId);
  }

  const safeQuery = sanitizeSearchQuery(options?.searchQuery);
  if (safeQuery) {
    query = query.or(`title.ilike.%${safeQuery}%,excerpt.ilike.%${safeQuery}%`);
  }

  if (options?.excludeArticleId) {
    query = query.neq("id", options.excludeArticleId);
  }

  // Deterministic multi-column ordering applied BEFORE range
  query = query
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    throw new Error("Unable to load articles.");
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const articles = (data || []).map((row) =>
    mapArticleSummary(row as unknown as RawArticleRow),
  );

  return {
    articles,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

export const getMemoizedTopicArticles = cache(
  async (topicSlug: string, page: number, pageSize: number) =>
    getPublishedArticles({
      topicSlug,
      page,
      pageSize,
    }),
);

export async function getBlogViewData(options?: {
  page?: number;
  pageSize?: number;
  topicSlug?: string;
  searchQuery?: string;
}): Promise<PublicBlogViewData> {
  const page = Math.max(1, options?.page || 1);
  const pageSize = options?.pageSize || 6;
  const safeQuery = sanitizeSearchQuery(options?.searchQuery);
  const isFiltered = Boolean(safeQuery || options?.topicSlug);

  // Filtered / Search: no separate lead story is extracted or excluded
  if (isFiltered) {
    const listResult = await getPublishedArticles({
      page,
      pageSize,
      topicSlug: options?.topicSlug,
      searchQuery: options?.searchQuery,
    });

    return {
      leadArticle: null,
      isLeadExplicitlyFeatured: false,
      articles: listResult.articles,
      totalCount: listResult.totalCount,
      page: listResult.page,
      pageSize: listResult.pageSize,
      totalPages: listResult.totalPages,
    };
  }

  // Unfiltered archive: resolve the deterministic published lead article
  const supabase = await createClient();

  // 1. Try to find explicitly featured published article
  const { data: featuredData, error: featuredError } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, content_json, featured_image_path, featured_image_alt, category_id, status, is_featured, is_portfolio_featured, published_at, created_at, categories ( id, name, slug, description )",
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1);

  if (featuredError) {
    throw new Error("Unable to load featured article.");
  }

  let leadArticleSummary: PublicArticleSummary | null = null;
  let isLeadExplicitlyFeatured = false;

  if (featuredData && featuredData.length > 0) {
    leadArticleSummary = mapArticleSummary(
      featuredData[0] as unknown as RawArticleRow,
    );
    isLeadExplicitlyFeatured = true;
  } else {
    // 2. Fall back to newest published article as layout lead
    const { data: latestData, error: latestError } = await supabase
      .from("articles")
      .select(
        "id, title, slug, excerpt, content_json, featured_image_path, featured_image_alt, category_id, status, is_featured, is_portfolio_featured, published_at, created_at, categories ( id, name, slug, description )",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1);

    if (latestError) {
      throw new Error("Unable to load latest article.");
    }

    if (latestData && latestData.length > 0) {
      leadArticleSummary = mapArticleSummary(
        latestData[0] as unknown as RawArticleRow,
      );
      isLeadExplicitlyFeatured = false;
    }
  }

  // Fetch paginated supporting articles excluding the deterministic lead article ID on ALL pages
  const listResult = await getPublishedArticles({
    page,
    pageSize,
    excludeArticleId: leadArticleSummary?.id,
  });

  return {
    // Only return leadArticle on page 1 for the hero visual
    leadArticle: page === 1 ? leadArticleSummary : null,
    isLeadExplicitlyFeatured: page === 1 ? isLeadExplicitlyFeatured : false,
    articles: listResult.articles,
    totalCount: listResult.totalCount,
    page: listResult.page,
    pageSize: listResult.pageSize,
    totalPages: listResult.totalPages,
  };
}

export const getMemoizedBlogViewData = cache(
  async (
    page: number,
    pageSize: number,
    topicSlug: string,
    searchQuery: string,
  ) =>
    getBlogViewData({
      page,
      pageSize,
      topicSlug: topicSlug || undefined,
      searchQuery: searchQuery || undefined,
    }),
);

async function getPublishedArticleBySlugUncached(
  slug: string,
): Promise<PublicArticleDetail | null> {
  if (!slug) return null;
  const supabase = await createClient();

  // Explicitly enforce status = 'published'
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, content_json, featured_image_path, featured_image_alt, category_id, status, is_featured, is_portfolio_featured, seo_title, seo_description, published_at, created_at, updated_at, categories ( id, name, slug, description )",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load article.");
  }

  if (!data) {
    return null;
  }

  const raw = data as unknown as RawArticleRow;
  const summary = mapArticleSummary(raw);

  // Fetch references ordered by sort_order ascending
  const { data: refData, error: refError } = await supabase
    .from("article_references")
    .select("id, title, source_name, url, citation_details, sort_order")
    .eq("article_id", raw.id)
    .order("sort_order", { ascending: true });

  if (refError) {
    throw new Error("Unable to load article references.");
  }

  const references: PublicArticleReference[] = (refData || []).map((r) => ({
    id: r.id,
    title: r.title,
    source_name: r.source_name || "",
    url: r.url,
    citation_details: r.citation_details,
    sort_order: r.sort_order ?? 0,
  }));

  return {
    ...summary,
    content_json: raw.content_json,
    seo_title: raw.seo_title || null,
    seo_description: raw.seo_description || null,
    updated_at: raw.updated_at || raw.created_at,
    references,
  };
}

export const getPublishedArticleBySlug = cache(
  getPublishedArticleBySlugUncached,
);

export async function getPublishedSitemapArticles(): Promise<
  PublicSitemapArticle[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug, status, published_at, updated_at, categories ( slug )")
    .eq("status", "published");

  if (error) {
    throw new Error("Unable to load published sitemap articles.");
  }

  return (data || []).map((row) => {
    const category = Array.isArray(row.categories)
      ? row.categories[0]
      : row.categories;

    return {
      slug: row.slug,
      status: row.status,
      published_at: row.published_at,
      updated_at: row.updated_at,
      topic_slug: category?.slug || null,
    };
  });
}

export async function getFeaturedPublishedArticle(): Promise<PublicArticleSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, content_json, featured_image_path, featured_image_alt, category_id, status, is_featured, is_portfolio_featured, published_at, created_at, categories ( id, name, slug, description )",
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error("Unable to load featured article.");
  }

  if (!data || data.length === 0) {
    return null;
  }

  return mapArticleSummary(data[0] as unknown as RawArticleRow);
}

export async function getLatestPublishedArticles(
  limit: number = 3,
): Promise<PublicArticleSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, content_json, featured_image_path, featured_image_alt, category_id, status, is_featured, is_portfolio_featured, published_at, created_at, categories ( id, name, slug, description )",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Unable to load latest articles.");
  }

  return (data || []).map((r) =>
    mapArticleSummary(r as unknown as RawArticleRow),
  );
}

export async function getPortfolioPublishedArticles(): Promise<
  PublicArticleSummary[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, content_json, featured_image_path, featured_image_alt, category_id, status, is_featured, is_portfolio_featured, published_at, created_at, categories ( id, name, slug, description )",
    )
    .eq("status", "published")
    .eq("is_portfolio_featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw new Error("Unable to load portfolio articles.");
  }

  return (data || []).map((r) =>
    mapArticleSummary(r as unknown as RawArticleRow),
  );
}

export async function getRelatedPublishedArticles(
  currentArticleId: string,
  categoryId: string | null,
  limit: number = 3,
): Promise<PublicArticleSummary[]> {
  if (!categoryId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, content_json, featured_image_path, featured_image_alt, category_id, status, is_featured, is_portfolio_featured, published_at, created_at, categories ( id, name, slug, description )",
    )
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", currentArticleId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Unable to load related articles.");
  }

  return (data || []).map((r) =>
    mapArticleSummary(r as unknown as RawArticleRow),
  );
}
