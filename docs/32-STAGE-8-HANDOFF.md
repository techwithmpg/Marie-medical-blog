# Stage 8 — Publishing Workflow: Hosted Deployment & Verification Handoff

This document records the completed hosted Supabase deployment and post-deployment quality gate verification for Stage 8 under approved architecture decision **D030** and deployment authorization **D031** (including replacement write authorization).

---

## 1. Stage & Deployment Metadata

* **Stage:** Stage 8 — Publishing Workflow
* **Architecture Decision:** `D030` (`docs/31-STAGE-8-PUBLISHING-WORKFLOW-DESIGN.md`)
* **Hosted Deployment Authorization:** `D031` (`docs/11-DECISION-LOG.md`) + Owner Replacement Attempt Authorization (2026-08-26)
* **Target Hosted Supabase Project:** `eoexnnhqzrkurbqgbtnx`
* **Canonical Stage-8 Base SHA:** `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
* **Pre-Replacement Branch SHA:** `dcfa532aa689926e89a0be72eb681ab5e38bf95c`
* **Replacement Authorization Commit SHA:** `8f4497a43d748a8418ed8992a36cd56e58b535df`
* **Active Working Branch:** `stage/08-publishing-workflow`
* **Final Migration File:** `supabase/migrations/20260825232024_stage8_publishing_lifecycle.sql`
* **Migration SHA-256:** `0dd86f9c1e790eda1495f9e11f56d979d2fa92fd4dc69678eea7a61870d42770`
* **Hosted Migration Version:** `20260825232024` (reconciled with local migration filename)
* **Migration Apply Outcome:** `PASS` (`{"success": true}`)

---

## 2. Hosted Database & Function Security Verification

1. **Hosted Migration Ledger (`list_migrations`):**
   * `20260825054917_initial_database_security_foundation`
   * `20260825081012_add_public_is_admin_rpc`
   * `20260825200129_stage7_draft_authoring_foundation`
   * `20260825232024_stage8_publishing_lifecycle`
2. **Lifecycle RPCs Verified (6/6 Present):**
   * `public.publish_article`
   * `public.update_published_article`
   * `public.unpublish_article`
   * `public.archive_article`
   * `public.restore_article`
   * `public.delete_article`
3. **Security Invariant Verification:**
   * **Security Invoker:** `prosecdef = false` verified on all 6 lifecycle RPCs.
   * **Search Path:** Locked to empty (`search_path = ''`) on all 6 lifecycle RPCs.
   * **Public / Anon Access:** `PUBLIC` and `anon` execution privileges explicitly revoked.
   * **Authenticated Access:** Execution granted strictly to `authenticated`.
   * **Administrative Authorization Gate:** All functions enforce `IF NOT coalesce(private.is_admin(), false) THEN RAISE EXCEPTION`.
   * **Row Level Security (RLS):** Active and enforced on `public.articles` and `public.article_references`.
4. **Stage-7 Baseline Compatibility:**
   * `public.save_article_draft` is preserved, unmodified, and admin-protected (`SECURITY INVOKER`, `search_path = ''`).

---

## 3. Storage & Authentication Integrity

* **Bucket ACLs:**
  * `draft-assets`: `public = false` (private authoring bucket).
  * `public-assets`: `public = true` (public CDN delivery bucket).
* **Storage Policies:** Existing admin-only write policies remain active with zero drift.
* **Authentication:** `auth.users` count and user records remain completely unchanged.
* **Seed Data:** No seed data or fixture pollution was deployed.

---

## 4. Synthetic Hosted Lifecycle Verification

Executed full transactional synthetic verification against hosted Supabase:
* **Workflow Tested:**
  1. `save_article_draft` -> Created synthetic draft (`status = draft`, `slug = draft-<UUID>`, `published_at = null`).
  2. `publish_article` -> Transitioned to `published`, assigned canonical kebab slug, assigned `published_at = now()`.
  3. `update_published_article` -> Updated title, excerpt, and references while strictly locking slug, status, and `published_at`.
  4. `unpublish_article` -> Transitioned to `draft`, cleared featured flags, preserved canonical slug and original `published_at`.
  5. `publish_article` (republish) -> Transitioned to `published`, verified frozen canonical slug and original `published_at`.
  6. `archive_article` -> Transitioned to `archived`, retired from public visibility.
  7. `restore_article` -> Transitioned to `draft`, preserved canonical slug and `published_at`.
  8. `delete_article` -> **Strictly rejected** deletion because `published_at IS NOT NULL` (permalink preservation rule).
  9. Transaction cleanup executed.
* **Persistent Synthetic Database Rows:** `0`
* **Persistent Synthetic Storage Objects:** `0`

---

## 5. Local Quality Gates Baseline (Post-Reconciliation)

* **Database Reset:** `npx supabase db reset` (clean reset across all 4 migrations including `20260825232024_stage8_publishing_lifecycle.sql`).
* **Database Tests (pgTAP):** `npx supabase test db` (10 files, 210 tests, 0 failures, 100% pass).
* **Node Test Suite:** `node --test tests/*.test.mjs` (5 files, 28 tests, 0 failures, 100% pass).
* **TypeScript Typecheck:** `npm run typecheck` (`tsc --noEmit`) passed with 0 errors.
* **ESLint:** `npm run lint` passed with 0 warnings/errors.
* **Prettier:** `npm run format:check` passed with 100% compliance.
* **Production Build:** `npm run build` (`next build`) succeeded with 12/12 static/dynamic routes cleanly compiled.
* **Git Hygiene:** `git diff --check` passed with 0 conflict or whitespace errors.

---

## 6. Environment Changes

* **Application Environment Variables:** No environment variables added or removed.
* **Authentication Configuration:** No production Auth configuration changes.
* **Application Runtime Transport:** No persistent MCP or write connection becomes part of the application runtime.
* **Inspection Connection:** Normal Supabase inspection connection remains configured in read-only mode (`read_only=true`).
* **Credential Boundaries:** No service-role or secret credentials added to application or browser-facing code.

---

## 7. Known Limitations

1. **Synthetic Hosted Storage Mutation:** Hosted synthetic lifecycle verification intentionally used no featured image and therefore did not mutate hosted Storage objects.
2. **Local Storage Lifecycle Proof:** Real cross-bucket Storage promotion, demotion, replacement, and compensation behavior was verified against local Supabase through `tests/stage8-storage-lifecycle-e2e.test.mjs`.
3. **Targeted Invariant Testing:** Hosted verification validated database lifecycle and security invariants while avoiding unnecessary production Storage mutations.
4. **Single-Current-Article Model:** This is not a revision/version-history system; D030 intentionally preserves the frozen V1 single-current-article model.
5. **Stage Scope Boundaries:** Stage 8 does not implement comments, contact inbox, settings, or any Stage-9 features.

---

## 8. Scope Not Implemented

Stage 8 intentionally does **NOT** add:
* Reader accounts or reader authentication;
* Multi-author or editorial role hierarchies;
* Article revision/version-control subsystem;
* Public draft-preview route or unauthenticated preview tokens;
* Slug redirect or URL history subsystem;
* AI article generation;
* Stage-9 comments, contact inbox, or settings implementation.

---

## 9. Next Stage Readiness

* **Stage 8 Status:** **READY FOR OWNER MERGE APPROVAL**
* **Stage 8 Merge:** **NOT YET AUTHORIZED**
* **Stage 9 Status:** **NOT AUTHORIZED**

Stage 9 may begin only after:
1. Stage 8 receives explicit project-owner merge approval;
2. Stage 8 is merged to `main`;
3. `main` is verified and synchronized;
4. Stage-8 branch cleanup is complete;
5. Stage 9 receives separate explicit project-owner authorization.
