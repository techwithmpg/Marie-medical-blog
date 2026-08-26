"use client";

import * as React from "react";
import { useActionState, useState } from "react";
import { Plus, Trash2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import {
  updateSiteSettingsAction,
  type SiteSettingsActionResult,
} from "@/app/admin/settings/actions";
import type { AdminSiteSettings, SiteSocialLink } from "@/lib/admin/settings";
import { cn } from "@/lib/utils";

interface SiteSettingsFormProps {
  initialSettings: AdminSiteSettings | null;
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [state, formAction, isPending] = useActionState<
    SiteSettingsActionResult | null,
    FormData
  >(updateSiteSettingsAction, null);

  const [hasEditedSinceResult, setHasEditedSinceResult] = useState(false);
  const [prevActionState, setPrevActionState] = useState(state);

  // Synchronize action state transitions
  if (state !== prevActionState) {
    setPrevActionState(state);
    setHasEditedSinceResult(false);
  }

  // Character counter state: reflects true persisted data lengths or 0 if null/unsaved
  const [titleLen, setTitleLen] = useState(
    initialSettings?.site_title?.length || 0,
  );
  const [taglineLen, setTaglineLen] = useState(
    initialSettings?.tagline?.length || 0,
  );
  const [introLen, setIntroLen] = useState(
    initialSettings?.homepage_intro?.length || 0,
  );
  const [disclaimerLen, setDisclaimerLen] = useState(
    initialSettings?.disclaimer_text?.length || 0,
  );
  const [seoDescLen, setSeoDescLen] = useState(
    initialSettings?.default_seo_description?.length || 0,
  );

  // Dynamic social links state
  const [socialLinks, setSocialLinks] = useState<SiteSocialLink[]>(
    initialSettings?.social_links && initialSettings.social_links.length > 0
      ? initialSettings.social_links
      : [],
  );

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [...prev, { label: "", url: "" }]);
    setHasEditedSinceResult(true);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
    setHasEditedSinceResult(true);
  };

  const handleSocialChange = (
    index: number,
    field: "label" | "url",
    value: string,
  ) => {
    setSocialLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
    setHasEditedSinceResult(true);
  };

  const isHydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const showFeedback = Boolean(state?.message && !hasEditedSinceResult);
  const isSuccess = state?.success === true;
  const fieldErrors = state?.fieldErrors || {};

  return (
    <form
      action={formAction}
      onInput={() => setHasEditedSinceResult(true)}
      data-hydrated={isHydrated ? "true" : "false"}
      className="space-y-8"
      noValidate
    >
      {/* Action Result Feedback Banner */}
      {showFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-start gap-3 rounded-md border p-4 text-sm font-medium",
            isSuccess
              ? "border-success/30 bg-success/10 text-success"
              : "border-warning/30 bg-warning/10 text-warning",
          )}
        >
          {isSuccess ? (
            <CheckCircle2 className="size-5 shrink-0" />
          ) : (
            <AlertCircle className="size-5 shrink-0" />
          )}
          <span>{state?.message}</span>
        </div>
      )}

      {/* Section 1: Publication Identity */}
      <section className="space-y-5 rounded-lg border border-subtle-divider bg-paper p-6 shadow-xs">
        <h3 className="border-b border-subtle-divider pb-3 font-serif text-lg font-semibold text-ink">
          Publication Identity
        </h3>

        {/* Site Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="site_title"
              className="text-xs font-semibold tracking-wider text-ink uppercase"
            >
              Site Title <span className="text-oxide">*</span>
            </label>
            <span className="font-mono text-xs text-ink-muted">
              {titleLen} / 120
            </span>
          </div>
          <input
            id="site_title"
            name="site_title"
            type="text"
            required
            maxLength={120}
            defaultValue={initialSettings?.site_title ?? ""}
            placeholder="e.g. Marie Medere"
            onChange={(e) => setTitleLen(e.target.value.length)}
            aria-invalid={Boolean(fieldErrors.site_title)}
            aria-describedby={
              fieldErrors.site_title ? "site-title-error" : undefined
            }
            className="bg-reading-surface w-full rounded-md border border-subtle-divider px-3.5 py-2.5 text-sm text-ink transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          />
          {fieldErrors.site_title && (
            <p
              id="site-title-error"
              className="text-xs font-medium text-warning"
            >
              {fieldErrors.site_title[0]}
            </p>
          )}
        </div>

        {/* Tagline */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="tagline"
              className="text-xs font-semibold tracking-wider text-ink uppercase"
            >
              Tagline
            </label>
            <span className="font-mono text-xs text-ink-muted">
              {taglineLen} / 200
            </span>
          </div>
          <input
            id="tagline"
            name="tagline"
            type="text"
            maxLength={200}
            defaultValue={initialSettings?.tagline ?? ""}
            placeholder="e.g. Medical Writing Portfolio & Educational Blog"
            onChange={(e) => setTaglineLen(e.target.value.length)}
            aria-invalid={Boolean(fieldErrors.tagline)}
            aria-describedby={fieldErrors.tagline ? "tagline-error" : undefined}
            className="bg-reading-surface w-full rounded-md border border-subtle-divider px-3.5 py-2.5 text-sm text-ink transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          />
          {fieldErrors.tagline && (
            <p id="tagline-error" className="text-xs font-medium text-warning">
              {fieldErrors.tagline[0]}
            </p>
          )}
        </div>

        {/* Homepage Introduction */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="homepage_intro"
              className="text-xs font-semibold tracking-wider text-ink uppercase"
            >
              Homepage Introduction
            </label>
            <span className="font-mono text-xs text-ink-muted">
              {introLen} / 1200
            </span>
          </div>
          <textarea
            id="homepage_intro"
            name="homepage_intro"
            rows={4}
            maxLength={1200}
            defaultValue={initialSettings?.homepage_intro ?? ""}
            placeholder="A professional medical writing portfolio and educational publication dedicated to clear, evidence-based communication."
            onChange={(e) => setIntroLen(e.target.value.length)}
            aria-invalid={Boolean(fieldErrors.homepage_intro)}
            aria-describedby={
              fieldErrors.homepage_intro ? "homepage-intro-error" : undefined
            }
            className="bg-reading-surface w-full rounded-md border border-subtle-divider px-3.5 py-2.5 text-sm text-ink transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          />
          {fieldErrors.homepage_intro && (
            <p
              id="homepage-intro-error"
              className="text-xs font-medium text-warning"
            >
              {fieldErrors.homepage_intro[0]}
            </p>
          )}
        </div>
      </section>

      {/* Section 2: Editorial & SEO Notices */}
      <section className="space-y-5 rounded-lg border border-subtle-divider bg-paper p-6 shadow-xs">
        <h3 className="border-b border-subtle-divider pb-3 font-serif text-lg font-semibold text-ink">
          Editorial &amp; SEO Configuration
        </h3>

        {/* Compact Medical Disclaimer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="disclaimer_text"
              className="text-xs font-semibold tracking-wider text-ink uppercase"
            >
              Compact Medical Disclaimer
            </label>
            <span className="font-mono text-xs text-ink-muted">
              {disclaimerLen} / 1500
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            This controls the reusable on-page educational disclaimer notice. It
            does not replace the full Disclaimer page.
          </p>
          <textarea
            id="disclaimer_text"
            name="disclaimer_text"
            rows={3}
            maxLength={1500}
            defaultValue={initialSettings?.disclaimer_text ?? ""}
            placeholder="This publication provides educational content only and does not constitute medical advice."
            onChange={(e) => setDisclaimerLen(e.target.value.length)}
            aria-invalid={Boolean(fieldErrors.disclaimer_text)}
            aria-describedby={
              fieldErrors.disclaimer_text ? "disclaimer-error" : undefined
            }
            className="bg-reading-surface w-full rounded-md border border-subtle-divider px-3.5 py-2.5 text-sm text-ink transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          />
          {fieldErrors.disclaimer_text && (
            <p
              id="disclaimer-error"
              className="text-xs font-medium text-warning"
            >
              {fieldErrors.disclaimer_text[0]}
            </p>
          )}
        </div>

        {/* Default SEO Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="default_seo_description"
              className="text-xs font-semibold tracking-wider text-ink uppercase"
            >
              Default SEO Description
            </label>
            <span className="font-mono text-xs text-ink-muted">
              {seoDescLen} / 320
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            Stored now for site-wide SEO configuration. Full metadata
            integration is completed in Stage 10.
          </p>
          <textarea
            id="default_seo_description"
            name="default_seo_description"
            rows={2}
            maxLength={320}
            defaultValue={initialSettings?.default_seo_description ?? ""}
            placeholder="Medical Writing Portfolio & Educational Blog by Marie Medere."
            onChange={(e) => setSeoDescLen(e.target.value.length)}
            aria-invalid={Boolean(fieldErrors.default_seo_description)}
            aria-describedby={
              fieldErrors.default_seo_description ? "seo-desc-error" : undefined
            }
            className="bg-reading-surface w-full rounded-md border border-subtle-divider px-3.5 py-2.5 text-sm text-ink transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          />
          {fieldErrors.default_seo_description && (
            <p id="seo-desc-error" className="text-xs font-medium text-warning">
              {fieldErrors.default_seo_description[0]}
            </p>
          )}
        </div>
      </section>

      {/* Section 3: Structured Social Links */}
      <section className="space-y-5 rounded-lg border border-subtle-divider bg-paper p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle-divider pb-3">
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">
              Structured Social Links
            </h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              Configure verified links for the public footer. Only secure HTTPS
              URLs are accepted. Blank rows will be omitted on save.
            </p>
          </div>
          <button
            type="button"
            data-hydrated={isHydrated ? "true" : "false"}
            onClick={handleAddSocialLink}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-subtle-divider bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-subtle-field focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
          >
            <Plus className="size-3.5 text-oxide" />
            Add Link
          </button>
        </div>

        {fieldErrors.social_links && (
          <div className="space-y-1 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs font-medium text-warning">
            {fieldErrors.social_links.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        )}

        {socialLinks.length === 0 ? (
          <p className="py-4 text-center text-xs text-ink-muted italic">
            No social links configured. Click &ldquo;Add Link&rdquo; to add a
            verified profile link.
          </p>
        ) : (
          <div className="space-y-3">
            {socialLinks.map((link, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-md border border-subtle-divider/60 bg-parchment/30 p-3.5 sm:flex-row sm:items-center"
              >
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor={`social-label-${index}`}
                    className="text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase"
                  >
                    Display Label
                  </label>
                  <input
                    id={`social-label-${index}`}
                    name="socialLabel"
                    type="text"
                    maxLength={80}
                    value={link.label}
                    onChange={(e) =>
                      handleSocialChange(index, "label", e.target.value)
                    }
                    placeholder="e.g. LinkedIn"
                    className="bg-reading-surface w-full rounded-md border border-subtle-divider px-3 py-2 text-xs text-ink transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  />
                </div>

                <div className="flex-[2] space-y-1">
                  <label
                    htmlFor={`social-url-${index}`}
                    className="text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase"
                  >
                    HTTPS URL
                  </label>
                  <input
                    id={`social-url-${index}`}
                    name="socialUrl"
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      handleSocialChange(index, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="bg-reading-surface w-full rounded-md border border-subtle-divider px-3 py-2 text-xs text-ink transition-colors focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  />
                </div>

                <div className="flex sm:self-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(index)}
                    title="Remove social link"
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-md border border-subtle-divider bg-paper px-3 py-2 text-xs font-semibold text-warning transition-colors hover:bg-warning/10 focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sm:sr-only">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md bg-oxide px-6 py-2.5 text-sm font-semibold text-paper shadow-xs transition-colors hover:bg-oxide-link focus-visible:ring-2 focus-visible:ring-focus-slate focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="size-4" />
          <span>{isPending ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>
    </form>
  );
}
