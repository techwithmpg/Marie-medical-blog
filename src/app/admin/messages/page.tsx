import { type Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  Clock,
  Archive,
  CheckCircle2,
  RotateCcw,
  Lock,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminContactMessages,
  type AdminMessageStatus,
} from "@/lib/admin/messages";
import { updateContactMessageStatusAction } from "./actions";
import { cn, formatAdminDate } from "@/lib/utils";
import {
  AdminFilterNav,
  AdminPageHeader,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";

export const metadata: Metadata = {
  title: "Messages | Marie Medere Workspace",
  description: "Review inquiries and communications from the contact form.",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminMessagesPageProps {
  searchParams: Promise<{
    status?: string;
    id?: string;
  }>;
}

const filterTabs = [
  { label: "New Inquiries", value: "new", href: "/admin/messages" },
  { label: "Read", value: "read", href: "/admin/messages?status=read" },
  {
    label: "Archived",
    value: "archived",
    href: "/admin/messages?status=archived",
  },
  { label: "All Messages", value: "all", href: "/admin/messages?status=all" },
];

export default async function AdminMessagesPage({
  searchParams,
}: AdminMessagesPageProps) {
  await requireAdmin();

  const resolvedParams = await searchParams;
  const rawStatus = resolvedParams?.status || "new";
  const validStatus = ["new", "read", "archived", "all"].includes(rawStatus)
    ? rawStatus
    : "new";
  const selectedId = resolvedParams?.id;

  const messages = await getAdminContactMessages(validStatus);

  // Determine active selected message for reader pane
  const selectedMessage = selectedId
    ? messages.find((m) => m.id === selectedId) || null
    : messages.length > 0
      ? messages[0]
      : null;

  const getStatusBadge = (status: AdminMessageStatus) => {
    switch (status) {
      case "new":
        return <AdminStatusBadge tone="oxide">New</AdminStatusBadge>;
      case "read":
        return <AdminStatusBadge tone="success">Read</AdminStatusBadge>;
      case "archived":
        return <AdminStatusBadge tone="muted">Archived</AdminStatusBadge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Inbox Workspace Header */}
      <AdminPageHeader
        title="Contact Inbox"
        description="Review and organize inquiries, editorial requests, and communications received through the contact form."
      />

      {/* Filter Tabs */}
      <AdminFilterNav
        label="Contact message status filter"
        items={filterTabs}
        activeValue={validStatus}
      />

      {/* Same-Page Inbox Grid */}
      {messages.length === 0 ? (
        <div className="rounded-lg border border-subtle-divider bg-paper p-12 text-center shadow-xs">
          <Mail className="mx-auto size-8 text-ink-muted/50" />
          <h3 className="mt-3 font-serif text-lg font-semibold text-ink">
            No messages found
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {validStatus === "new"
              ? "There are currently no new unread inquiries in your inbox."
              : validStatus === "all"
                ? "No contact messages have been received yet."
                : `There are currently no messages with status "${validStatus}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Pane: Message List */}
          <div className="space-y-2.5 lg:col-span-5">
            <div className="text-xs font-semibold tracking-wider text-ink-muted uppercase">
              Inquiries ({messages.length})
            </div>
            <div className="divide-y divide-subtle-divider/60 overflow-hidden rounded-lg border border-subtle-divider bg-paper shadow-xs">
              {messages.map((msg) => {
                const isCurrent = selectedMessage?.id === msg.id;
                return (
                  <Link
                    key={msg.id}
                    href={`/admin/messages?status=${validStatus}&id=${msg.id}`}
                    className={cn(
                      "block p-4 transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                      isCurrent
                        ? "border-l-4 border-oxide bg-subtle-field/90"
                        : "hover:bg-parchment/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-sm font-semibold",
                          msg.status === "new"
                            ? "font-bold text-ink"
                            : "text-ink/85",
                        )}
                      >
                        {msg.name}
                      </span>
                      {getStatusBadge(msg.status)}
                    </div>
                    <p
                      className={cn(
                        "mt-1 truncate text-xs",
                        msg.status === "new"
                          ? "font-semibold text-ink"
                          : "text-ink-muted",
                      )}
                    >
                      {msg.subject}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatAdminDate(msg.created_at)}
                      </span>
                      <span className="max-w-[140px] truncate font-medium text-ink">
                        {msg.email}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Pane: Selected Message Reader */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <div className="rounded-lg border border-subtle-divider bg-paper p-6 shadow-xs">
                {/* Header: Subject, Date, Status */}
                <div className="border-b border-subtle-divider pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-serif text-xl font-semibold text-ink">
                      {selectedMessage.subject}
                    </h3>
                    {getStatusBadge(selectedMessage.status)}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                    <div>
                      <span className="font-medium text-ink">From: </span>
                      <span>{selectedMessage.name}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded bg-subtle-field px-2 py-0.5 text-xs text-ink-muted">
                      <Lock className="size-3 text-ink-muted" />
                      <span className="sr-only">Sender Email: </span>
                      {selectedMessage.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      Received {formatAdminDate(selectedMessage.created_at)}
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="mt-6 rounded-md border border-subtle-divider/60 bg-parchment/20 p-5 text-sm leading-relaxed whitespace-pre-wrap text-ink">
                  {selectedMessage.message}
                </div>

                {/* Status Transition Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-subtle-divider pt-4">
                  {selectedMessage.status === "new" && (
                    <>
                      <form action={updateContactMessageStatusAction}>
                        <input
                          type="hidden"
                          name="messageId"
                          value={selectedMessage.id}
                        />
                        <input type="hidden" name="operation" value="read" />
                        <AdminSubmitButton
                          pendingLabel="Marking read…"
                          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md bg-success/15 px-4 py-2 text-xs font-semibold text-success transition-colors hover:bg-success/25 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                        >
                          <CheckCircle2 className="size-3.5" />
                          Mark Read
                        </AdminSubmitButton>
                      </form>

                      <form action={updateContactMessageStatusAction}>
                        <input
                          type="hidden"
                          name="messageId"
                          value={selectedMessage.id}
                        />
                        <input type="hidden" name="operation" value="archive" />
                        <AdminSubmitButton
                          pendingLabel="Archiving…"
                          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                        >
                          <Archive className="size-3.5" />
                          Archive
                        </AdminSubmitButton>
                      </form>
                    </>
                  )}

                  {selectedMessage.status === "read" && (
                    <form action={updateContactMessageStatusAction}>
                      <input
                        type="hidden"
                        name="messageId"
                        value={selectedMessage.id}
                      />
                      <input type="hidden" name="operation" value="archive" />
                      <AdminSubmitButton
                        pendingLabel="Archiving…"
                        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      >
                        <Archive className="size-3.5" />
                        Archive Message
                      </AdminSubmitButton>
                    </form>
                  )}

                  {selectedMessage.status === "archived" && (
                    <form action={updateContactMessageStatusAction}>
                      <input
                        type="hidden"
                        name="messageId"
                        value={selectedMessage.id}
                      />
                      <input type="hidden" name="operation" value="restore" />
                      <AdminSubmitButton
                        pendingLabel="Restoring…"
                        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md bg-oxide/10 px-4 py-2 text-xs font-semibold text-oxide transition-colors hover:bg-oxide/20 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      >
                        <RotateCcw className="size-3.5" />
                        Restore to Read
                      </AdminSubmitButton>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-subtle-divider bg-paper p-8 text-center text-sm text-ink-muted">
                Select an inquiry from the list to read its contents.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
