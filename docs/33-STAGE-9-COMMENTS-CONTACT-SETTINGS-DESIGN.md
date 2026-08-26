# 33 — Stage 9 Comments, Contact Inbox, Settings & Featuring Architecture Design

**Stage:** Stage 9 — Comments, Contact Inbox & Settings  
**Authority:** Approved Architecture Decision **D032** (`docs/11-DECISION-LOG.md`)  
**Canonical Stage-9 Base SHA:** `d7efeb7687e3d98f6af94c06300027b6275022ef`  
**Active Working Branch:** `stage/09-comments-contact-settings`  

---

## 1. Executive Summary & Scope Boundary

Stage 9 activates the four remaining administrative and interactive workflows defined in the frozen V1 scope (`docs/01-SCOPE-FREEZE.md`):
1. **Public Comments & Moderation:** Public readers can submit plain-text comments on published articles; Marie moderates pending submissions (`pending -> approved / hidden / delete`).
2. **Contact Inbox:** Public visitors can submit contact inquiries; Marie manages incoming messages (`new -> read -> archived`).
3. **Site Settings Singleton:** Marie can configure core editorial copy, disclaimer text, and verified social links for the site singleton (`public.site_settings` with `id = 1`).
4. **Portfolio & Lead Article Featuring:** Marie can select published articles to be featured on the homepage (at most one lead article) and in the clinical portfolio (multi-select).

### Non-Goals & Strict Exclusions (Frozen V1 Boundaries)
* **No Reader Accounts:** Public readers remain unauthenticated. No registration, login, profile, or reader session state.
* **No Email / Notification Integrations:** No transactional email sending (Resend, SendGrid, SES) or webhook notifications.
* **No CAPTCHA Services:** No third-party widget dependencies (reCAPTCHA, Turnstile). Abuse defense is handled via database transaction rate limiting, low-cost honeypots, and optional platform WAF.
* **No Edge Functions / Client Service-Role:** All submissions execute through standard Server Actions and the PostgREST publishable API under Row Level Security. Service-role credentials remain server-only.
* **No Comment Replies / Reactions / Rich Formatting:** Comments are strictly flat, plain-text submissions. No nested threads, likes, upvotes, or Markdown/HTML rendering.
* **No Duplicate Portfolio CMS:** Portfolio entries reuse published rows from `public.articles` via `is_portfolio_featured = true`. No separate portfolio table or manual drag-and-drop ordering.
* **No Arbitrary Key/Value Store:** Site settings strictly adhere to the typed `public.site_settings` schema.
* **No Stage 10 Work:** Dynamic SEO metadata generator and sitemap automation remain frozen for Stage 10.

---

## 2. Data Model & Schema Reuse (Stage-3 Alignment)

Stage 9 builds upon the foundational schema established in Stage 3 (`supabase/migrations/20260825054917_initial_database_security_foundation.sql`):

### 2.1. Comments Schema (`public.comments`)
* `id` (`uuid`, PK, default `gen_random_uuid()`)
* `article_id` (`uuid`, FK -> `public.articles.id`, cascade delete)
* `commenter_name` (`text`, NOT NULL)
* `commenter_email` (`text`, NOT NULL, **strictly private / admin-only**)
* `body` (`text`, NOT NULL, plain text)
* `status` (`text`, check `status IN ('pending', 'approved', 'hidden')`, default `'pending'`)
* `created_at` (`timestamptz`, default `now()`)
* `moderated_at` (`timestamptz`, nullable)

**New Phase-9A Constraints:**
* **Moderation Consistency:** `(status = 'pending' AND moderated_at IS NULL) OR (status IN ('approved', 'hidden') AND moderated_at IS NOT NULL)`.
* **Rate-Limit Supporting Indexes:**
  * `idx_comments_rate_email_created`: `(commenter_email, created_at DESC)`
  * `idx_comments_rate_created`: `(created_at DESC)`

### 2.2. Contact Messages Schema (`public.contact_messages`)
* `id` (`uuid`, PK, default `gen_random_uuid()`)
* `name` (`text`, NOT NULL)
* `email` (`text`, NOT NULL)
* `subject` (`text`, NOT NULL)
* `message` (`text`, NOT NULL)
* `status` (`text`, check `status IN ('new', 'read', 'archived')`, default `'new'`)
* `created_at` (`timestamptz`, default `now()`)

**New Phase-9A Indexes:**
* `idx_contact_messages_rate_email_created`: `(email, created_at DESC)`
* `idx_contact_messages_rate_created`: `(created_at DESC)`

### 2.3. Site Settings Schema (`public.site_settings`)
* `id` (`integer`, PK, check `id = 1`)
* `site_title` (`text`, NOT NULL, check `length(trim(site_title)) > 0 AND length(site_title) <= 120`)
* `tagline` (`text`, nullable, check `tagline IS NULL OR length(tagline) <= 200`)
* `homepage_intro` (`text`, nullable, check `homepage_intro IS NULL OR length(homepage_intro) <= 1200`)
* `disclaimer_text` (`text`, nullable, check `disclaimer_text IS NULL OR length(disclaimer_text) <= 1500`)
* `default_seo_description` (`text`, nullable, check `default_seo_description IS NULL OR length(default_seo_description) <= 320`)
* `social_links` (`jsonb`, NOT NULL, default `'[]'::jsonb`, check `jsonb_typeof(social_links) = 'array'`)
  * **Application-level Persistent Structure (D032 Addendum):**
    ```typescript
    type SiteSocialLink = {
      label: string;
      url: string;
    };
    ```
  * Persisted representation: `SiteSocialLink[]` stored as a JSONB array.
  * Validation: HTTPS only, non-empty label (<= 80 chars), blank rows omitted, partial rows rejected.
  * No provider/platform enum, no icon identifier, no separate social table, array order preserved.
  * Real production URLs remain Stage-12 content.
* `updated_at` (`timestamptz`, default `now()`)

### 2.4. Article Featuring Constraints (`public.articles`)
* **Publication Precondition:**
  * `is_featured = true` requires `status = 'published'`.
  * `is_portfolio_featured = true` requires `status = 'published'`.
* **Lead Article Uniqueness:** Partial unique index `CREATE UNIQUE INDEX idx_articles_single_featured ON public.articles (is_featured) WHERE is_featured = true;`.

---

## 3. Public vs Private Access Matrix & Defense-in-Depth

| Entity | Role / Context | Operations | Allowed Columns / Constraints |
| :--- | :--- | :--- | :--- |
| `public.comments` | Anonymous / Public | `SELECT` | `id, article_id, commenter_name, body, created_at` (WHERE `status = 'approved'` AND parent article is `published`) |
| `public.comments` | Anonymous / Public | `INSERT` | `article_id, commenter_name, commenter_email, body` (Trigger forces `status = 'pending'`, `moderated_at = null`) |
| `public.comments` | Authenticated Admin | `SELECT, UPDATE, DELETE` | Full table access (`commenter_email`, `status`, `moderated_at`) |
| `public.contact_messages` | Anonymous / Public | `INSERT` | `name, email, subject, message` (Trigger forces `status = 'new'`) |
| `public.contact_messages` | Anonymous / Public | `SELECT, UPDATE, DELETE` | **DENIED (Zero public read/write access)** |
| `public.contact_messages` | Authenticated Admin | `SELECT, UPDATE` | Full table access (`status` update only; no delete UI in V1) |
| `public.site_settings` | Anonymous / Public | `SELECT` | All columns (read-only for layout rendering) |
| `public.site_settings` | Authenticated Admin | `SELECT, UPDATE` | Full singleton update access |

---

## 4. Public Abuse Defense & Rate Limit Contract

To protect the database against automated spam and Denial-of-Wallet attacks without relying on third-party CAPTCHA widgets or unauthenticated Edge Functions, Stage 9 implements a multi-tiered defense:

### 4.1. Rate Limiting Thresholds (Database Enforced)
1. **Public Comments:**
   * **Per Email + Article:** Max **3 submissions** per rolling **15 minutes**.
   * **Per Email (Site-wide):** Max **10 submissions** per rolling **24 hours**.
   * **Global Site-wide:** Max **100 submissions** per rolling **1 hour**.
2. **Public Contact Messages:**
   * **Per Email:** Max **3 submissions** per rolling **1 hour**.
   * **Per Email:** Max **5 submissions** per rolling **24 hours**.
   * **Global Site-wide:** Max **30 submissions** per rolling **1 hour**.

### 4.2. Private Trigger Architecture (`private.guard_comment_submission` & `private.guard_contact_submission`)
* **Execution Timing:** `BEFORE INSERT FOR EACH ROW`.
* **Security Context:** `SECURITY DEFINER` (required to inspect private submission history across rows).
* **Isolation Guarantees:**
  * `SET search_path = ''` (eliminates search-path hijacking vulnerabilities).
  * Fully schema-qualified references (`public.comments`, `pg_catalog.now()`, etc.).
  * Privileges explicitly revoked: `REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon, authenticated;`.
  * Private schema is **NOT** exposed via PostgREST.
* **Concurrency Protection:** Uses fixed transaction-level advisory locks (`pg_advisory_xact_lock(...)`) to prevent race conditions during rolling-window count checks.
* **Context Awareness:**
  * Detects real web requests via request JWT claims without using deprecated `auth.role()`.
  * Skips web rate limits during migration/seed/admin operations.
  * Normalizes inputs: trims whitespace, lowercases emails, strips leading/trailing newlines.

---

## 5. Administrative RPCs & Actions

### 5.1. Lead Feature Control RPC (`public.set_featured_article`)
* **Signature:** `public.set_featured_article(p_article_id uuid)`
* **Security:** `SECURITY INVOKER`, `search_path = ''`, gated by `private.is_admin()`.
* **Behavior:**
  * If `p_article_id IS NULL`: Clears lead featured flag from all articles (`UPDATE public.articles SET is_featured = false WHERE is_featured = true`).
  * If `p_article_id IS NOT NULL`: Verifies article exists and is `published`; atomically unsets any existing lead feature and sets `is_featured = true` on target article.

### 5.2. Admin Server Actions (`src/app/admin/.../actions.ts`)
* `moderateCommentAction(commentId, action: 'approve' | 'hide' | 'delete')`: Updates status and sets `moderated_at = now()`, or deletes row.
* `updateContactMessageStatusAction(messageId, status: 'new' | 'read' | 'archived')`: Updates inbox status.
* `updateSiteSettingsAction(formData)`: Validates and updates singleton settings row.
* `togglePortfolioFeaturedAction(articleId, featured: boolean)`: Toggles `is_portfolio_featured` under `requireAdmin()`.
* `setLeadFeaturedArticleAction(articleId: string | null)`: Invokes `set_featured_article`.

---

## 6. Public UI & Component Integration

* **Article Page (`/blog/[slug]`):**
  * Renders approved comments chronologically (Server Component).
  * Renders accessible comment submission form with client-side optimistic feedback and honeypot field.
* **Contact Page (`/contact`):**
  * Renders accessible contact form with validation, character countdowns, and honeypot field.
* **Homepage (`/`):**
  * Displays lead featured article banner if configured.
  * Uses `homepage_intro`, `tagline`, and `disclaimer_text` from site settings with graceful fallbacks.
* **Portfolio Page (`/portfolio`):**
  * Displays curated grid of articles where `is_portfolio_featured = true` and `status = 'published'`.

---

## 7. Development & Implementation Phases

* **Phase 9A — Database & Security Foundation (Current):**
  * Add moderation invariant constraints, feature-flag constraints, and site settings constraints.
  * Implement private trigger guards with transaction rate limits and normalization.
  * Implement `set_featured_article` RPC.
  * Create comprehensive pgTAP test suite (`supabase/tests/database/11_stage9_comments_contact_settings.test.sql`).
* **Phase 9B — Public Comments & Contact Submissions:**
  * Implement public Server Actions with Zod validation.
  * Implement public submission forms with honeypot fields on `/blog/[slug]` and `/contact`.
* **Phase 9C — Admin Moderation & Contact Inbox:**
  * Implement `/admin/comments` moderation workspace with tabbed status filtering (Pending, Approved, Hidden).
  * Implement `/admin/messages` contact inbox workspace with Read/Archive status management.
* **Phase 9D — Site Settings & Portfolio Featuring:**
  * Implement `/admin/settings` singleton editor with HTTPS social link validation.
  * Implement `/admin/portfolio` featuring controls and homepage lead selector.
* **Phase 9E — Full Local / Browser Quality Gates:**
  * End-to-end browser verification of moderation, contact, settings, and featuring workflows.
  * Complete regression test suite.
* **Phase 9F — Hosted Supabase Deployment (Separate Owner Authorization):**
  * Apply migration to hosted Supabase via dedicated write transport; verify zero drift and run security advisors.
* **Phase 9G — Stage Closeout & Handoff:**
  * Final handoff documentation and project-owner merge approval.

---

## 8. Compliance & Governance Invariants

* **Single-Author Architecture:** Dashboard access remains strictly restricted to Marie (`private.is_admin()`).
* **No Medical Claims:** Test fixtures must use clearly synthetic content.
* **Accessibility:** All new forms, tables, and dialogs must adhere to WCAG AA standards (labels, focus rings, contrast, keyboard shortcuts).
* **Next Stage Boundary:** **Stage 10 (Dynamic SEO & Discovery) remains NOT AUTHORIZED.**
