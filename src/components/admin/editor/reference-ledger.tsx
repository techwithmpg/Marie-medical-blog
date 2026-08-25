"use client";

import * as React from "react";
import { Plus, ArrowUp, ArrowDown, Trash2, BookOpen } from "lucide-react";
import { type SaveDraftReferenceInput } from "@/app/admin/articles/actions";
import { cn } from "@/lib/utils";

interface ReferenceLedgerProps {
  references: SaveDraftReferenceInput[];
  onChange: (refs: SaveDraftReferenceInput[]) => void;
  disabled?: boolean;
}

export function ReferenceLedger({
  references,
  onChange,
  disabled = false,
}: ReferenceLedgerProps) {
  const handleAdd = () => {
    onChange([
      ...references,
      {
        title: "",
        source_name: "",
        url: "",
        citation_details: "",
      },
    ]);
  };

  const handleUpdate = (
    index: number,
    field: keyof SaveDraftReferenceInput,
    value: string,
  ) => {
    const updated = [...references];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = references.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...references];
    const item = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = item;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === references.length - 1) return;
    const updated = [...references];
    const item = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = item;
    onChange(updated);
  };

  return (
    <div className="rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-5 shadow-xs sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D2C9BC] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-md bg-[#E8E2D7] p-2 text-[#7B3F35]">
            <BookOpen className="size-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#242321]">
              Reference Ledger
            </h3>
            <p className="text-xs text-[#5E5953]">
              Structured academic and clinical evidence citations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-[#918579] bg-[#FFFDF9] px-3.5 py-2 text-xs font-semibold text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-40"
        >
          <Plus className="size-4 text-[#7B3F35]" />
          Add Reference
        </button>
      </div>

      {/* Reference List */}
      {references.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#5E5953]">
            No references attached to this article draft.
          </p>
          <p className="mt-1 text-xs text-[#5E5953]/70">
            Click &ldquo;Add Reference&rdquo; to attach scholarly evidence and
            citations.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {references.map((ref, index) => {
            const hasUrlError =
              ref.url &&
              ref.url.trim().length > 0 &&
              !/^https?:\/\//i.test(ref.url.trim());

            return (
              <div
                key={index}
                className="relative rounded-md border border-[#D2C9BC] bg-[#F6F1E8]/40 p-4 transition-all"
              >
                {/* Reference Header & Reordering Controls */}
                <div className="mb-3 flex items-center justify-between border-b border-[#D2C9BC]/60 pb-2">
                  <span className="font-mono text-xs font-semibold text-[#7B3F35]">
                    [Ref {index + 1}]
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={disabled || index === 0}
                      aria-label={`Move reference ${index + 1} up`}
                      title="Move up"
                      className="flex size-8 items-center justify-center rounded-xs text-[#5E5953] transition-colors hover:bg-[#E8E2D7] hover:text-[#242321] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={disabled || index === references.length - 1}
                      aria-label={`Move reference ${index + 1} down`}
                      title="Move down"
                      className="flex size-8 items-center justify-center rounded-xs text-[#5E5953] transition-colors hover:bg-[#E8E2D7] hover:text-[#242321] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      disabled={disabled}
                      aria-label={`Remove reference ${index + 1}`}
                      title="Remove reference"
                      className="flex size-8 items-center justify-center rounded-xs text-[#5E5953] transition-colors hover:bg-[#E8E2D7] hover:text-[#9A3636] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-30"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`ref-title-${index}`}
                      className="block text-xs font-semibold text-[#242321]"
                    >
                      Title <span className="text-[#7B3F35]">*</span>
                    </label>
                    <input
                      id={`ref-title-${index}`}
                      type="text"
                      value={ref.title}
                      onChange={(e) =>
                        handleUpdate(index, "title", e.target.value)
                      }
                      disabled={disabled}
                      placeholder="e.g. Clinical evaluation of pediatric respiratory interventions"
                      required
                      className="mt-1 w-full rounded-md border border-[#918579] bg-[#FFFDF9] px-3 py-2 text-sm text-[#242321] placeholder-[#5E5953]/50 focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`ref-source-${index}`}
                      className="block text-xs font-semibold text-[#242321]"
                    >
                      Source / Journal <span className="text-[#7B3F35]">*</span>
                    </label>
                    <input
                      id={`ref-source-${index}`}
                      type="text"
                      value={ref.source_name}
                      onChange={(e) =>
                        handleUpdate(index, "source_name", e.target.value)
                      }
                      disabled={disabled}
                      placeholder="e.g. New England Journal of Medicine, 384(12)"
                      required
                      className="mt-1 w-full rounded-md border border-[#918579] bg-[#FFFDF9] px-3 py-2 text-sm text-[#242321] placeholder-[#5E5953]/50 focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`ref-url-${index}`}
                      className="block text-xs font-semibold text-[#242321]"
                    >
                      URL{" "}
                      <span className="text-xs font-normal text-[#5E5953]">
                        (Optional)
                      </span>
                    </label>
                    <input
                      id={`ref-url-${index}`}
                      type="url"
                      value={ref.url || ""}
                      onChange={(e) =>
                        handleUpdate(index, "url", e.target.value)
                      }
                      disabled={disabled}
                      placeholder="https://doi.org/10.1056/..."
                      className={cn(
                        "mt-1 w-full rounded-md border border-[#918579] bg-[#FFFDF9] px-3 py-2 text-sm text-[#242321] placeholder-[#5E5953]/50 focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-50",
                        hasUrlError &&
                          "border-[#9A3636] focus-visible:ring-[#9A3636]",
                      )}
                    />
                    {hasUrlError && (
                      <p className="mt-1 text-xs text-[#9A3636]">
                        URL must start with http:// or https://
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`ref-details-${index}`}
                      className="block text-xs font-semibold text-[#242321]"
                    >
                      Citation Details / DOI / Notes{" "}
                      <span className="text-xs font-normal text-[#5E5953]">
                        (Optional)
                      </span>
                    </label>
                    <input
                      id={`ref-details-${index}`}
                      type="text"
                      value={ref.citation_details || ""}
                      onChange={(e) =>
                        handleUpdate(index, "citation_details", e.target.value)
                      }
                      disabled={disabled}
                      placeholder="e.g. Vol. 45, pp. 112-120; DOI: 10.1000/182"
                      className="mt-1 w-full rounded-md border border-[#918579] bg-[#FFFDF9] px-3 py-2 text-sm text-[#242321] placeholder-[#5E5953]/50 focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
