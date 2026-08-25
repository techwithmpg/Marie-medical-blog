import Link from "next/link";
import { TopicImprint } from "@/components/evidence/topic-imprint";
import { SplitRule } from "@/components/evidence/split-rule";
import type { PublicCategory } from "@/lib/public-articles";

interface ArticleHeaderProps {
  title: string;
  excerpt?: string | null;
  category?: PublicCategory | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  readingTimeMinutes: number;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ArticleHeader({
  title,
  excerpt,
  category,
  publishedAt,
  updatedAt,
  readingTimeMinutes,
}: ArticleHeaderProps) {
  const formattedPublished = publishedAt ? formatDate(publishedAt) : null;
  const formattedUpdated = updatedAt ? formatDate(updatedAt) : null;
  const showUpdated =
    formattedUpdated &&
    formattedPublished &&
    formattedUpdated !== formattedPublished;

  return (
    <header className="mb-10">
      {/* Breadcrumb Context */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="text-muted-ink flex flex-wrap items-center gap-2 text-xs">
          <li>
            <Link href="/" className="hover:text-brand-oxide transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-subtle-divider">
            /
          </li>
          <li>
            <Link
              href="/blog"
              className="hover:text-brand-oxide transition-colors"
            >
              Articles
            </Link>
          </li>
          {category && (
            <>
              <li aria-hidden="true" className="text-subtle-divider">
                /
              </li>
              <li>
                <Link
                  href={`/topics/${category.slug}`}
                  className="text-brand-oxide font-medium transition-colors hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Topic Imprint */}
      {category && (
        <div className="mb-4">
          <TopicImprint>{category.name}</TopicImprint>
        </div>
      )}

      {/* Article H1 */}
      <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl md:text-5xl md:leading-[1.15]">
        {title}
      </h1>

      {/* Excerpt / Deck */}
      {excerpt && (
        <p className="text-muted-ink mt-4 text-lg leading-relaxed md:text-xl md:leading-normal">
          {excerpt}
        </p>
      )}

      {/* Metadata Bar */}
      <div className="text-muted-ink mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-xs">
        {formattedPublished && <span>Published {formattedPublished}</span>}
        {showUpdated && <span>Updated {formattedUpdated}</span>}
        {formattedPublished && (
          <span aria-hidden="true" className="text-subtle-divider">
            •
          </span>
        )}
        <span>{readingTimeMinutes} min read</span>
      </div>

      <div className="mt-8">
        <SplitRule />
      </div>
    </header>
  );
}
