import { createClient } from "@/lib/supabase/server";

export interface AdminDashboardArticle {
  id: string;
  title: string;
  status: "draft" | "published" | "archived";
  updated_at: string;
}

export interface AdminDashboardData {
  counts: {
    published: number;
    drafts: number;
    archived: number;
    portfolio: number;
    pendingComments: number;
    newMessages: number;
  };
  recentArticles: AdminDashboardArticle[];
}

function countOrZero(value: number | null): number {
  return value ?? 0;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();
  const [
    published,
    drafts,
    archived,
    portfolio,
    pendingComments,
    newMessages,
    recentArticles,
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "archived"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("is_portfolio_featured", true),
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("articles")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const firstError = [
    published.error,
    drafts.error,
    archived.error,
    portfolio.error,
    pendingComments.error,
    newMessages.error,
    recentArticles.error,
  ].find(Boolean);
  if (firstError) {
    throw new Error(`Unable to load the admin overview: ${firstError.message}`);
  }

  return {
    counts: {
      published: countOrZero(published.count),
      drafts: countOrZero(drafts.count),
      archived: countOrZero(archived.count),
      portfolio: countOrZero(portfolio.count),
      pendingComments: countOrZero(pendingComments.count),
      newMessages: countOrZero(newMessages.count),
    },
    recentArticles: (recentArticles.data ?? []) as AdminDashboardArticle[],
  };
}
