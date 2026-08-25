"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Layers,
  Globe,
  Eye,
  EyeOff,
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  Lock,
} from "lucide-react";
import {
  type AdminArticleDetail,
  type AdminCategoryOption,
  type AdminArticleReference,
  type ArticleStatus,
} from "@/lib/admin/articles";
import {
  saveDraftAction,
  publishArticleAction,
  updatePublishedArticleAction,
  unpublishArticleAction,
  archiveArticleAction,
  restoreArticleAction,
  deleteArticleAction,
  type SaveDraftReferenceInput,
} from "@/app/admin/articles/actions";
import { TiptapEditor } from "./tiptap-editor";
import { FeaturedImageField } from "./featured-image-field";
import { ReferenceLedger } from "./reference-ledger";
import { ArticlePreviewModal } from "./article-preview-modal";
import { PublishModal } from "./publish-modal";
import {
  UnpublishModal,
  ArchiveModal,
  RestoreModal,
  DeleteModal,
} from "./lifecycle-modals";
import { formatAdminDate, cn } from "@/lib/utils";
import type { PublicCategory } from "@/lib/public-articles";

interface ArticleEditorProps {
  article: AdminArticleDetail | null;
  initialCategories: AdminCategoryOption[];
  initialReferences?: AdminArticleReference[];
}

export function ArticleEditor({
  article,
  initialCategories,
  initialReferences = [],
}: ArticleEditorProps) {
  const router = useRouter();

  // Identity and Lifecycle Status Tracking
  const [persistedArticleId, setPersistedArticleId] = React.useState<
    string | null
  >(article?.id ?? null);
  const persistedArticleIdRef = React.useRef<string | null>(
    article?.id ?? null,
  );
  const isNew = !persistedArticleId;

  const [status, setStatus] = React.useState<ArticleStatus>(
    article?.status || "draft",
  );
  const [publishedAt, setPublishedAt] = React.useState<string | null>(
    article?.published_at || null,
  );
  const [slug, setSlug] = React.useState(article?.slug || "");
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(
    article?.updated_at || null,
  );

  const isEverPublished = Boolean(publishedAt);
  const isPublished = status === "published";
  const isArchived = status === "archived";
  const isDraft = status === "draft";

  // Form Fields
  const [title, setTitle] = React.useState(article?.title || "");
  const [excerpt, setExcerpt] = React.useState(article?.excerpt || "");
  const [contentJson, setContentJson] = React.useState<Record<string, unknown>>(
    article?.content_json || { type: "doc", content: [] },
  );
  const [categoryId, setCategoryId] = React.useState<string>(
    article?.category_id || "",
  );
  const [featuredImagePath, setFeaturedImagePath] = React.useState<
    string | null
  >(article?.featured_image_path || null);
  const [featuredImageAlt, setFeaturedImageAlt] = React.useState<string>(
    article?.featured_image_alt || "",
  );
  const [seoTitle, setSeoTitle] = React.useState(article?.seo_title || "");
  const [seoDescription, setSeoDescription] = React.useState(
    article?.seo_description || "",
  );
  const [references, setReferences] = React.useState<SaveDraftReferenceInput[]>(
    initialReferences.map((r) => ({
      title: r.title,
      source_name: r.source_name,
      url: r.url || "",
      citation_details: r.citation_details || "",
    })),
  );

  // Dirty tracking
  const changeRevisionRef = React.useRef(0);
  const [isDirty, setIsDirty] = React.useState(false);

  // Action / Loading States
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [updatingPublished, setUpdatingPublished] = React.useState(false);
  const [lifecycleLoading, setLifecycleLoading] = React.useState(false);

  // Messages & Modals
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [publishModalOpen, setPublishModalOpen] = React.useState(false);
  const [unpublishModalOpen, setUnpublishModalOpen] = React.useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = React.useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const markDirty = () => {
    changeRevisionRef.current += 1;
    setIsDirty(true);
    setErrorMessage(null);
    setToastMessage(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 5000);
  };

  // Find category object for preview
  const selectedCategoryObj = React.useMemo<PublicCategory | null>(() => {
    if (!categoryId) return null;
    const cat = initialCategories.find((c) => c.id === categoryId);
    return cat
      ? { id: cat.id, name: cat.name, slug: cat.slug, description: null }
      : null;
  }, [categoryId, initialCategories]);

  /* ------------------------------------------------------------------------ */
  /* Save Draft Handler                                                       */
  /* ------------------------------------------------------------------------ */
  const handleSaveDraft = async () => {
    if (saving || publishing || updatingPublished || lifecycleLoading) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Please enter an article title.");
      return;
    }

    if (
      featuredImagePath &&
      (!featuredImageAlt || featuredImageAlt.trim().length === 0)
    ) {
      setErrorMessage("Featured image alt text is required.");
      return;
    }

    const currentArticleId = persistedArticleIdRef.current;
    const savingRevision = changeRevisionRef.current;
    setSaving(true);
    setErrorMessage(null);

    try {
      const result = await saveDraftAction({
        articleId: currentArticleId,
        title: trimmedTitle,
        excerpt: excerpt.trim() || null,
        content_json: contentJson,
        category_id: categoryId || null,
        featured_image_path: featuredImagePath,
        featured_image_alt: featuredImageAlt.trim() || null,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        references: references,
      });

      if (!result) {
        router.push("/admin/login");
        return;
      }

      if (!result.success) {
        setErrorMessage(result.error || "Failed to save draft.");
        return;
      }

      if (result.articleId) {
        persistedArticleIdRef.current = result.articleId;
        setPersistedArticleId(result.articleId);
      }
      if (result.slug) {
        setSlug(result.slug);
      }

      if (changeRevisionRef.current === savingRevision) {
        setIsDirty(false);
      }
      setLastSavedAt(result.updatedAt || new Date().toISOString());
      showToast("Draft saved successfully.");

      if (!currentArticleId && result.articleId) {
        router.replace(`/admin/articles/${result.articleId}`);
      }
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        ((err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT") ||
          err.message === "NEXT_REDIRECT")
      ) {
        router.push("/admin/login");
        return;
      }
      const msg = err instanceof Error ? err.message : "Failed to save draft.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Publish / Republish Handler                                              */
  /* ------------------------------------------------------------------------ */
  const handlePublishConfirm = async (customCandidateSlug?: string) => {
    const currentArticleId = persistedArticleIdRef.current;
    if (!currentArticleId) {
      setErrorMessage("Please save the draft first before publishing.");
      setPublishModalOpen(false);
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Article title cannot be blank.");
      setPublishModalOpen(false);
      return;
    }

    const docContent = contentJson?.content;
    if (!Array.isArray(docContent) || docContent.length === 0) {
      setErrorMessage(
        "Cannot publish an article with empty body content. Please write your article content first.",
      );
      setPublishModalOpen(false);
      return;
    }

    if (
      featuredImagePath &&
      (!featuredImageAlt || featuredImageAlt.trim().length === 0)
    ) {
      setErrorMessage("Featured image alt text is required.");
      setPublishModalOpen(false);
      return;
    }

    setPublishing(true);
    setErrorMessage(null);

    try {
      const result = await publishArticleAction({
        articleId: currentArticleId,
        slug: customCandidateSlug || null,
        title: trimmedTitle,
        excerpt: excerpt.trim() || null,
        content_json: contentJson,
        category_id: categoryId || null,
        featured_image_path: featuredImagePath,
        featured_image_alt: featuredImageAlt.trim() || null,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        references: references,
      });

      if (!result) {
        router.push("/admin/login");
        return;
      }

      if (!result.success) {
        setErrorMessage(result.error || "Failed to publish article.");
        return;
      }

      // Success
      setStatus("published");
      if (result.slug) setSlug(result.slug);
      if (result.publishedAt) setPublishedAt(result.publishedAt);
      if (result.updatedAt) setLastSavedAt(result.updatedAt);
      setIsDirty(false);
      setPublishModalOpen(false);
      showToast("Article published successfully! It is now live.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to publish article.";
      setErrorMessage(msg);
    } finally {
      setPublishing(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Update Published Article Handler                                         */
  /* ------------------------------------------------------------------------ */
  const handleUpdatePublished = async () => {
    const currentArticleId = persistedArticleIdRef.current;
    if (!currentArticleId) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Article title cannot be blank.");
      return;
    }

    const docContent = contentJson?.content;
    if (!Array.isArray(docContent) || docContent.length === 0) {
      setErrorMessage("Cannot update article with empty body content.");
      return;
    }

    if (
      featuredImagePath &&
      (!featuredImageAlt || featuredImageAlt.trim().length === 0)
    ) {
      setErrorMessage("Featured image alt text is required.");
      return;
    }

    const savingRevision = changeRevisionRef.current;
    setUpdatingPublished(true);
    setErrorMessage(null);

    try {
      const result = await updatePublishedArticleAction({
        articleId: currentArticleId,
        title: trimmedTitle,
        excerpt: excerpt.trim() || null,
        content_json: contentJson,
        category_id: categoryId || null,
        featured_image_path: featuredImagePath,
        featured_image_alt: featuredImageAlt.trim() || null,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        references: references,
      });

      if (!result) {
        router.push("/admin/login");
        return;
      }

      if (!result.success) {
        setErrorMessage(result.error || "Failed to update published article.");
        return;
      }

      if (changeRevisionRef.current === savingRevision) {
        setIsDirty(false);
      }
      setLastSavedAt(result.updatedAt || new Date().toISOString());
      showToast("Published article updated successfully.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update article.";
      setErrorMessage(msg);
    } finally {
      setUpdatingPublished(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Unpublish Handler                                                        */
  /* ------------------------------------------------------------------------ */
  const handleUnpublishConfirm = async () => {
    const currentArticleId = persistedArticleIdRef.current;
    if (!currentArticleId) return;

    setLifecycleLoading(true);
    setErrorMessage(null);

    try {
      const result = await unpublishArticleAction(currentArticleId);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to unpublish article.");
        return;
      }

      setStatus("draft");
      if (result.updatedAt) setLastSavedAt(result.updatedAt);
      setUnpublishModalOpen(false);
      showToast("Article unpublished. It has returned to draft status.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to unpublish article.";
      setErrorMessage(msg);
    } finally {
      setLifecycleLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Archive Handler                                                          */
  /* ------------------------------------------------------------------------ */
  const handleArchiveConfirm = async () => {
    const currentArticleId = persistedArticleIdRef.current;
    if (!currentArticleId) return;

    setLifecycleLoading(true);
    setErrorMessage(null);

    try {
      const result = await archiveArticleAction(currentArticleId);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to archive article.");
        return;
      }

      setStatus("archived");
      if (result.updatedAt) setLastSavedAt(result.updatedAt);
      setArchiveModalOpen(false);
      showToast("Article moved to archived status.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to archive article.";
      setErrorMessage(msg);
    } finally {
      setLifecycleLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Restore Handler                                                          */
  /* ------------------------------------------------------------------------ */
  const handleRestoreConfirm = async () => {
    const currentArticleId = persistedArticleIdRef.current;
    if (!currentArticleId) return;

    setLifecycleLoading(true);
    setErrorMessage(null);

    try {
      const result = await restoreArticleAction(currentArticleId);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to restore article.");
        return;
      }

      setStatus("draft");
      if (result.updatedAt) setLastSavedAt(result.updatedAt);
      setRestoreModalOpen(false);
      showToast("Article restored to draft status.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to restore article.";
      setErrorMessage(msg);
    } finally {
      setLifecycleLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Permanent Delete Handler                                                 */
  /* ------------------------------------------------------------------------ */
  const handleDeleteConfirm = async () => {
    const currentArticleId = persistedArticleIdRef.current;
    if (!currentArticleId) return;

    setLifecycleLoading(true);
    setErrorMessage(null);

    try {
      const result = await deleteArticleAction(currentArticleId);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to delete article.");
        return;
      }

      setDeleteModalOpen(false);
      router.push("/admin/articles");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete article.";
      setErrorMessage(msg);
    } finally {
      setLifecycleLoading(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isPublished) {
          handleUpdatePublished();
        } else if (isDraft) {
          handleSaveDraft();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const formatSavedTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "recently";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle-divider pb-4">
        {/* Left Side: Navigation & Lifecycle Identification */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="flex min-h-[44px] items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          >
            <ArrowLeft className="size-3.5" />
            Articles
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex size-2 rounded-full",
                  isPublished
                    ? "bg-success"
                    : isArchived
                      ? "bg-ink-muted"
                      : "bg-warning",
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold tracking-wider uppercase",
                  isPublished
                    ? "text-success"
                    : isArchived
                      ? "text-ink-muted"
                      : "text-warning",
                )}
              >
                {isPublished
                  ? "Published Article"
                  : isArchived
                    ? "Archived Article"
                    : isNew
                      ? "New Draft"
                      : "Draft Article"}
              </span>
            </div>

            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
              {isPublished ? (
                <Link
                  href={`/blog/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-oxide-link hover:underline"
                >
                  <span>/blog/{slug}</span>
                  <ExternalLink className="size-3" />
                </Link>
              ) : (
                <span className="font-mono text-xs">
                  {slug
                    ? `/blog/${slug}`
                    : `Provisional: draft-${persistedArticleId || "new"}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Status Indicators & Lifecycle Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* In-Flight / Save Status indicator */}
          <div className="mr-1 flex items-center gap-2 text-xs">
            {saving || publishing || updatingPublished || lifecycleLoading ? (
              <span className="flex items-center gap-1.5 font-medium text-focus-slate">
                <Loader2 className="size-3.5 animate-spin" />
                {saving
                  ? "Saving draft..."
                  : publishing
                    ? "Publishing..."
                    : updatingPublished
                      ? "Updating live article..."
                      : "Updating..."}
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-1.5 font-medium text-warning">
                <span className="inline-block size-1.5 rounded-full bg-warning" />
                Unsaved changes
              </span>
            ) : lastSavedAt ? (
              <span
                suppressHydrationWarning
                className="flex items-center gap-1.5 text-success"
              >
                <CheckCircle2 className="size-3.5" />
                Saved at {formatSavedTime(lastSavedAt)}
              </span>
            ) : (
              <span className="text-ink-muted">Clean state</span>
            )}
          </div>

          {/* DRAFT STATE ACTIONS */}
          {isDraft && (
            <>
              {!isNew && (
                <>
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={saving || publishing || lifecycleLoading}
                    title={
                      isEverPublished
                        ? "Ever-published articles cannot be deleted. Use Archive."
                        : "Permanently delete draft"
                    }
                    className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setArchiveModalOpen(true)}
                    disabled={saving || publishing || lifecycleLoading}
                    className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
                  >
                    <Archive className="size-3.5" />
                    <span className="hidden sm:inline">Archive</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              >
                <Eye className="size-3.5 text-oxide" />
                Preview
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || publishing || lifecycleLoading}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-control-border bg-paper px-4 py-2 text-xs font-semibold text-ink shadow-2xs transition-colors hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isNew) {
                    setErrorMessage(
                      "Please click 'Save Draft' once before publishing to initialize your article ID.",
                    );
                    return;
                  }
                  setPublishModalOpen(true);
                }}
                disabled={saving || publishing || lifecycleLoading}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-md bg-oxide px-4 py-2 text-xs font-semibold text-paper shadow-xs transition-colors hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
              >
                {publishing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                {isEverPublished ? "Republish" : "Publish"}
              </button>
            </>
          )}

          {/* PUBLISHED STATE ACTIONS */}
          {isPublished && (
            <>
              <button
                type="button"
                onClick={() => setArchiveModalOpen(true)}
                disabled={updatingPublished || lifecycleLoading}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-subtle-field hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
              >
                <Archive className="size-3.5" />
                <span className="hidden sm:inline">Archive</span>
              </button>

              <button
                type="button"
                onClick={() => setUnpublishModalOpen(true)}
                disabled={updatingPublished || lifecycleLoading}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3 py-2 text-xs font-semibold text-warning transition-colors hover:bg-warning/10 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
              >
                <EyeOff className="size-3.5" />
                Unpublish
              </button>

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              >
                <Eye className="size-3.5 text-oxide" />
                Preview
              </button>

              <button
                type="button"
                onClick={handleUpdatePublished}
                disabled={updatingPublished || lifecycleLoading}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-md bg-oxide px-4 py-2 text-xs font-semibold text-paper shadow-xs transition-colors hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
              >
                {updatingPublished ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Update Published Article
              </button>
            </>
          )}

          {/* ARCHIVED STATE ACTIONS */}
          {isArchived && (
            <>
              {!isEverPublished && (
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={lifecycleLoading}
                  className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-subtle-field"
              >
                <Eye className="size-3.5 text-oxide" />
                Preview
              </button>

              <button
                type="button"
                onClick={() => setRestoreModalOpen(true)}
                disabled={lifecycleLoading}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-md bg-oxide px-4 py-2 text-xs font-semibold text-paper shadow-xs hover:bg-oxide-link disabled:opacity-50"
              >
                {lifecycleLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="size-3.5" />
                )}
                Restore to Drafts
              </button>
            </>
          )}
        </div>
      </div>

      {/* Controlled Toast Banner */}
      {toastMessage && (
        <div className="flex animate-in items-center gap-2.5 rounded-lg border border-success/30 bg-success/10 p-3.5 text-xs text-success duration-200 fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <p className="font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Controlled Error Banner */}
      {errorMessage && (
        <div className="flex animate-in items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive duration-200 fade-in">
          <AlertCircle className="size-5 shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Published Notice Header */}
      {isPublished && (
        <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/5 p-3.5 text-xs text-ink">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-success" />
            <span>
              <strong>Editing Live Article:</strong> Changes made here will
              update the live public website once you click{" "}
              <strong>&ldquo;Update Published Article&rdquo;</strong>.
            </span>
          </div>
          <Link
            href={`/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold text-oxide-link hover:underline"
          >
            <span>View Live Post</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      )}

      {/* Archived Notice Header */}
      {isArchived && (
        <div className="flex items-center justify-between rounded-lg border border-subtle-divider bg-subtle-field p-3.5 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <Archive className="size-4 text-ink-muted" />
            <span>
              <strong>Archived State:</strong> This article is retired and
              hidden from the public website. To make further changes or
              republish, click <strong>&ldquo;Restore to Drafts&rdquo;</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left / Primary Editorial Column (2 cols on large screens) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Document Title Input */}
          <div className="rounded-lg border border-subtle-divider bg-paper p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between">
              <label
                htmlFor="article-title"
                className="block text-xs font-semibold tracking-wider text-ink uppercase"
              >
                Article Title <span className="text-oxide">*</span>
              </label>
              <span className="text-xs text-ink-muted">
                {title.length} characters
              </span>
            </div>
            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
              placeholder="e.g. Clinical Evidence in Pediatric Respiratory Care"
              required
              className="mt-2 w-full rounded-md border border-control-border bg-paper px-4 py-3 font-serif text-xl font-medium text-ink placeholder-ink-muted/40 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none sm:text-2xl"
            />
          </div>

          {/* Tiptap Rich Text Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold tracking-wider text-ink uppercase">
                Article Body
              </span>
              <span className="text-xs text-ink-muted">
                Evidence Folio Tiptap Canvas
              </span>
            </div>
            <TiptapEditor
              initialContent={contentJson}
              onChange={(json) => {
                setContentJson(json);
                markDirty();
              }}
            />
          </div>

          {/* Structured Reference Ledger */}
          <ReferenceLedger
            references={references}
            onChange={(refs) => {
              setReferences(refs);
              markDirty();
            }}
          />
        </div>

        {/* Right / Secondary Context Column (1 col on large screens) */}
        <div className="space-y-6">
          {/* Metadata Card: Status & Category */}
          <div className="space-y-4 rounded-lg border border-subtle-divider bg-paper p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-subtle-divider pb-3">
              <Layers className="size-4 text-oxide" />
              <h3 className="font-serif text-sm font-semibold text-ink">
                Editorial Classification
              </h3>
            </div>

            {/* Category Selector */}
            <div>
              <label
                htmlFor="article-category"
                className="block text-xs font-semibold text-ink"
              >
                Category
              </label>
              <select
                id="article-category"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  markDirty();
                }}
                className="mt-1.5 w-full rounded-md border border-control-border bg-paper px-3 py-2 text-sm text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              >
                <option value="">No category (Unassigned)</option>
                {initialCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="article-excerpt"
                  className="block text-xs font-semibold text-ink"
                >
                  Editorial Excerpt / Teaser
                </label>
                <span className="text-[0.6875rem] text-ink-muted">
                  {excerpt.length} chars
                </span>
              </div>
              <textarea
                id="article-excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  markDirty();
                }}
                placeholder="Concise summary for article cards and RSS feeds..."
                className="mt-1.5 w-full rounded-md border border-control-border bg-paper px-3 py-2 text-sm text-ink placeholder-ink-muted/40 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              />
            </div>

            {/* Dates & Publication Info */}
            {!isNew && (
              <div className="space-y-1.5 border-t border-subtle-divider/60 pt-3 text-xs text-ink-muted">
                {publishedAt ? (
                  <div className="flex items-center gap-1.5 text-success">
                    <Calendar className="size-3.5" />
                    <span>First Published: {formatAdminDate(publishedAt)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-warning">
                    <span className="inline-block size-1.5 rounded-full bg-warning" />
                    <span>Never Published (Draft)</span>
                  </div>
                )}
                {lastSavedAt && (
                  <div>
                    <span>Last updated: {formatAdminDate(lastSavedAt)}</span>
                  </div>
                )}
                {isEverPublished && (
                  <div className="flex items-center gap-1 font-mono text-[0.6875rem] text-ink-muted">
                    <Lock className="size-3" />
                    <span>Slug: /blog/{slug} (Locked)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Featured Image Management */}
          <FeaturedImageField
            articleId={persistedArticleId || article?.id || null}
            imagePath={featuredImagePath}
            imageAlt={featuredImageAlt}
            onImagePathChange={(path) => {
              setFeaturedImagePath(path);
              markDirty();
            }}
            onImageAltChange={(alt) => {
              setFeaturedImageAlt(alt);
              markDirty();
            }}
          />

          {/* Search Engine Optimization (SEO) */}
          <div className="space-y-4 rounded-lg border border-subtle-divider bg-paper p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-subtle-divider pb-3">
              <Globe className="size-4 text-oxide" />
              <h3 className="font-serif text-sm font-semibold text-ink">
                Search Optimization
              </h3>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="seo-title"
                  className="block text-xs font-semibold text-ink"
                >
                  SEO Title
                </label>
                <span className="text-[0.6875rem] text-ink-muted">
                  {seoTitle.length} chars
                </span>
              </div>
              <input
                id="seo-title"
                type="text"
                value={seoTitle}
                onChange={(e) => {
                  setSeoTitle(e.target.value);
                  markDirty();
                }}
                placeholder={
                  title || "Custom search title (defaults to article title)"
                }
                className="mt-1.5 w-full rounded-md border border-control-border bg-paper px-3 py-2 text-sm text-ink placeholder-ink-muted/40 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="seo-description"
                  className="block text-xs font-semibold text-ink"
                >
                  SEO Meta Description
                </label>
                <span className="text-[0.6875rem] text-ink-muted">
                  {seoDescription.length} chars
                </span>
              </div>
              <textarea
                id="seo-description"
                rows={3}
                value={seoDescription}
                onChange={(e) => {
                  setSeoDescription(e.target.value);
                  markDirty();
                }}
                placeholder={
                  excerpt ||
                  "Search snippet description (defaults to excerpt)..."
                }
                className="mt-1.5 w-full rounded-md border border-control-border bg-paper px-3 py-2 text-sm text-ink placeholder-ink-muted/40 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modals & Dialogs                                                   */}
      {/* ------------------------------------------------------------------ */}

      {/* Full-Fidelity Preview Modal */}
      <ArticlePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={title}
        excerpt={excerpt}
        contentJson={contentJson}
        category={selectedCategoryObj}
        featuredImagePath={featuredImagePath}
        featuredImageAlt={featuredImageAlt}
        references={references}
        status={status}
        publishedAt={publishedAt}
        updatedAt={lastSavedAt}
        slug={slug}
      />

      {/* Publish Confirmation Modal */}
      <PublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        title={title}
        excerpt={excerpt}
        categoryId={categoryId}
        categories={initialCategories}
        featuredImagePath={featuredImagePath}
        featuredImageAlt={featuredImageAlt}
        seoTitle={seoTitle}
        seoDescription={seoDescription}
        referencesCount={references.length}
        existingSlug={slug}
        isEverPublished={isEverPublished}
        onConfirmPublish={handlePublishConfirm}
        publishing={publishing}
        errorMessage={errorMessage}
      />

      {/* Unpublish Confirmation Modal */}
      <UnpublishModal
        open={unpublishModalOpen}
        onOpenChange={setUnpublishModalOpen}
        title={title}
        slug={slug}
        onConfirm={handleUnpublishConfirm}
        loading={lifecycleLoading}
        errorMessage={errorMessage}
      />

      {/* Archive Confirmation Modal */}
      <ArchiveModal
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        title={title}
        isPublished={isPublished}
        onConfirm={handleArchiveConfirm}
        loading={lifecycleLoading}
        errorMessage={errorMessage}
      />

      {/* Restore Confirmation Modal */}
      <RestoreModal
        open={restoreModalOpen}
        onOpenChange={setRestoreModalOpen}
        title={title}
        onConfirm={handleRestoreConfirm}
        loading={lifecycleLoading}
        errorMessage={errorMessage}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title={title}
        isEverPublished={isEverPublished}
        onConfirm={handleDeleteConfirm}
        loading={lifecycleLoading}
        errorMessage={errorMessage}
      />
    </div>
  );
}
