"use client";

import * as React from "react";
import Image from "next/image";
import { X, Monitor, Tablet, Smartphone, ShieldCheck, Eye } from "lucide-react";
import { Dialog } from "@base-ui/react";
import { ArticleHeader } from "@/components/public/article-header";
import { ArticleTypography } from "@/components/public/article-typography";
import {
  ReferenceLedger,
  type ReferenceItem,
} from "@/components/evidence/reference-ledger";
import { AuthorBlock } from "@/components/public/author-block";
import { MedicalDisclaimer } from "@/components/public/medical-disclaimer";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { PublicCategory } from "@/lib/public-articles";
import type { PublicProfile } from "@/lib/public-data";

export interface ArticlePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  excerpt?: string | null;
  contentJson: Record<string, unknown>;
  category?: PublicCategory | null;
  featuredImagePath?: string | null;
  featuredImageAlt?: string | null;
  references: Array<{
    title: string;
    source_name: string;
    url?: string | null;
    citation_details?: string | null;
  }>;
  status: "draft" | "published" | "archived";
  publishedAt?: string | null;
  updatedAt?: string | null;
  slug?: string | null;
  profile: PublicProfile;
  disclaimerText: string | null;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export function ArticlePreviewModal({
  open,
  onOpenChange,
  title,
  excerpt,
  contentJson,
  category,
  featuredImagePath,
  featuredImageAlt,
  references,
  status,
  publishedAt,
  updatedAt,
  slug,
  profile,
  disclaimerText,
}: ArticlePreviewProps) {
  const [viewport, setViewport] = React.useState<ViewportMode>("desktop");
  const [resolvedImageUrl, setResolvedImageUrl] = React.useState<string | null>(
    null,
  );

  // Estimate reading time from ProseMirror JSON
  const estimatedReadingTime = React.useMemo(() => {
    try {
      const text = JSON.stringify(contentJson);
      const words = text.split(/\s+/).length;
      return Math.max(1, Math.ceil(words / 200));
    } catch {
      return 1;
    }
  }, [contentJson]);

  // Resolve featured image URL (signed URL for draft assets or public URL for published assets)
  React.useEffect(() => {
    let isMounted = true;

    async function resolveImage() {
      if (!featuredImagePath) {
        setResolvedImageUrl(null);
        return;
      }

      if (
        featuredImagePath.startsWith("http://") ||
        featuredImagePath.startsWith("https://")
      ) {
        setResolvedImageUrl(featuredImagePath);
        return;
      }

      try {
        const supabase = createClient();
        if (status === "published") {
          // Public bucket URL
          const { data } = supabase.storage
            .from("public-assets")
            .getPublicUrl(featuredImagePath);
          if (isMounted) setResolvedImageUrl(data.publicUrl);
        } else {
          // Private draft bucket signed URL
          const { data } = await supabase.storage
            .from("draft-assets")
            .createSignedUrl(featuredImagePath, 3600);
          if (isMounted) setResolvedImageUrl(data?.signedUrl || null);
        }
      } catch {
        if (isMounted) setResolvedImageUrl(null);
      }
    }

    if (open) {
      resolveImage();
    }

    return () => {
      isMounted = false;
    };
  }, [featuredImagePath, status, open]);

  const formattedReferences: ReferenceItem[] = React.useMemo(
    () =>
      references.map((r, i) => ({
        id: `preview-ref-${i}`,
        title: r.title,
        source_name: r.source_name,
        url: r.url || null,
        citation_details: r.citation_details || null,
      })),
    [references],
  );

  const hasValidImage = Boolean(
    resolvedImageUrl && featuredImageAlt && featuredImageAlt.trim().length > 0,
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#242321]/60 backdrop-blur-xs transition-opacity duration-200" />
        <Dialog.Popup className="fixed inset-0 z-50 flex flex-col bg-[#FAF8F5] focus:outline-none">
          {/* Top Control & Information Bar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-subtle-divider bg-paper px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-oxide/30 bg-oxide/10 px-3 py-1 text-xs font-semibold text-oxide">
                <Eye className="size-3.5" />
                <span>Admin-Local Preview</span>
              </div>
              <span className="hidden text-xs text-ink-muted sm:inline-block">
                Full Evidence Folio typography & layout (Isolated from public)
              </span>
            </div>

            {/* Viewport Width Switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-subtle-divider bg-subtle-field p-1">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                title="Desktop view"
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                  viewport === "desktop"
                    ? "bg-paper text-oxide shadow-2xs"
                    : "text-ink-muted hover:text-ink",
                )}
                aria-label="Desktop viewport"
              >
                <Monitor className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewport("tablet")}
                title="Tablet view (768px)"
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                  viewport === "tablet"
                    ? "bg-paper text-oxide shadow-2xs"
                    : "text-ink-muted hover:text-ink",
                )}
                aria-label="Tablet viewport"
              >
                <Tablet className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                title="Mobile view (375px)"
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                  viewport === "mobile"
                    ? "bg-paper text-oxide shadow-2xs"
                    : "text-ink-muted hover:text-ink",
                )}
                aria-label="Mobile viewport"
              >
                <Smartphone className="size-4" />
              </button>
            </div>

            {/* Close Button */}
            <div className="flex items-center gap-2">
              <Dialog.Close
                className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-subtle-divider bg-paper text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                aria-label="Close preview"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>
          </header>

          {/* Sub-header Warning / Status Banner */}
          <div className="flex items-center justify-between border-b border-subtle-divider/60 bg-parchment/60 px-6 py-2 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-success" />
              <span>
                Status: <strong className="capitalize">{status}</strong>
                {slug ? ` • Slug: /blog/${slug}` : " • Provisional Draft"}
              </span>
            </div>
            <span className="text-[0.6875rem] text-ink-muted">
              Press Esc or click Close to return to editor
            </span>
          </div>

          {/* Preview Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div
              className={cn(
                "mx-auto min-h-full rounded-xl border border-subtle-divider bg-[#FAF8F5] p-6 shadow-sm transition-all sm:p-12 md:p-16",
                viewport === "desktop" && "max-w-4xl",
                viewport === "tablet" && "max-w-[768px]",
                viewport === "mobile" && "max-w-[390px] px-4 py-8",
              )}
            >
              <article className="space-y-12 sm:space-y-16">
                {/* Article Header */}
                <ArticleHeader
                  title={title || "Untitled Article"}
                  excerpt={excerpt}
                  category={category}
                  publishedAt={publishedAt || new Date().toISOString()}
                  updatedAt={updatedAt}
                  readingTimeMinutes={estimatedReadingTime}
                />

                {/* Featured Image */}
                {hasValidImage && resolvedImageUrl && featuredImageAlt && (
                  <div className="overflow-hidden rounded-md border border-subtle-divider">
                    <div className="relative aspect-16/9 w-full bg-subtle-field">
                      <Image
                        src={resolvedImageUrl}
                        alt={featuredImageAlt}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
                      />
                    </div>
                  </div>
                )}

                {/* Body Content */}
                <div className="border-t border-subtle-divider pt-8">
                  <ArticleTypography contentJson={contentJson} />
                </div>

                {/* Reference Ledger */}
                {formattedReferences.length > 0 && (
                  <div className="border-t border-subtle-divider pt-10">
                    <ReferenceLedger items={formattedReferences} />
                  </div>
                )}

                {/* Author Block */}
                <div className="border-t border-subtle-divider pt-10">
                  <AuthorBlock profile={profile} />
                </div>

                {/* Medical Disclaimer */}
                <div className="border-t border-subtle-divider pt-8">
                  <MedicalDisclaimer disclaimerText={disclaimerText} />
                </div>
              </article>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
