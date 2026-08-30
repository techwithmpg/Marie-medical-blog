import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Download,
  MessageCircle,
  PenLine,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { PublicShell } from "@/components/site/public-shell";
import { buttonVariants } from "@/components/ui/button";
import { getPublishedCategories } from "@/lib/public-articles";
import {
  getPublicCvUrl,
  getPublicProfile,
  getPublicSiteSettings,
} from "@/lib/public-data";
import { getPublicSiteMediaSlot } from "@/lib/public-site-media";
import { getPublicRouteDiscoveryMetadata } from "@/lib/site-url";
import { cn } from "@/lib/utils";

const PAGE_TITLE = "About";

const PAGE_DESCRIPTION =
  "About Marie Medere, her medical writing portfolio, and educational publication approach.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  ...getPublicRouteDiscoveryMetadata("/about", {
    social: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
  }),
};

const guidingPrinciples = [
  {
    title: "Evidence-Led",
    description: "Sources and references remain visible where appropriate.",
    Icon: BookOpen,
  },
  {
    title: "Clear & Accessible",
    description:
      "Complex subjects are structured for clear, readable communication.",
    Icon: MessageCircle,
  },
  {
    title: "Reader Focused",
    description:
      "Information hierarchy keeps the intended reader and purpose visible.",
    Icon: UserRound,
  },
  {
    title: "Ethical & Responsible",
    description:
      "Educational information remains clearly separated from medical advice.",
    Icon: ShieldCheck,
  },
];

export default async function AboutPage() {
  const [profile, settings, categories, aboutHero] = await Promise.all([
    getPublicProfile(),
    getPublicSiteSettings(),
    getPublishedCategories().catch(() => []),
    getPublicSiteMediaSlot("about_hero"),
  ]);

  const cvUrl = await getPublicCvUrl(profile.cv_storage_path);

  const heroTagline = profile.professional_tagline || settings.tagline;

  const heroBio =
    profile.short_bio ||
    "A professional medical writing portfolio and educational publication focused on clear, evidence-led communication.";

  const approachText =
    profile.long_bio ||
    profile.short_bio ||
    "The publication approach centers on clear language, careful organization, visible references, and accessible presentation of healthcare and scientific information.";

  const focusAreas =
    profile.interests && profile.interests.length > 0
      ? profile.interests
      : categories.map((category) => category.name).slice(0, 8);

  return (
    <PublicShell settings={settings}>
      <div className="space-y-10 sm:space-y-12">
        {/* ===================================================
            ABOUT MASTHEAD
        =================================================== */}
        <section className="overflow-hidden border-b border-subtle-divider">
          <div
            className={
              aboutHero
                ? "grid md:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)]"
                : "grid"
            }
          >
            <div className="flex min-w-0 flex-col justify-center py-5 pr-4 sm:py-8 md:pr-10 lg:pr-14">
              <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="text-muted-ink flex items-center gap-2 text-xs">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-brand-oxide transition-colors"
                    >
                      Home
                    </Link>
                  </li>

                  <li aria-hidden="true">›</li>

                  <li className="text-ink">About</li>
                </ol>
              </nav>

              <h1 className="font-serif text-5xl leading-[0.97] font-medium tracking-tight text-ink sm:text-6xl lg:text-7xl">
                About Marie
              </h1>

              {heroTagline && (
                <p className="text-brand-oxide mt-5 text-lg font-semibold sm:text-xl">
                  {heroTagline}
                </p>
              )}

              <p className="text-muted-ink mt-5 max-w-[58ch] text-base leading-[1.65] sm:text-lg">
                {heroBio}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/portfolio"
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "lg",
                    }),
                  )}
                >
                  View Selected Writing
                </Link>

                {cvUrl && (
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                        size: "lg",
                      }),
                    )}
                  >
                    <Download aria-hidden="true" className="mr-2 h-4 w-4" />
                    Download CV
                  </a>
                )}
              </div>
            </div>

            {aboutHero && (
              <figure className="relative mt-6 aspect-[16/9] overflow-hidden bg-[#EEE6DA] md:mt-0 md:aspect-auto md:min-h-[380px] lg:min-h-[420px]">
                <Image
                  src={aboutHero.publicUrl}
                  alt={aboutHero.isDecorative ? "" : aboutHero.altText}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 52vw"
                  style={{
                    objectPosition: `${aboutHero.desktopFocalX}% ${aboutHero.desktopFocalY}%`,
                  }}
                  className="object-cover"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 hidden w-[18%] bg-gradient-to-r from-[#F6F1E8] via-[#F6F1E8]/55 to-transparent md:block"
                />
              </figure>
            )}
          </div>
        </section>

        {/* ===================================================
            APPROACH + PRINCIPLES
        =================================================== */}
        <section className="grid gap-10 border-b border-subtle-divider pb-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14">
          {/* My Approach */}
          <div className="border-brand-oxide border-l-2 pl-5 sm:pl-6">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              My Approach
            </h2>

            <p className="mt-4 max-w-[58ch] text-base leading-[1.7] text-ink">
              {approachText}
            </p>

            <p className="text-muted-ink mt-4 max-w-[58ch] text-sm leading-[1.65] sm:text-base">
              Published work is organized to preserve scientific context while
              remaining clear, readable, and appropriately referenced.
            </p>

            {profile.education_summary && (
              <div className="mt-5 border-t border-subtle-divider pt-4">
                <p className="text-brand-oxide text-[0.68rem] font-semibold tracking-[0.1em] uppercase">
                  Academic Background
                </p>

                <p className="text-muted-ink mt-2 text-sm leading-relaxed">
                  {profile.education_summary}
                </p>
              </div>
            )}
          </div>

          {/* What Guides My Work */}
          <div>
            <h2 className="border-brand-oxide border-l-2 pl-4 font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              What Guides My Work
            </h2>

            <div className="mt-6 grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
              {guidingPrinciples.map(({ title, description, Icon }) => (
                <div
                  key={title}
                  className="flex flex-col items-center border-b border-subtle-divider px-5 py-5 text-center sm:border-r sm:border-b-0 sm:last:border-r-0"
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.35}
                    className="text-brand-oxide h-8 w-8"
                  />

                  <h3 className="mt-4 text-sm font-semibold text-ink">
                    {title}
                  </h3>

                  <p className="text-muted-ink mt-2 max-w-[24ch] text-xs leading-[1.55]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================
            WHAT I DO + CONTACT
        =================================================== */}
        <section className="overflow-hidden rounded-lg border border-subtle-divider bg-[#FFFDF9]/55">
          <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
            {/* Focus Areas */}
            <div className="p-6 sm:p-8 lg:border-r lg:border-subtle-divider">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-ink">
                What I Do
              </h2>

              <p className="text-muted-ink mt-2 text-sm leading-relaxed">
                Current writing and publication focus areas include:
              </p>

              {focusAreas.length > 0 ? (
                <div className="mt-5 grid gap-x-7 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                  {focusAreas.map((area) => (
                    <div key={area} className="flex items-center gap-2.5">
                      <CheckCircle2
                        aria-hidden="true"
                        strokeWidth={1.55}
                        className="text-brand-oxide h-4 w-4 shrink-0"
                      />

                      <span className="text-sm text-ink">{area}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-ink mt-5 text-sm">
                  Focus areas will appear here as profile and publication
                  information is added.
                </p>
              )}
            </div>

            {/* Contact CTA */}
            <div className="flex items-center gap-5 p-6 sm:p-8">
              <div className="border-brand-oxide/55 text-brand-oxide flex h-14 w-14 shrink-0 items-center justify-center rounded-full border">
                <PenLine
                  aria-hidden="true"
                  strokeWidth={1.4}
                  className="h-6 w-6"
                />
              </div>

              <div className="min-w-0">
                <h2 className="font-serif text-xl leading-snug font-medium text-ink sm:text-2xl">
                  Professional writing inquiries
                </h2>

                <p className="text-muted-ink mt-2 text-sm leading-relaxed">
                  Get in touch regarding medical writing and educational
                  publication work.
                </p>

                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({
                      variant: "default",
                      size: "default",
                    }),
                    "mt-5",
                  )}
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
