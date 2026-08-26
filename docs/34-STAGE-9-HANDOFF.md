# 34 — Stage 9 Handoff

**Stage:** Stage 9 — Comments, Contact Inbox & Settings
**Branch:** `stage/09-comments-contact-settings`
**Canonical Stage-9 base:** `d7efeb7687e3d98f6af94c06300027b6275022ef`
**Phase-9F final HEAD:** `baf26631371cf9694cbab7fb0993c744c4948978`
**Phase-9G closeout HEAD:** see git closeout record below
**Status:** COMPLETE / GATE PASS / READY FOR PROJECT-OWNER MERGE REVIEW
**Date:** 2026-08-26
**Authority:** D032, D032 Structured Social Links Addendum, D033, D033 Execution Addenda 1–3

---

## Stage

`Stage 9 — Comments, Contact Inbox & Settings`

---

## Objective completed

Stage 9 activated the four remaining interactive and administrative workflows defined in the frozen V1 scope. Public readers can now submit plain-text comments on published articles, which Marie moderates through a dedicated admin workspace (pending → approved / hidden / delete). Public visitors can submit contact inquiries through a validated, rate-limited contact form, and Marie can manage incoming messages (new → read → archived) in a private admin inbox with same-page reader experience. Marie can now configure core editorial copy, disclaimer text, and verified social links through a typed site-settings singleton, with changes propagating instantly to the public header, footer, and medical disclaimer component — including the admin-local article preview. Marie can also curate the site's Selected Writing portfolio (multi-select from published articles) and select at most one lead featured article for the homepage, controlled atomically through a dedicated admin RPC. A complete database-layer abuse-defense system was deployed: two private SECURITY DEFINER trigger functions enforce input normalization, system-field ownership, and multi-tier rate limiting on all public comment and contact submissions, with transaction-level advisory locking to eliminate race conditions. All Stage-9 work operated without reader accounts, reader authentication, email notification services, CAPTCHA services, or service-role credential exposure in application or browser code. Phases 9A through 9F were completed across local implementation, external review corrections, native Playwright/axe browser testing, and controlled hosted Supabase deployment.

---

## Files / areas changed

### Governance

- `docs/11-DECISION-LOG.md` — D032, D032 Structured Social Links Addendum, D033, D033 Execution Addenda 1–3
- `docs/13-PROJECT-STATUS.md` — Stage-9 progress records (Phases 9A–9G)
- `docs/33-STAGE-9-COMMENTS-CONTACT-SETTINGS-DESIGN.md` — Stage-9 architecture design specification
- `docs/34-STAGE-9-HANDOFF.md` — this document

### Database migration / security

- `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql` — the single Stage-9 migration (Phase 9A)
- `supabase/tests/database/11_stage9_comments_contact_settings.test.sql` — 113 pgTAP subtests covering all Stage-9 database invariants, security boundaries, guard function behavior, and rate-limiting boundaries

### Public submissions

- `src/lib/public-submissions.ts` — Zod validation schemas (`commentSubmissionSchema`, `contactSubmissionSchema`), honeypot helper, `SubmissionActionResult` type
- `src/lib/public-comments.ts` — `getApprovedCommentsByArticleId()` — explicitly selects only safe public columns, never selects `commenter_email`
- `src/app/blog/[slug]/actions.ts` — `submitCommentAction` Server Action (createClient, narrow insert, safe errors)
- `src/app/contact/actions.ts` — `submitContactAction` Server Action (createClient, narrow insert, safe errors)
- `src/components/public/comment-form.tsx` — accessible comment form with honeypot, `useActionState`, stale-feedback clearing
- `src/components/public/comment-section.tsx` — Server Component integrating approved comment list and comment form into article pages
- `src/components/public/contact-form-shell.tsx` — activated contact form with live character counters, honeypot, stale-feedback clearing, Evidence Folio styling

### Admin comments moderation

- `src/lib/admin/comments.ts` — `getAdminComments()`, `getAdminCommentById()` — explicit column selection, zero service-role
- `src/app/admin/comments/actions.ts` — `moderateCommentAction` (requireAdmin, UUID validation, approve/hide/delete, targeted revalidation)
- `src/app/admin/comments/page.tsx` — Comments workspace with filter tabs, private email indicator, plain-text rendering, action forms

### Admin contact inbox

- `src/lib/admin/messages.ts` — `getAdminContactMessages()`, `getAdminContactMessageById()` — explicit column selection, side-effect-free reads
- `src/app/admin/messages/actions.ts` — `updateContactMessageStatusAction` (requireAdmin, UUID validation, read/archive/restore, no delete)
- `src/app/admin/messages/page.tsx` — Same-page inbox workspace (message list + reader pane), private email display, lifecycle actions

### Site settings

- `src/lib/admin/settings-validation.ts` — `siteSettingsSchema` (Zod), structured social link validation (HTTPS only, blank rows omitted, partial rows rejected)
- `src/lib/admin/settings.ts` — `getAdminSiteSettings()`
- `src/app/admin/settings/actions.ts` — `updateSiteSettingsAction` (requireAdmin, Zod validation, business fields only, trigger-owned `updated_at`)
- `src/components/admin/site-settings-form.tsx` — Settings form with live character counters, dynamic social link rows, accessible error states

### Portfolio featuring

- `src/lib/admin/portfolio.ts` — `getAdminPortfolioArticles()` (published only), public lead-article helper
- `src/app/admin/portfolio/actions.ts` — `togglePortfolioFeaturedAction`, `updateLeadFeaturedArticleAction` (invokes `public.set_featured_article` RPC)
- `src/app/admin/portfolio/page.tsx` — Portfolio workspace for lead article selection and Selected Writing curation

### Public settings propagation & preview fidelity

- `src/components/public/public-shell.tsx` — consumes live site settings for disclaimer propagation
- `src/components/public/site-header.tsx` — social links and site title from live settings
- `src/components/public/site-footer.tsx` — social links and tagline from live settings
- `src/components/public/medical-disclaimer.tsx` — reusable, driven from live `disclaimer_text`
- `src/components/admin/article-preview-modal.tsx` — consumes verified public profile and saved `disclaimer_text`; no fabricated credentials; no client-side profile/settings reads

### Stage-9 automated test suites

- `supabase/tests/database/11_stage9_comments_contact_settings.test.sql` — 113 pgTAP subtests
- `tests/stage9-phase9b-public-submissions.test.mjs` — 11 Node tests (public submissions contracts, privacy, UI)
- `tests/stage9-phase9c-admin-moderation-inbox.test.mjs` — 10 Node test suites (moderation/inbox security, contracts, UI)
- `tests/stage9-phase9d-settings-portfolio.test.mjs` — 18 Node test suites (settings validation, portfolio, disclaimer propagation, preview fidelity)

### Playwright / accessibility tooling (Phase 9E)

- `tests/e2e/stage9-accessibility-responsive.spec.ts` — responsive matrix, keyboard navigation, axe WCAG scan, runtime error guard
- `tests/e2e/stage9-admin-workflows.spec.ts` — comment moderation lifecycle, contact inbox lifecycle
- `tests/e2e/stage9-public-submissions.spec.ts` — public comment and contact form E2E flows
- `tests/e2e/stage9-security-boundaries.spec.ts` — anonymous admin redirect, draft/archive 404, private email exclusion
- `tests/e2e/stage9-settings-portfolio.spec.ts` — settings save/propagation, preview fidelity, portfolio curation
- `tests/e2e/helpers/local-only.ts` — strict local-only guard (port 54321, halts on non-local target)
- `playwright.config.ts` — Playwright configuration (single worker, local Supabase, Chromium)

### Navigation / routing additions

- `src/app/admin/comments/page.tsx` — new `/admin/comments` route
- `src/app/admin/messages/page.tsx` — new `/admin/messages` route
- `src/app/admin/settings/page.tsx` — new `/admin/settings` route
- `src/app/admin/portfolio/page.tsx` — new `/admin/portfolio` route
- `src/components/admin/admin-shell.tsx` — navigation updated with Stage-9 routes

---

## Database changes

### Migration

- **Filename:** `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
- **SHA-256:** `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6`
- **Hosted migration version:** `20260826142425`
- **Hosted migration name:** `stage9_submission_security_and_feature_controls`
- **Hosted project:** `eoexnnhqzrkurbqgbtnx`

### Constraints added (10)

| Table | Constraint |
|---|---|
| `public.comments` | `comments_moderation_consistency_check` |
| `public.articles` | `articles_is_featured_published_check` |
| `public.articles` | `articles_is_portfolio_featured_published_check` |
| `public.site_settings` | `site_settings_singleton_id_check` |
| `public.site_settings` | `site_settings_title_check` |
| `public.site_settings` | `site_settings_tagline_check` |
| `public.site_settings` | `site_settings_homepage_intro_check` |
| `public.site_settings` | `site_settings_disclaimer_check` |
| `public.site_settings` | `site_settings_seo_desc_check` |
| `public.site_settings` | `site_settings_social_links_array_check` |

### Indexes added (5)

| Table | Index |
|---|---|
| `public.articles` | `idx_articles_single_featured` (partial unique, `WHERE is_featured = true`) |
| `public.comments` | `idx_comments_rate_email_created` |
| `public.comments` | `idx_comments_rate_created` |
| `public.contact_messages` | `idx_contact_messages_rate_email_created` |
| `public.contact_messages` | `idx_contact_messages_rate_created` |

### Triggers added (2)

| Table | Trigger | Function |
|---|---|---|
| `public.comments` | `trg_guard_comment_submission` (BEFORE INSERT) | `private.guard_comment_submission()` |
| `public.contact_messages` | `trg_guard_contact_submission` (BEFORE INSERT) | `private.guard_contact_submission()` |

### Functions added (3)

#### `private.guard_comment_submission()`

- Language: PL/pgSQL
- Security: `SECURITY DEFINER`
- `search_path = ''`
- EXECUTE revoked from `PUBLIC`, `anon`, `authenticated`
- Enforces: system-field normalization (`id`, `created_at`, `status`, `moderated_at` forced), input trim/lowercase, non-empty validation, advisory-locked rate limits (3/15m/email+article, 10/24h/email, 100/1h global), API-context detection without `auth.role()`

#### `private.guard_contact_submission()`

- Language: PL/pgSQL
- Security: `SECURITY DEFINER`
- `search_path = ''`
- EXECUTE revoked from `PUBLIC`, `anon`, `authenticated`
- Enforces: system-field normalization (`id`, `created_at`, `status` forced), input trim/lowercase, non-empty validation, advisory-locked rate limits (3/1h/email, 5/24h/email, 30/1h global), API-context detection without `auth.role()`

#### `public.set_featured_article(p_article_id uuid)`

- Language: PL/pgSQL
- Security: `SECURITY INVOKER`
- `search_path = ''`
- EXECUTE revoked from `PUBLIC`, `anon`; granted to `authenticated`
- Enforces: `private.is_admin()` check, target must be published, atomic clear-and-set of `is_featured`

### RLS invariants (unchanged by Stage 9)

RLS remained enabled and verified on all required tables post-migration:

| Table | RLS Enabled |
|---|---|
| `public.articles` | ✅ |
| `public.comments` | ✅ |
| `public.contact_messages` | ✅ |
| `public.site_settings` | ✅ |

### Privacy invariants (unchanged by Stage 9)

| Grant check | Result |
|---|---|
| `anon` SELECT on `public.comments.commenter_email` | **false** ✅ |
| `anon` SELECT on `public.contact_messages` | **false** ✅ |
| `anon` SELECT on `public.comments.body` | **true** ✅ |

### Rate-limiting architecture

All rate limits operate inside trigger functions using `pg_advisory_xact_lock` to prevent race conditions under concurrent submissions. Limits apply only to API requests from non-admin callers (detected via `request.jwt.claims`). Admin inserts bypass guards.

| Scope | Limit | Window |
|---|---|---|
| Comment: email + article | 3 | 15 minutes |
| Comment: email site-wide | 10 | 24 hours |
| Comment: global | 100 | 1 hour |
| Contact: email | 3 | 1 hour |
| Contact: email site-wide | 5 | 24 hours |
| Contact: global | 30 | 1 hour |

---

## Environment changes

- **No new application secrets or environment variables** were added in Stage 9.
- **No service-role credential** exists in application code or browser-accessible code.
- **No Auth mutations** were performed (sign-up settings, OAuth providers, and email providers remain unchanged from Stage 4).
- **No Storage mutations** were performed (buckets `public-assets` and `draft-assets` are unchanged from Stages 3 and 7 respectively).
- **No Vercel production mutations** were performed.
- **No WAF configuration** was modified.
- Local Supabase `supabase/config.toml` auth hardening (`enable_signup = false`, `enable_anonymous_sign_ins = false`) remains intact from Stage 4.

---

## Decisions made

| Decision | Status | Summary |
|---|---|---|
| **D032** | ACTIVE | Stage-9 Comments, Contact Inbox, Settings & Featuring architecture. Single-admin model. No reader accounts. Database-layer abuse defense via private trigger guards. |
| **D032 Structured Social Links Addendum** | ACTIVE | `social_links` persisted as `{ label, url }[]` JSONB array. HTTPS only. No provider enum. No icon identifier. No separate table. Real client URLs deferred to Stage 12. |
| **D033** | ACTIVE | Stage-9 controlled hosted migration deployment. Staged MCP write transport. SHA-256 verification required. Single authorized attempt per round. No automatic retry. |
| **D033 Execution Addendum 1** | RECORDED | First deployment path produced zero hosted mutation (MCP transport limitations). |
| **D033 Execution Addendum 2** | RECORDED | Replacement attempt authorized after zero-mutation confirmation. Preconditions documented. |
| **D033 Execution Addendum 3** | RECORDED | Replacement attempt succeeded. `apply_migration` → `{"success":true}`. Hosted migration version `20260826142425`. Full pre-flight and post-migration verification passed. |

See `docs/11-DECISION-LOG.md` for complete decision text.

---

## Verification performed

### Database (local)

```
npx supabase db reset       PASS — all 5 migrations applied cleanly
npx supabase test db        PASS — 323/323 tests (11 pgTAP files, 0 failures)
```

pgTAP suite (323 subtests across 11 files):

| File | Status |
|---|---|
| `01_schema_structure.test.sql` | PASS |
| `02_anonymous_access.test.sql` | PASS |
| `03_comments_security.test.sql` | PASS |
| `04_contact_messages_security.test.sql` | PASS |
| `05_authenticated_non_admin.test.sql` | PASS |
| `06_admin_access.test.sql` | PASS |
| `07_storage_security.test.sql` | PASS |
| `08_public_is_admin_rpc.test.sql` | PASS |
| `09_stage7_draft_authoring.test.sql` | PASS |
| `10_stage8_publishing_workflow.test.sql` | PASS |
| `11_stage9_comments_contact_settings.test.sql` | PASS (113 subtests) |

### Node regression suite

```
node --test tests/*.test.mjs    PASS — 67/67 tests (0 failures)
```

### Application gates

```
npm run typecheck    PASS (0 errors)
npm run lint         PASS (0 errors, 0 warnings)
npm run format:check PASS (all files match Prettier style)
npm run build        PASS (18 routes compiled cleanly)
git diff --check     PASS
```

Build route manifest (18 routes):

`/` `/about` `/admin` `/admin/articles` `/admin/articles/[id]` `/admin/articles/new` `/admin/comments` `/admin/login` `/admin/messages` `/admin/portfolio` `/admin/settings` `/blog` `/blog/[slug]` `/contact` `/disclaimer` `/portfolio` `/topics/[slug]` `/_not-found`

### Native browser / accessibility (Phase 9E)

```
npx playwright test    PASS — 15/15 tests (5 suites, 0 failures)
```

| Suite | Tests | Result |
|---|---|---|
| `stage9-accessibility-responsive.spec.ts` | 5 | PASS |
| `stage9-admin-workflows.spec.ts` | 2 | PASS |
| `stage9-public-submissions.spec.ts` | 2 | PASS |
| `stage9-security-boundaries.spec.ts` | 3 | PASS |
| `stage9-settings-portfolio.spec.ts` | 3 | PASS |

- **Playwright version:** `1.62.1` (Chromium, local Supabase, single worker)
- **`@axe-core/playwright` version:** `4.13.0`
- **Automated WCAG coverage:** 2.0, 2.1, 2.2 Level A and AA
- **axe serious violations:** 0
- **axe critical violations:** 0
- **Admin keyboard / focus:** PASS (Settings Space/Enter activation, Comments Tab reachability, Messages list/reader/actions, Article Preview Space/Escape/focus return)
- **Representative visual review:** 9 screenshots reviewed against `docs/18-UI-IMPLEMENTATION-CONTRACT.md` and `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`; Evidence Folio meaningful drift: NONE

### Hosted Supabase verification (Phase 9F)

Pre-flight (all verified before `apply_migration`):

| Check | Result |
|---|---|
| `list_migrations` — 4 Stage-8 baseline entries, Stage-9 absent | ✅ |
| `anon_commenter_email_select` | false ✅ |
| `anon_contact_messages_select` | false ✅ |
| `anon_comment_body_select` | true ✅ |
| RLS on all 4 required tables | true ✅ |
| Stage-9 constraints/indexes/triggers/functions | 0/0/0/0 ✅ |

Migration apply:

| | |
|---|---|
| Tool | `supabase_stage9_write/apply_migration` |
| Result | `{"success":true}` |
| Hosted version | `20260826142425` |

Post-migration (all verified after `apply_migration`):

| Check | Result |
|---|---|
| `list_migrations` — 5 entries including Stage-9 | ✅ |
| Constraints | 10/10 ✅ |
| Indexes | 5/5 ✅ |
| Triggers | 2/2 ✅ |
| Functions | 3/3 ✅ |
| `guard_comment_submission` — SECURITY DEFINER, empty search_path, EXECUTE denied | ✅ |
| `guard_contact_submission` — SECURITY DEFINER, empty search_path, EXECUTE denied | ✅ |
| `set_featured_article` — SECURITY INVOKER, empty search_path, anon NO / auth YES | ✅ |
| RLS post-migration — all 4 tables | true ✅ |
| Privacy grants post-migration | email=false / contact=false / body=true ✅ |
| Persistent rows | comments=0 / contact=0 / settings=0 / articles=1 (expected) ✅ |

### Supabase Security Advisor

- **0 security errors**
- 1 INFO: `rls_enabled_no_policy` on `private.admin_users` — expected/by design for the internal private-schema table
- 1 WARN: `auth_leaked_password_protection` — pre-existing Supabase Auth dashboard configuration item; not introduced by Stage 9

### Supabase Performance Advisor

- **0 performance errors**
- 8 INFO `unused_index` notices — expected on the current pre-production instance with no production traffic

---

## Known limitations

- **Vercel / WAF not configured in Stage 9.** Production WAF rate-limit rules (complementing the database-layer guards) remain for a future operations/infrastructure stage.
- **`auth_leaked_password_protection` warning** is a pre-existing Supabase Auth dashboard setting, not introduced by Stage 9. Enabling it requires a dashboard configuration change outside the migration system.
- **Unused-index INFO notices** are expected on the current pre-production instance and should be reassessed after representative production traffic exists.
- **Real client settings and social URLs** (site title, tagline, homepage intro, disclaimer, social links) remain placeholder/empty. Real content is a Stage-12 client-content responsibility.
- **No notification system.** When a new comment or contact message is submitted, Marie receives no email, push, or webhook notification. Comment/contact discovery is through the admin inbox only.
- **No CAPTCHA service.** Abuse defense relies on database-layer transaction rate limiting, honeypot detection, and server-side input validation. A platform WAF can provide additional protection as a complementary infrastructure layer.
- **No manual portfolio ordering.** The Selected Writing portfolio uses the natural database order of featured articles. Explicit ordering controls are out of V1 scope.
- **No reader accounts.** Public visitors remain unauthenticated throughout.
- **Playwright CDN intermittency.** During Phase 9E the Playwright browser driver download from the upstream Azure CDN returned intermittent 404s in the local environment. Tests were run when the driver was available and passed 15/15. The verified resolved versions used during Stage-9 testing were Playwright `1.62.1` and `@axe-core/playwright` `4.13.0`; `package.json` specifies these as `^1.62.1` and `^4.13.0` respectively.

---

## Scope not implemented

Stage 9 explicitly did NOT add:

- Reader accounts, reader authentication, or reader session state
- Multi-author workflows or complex role-based access control beyond the existing single-admin model
- Comment replies, nested threads, reactions, or rich comment formatting
- Real-time comment or message updates (no WebSockets or Supabase Realtime subscriptions)
- Email notification system for new comments or contact messages
- CAPTCHA dependency (reCAPTCHA, Turnstile, or equivalent)
- Public Edge Function submission layer
- Browser-accessible service-role credentials
- Arbitrary key/value settings store (all settings fields are typed and constrained)
- Separate portfolio CMS table or manual drag-and-drop portfolio ordering
- Stage-10 SEO metadata generator, sitemap automation, or any other Stage-10 work

---

## Next stage readiness

**Stage 9 — COMPLETE / GATE PASS / READY FOR PROJECT-OWNER MERGE REVIEW**

**Stage-9 branch `stage/09-comments-contact-settings` has NOT been merged into `main`.**

**Stage 10 has NOT been authorized and has NOT been started.**

When the project owner approves Stage-9 merge:

1. Merge `stage/09-comments-contact-settings` into `main` using `--no-ff`.
2. Verify merge commit parents (prior `main` + Stage-9 branch head).
3. Verify merge tree matches Stage-9 branch tree.
4. Run full post-merge quality gate: `supabase db reset`, `supabase test db`, `node --test`, `typecheck`, `lint`, `format:check`, `build`, `git diff --check`.
5. Synchronize GitHub `origin/main`.
6. Record merge commit SHA in `docs/13-PROJECT-STATUS.md`.
7. Authorize Stage 10 separately with explicit project-owner approval.

---

## Rule for the next agent

Read this handoff before modifying Stage-9 output. Read `AI_CONTEXT.md`, `AGENTS.md`, and `docs/13-PROJECT-STATUS.md` before any work. Stage-10 authorization requires explicit project-owner approval — do not infer it from branch state, partial experiments, or this handoff document.
