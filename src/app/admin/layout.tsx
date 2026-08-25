import * as React from "react";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Dedicated login page renders outside the protected admin shell
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return <>{children}</>;
  }

  // Authorize caller against admin allowlist
  await requireAdmin();

  let title = "Dashboard";
  let activeModule:
    | "dashboard"
    | "articles"
    | "drafts"
    | "categories"
    | "media"
    | "portfolio"
    | "comments"
    | "messages"
    | "settings" = "dashboard";

  if (pathname === "/admin") {
    title = "Dashboard";
    activeModule = "dashboard";
  } else if (pathname === "/admin/articles") {
    title = "Articles";
    activeModule = "articles";
  } else if (pathname === "/admin/articles/new") {
    title = "New Article Draft";
    activeModule = "articles";
  } else if (pathname.startsWith("/admin/articles/")) {
    title = "Edit Article Draft";
    activeModule = "articles";
  } else if (pathname.startsWith("/admin/categories")) {
    title = "Categories";
    activeModule = "categories";
  } else if (pathname.startsWith("/admin/media")) {
    title = "Media";
    activeModule = "media";
  } else if (pathname.startsWith("/admin/portfolio")) {
    title = "Portfolio";
    activeModule = "portfolio";
  } else if (pathname.startsWith("/admin/comments")) {
    title = "Comments";
    activeModule = "comments";
  } else if (pathname.startsWith("/admin/messages")) {
    title = "Messages";
    activeModule = "messages";
  } else if (pathname.startsWith("/admin/settings")) {
    title = "Settings";
    activeModule = "settings";
  }

  return (
    <AdminShell title={title} activeModule={activeModule}>
      {children}
    </AdminShell>
  );
}
