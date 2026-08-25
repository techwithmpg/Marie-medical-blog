import * as React from "react";
import { PublicShell } from "@/components/site/public-shell";

export default function TopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
