"use client";

import * as React from "react";
import {
  AlertTriangle,
  Archive,
  EyeOff,
  RotateCcw,
  Trash2,
  Loader2,
  X,
  Lock,
} from "lucide-react";
import { Dialog } from "@base-ui/react";

/* -------------------------------------------------------------------------- */
/* Unpublish Confirmation Modal                                               */
/* -------------------------------------------------------------------------- */

export interface UnpublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  slug: string;
  onConfirm: () => Promise<void>;
  loading: boolean;
  errorMessage?: string | null;
}

export function UnpublishModal({
  open,
  onOpenChange,
  title,
  slug,
  onConfirm,
  loading,
  errorMessage,
}: UnpublishModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#242321]/50 backdrop-blur-xs transition-opacity duration-200" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-subtle-divider bg-[#FAF8F5] p-6 shadow-xl focus:outline-none sm:p-7">
          <div className="flex items-start justify-between border-b border-subtle-divider pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-warning/10 text-warning">
                <EyeOff className="size-4" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">
                  Unpublish Article
                </h3>
                <p className="text-xs text-ink-muted">
                  Return live article to draft workspace
                </p>
              </div>
            </div>
            <Dialog.Close
              disabled={loading}
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-subtle-field hover:text-ink disabled:opacity-50"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="mt-4 space-y-3 text-xs leading-relaxed text-ink-muted">
            <p>
              Are you sure you want to unpublish{" "}
              <strong className="font-semibold text-ink">
                &ldquo;{title}&rdquo;
              </strong>
              ?
            </p>
            <ul className="list-disc space-y-1 pl-4 text-ink">
              <li>
                The article will immediately stop appearing on the public site.
              </li>
              <li>
                Its status will change to <strong>Draft</strong>.
              </li>
              <li>
                Its canonical slug (
                <span className="font-mono text-oxide-link">/blog/{slug}</span>)
                and original publication date remain permanently preserved.
              </li>
              <li>Featured images will be demoted to private draft storage.</li>
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-subtle-divider pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink hover:bg-subtle-field disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-md bg-warning px-4 py-2 text-xs font-semibold text-paper shadow-xs hover:bg-warning/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Unpublishing...</span>
                </>
              ) : (
                <>
                  <EyeOff className="size-3.5" />
                  <span>Confirm Unpublish</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/* Archive Confirmation Modal                                                 */
/* -------------------------------------------------------------------------- */

export interface ArchiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  isPublished: boolean;
  onConfirm: () => Promise<void>;
  loading: boolean;
  errorMessage?: string | null;
}

export function ArchiveModal({
  open,
  onOpenChange,
  title,
  isPublished,
  onConfirm,
  loading,
  errorMessage,
}: ArchiveModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#242321]/50 backdrop-blur-xs transition-opacity duration-200" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-subtle-divider bg-[#FAF8F5] p-6 shadow-xl focus:outline-none sm:p-7">
          <div className="flex items-start justify-between border-b border-subtle-divider pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-ink-muted/10 text-ink-muted">
                <Archive className="size-4" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">
                  Archive Article
                </h3>
                <p className="text-xs text-ink-muted">
                  Retire article from active status
                </p>
              </div>
            </div>
            <Dialog.Close
              disabled={loading}
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-subtle-field hover:text-ink disabled:opacity-50"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="mt-4 space-y-3 text-xs leading-relaxed text-ink-muted">
            <p>
              Are you sure you want to archive{" "}
              <strong className="font-semibold text-ink">
                &ldquo;{title}&rdquo;
              </strong>
              ?
            </p>
            <ul className="list-disc space-y-1 pl-4 text-ink">
              {isPublished ? (
                <li>
                  The article will immediately disappear from the public
                  website.
                </li>
              ) : (
                <li>The draft will be moved to the archived workspace.</li>
              )}
              <li>
                Its canonical slug and history remain preserved and it can be
                restored to drafts at any time.
              </li>
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-subtle-divider pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink hover:bg-subtle-field disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-md bg-ink-muted px-4 py-2 text-xs font-semibold text-paper shadow-xs hover:bg-ink-muted/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Archiving...</span>
                </>
              ) : (
                <>
                  <Archive className="size-3.5" />
                  <span>Confirm Archive</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/* Restore Confirmation Modal                                                 */
/* -------------------------------------------------------------------------- */

export interface RestoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onConfirm: () => Promise<void>;
  loading: boolean;
  errorMessage?: string | null;
}

export function RestoreModal({
  open,
  onOpenChange,
  title,
  onConfirm,
  loading,
  errorMessage,
}: RestoreModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#242321]/50 backdrop-blur-xs transition-opacity duration-200" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-subtle-divider bg-[#FAF8F5] p-6 shadow-xl focus:outline-none sm:p-7">
          <div className="flex items-start justify-between border-b border-subtle-divider pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-oxide/10 text-oxide">
                <RotateCcw className="size-4" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">
                  Restore to Drafts
                </h3>
                <p className="text-xs text-ink-muted">
                  Re-activate archived article for editing
                </p>
              </div>
            </div>
            <Dialog.Close
              disabled={loading}
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-subtle-field hover:text-ink disabled:opacity-50"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="mt-4 space-y-3 text-xs leading-relaxed text-ink-muted">
            <p>
              Restore{" "}
              <strong className="font-semibold text-ink">
                &ldquo;{title}&rdquo;
              </strong>{" "}
              to your active draft workspace?
            </p>
            <p className="text-ink">
              The article will return to <strong>Draft</strong> status. It will
              not be published automatically.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-subtle-divider pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink hover:bg-subtle-field disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-md bg-oxide px-4 py-2 text-xs font-semibold text-paper shadow-xs hover:bg-oxide-link disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="size-3.5" />
                  <span>Confirm Restore</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/* Permanent Delete Confirmation Modal                                        */
/* -------------------------------------------------------------------------- */

export interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  isEverPublished: boolean;
  onConfirm: () => Promise<void>;
  loading: boolean;
  errorMessage?: string | null;
}

export function DeleteModal({
  open,
  onOpenChange,
  title,
  isEverPublished,
  onConfirm,
  loading,
  errorMessage,
}: DeleteModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#242321]/50 backdrop-blur-xs transition-opacity duration-200" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-destructive/40 bg-[#FAF8F5] p-6 shadow-xl focus:outline-none sm:p-7">
          <div className="flex items-start justify-between border-b border-subtle-divider pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-4" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">
                  {isEverPublished
                    ? "Deletion Blocked"
                    : "Permanently Delete Article"}
                </h3>
                <p className="text-xs text-ink-muted">
                  {isEverPublished
                    ? "Ever-published articles cannot be deleted"
                    : "Destructive and irreversible action"}
                </p>
              </div>
            </div>
            <Dialog.Close
              disabled={loading}
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-subtle-field hover:text-ink disabled:opacity-50"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
              {errorMessage}
            </div>
          )}

          {isEverPublished ? (
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-ink-muted">
              <div className="flex items-start gap-2.5 rounded-lg border border-subtle-divider bg-subtle-field p-3.5 text-ink">
                <Lock className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <p>
                  This article was previously published. Under repository
                  governance (D030), ever-published articles cannot be
                  permanently deleted to preserve canonical URL ownership and
                  prevent dead links.
                </p>
              </div>
              <p>
                To remove this article from public view, please use the{" "}
                <strong>Archive</strong> action instead.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-ink-muted">
              <p>
                Are you sure you want to permanently delete{" "}
                <strong className="font-semibold text-ink">
                  &ldquo;{title}&rdquo;
                </strong>
                ?
              </p>
              <ul className="list-disc space-y-1 pl-4 font-medium text-destructive">
                <li>
                  This draft and its references will be permanently destroyed.
                </li>
                <li>All uploaded draft storage objects will be deleted.</li>
                <li>This action cannot be undone.</li>
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-subtle-divider pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-md border border-subtle-divider bg-paper px-4 py-2 text-xs font-semibold text-ink hover:bg-subtle-field disabled:opacity-50"
            >
              {isEverPublished ? "Close" : "Cancel"}
            </button>
            {!isEverPublished && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-xs font-semibold text-paper shadow-xs hover:bg-destructive/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Delete Forever</span>
                  </>
                )}
              </button>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
