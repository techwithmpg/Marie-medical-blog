"use client";

import * as React from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Globe,
  ImageIcon,
  Loader2,
  Lock,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Dialog } from "@base-ui/react";
import { createClient } from "@/lib/supabase/client";
import {
  prepareMediaUploadAction,
  deleteMediaAction,
} from "@/app/admin/media/actions";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_MEDIA_FILE_SIZE,
} from "@/lib/admin/media-validation";
import type { AdminMediaRecord } from "@/lib/admin/media";
import { cn, formatAdminDate } from "@/lib/utils";

interface MediaManagerProps {
  initialMedia: AdminMediaRecord[];
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "Unknown";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function MediaManager({ initialMedia }: MediaManagerProps) {
  const [mediaList, setMediaList] = React.useState<AdminMediaRecord[]>(initialMedia);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialMedia.length > 0 ? initialMedia[0].id : null,
  );
  const [bucketFilter, setBucketFilter] = React.useState<"all" | "draft-assets" | "public-assets">("all");

  // Upload State
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = React.useState<AdminMediaRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Mobile detail drawer
  const [mobileDetailOpen, setMobileDetailOpen] = React.useState(false);

  // Copied path state
  const [copiedPath, setCopiedPath] = React.useState(false);

  const selectedAsset = mediaList.find((item) => item.id === selectedId) ?? null;

  const filteredMedia = React.useMemo(() => {
    if (bucketFilter === "all") return mediaList;
    return mediaList.filter((item) => item.bucket === bucketFilter);
  }, [mediaList, bucketFilter]);

  // Handle File Upload via Signed URL
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    // Client-side validation
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
      setUploadError("Only JPEG, PNG, WebP, and AVIF image formats are permitted.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_MEDIA_FILE_SIZE) {
      setUploadError("Image file size must not exceed 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);

    try {
      // 1. Prepare signed upload destination via Server Action
      const prepResult = await prepareMediaUploadAction({
        filename: file.name,
        mimeType: file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
        size: file.size,
      });

      if (!prepResult.success || !prepResult.path || !prepResult.token) {
        setUploadError(prepResult.error || "Failed to prepare upload destination.");
        return;
      }

      // 2. Upload directly to signed URL in draft-assets
      const supabase = createClient();
      const { error: uploadErr } = await supabase.storage
        .from("draft-assets")
        .uploadToSignedUrl(prepResult.path, prepResult.token, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) {
        setUploadError(`Upload failed: ${uploadErr.message}`);
        return;
      }

      // 3. Create preview signed URL for immediate local state representation
      let previewUrl: string | null = null;
      try {
        const { data: signedData } = await supabase.storage
          .from("draft-assets")
          .createSignedUrl(prepResult.path, 3600);
        previewUrl = signedData?.signedUrl || null;
      } catch {
        previewUrl = null;
      }

      const newRecord: AdminMediaRecord = {
        id: `draft-assets:${prepResult.path}`,
        bucket: "draft-assets",
        path: prepResult.path,
        name: prepResult.path.split("/").pop() || file.name,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrivate: true,
        isEligibleForReuse: true,
        ineligibilityReason: null,
        usage: { state: "unused", isUsed: false, canDelete: true },
        previewUrl,
      };

      setMediaList((prev) => [newRecord, ...prev]);
      setSelectedId(newRecord.id);
      setUploadSuccess(`Uploaded “${newRecord.name}” to private draft assets.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during upload.";
      setUploadError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleOpenDelete = (asset: AdminMediaRecord) => {
    if (!asset.usage.canDelete) return;
    setDeleteTarget(asset);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteMediaAction({
        bucket: deleteTarget.bucket,
        path: deleteTarget.path,
      });

      if (!result.success) {
        setDeleteError(result.message);
        return;
      }

      setMediaList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (selectedId === deleteTarget.id) {
        const remaining = mediaList.filter((item) => item.id !== deleteTarget.id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setMobileDetailOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion failed.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Evidence Folio Header / Introduction */}
      <div className="flex flex-col justify-between gap-4 border-b border-subtle-divider pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
            Media Management
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Private-by-default image library for editorial draft authoring and featured-image reuse.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileUpload}
            disabled={uploading}
            className="sr-only"
            id="media-upload-input"
          />
          <label
            htmlFor="media-upload-input"
            className={cn(
              "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md bg-oxide px-4 py-2 text-sm font-semibold text-paper shadow-xs transition-colors hover:bg-oxide-muted focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
              uploading && "cursor-not-allowed opacity-50",
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="size-4" />
                <span>Upload Image</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Upload Feedback */}
      {uploadError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-warning/30 bg-warning/10 p-4 text-sm font-medium text-warning"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/10 p-4 text-sm font-medium text-success"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-subtle-divider pb-3">
        <button
          type="button"
          onClick={() => setBucketFilter("all")}
          className={cn(
            "min-h-[36px] rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
            bucketFilter === "all"
              ? "bg-subtle-field text-ink shadow-2xs"
              : "text-ink-muted hover:text-ink",
          )}
        >
          All Images ({mediaList.length})
        </button>
        <button
          type="button"
          onClick={() => setBucketFilter("draft-assets")}
          className={cn(
            "flex min-h-[36px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
            bucketFilter === "draft-assets"
              ? "bg-subtle-field text-ink shadow-2xs"
              : "text-ink-muted hover:text-ink",
          )}
        >
          <Lock className="size-3 text-oxide" />
          Private Drafts ({mediaList.filter((i) => i.bucket === "draft-assets").length})
        </button>
        <button
          type="button"
          onClick={() => setBucketFilter("public-assets")}
          className={cn(
            "flex min-h-[36px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
            bucketFilter === "public-assets"
              ? "bg-subtle-field text-ink shadow-2xs"
              : "text-ink-muted hover:text-ink",
          )}
        >
          <Globe className="size-3 text-teal-accent" />
          Public Published ({mediaList.filter((i) => i.bucket === "public-assets").length})
        </button>
      </div>

      {/* Main Content Layout: Grid + Inspector Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Image Grid (8 cols on lg) */}
        <div className="lg:col-span-8">
          {filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-subtle-divider bg-reading-surface p-12 text-center">
              <ImageIcon className="size-12 text-ink-muted/50" />
              <h3 className="mt-3 font-serif text-lg font-medium text-ink">No media assets found</h3>
              <p className="mt-1 max-w-sm text-xs text-ink-muted">
                {bucketFilter === "all"
                  ? "Upload a private image to start building your editorial media library."
                  : `No assets currently stored in ${bucketFilter}.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filteredMedia.map((asset) => {
                const isSelected = selectedId === asset.id;
                return (
                  <div
                    key={asset.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select asset ${asset.name}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedId(asset.id);
                      setMobileDetailOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(asset.id);
                        setMobileDetailOpen(true);
                      }
                    }}
                    className={cn(
                      "group relative flex cursor-pointer flex-col overflow-hidden rounded-md border bg-paper transition-all focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                      isSelected
                        ? "border-oxide ring-1 ring-oxide shadow-xs"
                        : "border-subtle-divider hover:border-ink-muted/50 hover:shadow-2xs",
                    )}
                  >
                    {/* Thumbnail Canvas */}
                    <div className="relative aspect-square w-full bg-subtle-field">
                      {asset.previewUrl ? (
                        <Image
                          src={asset.previewUrl}
                          alt={asset.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-2 text-center text-ink-muted">
                          <ImageIcon className="size-6 text-ink-muted/60" />
                          <span className="mt-1 text-[0.625rem]">Preview unavailable</span>
                        </div>
                      )}

                      {/* Badges on Thumbnail */}
                      <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                        {asset.isPrivate ? (
                          <span
                            title="Private draft asset"
                            className="inline-flex items-center gap-0.5 rounded-xs bg-ink/80 px-1.5 py-0.5 text-[0.5625rem] font-semibold text-paper backdrop-blur-xs"
                          >
                            <Lock className="size-2.5" />
                            Private
                          </span>
                        ) : (
                          <span
                            title="Public asset"
                            className="inline-flex items-center gap-0.5 rounded-xs bg-teal-accent/90 px-1.5 py-0.5 text-[0.5625rem] font-semibold text-paper backdrop-blur-xs"
                          >
                            <Globe className="size-2.5" />
                            Public
                          </span>
                        )}

                        {asset.usage.isUsed && (
                          <span
                            title="Currently in use"
                            className="inline-flex items-center gap-0.5 rounded-xs bg-oxide px-1.5 py-0.5 text-[0.5625rem] font-semibold text-paper"
                          >
                            <FileText className="size-2.5" />
                            In Use
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-ink" title={asset.name}>
                        {asset.name}
                      </p>
                      <div className="mt-0.5 flex items-center justify-between text-[0.6875rem] text-ink-muted">
                        <span>{formatBytes(asset.size)}</span>
                        <span>{asset.mimeType?.split("/")[1]?.toUpperCase() || "IMG"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Inspector Panel (Desktop 4 cols on lg) */}
        <aside
          aria-label="Media asset details"
          className="hidden rounded-lg border border-subtle-divider bg-reading-surface p-5 shadow-xs lg:col-span-4 lg:block"
        >
          {selectedAsset ? (
            <div className="space-y-5">
              <h3 className="font-serif text-lg font-semibold text-ink">Asset Inspector</h3>

              {/* Large Preview */}
              <div className="relative aspect-video w-full overflow-hidden rounded-md border border-subtle-divider bg-subtle-field">
                {selectedAsset.previewUrl ? (
                  <Image
                    src={selectedAsset.previewUrl}
                    alt={selectedAsset.name}
                    fill
                    sizes="400px"
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-4 text-center text-ink-muted">
                    <ImageIcon className="size-8" />
                    <span className="mt-1 text-xs">Preview unavailable</span>
                  </div>
                )}
              </div>

              {/* Metadata Attributes */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="font-semibold text-ink-muted uppercase">Filename</span>
                  <p className="font-mono text-ink break-all">{selectedAsset.name}</p>
                </div>

                <div>
                  <span className="font-semibold text-ink-muted uppercase">Bucket & Path</span>
                  <div className="flex items-center justify-between gap-2 rounded-md bg-paper p-2 font-mono text-[0.6875rem] text-ink">
                    <span className="truncate">{selectedAsset.bucket}/{selectedAsset.path}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPath(selectedAsset.path)}
                      title="Copy path"
                      className="cursor-pointer text-ink-muted hover:text-ink focus-visible:outline-hidden"
                    >
                      {copiedPath ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-ink-muted uppercase">Format</span>
                    <p className="text-ink">{selectedAsset.mimeType || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-ink-muted uppercase">File Size</span>
                    <p className="text-ink">{formatBytes(selectedAsset.size)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-ink-muted uppercase">Visibility</span>
                    <p className="flex items-center gap-1 text-ink">
                      {selectedAsset.isPrivate ? (
                        <>
                          <Lock className="size-3 text-oxide" />
                          <span>Private Draft</span>
                        </>
                      ) : (
                        <>
                          <Globe className="size-3 text-teal-accent" />
                          <span>Public</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-ink-muted uppercase">Uploaded</span>
                    <p className="text-ink">
                      {selectedAsset.createdAt ? formatAdminDate(selectedAsset.createdAt) : "—"}
                    </p>
                  </div>
                </div>

                {/* Usage Status */}
                <div className="rounded-md border border-subtle-divider bg-paper p-3">
                  <span className="block font-semibold text-ink uppercase">Usage Status</span>
                  {!selectedAsset.usage.canDelete ? (
                    <p className="mt-1 font-medium text-oxide">
                      {selectedAsset.usage.locationDescription || "Referenced by publication"}
                    </p>
                  ) : (
                    <p className="mt-1 text-ink-muted">Unused — available for selection or removal</p>
                  )}
                </div>

                {/* Reuse Eligibility */}
                <div className="rounded-md border border-subtle-divider bg-paper p-3">
                  <span className="block font-semibold text-ink uppercase">Featured Image Reuse</span>
                  {selectedAsset.isEligibleForReuse ? (
                    <p className="mt-1 flex items-center gap-1 font-medium text-success">
                      <CheckCircle2 className="size-3.5" />
                      Eligible for article featured image
                    </p>
                  ) : (
                    <p className="mt-1 flex items-start gap-1 font-medium text-warning">
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                      <span>{selectedAsset.ineligibilityReason || "Ineligible for reuse"}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Guarded Actions */}
              <div className="pt-2">
                {!selectedAsset.usage.canDelete ? (
                  <div className="rounded-md bg-subtle-field p-3 text-xs text-ink-muted">
                    <p className="font-medium text-ink">Deletion Unavailable</p>
                    <p className="mt-0.5">
                      This asset is currently in use. Replace or remove its reference in the article before deleting.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(selectedAsset)}
                    className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive hover:text-paper focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  >
                    <Trash2 className="size-3.5" />
                    Delete Asset
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-ink-muted">
              <ImageIcon className="size-10" />
              <p className="mt-2 text-xs">Select an asset to view details and actions</p>
            </div>
          )}
        </aside>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-ending-style:opacity-0 data-starting-style:opacity-0 transition-opacity" />
          <Dialog.Popup
            aria-label="Confirm asset deletion"
            className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-subtle-divider bg-reading-surface p-6 shadow-lg data-ending-style:scale-95 data-starting-style:scale-95 transition-transform"
          >
            <Dialog.Title className="font-serif text-lg font-semibold text-ink">
              Delete Media Asset?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-xs text-ink-muted">
              Are you sure you want to permanently delete{" "}
              <strong className="font-mono text-ink">{deleteTarget?.name}</strong> from{" "}
              <strong className="text-ink">{deleteTarget?.bucket}</strong>? This action cannot be undone.
            </Dialog.Description>

            {deleteError && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs font-medium text-warning"
              >
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="min-h-[44px] cursor-pointer rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md bg-destructive px-4 py-2 text-xs font-semibold text-paper transition-colors hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Mobile Detail Modal / Sheet */}
      <Dialog.Root open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden" />
          <Dialog.Popup
            aria-label="Asset details"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-xl border-t border-subtle-divider bg-reading-surface p-6 shadow-xl lg:hidden"
          >
            {selectedAsset && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-subtle-divider pb-3">
                  <Dialog.Title className="font-serif text-lg font-semibold text-ink">
                    Asset Details
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={() => setMobileDetailOpen(false)}
                    className="cursor-pointer rounded-xs p-1 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                    aria-label="Close details"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden rounded-md border border-subtle-divider bg-subtle-field">
                  {selectedAsset.previewUrl ? (
                    <Image
                      src={selectedAsset.previewUrl}
                      alt={selectedAsset.name}
                      fill
                      sizes="100vw"
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center text-ink-muted">
                      <ImageIcon className="size-8" />
                      <span className="mt-1 text-xs">Preview unavailable</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-ink-muted uppercase">Filename</span>
                    <p className="font-mono text-ink break-all">{selectedAsset.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-ink-muted uppercase">Path</span>
                    <p className="font-mono text-ink break-all">{selectedAsset.bucket}/{selectedAsset.path}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-ink-muted uppercase">Format</span>
                      <p className="text-ink">{selectedAsset.mimeType || "Unknown"}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-ink-muted uppercase">Size</span>
                      <p className="text-ink">{formatBytes(selectedAsset.size)}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="pt-2">
                  {!selectedAsset.usage.canDelete ? (
                    <p className="rounded-md bg-subtle-field p-3 text-xs text-ink-muted">
                      Cannot delete: {selectedAsset.usage.locationDescription}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(selectedAsset)}
                      className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-xs font-semibold text-paper"
                    >
                      <Trash2 className="size-4" />
                      Delete Asset
                    </button>
                  )}
                </div>
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
