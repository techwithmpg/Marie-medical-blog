"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Layers,
  Globe,
} from "lucide-react";
import {
  type AdminArticleDetail,
  type AdminCategoryOption,
  type AdminArticleReference,
} from "@/lib/admin/articles";
import {
  saveDraftAction,
  type SaveDraftReferenceInput,
} from "@/app/admin/articles/actions";
import { TiptapEditor } from "./tiptap-editor";
import { FeaturedImageField } from "./featured-image-field";
import { ReferenceLedger } from "./reference-ledger";
import { formatAdminDate } from "@/lib/utils";

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
  // Identity tracking to prevent first-save duplicate draft race conditions
  const [persistedArticleId, setPersistedArticleId] = React.useState<
    string | null
  >(article?.id ?? null);
  const persistedArticleIdRef = React.useRef<string | null>(
    article?.id ?? null,
  );
  const isNew = !persistedArticleId;

  // Form Fields
  const [title, setTitle] = React.useState(article?.title || "");
  const [slug, setSlug] = React.useState(article?.slug || "");
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

  // Revision-aware dirty tracking to prevent in-flight save races
  const changeRevisionRef = React.useRef(0);
  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(
    article?.updated_at || null,
  );

  const markDirty = () => {
    changeRevisionRef.current += 1;
    setIsDirty(true);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    if (saving) return;

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
        // Server redirected (e.g. auth session invalidated)
        router.push("/admin/login");
        return;
      }

      if (!result.success) {
        setErrorMessage(result.error || "Failed to save draft.");
        return;
      }

      // Immediately capture persisted article ID in ref & state to prevent duplicate saves
      if (result.articleId) {
        persistedArticleIdRef.current = result.articleId;
        setPersistedArticleId(result.articleId);
      }
      if (result.slug) {
        setSlug(result.slug);
      }

      // Only clear dirty state if no newer local changes occurred during save request flight
      if (changeRevisionRef.current === savingRevision) {
        setIsDirty(false);
      }
      setLastSavedAt(result.updatedAt || new Date().toISOString());

      if (!currentArticleId && result.articleId) {
        // First save on /admin/articles/new -> replace URL to persistent edit route
        router.replace(`/admin/articles/${result.articleId}`);
      }
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        ((err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT") ||
          err.message === "NEXT_REDIRECT" ||
          err.message.includes("NEXT_REDIRECT") ||
          err.message.includes("unexpected response was received"))
      ) {
        // Server redirected or session expired -> redirect to login
        router.push("/admin/login");
        return;
      }
      const msg = err instanceof Error ? err.message : "Failed to save draft.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  // Warn before accidental page unload when dirty
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Handle Ctrl+S / Cmd+S keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) {
          handleSave();
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
              <span className="inline-flex size-2 rounded-full bg-warning" />
              <span className="text-xs font-semibold tracking-wider text-warning uppercase">
                {isNew ? "New Draft" : "Draft Article"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-muted">
              {isNew
                ? "Unsaved composition workspace"
                : `Provisional slug: ${slug || "draft-" + (persistedArticleId || article?.id)}`}
            </p>
          </div>
        </div>

        {/* Save Status & Action Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            {saving ? (
              <span className="flex items-center gap-1.5 font-medium text-focus-slate">
                <Loader2 className="size-3.5 animate-spin" />
                Saving draft...
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
              <span className="text-ink-muted">Clean draft</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md bg-oxide px-5 py-2.5 text-sm font-semibold text-paper shadow-xs transition-colors hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Draft
          </button>
        </div>
      </div>

      {/* Controlled Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <p className="font-medium">{errorMessage}</p>
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

            {/* Dates info */}
            {!isNew && article && (
              <div className="space-y-1 border-t border-subtle-divider/60 pt-3 text-xs text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-ink-muted" />
                  <span>Created: {formatAdminDate(article.created_at)}</span>
                </div>
                <div>
                  <span>
                    Last updated: {formatAdminDate(article.updated_at)}
                  </span>
                </div>
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
    </div>
  );
}
