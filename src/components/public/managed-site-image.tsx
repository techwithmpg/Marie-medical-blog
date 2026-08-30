import Image from "next/image";
import type { CSSProperties } from "react";
import type { PublicSiteMedia } from "@/lib/public-site-media";
import { cn } from "@/lib/utils";

interface ManagedSiteImageProps {
  media: PublicSiteMedia;
  className?: string;
  imageClassName?: string;
  sizes: string;
  priority?: boolean;
}

export function ManagedSiteImage({
  media,
  className,
  imageClassName,
  sizes,
  priority = false,
}: ManagedSiteImageProps) {
  const focusStyle = {
    "--mobile-focus": `${media.mobileFocalX}% ${media.mobileFocalY}%`,
    "--desktop-focus": `${media.desktopFocalX}% ${media.desktopFocalY}%`,
  } as CSSProperties;

  return (
    <div className={cn("relative overflow-hidden bg-subtle-field", className)}>
      <Image
        src={media.publicUrl}
        alt={media.isDecorative ? "" : (media.altText ?? "")}
        fill
        sizes={sizes}
        priority={priority}
        style={focusStyle}
        className={cn(
          "object-cover [object-position:var(--mobile-focus)] md:[object-position:var(--desktop-focus)]",
          imageClassName,
        )}
      />
    </div>
  );
}
