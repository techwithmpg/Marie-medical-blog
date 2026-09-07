import type { ComponentType } from "react";
import {
  Briefcase,
  FileEdit,
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
} from "lucide-react";

export type AdminModule =
  | "dashboard"
  | "articles"
  | "drafts"
  | "categories"
  | "media"
  | "portfolio"
  | "comments"
  | "messages"
  | "settings";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  id: AdminModule;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        id: "dashboard",
      },
    ],
  },
  {
    label: "Content & publishing",
    items: [
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
    ],
  },
  {
    label: "Inbox & review",
    items: [
      {
        label: "Comments",
        href: "/admin/comments",
        icon: MessageSquare,
        id: "comments",
      },
      {
        label: "Messages",
        href: "/admin/messages",
        icon: Mail,
        id: "messages",
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        id: "settings",
      },
    ],
  },
];
