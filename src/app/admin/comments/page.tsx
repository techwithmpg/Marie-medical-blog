import { type Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare,
  Clock,
  ExternalLink,
  ShieldCheck,
  EyeOff,
  Trash2,
  Lock,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminComments,
  type AdminCommentStatus,
} from "@/lib/admin/comments";
import { moderateCommentAction } from "./actions";
import { formatAdminDate } from "@/lib/utils";
import {
  AdminFilterNav,
  AdminPageHeader,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";

export const metadata: Metadata = {
  title: "Comments | Marie Medere Workspace",
  description: "Review and moderate reader comments on published research.",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminCommentsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

const filterTabs = [
  { label: "Pending Review", value: "pending", href: "/admin/comments" },
  {
    label: "Approved",
    value: "approved",
    href: "/admin/comments?status=approved",
  },
  {
    label: "Hidden",
    value: "hidden",
    href: "/admin/comments?status=hidden",
  },
  {
    label: "All Comments",
    value: "all",
    href: "/admin/comments?status=all",
  },
];

export default async function AdminCommentsPage({
  searchParams,
}: AdminCommentsPageProps) {
  await requireAdmin();

  const resolvedParams = await searchParams;
  const rawStatus = resolvedParams?.status || "pending";
  const validStatus = ["pending", "approved", "hidden", "all"].includes(
    rawStatus,
  )
    ? rawStatus
    : "pending";

  const comments = await getAdminComments(validStatus);

  const getStatusBadge = (status: AdminCommentStatus) => {
    switch (status) {
      case "pending":
        return (
          <AdminStatusBadge tone="warning">Pending Review</AdminStatusBadge>
        );
      case "approved":
        return <AdminStatusBadge tone="success">Approved</AdminStatusBadge>;
      case "hidden":
        return <AdminStatusBadge tone="muted">Hidden</AdminStatusBadge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Moderation Workspace Header */}
      <AdminPageHeader
        title="Comment Moderation"
        description="Review reader responses, moderate submissions, and maintain discussion quality across published articles."
      />

      {/* Filter Tabs */}
      <AdminFilterNav
        label="Comment moderation status filter"
        items={filterTabs}
        activeValue={validStatus}
      />

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="rounded-lg border border-subtle-divider bg-paper p-12 text-center shadow-xs">
          <MessageSquare className="mx-auto size-8 text-ink-muted/50" />
          <h3 className="mt-3 font-serif text-lg font-semibold text-ink">
            No comments found
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {validStatus === "pending"
              ? "There are currently no pending comments awaiting moderation."
              : validStatus === "all"
                ? "No reader comments have been submitted yet."
                : `There are currently no comments with status "${validStatus}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isPending = comment.status === "pending";
            const isApproved = comment.status === "approved";
            const isHidden = comment.status === "hidden";

            return (
              <div
                key={comment.id}
                className="rounded-lg border border-subtle-divider bg-paper p-5 shadow-xs transition-colors hover:border-subtle-divider/80 sm:p-6"
              >
                {/* Header row: Author, Private Email, Status, Date */}
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">
                      {comment.commenter_name}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-subtle-field px-2 py-0.5 text-xs text-ink-muted">
                      <Lock className="size-3 text-ink-muted" />
                      <span className="sr-only">Private Email: </span>
                      {comment.commenter_email}
                    </span>
                    {getStatusBadge(comment.status)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      Submitted {formatAdminDate(comment.created_at)}
                    </span>
                    {comment.moderated_at && (
                      <span className="hidden text-ink-muted sm:inline">
                        • Moderated {formatAdminDate(comment.moderated_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Article Context */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                  <span>Article:</span>
                  <Link
                    href={`/admin/articles/${comment.article_id}`}
                    className="font-medium text-ink hover:text-oxide hover:underline focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  >
                    {comment.article_title}
                  </Link>
                  {comment.article_slug &&
                    comment.article_status === "published" && (
                      <Link
                        href={`/blog/${comment.article_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-oxide hover:underline focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      >
                        <span>(Live Article)</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    )}
                </div>

                {/* Comment Body */}
                <div className="mt-4 rounded-md border border-subtle-divider/60 bg-parchment/30 p-3.5 text-sm whitespace-pre-wrap text-ink">
                  {comment.body}
                </div>

                {/* Moderation Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-subtle-divider/60 pt-3.5">
                  {(isPending || isHidden) && (
                    <form action={moderateCommentAction}>
                      <input
                        type="hidden"
                        name="commentId"
                        value={comment.id}
                      />
                      <input type="hidden" name="operation" value="approve" />
                      <AdminSubmitButton
                        pendingLabel="Approving…"
                        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md bg-success/15 px-3.5 py-2 text-xs font-semibold text-success transition-colors hover:bg-success/25 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      >
                        <ShieldCheck className="size-3.5" />
                        Approve
                      </AdminSubmitButton>
                    </form>
                  )}

                  {(isPending || isApproved) && (
                    <form action={moderateCommentAction}>
                      <input
                        type="hidden"
                        name="commentId"
                        value={comment.id}
                      />
                      <input type="hidden" name="operation" value="hide" />
                      <AdminSubmitButton
                        pendingLabel="Hiding…"
                        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3.5 py-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      >
                        <EyeOff className="size-3.5" />
                        Hide
                      </AdminSubmitButton>
                    </form>
                  )}

                  <ConfirmationDialog
                    trigger={
                      <button className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-warning/30 bg-paper px-3.5 py-2 text-xs font-semibold text-warning transition-colors hover:bg-warning/10 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none">
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    }
                    title="Delete this comment?"
                    description="This permanently removes the comment from the moderation workspace. This action cannot be undone."
                    confirmLabel="Delete comment"
                    pendingLabel="Deleting…"
                    destructive
                    action={moderateCommentAction}
                    fields={{ commentId: comment.id, operation: "delete" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
