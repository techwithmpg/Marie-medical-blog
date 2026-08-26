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
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-oxide/30 bg-oxide/10 px-2.5 py-0.5 text-xs font-semibold text-oxide">
            <span className="size-1.5 rounded-full bg-oxide" />
            New
          </span>
        );
      case "read":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
            <span className="size-1.5 rounded-full bg-success" />
            Read
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-muted/20 bg-ink-muted/10 px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
            <span className="size-1.5 rounded-full bg-ink-muted" />
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Inbox Workspace Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-subtle-divider pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
            Contact Inbox
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Review and organize inquiries, editorial requests, and
            communications received through the contact form.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Contact message status filter"
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
                "inline-flex min-h-[44px] items-center rounded-md px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                isActive
                  ? "bg-subtle-field font-bold text-oxide shadow-2xs"
                  : "border border-subtle-divider bg-paper text-ink-muted hover:bg-subtle-field/50 hover:text-ink",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

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
                        <button
                          type="submit"
                          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md bg-success/15 px-4 py-2 text-xs font-semibold text-success transition-colors hover:bg-success/25 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                        >
                          <CheckCircle2 className="size-3.5" />
                          Mark Read
                        </button>
                      </form>

                      <form action={updateContactMessageStatusAction}>
                        <input
                          type="hidden"
                          name="messageId"
                          value={selectedMessage.id}
                        />
                        <input type="hidden" name="operation" value="archive" />
                        <button
                          type="submit"
                          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                        >
                          <Archive className="size-3.5" />
                          Archive
                        </button>
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
                      <button
                        type="submit"
                        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      >
                        <Archive className="size-3.5" />
                        Archive Message
                      </button>
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
                      <button
                        type="submit"
                        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md bg-oxide/10 px-4 py-2 text-xs font-semibold text-oxide transition-colors hover:bg-oxide/20 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                      >
                        <RotateCcw className="size-3.5" />
                        Restore to Read
                      </button>
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
