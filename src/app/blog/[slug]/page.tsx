import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { ArticleHeader } from "@/components/public/article-header";
import { ArticleReadingRail } from "@/components/public/article-reading-rails";
import { KeyTakeaways } from "@/components/public/key-takeaways";
import { ArticleSupportRail } from "@/components/public/article-support-rail";
import { ArticleTypography } from "@/components/public/article-typography";
import {
  extractArticleOutline,
  extractKeyTakeaways,
} from "@/lib/article-outline";
import { ReferenceLedger } from "@/components/evidence/reference-ledger";
import { AuthorBlock } from "@/components/public/author-block";
import {
  getPublishedArticleBySlug,
  getRelatedPublishedArticles,
  type PublicArticleSummary,
} from "@/lib/public-articles";
import {
  getPublicProfile,
  getPublicSiteSettings,
  getPublicArticleAssetData,
  type PublicProfile,
  type PublicSiteSettings,
} from "@/lib/public-data";
import {
  getApprovedCommentsByArticleId,
  type PublicApprovedComment,
} from "@/lib/public-comments";
import { CommentSection } from "@/components/public/comment-section";
import {
  getPublicRouteDiscoveryMetadata,
  getCanonicalUrl,
  resolveArticleMetadataText,
} from "@/lib/site-url";
import {
  buildBlogPostingJsonLd,
  serializeJsonLd,
  type PublicDiscoveryImage,
} from "@/lib/discovery-artifacts";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [settings, profile, assetData] = await Promise.all([
    getPublicSiteSettings(),
    getPublicProfile(),
    getPublicArticleAssetData(
      article.featured_image_path,
      article.featured_image_alt,
    ),
  ]);
  const { title, description } = resolveArticleMetadataText(
    {
      title: article.title,
      seoTitle: article.seo_title,
      excerpt: article.excerpt,
      seoDescription: article.seo_description,
    },
    {
      defaultDescription: settings.default_seo_description,
      tagline: settings.tagline,
    },
  );
  const authorName = profile.display_name.trim();

  return {
    title,
    description,
    ...getPublicRouteDiscoveryMetadata(
      `/blog/${encodeURIComponent(article.slug)}`,
      {
        social: {
          title,
          description,
          type: "article",
          publishedTime: article.published_at,
          modifiedTime: article.updated_at,
          authors: authorName ? [authorName] : undefined,
          image: assetData.discoveryImage,
        },
      },
    ),
  };
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
  let settings: PublicSiteSettings;
  let relatedArticles: PublicArticleSummary[] = [];
  let featuredImageUrl: string | null = null;
  let approvedComments: PublicApprovedComment[] = [];
  let discoveryImage: PublicDiscoveryImage | null = null;

  try {
    const [
      fetchedProfile,
      fetchedSettings,
      fetchedRelated,
      fetchedComments,
      fetchedAssetData,
    ] = await Promise.all([
      getPublicProfile(),
      getPublicSiteSettings(),
      getRelatedPublishedArticles(article.id, article.category_id, 3),
      getApprovedCommentsByArticleId(article.id),
      getPublicArticleAssetData(
        article.featured_image_path,
        article.featured_image_alt,
      ),
    ]);

    profile = fetchedProfile;
    settings = fetchedSettings;
    relatedArticles = fetchedRelated;
    approvedComments = fetchedComments;
    featuredImageUrl = fetchedAssetData.publicUrl;
    discoveryImage = fetchedAssetData.discoveryImage;
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
    settings = {
      site_title: "Marie Medere",
      tagline: "Medical Writing Portfolio & Educational Blog",
      default_seo_description:
        "Medical Writing Portfolio & Educational Blog by Marie Medere.",
      disclaimer_text:
        "This publication provides educational content only and does not constitute medical advice.",
      homepage_intro: null,
      social_links: [],
    };
    relatedArticles = [];
    featuredImageUrl = null;
    approvedComments = [];
    discoveryImage = null;
  }

  const hasValidImage = Boolean(
    featuredImageUrl &&
    article.featured_image_alt &&
    article.featured_image_alt.trim().length > 0,
  );
  const { description } = resolveArticleMetadataText(
    {
      title: article.title,
      seoTitle: article.seo_title,
      excerpt: article.excerpt,
      seoDescription: article.seo_description,
    },
    {
      defaultDescription: settings.default_seo_description,
      tagline: settings.tagline,
    },
  );
  const articleCanonicalUrl = getCanonicalUrl(
    `/blog/${encodeURIComponent(article.slug)}`,
  );
  const articleJsonLd = buildBlogPostingJsonLd({
    headline: article.title,
    description,
    canonicalUrl: articleCanonicalUrl,
    publishedAt: article.published_at,
    updatedAt: article.updated_at,
    authorName: profile.display_name,
    authorUrl: getCanonicalUrl("/about"),
    image: discoveryImage,
  });

  const articleOutline = extractArticleOutline(article.content_json);

  const keyTakeaways = extractKeyTakeaways(article.content_json, {
    allowSyntheticFallback: article.title
      .trim()
      .toLowerCase()
      .startsWith("synthetic"),
  });
  const relatedImageEntries = await Promise.all(
    relatedArticles.map(async (relatedArticle) => {
      try {
        const assetData = await getPublicArticleAssetData(
          relatedArticle.featured_image_path,
          relatedArticle.featured_image_alt,
        );

        return [relatedArticle.id, assetData.publicUrl] as const;
      } catch {
        return [relatedArticle.id, null] as const;
      }
    }),
  );

  const relatedImageUrls: Record<string, string | null> =
    Object.fromEntries(relatedImageEntries);
  return (
    <article className="w-full min-w-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />

      <div className="grid w-full min-w-0 gap-8 xl:grid-cols-[minmax(180px,15vw)_minmax(0,1fr)_minmax(240px,20vw)] xl:items-start xl:gap-x-[clamp(28px,4vw,68px)]">
        {/* Left article navigation */}
        <aside className="order-2 w-full xl:sticky xl:top-24 xl:order-1">
          <div className="space-y-5">
            <ArticleReadingRail
              items={articleOutline}
              hasReferences={article.references.length > 0}
            />

            <KeyTakeaways items={keyTakeaways} />
          </div>
        </aside>

        {/* Main reading column */}
        <main className="order-1 w-full min-w-0 xl:order-2">
          <ArticleHeader
            title={article.title}
            excerpt={article.excerpt}
            category={article.category}
            publishedAt={article.published_at}
            updatedAt={article.updated_at}
            readingTimeMinutes={article.reading_time_minutes}
            authorName={profile.display_name}
            authorTagline={profile.professional_tagline}
          />

          {hasValidImage && featuredImageUrl && article.featured_image_alt && (
            <figure className="mt-7 overflow-hidden border border-subtle-divider bg-[#EEE6DA]">
              <Image
                src={featuredImageUrl}
                alt={article.featured_image_alt}
                width={1200}
                height={630}
                className="h-auto max-h-[430px] w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 720px"
              />
            </figure>
          )}

          <section
            id="article-content"
            aria-label="Article content"
            className="scroll-mt-28 pt-10"
          >
            <ArticleTypography
              contentJson={article.content_json}
              className="w-full max-w-[78ch]"
            />
          </section>

          {article.references.length > 0 && (
            <section id="references" className="scroll-mt-28 pt-8">
              <ReferenceLedger
                title="References & Evidence Sources"
                headingLevel="h2"
                items={article.references}
              />
            </section>
          )}

          <div id="about-author" className="scroll-mt-28 pt-8">
            <AuthorBlock profile={profile} />
          </div>

          <div id="discussion" className="scroll-mt-28 pt-10">
            <CommentSection
              articleId={article.id}
              comments={approvedComments}
            />
          </div>
        </main>

        {/* Right evidence / related / disclaimer rail */}
        <aside className="order-3 w-full xl:sticky xl:top-24">
          <ArticleSupportRail
            references={article.references}
            relatedArticles={relatedArticles}
            relatedImageUrls={relatedImageUrls}
            disclaimerText={settings.disclaimer_text}
          />
        </aside>
      </div>
    </article>
  );
}
