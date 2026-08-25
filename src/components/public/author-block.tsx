import Link from "next/link";
import { FolioMarker } from "@/components/evidence/folio-marker";
import type { PublicProfile } from "@/lib/public-data";

interface AuthorBlockProps {
  profile: PublicProfile;
  className?: string;
}

export function AuthorBlock({ profile, className = "" }: AuthorBlockProps) {
  const displayName = profile.display_name || "Marie Medere";
  const tagline = profile.professional_tagline;
  const bio = profile.short_bio || profile.long_bio;

  return (
    <section
      className={`bg-reading-surface rounded-md border border-subtle-divider p-6 sm:p-8 ${className}`}
      aria-label="Author profile"
    >
      <div className="flex items-center gap-3">
        <FolioMarker number="AU" />
        <div>
          <span className="text-deep-sage font-sans text-xs font-semibold tracking-wider uppercase">
            Author & Medical Writer
          </span>
          <h3 className="font-serif text-lg font-medium text-ink">
            {displayName}
          </h3>
        </div>
      </div>

      {tagline && (
        <p className="text-muted-ink mt-3 font-sans text-xs">{tagline}</p>
      )}

      {bio && (
        <p className="text-muted-ink mt-3 text-sm leading-relaxed">{bio}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium">
        <Link
          href="/about"
          className="text-brand-oxide underline underline-offset-2 transition-colors hover:text-ink"
        >
          View Profile & Philosophy →
        </Link>
        <Link
          href="/portfolio"
          className="text-muted-ink hover:text-brand-oxide underline underline-offset-2 transition-colors"
        >
          Selected Writing
        </Link>
      </div>
    </section>
  );
}
