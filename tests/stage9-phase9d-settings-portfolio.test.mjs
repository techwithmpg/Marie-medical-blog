import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  siteSettingsCoreSchema,
  validateSocialLinks,
} from "../src/lib/admin/settings-validation.ts";

const ROOT = process.cwd();

test("A. Admin site settings data helper contract", async () => {
  const settingsModulePath = path.join(ROOT, "src/lib/admin/settings.ts");
  assert.ok(
    fs.existsSync(settingsModulePath),
    "src/lib/admin/settings.ts must exist",
  );

  const content = fs.readFileSync(settingsModulePath, "utf8");

  // Verify explicit column selection (No SELECT *)
  assert.ok(
    content.includes(
      "id, site_title, tagline, homepage_intro, disclaimer_text, default_seo_description, social_links, updated_at",
    ),
    "Must explicitly select all singleton settings columns",
  );
  assert.ok(
    !content.includes('select("*")') && !content.includes("select('*')"),
    "Must not use SELECT * in settings helper",
  );

  // Verify singleton query filter (id = 1)
  assert.ok(
    content.includes('.eq("id", 1)') || content.includes(".eq('id', 1)"),
    "Must query specifically for singleton id = 1",
  );

  // Verify defensive parsing of social links
  assert.ok(
    content.includes("Array.isArray(data.social_links)"),
    "Must verify social_links is an array before processing",
  );

  // Verify server Supabase client usage without service role
  assert.ok(
    content.includes('import { createClient } from "@/lib/supabase/server"'),
    "Must use standard createClient from server helper",
  );
  assert.ok(
    !content.includes("service_role") && !content.includes("SERVICE_ROLE"),
    "Must not use service role in settings helper",
  );
});

test("B. Site settings core validation schema rules with synthetic test fixtures", async () => {
  // Valid core settings (synthetic test data)
  const valid = siteSettingsCoreSchema.safeParse({
    site_title: "Synthetic Publication",
    tagline: "Synthetic Editorial Tagline",
    homepage_intro: "Synthetic evidence-based intro.",
    disclaimer_text: "Synthetic educational notice.",
    default_seo_description: "Synthetic Publication & Editorial Index.",
  });
  assert.ok(valid.success, "Valid core settings should pass validation");
  if (valid.success) {
    assert.equal(valid.data.site_title, "Synthetic Publication");
    assert.equal(valid.data.tagline, "Synthetic Editorial Tagline");
  }

  // Blank site title should fail
  const emptyTitle = siteSettingsCoreSchema.safeParse({
    site_title: "   ",
  });
  assert.equal(
    emptyTitle.success,
    false,
    "Blank site title must fail validation",
  );

  // Title exceeding 120 chars should fail
  const longTitle = siteSettingsCoreSchema.safeParse({
    site_title: "A".repeat(121),
  });
  assert.equal(
    longTitle.success,
    false,
    "Site title exceeding 120 chars must fail validation",
  );

  // Empty strings in optional fields become null
  const emptyOptionals = siteSettingsCoreSchema.safeParse({
    site_title: "Synthetic Title",
    tagline: "   ",
    homepage_intro: "",
    disclaimer_text: "  ",
    default_seo_description: "",
  });
  assert.ok(
    emptyOptionals.success,
    "Empty optional strings should be valid and normalized to null",
  );
  if (emptyOptionals.success) {
    assert.equal(emptyOptionals.data.tagline, null);
    assert.equal(emptyOptionals.data.homepage_intro, null);
    assert.equal(emptyOptionals.data.disclaimer_text, null);
    assert.equal(emptyOptionals.data.default_seo_description, null);
  }
});

test("C. Social links validation, HTTPS requirement, and partial-row rejection with synthetic fixtures", async () => {
  // Valid HTTPS links with synthetic example.invalid domains
  const validResult = validateSocialLinks([
    {
      label: "Synthetic Profile One",
      url: "https://example.invalid/profile-one",
    },
    {
      label: "Synthetic Profile Two",
      url: "https://example.invalid/profile-two",
    },
  ]);
  assert.equal(validResult.errors.length, 0, "Valid HTTPS links must pass");
  assert.equal(validResult.links.length, 2);
  assert.equal(validResult.links[0].label, "Synthetic Profile One");
  assert.equal(validResult.links[0].url, "https://example.invalid/profile-one");

  // Blank rows should be omitted without error
  const blankRowsResult = validateSocialLinks([
    {
      label: "Synthetic Profile One",
      url: "https://example.invalid/profile-one",
    },
    { label: "  ", url: "  " },
    { label: "", url: "" },
  ]);
  assert.equal(
    blankRowsResult.errors.length,
    0,
    "Blank rows must not produce errors",
  );
  assert.equal(blankRowsResult.links.length, 1, "Blank rows must be omitted");

  // Partial row (label without URL) should fail
  const missingUrlResult = validateSocialLinks([
    { label: "Synthetic Profile One", url: "  " },
  ]);
  assert.ok(
    missingUrlResult.errors.length > 0,
    "Partial row (missing URL) must produce a validation error",
  );

  // Partial row (URL without label) should fail
  const missingLabelResult = validateSocialLinks([
    { label: "  ", url: "https://example.invalid/profile-one" },
  ]);
  assert.ok(
    missingLabelResult.errors.length > 0,
    "Partial row (missing label) must produce a validation error",
  );

  // HTTP URL should be rejected (HTTPS only)
  const insecureUrlResult = validateSocialLinks([
    { label: "Insecure Link", url: "http://example.invalid/insecure" },
  ]);
  assert.ok(
    insecureUrlResult.errors.length > 0,
    "Non-HTTPS URL must produce a validation error",
  );

  // Invalid URL format should be rejected
  const invalidUrlResult = validateSocialLinks([
    { label: "Broken URL", url: "not-a-valid-url" },
  ]);
  assert.ok(
    invalidUrlResult.errors.length > 0,
    "Invalid URL format must produce a validation error",
  );
});

test("D. Settings Server Action security, trigger-owned updated_at, and revalidation contract", async () => {
  const actionModulePath = path.join(ROOT, "src/app/admin/settings/actions.ts");
  assert.ok(
    fs.existsSync(actionModulePath),
    "src/app/admin/settings/actions.ts must exist",
  );

  const content = fs.readFileSync(actionModulePath, "utf8");

  // Verify server action directive and admin authentication guard
  assert.ok(
    content.includes('"use server"') || content.includes("'use server'"),
    "Must declare 'use server'",
  );
  assert.ok(
    content.includes("await requireAdmin()"),
    "Must enforce admin authorization via requireAdmin()",
  );

  // Verify upsert of singleton id = 1 without application-owned updated_at
  assert.ok(
    content.includes("id: 1"),
    "Must enforce upsert of singleton record with id: 1",
  );
  assert.ok(
    content.includes('onConflict: "id"') ||
      content.includes("onConflict: 'id'"),
    "Must specify onConflict: id for safe singleton upsert",
  );
  assert.ok(
    !content.includes("updated_at:"),
    "Must not explicitly write updated_at; database trigger is authoritative",
  );

  // Verify targeted revalidation
  assert.ok(
    content.includes('revalidatePath("/admin/settings")'),
    "Must revalidate /admin/settings",
  );
  assert.ok(
    content.includes('revalidatePath("/", "layout")') ||
      content.includes('revalidatePath("/")'),
    "Must revalidate public layout/root path",
  );

  // Verify no service-role credential usage
  assert.ok(
    !content.includes("service_role") && !content.includes("SERVICE_ROLE"),
    "Must not use service role in settings action",
  );
});

test("E. Settings UI and page component contract", async () => {
  const formComponentPath = path.join(
    ROOT,
    "src/components/admin/site-settings-form.tsx",
  );
  const pagePath = path.join(ROOT, "src/app/admin/settings/page.tsx");

  assert.ok(
    fs.existsSync(formComponentPath),
    "src/components/admin/site-settings-form.tsx must exist",
  );
  assert.ok(
    fs.existsSync(pagePath),
    "src/app/admin/settings/page.tsx must exist",
  );

  const pageContent = fs.readFileSync(pagePath, "utf8");
  const formContent = fs.readFileSync(formComponentPath, "utf8");

  // Page metadata: noindex/nofollow
  assert.ok(
    pageContent.includes("index: false") &&
      pageContent.includes("follow: false"),
    "Admin settings page must specify robots: { index: false, follow: false }",
  );
  assert.ok(
    pageContent.includes("await requireAdmin()"),
    "Admin settings page must enforce requireAdmin()",
  );

  // Form controls
  assert.ok(
    formContent.includes('name="site_title"'),
    "Form must contain site_title input",
  );
  assert.ok(
    formContent.includes('name="tagline"'),
    "Form must contain tagline input",
  );
  assert.ok(
    formContent.includes('name="homepage_intro"'),
    "Form must contain homepage_intro textarea",
  );
  assert.ok(
    formContent.includes('name="disclaimer_text"'),
    "Form must contain disclaimer_text textarea",
  );
  assert.ok(
    formContent.includes('name="default_seo_description"'),
    "Form must contain default_seo_description textarea",
  );
  assert.ok(
    formContent.includes('name="socialLabel"') &&
      formContent.includes('name="socialUrl"'),
    "Form must contain dynamic social link inputs (socialLabel, socialUrl)",
  );

  // Accessible feedback & live regions
  assert.ok(
    formContent.includes('role="status"') ||
      formContent.includes('aria-live="polite"'),
    "Form must include an accessible status / live feedback region",
  );
});

test("F. Public site settings model and defensive parsing", async () => {
  const publicDataPath = path.join(ROOT, "src/lib/public-data.ts");
  assert.ok(fs.existsSync(publicDataPath), "src/lib/public-data.ts must exist");

  const content = fs.readFileSync(publicDataPath, "utf8");

  // Verify PublicSiteSocialLink interface
  assert.ok(
    content.includes("export interface PublicSiteSocialLink"),
    "Must export PublicSiteSocialLink interface",
  );

  // Verify social_links in PublicSiteSettings
  assert.ok(
    content.includes("social_links: PublicSiteSocialLink[]"),
    "PublicSiteSettings must include social_links: PublicSiteSocialLink[]",
  );

  // Verify defensive parsing of social links in getPublicSiteSettings
  assert.ok(
    content.includes("Array.isArray(data.social_links)"),
    "getPublicSiteSettings must check if social_links is an array",
  );
  assert.ok(
    content.includes('parsed.protocol !== "https:"'),
    "getPublicSiteSettings must filter for HTTPS-only URLs defensively",
  );
});

test("G. Public shell, header, footer, and disclaimer settings integration", async () => {
  const shellPath = path.join(ROOT, "src/components/site/public-shell.tsx");
  const headerPath = path.join(ROOT, "src/components/site/site-header.tsx");
  const footerPath = path.join(ROOT, "src/components/site/site-footer.tsx");
  const disclaimerPath = path.join(
    ROOT,
    "src/components/public/medical-disclaimer.tsx",
  );

  const shellContent = fs.readFileSync(shellPath, "utf8");
  const headerContent = fs.readFileSync(headerPath, "utf8");
  const footerContent = fs.readFileSync(footerPath, "utf8");
  const disclaimerContent = fs.readFileSync(disclaimerPath, "utf8");

  // Shell passes settings to header and footer
  assert.ok(
    shellContent.includes("getPublicSiteSettings"),
    "PublicShell must load public site settings",
  );
  assert.ok(
    shellContent.includes("siteTitle={settings.site_title}") ||
      shellContent.includes("settings.site_title"),
    "PublicShell must pass site_title",
  );

  // Header accepts and displays siteTitle and tagline
  assert.ok(
    headerContent.includes("siteTitle"),
    "SiteHeader must accept siteTitle prop",
  );

  // Footer renders dynamic identity and structured social links
  assert.ok(
    footerContent.includes("siteTitle"),
    "SiteFooter must accept siteTitle prop",
  );
  assert.ok(
    footerContent.includes("socialLinks"),
    "SiteFooter must accept socialLinks prop",
  );
  assert.ok(
    footerContent.includes("socialLinks.map"),
    "SiteFooter must render mapped social links when present",
  );

  // Disclaimer accepts dynamic disclaimerText
  assert.ok(
    disclaimerContent.includes("disclaimerText"),
    "MedicalDisclaimer must support disclaimerText prop",
  );
});

test("H. Admin portfolio data helper published-only contract", async () => {
  const portfolioHelperPath = path.join(ROOT, "src/lib/admin/portfolio.ts");
  assert.ok(
    fs.existsSync(portfolioHelperPath),
    "src/lib/admin/portfolio.ts must exist",
  );

  const content = fs.readFileSync(portfolioHelperPath, "utf8");

  // Must select explicit columns (No SELECT *)
  assert.ok(
    content.includes(
      "id, title, slug, status, published_at, updated_at, is_featured, is_portfolio_featured, categories(name)",
    ),
    "Must explicitly select published article columns for portfolio admin",
  );
  assert.ok(
    !content.includes('select("*")') && !content.includes("select('*')"),
    "Must not use SELECT * in portfolio helper",
  );

  // Must query status = 'published'
  assert.ok(
    content.includes('.eq("status", "published")') ||
      content.includes(".eq('status', 'published')"),
    "Must enforce status = 'published' filter in portfolio helper",
  );

  // Must order by published_at DESC
  assert.ok(
    content.includes('order("published_at", { ascending: false'),
    "Must sort published articles newest first by published_at DESC",
  );

  // Must not use service role
  assert.ok(
    !content.includes("service_role") && !content.includes("SERVICE_ROLE"),
    "Must not use service role in portfolio helper",
  );
});

test("I. Portfolio featuring Server Action security, business fields only, and generic error contract", async () => {
  const portfolioActionsPath = path.join(
    ROOT,
    "src/app/admin/portfolio/actions.ts",
  );
  assert.ok(
    fs.existsSync(portfolioActionsPath),
    "src/app/admin/portfolio/actions.ts must exist",
  );

  const content = fs.readFileSync(portfolioActionsPath, "utf8");

  // Admin authentication guard
  assert.ok(
    content.includes("await requireAdmin()"),
    "Portfolio actions must enforce requireAdmin()",
  );

  // Toggle portfolio featured action
  assert.ok(
    content.includes("togglePortfolioFeaturedAction"),
    "Must export togglePortfolioFeaturedAction",
  );
  assert.ok(
    content.includes('.eq("status", "published")') ||
      content.includes(".eq('status', 'published')"),
    "togglePortfolioFeaturedAction must enforce status = 'published' update filter",
  );
  assert.ok(
    content.includes('revalidatePath("/admin/portfolio")') &&
      content.includes('revalidatePath("/portfolio")'),
    "togglePortfolioFeaturedAction must revalidate /admin/portfolio and /portfolio",
  );

  // Payload discipline: must only update is_portfolio_featured, no explicit updated_at or status
  assert.ok(
    !content.includes("updated_at:"),
    "togglePortfolioFeaturedAction must not write updated_at; database trigger owns it",
  );

  // Generic error guard: do not leak raw backend details
  assert.ok(
    !content.includes("${error.message}"),
    "Portfolio actions must not interpolate raw error.message into error strings",
  );
  assert.ok(
    content.includes("Unable to update Selected Writing right now."),
    "Must use generic user-safe error message for portfolio toggle",
  );
});

test("J. Lead featured article Server Action, RPC invocation, and generic error contract", async () => {
  const portfolioActionsPath = path.join(
    ROOT,
    "src/app/admin/portfolio/actions.ts",
  );
  const content = fs.readFileSync(portfolioActionsPath, "utf8");

  assert.ok(
    content.includes("setLeadFeaturedArticleAction"),
    "Must export setLeadFeaturedArticleAction",
  );
  assert.ok(
    content.includes('rpc("set_featured_article"'),
    "Must invoke set_featured_article RPC",
  );
  assert.ok(
    content.includes('revalidatePath("/admin/portfolio")') &&
      content.includes('revalidatePath("/")') &&
      content.includes('revalidatePath("/blog")'),
    "setLeadFeaturedArticleAction must revalidate /admin/portfolio, /, and /blog",
  );

  // Generic error guard: do not leak raw backend details
  assert.ok(
    content.includes("Unable to update the lead article right now."),
    "Must use generic user-safe error message for lead article update",
  );
});

test("K. Admin portfolio workspace UI contract", async () => {
  const portfolioPagePath = path.join(ROOT, "src/app/admin/portfolio/page.tsx");
  assert.ok(
    fs.existsSync(portfolioPagePath),
    "src/app/admin/portfolio/page.tsx must exist",
  );

  const content = fs.readFileSync(portfolioPagePath, "utf8");

  // Security and robots metadata
  assert.ok(
    content.includes("await requireAdmin()"),
    "Admin portfolio page must enforce requireAdmin()",
  );
  assert.ok(
    content.includes("index: false") && content.includes("follow: false"),
    "Admin portfolio page must specify robots: { index: false, follow: false }",
  );

  // Lead article section
  assert.ok(
    content.includes("setLeadFeaturedArticleAction"),
    "Must contain lead article update form",
  );
  assert.ok(
    content.includes("lead-article-select") ||
      content.includes('name="articleId"'),
    "Must contain lead article selection dropdown",
  );

  // Selected writing section
  assert.ok(
    content.includes("togglePortfolioFeaturedAction"),
    "Must contain toggle portfolio featured form for articles",
  );
  assert.ok(
    content.includes("Selected Writing (Curated Portfolio)"),
    "Must contain Selected Writing curation section",
  );
});

test("L. Stage-9 scope boundary guard", async () => {
  // 1. Verify no reader-auth files exist
  const files = [
    "src/app/reader",
    "src/app/auth/reader",
    "src/lib/reader-auth.ts",
  ];
  for (const f of files) {
    assert.ok(
      !fs.existsSync(path.join(ROOT, f)),
      `Forbidden reader-auth artifact found: ${f}`,
    );
  }

  // 2. Verify no drag-and-drop or separate portfolio tables
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
  );
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  assert.ok(
    !deps["@dnd-kit/core"] && !deps["react-beautiful-dnd"],
    "Must not install drag-and-drop libraries in Stage 9",
  );

  // 3. Verify no email-sending provider installed
  assert.ok(
    !deps["resend"] && !deps["@sendgrid/mail"] && !deps["nodemailer"],
    "Must not install email dispatch libraries in Stage 9",
  );
});

test("M. Admin empty settings state and nullish defaultValue semantics", async () => {
  const formComponentPath = path.join(
    ROOT,
    "src/components/admin/site-settings-form.tsx",
  );
  const content = fs.readFileSync(formComponentPath, "utf8");

  // Verify form uses nullish coalescing to empty string, NOT fallback copy
  assert.ok(
    content.includes('defaultValue={initialSettings?.site_title ?? ""}'),
    "site_title input must start empty when no settings exist",
  );
  assert.ok(
    content.includes('defaultValue={initialSettings?.tagline ?? ""}'),
    "tagline input must start empty when null",
  );
  assert.ok(
    content.includes('defaultValue={initialSettings?.homepage_intro ?? ""}'),
    "homepage_intro input must start empty when null",
  );
  assert.ok(
    content.includes('defaultValue={initialSettings?.disclaimer_text ?? ""}'),
    "disclaimer_text input must start empty when null",
  );
  assert.ok(
    content.includes(
      'defaultValue={initialSettings?.default_seo_description ?? ""}',
    ),
    "default_seo_description input must start empty when null",
  );

  // Ensure no accidental fallback copy injection into defaultValues
  assert.ok(
    !content.includes(
      'defaultValue={initialSettings?.site_title || "Marie Medere"}',
    ),
    "Must not inject default string as defaultValue for site_title",
  );
  assert.ok(
    !content.includes(
      "defaultValue={\n              initialSettings?.tagline ||",
    ),
    "Must not inject fallback tagline into defaultValue",
  );
});

test("N. Character counters start at 0 when settings are empty or null", async () => {
  const formComponentPath = path.join(
    ROOT,
    "src/components/admin/site-settings-form.tsx",
  );
  const content = fs.readFileSync(formComponentPath, "utf8");

  assert.ok(
    content.includes("initialSettings?.site_title?.length || 0"),
    "Title length counter must initialize from persisted length or 0",
  );
  assert.ok(
    content.includes("initialSettings?.tagline?.length || 0"),
    "Tagline length counter must initialize from persisted length or 0",
  );
  assert.ok(
    content.includes("initialSettings?.homepage_intro?.length || 0"),
    "Intro length counter must initialize from persisted length or 0",
  );
  assert.ok(
    content.includes("initialSettings?.disclaimer_text?.length || 0"),
    "Disclaimer length counter must initialize from persisted length or 0",
  );
  assert.ok(
    content.includes("initialSettings?.default_seo_description?.length || 0"),
    "SEO desc length counter must initialize from persisted length or 0",
  );
});

test("O. Disclaimer propagation across approved public surfaces and admin preview while /disclaimer remains independent", async () => {
  // About and Portfolio intentionally omit standalone compact disclaimer
  // blocks, while still receiving shared site settings through PublicShell.
  const shellManagedPages = [
    "src/app/portfolio/page.tsx",
    "src/app/about/page.tsx",
  ];

  for (const relPath of shellManagedPages) {
    const fullPath = path.join(ROOT, relPath);

    assert.ok(fs.existsSync(fullPath), `${relPath} must exist`);

    const pageContent = fs.readFileSync(fullPath, "utf8");

    assert.ok(
      pageContent.includes("<PublicShell") &&
        pageContent.includes("settings={settings}"),
      `${relPath} must pass live settings to PublicShell`,
    );
  }

  // Homepage retains its compact dynamic disclaimer.
  const homepagePath = path.join(ROOT, "src/app/page.tsx");
  const homepageContent = fs.readFileSync(homepagePath, "utf8");

  assert.ok(
    homepageContent.includes("<MedicalDisclaimer") &&
      homepageContent.includes("disclaimerText={settings.disclaimer_text}"),
    "Homepage must pass the live disclaimer to MedicalDisclaimer",
  );

  // The article reading layout delegates disclaimer rendering to its
  // support rail while preserving the live settings value.
  const articlePagePath = path.join(ROOT, "src/app/blog/[slug]/page.tsx");
  const articlePageContent = fs.readFileSync(articlePagePath, "utf8");

  assert.ok(
    articlePageContent.includes("<ArticleSupportRail") &&
      articlePageContent.includes("disclaimerText={settings.disclaimer_text}"),
    "Article page must pass the live disclaimer to ArticleSupportRail",
  );

  // Contact retains the explicit inline medical disclaimer because the
  // inquiry form is the relevant contextual surface for that warning.
  const contactPagePath = path.join(ROOT, "src/app/contact/page.tsx");
  const contactPageContent = fs.readFileSync(contactPagePath, "utf8");

  assert.ok(
    contactPageContent.includes("<MedicalDisclaimer") &&
      contactPageContent.includes("disclaimerText={settings.disclaimer_text}"),
    "Contact page must pass the live disclaimer to MedicalDisclaimer",
  );

  // Verify /disclaimer page remains independent
  const disclaimerPagePath = path.join(ROOT, "src/app/disclaimer/page.tsx");
  assert.ok(
    fs.existsSync(disclaimerPagePath),
    "src/app/disclaimer/page.tsx must exist",
  );
  const disclaimerContent = fs.readFileSync(disclaimerPagePath, "utf8");
  assert.ok(
    !disclaimerContent.includes("<MedicalDisclaimer"),
    "The full /disclaimer page must remain independent and not render MedicalDisclaimer component",
  );

  // Verify admin preview modal receives and uses dynamic disclaimerText
  const previewModalPath = path.join(
    ROOT,
    "src/components/admin/editor/article-preview-modal.tsx",
  );
  assert.ok(
    fs.existsSync(previewModalPath),
    "src/components/admin/editor/article-preview-modal.tsx must exist",
  );
  const previewModalContent = fs.readFileSync(previewModalPath, "utf8");
  assert.ok(
    previewModalContent.includes("disclaimerText"),
    "ArticlePreviewModal must accept disclaimerText prop",
  );
  assert.ok(
    previewModalContent.includes(
      "<MedicalDisclaimer disclaimerText={disclaimerText}",
    ),
    "ArticlePreviewModal must render MedicalDisclaimer with disclaimerText prop",
  );

  // Verify article-editor passes previewDisclaimerText into ArticlePreviewModal
  const editorPath = path.join(
    ROOT,
    "src/components/admin/editor/article-editor.tsx",
  );
  const editorContent = fs.readFileSync(editorPath, "utf8");
  assert.ok(
    editorContent.includes("previewDisclaimerText"),
    "ArticleEditor must accept previewDisclaimerText prop",
  );
  assert.ok(
    editorContent.includes("disclaimerText={previewDisclaimerText}"),
    "ArticleEditor must pass disclaimerText={previewDisclaimerText} to ArticlePreviewModal",
  );

  // Verify BOTH admin article server pages load settings and pass previewDisclaimerText
  const adminNewPagePath = path.join(
    ROOT,
    "src/app/admin/articles/new/page.tsx",
  );
  const adminIdPagePath = path.join(
    ROOT,
    "src/app/admin/articles/[id]/page.tsx",
  );

  const adminNewContent = fs.readFileSync(adminNewPagePath, "utf8");
  const adminIdContent = fs.readFileSync(adminIdPagePath, "utf8");

  assert.ok(
    adminNewContent.includes("getPublicSiteSettings"),
    "New article admin page must call getPublicSiteSettings()",
  );
  assert.ok(
    adminNewContent.includes(
      "previewDisclaimerText={settings.disclaimer_text}",
    ),
    "New article admin page must pass previewDisclaimerText to ArticleEditor",
  );

  assert.ok(
    adminIdContent.includes("getPublicSiteSettings"),
    "Edit article admin page must call getPublicSiteSettings()",
  );
  assert.ok(
    adminIdContent.includes("previewDisclaimerText={settings.disclaimer_text}"),
    "Edit article admin page must pass previewDisclaimerText to ArticleEditor",
  );
});

test("P. Stage-9D test fixture guard: no invented client URLs in test suites", async () => {
  const currentTestFilePath = path.join(
    ROOT,
    "tests/stage9-phase9d-settings-portfolio.test.mjs",
  );
  const content = fs.readFileSync(currentTestFilePath, "utf8");
  const suitesContent = content.slice(0, content.indexOf('test("P.'));

  const forbiddenPrefix1 = "linkedin" + ".com/in/mariemedere";
  const forbiddenPrefix2 = "researchgate" + ".net/profile/mariemedere";

  assert.ok(
    !suitesContent.includes(forbiddenPrefix1),
    "Must not use invented client LinkedIn URL as test fixture in test suites",
  );
  assert.ok(
    !suitesContent.includes(forbiddenPrefix2),
    "Must not use invented client ResearchGate URL as test fixture in test suites",
  );
});

test("Q. Admin article preview profile fidelity and elimination of fabricated credentials", async () => {
  const previewModalPath = path.join(
    ROOT,
    "src/components/admin/editor/article-preview-modal.tsx",
  );
  const previewModalContent = fs.readFileSync(previewModalPath, "utf8");

  // Verify preview modal accepts and uses PublicProfile prop
  assert.ok(
    previewModalContent.includes("profile: PublicProfile"),
    "ArticlePreviewModal must accept profile: PublicProfile in ArticlePreviewProps",
  );
  assert.ok(
    previewModalContent.includes("<AuthorBlock profile={profile}"),
    "ArticlePreviewModal must pass profile prop to AuthorBlock",
  );

  // Verify hardcoded defaultProfile is completely removed
  assert.ok(
    !previewModalContent.includes("defaultProfile"),
    "ArticlePreviewModal must not define or use defaultProfile",
  );

  // Verify no fabricated clinical credentials / profile strings
  const forbiddenTokens = [
    "Clinical " + "pharmacist",
    "specializing in " + "evidence-based medicine",
    "pharmac" + "ology",
    "clinical research " + "synthesis",
  ];
  for (const token of forbiddenTokens) {
    assert.ok(
      !previewModalContent.includes(token),
      `ArticlePreviewModal must not contain fabricated string: ${token}`,
    );
  }

  // Verify ArticleEditor receives and passes previewProfile
  const editorPath = path.join(
    ROOT,
    "src/components/admin/editor/article-editor.tsx",
  );
  const editorContent = fs.readFileSync(editorPath, "utf8");
  assert.ok(
    editorContent.includes("previewProfile: PublicProfile"),
    "ArticleEditor must accept previewProfile prop",
  );
  assert.ok(
    editorContent.includes("profile={previewProfile}"),
    "ArticleEditor must pass profile={previewProfile} to ArticlePreviewModal",
  );

  // Verify BOTH admin article pages load public profile server-side and pass to ArticleEditor
  const adminNewPagePath = path.join(
    ROOT,
    "src/app/admin/articles/new/page.tsx",
  );
  const adminIdPagePath = path.join(
    ROOT,
    "src/app/admin/articles/[id]/page.tsx",
  );

  const adminNewContent = fs.readFileSync(adminNewPagePath, "utf8");
  const adminIdContent = fs.readFileSync(adminIdPagePath, "utf8");

  assert.ok(
    adminNewContent.includes("getPublicProfile"),
    "New article admin page must call getPublicProfile()",
  );
  assert.ok(
    adminNewContent.includes("previewProfile={profile}"),
    "New article admin page must pass previewProfile={profile} to ArticleEditor",
  );

  assert.ok(
    adminIdContent.includes("getPublicProfile"),
    "Edit article admin page must call getPublicProfile()",
  );
  assert.ok(
    adminIdContent.includes("previewProfile={profile}"),
    "Edit article admin page must pass previewProfile={profile} to ArticleEditor",
  );
});

test("R. Client-boundary regression: preview modal does not query database for profile/settings", async () => {
  const previewModalPath = path.join(
    ROOT,
    "src/components/admin/editor/article-preview-modal.tsx",
  );
  const previewModalContent = fs.readFileSync(previewModalPath, "utf8");

  // Must not import server data loaders in client component
  assert.ok(
    !previewModalContent.includes("getPublicProfile") &&
      !previewModalContent.includes("getPublicSiteSettings"),
    "ArticlePreviewModal client component must not import server data fetching functions",
  );

  // Must not perform client database queries against profiles or site_settings
  assert.ok(
    !previewModalContent.includes('.from("profiles")') &&
      !previewModalContent.includes(".from('profiles')"),
    "ArticlePreviewModal must not query profiles table directly from browser",
  );
  assert.ok(
    !previewModalContent.includes('.from("site_settings")') &&
      !previewModalContent.includes(".from('site_settings')"),
    "ArticlePreviewModal must not query site_settings table directly from browser",
  );
});
