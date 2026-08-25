# 31 — Stage 8 Publishing Workflow Design & Technical Specification

## 1. Stage metadata

- **Stage:** Stage 8 — Publishing Workflow
- **Status:** PRE-IMPLEMENTATION DESIGN HARDENING (EXTERNAL REVIEW CORRECTIONS APPLIED)
- **Canonical Base:** `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
- **Active Working Branch:** `stage/08-publishing-workflow`
- **Governing Decisions:** D028, D029 (Proposed D030 detailed in Section 24)
- **Authorizing Date:** 2026-08-26

---

## 2. Objective

Design the complete private administrative publishing lifecycle, canonical slug assignment, publication timestamp handling, draft-to-public featured image promotion, public-to-private image demotion, published content editing, unpublishing, archiving, restoration, deletion governance, and cache revalidation for Marie Medical Blog under the Evidence Folio design system.

This design establishes the exact architecture and verification criteria before any application code, database migrations, or hosted mutations are executed. Implementation remains strictly frozen pending external design review and project-owner approval.

---

## 3. Frozen V1 scope & explicit exclusions

### In-scope for Stage 8:
1. **Article Publishing Lifecycle:**
   - Pre-publication validation and canonical slug generation/editing;
   - First-time publication timestamp (`published_at`) assignment;
   - Atomic database status transition (`draft` -> `published`);
   - Server-side featured image promotion from private `draft-assets` to public `public-assets` using unique paths with `upsert: false`;
   - Atomic structured reference preservation during publication.
2. **Published Article Editing & Update:**
   - Full editing of published articles in the Evidence Folio editor without a complex versioning subsystem;
   - Strict preservation of original `published_at` publication timestamp;
   - Strict preservation of canonical `slug`;
   - Atomic update of article body, metadata, references, and featured images;
   - Handling of published image replacement, promotion, and superseded asset cleanup.
3. **Unpublishing, Archiving & Restoring:**
   - Unpublish transition (`published` -> `draft`);
   - Archive transition (`published` -> `archived` and `draft` -> `archived`);
   - Restore transition (`archived` -> `draft`);
   - Demotion of featured images from `public-assets` to `draft-assets` on unpublish/archive;
   - Immediate revocation of public visibility across all public queries and feeds;
   - Reset of `is_featured` and `is_portfolio_featured` flags.
4. **Deletion Governance:**
   - Deletion permitted strictly for never-published articles (`status IN ('draft', 'archived') AND published_at IS NULL`);
   - Hard deletion of ever-published articles is prohibited (must use Archive to retire content while preserving URL ownership);
   - Explicit confirmation UX barrier with destructive styling;
   - Storage cleanup for associated draft objects.
5. **Admin-Local Preview System:**
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

## 4. Verified real implementation audit

### Database Schema Baseline (Migrations `20260825054917`, `20260825081012`, `20260825200129`)
- `public.articles`:
  - `id` (`uuid`, primary key, default `gen_random_uuid()`);
  - `slug` (`text`, not null, unique, table check constraint: `slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`);
  - `title` (`text`, not null, table check constraint: `char_length(trim(title)) > 0`);
  - `excerpt` (`text`, nullable);
  - `content_json` (`jsonb`, not null, default `'{"type":"doc","content":[]}'::jsonb`);
    *(Note: There is currently NO table CHECK constraint enforcing `jsonb_typeof(content_json) = 'object'` and `content_json->>'type' = 'doc'`. That validation is enforced at the RPC and application boundaries.)*
  - `category_id` (`uuid`, nullable, references `public.categories(id)` **`ON DELETE RESTRICT`**);
  - `featured_image_path` (`text`, nullable);
  - `featured_image_alt` (`text`, nullable);
  - `status` (`text`, not null, default `'draft'`, table check constraint: `status in ('draft', 'published', 'archived')`);
  - `published_at` (`timestamptz`, nullable);
  - `is_featured` (`boolean`, not null, default `false`);
  - `is_portfolio_featured` (`boolean`, not null, default `false`);
  - `seo_title` (`text`, nullable);
  - `seo_description` (`text`, nullable);
  - `created_at` (`timestamptz`, not null, default `now()`);
  - `updated_at` (`timestamptz`, not null, default `now()`).
- `public.article_references`:
  - `id` (`uuid`, primary key, default `gen_random_uuid()`);
  - `article_id` (`uuid`, not null, references `public.articles(id)` `ON DELETE CASCADE`);
  - `title` (`text`, not null, table check constraint: `char_length(trim(title)) > 0`);
  - `source_name` (`text`, not null, table check constraint: `char_length(trim(source_name)) > 0`);
  - `url` (`text`, nullable);
    *(Note: There is currently NO table CHECK constraint requiring `http://` or `https://`. URL format validation is enforced at the RPC and application boundaries.)*
  - `citation_details` (`text`, nullable);
  - `sort_order` (`integer`, not null, default `0`);
  - `created_at` (`timestamptz`, not null, default `now()`).
- `storage.buckets`:
  - `draft-assets`: `public = false`, 5MB limit, `['image/jpeg', 'image/png', 'image/webp', 'image/avif']`, RLS policies: authenticated admin only via `private.is_admin()`.
  - `public-assets`: `public = true`, 10MB limit, `['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']`, RLS policies: public read, authenticated admin write.
- `public.save_article_draft`:
  - `SECURITY INVOKER`, locked safe `search_path = ''`.
  - Enforces `status = 'draft'`, `provisional_slug = 'draft-' || p_article_id`, `published_at = null`, `is_featured = false`, `is_portfolio_featured = false`.
  - Refuses mutation of non-draft articles.

### Public Data Layer Audit (`src/lib/public-articles.ts`)
The actual exported query functions in the public data layer are:
1. `getPublishedArticleBySlug(slug: string)`
2. `getBlogViewData(options?: PublicBlogQueryOptions)`
3. `getCategoryViewData(categorySlug: string, options?: PublicBlogQueryOptions)`
4. `getHomepageRecentArticles(limit?: number)`
5. `getPortfolioArticles()`
6. `getPublicCategories()`
7. `getRecentArticlesForDiscovery(currentArticleId: string, categoryId?: string | null, limit?: number)`

Every query in `src/lib/public-articles.ts` strictly specifies `.eq("status", "published")`. This ensures that even if an authenticated administrator accesses public routes, draft and archived data are never returned.

---

## 5. Current official technical research

### Next.js 16 (App Router / Turbopack)
- **Server Functions & Server Actions:** Server Actions (`"use server"`) execute as POST endpoints with secure cryptographic action IDs. Authorization must execute immediately at the entry point using `await requireAdmin()`.
- **Cache Revalidation:** `revalidatePath` invalidates the Next.js Data Cache and Full Route Cache:
  - Exact URL segment: `revalidatePath('/blog/the-slug')`
  - Dynamic route pattern: `revalidatePath('/topics/[slug]', 'page')`
  - Calling exact paths for singular articles and pattern paths for dynamic category/feed pages ensures on-demand cache freshness without redundant calls.
- **Draft Mode Evaluation:** Next.js `draftMode().enable()` sets a bypass cookie allowing Server Components to bypass static caching. However, in our architecture, public data functions strictly query `status = 'published'`. Enabling Draft Mode on public routes would require altering public query logic and introducing cookie checks on public routes, increasing surface area for accidental data leakage. An admin-local preview environment isolates draft rendering completely without touching public routes or cookies.

### Supabase Storage API (v2)
- **Cross-Bucket Operations:** The official Supabase JavaScript client (`@supabase/storage-js` v2) `copy()` API operates exclusively within a single bucket. Cross-bucket copying is not natively supported in a single RPC.
- **Server-Side Promotion Protocol:** An authenticated Server Action downloads bytes from `draft-assets` via `.download(path)` and uploads them to `public-assets` via `.upload(path, blob, { contentType, upsert: false })`.
- **Avoid `upsert: true`:** Official Supabase guidance recommends using new, unique destination paths rather than overwriting existing objects. This prevents CDN caching anomalies and race conditions during simultaneous updates.
- **Compensating Transactions:** If the subsequent database transaction fails, the server action immediately invokes `.remove([publicPath])` on `public-assets` to maintain strict storage-to-database consistency.

---

## 6. Decision Gates (DG8-01 through DG8-10)

### DG8-01 — Preview Architecture
- **Options Considered:**
  1. *Option A (Recommended): Admin-Local Full-Fidelity Preview Mode / Modal / Pane.* Implemented in Stage 8 within the private `/admin/articles/[id]` route, rendering the exact ProseMirror JSON document tree from unsaved client editor state via `ArticleTypography` and structured references via `ReferenceLedger`.
  2. *Option B: Dedicated Authenticated Admin Preview Route (`/admin/articles/[id]/preview`).* Separate admin-only route wrapped in `AdminShell` that loads draft data server-side and renders using the public article page layout.
  3. *Option C: Next.js Draft Mode with Signed Preview Tokens.* Public route `/api/draft?secret=...&slug=...` setting draft cookies and modifying public queries.
- **Evaluation:** Option C violates the single-author simplicity principle, weakens the defense-in-depth rule that public queries strictly filter `status = 'published'`, and introduces unnecessary token/cookie management. Option A isolates previewing to the administrative client, provides real-time feedback on unsaved edits, is 100% leak-proof, and reuses established Evidence Folio presentational components.
- **Recommendation:** **OPTION A (Implement Admin-Local Preview in Stage 8)** as an interactive preview mode/modal inside `ArticleEditor`.

---

### DG8-02 — Canonical Slug Contract & Generation
- **First Publication Only:**
  If an article has its internal provisional identity (`draft-<article UUID>`), Stage 8 generates and validates the canonical publication slug.
- **Slug Generation Algorithm:**
  1. Base candidate: Title converted to lowercase, Unicode normalized with NFKD, accented characters stripped (`\p{Diacritic}` removed).
  2. Sanitization: Non-alphanumeric character runs converted to a single hyphen (`[^a-z0-9]+` -> `-`).
  3. Trim hyphens: Leading and trailing hyphens stripped (`^-+|-+$` -> `""`).
  4. Truncation: Base truncated so that the final slug (including any collision suffix) never exceeds **80 characters**.
  5. Fallback: If empty, fallback to `article-<first 8 chars of UUID>`.
  6. Collision Resolution (Database Authority): The `publish_article` RPC verifies uniqueness within the database transaction. If a collision exists on any other article (`id <> p_article_id`), it appends `-2`, `-3`, etc., truncating the base as necessary to guarantee uniqueness and length <= 80 chars.
- **Editorial Customization:** Marie may manually adjust the candidate slug in the "Publish Article" confirmation modal prior to first publication. Manual input must satisfy the same kebab-case regex (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) and 80-char limit.
- **Permanent Slug Freeze:** Once published, the canonical slug is **permanently frozen** for the lifetime of that article row. It remains immutable across subsequent published updates, unpublishing, archiving, restoring, and republishing. Unpublishing does NOT reopen slug editing. This eliminates the need for a redirect/slug-history subsystem.

---

### DG8-03 — Publication Timestamp Contract
- **Semantic Definition:** `published_at` records the **ORIGINAL FIRST PUBLICATION TIME**.
- **Rules:**
  1. **First Publication:** `published_at` is set to `now()` when `published_at IS NULL`.
  2. **Published Updates:** `published_at` is strictly **preserved** on subsequent content updates.
  3. **Unpublish:** `published_at` is **preserved** in the database row.
  4. **Archive:** `published_at` is **preserved**.
  5. **Restore:** `published_at` is **preserved**.
  6. **Republish:** `published_at` is **preserved** (original first publication date remains truthful; `updated_at` records the republish event).
  7. `created_at` represents row creation time only.

---

### DG8-04 — Published Article Editing Contract
- **Workflow:**
  1. Administrator opens `/admin/articles/[id]` for a `published` article.
  2. The editor renders in **Published Edit Mode** with clear UI indication ("Editing Published Article — Changes will become public upon Update").
  3. Image State Tracking: The client tracks `currentPublicImagePath`, `pendingDraftImagePath`, `pendingImageAlt`, and `removeCurrentImage` flag.
  4. The candidate changes are previewable locally in the admin preview modal.
  5. Clicking **"Update Published Article"** triggers `updatePublishedArticleAction`.
  6. Database RPC `public.update_published_article` updates title, excerpt, `content_json`, `category_id`, references, SEO metadata, and promoted featured image while strictly locking `status = 'published'`, `slug`, and `published_at`.
  7. Public routes and caches are automatically revalidated.

---

### DG8-05 — Database Mutation & Lifecycle RPC Architecture
- **Complete Proposed Lifecycle RPC Set:**
  1. `public.publish_article(p_article_id, p_slug, p_title, p_excerpt, p_content_json, p_category_id, p_featured_image_path, p_featured_image_alt, p_seo_title, p_seo_description, p_references)`:
     - Source status required: `draft` (or `archived` if republishing an archived draft);
     - Sets `status = 'published'`;
     - Sets `published_at = coalesce(published_at, now())`;
     - Assigns canonical slug (resolving collisions);
     - Replaces references atomically.
  2. `public.update_published_article(p_article_id, p_title, p_excerpt, p_content_json, p_category_id, p_featured_image_path, p_featured_image_alt, p_seo_title, p_seo_description, p_references)`:
     - Source status required: `published`;
     - Updates content, metadata, references, and image path;
     - Locks `status = 'published'`, `slug`, and `published_at`.
  3. `public.unpublish_article(p_article_id, p_private_image_path)`:
     - Source status required: `published`;
     - Sets `status = 'draft'`, `is_featured = false`, `is_portfolio_featured = false`;
     - Updates `featured_image_path = p_private_image_path`;
     - Preserves `slug` and `published_at`.
  4. `public.archive_article(p_article_id, p_private_image_path)`:
     - Source status required: `published` or `draft`;
     - Sets `status = 'archived'`, `is_featured = false`, `is_portfolio_featured = false`;
     - Updates `featured_image_path = p_private_image_path` (if demoted);
     - Preserves `slug` and `published_at`.
  5. `public.restore_article(p_article_id)`:
     - Source status required: `archived`;
     - Sets `status = 'draft'`;
     - Preserves `slug`, `published_at`, and `featured_image_path`.
  6. `public.delete_article(p_article_id)`:
     - Source status required: `draft` or `archived`;
     - Condition required: `published_at IS NULL` (ever-published articles cannot be deleted);
     - Cascades reference deletion;
     - Deletes article row.
- **Security & Function Controls:**
  - All functions use `SECURITY INVOKER`, locked `search_path = ''`.
  - Enforce `if not coalesce(private.is_admin(), false) then raise exception 'Unauthorized' using errcode = '42501'`.
  - Permissions: `REVOKE ALL FROM public, anon; GRANT EXECUTE TO authenticated;`.

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
| `draft` | Publish | `published` | YES | Validates/sets canonical slug, sets `published_at = coalesce(published_at, now())`. Image promoted to `public-assets`. |
| `draft` | Archive | `archived` | YES | Sets `status = 'archived'`, resets featured flags. |
| `draft` | Delete | *Deleted* | YES *(if `published_at IS NULL`)* | Cascades references, deletes draft storage assets. |
| `published` | Update | `published` | YES | Updates content/references, preserves `slug` and `published_at`. Promotes replacement image if present. |
| `published` | Unpublish | `draft` | YES | Sets `status = 'draft'`, resets featured flags, preserves `slug` and `published_at`. Demotes image to `draft-assets`. |
| `published` | Archive | `archived` | YES | Sets `status = 'archived'`, resets featured flags, preserves `slug` and `published_at`. Demotes image to `draft-assets`. |
| `published` | Delete | *Deleted* | **PROHIBITED** | Must Unpublish/Archive first, and blocked if ever published. |
| `archived` | Restore | `draft` | YES | Sets `status = 'draft'`, preserves `slug` and `published_at`. |
| `archived` | Delete | *Deleted* | YES *(if `published_at IS NULL`)* | Blocked if `published_at IS NOT NULL`. |

---

### DG8-07 — Deletion Governance & Safety
- **Rule:** **Hard deletion is allowed ONLY when `status IN ('draft', 'archived') AND published_at IS NULL`.**
- **Rationale:**
  1. Abandoned never-published drafts and never-published archived drafts may be deleted cleanly.
  2. Any article that has **ever** been published (`published_at IS NOT NULL`) cannot be deleted from the database. It is retired via `Archive`.
  3. This preserves permanent ownership of canonical slugs, prevents accidental URL collision/reuse by unrelated future articles, avoids breaking external citations, and protects against deleting records that could have comments in Stage 9.
- **Confirmation Barrier:** Deletion modal states: *"This action permanently deletes this draft and its references. This cannot be undone."* If an article was ever published, the Delete button is disabled with explanatory tooltip ("Ever-published articles cannot be deleted. Use Archive instead.").

---

### DG8-08 — Storage Invariant & Image Promotion/Demotion Architecture
- **Storage Invariant:**
  - `status = 'published'` -> featured image must resolve from `public-assets`
  - `status IN ('draft', 'archived')` -> featured image must resolve from `draft-assets`
- **Unique Destination Paths (`upsert: false`):**
  - Promotion destination: `articles/<article-id>/featured/<uuid>-<sanitized-name>` in `public-assets`.
  - Demotion destination: `articles/<article-id>/featured/<uuid>-<sanitized-name>` in `draft-assets`.
- **First Publish / Republish Flow:**
  1. `await requireAdmin()`.
  2. Validate private candidate in `draft-assets` belongs to the article.
  3. Download image bytes from `draft-assets`.
  4. Upload to `public-assets` at new unique path with `upsert: false`.
  5. Call `publish_article` RPC with new public path.
  6. If RPC fails: delete newly uploaded public object (compensating cleanup); retain private candidate and prior valid image.
  7. If RPC succeeds: delete private source object from `draft-assets`.
- **Published Image Replacement Flow:**
  1. Upload new candidate to `draft-assets`.
  2. Upload candidate bytes to `public-assets` with `upsert: false`.
  3. Call `update_published_article` RPC with new public path.
  4. If RPC fails: remove newly uploaded public object; retain old public image and private candidate.
  5. If RPC succeeds: delete private candidate; then remove superseded old public image from `public-assets`.
  6. If old public image cleanup fails: log cleanup warning; article database state remains valid pointing to new image.
- **Unpublish / Archive Demotion Flow:**
  1. Download current image bytes from `public-assets`.
  2. Upload bytes to new unique path in `draft-assets` with `upsert: false`.
  3. Call `unpublish_article` / `archive_article` RPC with new private path.
  4. If RPC fails: delete newly uploaded private object; retain public state.
  5. If RPC succeeds: delete old public object from `public-assets`.

---

### DG8-09 — Public & Admin Cache Revalidation
- **Revalidation Protocol:**
  - **Publish:**
    - `revalidatePath('/')`
    - `revalidatePath('/blog')`
    - `revalidatePath(`/blog/${slug}`)`
    - `revalidatePath(`/topics/${categorySlug}`)` (if category assigned)
    - `revalidatePath('/portfolio')`
    - `revalidatePath('/admin/articles')`
    - `revalidatePath(`/admin/articles/${articleId}`)`
  - **Published Update:**
    - `revalidatePath('/')`
    - `revalidatePath('/blog')`
    - `revalidatePath(`/blog/${slug}`)`
    - `revalidatePath('/portfolio')`
    - If category changed: `revalidatePath(`/topics/${oldCategorySlug}`)` AND `revalidatePath(`/topics/${newCategorySlug}`)`
    - If category unchanged: `revalidatePath(`/topics/${categorySlug}`)`
    - `revalidatePath('/admin/articles')`
    - `revalidatePath(`/admin/articles/${articleId}`)`
  - **Unpublish / Archive:**
    - `revalidatePath('/')`
    - `revalidatePath('/blog')`
    - `revalidatePath(`/blog/${slug}`)`
    - `revalidatePath(`/topics/${categorySlug}`)` (if category assigned)
    - `revalidatePath('/portfolio')`
    - `revalidatePath('/admin/articles')`
    - `revalidatePath(`/admin/articles/${articleId}`)`
  - **Restore:**
    - `revalidatePath('/admin/articles')`
    - `revalidatePath(`/admin/articles/${articleId}`)`
    *(No public revalidation required; restored status is draft).*
  - **Delete (Never-Published):**
    - `revalidatePath('/admin/articles')`
    *(No public revalidation required; no public URL has ever existed).*

---

### DG8-10 — Security & Access Control Model
- **Strict Administrator Gate:** Every lifecycle Server Action calls `await requireAdmin()` before performing any data or storage operation.
- **Database Function Security:** All publishing RPCs are `SECURITY INVOKER`, locked `search_path = ''`, enforce `if not coalesce(private.is_admin(), false) then raise exception 'Unauthorized' using errcode = '42501'`, and have permissions revoked from `public, anon`.
- **Zero Public Leakage:** Public queries in `src/lib/public-articles.ts` remain unchanged and continue strictly filtering `status = 'published'`. Provisional slugs (`draft-<UUID>`), draft storage assets, unpublished records, and archived records remain completely inaccessible to anonymous visitors.

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
        ├── EditorHeader (Title, Status Badge, Lifecycle Actions)
        │     ├── Save Draft Button (when status === 'draft')
        │     ├── Publish Article Trigger -> PublishConfirmationModal
        │     ├── Update Published Article Button (when status === 'published')
        │     ├── Unpublish Trigger -> UnpublishConfirmationModal
        │     ├── Archive Trigger -> ArchiveConfirmationModal
        │     ├── Restore Trigger -> RestoreConfirmationModal
        │     └── Delete Trigger -> DeleteConfirmationModal (disabled if published_at IS NOT NULL)
        ├── Split Layout
        │     ├── Metadata Sidebar (Category, Excerpt, Featured Image, SEO, References)
        │     └── Tiptap Editor / Admin Preview Pane (Toggle between Edit and Preview)
        └── Modals
              ├── PublishConfirmationModal (Slug preview/edit, validation checklist)
              ├── UnpublishConfirmationModal (Warning of immediate public removal)
              ├── ArchiveConfirmationModal (Historical retirement notice)
              ├── RestoreConfirmationModal (Draft workspace restoration notice)
              └── DeleteConfirmationModal (Permanent destruction warning for never-published drafts)
```

---

## 8. Validation Contract (RPC & Server Action Boundary)

Because database tables do not contain all constraints as table-level checks, every Stage-8 article-writing RPC must explicitly enforce:
1. Caller is authenticated admin (`private.is_admin() = true`).
2. Valid source status for requested transition.
3. Title is non-blank (`char_length(trim(title)) > 0`).
4. `content_json` is a JSON object with `type = 'doc'` and contains non-empty content for publication.
5. Canonical slug matches kebab-case regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` and is <= 80 characters.
6. Category ID is valid UUID and exists in `public.categories`.
7. Featured image path, if present, is non-blank and scoped to `articles/<article-id>/featured/`.
8. Featured image alt text is non-blank when an image path is attached.
9. `references` is a JSON array.
10. Each reference item contains non-blank `title` and `source_name`.
11. Reference `url` is null or begins with `http://` or `https://`.
12. Deterministic `sort_order` is assigned to references.
13. Article update and reference replacement are executed atomically in a single transaction.

---

## 9. Failure & Compensation Behavior

| Operation Step | Failure Mode | Compensation / Handling |
|---|---|---|
| Image Promotion Upload | Supabase Storage error on upload to `public-assets` | Abort operation; do not invoke DB RPC; private source asset remains intact; return user error. |
| Database Publication RPC | SQL error / collision / validation failure in `publish_article` | Catch error; invoke `storage.from('public-assets').remove([newPublicPath])`; private source asset remains intact; return user error. |
| Private Asset Cleanup | Storage error deleting from `draft-assets` after successful publish | Log/report cleanup warning; do not fail publication since database and public storage are valid. |
| Image Demotion Upload | Storage error uploading to `draft-assets` during unpublish | Abort operation; do not invoke unpublish RPC; public article and public asset remain intact; return user error. |
| Database Demotion RPC | SQL error during `unpublish_article` / `archive_article` | Catch error; remove newly uploaded private copy from `draft-assets`; public article and asset remain intact. |
| Public Asset Cleanup | Storage error deleting from `public-assets` after successful unpublish | Log/report cleanup warning; database record points to private asset; article is unpublished publicly. |

---

## 10. Automated Test Matrix & Verification Plan

### Database Unit Tests (`supabase/tests/database/10_stage8_publishing_workflow.test.sql`)
1. **Publication:**
   - First publication assigns valid canonical slug and sets `status = 'published'`.
   - Rejects invalid/malformed slugs.
   - Handles empty candidate fallback to `article-<short-uuid>`.
   - Resolves database slug collisions deterministically (`slug-2`, `slug-3`) keeping length <= 80.
   - Sets `published_at = now()` on first publication.
2. **Published Updates:**
   - Updates article content, metadata, and references atomically.
   - Enforces slug immutability on update.
   - Enforces `published_at` immutability on update.
   - Failed reference validation rolls back entire article update.
3. **Unpublishing, Archiving & Restoring:**
   - `unpublish_article` sets `status = 'draft'`, resets `is_featured = false`, `is_portfolio_featured = false`, preserves `slug` and `published_at`.
   - `archive_article` sets `status = 'archived'` from draft or published state, preserves `slug` and `published_at`.
   - `restore_article` sets `status = 'draft'` from archived state, preserves `slug` and `published_at`.
   - Rejects invalid source status transitions (e.g. restoring a published article).
4. **Deletion Governance:**
   - Deleting never-published draft (`published_at IS NULL`) succeeds and cascades references.
   - Deleting never-published archived article (`published_at IS NULL`) succeeds.
   - Deleting live published article is rejected with exception.
   - Deleting ever-published draft (`published_at IS NOT NULL`) is rejected with exception.
   - Deleting ever-published archived article (`published_at IS NOT NULL`) is rejected with exception.
5. **Security & Permissions:**
   - Anonymous and non-admin calls to all lifecycle RPCs are rejected with SQLSTATE `42501`.
   - Anonymous queries against `public.articles` return 0 rows for draft and archived records.

### Storage & Orchestration Tests
- Anonymous read of private draft image is rejected.
- Promoted public image is readable publicly.
- Promotion upload failure leaves database unchanged.
- Database RPC failure after public upload deletes newly uploaded public object.
- Published image replacement generates new unique path with `upsert: false`.
- Old public asset is removed only after successful database update.
- Unpublish/archive demotes public image to private bucket.

### Public & Browser Tests
- Draft never appears on `/`, `/blog`, `/topics`, `/portfolio`, or `/blog/[slug]`.
- Published article appears on public surfaces immediately.
- Published update reflects on public surfaces.
- Category change updates both old and new topic listing pages.
- Unpublished / archived article disappears from public site.
- Republished article returns at exact same canonical slug.
- Admin-local preview reflects unsaved editor state without making database mutations.

### Quality Gate Suite Baseline
- Existing verified baseline: **9 files, 124 tests, 0 failures**.
- Stage-8 test suite will add test file `10_stage8_publishing_workflow.test.sql` to expand coverage across all lifecycle rules.
- Local gates: `npx supabase db reset`, `npx supabase test db`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`, `git diff --check`.

### Multi-Viewport Responsive Verification
- Desktop (1440x900)
- Tablet (1024x768)
- Mobile (390x844)
- Narrow Mobile (320x640)
- 0px horizontal overflow across all modal dialogues and editor viewports.

---

## 11. Decision Gates & Recommended Choices Summary

| Gate | Focus | Recommended Choice | Rationale |
|---|---|---|---|
| **DG8-01** | Preview Architecture | **Implement Admin-Local Preview in Stage 8** | Reuses tested renderer, zero token overhead, zero leak risk, real-time feedback on unsaved edits. |
| **DG8-02** | Canonical Slug Contract | **Auto-Generated on First Publish with DB Authority & Permanent Freeze** | Clean SEO URLs, collision-safe, permalink stability without complex redirect subsystem. |
| **DG8-03** | Publication Timestamps | **`published_at` Set on First Publish; Preserved Forever on Update/Republish** | Truthful historical publication metadata; `updated_at` records revisions. |
| **DG8-04** | Published Editing | **Direct In-Place Editing with Atomic Update RPC** | Avoids complex versioning while ensuring transactional safety and image replacement tracking. |
| **DG8-05** | Database Mutation | **Focused PostgreSQL `SECURITY INVOKER` RPCs per Lifecycle Transition** | Maximum auditability, atomic reference replacement, tight RLS, explicit source status enforcement. |
| **DG8-06** | Unpublish vs Archive | **Explicit 3-State Lifecycle Machine (`draft`, `published`, `archived`)** | Clear semantics for temporary unpublishing vs permanent retirement with restore capability. |
| **DG8-07** | Delete Rules | **Allowed ONLY for Never-Published Records (`published_at IS NULL`)** | Protects canonical URL ownership and prevents accidental loss of historical public records. |
| **DG8-08** | Image Promotion & Demotion | **Unique Paths (`upsert: false`) with Compensating Orchestration** | Clean separation of private drafts and public assets; safe promotion and demotion flows. |
| **DG8-09** | Cache Revalidation | **Targeted `revalidatePath` on Affected Public & Admin Routes** | Ensures instantaneous freshness across feeds, archives, detail pages, and topic categories. |
| **DG8-10** | Security / Leakage | **`requireAdmin()` Server Gate + Locked DB Functions + Non-Weakened Public Queries** | Preserves impenetrable defense-in-depth isolation. |

---

## 12. PROPOSED — D030 — Stage-8 Publishing Lifecycle Architecture

### Decision Status:
**PROPOSED / AWAITING PROJECT-OWNER APPROVAL**
*(This decision is recorded in this design document for external review and will be formally added to `docs/11-DECISION-LOG.md` only upon explicit owner authorization).*

### Context:
Stage 8 requires a robust, secure, and maintainable publishing workflow for a single-author medical editorial publication. The system must support drafting, previewing, publishing, editing published content, unpublishing, archiving, and deletion without introducing unneeded enterprise complexity.

### Decision:
1. **Admin-Local Preview:** Implement an interactive full-fidelity preview mode inside the private `ArticleEditor` workspace, reusing existing presentational components (`ArticleTypography`, `ReferenceLedger`) and unsaved client state without public preview routes, tokens, or cookies.
2. **Permanent Canonical Slug Freeze:** Canonical slugs are generated from title on first publication (with manual override allowed prior to first publish), resolved for collisions inside the DB transaction, and permanently frozen across all subsequent lifecycle transitions (update, unpublish, archive, restore, republish).
3. **Immutable Publication Timestamp:** `published_at` is set upon first publication and preserved permanently across all updates, unpublishing, and republishing to reflect truthful original publication history.
4. **Focused `SECURITY INVOKER` Lifecycle RPCs:** Implement `publish_article`, `update_published_article`, `unpublish_article`, `archive_article`, `restore_article`, and `delete_article` with locked search paths, strict parameter validation, and `private.is_admin()` checks.
5. **Permalink & Deletion Safety:** Hard deletion is permitted strictly for never-published records (`published_at IS NULL`). Ever-published records must be retired via `Archive`.
6. **Storage Invariant & Unique-Path Promotion/Demotion:** Enforce that public articles use `public-assets` while draft/archived articles use `draft-assets`. Promote/demote images using unique paths with `upsert: false` and compensating rollback on failure.
7. **Targeted Revalidation:** Apply surgical `revalidatePath` calls across affected public routes (including category change handling) and admin indices upon lifecycle mutations.
8. **Uncompromised Public Queries:** Public data queries in `src/lib/public-articles.ts` remain strictly filtered by `status = 'published'`.

---

## 13. Implementation Sequence (Post-Approval)

1. **Phase 8A — Database Migration & Lifecycle RPCs:**
   - Author migration with `publish_article`, `update_published_article`, `unpublish_article`, `archive_article`, `restore_article`, `delete_article`;
   - Author pgTAP tests in `supabase/tests/database/10_stage8_publishing_workflow.test.sql`;
   - Verify local database reset and test suite pass.
2. **Phase 8B — Server Actions & Image Promotion Service:**
   - Implement `publishArticleAction`, `updatePublishedArticleAction`, `unpublishArticleAction`, `archiveArticleAction`, `restoreArticleAction`, `deleteArticleAction` in `src/app/admin/articles/actions.ts`;
   - Implement image promotion/demotion helper in `src/lib/admin/image-promotion.ts`;
   - Integrate Next.js `revalidatePath` calls.
3. **Phase 8C — Editorial UI & Lifecycle Controls:**
   - Update `ArticleEditor` with publish, update, unpublish, archive, restore, delete action buttons and confirmation modals;
   - Implement admin-local interactive preview mode/modal in `ArticleEditor`;
   - Update `/admin/articles` table with lifecycle quick actions and filters.
4. **Phase 8D — Quality Gates, Visual Verification & Hosted Deployment:**
   - Run typecheck, lint, format check, build, and pgTAP;
   - Capture responsive multi-viewport screenshots;
   - Controlled hosted Supabase migration and verification under owner authorization.
