import { type Metadata } from "next";
import Link from "next/link";
import { Plus, FileText, Calendar, Clock, Tag } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminArticles, type ArticleStatus } from "@/lib/admin/articles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Articles | Marie Medere Workspace",
  description: "Manage drafts and published medical articles.",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminArticlesPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

const filterTabs = [
  { label: "All", value: "all", href: "/admin/articles" },
  { label: "Drafts", value: "draft", href: "/admin/articles?status=draft" },
  {
    label: "Published",
    value: "published",
    href: "/admin/articles?status=published",
  },
  {
    label: "Archived",
    value: "archived",
    href: "/admin/articles?status=archived",
  },
];

export default async function AdminArticlesPage({
  searchParams,
}: AdminArticlesPageProps) {
  await requireAdmin();

  const resolvedParams = await searchParams;
  const rawStatus = resolvedParams?.status || "all";
  const validStatus = ["draft", "published", "archived"].includes(rawStatus)
    ? rawStatus
    : "all";

  const articles = await getAdminArticles(validStatus);

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B5A13]/20 bg-[#8B5A13]/10 px-2.5 py-0.5 text-xs font-semibold text-[#8B5A13]">
            <span className="size-1.5 rounded-full bg-[#8B5A13]" />
            Draft
          </span>
        );
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3D5A4C]/20 bg-[#3D5A4C]/10 px-2.5 py-0.5 text-xs font-semibold text-[#3D5A4C]">
            <span className="size-1.5 rounded-full bg-[#3D5A4C]" />
            Published
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5E5953]/20 bg-[#5E5953]/10 px-2.5 py-0.5 text-xs font-semibold text-[#5E5953]">
            <span className="size-1.5 rounded-full bg-[#5E5953]" />
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Workspace Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#D2C9BC] pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#242321]">
            Articles Workspace
          </h2>
          <p className="mt-1 text-sm text-[#5E5953]">
            Manage drafts, review published research, and access the writing
            workspace.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#7B3F35] px-4 py-2.5 text-sm font-semibold text-[#FFFDF9] shadow-xs transition-colors hover:bg-[#704037] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
        >
          <Plus className="size-4" />
          New Article
        </Link>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Article status filter"
      >
        {filterTabs.map((tab) => {
          const isActive = validStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "inline-flex min-h-[44px] items-center rounded-md px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
                isActive
                  ? "bg-[#E8E2D7] font-bold text-[#7B3F35] shadow-2xs"
                  : "border border-[#D2C9BC] bg-[#FFFDF9] text-[#5E5953] hover:bg-[#E8E2D7]/50 hover:text-[#242321]",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Articles Table / List */}
      {articles.length === 0 ? (
        <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-12 text-center shadow-xs">
          <FileText className="mx-auto size-8 text-[#5E5953]/50" />
          <h3 className="mt-3 font-serif text-lg font-semibold text-[#242321]">
            No articles found
          </h3>
          <p className="mt-1 text-sm text-[#5E5953]">
            {validStatus === "all"
              ? "Your publication has no articles yet. Create your first draft to get started."
              : `There are currently no articles with status "${validStatus}".`}
          </p>
          <div className="mt-5">
            <Link
              href="/admin/articles/new"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#7B3F35] px-4 py-2 text-xs font-semibold text-[#FFFDF9] transition-colors hover:bg-[#704037] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
            >
              <Plus className="size-3.5" />
              Create First Draft
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#D2C9BC] bg-[#F6F1E8]/70 text-xs font-semibold tracking-wider text-[#5E5953] uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Article Title
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Updated
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Published
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2C9BC]/60">
                {articles.map((article) => {
                  const isDraft = article.status === "draft";
                  return (
                    <tr
                      key={article.id}
                      className="transition-colors hover:bg-[#F6F1E8]/40"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="font-serif text-base font-semibold text-[#242321] transition-colors hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
                        >
                          {article.title}
                        </Link>
                        <p className="mt-0.5 max-w-xs truncate font-mono text-xs text-[#5E5953]/70">
                          {article.slug}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap text-[#5E5953]">
                        {article.category_name ? (
                          <span className="inline-flex items-center gap-1 rounded bg-[#E8E2D7] px-2 py-0.5 font-medium text-[#242321]">
                            <Tag className="size-3 text-[#7B3F35]" />
                            {article.category_name}
                          </span>
                        ) : (
                          <span className="text-[#5E5953]/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap text-[#5E5953]">
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-[#5E5953]" />
                          {new Date(article.updated_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs whitespace-nowrap text-[#5E5953]">
                        {article.published_at ? (
                          <span className="flex items-center gap-1.5 text-[#3D5A4C]">
                            <Calendar className="size-3.5" />
                            {new Date(
                              article.published_at,
                            ).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[#5E5953]/50">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-xs whitespace-nowrap">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className={cn(
                            "inline-flex items-center rounded-md px-3 py-1.5 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
                            isDraft
                              ? "bg-[#7B3F35] text-[#FFFDF9] hover:bg-[#704037]"
                              : "border border-[#D2C9BC] bg-[#FFFDF9] text-[#5E5953] hover:bg-[#E8E2D7] hover:text-[#242321]",
                          )}
                        >
                          {isDraft ? "Edit Draft" : "View"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="divide-y divide-[#D2C9BC]/60 md:hidden">
            {articles.map((article) => {
              const isDraft = article.status === "draft";
              return (
                <div key={article.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="font-serif text-base font-semibold text-[#242321] transition-colors hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
                    >
                      {article.title}
                    </Link>
                    {getStatusBadge(article.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5E5953]">
                    {article.category_name && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#E8E2D7] px-2 py-0.5 font-medium text-[#242321]">
                        <Tag className="size-3 text-[#7B3F35]" />
                        {article.category_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {new Date(article.updated_at).toLocaleDateString()}
                    </span>
                    {article.published_at && (
                      <span className="flex items-center gap-1 text-[#3D5A4C]">
                        <Calendar className="size-3.5" />
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className={cn(
                        "inline-flex min-h-[44px] w-full items-center justify-center rounded-md px-4 py-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
                        isDraft
                          ? "bg-[#7B3F35] text-[#FFFDF9] hover:bg-[#704037]"
                          : "border border-[#D2C9BC] bg-[#FFFDF9] text-[#5E5953] hover:bg-[#E8E2D7] hover:text-[#242321]",
                      )}
                    >
                      {isDraft ? "Edit Draft" : "View Details"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
