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

test("B. Site settings core validation schema rules", async () => {
  // Valid core settings
  const valid = siteSettingsCoreSchema.safeParse({
    site_title: "Marie Medere",
    tagline: "Medical Writing Portfolio",
    homepage_intro: "Evidence-based writing intro.",
    disclaimer_text: "Educational purposes only.",
    default_seo_description: "Medical Writing Portfolio & Educational Blog.",
  });
  assert.ok(valid.success, "Valid core settings should pass validation");
  if (valid.success) {
    assert.equal(valid.data.site_title, "Marie Medere");
    assert.equal(valid.data.tagline, "Medical Writing Portfolio");
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
    site_title: "Valid Title",
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

test("C. Social links validation, HTTPS requirement, and partial-row rejection", async () => {
  // Valid HTTPS links
  const validResult = validateSocialLinks([
    { label: "LinkedIn", url: "https://linkedin.com/in/mariemedere" },
    {
      label: "ResearchGate",
      url: "https://researchgate.net/profile/mariemedere",
    },
  ]);
  assert.equal(validResult.errors.length, 0, "Valid HTTPS links must pass");
  assert.equal(validResult.links.length, 2);
  assert.equal(validResult.links[0].label, "LinkedIn");
  assert.equal(validResult.links[0].url, "https://linkedin.com/in/mariemedere");

  // Blank rows should be omitted without error
  const blankRowsResult = validateSocialLinks([
    { label: "LinkedIn", url: "https://linkedin.com/in/mariemedere" },
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
    { label: "LinkedIn", url: "  " },
  ]);
  assert.ok(
    missingUrlResult.errors.length > 0,
    "Partial row (missing URL) must produce a validation error",
  );

  // Partial row (URL without label) should fail
  const missingLabelResult = validateSocialLinks([
    { label: "  ", url: "https://linkedin.com" },
  ]);
  assert.ok(
    missingLabelResult.errors.length > 0,
    "Partial row (missing label) must produce a validation error",
  );

  // HTTP URL should be rejected (HTTPS only)
  const insecureUrlResult = validateSocialLinks([
    { label: "Insecure Link", url: "http://insecure.example.com" },
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

test("D. Settings Server Action security and revalidation contract", async () => {
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

  // Verify upsert of singleton id = 1
  assert.ok(
    content.includes("id: 1"),
    "Must enforce upsert of singleton record with id: 1",
  );
  assert.ok(
    content.includes('onConflict: "id"') ||
      content.includes("onConflict: 'id'"),
    "Must specify onConflict: id for safe singleton upsert",
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

test("I. Portfolio featuring Server Action security and invariants", async () => {
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
});

test("J. Lead featured article Server Action and RPC invocation", async () => {
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
