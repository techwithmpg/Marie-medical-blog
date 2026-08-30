import { z } from "zod";
import {
  ALLOWED_MEDIA_BUCKETS,
  isValidStoragePath,
} from "@/lib/admin/media-validation";

export const SITE_MEDIA_SLOTS = [
  "home_hero",
  "about_hero",
  "portfolio_hero",
  "contact_hero",
  "author_portrait",
  "default_social",
] as const;

export type SiteMediaSlot = (typeof SITE_MEDIA_SLOTS)[number];

export const SITE_MEDIA_SLOT_META: Record<
  SiteMediaSlot,
  {
    label: string;
    description: string;
    mobileRule: string;
  }
> = {
  home_hero: {
    label: "Homepage Hero",
    description: "Primary editorial image for the homepage masthead.",
    mobileRule: "Desktop + mobile",
  },

  about_hero: {
    label: "About Hero",
    description: "Primary editorial image for the About page.",
    mobileRule: "Desktop + mobile",
  },

  portfolio_hero: {
    label: "Portfolio Hero",
    description: "Editorial masthead image for Selected Writing.",
    mobileRule: "Desktop/tablet; mobile hero will later be hidden",
  },

  contact_hero: {
    label: "Contact Hero",
    description: "Editorial masthead image for Contact.",
    mobileRule: "Desktop/tablet; mobile hero will later be hidden",
  },

  author_portrait: {
    label: "Author Portrait",
    description: "Optional author portrait.",
    mobileRule: "Context dependent",
  },

  default_social: {
    label: "Default Social Image",
    description: "Fallback social-sharing image for non-article pages.",
    mobileRule: "Metadata only",
  },
};

const focal = z.number().int().min(0).max(100);

export const siteMediaPresentationSchema = z
  .object({
    slot: z.enum(SITE_MEDIA_SLOTS),

    altText: z.string().trim().max(500).nullable(),

    isDecorative: z.boolean(),

    desktopFocalX: focal,
    desktopFocalY: focal,

    mobileFocalX: focal,
    mobileFocalY: focal,
  })
  .superRefine((value, ctx) => {
    if (value.slot === "author_portrait" && value.isDecorative) {
      ctx.addIssue({
        code: "custom",
        path: ["isDecorative"],
        message: "The author portrait cannot be decorative.",
      });
    }

    if (!value.isDecorative && !value.altText?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["altText"],
        message: "Alt text is required for meaningful images.",
      });
    }
  });

export const assignSiteMediaSchema = siteMediaPresentationSchema.and(
  z.object({
    sourceBucket: z.enum(ALLOWED_MEDIA_BUCKETS),

    sourcePath: z
      .string()
      .trim()
      .min(1)
      .refine(isValidStoragePath, "Invalid source storage path."),
  }),
);

export const clearSiteMediaSchema = z.object({
  slot: z.enum(SITE_MEDIA_SLOTS),
});

export type AssignSiteMediaInput = z.infer<typeof assignSiteMediaSchema>;

export type SiteMediaPresentationInput = z.infer<
  typeof siteMediaPresentationSchema
>;

export type ClearSiteMediaInput = z.infer<typeof clearSiteMediaSchema>;
