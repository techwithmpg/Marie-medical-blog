import { type Metadata } from "next";
import Link from "next/link";
import { Star, CheckCircle, PlusCircle, MinusCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminPortfolioArticles } from "@/lib/admin/portfolio";
import {
  setLeadFeaturedArticleAction,
  togglePortfolioFeaturedAction,
} from "@/app/admin/portfolio/actions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portfolio & Featuring | Marie Medere Workspace",
  description:
    "Curate Selected Writing and configure the publication lead article.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPortfolioPage() {
  await requireAdmin();

  const articles = await getAdminPortfolioArticles();
  const currentLead = articles.find((a) => a.is_featured);
  const selectedWritingArticles = articles.filter(
    (a) => a.is_portfolio_featured,
  );

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="border-b border-subtle-divider pb-5">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
          Portfolio &amp; Featuring
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Designate the primary publication lead article for the homepage and
          curate the list of published works featured in the Selected Writing
          portfolio.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-lg border border-subtle-divider bg-paper p-8 text-center">
          <p className="text-sm text-ink-muted">
            No published articles available to feature. Publish articles from
            the articles workspace before curating the portfolio.
          </p>
          <div className="mt-4">
            <Link
              href="/admin/articles"
              className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-md bg-oxide px-4 py-2 text-xs font-semibold text-paper hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
            >
              Go to Articles Workspace
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Lead Featured Article Control */}
          <section className="space-y-4 rounded-lg border border-subtle-divider bg-paper p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-subtle-divider pb-3">
              <Star className="size-5 text-oxide" />
              <h3 className="font-serif text-lg font-semibold text-ink">
                Homepage &amp; Publication Lead Article
              </h3>
            </div>

            <p className="text-xs leading-relaxed text-ink-muted">
              Select one published article to serve as the highlighted lead
              piece across the homepage and blog index. If no article is
              explicitly selected, the most recent published article will
              automatically serve as the fallback lead.
            </p>

            <form
              action={setLeadFeaturedArticleAction}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <label htmlFor="lead-article-select" className="sr-only">
                Select Lead Article
              </label>
              <select
                id="lead-article-select"
                name="articleId"
                defaultValue={currentLead?.id || ""}
                className="bg-reading-surface w-full flex-1 rounded-md border border-subtle-divider px-3 py-2.5 text-sm text-ink transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              >
                <option value="">
                  No explicit lead (Automatic newest published article fallback)
                </option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}{" "}
                    {article.category_name ? `(${article.category_name})` : ""}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-md bg-oxide px-5 py-2.5 text-sm font-semibold text-paper shadow-xs transition-colors hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              >
                Update Lead Article
              </button>
            </form>

            {currentLead && (
              <div className="flex items-center gap-2 pt-1 text-xs text-ink">
                <CheckCircle className="size-4 text-success" />
                <span>
                  Current explicit lead:{" "}
                  <strong className="font-semibold">{currentLead.title}</strong>
                </span>
              </div>
            )}
          </section>

          {/* Section 2: Selected Writing Curated Portfolio */}
          <section className="space-y-4 rounded-lg border border-subtle-divider bg-paper p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle-divider pb-3">
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">
                  Selected Writing (Curated Portfolio)
                </h3>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Choose which published articles appear on the public{" "}
                  <Link
                    href="/portfolio"
                    target="_blank"
                    className="text-oxide underline hover:text-oxide-link"
                  >
                    /portfolio
                  </Link>{" "}
                  page.
                </p>
              </div>

              <span className="bg-reading-surface rounded-full border border-subtle-divider px-3 py-1 text-xs font-semibold text-ink">
                {selectedWritingArticles.length} Selected{" "}
                {selectedWritingArticles.length === 1 ? "Article" : "Articles"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-subtle-divider text-xs font-semibold tracking-wider text-ink-muted uppercase">
                    <th scope="col" className="px-4 py-3">
                      Article Title
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status / Badges
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Portfolio Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle-divider/60">
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className={cn(
                        "transition-colors hover:bg-subtle-field",
                        article.is_portfolio_featured && "bg-parchment/20",
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-ink">
                          {article.title}
                        </div>
                        <div className="text-xs text-ink-muted">
                          /blog/{article.slug}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-ink-muted">
                        {article.category_name || "Uncategorized"}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {article.is_portfolio_featured && (
                            <span className="inline-flex items-center gap-1 rounded-sm border border-success/30 bg-success/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-success uppercase">
                              Portfolio Featured
                            </span>
                          )}
                          {article.is_featured && (
                            <span className="inline-flex items-center gap-1 rounded-sm border border-oxide/30 bg-oxide/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-oxide uppercase">
                              Lead Article
                            </span>
                          )}
                          {!article.is_portfolio_featured &&
                            !article.is_featured && (
                              <span className="text-xs text-ink-muted">
                                Standard
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <form action={togglePortfolioFeaturedAction}>
                          <input
                            type="hidden"
                            name="articleId"
                            value={article.id}
                          />
                          <input
                            type="hidden"
                            name="operation"
                            value={
                              article.is_portfolio_featured
                                ? "unfeature"
                                : "feature"
                            }
                          />
                          <button
                            type="submit"
                            className={cn(
                              "inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                              article.is_portfolio_featured
                                ? "border-subtle-divider bg-paper text-warning hover:bg-warning/10"
                                : "border-subtle-divider bg-paper text-ink hover:bg-subtle-field",
                            )}
                          >
                            {article.is_portfolio_featured ? (
                              <>
                                <MinusCircle className="size-3.5" />
                                <span>Remove</span>
                              </>
                            ) : (
                              <>
                                <PlusCircle className="size-3.5 text-oxide" />
                                <span>Feature in Portfolio</span>
                              </>
                            )}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
