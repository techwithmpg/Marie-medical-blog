"use client";

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
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
}

const adminNavItems: AdminNavItem[] = [
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

interface AdminMobileNavProps {
  activeModule?: string;
}

export function AdminMobileNav({ activeModule }: AdminMobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md border border-[#D2C9BC] bg-card text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none md:hidden"
            aria-label="Open admin navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col justify-between">
        <div>
          <SheetHeader>
            <SheetTitle className="font-serif text-lg">Workspace</SheetTitle>
            <p className="text-xs tracking-wider text-[#5E5953] uppercase">
              Marie Medere
            </p>
          </SheetHeader>

          <nav
            aria-label="Admin Mobile Navigation"
            className="mt-6 flex flex-col space-y-1"
          >
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <SheetClose key={item.id} render={<div />}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none",
                      isActive
                        ? "bg-[#E8E2D7] font-semibold text-[#7B3F35]"
                        : "text-[#5E5953] hover:bg-[#E8E2D7]/60 hover:text-[#242321]",
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-[#7B3F35]" />
                    <span>{item.label}</span>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#D2C9BC] pt-4 text-xs text-[#5E5953]">
          <p className="font-semibold text-[#242321]">Marie Medere</p>
          <p>Medical Writer / Admin</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
