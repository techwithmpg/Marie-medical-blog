import { notFound } from "next/navigation";
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
} from "@/lib/public-articles";
import { getPublicProfile, getPublicAssetUrl } from "@/lib/public-data";

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
        "Evidence-based medical writing and educational publication by Marie Medere.",
    };
  } catch {
    return {
      title: "Articles | Marie Medere",
    };
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let article;
  let profile;
  let relatedArticles = [];
  let featuredImageUrl: string | null = null;

  try {
    article = await getPublishedArticleBySlug(slug);
    if (!article) {
      notFound();
    }

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
  } catch (error) {
    // If notFound was thrown, let Next.js handle the 404
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      (error as { digest: string }).digest.includes("NEXT_NOT_FOUND")
    ) {
      throw error;
    }

    // Otherwise, real query/network error => rethrow to trigger error boundary
    throw error;
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Article Header */}
      <ArticleHeader
        title={article.title}
        excerpt={article.excerpt}
        category={article.category}
        publishedAt={article.published_at}
        updatedAt={article.updated_at}
        readingTimeMinutes={article.reading_time_minutes}
      />

      {/* Featured Media (Optional) */}
      {featuredImageUrl && (
        <div className="mb-10 overflow-hidden rounded-md border border-subtle-divider">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featuredImageUrl}
            alt={article.featured_image_alt || article.title}
            className="max-h-[480px] w-full object-cover"
          />
        </div>
      )}

      {/* Long-form Article Body */}
      <section className="mb-14">
        <ArticleTypography contentJson={article.content_json} />
      </section>

      {/* Reference Ledger */}
      {article.references.length > 0 && (
        <section className="mb-14">
          <ReferenceLedger items={article.references} />
        </section>
      )}

      {/* Author Block */}
      <div className="mb-10">
        <AuthorBlock profile={profile} />
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="mb-14">
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
              <span className="text-deep-sage text-xs font-semibold tracking-wider uppercase">
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
