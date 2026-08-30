import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/admin";

import { getAdminMediaInventory } from "@/lib/admin/media";

import { getAdminSiteMediaPlacements } from "@/lib/admin/site-media";

import { MediaManager } from "@/components/admin/media/media-manager";

import { SiteMediaPlacements } from "@/components/admin/media/site-media-placements";

export const metadata: Metadata = {
  title: "Media — Marie Medere Workspace",
};

export default async function AdminMediaPage() {
  await requireAdmin();

  const [mediaList, placements] = await Promise.all([
    getAdminMediaInventory(),

    getAdminSiteMediaPlacements(),
  ]);

  return (
    <div className="space-y-8">
      <SiteMediaPlacements initialPlacements={placements} />

      <MediaManager initialMedia={mediaList} />
    </div>
  );
}
