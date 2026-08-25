"use client";

import * as React from "react";
import {
  Send,
  Loader2,
  AlertCircle,
  Lock,
  Globe,
  Tag,
  ImageIcon,
  BookOpen,
  FileText,
  X,
} from "lucide-react";
import { Dialog } from "@base-ui/react";
import {
  generateCanonicalSlug,
  isValidCanonicalSlug,
  normalizeSlugCandidate,
} from "@/lib/admin/publishing";
import type { AdminCategoryOption } from "@/lib/admin/articles";

export interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  excerpt?: string | null;
  categoryId?: string | null;
  categories: AdminCategoryOption[];
  featuredImagePath?: string | null;
  featuredImageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  referencesCount: number;
  existingSlug?: string | null;
  isEverPublished: boolean;
  onConfirmPublish: (customSlug?: string) => Promise<void>;
  publishing: boolean;
  errorMessage?: string | null;
}

export function PublishModal({
  open,
  onOpenChange,
  title,
  categoryId,
  categories,
  featuredImagePath,
  seoTitle,
  seoDescription,
  referencesCount,
  existingSlug,
  isEverPublished,
  onConfirmPublish,
  publishing,
  errorMessage,
}: PublishModalProps) {
  // Candidate slug state tracking
  const [userCustomSlug, setUserCustomSlug] = React.useState<string | null>(
    null,
  );

  const selectedCategory =
    categories.find((c) => c.id === categoryId)?.name ||
    "Unassigned (No category)";

  const candidateSlug = isEverPublished
    ? existingSlug || ""
    : userCustomSlug !== null
      ? normalizeSlugCandidate(userCustomSlug)
      : generateCanonicalSlug(title);

  const isSlugValid = isEverPublished || isValidCanonicalSlug(candidateSlug);

  const handlePublishClick = async () => {
    if (publishing || !isSlugValid) return;
    await onConfirmPublish(isEverPublished ? undefined : candidateSlug);
  };

  const handleOpenChangeInternal = (nextOpen: boolean) => {
    if (!nextOpen) {
      setUserCustomSlug(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChangeInternal}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#242321]/50 backdrop-blur-xs transition-opacity duration-200" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-subtle-divider bg-[#FAF8F5] p-6 shadow-xl focus:outline-none sm:p-8">
          {/* Modal Header */}
          <div className="flex items-start justify-between border-b border-subtle-divider pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-oxide/10 text-oxide">
                  <Send className="size-4" />
                </span>
                <h3 className="font-serif text-lg font-semibold text-ink sm:text-xl">
                  {isEverPublished ? "Republish Article" : "Publish Article"}
                </h3>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {isEverPublished
                  ? "This article was previously published. Republishing will restore live public visibility using its permanent canonical slug."
                  : "Review publication metadata and confirm canonical public permalink before publishing."}
              </p>
            </div>

            <Dialog.Close
              disabled={publishing}
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Canonical Slug / URL Configuration */}
          <div className="mt-5 space-y-4 rounded-lg border border-subtle-divider bg-paper p-4">
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="publish-canonical-slug"
                  className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-ink uppercase"
                >
                  {isEverPublished && (
                    <Lock className="size-3 text-ink-muted" />
                  )}
                  Canonical Slug
                </label>
                {isEverPublished ? (
                  <span className="text-[0.6875rem] font-medium text-ink-muted">
                    Permanent • Immutable
                  </span>
                ) : (
                  <span className="text-[0.6875rem] text-ink-muted">
                    {candidateSlug.length}/80 chars
                  </span>
                )}
              </div>

              {isEverPublished ? (
                <div className="mt-1.5 flex items-center rounded-md border border-subtle-divider bg-subtle-field px-3 py-2 font-mono text-xs font-medium text-ink">
                  {existingSlug}
                </div>
              ) : (
                <div className="mt-1.5 space-y-1">
                  <input
                    id="publish-canonical-slug"
                    type="text"
                    value={
                      userCustomSlug !== null ? userCustomSlug : candidateSlug
                    }
                    onChange={(e) => setUserCustomSlug(e.target.value)}
                    placeholder="e.g. evidence-based-thyroid-management"
                    className="w-full rounded-md border border-control-border bg-paper px-3 py-2 font-mono text-xs text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  />
                  {!isSlugValid && (
                    <p className="text-[0.6875rem] text-destructive">
                      Slug must be lowercase alphanumeric with hyphens, at most
                      80 chars, and not a draft UUID.
                    </p>
                  )}
                </div>
              )}

              {/* Resulting URL preview */}
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-ink-muted">
                <Globe className="size-3.5 text-oxide" />
                <span className="text-ink-muted">Public URL:</span>
                <span className="font-mono text-oxide-link">
                  /blog/{candidateSlug || "..."}
                </span>
              </div>
            </div>
          </div>

          {/* Publication Summary Grid */}
          <div className="mt-4 space-y-2.5 text-xs">
            <h4 className="font-semibold tracking-wider text-ink uppercase">
              Publication Summary
            </h4>

            <div className="space-y-2 rounded-lg border border-subtle-divider bg-paper p-4 text-ink">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-oxide" />
                <div>
                  <span className="font-medium text-ink-muted">Title:</span>{" "}
                  <strong className="font-semibold text-ink">{title}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="size-4 shrink-0 text-oxide" />
                <div>
                  <span className="font-medium text-ink-muted">Category:</span>{" "}
                  <span>{selectedCategory}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 shrink-0 text-oxide" />
                <div>
                  <span className="font-medium text-ink-muted">
                    Featured Image:
                  </span>{" "}
                  <span>
                    {featuredImagePath ? (
                      <span className="font-medium text-success">
                        Attached (Promotes to public storage)
                      </span>
                    ) : (
                      <span className="text-ink-muted">None attached</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="size-4 shrink-0 text-oxide" />
                <div>
                  <span className="font-medium text-ink-muted">
                    References:
                  </span>{" "}
                  <span>{referencesCount} structured citations in ledger</span>
                </div>
              </div>

              {(seoTitle || seoDescription) && (
                <div className="border-t border-subtle-divider/60 pt-2 text-[0.6875rem] text-ink-muted">
                  <span className="font-medium text-ink">SEO:</span>{" "}
                  {seoTitle ? `Title: "${seoTitle}" • ` : ""}
                  {seoDescription ? `Description: "${seoDescription}"` : ""}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-subtle-divider pt-4">
            <button
              type="button"
              onClick={() => handleOpenChangeInternal(false)}
              disabled={publishing}
              className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePublishClick}
              disabled={publishing || !isSlugValid}
              className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-md bg-oxide px-5 py-2 text-xs font-semibold text-paper shadow-xs transition-colors hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
            >
              {publishing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>
                    {isEverPublished
                      ? "Confirm & Republish"
                      : "Confirm & Publish"}
                  </span>
                </>
              )}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
