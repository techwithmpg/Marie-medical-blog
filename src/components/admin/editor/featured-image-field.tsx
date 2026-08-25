"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, AlertCircle, ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface FeaturedImageFieldProps {
  articleId?: string | null;
  imagePath: string | null;
  imageAlt: string | null;
  onImagePathChange: (path: string | null) => void;
  onImageAltChange: (alt: string) => void;
  disabled?: boolean;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function FeaturedImageField({
  articleId,
  imagePath,
  imageAlt,
  onImagePathChange,
  onImageAltChange,
  disabled = false,
}: FeaturedImageFieldProps) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isNewUnsavedArticle = !articleId;

  // Load authenticated preview for draft image path
  React.useEffect(() => {
    let isMounted = true;

    async function loadPreview() {
      if (!imagePath) {
        setPreviewUrl(null);
        return;
      }

      setLoadingPreview(true);
      try {
        const supabase = createClient();
        // Create short-lived authenticated signed URL for private draft-assets
        const { data, error } = await supabase.storage
          .from("draft-assets")
          .createSignedUrl(imagePath, 3600);

        if (isMounted) {
          if (error || !data?.signedUrl) {
            setPreviewUrl(null);
          } else {
            setPreviewUrl(data.signedUrl);
          }
        }
      } catch {
        if (isMounted) {
          setPreviewUrl(null);
        }
      } finally {
        if (isMounted) {
          setLoadingPreview(false);
        }
      }
    }

    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [imagePath]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset errors
    setUploadError(null);

    // Validate type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError("Allowed image formats: JPEG, PNG, WebP, AVIF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Image file size must not exceed 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!articleId) {
      setUploadError(
        "Please save the draft once before adding a featured image.",
      );
      return;
    }

    setUploading(true);

    try {
      const sanitizedName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "-")
        .replace(/-+/g, "-");
      const timestamp = Date.now();
      const storagePath = `articles/${articleId}/featured/${timestamp}-${sanitizedName}`;

      const supabase = createClient();
      const { error } = await supabase.storage
        .from("draft-assets")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        setUploadError(`Upload failed: ${error.message}`);
        return;
      }

      onImagePathChange(storagePath);
      // If no alt text is set yet, propose a reasonable starter or require prompt
      if (!imageAlt) {
        onImageAltChange("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed.";
      setUploadError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    onImagePathChange(null);
    onImageAltChange("");
    setPreviewUrl(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-3 rounded-lg border border-[#D2C9BC] bg-[#FFFDF9] p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold tracking-wider text-[#242321] uppercase">
          Featured Image (Private Draft)
        </label>
        {imagePath && !disabled && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="flex items-center gap-1 text-xs font-medium text-[#9A3636] transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
          >
            <X className="size-3.5" />
            Remove
          </button>
        )}
      </div>

      {isNewUnsavedArticle ? (
        <div className="rounded-md border border-dashed border-[#D2C9BC] bg-[#F6F1E8]/50 p-5 text-center">
          <ImageIcon className="mx-auto size-6 text-[#5E5953]/60" />
          <p className="mt-2 text-xs font-medium text-[#5E5953]">
            Save the draft once before adding a featured image.
          </p>
        </div>
      ) : imagePath ? (
        <div className="space-y-3">
          {/* Image Preview Canvas */}
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-[#D2C9BC] bg-[#E8E2D7]">
            {loadingPreview ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[#7B3F35]" />
              </div>
            ) : previewUrl ? (
              <Image
                src={previewUrl}
                alt={imageAlt || "Featured image preview"}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <ImageIcon className="size-6 text-[#5E5953]" />
                <span className="mt-1 text-xs text-[#5E5953]">
                  Preview unavailable (stored: {imagePath.split("/").pop()})
                </span>
              </div>
            )}
          </div>

          {/* Alt Text Field */}
          <div>
            <label
              htmlFor="featured-image-alt"
              className="block text-xs font-semibold text-[#242321]"
            >
              Alt Text (Required) <span className="text-[#7B3F35]">*</span>
            </label>
            <input
              id="featured-image-alt"
              type="text"
              value={imageAlt || ""}
              onChange={(e) => onImageAltChange(e.target.value)}
              disabled={disabled}
              placeholder="Descriptive explanation of the medical illustration or diagram"
              required
              className="mt-1 w-full rounded-md border border-[#918579] bg-[#FFFDF9] px-3 py-2 text-sm text-[#242321] placeholder-[#5E5953]/50 focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none disabled:opacity-50"
            />
            {(!imageAlt || imageAlt.trim().length === 0) && (
              <p className="mt-1 text-xs text-[#9A3636]">
                Alt text is required when a featured image is attached.
              </p>
            )}
          </div>

          {/* Replace Action */}
          {!disabled && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileChange}
                className="sr-only"
                id="replace-image-input"
              />
              <label
                htmlFor="replace-image-input"
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-[#918579] bg-[#FFFDF9] px-3 py-1.5 text-xs font-semibold text-[#242321] transition-colors hover:bg-[#E8E2D7] focus-visible:ring-2 focus-visible:ring-[#265D7A] focus-visible:outline-none"
              >
                <Upload className="size-3.5 text-[#7B3F35]" />
                {uploading ? "Uploading..." : "Replace Image"}
              </label>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            disabled={disabled || uploading}
            className="sr-only"
            id="featured-image-input"
          />
          <label
            htmlFor="featured-image-input"
            className={cn(
              "flex min-h-[44px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#D2C9BC] bg-[#F6F1E8]/30 p-6 text-center transition-colors focus-within:ring-2 focus-within:ring-[#265D7A] hover:bg-[#E8E2D7]/40",
              (disabled || uploading) && "cursor-not-allowed opacity-50",
            )}
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin text-[#7B3F35]" />
                <span className="text-xs font-medium text-[#242321]">
                  Uploading to private draft assets...
                </span>
              </div>
            ) : (
              <>
                <Upload className="size-5 text-[#7B3F35]" />
                <span className="mt-1.5 text-xs font-semibold text-[#242321]">
                  Click to select featured image
                </span>
                <span className="mt-0.5 text-[0.6875rem] text-[#5E5953]">
                  JPEG, PNG, WebP, AVIF up to 5MB
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#9A3636]">
          <AlertCircle className="size-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
