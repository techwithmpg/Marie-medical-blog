# Stage 6 — Article Reading & Discovery Handoff

## Stage metadata

- **Stage:** Stage 6 — Article Reading & Discovery
- **Final Status:** COMPLETE / GATE PASS / AWAITING PROJECT-OWNER MERGE APPROVAL
- **Canonical Base:** `7d4af1583473d4851f9bf165e21b0b21e0c53570`
- **Approved Active Branch:** `stage/06-article-discovery`
- **Current Approved Branch Head:** `2bc64e5ef8739401feb8013dda5da94f813986c8`

### Implementation and Governance Commit Provenance

1. **Stage Authorization & Pre-Implementation Design Freeze:** `a94e2e676777f45a1d57eda19bccc193121fee90`
2. **Pre-Implementation Design Hardening:** `eb21ca638f81ee9e15f42f6c67052d5029725bb7`
3. **Initial Feature Implementation:** `94dcc614154f107cf271c4a79f9b4872d8a94e02`
4. **First External Review Correction:** `b84b4c5e3578952a52008d79b298b9b515d8d8c5`
5. **Final Review Micro-Correction:** `e6fdad81f738b3eedacd0b1eb098584bd5fe614f`
6. **Governance Alignment Commit:** `55c10cc7501b685129cc56d69a5128ac124dc603`
7. **Final Visual-Control Correction:** `dd12e1c527c757aef1b4127905caaa1dbac5062a`
8. **Governance Record After Visual Correction:** `2bc64e5ef8739401feb8013dda5da94f813986c8`

---

## 1. Objective Completed

Delivered the complete public-facing article reading, discovery, topic categorization, and reference ledger presentation for Marie Medical Blog under the Evidence Folio design system:

- **Article Archive (`/blog`):** Primary published article discovery hub featuring lead featured story hero (Folio 01), category topic filter bar, search interface with sanitized query handling, strict positive-integer pagination (6 supporting articles per page), and authentic empty states.
- **Article Detail (`/blog/[slug]`):** Evidence Folio long-form article view with single H1 heading hierarchy, publication metadata (published date, estimated reading time, category imprint), responsive reading measure, safe ProseMirror JSON article rendering, structured Reference Ledger with verified data presentation, author context block, medical disclaimer, and category-matched related writing.
- **Topic Archive (`/topics/[slug]`):** Category-filtered article view with category title/description, paginated supporting cards, and truthful empty states when no articles exist.
- **Public Integration:** Published articles seamlessly feed the Homepage (`/`) "Recent Writing" section, Selected Writing (`/portfolio`) featured writing list, and SiteHeader / MobileNav navigation ("Articles").
- **Public Shell Integrity:** PublicShell layout integration (`src/app/blog/layout.tsx` and `src/app/topics/layout.tsx`) preserving single `<main id="main-content">`, skip-to-content accessibility links, consistent gutters, and site footer.

---

## 2. Architecture & Implementation

- **Server-Side Data Access Layer (`src/lib/public-articles.ts`):** High-performance server-side data fetching functions using `@supabase/ssr` with anonymous public credentials. Every public query explicitly enforces `status = 'published'`.
- **Indexable Server Components:** All article reading and discovery routes execute as React Server Components, delivering fully formed semantic HTML to search engines and visitors without unnecessary client-side data waterfalls or hydration dependencies.
- **Safe JSON Rich-Text Renderer (`src/components/public/article-typography.tsx`):** Custom read-only ProseMirror/Tiptap document tree walker that produces native React JSX elements. Strictly operates with zero `dangerouslySetInnerHTML` usage and validates URL protocols (`http:`, `https:`, `mailto:`) on all links.
- **Reading Time Calculation:** Deterministic calculation based on standard 200 WPM text traversal across all text nodes in the article body JSON.
- **No Unapproved Packages:** Implemented purely within the frozen tech stack (Next.js 16 App Router, Tailwind CSS v4, TypeScript, Supabase SSR) without introducing editor packages or third-party UI libraries into Stage 6.

---

## 3. Security & Access Control (SEC-01 through SEC-10)

Every public query in `src/lib/public-articles.ts` and all route handlers strictly enforce `status = 'published'`:

- **Anonymous Public Access:** Published articles return `200 OK`. Draft articles return `404 Not Found`. Archived articles return `404 Not Found`.
- **Authenticated Admin on Public Routes:** Accessing `/blog/[slug]` for a draft or archived article while logged in as an admin continues to return `404 Not Found` (admin drafting/preview is deferred to Stage 7 & 8 and will not leak through public endpoints).
- **Search & Filter Boundaries:** Keyword searches, topic archives, related writing queries, homepage feeds, and portfolio listings strictly return `published` records only.
- **RLS & Credentials:** No Row Level Security policies were weakened. Service-role credentials remain strictly server-only and are never exposed or consumed in public routes.

---

## 4. Search System

- **URL-Driven State:** Search queries operate via standard GET parameters (`/blog?q=...`), ensuring full shareability, back/forward cache compatibility, and bookmarking.
- **Search Query Sanitization (`sanitizeSearchQuery`):** Input is NFKC-normalized, trimmed, capped at 100 characters, and stripped of unsafe PostgREST / SQL filter pattern characters (`[(),"\x5c%*_]`).
- **Sanitization-State Regressions Verified:**
  - `q=%25`: Stripped characters resolve to an empty query; the page renders the standard unfiltered archive (`"Archive Entries"` heading, single Folio 01 lead hero, and supporting cards) without triggering a false `"Search Results"` state.
  - `q=%25Plain%25`: Stripped characters are removed while preserving `"Plain"`, correctly rendering the `"Search Results"` view.

---

## 5. Pagination & Deduplication

- **Supporting Card Page Size:** 6 articles per page with deterministic ordering (`published_at DESC, created_at DESC, id DESC`).
- **Lead Hero Deduplication:** The lead featured article on Page 1 is excluded from the supporting list on Page 1 and across all subsequent pagination pages (Page 2, 3, etc.).
- **Folio Number Continuity:** Folio numbering starts at `01` for the lead article, continues `02`–`07` for Page 1 supporting entries, and resumes seamlessly at `08` on Page 2.
- **Strict Integer Page Parsing:** Handled via `Number.isInteger(Number(rawPage)) && Number(rawPage) > 0 ? Number(rawPage) : 1`. Malformed or non-integer inputs (`page=2abc`, `page=1.5`, `page=0`, `page=-1`, `page=abc`) safely resolve to Page 1.

---

## 6. Content Rendering & Reference Ledger

- **Supported Document Nodes:** `doc`, `paragraph`, `heading` (levels 2 and 3, rendered with single page H1 hierarchy preserved), `bulletList`, `orderedList`, `listItem`, `blockquote`, `horizontalRule`, `text`.
- **Supported Text Marks:** `bold`, `italic`, `strike`, `code`, `link`.
- **Reference Ledger (`src/components/evidence/reference-ledger.tsx`):** Structured reference citation component displaying index numbers, source names, citation details, and external links with verified security attributes (`rel="noopener noreferrer"`). Gracefully renders when reference entries contain partial data.
- **Author & Disclaimer Context:** Fixed author biography and prominent medical disclaimer banner attached to every article detail view.

---

## 7. Evidence Folio UI Design System Fidelity

- **Typography Tokens:** Newsreader serif for editorial titles and headings; Source Sans 3 for clean UI labels, metadata, and body text.
- **Curated Palette:** Warm parchment background (`#F6F1E8`), crisp paper cards (`#FFFDF9`), dense ink text (`#242321`), muted secondary ink (`#5E5953`), terracotta oxide accents (`#7B3F35`), sage badges (`#3F5E52`), and slate focus rings (`#265D7A`).
- **Evidence Folio Signature Devices:** Topic Imprints, Folio Markers, Split Rules, Reference Ledger, and restrained editorial card borders.
- **Touch Targets & Accessibility:** All primary interactive controls (search input, submit button, clear button, topic filter pills, pagination buttons) meet or exceed the 44px minimum touch target height. Active topic pills expose `aria-current="page"`.

---

## 8. Visual & Responsive Verification

Verified via true Playwright viewport emulation on the Next.js production build (`next start`) with zero horizontal overflow:

- **Desktop (1440 × 900):** PASS (0px overflow)
- **Tablet (1024 × 768):** PASS (0px overflow)
- **Mobile (390 × 844):** PASS (0px overflow; `innerWidth = clientWidth = scrollWidth = 390px`)
- **Narrow Mobile (320 × 640):** PASS (0px overflow; `innerWidth = clientWidth = scrollWidth = 320px`)

### Computed Style Proof for Discovery Controls
- **Search Submit Button:** `backgroundColor = rgb(123, 63, 53)` (`oxide`), `color = rgb(246, 241, 232)` (`parchment`), height = `44px`.
- **Active Topic Filter ("All Articles" / Selected Topic):** `backgroundColor = rgb(123, 63, 53)` (`oxide`), `color = rgb(246, 241, 232)` (`parchment`), `aria-current = "page"`, height = `44px`.
- **Inactive Topic Filters:** `backgroundColor = rgb(255, 253, 249)` (`paper`), `color = rgb(36, 35, 33)` (`ink`), `borderColor = rgb(145, 133, 121)` (`control-border`), height = `44px`.

### Evidence Bundles Generated Outside Git
- Full 29-screenshot gate evidence bundle: `E:\stage6-gate-evidence-55c10cc.zip` (with `EVIDENCE-MANIFEST.md` and `SHA256SUMS.txt`).
- Targeted 8-screenshot control-fix evidence bundle: `E:\stage6-control-fix-evidence.zip`.

---

## 9. Automated Quality Gates

- **Database Reset (`npx supabase db reset`):** PASS (Local test fixtures cleanly loaded)
- **pgTAP Test Suite (`npx supabase test db`):** PASS (8 test files, 95 tests, 0 failures)
- **TypeScript Compilation (`npm run typecheck`):** PASS (0 errors)
- **ESLint (`npm run lint`):** PASS (0 errors, 0 warnings)
- **Prettier Format Check (`npm run format:check`):** PASS (All matched files use Prettier code style)
- **Production Build (`npm run build`):** PASS (Next.js 16.3.2 Turbopack optimized build)
- **Git Diff Hygiene (`git diff --check`):** PASS (0 whitespace or syntax anomalies)

---

## 10. Database, Environment & Dependency Changes

- **Database Changes:** NONE. Reused existing Stage-3 schema (`public.articles`, `public.categories`, `public.article_references`, `public.profiles`, `public.site_settings`). Local synthetic fixtures in `supabase/seed.sql` remain development-only.
- **Environment Changes:** NONE. Uses existing Supabase public URL and publishable key.
- **Dependencies Added:** NONE. (`package.json` and `package-lock.json` remain unchanged).

---

## 11. Known Limitations & Deferred Scope

1. **Writer Dashboard & Editor (Stage 7 & 8):** No article authoring, editing, Tiptap WYSIWYG editor, draft saving, publishing, or unpublishing features exist in Stage 6.
2. **Comment Submission & Moderation (Stage 9):** No reader comment submission or public comment display UI exists in Stage 6.
3. **Contact Submission & Inbox (Stage 9):** The contact form remains a client-side shell with neutral notice; database persistence and inbox administration activate in Stage 9.
4. **Comprehensive SEO & Social Metadata (Stage 10):** Standard OpenGraph/Twitter card enhancements, XML sitemaps, RSS feeds, and JSON-LD structured data are deferred to Stage 10.
5. **Synthetic Local Content:** Local database fixtures are synthetic samples for testing and layout verification; production publication will feature Marie's authored articles upon project deployment.

---

## 12. Next Stage Readiness

- **Stage 6 Status:** COMPLETE / GATE PASS
- **Stage 6 Merge Status:** AWAITING PROJECT-OWNER MERGE APPROVAL
- **Active Working Branch:** `stage/06-article-discovery`
- **Approved Branch Head:** `2bc64e5ef8739401feb8013dda5da94f813986c8`
- **Stage 7 Status:** NOT AUTHORIZED (DO NOT START STAGE 7)
