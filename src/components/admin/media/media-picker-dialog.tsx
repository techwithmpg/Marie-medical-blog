"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react";
import { Check, ImageIcon, Loader2, X } from "lucide-react";
import {
  copyMediaToArticleAction,
  loadMediaPickerAction,
} from "@/app/admin/media/actions";
import type { AdminMediaRecord } from "@/lib/admin/media";
import { cn } from "@/lib/utils";

interface MediaPickerDialogProps {
  articleId: string;
  disabled?: boolean;
  onSelected: (destinationPath: string) => void | Promise<void>;
}

export function MediaPickerDialog({ articleId, disabled, onSelected }: MediaPickerDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<AdminMediaRecord[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copying, setCopying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await loadMediaPickerAction();
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Media inventory is unavailable.");
      return;
    }
    setItems(result.items);
    setSelectedId(result.items.find((item) => item.isEligibleForReuse)?.id ?? null);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && items.length === 0 && !loading) void load();
  };

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const handleChoose = async () => {
    if (!selected?.isEligibleForReuse || copying) return;
    setCopying(true);
    setError(null);
    const result = await copyMediaToArticleAction({
      articleId,
      sourceBucket: selected.bucket,
      sourcePath: selected.path,
    });
    setCopying(false);
    if (!result.success || !result.destinationPath) {
      setError(result.error ?? "Unable to reuse this image.");
      return;
    }
    await onSelected(result.destinationPath);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        disabled={disabled}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-control-border bg-paper px-3 py-2 text-xs font-semibold text-ink hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ImageIcon className="size-4 text-oxide" aria-hidden="true" />
        Choose from Media
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[94vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-subtle-divider bg-reading-surface p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-subtle-divider pb-4">
            <div>
              <Dialog.Title className="font-serif text-xl font-semibold text-ink">Choose a featured image</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink-muted">
                A private article-owned copy will be created. Enter contextual alt text after selection.
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close Media picker" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-md text-ink-muted hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none">
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="min-h-48 flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-ink-muted" aria-live="polite">
                <Loader2 className="size-5 animate-spin" aria-hidden="true" /> Loading Media…
              </div>
            ) : items.length === 0 ? (
              <p className="rounded-md border border-dashed border-subtle-divider p-8 text-center text-sm text-ink-muted">No reusable images are available.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="listbox" aria-label="Media images">
                {items.map((item) => {
                  const chosen = selectedId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={chosen}
                      aria-disabled={!item.isEligibleForReuse}
                      onClick={() => item.isEligibleForReuse && setSelectedId(item.id)}
                      className={cn(
                        "relative overflow-hidden rounded-md border bg-paper text-left focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:ring-offset-2 focus-visible:outline-none",
                        chosen ? "border-oxide ring-1 ring-oxide" : "border-subtle-divider",
                        !item.isEligibleForReuse && "cursor-not-allowed opacity-55",
                      )}
                    >
                      <span className="relative block aspect-square bg-subtle-field">
                        {item.previewUrl ? (
                          <Image src={item.previewUrl} alt="" fill sizes="(max-width: 640px) 50vw, 220px" className="object-cover" unoptimized />
                        ) : (
                          <span className="flex h-full items-center justify-center"><ImageIcon className="size-7 text-ink-muted" aria-hidden="true" /></span>
                        )}
                        {chosen && <Check className="absolute top-2 right-2 size-6 rounded-full bg-oxide p-1 text-paper" aria-hidden="true" />}
                      </span>
                      <span className="block truncate p-2 text-xs font-medium text-ink">{item.name}</span>
                      {!item.isEligibleForReuse && <span className="block px-2 pb-2 text-[0.6875rem] text-destructive">{item.ineligibilityReason}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p role="alert" className="mb-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-end gap-3 border-t border-subtle-divider pt-4">
            <Dialog.Close className="min-h-11 cursor-pointer rounded-md border border-control-border px-4 text-sm font-semibold text-ink focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none">Cancel</Dialog.Close>
            <button type="button" onClick={handleChoose} disabled={!selected?.isEligibleForReuse || copying} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-paper focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
              {copying && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {copying ? "Creating private copy…" : "Use selected image"}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
