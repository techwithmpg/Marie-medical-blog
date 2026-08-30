"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react";
import {
  AlertCircle,
  Check,
  ImageIcon,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { loadMediaPickerAction } from "@/app/admin/media/actions";
import {
  assignSiteMediaAction,
  clearSiteMediaAction,
  updateSiteMediaPresentationAction,
} from "@/app/admin/media/site-actions";

import type { AdminMediaRecord } from "@/lib/admin/media";
import type { AdminSiteMediaPlacement } from "@/lib/admin/site-media";
import type { SiteMediaSlot } from "@/lib/admin/site-media-validation";
import { cn } from "@/lib/utils";

interface Props {
  initialPlacements: AdminSiteMediaPlacement[];
}

const FOCAL_OPTIONS = [
  { key: "top-left", label: "Top left", x: 20, y: 20 },
  { key: "top", label: "Top", x: 50, y: 20 },
  { key: "top-right", label: "Top right", x: 80, y: 20 },
  { key: "left", label: "Left", x: 20, y: 50 },
  { key: "center", label: "Center", x: 50, y: 50 },
  { key: "right", label: "Right", x: 80, y: 50 },
  { key: "bottom-left", label: "Bottom left", x: 20, y: 80 },
  { key: "bottom", label: "Bottom", x: 50, y: 80 },
  { key: "bottom-right", label: "Bottom right", x: 80, y: 80 },
] as const;

function FocalGrid({
  label,
  x,
  y,
  onChange,
}: {
  label: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold text-ink">{label}</legend>

      <div className="grid w-40 grid-cols-3 gap-1">
        {FOCAL_OPTIONS.map((option) => {
          const selected = option.x === x && option.y === y;

          return (
            <button
              key={option.key}
              type="button"
              title={option.label}
              aria-label={`${label}: ${option.label}`}
              aria-pressed={selected}
              onClick={() => onChange(option.x, option.y)}
              className={cn(
                "aspect-square rounded-sm border text-[10px] transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none",
                selected
                  ? "border-oxide bg-oxide text-paper"
                  : "border-subtle-divider bg-paper text-ink-muted hover:border-ink-muted",
              )}
            >
              {selected ? <Check className="mx-auto size-3" /> : "•"}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SiteMediaPlacements({ initialPlacements }: Props) {
  const [placements, setPlacements] =
    React.useState<AdminSiteMediaPlacement[]>(initialPlacements);

  const [pickerOpen, setPickerOpen] = React.useState(false);

  const [editorOpen, setEditorOpen] = React.useState(false);

  const [activeSlot, setActiveSlot] = React.useState<SiteMediaSlot | null>(
    null,
  );

  const [candidate, setCandidate] = React.useState<AdminMediaRecord | null>(
    null,
  );

  const [media, setMedia] = React.useState<AdminMediaRecord[]>([]);

  const [loading, setLoading] = React.useState(false);

  const [saving, setSaving] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  const [altText, setAltText] = React.useState("");

  const [decorative, setDecorative] = React.useState(false);

  const [desktopX, setDesktopX] = React.useState(50);

  const [desktopY, setDesktopY] = React.useState(50);

  const [mobileX, setMobileX] = React.useState(50);

  const [mobileY, setMobileY] = React.useState(50);

  const activePlacement =
    placements.find((placement) => placement.slot === activeSlot) ?? null;

  async function openPicker(slot: SiteMediaSlot) {
    setActiveSlot(slot);
    setCandidate(null);
    setError(null);
    setLoading(true);
    setPickerOpen(true);

    const result = await loadMediaPickerAction();

    if (result.success) {
      setMedia(result.items);
    } else {
      setMedia([]);
      setError(result.error ?? "Unable to load Media.");
    }

    setLoading(false);
  }

  function chooseAsset(asset: AdminMediaRecord) {
    if (!activeSlot || !asset.isEligibleForReuse) {
      return;
    }

    const existing =
      placements.find((placement) => placement.slot === activeSlot) ?? null;

    setCandidate(asset);

    setAltText(existing?.altText ?? "");

    setDecorative(
      activeSlot === "author_portrait"
        ? false
        : (existing?.isDecorative ?? false),
    );

    setDesktopX(existing?.desktopFocalX ?? 50);

    setDesktopY(existing?.desktopFocalY ?? 50);

    setMobileX(existing?.mobileFocalX ?? 50);

    setMobileY(existing?.mobileFocalY ?? 50);

    setPickerOpen(false);
    setEditorOpen(true);
    setError(null);
  }

  function openPresentationEditor(placement: AdminSiteMediaPlacement) {
    setActiveSlot(placement.slot);
    setCandidate(null);

    setAltText(placement.altText ?? "");

    setDecorative(placement.isDecorative);

    setDesktopX(placement.desktopFocalX);

    setDesktopY(placement.desktopFocalY);

    setMobileX(placement.mobileFocalX);

    setMobileY(placement.mobileFocalY);

    setError(null);
    setEditorOpen(true);
  }

  function updatePlacement(placement: AdminSiteMediaPlacement) {
    setPlacements((current) =>
      current.map((item) => (item.slot === placement.slot ? placement : item)),
    );
  }

  async function savePlacement() {
    if (!activeSlot) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const presentation = {
        slot: activeSlot,

        altText: decorative ? null : altText,

        isDecorative: decorative,

        desktopFocalX: desktopX,

        desktopFocalY: desktopY,

        mobileFocalX: mobileX,

        mobileFocalY: mobileY,
      };

      const result = candidate
        ? await assignSiteMediaAction({
            ...presentation,
            sourceBucket: candidate.bucket,
            sourcePath: candidate.path,
          })
        : await updateSiteMediaPresentationAction(presentation);

      if (!result.success || !result.placement) {
        setError(result.error ?? "Unable to save the website image.");

        return;
      }

      updatePlacement(result.placement);

      setCandidate(null);
      setEditorOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function clearPlacement(placement: AdminSiteMediaPlacement) {
    if (!placement.storagePath) {
      return;
    }

    const confirmed = window.confirm(
      `Clear ${placement.label}? The original Media Library image will not be deleted.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    const result = await clearSiteMediaAction({
      slot: placement.slot,
    });

    if (!result.success) {
      setError(result.error ?? "Unable to clear the website image.");

      return;
    }

    setPlacements((current) =>
      current.map((item) =>
        item.slot === placement.slot
          ? {
              ...item,
              storagePath: null,
              previewUrl: null,
              altText: null,
              isDecorative: false,
              desktopFocalX: 50,
              desktopFocalY: 50,
              mobileFocalX: 50,
              mobileFocalY: 50,
            }
          : item,
      ),
    );
  }

  const editorPreview =
    candidate?.previewUrl ?? activePlacement?.previewUrl ?? null;

  return (
    <section className="bg-reading-surface space-y-5 rounded-lg border border-subtle-divider p-5 shadow-xs">
      <div className="border-b border-subtle-divider pb-4">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-oxide uppercase">
          Website placements
        </p>

        <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
          Public Image Editor
        </h2>

        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
          Choose an image for each fixed website position. Desktop and mobile
          focal points control how future responsive crops will be framed
          without changing the original image.
        </p>
      </div>

      {error && !editorOpen && !pickerOpen ? (
        <div
          role="alert"
          className="flex gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />

          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {placements.map((placement) => (
          <article
            key={placement.slot}
            className="overflow-hidden rounded-lg border border-subtle-divider bg-paper"
          >
            <div className="relative aspect-[16/9] bg-subtle-field">
              {placement.previewUrl ? (
                <Image
                  src={placement.previewUrl}
                  alt={placement.isDecorative ? "" : (placement.altText ?? "")}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                  style={{
                    objectPosition: `${placement.desktopFocalX}% ${placement.desktopFocalY}%`,
                  }}
                  unoptimized
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-ink-muted">
                  <ImageIcon className="size-8" />

                  <span className="mt-2 text-xs">No image assigned</span>
                </div>
              )}
            </div>

            <div className="space-y-3 p-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">
                  {placement.label}
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {placement.description}
                </p>

                <p className="mt-2 text-[11px] font-semibold text-ink-muted">
                  {placement.mobileRule}
                </p>
              </div>

              {placement.storagePath ? (
                <div className="rounded-md bg-subtle-field p-2 text-[11px] text-ink-muted">
                  <div>
                    Desktop focus: {placement.desktopFocalX}% /{" "}
                    {placement.desktopFocalY}%
                  </div>

                  <div>
                    Mobile focus: {placement.mobileFocalX}% /{" "}
                    {placement.mobileFocalY}%
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openPicker(placement.slot)}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-oxide px-3 py-2 text-xs font-semibold text-paper hover:opacity-90"
                >
                  <RefreshCw className="size-3.5" />

                  {placement.storagePath ? "Replace" : "Choose from Media"}
                </button>

                {placement.storagePath ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openPresentationEditor(placement)}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-subtle-divider bg-paper px-3 py-2 text-xs font-semibold text-ink hover:bg-subtle-field"
                    >
                      <Pencil className="size-3.5" />
                      Crop & Alt
                    </button>

                    <button
                      type="button"
                      onClick={() => clearPlacement(placement)}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive hover:text-paper"
                    >
                      <Trash2 className="size-3.5" />
                      Clear
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog.Root open={pickerOpen} onOpenChange={setPickerOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" />

          <Dialog.Popup className="bg-reading-surface fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[94vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-subtle-divider shadow-lg">
            <div className="border-b border-subtle-divider p-5">
              <Dialog.Title className="font-serif text-xl font-semibold text-ink">
                Choose from Media
              </Dialog.Title>

              <Dialog.Description className="mt-1 text-xs text-ink-muted">
                Select an eligible image. The website receives its own copy
                while the library original remains unchanged.
              </Dialog.Description>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              {loading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-ink-muted">
                  <Loader2 className="size-4 animate-spin" />
                  Loading Media…
                </div>
              ) : media.length === 0 ? (
                <div className="py-12 text-center text-sm text-ink-muted">
                  No eligible images are currently available. Upload an image in
                  Media Library, then open this picker again.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {media.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      disabled={!asset.isEligibleForReuse}
                      title={
                        asset.isEligibleForReuse
                          ? asset.name
                          : (asset.ineligibilityReason ?? "Not eligible")
                      }
                      onClick={() => chooseAsset(asset)}
                      className="overflow-hidden rounded-md border border-subtle-divider bg-paper text-left transition hover:border-oxide disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <div className="relative aspect-square bg-subtle-field">
                        {asset.previewUrl ? (
                          <Image
                            src={asset.previewUrl}
                            alt=""
                            fill
                            sizes="180px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="size-6 text-ink-muted" />
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <p className="truncate text-xs font-medium text-ink">
                          {asset.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-ink-muted">
                          {asset.isPrivate ? "Private" : "Public"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-subtle-divider p-4">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="min-h-[40px] rounded-md border border-subtle-divider bg-paper px-4 text-xs font-semibold text-ink hover:bg-subtle-field"
              >
                Cancel
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={editorOpen} onOpenChange={setEditorOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" />

          <Dialog.Popup className="bg-reading-surface fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-subtle-divider p-5 shadow-lg">
            <Dialog.Title className="font-serif text-xl font-semibold text-ink">
              {candidate ? "Assign Website Image" : "Edit Crop & Alt"}
            </Dialog.Title>

            <Dialog.Description className="mt-1 text-xs text-ink-muted">
              Desktop and mobile crops can be positioned independently.
            </Dialog.Description>

            {editorPreview ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink">
                    Desktop preview
                  </p>

                  <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-subtle-divider bg-subtle-field">
                    <Image
                      src={editorPreview}
                      alt=""
                      fill
                      sizes="50vw"
                      className="object-cover"
                      style={{
                        objectPosition: `${desktopX}% ${desktopY}%`,
                      }}
                      unoptimized
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-ink">
                    Mobile preview
                  </p>

                  <div className="relative mx-auto aspect-[3/4] w-full max-w-56 overflow-hidden rounded-md border border-subtle-divider bg-subtle-field">
                    <Image
                      src={editorPreview}
                      alt=""
                      fill
                      sizes="224px"
                      className="object-cover"
                      style={{
                        objectPosition: `${mobileX}% ${mobileY}%`,
                      }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <FocalGrid
                label="Desktop focal point"
                x={desktopX}
                y={desktopY}
                onChange={(nextX, nextY) => {
                  setDesktopX(nextX);
                  setDesktopY(nextY);
                }}
              />

              <FocalGrid
                label="Mobile focal point"
                x={mobileX}
                y={mobileY}
                onChange={(nextX, nextY) => {
                  setMobileX(nextX);
                  setMobileY(nextY);
                }}
              />
            </div>

            <div className="mt-6 space-y-4">
              {activeSlot !== "author_portrait" ? (
                <label className="flex items-start gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={decorative}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      setDecorative(checked);

                      if (checked) {
                        setAltText("");
                      }
                    }}
                    className="mt-0.5 size-4"
                  />

                  <span>
                    <strong className="block text-xs">Decorative image</strong>

                    <span className="text-xs text-ink-muted">
                      Use this only when the image adds no meaningful
                      information.
                    </span>
                  </span>
                </label>
              ) : null}

              <label className="block">
                <span className="text-xs font-semibold text-ink">
                  Contextual alt text
                  {!decorative ? " *" : ""}
                </span>

                <textarea
                  value={altText}
                  disabled={decorative}
                  onChange={(event) => setAltText(event.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Describe what this image communicates in this specific placement."
                  className="mt-1 w-full rounded-md border border-subtle-divider bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-focus-slate focus:ring-2 focus:ring-focus-slate/20 disabled:opacity-50"
                />
              </label>
            </div>

            {error && editorOpen ? (
              <div
                role="alert"
                className="mt-4 flex gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />

                <span>{error}</span>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditorOpen(false)}
                className="min-h-[44px] rounded-md border border-subtle-divider bg-paper px-4 text-xs font-semibold text-ink hover:bg-subtle-field disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={savePlacement}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-oxide px-4 text-xs font-semibold text-paper hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}

                {candidate ? "Assign Image" : "Save Presentation"}
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
