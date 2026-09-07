import Link from "next/link";
import {
  Archive,
  ArrowRight,
  Briefcase,
  FileEdit,
  FileText,
  Mail,
  MessageSquare,
  Plus,
} from "lucide-react";
import { AdminPageHeader, AdminStatusBadge } from "@/components/admin/admin-ui";
import type { AdminDashboardData } from "@/lib/admin/dashboard";
import { formatAdminDate } from "@/lib/utils";

export function AdminDashboard({ counts, recentArticles }: AdminDashboardData) {
  const metrics = [
    {
      label: "Published",
      value: counts.published,
      href: "/admin/articles?status=published",
      icon: FileText,
    },
    {
      label: "Drafts",
      value: counts.drafts,
      href: "/admin/articles?status=draft",
      icon: FileEdit,
    },
    {
      label: "Archived",
      value: counts.archived,
      href: "/admin/articles?status=archived",
      icon: Archive,
    },
    {
      label: "Portfolio",
      value: counts.portfolio,
      href: "/admin/portfolio",
      icon: Briefcase,
    },
  ];
  const attention = [
    {
      label: "Comments awaiting review",
      value: counts.pendingComments,
      href: "/admin/comments",
      icon: MessageSquare,
    },
    {
      label: "New contact messages",
      value: counts.newMessages,
      href: "/admin/messages",
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Editorial Overview"
        description="A clear view of current publishing work, reader responses, and recent article activity."
        action={
          <Link
            href="/admin/articles/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-oxide px-4 py-2.5 text-sm font-semibold text-paper shadow-xs transition-colors duration-[var(--admin-motion-fast)] hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none"
          >
            <Plus className="size-4" /> New Article
          </Link>
        }
      />

      <section aria-labelledby="publication-summary-heading">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-oxide uppercase">
              Publication
            </p>
            <h3
              id="publication-summary-heading"
              className="mt-1 font-serif text-xl font-semibold text-ink"
            >
              Content summary
            </h3>
          </div>
          <Link
            href="/admin/articles"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-oxide transition-colors duration-[var(--admin-motion-fast)] hover:text-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none"
          >
            All articles <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Link
                key={metric.label}
                href={metric.href}
                className="rounded-lg border border-subtle-divider bg-paper p-4 shadow-xs transition-colors duration-[var(--admin-motion-fast)] hover:border-control-border focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-ink-muted">
                      {metric.label}
                    </p>
                    <p className="mt-1 font-serif text-3xl font-semibold text-ink tabular-nums">
                      {metric.value}
                    </p>
                  </div>
                  <span className="rounded-md bg-subtle-field p-2 text-oxide">
                    <Icon className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <section
          aria-labelledby="attention-heading"
          className="min-w-0 rounded-lg border border-subtle-divider bg-paper p-5 shadow-xs sm:p-6 lg:col-span-5"
        >
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-oxide uppercase">
            Inbox & review
          </p>
          <h3
            id="attention-heading"
            className="mt-1 font-serif text-xl font-semibold text-ink"
          >
            Needs attention
          </h3>
          <div className="mt-5 divide-y divide-subtle-divider/70 border-y border-subtle-divider/70">
            {attention.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex min-h-16 items-center justify-between gap-4 py-3 text-sm transition-colors duration-[var(--admin-motion-fast)] hover:text-oxide focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none"
                >
                  <span className="flex items-center gap-3 font-semibold text-ink">
                    <Icon className="size-4 text-oxide" />
                    {item.label}
                  </span>
                  <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-subtle-field px-2.5 py-1 font-semibold text-oxide tabular-nums">
                    {item.value}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            {counts.pendingComments === 0 && counts.newMessages === 0
              ? "Nothing is waiting for review right now."
              : "Open a queue to review each item in context."}
          </p>
        </section>

        <section
          aria-labelledby="recent-articles-heading"
          className="min-w-0 rounded-lg border border-subtle-divider bg-paper p-5 shadow-xs sm:p-6 lg:col-span-7"
        >
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-oxide uppercase">
            Resume work
          </p>
          <h3
            id="recent-articles-heading"
            className="mt-1 font-serif text-xl font-semibold text-ink"
          >
            Recently edited
          </h3>
          {recentArticles.length === 0 ? (
            <div className="mt-5 rounded-md border border-dashed border-subtle-divider p-6 text-center">
              <p className="text-sm text-ink-muted">No article activity yet.</p>
              <Link
                href="/admin/articles/new"
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-oxide hover:underline focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              >
                Create the first draft
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-subtle-divider/70">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}`}
                  className="flex min-h-16 items-center justify-between gap-4 py-3 transition-colors duration-[var(--admin-motion-fast)] hover:text-oxide focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none motion-reduce:transition-none"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-base font-semibold text-ink">
                      {article.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      Updated {formatAdminDate(article.updated_at)}
                    </span>
                  </span>
                  <AdminStatusBadge
                    tone={
                      article.status === "published"
                        ? "success"
                        : article.status === "draft"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {article.status === "published"
                      ? "Published"
                      : article.status === "draft"
                        ? "Draft"
                        : "Archived"}
                  </AdminStatusBadge>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
