# 31 — Stage 8 Publishing Workflow Design & Technical Specification

## 1. Stage metadata

- **Stage:** Stage 8 — Publishing Workflow
- **Status:** PRE-IMPLEMENTATION DESIGN & RESEARCH (ARCHITECTURE GATE OPEN)
- **Canonical Base:** `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
- **Active Working Branch:** `stage/08-publishing-workflow`
- **Governing Decisions:** D028, D029 (Proposed D030 contained herein)
- **Authorizing Date:** 2026-08-26

---

## 2. Objective

Design the complete private administrative publishing lifecycle, canonical slug assignment, publication timestamp handling, draft-to-public featured image promotion, published content editing, unpublishing, archiving, deletion rules, and cache revalidation for Marie Medical Blog under the Evidence Folio design system.

This design establishes the exact architecture and verification criteria before any application code, database migrations, or hosted mutations are executed.

---

## 3. Frozen V1 scope & explicit exclusions

### In-scope for Stage 8:
1. **Article Publishing Lifecycle:**
   - Pre-publication validation and canonical slug generation/editing;
   - First-time publication timestamp (`published_at`) assignment;
   - Atomic database status transition (`draft` -> `published`);
   - Server-side featured image promotion from private `draft-assets` to public `public-assets`;
   - Atomic structured reference preservation during publication.
2. **Published Article Editing & Update:**
   - Full editing of published articles in the Evidence Folio editor without a complex versioning subsystem;
   - Preservation of original `published_at` publication timestamp;
   - Preservation of canonical `slug`;
   - Atomic update of article body, metadata, references, and featured images;
   - Replacement/promotion of newly uploaded draft images.
3. **Unpublishing & Archiving:**
   - Unpublish transition (`published` -> `draft`);
   - Archive transition (`published` -> `archived` and `draft` -> `archived`);
   - Restore transition (`archived` -> `draft`);
   - Immediate revocation of public visibility across all public queries and feeds;
   - Reset of `is_featured` and `is_portfolio_featured` flags.
4. **Deletion Governance:**
   - Deletion permitted strictly for `draft` and `archived` articles;
   - Direct deletion of `published` articles prohibited (must unpublish or archive first);
   - Explicit confirmation UX barrier with destructive styling;
   - Storage cleanup for associated draft objects.
5. **Preview System:**
   - Full-fidelity Evidence Folio preview rendering the drafted/updated document tree, structured references, and metadata side-by-side inside the private writer workspace;
   - Strict isolation from public routes with zero draft data leakage.
6. **Cache Revalidation:**
   - Surgical server-side revalidation of affected public routes (`/`, `/blog`, `/blog/[slug]`, `/topics/[slug]`, `/portfolio`) and administrative indices (`/admin/articles`, `/admin/articles/[id]`).

### Explicit Exclusions (Stage 8 Out-of-Scope):
- **No Multi-Author / Editorial Roles:** Single admin only (`Marie Medere`). No editors, reviewers, or contributors.
- **No Approval Queues:** Direct publication by the administrator without intermediate review gates.
- **No Revisions / Version History Subsystem:** No historical diffing, rollback snapshots, or draft branching.
- **No Scheduled / Timed Publishing:** Publication occurs immediately upon explicit administrative trigger.
- **No Reader Authentication:** Readers remain strictly anonymous.
- **No Comments Subsystem:** Comment moderation and submission belong to Stage 9.
- **No Contact Inbox:** Message handling belongs to Stage 9.
- **No Portfolio Entity Management:** Selected writing curation belongs to Stage 9.
- **No Category Management:** Category CRUD belongs to Stage 9.
- **No Automated SEO / AI Generation:** Automated metadata and AI features belong to Stage 10.
- **No Service-Role Key Client Exposure:** All operations execute through authenticated user sessions or secure server-side helpers.

---

## 4. Existing implementation audit

### Database Schema Baseline (Migrations `20260825054917`, `20260825081012`, `20260825200129`)
- `public.articles`:
  - `id` (uuid, primary key);
  - `slug` (text, not null, unique, check: `^[a-z0-9]+(?:-[a-z0-9]+)*$`);
  - `title` (text, not null, check: `char_length(trim(title)) > 0`);
  - `excerpt` (text, nullable);
  - `content_json` (jsonb, not null, check: `jsonb_typeof(content_json) = 'object' and content_json->>'type' = 'doc'`);
  - `category_id` (uuid, references `public.categories(id)`, on delete set null);
  - `featured_image_path` (text, nullable);
  - `featured_image_alt` (text, nullable);
  - `status` (text, not null, default `'draft'`, check: `status in ('draft', 'published', 'archived')`);
  - `published_at` (timestamptz, nullable);
  - `is_featured` (boolean, not null, default `false`);
  - `is_portfolio_featured` (boolean, not null, default `false`);
  - `seo_title` (text, nullable);
  - `seo_description` (text, nullable);
  - `created_at` (timestamptz, not null, default `now()`);
  - `updated_at` (timestamptz, not null, default `now()`).
- `public.article_references`:
  - `id` (uuid, primary key);
  - `article_id` (uuid, not null, references `public.articles(id)`, on delete cascade);
  - `title` (text, not null, check: `char_length(trim(title)) > 0`);
  - `source_name` (text, not null, check: `char_length(trim(source_name)) > 0`);
  - `url` (text, nullable, check: `url is null or url ~* '^https?://'`);
  - `citation_details` (text, nullable);
  - `sort_order` (integer, not null, default `0`);
  - `created_at` (timestamptz, not null, default `now()`).
- `storage.buckets`:
  - `draft-assets`: `public = false`, 5MB limit, `['image/jpeg', 'image/png', 'image/webp', 'image/avif']`, RLS policies: authenticated admin only via `private.is_admin()`.
  - `public-assets`: `public = true`, 10MB limit, `['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']`, RLS policies: public read, authenticated admin write.
- `public.save_article_draft`:
  - `SECURITY INVOKER`, locked safe `search_path = ''`.
  - Enforces `status = 'draft'`, `provisional_slug = 'draft-' || p_article_id`, `published_at = null`, `is_featured = false`, `is_portfolio_featured = false`.
  - Refuses mutation of non-draft articles.

### Public Query Defense-in-Depth
Every query in `src/lib/public-articles.ts` (`getPublishedArticleBySlug`, `getBlogViewData`, `getCategoryViewData`, `getHomepageRecentArticles`, `getPortfolioArticles`) explicitly specifies `.eq("status", "published")`. This ensures that even if an authenticated administrator accesses public routes, draft and archived data are never returned.

---

## 5. Current official technical research

### Next.js 16 (App Router / Turbopack)
- **Server Functions & Server Actions:** Server Actions (`"use server"`) execute as POST endpoints with secure cryptographic action IDs. Authorization must execute immediately at the entry point using `await requireAdmin()`.
- **Cache Revalidation:** `revalidatePath(path, type)` invalidates the Next.js Data Cache and Full Route Cache for specific paths or layout trees. For dynamic segments such as `/blog/[slug]`, `revalidatePath('/blog/[slug]', 'page')` or targeted paths `revalidatePath(`/blog/${slug}`)` flush stale static pages.
- **Draft Mode Evaluation:** Next.js `draftMode().enable()` sets a bypass cookie allowing Server Components to bypass static caching. However, in our architecture, public data functions strictly query `status = 'published'`. Enabling Draft Mode on public routes would require altering public query logic and introducing cookie checks on public routes, increasing surface area for accidental data leakage. An admin-local preview environment isolates draft rendering completely without touching public routes or cookies.

### Supabase Storage API
- **Cross-Bucket Operations:** The official Supabase JavaScript client (`@supabase/storage-js` v2) `copy()` API operates exclusively within a single bucket. Cross-bucket copying is not natively supported in a single RPC.
- **Server-Side Promotion Protocol:** An authenticated Server Action downloads bytes from `draft-assets` via `.download(path)` and uploads them to `public-assets` via `.upload(path, blob, { contentType, upsert: true })`.
- **Compensating Transactions:** If the subsequent database transaction fails, the server action immediately invokes `.remove([publicPath])` on `public-assets` to maintain strict storage-to-database consistency.

---

## 6. Decision Gates (DG8-01 through DG8-10)

### DG8-01 — Preview Architecture
- **Options Considered:**
  1. *Option A (Recommended): Admin-Local Full-Fidelity Preview Modal / Pane.* Reuses the existing Stage-7 preview modal inside the private `/admin/articles/[id]` route, rendering the exact ProseMirror JSON document tree via `ArticleTypography` and structured references via `ReferenceLedger`.
  2. *Option B: Dedicated Authenticated Admin Preview Route (`/admin/articles/[id]/preview`).* Separate admin-only route wrapped in `AdminShell` that loads draft data server-side and renders using the public article page layout.
  3. *Option C: Next.js Draft Mode with Signed Preview Tokens.* Public route `/api/draft?secret=...&slug=...` setting draft cookies and modifying public queries.
- **Evaluation:** Option C violates the single-author simplicity principle, weakens the defense-in-depth rule that public queries strictly filter `status = 'published'`, and introduces unnecessary token/cookie management. Option A is already implemented, highly responsive, 100% leak-proof, and renders the exact same component hierarchy.
- **Recommendation:** **OPTION A (Admin-Local Full-Fidelity Preview)** supplemented with an option to toggle between Split Editor View and Full Reading Preview inside the administrative workspace.

---

### DG8-02 — Canonical Slug Contract & Generation
- **Slug Generation Algorithm:**
  1. Base candidate: Title converted to lowercase, Unicode normalized with NFKD, accented characters stripped (`\p{Diacritic}` removed).
  2. Sanitization: All non-alphanumeric characters replaced with single hyphens (`[^a-z0-9]+` -> `-`).
  3. Trim hyphens: Leading and trailing hyphens stripped (`^-+|-+$` -> `""`).
  4. Truncation: Maximum 80 characters, breaking cleanly at hyphen boundaries if possible.
  5. Fallback: If the resulting string is empty, fallback to `article-${shortId}`.
  6. Collision Resolution: When publishing, check if the candidate slug exists on any *other* article (`id <> p_article_id`). If a collision occurs, append sequential numeric suffixes: `slug-2`, `slug-3`, etc., until unique.
- **Editorial Customization:** Marie is presented with the generated candidate slug in a "Publish Article" confirmation modal and may manually adjust it before confirming publication.
- **Slug Freezing:** Once published, the canonical slug is **frozen** to preserve durable permalinks, SEO rankings, and external citations. Subsequent updates to a published article cannot alter its slug unless explicitly unpublished.

---

### DG8-03 — Publication Timestamp Contract
- **Rules:**
  1. **First Publication:** `published_at` is set to `now()` if currently `null`.
  2. **Published Article Updates:** `published_at` is strictly **preserved** on subsequent content updates. Only `updated_at` changes.
  3. **Unpublish -> Republish:** If an article is unpublished (`published` -> `draft`) and subsequently republished, `published_at` is updated to `now()` (reflecting the new publication event), while original creation history is retained in `created_at`.
  4. **Archiving:** Archiving retains the original `published_at` timestamp in the database for auditing and historical records.

---

### DG8-04 — Published Article Editing Contract
- **Workflow:**
  1. Administrator opens `/admin/articles/[id]` for a `published` article.
  2. The editor renders in **Published Edit Mode** with visual indication ("Editing Published Article — Changes will be public upon Update").
  3. Marie edits title, excerpt, ProseMirror body, category, structured references, SEO metadata, or featured image.
  4. The candidate changes are previewable inside the admin preview modal.
  5. Clicking **"Update Published Article"** triggers a dedicated atomic update action/RPC.
  6. The database atomically updates article fields and replaces references while maintaining `status = 'published'`, `slug`, and `published_at`.
  7. Public routes and caches are automatically revalidated.

---

### DG8-05 — Database Mutation & RPC Architecture
- **Options Considered:**
  1. *Option A: Direct Supabase Client mutations with multiple REST queries.*
  2. *Option B: A single monolithic multi-branch RPC.*
  3. *Option C (Recommended): Focused PostgreSQL SECURITY INVOKER RPCs for distinct lifecycle transitions.*
- **Proposed RPC Functions:**
  1. `public.publish_article(p_article_id, p_slug, p_title, p_excerpt, p_content_json, p_category_id, p_featured_image_path, p_featured_image_alt, p_seo_title, p_seo_description, p_references)`: Transitions draft to published with canonical slug assignment and atomic reference replacement.
  2. `public.update_published_article(p_article_id, p_title, p_excerpt, p_content_json, p_category_id, p_featured_image_path, p_featured_image_alt, p_seo_title, p_seo_description, p_references)`: Updates published content while locking status, slug, and publication timestamp.
  3. `public.unpublish_article(p_article_id)`: Transitions published to draft, resetting featured flags.
  4. `public.archive_article(p_article_id)`: Transitions draft or published to archived, resetting featured flags.
  5. `public.delete_article(p_article_id)`: Deletes draft or archived article, enforcing that status is NOT published.
- **Security & Integrity:** All functions use `SECURITY INVOKER`, locked `search_path = ''`, enforce `private.is_admin() = true`, and revoke public/anon permissions.

---

### DG8-06 — Status Transition State Machine

```
                      ┌──────────────┐
                      │  (Creation)  │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
         ┌───────────►│    draft     │◄────────────┐
         │            └──────┬───────┘             │
         │ (Unpublish)       │                     │ (Restore)
         │                   │ (Publish)           │
         │                   ▼                     │
  ┌──────┴───────┐    ┌──────────────┐      ┌──────┴───────┐
  │  published   │    │  published   │─────►│   archived   │
  └──────┬───────┘    └──────────────┘      └──────────────┘
         │ (Archive)         ▲
         └───────────────────┘
```

| Source Status | Action | Destination Status | Allowed | Field Side-Effects |
|---|---|---|---|---|
| *New* | Save Draft | `draft` | YES | Sets provisional slug `draft-<UUID>`, `published_at = null`. |
| `draft` | Save Draft | `draft` | YES | Updates draft content and references in place. |
| `draft` | Publish | `published` | YES | Validates/sets canonical slug, sets `published_at = now()`. |
| `draft` | Archive | `archived` | YES | Sets `status = 'archived'`, resets featured flags. |
| `draft` | Delete | *Deleted* | YES | Cascades references, deletes draft storage assets. |
| `published` | Update | `published` | YES | Updates content/references, preserves `slug` and `published_at`. |
| `published` | Unpublish | `draft` | YES | Sets `status = 'draft'`, resets `is_featured = false`, resets `is_portfolio_featured = false`. |
| `published` | Archive | `archived` | YES | Sets `status = 'archived'`, resets `is_featured = false`, resets `is_portfolio_featured = false`. |
| `published` | Delete | *Deleted* | **PROHIBITED** | Must Unpublish or Archive before deletion can occur. |
| `archived` | Restore | `draft` | YES | Sets `status = 'draft'`. |
| `archived` | Delete | *Deleted* | YES | Cascades references, deletes draft storage assets. |

---

### DG8-07 — Deletion Governance & Safety
- **Prohibited Live Deletion:** Direct deletion of articles with `status = 'published'` is strictly blocked in both the UI and database RPC (`public.delete_article` raises exception if `status = 'published'`).
- **Confirmation Barrier:** Deletion requires a two-step confirmation modal with explicit warning: *"This action permanently deletes this draft and its reference data. This cannot be undone."*
- **Storage Cleanup:** When a draft is deleted, the Server Action queries `draft-assets` for objects prefixed with `articles/${articleId}/` and removes them via `storage.from('draft-assets').remove(...)`.

---

### DG8-08 — Private to Public Featured Image Promotion
- **Protocol:**
  1. Marie uploads a draft image in the editor -> saved to private `draft-assets` at `articles/${articleId}/featured/${fileName}`.
  2. When Marie clicks "Publish" or "Update":
     - The Server Action inspects `featured_image_path`.
     - If path starts with `articles/` and is currently in `draft-assets`, the server downloads the image bytes using the admin session.
     - The server uploads the bytes to `public-assets` at destination `articles/${articleId}/featured/${fileName}` with `upsert: true`.
     - The database RPC is executed with `p_featured_image_path` pointing to the public asset path.
     - If the RPC fails, a compensating call deletes the uploaded object from `public-assets`.
     - If the RPC succeeds, the private draft asset in `draft-assets` is cleaned up.
  3. If an article already has a public image and Marie replaces it with a new draft image:
     - New draft image is uploaded to `draft-assets`.
     - Upon "Update Published Article", new image is promoted to `public-assets` (overwriting or replacing), and the database path is updated.

---

### DG8-09 — Public & Admin Cache Revalidation
- **Revalidation Surfaces:**
  - Upon **Publish**:
    - `revalidatePath('/')` (Homepage Recent Writing list);
    - `revalidatePath('/blog')` (Blog archive & pagination);
    - `revalidatePath('/blog/[slug]', 'page')` & `revalidatePath(`/blog/${slug}`)` (Article detail view);
    - `revalidatePath('/topics/[slug]', 'page')` & `revalidatePath(`/topics/${categorySlug}`)` (Category topic page);
    - `revalidatePath('/portfolio')` (Portfolio featured writing);
    - `revalidatePath('/admin/articles')` & `revalidatePath(`/admin/articles/${articleId}`);`
  - Upon **Update Published Article**:
    - `revalidatePath('/blog')`;
    - `revalidatePath(`/blog/${slug}`);`
    - `revalidatePath('/')`;
    - `revalidatePath('/portfolio')`;
    - `revalidatePath(`/admin/articles/${articleId}`);`
  - Upon **Unpublish / Archive / Delete**:
    - `revalidatePath('/')`;
    - `revalidatePath('/blog')`;
    - `revalidatePath(`/blog/${slug}`);`
    - `revalidatePath('/portfolio')`;
    - `revalidatePath('/topics/[slug]', 'page')`;
    - `revalidatePath('/admin/articles')`.

---

### DG8-10 — Security & Access Control Model
- **Strict Administrator Gate:** Every lifecycle Server Action calls `await requireAdmin()` before performing any data or storage operation.
- **Database Function Security:** All publishing RPCs are `SECURITY INVOKER`, locked `search_path = ''`, enforce `if not coalesce(private.is_admin(), false) then raise exception 'Unauthorized' using errcode = '42501'`, and have permissions revoked from `public, anon`.
- **Zero Public Leakage:** Public queries in `src/lib/public-articles.ts` remain unchanged and continue strictly filtering `status = 'published'`. Provisional slugs (`draft-<UUID>`) and draft storage assets remain completely inaccessible to anonymous visitors.

---

## 7. Server & Client Component Architecture

### Component Hierarchy in `/admin/articles/[id]`
```
AdminArticleDetailPage (Server Component)
  ├── requireAdmin()
  ├── getAdminArticleById(id)
  ├── getAdminCategories()
  ├── getAdminArticleReferences(id)
  └── ArticleEditor (Client Component)
        ├── EditorHeader (Title, Status Badge, Action Buttons)
        │     ├── Save Draft Button (when status === 'draft')
        │     ├── Publish Article Trigger -> PublishConfirmationModal
        │     ├── Update Published Article Button (when status === 'published')
        │     ├── Unpublish Trigger -> UnpublishConfirmationModal
        │     ├── Archive Trigger -> ArchiveConfirmationModal
        │     └── Delete Trigger -> DeleteConfirmationModal
        ├── Split Layout
        │     ├── Metadata Sidebar (Category, Excerpt, Featured Image, SEO, References)
        │     └── Tiptap Editor / Preview Pane (Toggle between Edit and Preview)
        └── Modals
              ├── PublishConfirmationModal (Slug preview/edit, validation checks)
              ├── UnpublishConfirmationModal (Warning of immediate public removal)
              ├── ArchiveConfirmationModal (Historical retention notice)
              └── DeleteConfirmationModal (Permanent destruction warning)
```

---

## 8. Automated Test Matrix & Verification Plan

### Database Unit Tests (`supabase/tests/database/10_stage8_publishing_workflow.test.sql`)
1. `publish_article` succeeds for authenticated admin and sets `status = 'published'`.
2. `publish_article` sets `published_at = now()` on first publication.
3. `publish_article` enforces canonical kebab-case slug format and rejects invalid characters.
4. `publish_article` resolves slug collisions deterministically.
5. `update_published_article` updates title, content, and references while locking `status`, `slug`, and `published_at`.
6. `unpublish_article` resets `status = 'draft'`, `is_featured = false`, `is_portfolio_featured = false`.
7. `archive_article` sets `status = 'archived'` from draft or published state.
8. `delete_article` succeeds on draft/archived and raises exception if `status = 'published'`.
9. Anonymous and non-admin calls to all lifecycle RPCs are rejected with SQLSTATE `42501`.
10. Anonymous queries against `public.articles` return 0 rows for draft and archived articles.

### Quality Gate Commands
- `npx supabase db reset`
- `npx supabase test db` (10 test files, 140+ tests expected)
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `git diff --check`

### Multi-Viewport Visual & Responsive Verification
- Desktop (1440x900)
- Tablet (1024x768)
- Mobile (390x844)
- Narrow Mobile (320x640)
- Verification of 0px horizontal overflow across all modal dialogues and editor viewports.

---

## 9. Decision Gates & Recommended Choices Summary

| Gate | Focus | Recommended Choice | Rationale |
|---|---|---|---|
| **DG8-01** | Preview Architecture | **Admin-Local Full-Fidelity Preview** | Reuses tested renderer, zero token overhead, zero leak risk. |
| **DG8-02** | Canonical Slug Contract | **Auto-Generated with Manual Override & Frozen on Publish** | Clean SEO URLs, collision-safe, permalink stability. |
| **DG8-03** | Publication Timestamps | **Set on First Publish, Preserved on Update, Reset on Republish** | Truthful historical publication metadata. |
| **DG8-04** | Published Editing | **Direct In-Place Editing with Atomic Update RPC** | Avoids complex versioning while ensuring transactional safety. |
| **DG8-05** | Database Mutation | **Focused SECURITY INVOKER RPCs per Lifecycle Transition** | Maximum auditability, atomic reference replacement, tight RLS. |
| **DG8-06** | Unpublish vs Archive | **Explicit 3-State Lifecycle Machine (`draft`, `published`, `archived`)** | Clear semantics for temporary unpublishing vs permanent retirement. |
| **DG8-07** | Delete Rules | **Allowed for Draft/Archived; Prohibited for Live Published** | Prevents accidental live data loss with confirmation barriers. |
| **DG8-08** | Image Promotion | **Server-Side Download/Upload from `draft-assets` to `public-assets`** | Clean separation of private drafts and public assets without cross-bucket assumptions. |
| **DG8-09** | Cache Revalidation | **Targeted `revalidatePath` on Affected Public & Admin Routes** | Ensures instantaneous freshness across feeds, archives, and detail pages. |
| **DG8-10** | Security / Leakage | **`requireAdmin()` Server Gate + Non-Weakened Public Queries** | Preserves impenetrable defense-in-depth isolation. |

---

## 10. Implementation Sequence (Post-Approval)

1. **Phase 8A — Database Migration & Lifecycle RPCs:**
   - Author migration with `publish_article`, `update_published_article`, `unpublish_article`, `archive_article`, `delete_article`;
   - Author pgTAP tests in `supabase/tests/database/10_stage8_publishing_workflow.test.sql`;
   - Verify local database reset and test suite pass.
2. **Phase 8B — Server Actions & Image Promotion Service:**
   - Implement `publishArticleAction`, `updatePublishedArticleAction`, `unpublishArticleAction`, `archiveArticleAction`, `deleteArticleAction` in `src/app/admin/articles/actions.ts`;
   - Implement image promotion helper in `src/lib/admin/image-promotion.ts`;
   - Integrate Next.js `revalidatePath` calls.
3. **Phase 8C — Editorial UI & Lifecycle Controls:**
   - Update `ArticleEditor` with publish, update, unpublish, archive, delete action buttons and confirmation modals;
   - Update `/admin/articles` table with lifecycle quick actions and filters;
   - Enable full-fidelity admin preview toggle.
4. **Phase 8D — Quality Gates, Visual Verification & Hosted Deployment:**
   - Run typecheck, lint, format check, build, and pgTAP;
   - Capture responsive multi-viewport screenshots;
   - Controlled hosted Supabase migration and verification under owner authorization.
