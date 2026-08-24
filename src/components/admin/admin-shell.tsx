import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  FileEdit,
  FolderTree,
  Image,
  Briefcase,
  MessageSquare,
  Mail,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  activeModule?:
    | "dashboard"
    | "articles"
    | "drafts"
    | "categories"
    | "media"
    | "portfolio"
    | "comments"
    | "messages"
    | "settings";
  actions?: React.ReactNode;
}

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    id: "dashboard",
  },
  {
    label: "Articles",
    href: "/admin/articles",
    icon: FileText,
    id: "articles",
  },
  {
    label: "Drafts",
    href: "/admin/articles?status=draft",
    icon: FileEdit,
    id: "drafts",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    id: "categories",
  },
  { label: "Media", href: "/admin/media", icon: Image, id: "media" },
  {
    label: "Portfolio",
    href: "/admin/portfolio",
    icon: Briefcase,
    id: "portfolio",
  },
  {
    label: "Comments",
    href: "/admin/comments",
    icon: MessageSquare,
    id: "comments",
  },
  { label: "Messages", href: "/admin/messages", icon: Mail, id: "messages" },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    id: "settings",
  },
];

export function AdminShell({
  children,
  title = "Dashboard",
  activeModule = "dashboard",
  actions,
}: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-[#F6F1E8] font-sans text-foreground">
      {/* Desktop Sidebar */}
      <aside
        aria-label="Admin Sidebar"
        className="hidden border-r border-[#D2C9BC] bg-[#FFFDF9] md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col"
      >
        {/* Brand identity */}
        <div className="flex h-16 items-center justify-between border-b border-[#D2C9BC] px-6">
          <Link
            href="/admin"
            className="flex flex-col rounded-xs focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
          >
            <span className="font-serif text-lg font-medium text-[#242321]">
              Marie Medere
            </span>
            <span className="text-[0.625rem] font-semibold tracking-widest text-[#7B3F35] uppercase">
              Workspace
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View live site"
            className="rounded-xs p-1 text-[#5E5953] transition-colors hover:text-[#7B3F35] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
          >
            <ArrowUpRight className="size-4" />
            <span className="sr-only">View live publication</span>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav
          aria-label="Admin Navigation"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
        >
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
                  isActive
                    ? "bg-[#E8E2D7] font-semibold text-[#7B3F35]"
                    : "text-[#5E5953] hover:bg-[#E8E2D7]/50 hover:text-[#242321]",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-[#7B3F35]" : "text-[#5E5953]",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="border-t border-[#D2C9BC] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full border border-[#D2C9BC] bg-[#E8E2D7] font-serif text-sm font-medium text-[#7B3F35]">
              M
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-semibold text-[#242321]">
                Marie Medere
              </span>
              <span className="text-[0.625rem] tracking-wider text-[#5E5953] uppercase">
                Writer / Admin
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main workspace container */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#D2C9BC] bg-[#F6F1E8]/90 px-5 backdrop-blur-xs sm:px-8">
          <div className="flex items-center gap-3">
            <AdminMobileNav activeModule={activeModule} />
            <h1 className="font-serif text-xl font-medium tracking-tight text-[#242321] sm:text-2xl">
              {title}
            </h1>
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Workspace Canvas */}
        <main className="w-full max-w-[1248px] flex-1 p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
