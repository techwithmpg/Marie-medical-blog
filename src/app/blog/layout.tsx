import * as React from "react";
import { PublicShell } from "@/components/site/public-shell";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
