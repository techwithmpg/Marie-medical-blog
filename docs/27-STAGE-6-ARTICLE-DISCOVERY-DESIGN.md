# 27 — Stage 6 Article Reading & Discovery Design

**Status:** FROZEN PRE-IMPLEMENTATION DESIGN (HARDENED)
**Stage:** Stage 6 — Article Reading & Discovery
**Authorization:** APPROVED BY PROJECT OWNER — 2026-08-25
**Canonical Base:** `7d4af1583473d4851f9bf165e21b0b21e0c53570`
**Active Working Branch:** `stage/06-article-discovery`

---

## 1. Stage Objective & Scope

Stage 6 delivers the public article discovery and reading experience for the Marie Medere Medical Writing Portfolio & Educational Blog under the Evidence Folio design system.

### Authorized Stage-6 Routes & Integrations

- **`/blog`** — Published article listing, topic filtering, simple search, deterministic pagination, and featured/latest lead article presentation.
- **`/blog/[slug]`** — Evidence Folio long-form article view with Reference Ledger, author context, medical disclaimer, and related writing.
- **`/topics/[slug]`** — Topic/category-filtered published article listing with authentic empty states.
- **Homepage (`/`) Integration** — Replace static empty states with real published articles (featured and latest writing) when available.
- **Selected Writing (`/portfolio`) Integration** — Populate portfolio writing samples from published articles where `is_portfolio_featured = true`.
- **Public Navigation** — Add "Articles" (`/blog`) link to `SiteHeader` and `MobileNav`.

### Out-of-Scope Boundaries (Stage 6 Exclusions)

- **NO `/search` separate route:** Search lives directly within `/blog` via URL search parameters.
- **NO Tiptap editor or writer dashboard:** Stage 7 & 8 own article creation, editing, drafts, and administrative tooling.
- **NO comment display or submission:** Stage 9 owns reader comments and moderation.
- **NO contact message persistence/inbox:** Stage 9 owns contact inbox and API handling.
- **NO comprehensive SEO/social automation:** Automated sitemap, `robots.txt`, dynamic Open Graph images, and JSON-LD Article structured data belong to Stage 10.
- **NO reader authentication:** Readers are anonymous public visitors; no reader accounts exist in V1.

---

## 2. Public Data Security & Access Architecture

### A. Critical Security Rule: Explicit `status = 'published'` Filtering

In Postgres and Supabase:
- Anonymous visitors are restricted by RLS to `status = 'published'` on `public.articles`.
- Authenticated administrators have an RLS policy permitting access to all article statuses (`draft`, `published`, `archived`).
- **RULE:** Every public-facing database query must explicitly include `.eq('status', 'published')`.
- **BEHAVIOR:** If an authenticated admin visits a public route (such as `/blog/draft-slug`), the route **must return 404 (`notFound()`)**. Public routes never leak drafts or archived articles, regardless of cookie or auth state.
- **REFERENCES:** `public.article_references` must only be loaded and rendered for verified published articles.
- **SECRETS:** No service-role key or RLS bypass is permitted in public data fetchers.

### B. Public Query Errors vs. False 404s

The data layer strictly differentiates between missing content and infrastructure failures:

1. **`/blog/[slug]`:**
   - **Successful Query + No Published Match:** Invokes `notFound()` to trigger the standard Next.js 404 page.
   - **Database / Network / Query Error:** Must **NOT** invoke `notFound()`. Throws a controlled server error to render the application error boundary (`error.tsx`), indicating temporary service unavailability.
2. **Listings (`/blog`, `/topics/[slug]`, Search):**
   - **Successful Query + 0 Matches:** Renders an authentic, truthful empty state.
   - **Query / Network Error:** Renders a controlled unavailable message ("Unable to load articles at this time. Please try again later."), avoiding false empty states.
3. **Public Exposure:** Raw database error objects, Postgres codes, and internal stack traces are never exposed to public visitors.

### C. Server-Side Data Layer Types (`src/lib/public-articles.ts`)

Public article data access is centralized in a dedicated server module using Server Components and Supabase server clients (`src/lib/supabase/server.ts`).

```typescript
// Core Data Access Types
export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface PublicArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_path: string | null;
  featured_image_alt: string | null;
  category_id: string | null;
  category: PublicCategory | null;
  published_at: string | null;
  created_at: string;
  is_featured: boolean;
  is_portfolio_featured: boolean;
  reading_time_minutes: number;
}

export interface PublicArticleReference {
  id: string;
  title: string;
  source_name: string; // NOT NULL in database schema
  url: string | null;
  citation_details: string | null;
  sort_order: number;
}

export interface PublicArticleDetail extends PublicArticleSummary {
  content_json: unknown;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
  references: PublicArticleReference[];
}

export interface PublicArticleListResult {
  articles: PublicArticleSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PublicBlogViewData {
  leadArticle: PublicArticleSummary | null;
  isLeadExplicitlyFeatured: boolean;
  articles: PublicArticleSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### D. Data Access API Contract

```typescript
export async function getPublishedArticles(options?: {
  page?: number;
  pageSize?: number;
  topicSlug?: string;
  searchQuery?: string;
  excludeArticleId?: string;
}): Promise<PublicArticleListResult>;

export async function getBlogViewData(options?: {
  page?: number;
  pageSize?: number;
  topicSlug?: string;
  searchQuery?: string;
}): Promise<PublicBlogViewData>;

export async function getPublishedArticleBySlug(
  slug: string
): Promise<PublicArticleDetail | null>;

export async function getFeaturedPublishedArticle(): Promise<PublicArticleSummary | null>;

export async function getLatestPublishedArticles(
  limit?: number
): Promise<PublicArticleSummary[]>;

export async function getPortfolioPublishedArticles(): Promise<PublicArticleSummary[]>;

export async function getRelatedPublishedArticles(
  currentArticleId: string,
  categoryId: string | null,
  limit?: number
): Promise<PublicArticleSummary[]>;

export async function getPublishedCategories(): Promise<PublicCategory[]>;

export async function getCategoryBySlug(
  slug: string
): Promise<PublicCategory | null>;
```

---

## 3. Blog Listing, Lead Deduplication & Pagination (`/blog`)

### A. URL Search Parameters

All filter, search, and pagination state is driven by Next.js search parameters:
- `q`: Search keyword query string (trimmed, sanitized, max 100 characters).
- `topic`: Category/topic slug filter (e.g. `clinical-communications`).
- `page`: 1-indexed page number (default: `1`, minimum: `1`).

### B. Deterministic Ordering Contract

All published article queries enforce strict, deterministic multi-column ordering applied **BEFORE** `.range(from, to)`:
1. `published_at DESC, NULLS LAST`
2. `created_at DESC`
3. `id DESC` (stable tie-break)

In Supabase JS:
```typescript
query = query
  .order('published_at', { ascending: false, nullsFirst: false })
  .order('created_at', { ascending: false })
  .order('id', { ascending: false });
```

### C. Featured vs. Latest Lead Semantics & Deduplication

1. **Lead Selection:**
   - On page 1 of `/blog` when no search (`q`) and no topic filter (`topic`) are active, a dominant lead article is displayed.
   - If an article with `is_featured = true` and `status = 'published'` exists, it is selected as the lead story with the label **"Featured Writing"**.
   - If no article is explicitly featured, the latest published article becomes the lead story with the label **"Latest Writing"** or **"Latest Article"** (never falsely labeled as "Featured").
2. **Deduplication:**
   - The lead article is fetched first.
   - Its ID (`leadArticle.id`) is excluded from the paginated supporting article query (`.neq('id', leadArticle.id)`).
   - Total count and pagination calculations for the supporting grid are computed against this excluded set, ensuring no article appears twice on page 1.
3. **Filtered / Search States:**
   - When a search query or topic filter is active, the separate lead story is omitted; all matching articles render directly in the standard paginated list.

### D. Pagination Parameters

- **Page Size:** 6 articles per page for supporting grids / filtered listings.
- **Controls:** Accessible Previous / Next links preserving active `q` and `topic` parameters.

---

## 4. Search Architecture & Hardened Sanitization Contract

Stage 6 implements literal substring-style search in `title` and `excerpt` without external services or database migrations.

### A. Strict Normalization & Sanitization Pipeline

PostgREST `.or()` filter expressions parse comma-separated field conditions and parentheses. To prevent filter syntax breakage or unintended query logic, user search input must pass through an explicit 7-step sanitization contract:

```typescript
export function sanitizeSearchQuery(raw: string | undefined | null): string {
  if (!raw) return '';

  // 1. Unicode normalize using NFKC
  let normalized = raw.normalize('NFKC');

  // 2. Trim whitespace
  normalized = normalized.trim();

  // 3. Collapse repeated internal whitespace to a single space
  normalized = normalized.replace(/\s+/g, ' ');

  // 4. Limit length to 100 characters
  normalized = normalized.slice(0, 100);

  // 5. Remove PostgREST structural/pattern characters: ( ) , " \ % * _
  normalized = normalized.replace(/[(),"\x5c%*_]/g, '');

  // 6. Trim again after stripping characters
  normalized = normalized.trim();

  // 7. If empty after sanitization, return empty string (search filter ignored)
  return normalized;
}
```

### B. Safe Search Execution

When `safeQuery` is non-empty:
```typescript
query = query
  .eq('status', 'published')
  .or(`title.ilike.%${safeQuery}%,excerpt.ilike.%${safeQuery}%`);
```

---

## 5. Topic / Category Route (`/topics/[slug]`)

1. Resolve category record via `getCategoryBySlug(slug)`.
2. If category does not exist: call `notFound()` to render the 404 boundary.
3. If category exists: fetch published articles via `getPublishedArticles({ topicSlug: slug, page })`.
4. Render topic header with stored category `name` and `description` (no hard-coded synthetic categories).
5. If 0 articles exist: render authentic empty state ("No published articles in this topic yet").

---

## 6. Article Reading Route (`/blog/[slug]`)

### A. Reading Hierarchy

Following the Evidence Folio article contract (`docs/18-UI-IMPLEMENTATION-CONTRACT.md`):

1. **Breadcrumb / Context:** `Home / Articles / [Category Name]`
2. **Topic Imprint:** Category label above headline
3. **Article Title:** Newsreader H1 (`text-3xl md:text-5xl font-serif`)
4. **Excerpt / Deck:** Editorial lead deck (`text-lg md:text-xl text-muted-ink`)
5. **Publication Metadata:** Published date (shown only when `published_at` is non-null), optional updated date, calculated reading time
6. **Featured Media:** Optional image rendered with `featured_image_alt`
7. **Article Body:** Rendered via safe Tiptap JSON read-only renderer (680–720px reading measure)
8. **Reference Ledger:** Numbered source ledger from `public.article_references`
9. **Author Block:** Marie Medere professional author bridge
10. **Medical Disclaimer:** Standalone medical disclaimer banner
11. **Related Writing:** 1–3 strictly related published articles from the same category

### B. 404 Guarantee

If an article is missing, is a draft, or is archived, `/blog/[slug]` unconditionally executes `notFound()`.

---

## 7. Safe Article JSON Renderer (ProseMirror / Tiptap)

### A. Architecture

Stage 6 implements a custom, pure React read-only renderer for `content_json` without adding third-party editor dependencies before Stage 7.

- **Zero `dangerouslySetInnerHTML`:** Every node and text string is rendered as native React elements. React automatically escapes text to prevent XSS.
- **Fail-Safe Processing:** Unknown node types safely render their children or return `null` without crashing the page.
- **Malformed JSON Handling:** If `content_json` is not valid ProseMirror JSON, a controlled editorial fallback message is displayed.

### B. Supported Node Types & Marks

| Node / Mark | Rendered HTML / Component | Styling / Evidence Folio Classes |
|---|---|---|
| `doc` | `<div className="article-body">` | Reading container |
| `paragraph` | `<p>` | `text-[18px] md:text-[19px] leading-[1.65] text-ink mb-6` |
| `heading` (lvl 2) | `<h2>` | `font-serif text-2xl md:text-3xl font-medium text-ink mt-10 mb-4` |
| `heading` (lvl 3) | `<h3>` | `font-serif text-xl md:text-2xl font-medium text-ink mt-8 mb-3` |
| `bulletList` | `<ul>` | `list-disc pl-6 space-y-2 mb-6 text-ink` |
| `orderedList` | `<ol>` | `list-decimal pl-6 space-y-2 mb-6 text-ink` |
| `listItem` | `<li>` | `leading-relaxed` |
| `blockquote` | `<blockquote>` | `border-l-2 border-brand-oxide pl-5 my-6 italic text-muted-ink` |
| `codeBlock` | `<pre><code>` | `bg-subtle-field p-4 rounded text-sm font-mono overflow-x-auto my-6` |
| `horizontalRule` | `<hr>` | `border-t border-subtle-divider my-10` |
| `hardBreak` | `<br>` | Line break |
| `bold` | `<strong>` | `font-semibold text-ink` |
| `italic` | `<em>` | `italic` |
| `strike` | `<s>` | `line-through text-muted-ink` |
| `code` | `<code>` | `bg-subtle-field px-1.5 py-0.5 rounded text-sm font-mono` |
| `link` | `<a>` | `text-inline-link underline underline-offset-2 hover:text-brand-oxide` |

### C. Link & Reference URL Protocol Validation

All links in article bodies and reference citations validate URLs:
- **Allowed Protocols:** `https:` and `http:` (plus `mailto:` or root-relative paths `/` for body links).
- **Rejected:** `javascript:`, `data:`, `vbscript:`, and arbitrary schemes.
- **Fallback:** If a reference URL fails protocol validation, the citation text is rendered safely as unlinked plain text.
- **External Links:** Rendered with `target="_blank"` and `rel="noopener noreferrer"`.

---

## 8. Reading Time Calculation

Reading time is calculated dynamically in memory from `content_json`. No database column is added.

```typescript
export function calculateReadingTime(contentJson: unknown): number {
  if (!contentJson || typeof contentJson !== 'object') return 1;

  let text = '';
  function extractText(node: unknown): void {
    if (!node || typeof node !== 'object') return;
    const n = node as { text?: string; content?: unknown[] };
    if (typeof n.text === 'string') {
      text += ' ' + n.text;
    }
    if (Array.isArray(n.content)) {
      n.content.forEach(extractText);
    }
  }

  extractText(contentJson);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  // 200 words per minute for scientific/medical editorial text
  return Math.max(1, Math.ceil(wordCount / 200));
}
```

---

## 9. Related Writing & Selected Writing Semantics

### A. Related Writing (Strict Category Relevancy)

- **Criteria:** `status = 'published'`, `category_id = currentArticle.category_id`, `id != currentArticle.id`.
- **Order:** `published_at DESC NULLS LAST, created_at DESC, id DESC`.
- **Limit:** Maximum 3 articles.
- **Truthful Omission:**
  - If 1 or 2 matching articles exist, render exactly 1 or 2.
  - If 0 matching articles exist, or if the current article has no category (`category_id = null`), **omit the Related Writing section entirely**.
  - **NEVER** backfill unrelated articles from other categories into Related Writing.

### B. Selected Writing (`/portfolio`)

- **Criteria:** `status = 'published'` AND `is_portfolio_featured = true`.
- **Order:** `published_at DESC NULLS LAST, created_at DESC, id DESC`.
- **Fallback:** If 0 articles are portfolio-featured, retain the truthful Stage-5 empty state.

---

## 10. References & Citation Handling

- Stored in `public.article_references`.
- Filtered to the current published article, ordered by `sort_order ASC`.
- Fields rendered: `title`, `source_name` (non-null), `url`, `citation_details`.
- Displayed in the **Reference Ledger** component with academic numbered indexing.

---

## 11. Storage Asset URL Architecture

- Asset bucket: existing `public-assets` bucket.
- Reusable helper in `src/lib/public-data.ts`:
  ```typescript
  import { createClient } from '@/lib/supabase/client';

  export function getPublicAssetUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    const supabase = createClient();
    const { data } = supabase.storage.from('public-assets').getPublicUrl(path);
    return data.publicUrl || null;
  }
  ```
- **CV Helper Integration:** `getPublicCvUrl()` delegates directly to `getPublicAssetUrl()`.
- **Synthetic Seed Fixture Rule:** If a local synthetic image file is not physically present in storage, fixtures must set `featured_image_path = null` and `featured_image_alt = null` to prevent broken image displays.

---

## 12. Synthetic Test Fixtures (`supabase/seed.sql`)

Local Stage-6 testing extends `supabase/seed.sql` with clearly synthetic local articles to verify:
- Multiple articles across categories to test pagination across page boundaries.
- Search matching across titles and excerpts.
- Topic routes with single and multiple articles.
- Long-form article typography, headings, lists, blockquotes, code blocks, and references.
- **STRICT:** Fixtures are strictly for local testing and must NEVER be deployed to hosted Supabase.

---

## 13. Security Test Matrix (Regression Cases)

| Test Case # | Description | Expected Result |
|---|---|---|
| **SEC-01** | Anonymous visitor requests published article (`/blog/plain-language...`) | HTTP 200 — Full article renders |
| **SEC-02** | Anonymous visitor requests draft article (`/blog/draft-regulatory...`) | HTTP 404 (`notFound()`) |
| **SEC-03** | Anonymous visitor requests archived article (`/blog/archived-guidelines...`) | HTTP 404 (`notFound()`) |
| **SEC-04** | Authenticated admin requests public draft URL (`/blog/draft-regulatory...`) | HTTP 404 (`notFound()`) |
| **SEC-05** | Authenticated admin requests public archived URL (`/blog/archived-guidelines...`) | HTTP 404 (`notFound()`) |
| **SEC-06** | Anonymous visitor views references on published article | HTTP 200 — References render |
| **SEC-07** | Direct fetch of references for draft article ID | Empty result (no leakage) |
| **SEC-08** | Search query matching draft title | Draft article NOT included in search results |
| **SEC-09** | Category route listing | Lists ONLY published articles |
| **SEC-10** | Portfolio route listing | Lists ONLY published articles where `is_portfolio_featured = true` |

---

## 14. Responsive & Accessibility Verification Plan

### Viewport Emulation (Playwright Device Metrics)

- **Desktop:** 1440 × 900
- **Tablet:** 1024 × 768
- **Mobile:** 390 × 844
- **Narrow Mobile:** 320 × 640

### Test Targets

- `/blog` (listing, search query active, filtered by topic, empty search results)
- `/blog/[synthetic-published-slug]` (full long-form article, Reference Ledger, author block)
- `/topics/[synthetic-topic-slug]` (topic listing, empty topic)

### Acceptance Criteria

- **0px Horizontal Overflow:** `scrollWidth === innerWidth` across all tested viewports.
- **Readable Measure:** Article body column stays within 680–720px max reading width.
- **Reference Ledger:** Numbered source ledger wraps gracefully without overflow.
- **Keyboard Navigation:** Search and topic filter inputs operate cleanly via keyboard with visible focus indicator.
- **Semantic Structure:** Single `<h1>` per page, hierarchical `<h2>`/`<h3>` tags, `<main>`, `<article>`, `<nav>`.
- **WCAG AA Contrast:** Text tokens meet or exceed 4.5:1 contrast ratio against parchment/paper surfaces.

---

## 15. Quality Gate Criteria

Before Stage-6 gate handoff can be created in later execution passes:
1. `npm run typecheck` — 0 errors
2. `npm run lint` — 0 warnings, 0 errors
3. `npm run format:check` — All files conform to Prettier
4. `npm run build` — Clean production compilation
5. `git diff --check` — Clean diff
6. Security matrix SEC-01 through SEC-10 verified
7. Responsive viewports verified with 0px overflow
