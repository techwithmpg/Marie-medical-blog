import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { ArticleHeader } from "@/components/public/article-header";
import { ArticleTypography } from "@/components/public/article-typography";
import { ReferenceLedger } from "@/components/evidence/reference-ledger";
import { AuthorBlock } from "@/components/public/author-block";
import { MedicalDisclaimer } from "@/components/public/medical-disclaimer";
import { ArticleListItem } from "@/components/public/article-list-item";
import {
  getPublishedArticleBySlug,
  getRelatedPublishedArticles,
  type PublicArticleSummary,
} from "@/lib/public-articles";
import {
  getPublicProfile,
  getPublicAssetUrl,
  type PublicProfile,
} from "@/lib/public-data";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getPublishedArticleBySlug(slug);
    if (!article) {
      return {
        title: "Article Not Found | Marie Medere",
      };
    }

    return {
      title: `${article.seo_title || article.title} | Marie Medere`,
      description:
        article.seo_description ||
        article.excerpt ||
        "Medical Writing Portfolio & Educational Blog by Marie Medere.",
    };
  } catch {
    return {
      title: "Articles | Marie Medere",
      description:
        "Medical Writing Portfolio & Educational Blog by Marie Medere.",
    };
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let article;
  try {
    article = await getPublishedArticleBySlug(slug);
  } catch {
    throw new Error("Unable to load article at this time.");
  }

  if (!article) {
    notFound();
  }

  let profile: PublicProfile;
  let relatedArticles: PublicArticleSummary[] = [];
  let featuredImageUrl: string | null = null;

  try {
    const [fetchedProfile, fetchedRelated, fetchedImageUrl] = await Promise.all(
      [
        getPublicProfile(),
        getRelatedPublishedArticles(article.id, article.category_id, 3),
        getPublicAssetUrl(article.featured_image_path),
      ],
    );

    profile = fetchedProfile;
    relatedArticles = fetchedRelated;
    featuredImageUrl = fetchedImageUrl;
  } catch {
    profile = {
      display_name: "Marie Medere",
      professional_tagline: "Medical Writing Portfolio & Educational Blog",
      short_bio: null,
      long_bio: null,
      education_summary: null,
      interests: null,
      social_links: null,
      cv_storage_path: null,
    };
    relatedArticles = [];
    featuredImageUrl = null;
  }

  const hasValidImage = Boolean(
    featuredImageUrl &&
    article.featured_image_alt &&
    article.featured_image_alt.trim().length > 0,
  );

  return (
    <article className="mx-auto max-w-4xl space-y-12 sm:space-y-16">
      {/* Article Header */}
      <ArticleHeader
        title={article.title}
        excerpt={article.excerpt}
        category={article.category}
        publishedAt={article.published_at}
        updatedAt={article.updated_at}
        readingTimeMinutes={article.reading_time_minutes}
      />

      {/* Featured Media (Only rendered when URL and alt text both exist) */}
      {hasValidImage && featuredImageUrl && article.featured_image_alt && (
        <div className="overflow-hidden rounded-md border border-subtle-divider">
          <Image
            src={featuredImageUrl}
            alt={article.featured_image_alt}
            width={1200}
            height={630}
            className="h-auto max-h-[480px] w-full object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority={false}
          />
        </div>
      )}

      {/* Long-form Article Body */}
      <section aria-label="Article content">
        <ArticleTypography contentJson={article.content_json} />
      </section>

      {/* Reference Ledger */}
      {article.references.length > 0 && (
        <section>
          <ReferenceLedger
            title="References & Evidence Sources"
            headingLevel="h2"
            items={article.references}
          />
        </section>
      )}

      {/* Author Block */}
      <div>
        <AuthorBlock profile={profile} />
      </div>

      {/* Medical Disclaimer Banner */}
      <div>
        <MedicalDisclaimer />
      </div>

      {/* Related Writing (Category Relevancy only) */}
      {relatedArticles.length > 0 && (
        <section className="border-t border-subtle-divider pt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-ink">
              Related Writing
            </h2>
            {article.category && (
              <span className="text-deep-sage font-sans text-xs font-semibold tracking-wider uppercase">
                {article.category.name}
              </span>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((relArticle, index) => (
              <ArticleListItem
                key={relArticle.id}
                article={relArticle}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
