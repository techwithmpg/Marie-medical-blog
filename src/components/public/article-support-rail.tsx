import Image from "next/image";
import Link from "next/link";
import { FileText, Scale, ShieldCheck } from "lucide-react";

import type {
  PublicArticleReference,
  PublicArticleSummary,
} from "@/lib/public-articles";

interface ArticleSupportRailProps {
  references: PublicArticleReference[];
  relatedArticles: PublicArticleSummary[];
  relatedImageUrls: Record<string, string | null>;
  disclaimerText: string | null;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) {
    return null;
  }

  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ArticleSupportRail({
  references,
  relatedArticles,
  relatedImageUrls,
  disclaimerText,
}: ArticleSupportRailProps) {
  return (
    <div className="w-full space-y-5">
      <aside className="rounded-lg border border-[#DED4C7] bg-[#FFFDF9] p-5">
        <div className="flex items-start gap-3">
          <Scale
            aria-hidden="true"
            strokeWidth={1.35}
            className="text-brand-oxide mt-0.5 h-6 w-6 shrink-0"
          />

          <div className="min-w-0">
            <h2 className="font-serif text-xl leading-tight font-medium text-ink">
              Evidence at a Glance
            </h2>

            <p className="text-muted-ink mt-2 text-[0.7rem] leading-relaxed">
              Sources cited in this article are available in the complete
              reference ledger.
            </p>
          </div>
        </div>

        {references.length > 0 && (
          <>
            <div className="mt-5 space-y-2">
              {references.slice(0, 3).map((reference) => (
                <div
                  key={reference.id}
                  className="flex gap-3 rounded-md border border-[#E6DDD1] bg-[#FBF6EF] p-3"
                >
                  <FileText
                    aria-hidden="true"
                    strokeWidth={1.3}
                    className="text-deep-sage mt-0.5 h-4 w-4 shrink-0"
                  />

                  <div className="min-w-0">
                    {reference.source_name && (
                      <p className="text-[0.66rem] leading-snug font-semibold text-ink">
                        {reference.source_name}
                      </p>
                    )}

                    {reference.title && (
                      <p className="text-muted-ink mt-1 line-clamp-2 text-[0.63rem] leading-relaxed">
                        {reference.title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#references"
              className="border-brand-oxide text-brand-oxide hover:bg-brand-oxide mt-4 inline-flex min-h-10 w-full items-center justify-center border px-3 text-[0.7rem] font-semibold transition-colors hover:text-parchment"
            >
              View Full References
            </a>
          </>
        )}
      </aside>

      {relatedArticles.length > 0 && (
        <aside
          id="related-writing"
          className="scroll-mt-28 rounded-lg border border-[#DED4C7] bg-[#FFFDF9] p-5"
        >
          <h2 className="font-serif text-xl font-medium text-ink">
            Related Articles
          </h2>

          <div className="mt-5 space-y-4">
            {relatedArticles.slice(0, 3).map((article) => {
              const imageUrl = relatedImageUrls[article.id] ?? null;

              const hasImage = Boolean(
                imageUrl && article.featured_image_alt?.trim(),
              );

              const formattedDate = formatDate(article.published_at);

              return (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group grid grid-cols-[84px_minmax(0,1fr)] gap-3"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border border-subtle-divider bg-[#EEE6DA]">
                    {hasImage && imageUrl && article.featured_image_alt ? (
                      <Image
                        src={imageUrl}
                        alt={article.featured_image_alt}
                        fill
                        sizes="84px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText
                          aria-hidden="true"
                          strokeWidth={1.3}
                          className="text-brand-oxide/70 h-4 w-4"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="group-hover:text-brand-oxide font-serif text-[0.82rem] leading-[1.12] font-medium text-ink transition-colors">
                      {article.title}
                    </h3>

                    <div className="text-muted-ink mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.58rem]">
                      {formattedDate && <span>{formattedDate}</span>}

                      {formattedDate && <span aria-hidden="true">•</span>}

                      <span>{article.reading_time_minutes} min read</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <Link
            href="/blog"
            className="text-brand-oxide mt-5 inline-flex text-[0.7rem] font-semibold hover:underline"
          >
            View all articles →
          </Link>
        </aside>
      )}

      <aside
        id="medical-disclaimer"
        className="scroll-mt-28 rounded-lg border border-[#C9CEBA] bg-[#EEF1E5] p-5"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            aria-hidden="true"
            strokeWidth={1.35}
            className="text-deep-sage h-6 w-6 shrink-0"
          />

          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-ink">
              Medical Information Disclaimer
            </h2>

            {disclaimerText && (
              <p className="text-muted-ink mt-2 line-clamp-6 text-[0.67rem] leading-relaxed">
                {disclaimerText}
              </p>
            )}

            <Link
              href="/disclaimer"
              className="text-deep-sage mt-3 inline-flex text-[0.67rem] font-semibold hover:underline"
            >
              Read full disclaimer →
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
