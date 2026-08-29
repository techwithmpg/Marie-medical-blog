import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminMediaInventory } from "@/lib/admin/media";
import { MediaManager } from "@/components/admin/media/media-manager";

export const metadata: Metadata = {
  title: "Media — Marie Medere Workspace",
};

export default async function AdminMediaPage() {
  await requireAdmin();
  const mediaList = await getAdminMediaInventory();

  return <MediaManager initialMedia={mediaList} />;
}
