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

  return <AdminShell>{children}</AdminShell>;
}
