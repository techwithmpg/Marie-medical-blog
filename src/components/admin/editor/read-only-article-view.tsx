import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Calendar,
  Layers,
  Globe,
  BookOpen,
} from "lucide-react";
import {
  type AdminArticleDetail,
  type AdminCategoryOption,
  type AdminArticleReference,
} from "@/lib/admin/articles";
import { ArticleTypography } from "@/components/public/article-typography";

interface ReadOnlyArticleViewProps {
  article: AdminArticleDetail;
  category: AdminCategoryOption | null;
  references: AdminArticleReference[];
}

export function ReadOnlyArticleView({
  article,
  category,
  references,
}: ReadOnlyArticleViewProps) {
  const isPublished = article.status === "published";
  const isArchived = article.status === "archived";

  const statusLabel = isPublished
    ? "Published Article"
    : isArchived
      ? "Archived Article"
      : "Non-Draft Article";

  const statusMessage = isPublished
    ? "Published articles are read-only in this workspace until publishing controls are available."
    : "Archived articles are read-only in this workspace.";

  return (
    <div className="space-y-6">
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D2C9BC] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="flex items-center gap-1.5 rounded-md border border-[#D2C9BC] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#5E5953] transition-colors hover:bg-[#E8E2D7] hover:text-[#242321] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
          >
            <ArrowLeft className="size-3.5" />
            Articles
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex size-2 rounded-full ${
                  isPublished
                    ? "bg-[#3D5A4C]"
                    : isArchived
                      ? "bg-[#5E5953]"
                      : "bg-[#8B5A13]"
                }`}
              />
              <span
                className={`text-xs font-semibold tracking-wider uppercase ${
                  isPublished
                    ? "text-[#3D5A4C]"
                    : isArchived
                      ? "text-[#5E5953]"
                      : "text-[#8B5A13]"
                }`}
              >
                {statusLabel}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-xs text-[#5E5953]">
              Canonical slug: {article.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Read-Only Status Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-4 text-sm text-[#5E5953] shadow-xs">
        <div className="rounded-md bg-[#E8E2D7] p-1.5 text-[#5E5953]">
          <Lock className="size-4" />
        </div>
        <div>
          <p className="font-medium text-[#242321]">
            Read-Only Administrative View
          </p>
          <p className="mt-0.5 text-xs text-[#5E5953]">{statusMessage}</p>
        </div>
      </div>

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Title, Body, References */}
        <div className="space-y-6 lg:col-span-2">
          {/* Article Title */}
          <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-6 shadow-xs">
            <h2 className="font-serif text-2xl font-semibold text-[#242321] sm:text-3xl">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="mt-3 text-sm leading-relaxed text-[#5E5953] italic">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Rendered Article Content */}
          <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-6 shadow-xs">
            <h3 className="mb-4 border-b border-[#D2C9BC] pb-2 text-xs font-semibold tracking-wider text-[#242321] uppercase">
              Article Content
            </h3>
            <ArticleTypography contentJson={article.content_json} />
          </div>

          {/* References */}
          {references.length > 0 && (
            <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#D2C9BC] pb-3">
                <BookOpen className="size-4 text-[#7B3F35]" />
                <h3 className="font-serif text-base font-semibold text-[#242321]">
                  Reference Ledger ({references.length})
                </h3>
              </div>
              <ul className="mt-4 space-y-3">
                {references.map((ref, idx) => (
                  <li
                    key={ref.id || idx}
                    className="rounded-md border border-[#D2C9BC]/60 bg-[#F6F1E8]/40 p-3 text-xs"
                  >
                    <div className="font-semibold text-[#242321]">
                      [{idx + 1}] {ref.title}
                    </div>
                    <div className="mt-0.5 text-[#5E5953]">
                      Source: <span className="italic">{ref.source_name}</span>
                    </div>
                    {ref.url && (
                      <div className="mt-0.5 truncate text-[#704037]">
                        Link: {ref.url}
                      </div>
                    )}
                    {ref.citation_details && (
                      <div className="mt-0.5 text-[#5E5953]">
                        Details: {ref.citation_details}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Metadata Details */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#D2C9BC] pb-3">
              <Layers className="size-4 text-[#7B3F35]" />
              <h3 className="font-serif text-sm font-semibold text-[#242321]">
                Article Metadata
              </h3>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#5E5953] uppercase">
                Category
              </span>
              <p className="mt-0.5 text-sm font-medium text-[#242321]">
                {category?.name || "Uncategorized"}
              </p>
            </div>

            <div className="space-y-2 border-t border-[#D2C9BC]/60 pt-3 text-xs text-[#5E5953]">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-[#5E5953]" />
                <span>
                  Created: {new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span>
                  Last updated:{" "}
                  {new Date(article.updated_at).toLocaleDateString()}
                </span>
              </div>
              {article.published_at && (
                <div>
                  <span>
                    Published:{" "}
                    {new Date(article.published_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {(article.seo_title || article.seo_description) && (
            <div className="space-y-3 rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#D2C9BC] pb-3">
                <Globe className="size-4 text-[#7B3F35]" />
                <h3 className="font-serif text-sm font-semibold text-[#242321]">
                  SEO Metadata
                </h3>
              </div>

              {article.seo_title && (
                <div>
                  <span className="block text-xs font-semibold text-[#5E5953] uppercase">
                    SEO Title
                  </span>
                  <p className="mt-0.5 text-sm text-[#242321]">
                    {article.seo_title}
                  </p>
                </div>
              )}

              {article.seo_description && (
                <div>
                  <span className="block text-xs font-semibold text-[#5E5953] uppercase">
                    SEO Description
                  </span>
                  <p className="mt-0.5 text-xs text-[#5E5953]">
                    {article.seo_description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
