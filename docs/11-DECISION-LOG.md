# 11 — Architecture & Product Decision Log

Only record decisions that materially affect product behavior, architecture, security, scope, or future agents.

## ACTIVE — D001 — Framework
**Decision:** Next.js App Router + TypeScript.
**Reason:** Strong fit for SEO-heavy public content, server rendering, metadata, and a single integrated application.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D002 — Backend
**Decision:** Supabase PostgreSQL + Auth + Storage.
**Reason:** Integrated managed data/auth/storage with PostgreSQL and explicit RLS model.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D003 — Editor
**Decision:** Tiptap.
**Reason:** Customizable structured rich-text editing suitable for a controlled authoring experience.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D004 — Deployment
**Decision:** Vercel.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D005 — User model
**Decision:** One primary writer/admin in V1. Readers do not have accounts.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D006 — Portfolio model
**Decision:** Portfolio primarily features selected articles rather than duplicating a second independent content type.
**Status:** ACTIVE unless manual-order requirements justify a small relation/order table.

## ACTIVE — D007 — Profile image
**Decision:** Personal photo is optional and not required by the layout.
**Reason:** Client expressed preference for limited personal exposure.

## ACTIVE — D008 — Brand direction
**Decision:** Warm, modern, professional medical editorial aesthetic using restrained soft/nude color families rather than generic hospital blue.

## ACTIVE — D009 — Comment moderation
**Decision:** New comments default to pending. Admin can approve, hide, or delete. Comment email, if collected, remains private.

## ACTIVE — D010 — Article category model
**Decision:** One primary category per article in V1 unless a verified content need emerges before schema freeze.

## ACTIVE — D011 — Branch strategy
**Date:** 2026-08-23
**Decision:** Keep `main` as the approved stable branch and use one short-lived `stage/<nn>-<short-name>` branch for each authorized major development stage. Narrow `fix/<short-name>` branches are permitted only for genuinely scoped corrections and may not bypass stage gates.
**Reason:** Keeps unfinished AI/developer work out of the canonical branch, creates clear stage review boundaries, and supports the project's one-stage-at-a-time discipline.
**Alternatives considered:** Direct development on `main`; a long-lived `develop` branch; multiple simultaneous feature branches across stages.
**Impact:** Stage work must begin from synchronized `main`, pass its gate, receive owner approval, and then merge back to `main`.
**Approved by:** project owner.
**Status:** ACTIVE / FROZEN FOR V1 DEVELOPMENT WORKFLOW.

## ACTIVE — D012 — ChatGPT Project and repository synchronization
**Date:** 2026-08-23
**Decision:** The committed local Git repository remains the canonical durable source of project truth; GitHub is its synchronized remote mirror, and the ChatGPT Project is a controlled research/planning mirror. Material ChatGPT recommendations require owner approval and repository documentation before implementation authority exists.
**Reason:** Prevents web research, chat memory, stale Project sources, and local coding agents from creating contradictory architecture or scope.
**Alternatives considered:** Treating ChatGPT Project memory as independent authority; treating web research as self-executing implementation guidance.
**Impact:** Synchronization mechanics are refined by D021: when GitHub access is available, live accepted `main` reads replace routine manual Project Source refreshes; research outputs must still distinguish facts, constraints, recommendations, decision impact, and implementation status.
**Approved by:** project owner.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D013 — Authoritative active-stage record
**Date:** 2026-08-23
**Decision:** `docs/13-PROJECT-STATUS.md` is the authoritative repository record for the active development stage, authorization boundary, gate state, blockers, and next-stage readiness.
**Reason:** Existing documents defined the stage sequence but did not provide one unambiguous current-stage record for humans and AI agents.
**Alternatives considered:** Inferring the active stage from branch names, recent commits, chat history, or unfinished implementation.
**Impact:** Agents must read the status file before implementation work and may not infer stage authorization from branch names or repository contents.
**Approved by:** project owner.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D014 — GitHub repository visibility
**Date:** 2026-08-23
**Decision:** Keep `techwithmpg/Marie-medical-blog` public unless the owner later changes visibility. Public visibility does not permit secrets, confidential client material, unpublished private data, or production credentials to be committed.
**Reason:** The owner explicitly approved a public repository and accepted the corresponding repository hygiene requirements.
**Alternatives considered:** Private GitHub repository.
**Impact:** Secret scanning discipline, synthetic fixtures, `.env` exclusion, and staged-diff review are mandatory throughout development. Any exposed credential must be rotated immediately.
**Approved by:** project owner.
**Status:** ACTIVE.

## ACTIVE — D015 — Stage-1 runtime and package-manager baseline
**Date:** 2026-08-23
**Decision:** Use Node.js `24.x` LTS, npm, and a committed `package-lock.json`. Bootstrap against the latest stable Next.js `16.x` Active LTS release available when Stage 1 executes; do not use canary/beta/RC builds.
**Reason:** Node 24 is the current LTS and Vercel default; Next.js 16.x is the current Active LTS line. npm minimizes toolchain complexity and Vercel recognizes `package-lock.json` directly.
**Alternatives considered:** Node 26 Current; Node 22 LTS; pnpm; Yarn; Bun; Next.js canary.
**Impact:** Stage 1 records Node 24 in `.nvmrc` and `package.json#engines`, uses npm exclusively, and captures exact installed versions through the lockfile.
**Approved by:** project owner through Stage-0 toolchain closeout authorization.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D016 — Next.js scaffold conventions
**Date:** 2026-08-23
**Decision:** Use TypeScript, App Router, Tailwind CSS, ESLint, Turbopack, `src/`, `@/*` → `./src/*`, empty scaffold, no scaffold-created Git repository, and React Compiler disabled initially. Because the governance repository is non-empty, scaffold in a temporary sibling directory and copy reviewed application/toolchain files into the canonical repo without overwriting governance.
**Reason:** Preserves the existing Git/governance source of truth while adopting current stable Next.js defaults intentionally and avoiding starter product content.
**Alternatives considered:** Scaffolding directly over the repository root; Pages Router; JavaScript; webpack; no `src/`; React Compiler enabled by default.
**Impact:** Stage 1 is a controlled foundation merge, not a destructive reinitialization of the repository.
**Approved by:** project owner through Stage-0 toolchain closeout authorization.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D017 — Linting, formatting, and shadcn structural baseline
**Date:** 2026-08-23
**Decision:** Use Next.js ESLint rules plus strict TypeScript checks; use exact-version Prettier with `prettier-plugin-tailwindcss` and `eslint-config-prettier`; initialize shadcn/ui structurally on Base UI with Tailwind v4 and CSS variables, but defer final visual preset/tokens and broad component installation to Stage 2.
**Reason:** Separates correctness from deterministic formatting, keeps Tailwind class order consistent across AI/human edits, follows current shadcn guidance for new projects, and prevents Stage 1 from pre-empting the design-system stage.
**Alternatives considered:** Biome-only tooling; no formatter; Radix base; React Aria base; final visual preset during Stage 1.
**Impact:** Stage 1 adds only foundation tooling; Stage 2 remains responsible for the Marie-specific design system.
**Approved by:** project owner through Stage-0 toolchain closeout authorization.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D018 — Supabase key and CLI timing baseline
**Date:** 2026-08-23
**Decision:** Reserve `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for future integration, use Supabase's new publishable-key model for this new project, do not add a secret/service-role variable unless Stage 3 proves it necessary, and defer Supabase CLI installation/`supabase init` to Stage 3.
**Reason:** Current Supabase guidance favors publishable/secret keys over legacy `anon`/`service_role` keys, and database tooling belongs to the database/security stage rather than the Next.js foundation.
**Alternatives considered:** Legacy key names; adding a secret key by default; initializing Supabase during Stage 1.
**Impact:** Stage 1 remains database-neutral while preserving a secure environment-variable contract for Stage 3.
**Approved by:** project owner through Stage-0 toolchain closeout authorization.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D019 — Evidence Folio V1 UI design system
**Date:** 2026-08-23
**Decision:** Freeze the owner-accepted V1 visual direction as **Warm Medical Editorial with Scientific Restraint — The Evidence Folio**. The canonical UI contract is `docs/18-UI-IMPLEMENTATION-CONTRACT.md` and the accepted visual-reference manifest is `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`. The signature system is Evidence Rail + Folio Numbers + Split Rule + Reference Ledger + Topic Imprint; primary typography is Newsreader + Source Sans 3; the accepted semantic palette centers parchment/paper, ink, oxide and deep sage; public/admin experiences remain deliberately distinct; responsive design is first-class.
**Reason:** The owner approved the research-backed visual direction and desktop/tablet/mobile prototype set. Recording the system prevents later AI/developer implementation from collapsing into default shadcn, generic beige editorial styling, or inconsistent page-by-page redesign.
**Alternatives considered:** leaving visual direction as informal chat/mockups; default shadcn styling; generic healthcare/hospital-blue styling; Clinical Ledger; Human Atlas.
**Impact:** UI implementation stages must conform to the canonical contract and visual manifest. Generated mockup text/data are visual placeholders only and may not override scope, data, security or factual-content governance. Any material redesign requires owner approval and a decision-log update.
**Approved by:** project owner in the 2026-08-23 UI research/design review.
**Status:** ACTIVE / FROZEN FOR V1 VISUAL IMPLEMENTATION.

## ACTIVE — D020 — UI dependency, motion and no-drift implementation policy
**Date:** 2026-08-23
**Decision:** Keep the UI dependency surface minimal and stage-gated. Use the frozen Tailwind v4 + customized shadcn/Base UI foundation; use Marie-specific custom components for the Evidence Folio identity; allow the approved helper categories in `docs/18-UI-IMPLEMENTATION-CONTRACT.md` only when the owning stage is authorized and a real need exists. Restrained `motion`, Sonner, Zod, React Hook Form/resolvers, controlled Tiptap extensions, and later Playwright/axe verification are allowed under that stage policy. Manual reorder tooling such as dnd-kit remains decision-gated. Do not add competing UI kits, generic global-state/data libraries, chart/carousel/animation stacks, dark-mode infrastructure, article-PDF generation, AI editor plugins, collaboration tooling, or other convenience dependencies without a verified need and approval.
**Reason:** The accepted experience needs high visual quality but the product remains a small single-author publication. A controlled package policy reduces bundle weight, security/dependency surface and AI drift while preserving room for the interactions actually represented by the approved design.
**Alternatives considered:** broad package installation up front; defaulting to large component suites; using GSAP/Redux/TanStack Query/charting/carousel stacks by convenience; treating mockup interactions as automatic package requirements.
**Impact:** A package being named as allowed does not authorize installation out of stage. Agents must inspect existing dependencies first, add only the smallest justified dependency within an authorized stage, and document any deviation. `docs/18-UI-IMPLEMENTATION-CONTRACT.md` is the detailed policy.
**Approved by:** project owner in the 2026-08-23 UI implementation-planning review.
**Status:** ACTIVE / FROZEN FOR V1 UI IMPLEMENTATION POLICY.

## ACTIVE — D021 — Live repository context synchronization for ChatGPT
**Date:** 2026-08-23
**Decision:** When GitHub access is available, the ChatGPT Project and other remote research/review contexts must use the current accepted GitHub `main` as the live freshness surface for repository governance. Before substantial architecture, UX, data, security, SEO, dependency, implementation, or scope work, resolve the current `main` SHA and read the required live governance set defined in `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md`. Static ChatGPT Project Sources are bootstrap/fallback context only; a newer verified accepted `main` supersedes them without requiring manual re-upload. Unmerged branches do not become canonical.
**Reason:** Manually regenerating and re-uploading Project Source snapshots after every accepted merge is repetitive and can itself create stale duplicate context. Live repository reads preserve the repository as canonical while reducing synchronization overhead.
**Alternatives considered:** manually replacing Project Sources after every merge; treating ChatGPT memory as authoritative; building an external automation that mutates ChatGPT Project uploads.
**Impact:** Repository-to-ChatGPT freshness is checked at task time. Static Project Sources remain useful when GitHub access is unavailable or for non-repository artifacts, but they no longer need to be refreshed solely because `main` advanced. If live access is unavailable, use the newest verified snapshot, state its source SHA/limitation, and do not assume freshness. This decision refines D012 only for synchronization mechanics and does not authorize any implementation stage.
**Approved by:** project owner in the 2026-08-23 synchronization-governance review.
**Status:** ACTIVE / FROZEN.
## ACTIVE — D022 — Stage-3 database and single-admin security baseline
**Date:** 2026-08-25
**Decision:** Implement the Stage-3 Supabase PostgreSQL schema, RLS policies, PostgreSQL privileges, Storage bucket, and automated pgTAP tests under the design frozen in `docs/23-STAGE-3-DATABASE-SECURITY-DESIGN.md`:
1. Version-controlled SQL migrations in `supabase/migrations/` are the authoritative executable schema source of truth;
2. Single-admin authorization via `private.admin_users` and `private.is_admin()` with search_path safety instead of complex multi-user RBAC or client-editable JWT metadata;
3. No reader or multi-author permission system in V1;
4. Defense in depth combining explicit PostgreSQL table/column `GRANT`/`REVOKE` privileges with fine-grained Row Level Security;
5. Commenter email privacy enforced by revoking SELECT privileges on `commenter_email` from `anon`;
6. Narrow public comment and contact message submission via restricted INSERT column grants and RLS checks forcing safe pending/new statuses;
7. Optional media metadata table deferred in favor of Storage metadata + direct asset paths;
8. Single `public-assets` Storage bucket with public read access and admin-only mutation policies.
**Reason:** Provides the minimum secure database and authorization architecture required for a single-writer V1 publication while strictly enforcing public/private boundaries, preventing data leakage, and creating a reliable foundation for Stage 4 Auth.
**Alternatives considered:** Generic RBAC roles table; storing role in `raw_user_meta_data`; using a security-invoker view for comments; exposing entire comments table with frontend filtering; creating separate media metadata and portfolio content tables.
**Impact:** Authorizes the creation of the Stage-3 initial migration, synthetic development seed fixtures, and automated pgTAP security tests. Prohibits any schema changes via Supabase Dashboard Table/SQL Editor or remote seed data deployment.
**Approved by:** project owner through the 2026-08-25 Stage-3 execution instruction.
## ACTIVE — D023 — Authenticated comment privacy and single-admin isolation
**Date:** 2026-08-25
**Decision:** Restrict SELECT access on `public.comments` under the `authenticated` PostgreSQL role strictly to allowlisted administrators (`private.is_admin()`). Authenticated non-admin users are denied comment SELECT access entirely. Public comment reading is served exclusively to the `anon` role with PostgreSQL column-level SELECT privileges restricting access to safe public columns (`id`, `article_id`, `commenter_name`, `body`, `status`, `created_at`) while `commenter_email` and `moderated_at` remain completely inaccessible to `anon`.
**Reason:** In PostgreSQL, RLS policies filter rows but cannot selectively mask columns based on row-level conditions for a single shared role (`authenticated`). Because V1 has no reader accounts or multi-user roles and only one authenticated writer/admin (Marie), authenticated non-admin users have no legitimate need to query comments. Denying comment SELECT access to authenticated non-admins entirely prevents any leakage of `commenter_email` without requiring complex dynamic column masking or separate reader role grants.
**Alternatives considered:** Permitting authenticated non-admin reads on approved comments (leaked `commenter_email` due to table-level column grant); attempting complex conditional security-definer views or column-masking functions for readers; creating a dedicated reader role.
**Impact:** `public.comments` authenticated SELECT RLS policy is updated to `using (private.is_admin())`. Automated pgTAP security tests explicitly verify that authenticated non-admins cannot select `commenter_email` or any comment rows, while `anon` retains safe public column reads and admins retain full moderation and email access.
**Approved by:** project owner through the 2026-08-25 Stage-3 security correction instruction.
**Status:** ACTIVE / FROZEN FOR STAGE 3.

## ACTIVE — D024 — Hosted Stage-3 migration deployment via project-scoped Supabase MCP
**Date:** 2026-08-25
**Decision:** When direct/session-pooler PostgreSQL connectivity is unavailable from the development network, Stage-3 hosted database migrations may be deployed through the official Supabase MCP server using the project-scoped connection for `eoexnnhqzrkurbqgbtnx`. The version-controlled SQL migration under `supabase/migrations/` remains the authoritative executable schema source of truth. MCP write access may be enabled temporarily only to apply the exact reviewed, version-controlled migration. Arbitrary SQL, dashboard schema edits, production seed deployment, Auth changes, Edge Functions, branching operations, and Stage-4 changes remain prohibited. After deployment and verification, the MCP connection must be returned to read-only mode.
**Reason:** The current network permits Supabase HTTPS/MCP connectivity but blocks the Supavisor session pooler on port 5432. MCP provides an authenticated, project-scoped deployment transport without weakening migration-first governance.
**Alternatives considered:** Manual dashboard SQL execution (unversioned/unreviewed risk); local-only database with unverified remote deployment; disabling session pooler SSL.
**Impact:** Stage-3 hosted deployment may use `apply_migration` through Supabase MCP instead of `db push` when the normal PostgreSQL session transport is unavailable. This does not change the schema design, RLS model, migration source of truth, or authorization boundary.
**Approved by:** project owner.
**Status:** ACTIVE / FROZEN FOR STAGE 3.

## ACTIVE — D025 — MCP migration-version reconciliation
**Date:** 2026-08-25
**Decision:** Because the current Supabase MCP `apply_migration` operation does not accept the version from a local migration filename, an MCP-deployed Stage-3 migration must be reconciled immediately after successful deployment if the hosted migration version differs from the local version. The exact reviewed SQL from the version-controlled migration must be supplied unchanged to `apply_migration`. After deployment, retrieve the generated hosted migration version using `list_migrations`. If it differs from the local migration version, rename the local migration file so its timestamp/version exactly matches the hosted migration version while preserving the SQL contents. Update repository documentation that explicitly references the former version, rerun the full local Stage-3 database test suite and quality gates, and verify local/hosted migration-history parity. Do not modify `supabase_migrations` manually, do not use migration repair to fabricate parity, do not apply a second migration, and do not deploy seed data.
**Reason:** Supabase MCP migration application may generate hosted migration metadata independently from the filename of the local migration. Immediate repository reconciliation preserves one-to-one migration history while keeping the version-controlled migration as the schema source of truth.
**Impact:** MCP remains an approved Stage-3 deployment transport under D024 while hosted migration history and the repository are reconciled before Stage-3 closeout.
**Approved by:** project owner — explicit authorization on 2026-08-25.
**Status:** ACTIVE / FROZEN FOR STAGE 3.

## ACTIVE — D026 — Stage-4 single-admin authentication & route protection architecture
**Date:** 2026-08-25
**Decision:** Implement the V1 single-admin authentication architecture for Marie using `@supabase/supabase-js` and `@supabase/ssr` with cookie-based SSR. House the dedicated admin login at `/admin/login` utilizing Supabase email/password authentication (`signInWithPassword`). Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` as the application environment contract. Refresh session tokens in Next.js 16 via `proxy.ts` utilizing `supabase.auth.getClaims()`. Restrict Proxy responsibilities to token refresh and baseline anonymous redirection without equating authentication with administrative privilege or replacing server authorization. Enforce server-side route protection across all `/admin` routes using a dedicated `requireAdmin()` helper that cryptographically verifies identity via `getClaims()` and evaluates allowlist membership via a new authenticated SQL proxy function `public.is_admin()` defined as `SECURITY INVOKER` delegating to `private.is_admin()`, acting strictly as an access gate without attempting cookie mutations from Server Components. Execute session revocation for failed non-admin attempts inside `loginAction()` and execute explicit logout through a cookie-writing Server Action. Apply a strict generic error policy ("Unable to sign in with those credentials.") for all authentication and allowlist failures. Disable arbitrary public signup at the Supabase Auth service level via "Allow new users to sign up = OFF" and provision Marie's single administrator account out-of-band via Supabase Dashboard directly into `private.admin_users (user_id)`. Public signup, reader authentication, OAuth, phone/magic-link auth, client-stored roles in `user_metadata`, and browser exposure of service-role keys remain strictly prohibited.
**Reason:** The publication requires a calm, secure, single-admin workspace for Marie. Utilizing modern `@supabase/ssr` cookies and Next.js 16 proxy with `getClaims()` ensures trustworthy session validation without stale or unverified JWTs. The two-step `requireAdmin()` gate backed by `private.admin_users` ensures authenticated non-admin accounts cannot access administrative capabilities or private data. Disabling public signups at the service level prevents unauthorized account creation via the public publishable key, while restricting session cookie mutation to valid server mutation contexts prevents Server Component runtime errors.
**Alternatives considered:** Using deprecated `@supabase/auth-helpers-nextjs`; relying on `getSession()` on the server; attempting `signOut()` inside Server Components; storing admin roles in JWT user metadata; relying solely on proxy redirects for admin security; exposing `private.admin_users` directly to PostgREST; defining `public.is_admin()` as `SECURITY DEFINER`; adding multi-role RBAC libraries.
**Impact:** Introduces `@supabase/supabase-js` and `@supabase/ssr`; creates Supabase client helpers in `src/lib/supabase/`; adds Next.js proxy in `src/proxy.ts`; adds `src/lib/auth/admin.ts`; creates `/admin/login` and `/admin` routes; adds a focused migration for `public.is_admin()` as `SECURITY INVOKER` with pgTAP security tests; enforces out-of-band provisioning of Marie's `user_id`.
**Approved by:** project owner — explicit approval on 2026-08-25.
**Status:** ACTIVE / FROZEN FOR STAGE 4.

## ACTIVE — D027 — Stage-4 controlled MCP migration deployment and version reconciliation
**Date:** 2026-08-25
**Decision:** When the standard Supabase CLI PostgreSQL deployment transport is unavailable from the development network, the single reviewed Stage-4 migration may be deployed to project `eoexnnhqzrkurbqgbtnx` through a temporary, project-scoped Supabase MCP connection with database write capability. The version-controlled Stage-4 migration is the authoritative SQL source. MCP `apply_migration` may be invoked exactly once with the exact reviewed SQL. After deployment, capture the hosted migration version. If MCP assigns a different migration version, rename the local migration file so its timestamp/version exactly matches hosted migration history without changing its SQL content, rerun the complete local database/security and application quality gates, and verify local/hosted migration-history parity. Temporary MCP write access must then be completely removed and the existing project-scoped MCP connection restored/retained in read-only mode.
**Boundaries:** No arbitrary hosted write SQL, no production seed deployment, no Auth-user creation, no insertion into `private.admin_users`, no Edge Functions, no Dashboard schema changes, no second migration application, and no Stage-5 work. Hosted Auth configuration already frozen by D026 may be changed only within the separately owner-authorized Stage-4 configuration step.
**Reason:** The reviewed Stage-4 migration has passed local database/security testing, but the normal Supabase CLI deployment transport remains unavailable because the development network cannot reach the PostgreSQL/session-pooler transport. The controlled MCP procedure preserves migration-first governance without introducing permanent elevated application credentials.
**Approved by:** project owner — explicit approval on 2026-08-25.
**Status:** ACTIVE / FROZEN FOR STAGE 4.

### D027 execution addendum — one replacement migration attempt
- **Date:** 2026-08-25
- The original `apply_migration` invocation was rejected by the stale read-only MCP session with: "Cannot apply migration in read-only mode."
- Hosted inspection confirmed zero mutation occurred.
- Project owner explicitly authorizes exactly ONE replacement `apply_migration` invocation through a freshly bound `supabase_stage4_write` connection.
- No additional retry is authorized.
- All other D027 restrictions remain unchanged.
- Marie provisioning remains unauthorized.
- Stage 5 remains unauthorized.

## ACTIVE — D028 — Stage-7 draft authoring persistence, editor schema, and private draft-media architecture
**Date:** 2026-08-25
**Decision:** Freeze the Stage-7 writer/editor architecture around four owner-approved decisions:

A. FIRST-SAVE DRAFT CREATION: `/admin/articles/new` does NOT immediately insert an "Untitled Draft" row. The user may compose an unsaved draft locally. The first explicit Save Draft operation creates the persistent article row. Generate one UUID server-side using platform cryptographic UUID generation. Use it as the article ID and derive the internal provisional slug as `draft-<uuid>` (conceptually equivalent to `draft-${crypto.randomUUID()}`). The provisional slug satisfies the existing NOT NULL / UNIQUE / kebab-case schema, is internal, is not presented as the canonical publication slug, never makes the draft public, and is replaced or finalized only by the Stage-8 publishing workflow. Stage 8 retains ownership of canonical public slug behavior.

B. TIPTAP EDITOR SCHEMA: Freeze the initial Stage-7 editor dependency set to `@tiptap/react@3.30.3`, `@tiptap/pm@3.30.3`, `@tiptap/starter-kit@3.30.3`, and `@tiptap/extension-placeholder@3.30.3`. Do NOT install a separate `@tiptap/extension-link` package (Tiptap v3 StarterKit already includes Link). Configure StarterKit's built-in Link. Tiptap v3 StarterKit also includes Underline; explicitly configure `underline: false` because the public renderer does not support underline formatting. Restrict heading levels to H2 and H3 (H1 remains reserved for the article title). Canonical article body persistence remains Tiptap / ProseMirror JSON stored directly into `public.articles.content_json`. The initial Stage-7 editor schema does NOT include underline, inline Image nodes, TableKit/table nodes, TextAlign, CharacterCount extension, collaboration, AI authoring, or review/comment extensions. Character counts required by form UX are calculated directly from normal field/editor state. For Stage 7, the authorized image/media authoring path is the featured-image workflow; inline body-image nodes are not enabled.

C. PRIVATE DRAFT MEDIA: Draft images must NOT be stored in the existing `public-assets` bucket (which is public and intended for published/public assets). Stage 7 introduces through a reviewed migration during implementation a new private storage bucket: `draft-assets`. Purpose: private unpublished draft featured images. Initial constraints: `public = false`, max file size = 5 MB, allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`. Storage RLS: SELECT, INSERT, UPDATE, DELETE permitted to authenticated admin only (utilizing existing `private.is_admin()`). No anon read, no anon write, no public URL access, no service-role credential. Draft image preview uses authenticated access or short-lived signed URLs. Stage 8 owns promotion/copying of the chosen publication asset from `draft-assets` to `public-assets` and updating the published article's final public featured-image path.

D. ATOMIC DRAFT SAVE: Stage 7 uses one reviewed PostgreSQL SECURITY INVOKER RPC (`public.save_article_draft`) for reliable, atomic article + reference persistence. The function executes one database transaction for first persistent draft creation OR existing draft update, article field persistence, structured reference replacement, and deterministic reference `sort_order`. The function executes as SECURITY INVOKER with an explicit safe `search_path`, is callable only by authenticated callers, rejects anon/public execution, retains RLS, explicitly requires `private.is_admin()`, refuses to mutate an existing article unless `status = 'draft'`, forces new articles to `status = 'draft'`, forces new drafts to `published_at = null`, never publishes/archives/deletes, never mutates published or archived records, leaves feature flags (`is_featured`, `is_portfolio_featured`) unchanged on updates (defaulting to `false` on new drafts), and returns article ID, provisional slug, and `updated_at`. The RPC supports both the initial and subsequent Save Draft operations; article updates and reference replacement succeed or fail together. A DELETE-then-INSERT sequence performed as separate PostgREST requests is prohibited. Server Actions remain responsible for `requireAdmin()` re-verification, application input validation, invoking the RPC, and translating database failures into controlled UI errors.

**Reason:** Avoids abandoned database rows from merely clicking New Article; preserves Stage-8 ownership of canonical publication slugs; prevents Tiptap/public-renderer schema drift; prevents unpublished draft images from becoming publicly accessible; prevents partial draft saves from deleting or corrupting structured academic references.
**Alternatives considered:** Immediate "Untitled Draft" row creation; nullable slug migration; separate Link extension alongside StarterKit; enabling StarterKit Underline; adding TableKit/image nodes immediately; storing draft images in `public-assets`; adding a `public.media` table; separate article UPDATE + references DELETE/INSERT requests; service-role-backed admin writes.
**Impact:** Stage-7 implementation requires four Tiptap packages (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`), one reviewed migration creating private `draft-assets` storage configuration/policies and the atomic `public.save_article_draft` RPC, pgTAP regression tests for atomicity and rollback, and Stage-7 server/client editor implementation. No public article query model is changed, and no Stage-8 workflow is authorized.
**Approved by:** project owner — explicit approval on 2026-08-25.
**Status:** ACTIVE / FROZEN FOR STAGE 7.

## ACTIVE — D029 — Stage-7 controlled hosted migration deployment and verification
**Date:** 2026-08-26
**Decision:** The project owner explicitly authorized Stage-7 hosted migration deployment and verification for target Supabase project `eoexnnhqzrkurbqgbtnx` on 2026-08-26:
1. ONLY the single reviewed and local-gate-passed Stage-7 migration (`supabase/migrations/20260825200129_stage7_draft_authoring_foundation.sql`) may be deployed.
2. Deployment transport follows the established pattern (D024/D027): prefer standard CLI migration push if available; if direct PostgreSQL/session pooler transport is blocked by development network policies, a temporary project-scoped Supabase MCP write connection may be used to apply the exact reviewed SQL once.
3. If MCP is used and generates a different hosted migration version, reconcile the local migration filename to match the hosted version history without modifying SQL content, update genuine governance references, and re-verify all local gates under D025/D027.
4. No production seed deployment (`supabase/seed.sql` remains strictly local).
5. No hosted Auth configuration changes (signups remain disabled, email auth enabled).
6. No Auth-user creation or password modification for Marie's production admin account.
7. No arbitrary write SQL or manual schema mutation via Table/SQL editor.
8. Private `draft-assets` bucket and `public.save_article_draft` SECURITY INVOKER RPC are the only new hosted Stage-7 database and storage objects.
9. Verify end-to-end draft authoring workflow, zero-row initial route load, persistent article ID reuse, private featured image upload, signed preview, and strict public leak protection using exactly one clearly synthetic private verification draft.
10. Migration-first governance remains authoritative; Stage 8 and branch merging remain NOT AUTHORIZED.
**Reason:** Stage 7 passed all local quality gates, external code review, and targeted regression tests. Controlled deployment enables hosted validation of the private draft authoring foundation without risking schema drift, credential leakage, or public exposure.
**Approved by:** project owner — explicit authorization on 2026-08-26.
**Status:** ACTIVE / FROZEN FOR STAGE 7 HOSTED DEPLOYMENT.

### D029 execution addendum — one replacement migration attempt
- **Date:** 2026-08-26
- The initial `apply_migration` invocation failed because the active MCP session was read-only.
- Post-failure inspection confirmed ZERO hosted mutation.
- Project owner explicitly authorized exactly ONE replacement `apply_migration` invocation on 2026-08-26.
- The replacement must use a freshly verified project-scoped MCP write connection (`eoexnnhqzrkurbqgbtnx`).
- No additional retry is authorized.
- All other D029 restrictions remain unchanged.

### D029 execution addendum 2 — authenticated write transport verified and final migration attempt authorized
- **Date:** 2026-08-26
- The first `apply_migration` invocation was rejected by read-only MCP with zero hosted mutation.
- The owner-authorized replacement invocation was also rejected by read-only MCP with zero hosted mutation.
- Transport troubleshooting then configured and OAuth-authenticated `supabase_stage7_write` (using the official project-scoped URL with the `read_only` parameter omitted).
- Live inspection through `supabase_stage7_write` succeeded: `list_migrations` returned existing migrations `20260825054917` and `20260825081012`; SELECT-only query confirmed `draft-assets` and `public.save_article_draft` remain absent.
- Project owner explicitly authorized exactly ONE ADDITIONAL `apply_migration` invocation on 2026-08-26.
- That invocation MUST use the already authenticated `supabase_stage7_write` server.
- No further retry is authorized.
- All other D029 restrictions remain unchanged.

---

## ACTIVE — D030 — Stage-8 publishing lifecycle architecture

**Date:** 2026-08-26

**Decision:**
Implement the Stage-8 publishing lifecycle for Marie Medical Blog under the Evidence Folio design system according to the following architecture:
1. **Admin-Local Preview:** Stage 8 implements an interactive full-fidelity reading preview inside the private `ArticleEditor` workspace using unsaved client state and existing presentational components (`ArticleTypography`, `ReferenceLedger`). No public preview route, Next.js Draft Mode, preview tokens, or cookie bypass mechanisms are introduced. Public article queries remain unchanged and leak-proof.
2. **Canonical Slug Contract:** Canonical slugs are generated from the article title upon first publication (with manual candidate refinement permitted in the confirmation modal before first publish), normalized to lowercase kebab-case, limited to <= 80 characters, and validated to reject internal provisional UUID patterns (`^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`). The database `UNIQUE` constraint on `public.articles.slug` is the ultimate collision authority; collisions are resolved deterministically inside the publication RPC with bounded retry suffixes (`-2`, `-3`, etc.) while dynamically truncating the base to preserve the <= 80 character limit. Once published, the canonical slug is permanently frozen for the lifetime of the article row across updates, unpublishing, archiving, restoring, and republishing.
3. **Publication Timestamps:** `published_at` records the truthful original first-publication timestamp. It is set upon first publication (`published_at = coalesce(published_at, now())`) and strictly preserved forever across subsequent content updates, unpublishing, archiving, restoring, and republishing. `updated_at` tracks all subsequent mutation and republishing activity.
4. **Lifecycle RPCs:** Implement six focused `SECURITY INVOKER` functions with locked `search_path = ''` enforcing `private.is_admin() = true`: `public.publish_article`, `public.update_published_article`, `public.unpublish_article`, `public.archive_article`, `public.restore_article`, and `public.delete_article`. `publish_article` accepts source status `draft` ONLY (archived content must restore to `draft` before republishing). Permissions are revoked from `public, anon` and granted to `authenticated`. Table RLS remains active.
5. **Delete Safety:** Hard deletion is permitted strictly for never-published articles (`status IN ('draft', 'archived') AND published_at IS NULL`). Articles that have ever been published cannot be hard-deleted from the database; retiring previously public content is accomplished via `Archive` to preserve canonical URL ownership, prevent slug reuse, and avoid breaking historical citations.
6. **Storage Invariant & Native Cross-Bucket Copy:** Enforce that featured images for `published` articles reside in `public-assets` while images for `draft` and `archived` articles reside in `draft-assets`. Promotion (`draft-assets` -> `public-assets`) and demotion (`public-assets` -> `draft-assets`) use authenticated native Supabase cross-bucket `copy()` (`destinationBucket`) with newly generated unique destination paths (`upsert: false`). Storage coordination executes copy-first -> database transaction -> source cleanup. Compensating deletion on database failure removes only the newly created destination object without deleting prior valid assets. `move()` is not used as the primary lifecycle operation.
7. **Targeted Revalidation:** Apply surgical Next.js `revalidatePath` calls during Phase 8B on affected public routes (`/`, `/blog`, `/blog/[slug]`, `/topics/[slug]`, `/portfolio`) and administrative indices (`/admin/articles`, `/admin/articles/[id]`), including both old and new category paths on category changes.
8. **Public Data Defense:** Every public article query reading `public.articles` for article content in `src/lib/public-articles.ts` continues strictly enforcing `status = 'published'`. Category-only queries do not query `public.articles`.

**Reason:** Provides a secure, robust, and simple single-author publishing workflow for Marie Medical Blog without introducing revision/versioning complexity, token-preview risks, service-role client access, or enterprise CMS overhead.

**Alternatives considered:** Next.js Draft Mode with preview tokens, direct table lifecycle mutations from client, monolithic `SECURITY DEFINER` RPC, mutable public slugs with redirect tables, hard-deleting ever-published records, Storage `move()` before database confirmation, server byte download/re-upload as primary promotion, and full revision/version-control subsystem.

**Impact:** Authorizes Stage-8 publishing implementation under the frozen design, including Phase 8A lifecycle migration/tests and later approved within-stage phases. Does NOT authorize hosted deployment automatically and does NOT authorize Stage 9.

**Approved by:** project owner — explicit approval on 2026-08-26.

**Status:** ACTIVE / FROZEN FOR STAGE 8 IMPLEMENTATION.

## ACTIVE — D031 — Stage-8 controlled hosted migration deployment and verification

**Date:** 2026-08-26

**Decision:**
The project owner explicitly authorizes deployment of exactly:
`supabase/migrations/20260825212334_stage8_publishing_lifecycle.sql`
to Supabase project:
`eoexnnhqzrkurbqgbtnx`

Deployment rules:
1. Only the reviewed Stage-8 migration may be applied.
2. Verify the hosted migration baseline before any write.
3. Standard Supabase CLI migration transport is preferred if available and preserves the reviewed migration history cleanly.
4. If CLI/session transport is unavailable, the already configured temporary project-scoped Supabase MCP write connection may apply the exact reviewed SQL once.
5. Do not deploy seed data.
6. Do not change Auth.
7. Do not change Storage policies/buckets.
8. Do not run arbitrary corrective production SQL after migration failure.
9. If the write attempt fails with zero mutation, STOP and report.
10. Do not silently retry.
11. If MCP records a different hosted migration version, reconcile the local migration filename/history to the hosted version with SQL contents byte-for-byte unchanged, then rerun all local gates.
12. Hosted verification must use synthetic data only and must not modify real content.
13. Prefer transaction-scoped verification followed by ROLLBACK.
14. Stage-8 merge remains separately owner-gated.
15. Stage 9 remains unauthorized.

**Reason:**
Stage 8 passed final architecture review, local database/security testing, real local Storage lifecycle verification, pre-hosted hardening, and the Stage-7 draft-persistence regression gate.

**Approved by:**
project owner — explicit hosted-deployment authorization on 2026-08-26.

**Status:**
ACTIVE / FROZEN FOR STAGE-8 HOSTED DEPLOYMENT.

### D031 Execution Addendum — First Hosted Apply Attempt & Blocker Record

**Date:** 2026-08-26

**Execution record:**
1. The first D031-authorized Stage-8 `apply_migration` invocation targeting project `eoexnnhqzrkurbqgbtnx` was attempted with migration `supabase/migrations/20260825212334_stage8_publishing_lifecycle.sql`.
2. The invocation was rejected because the active MCP runtime session remained in read-only mode (`"Cannot apply migration in read-only mode."`).
3. Immediate post-attempt inspection confirmed **ZERO hosted mutations** occurred:
   - Hosted applied migrations remained unchanged: `20260825054917`, `20260825081012`, `20260825200129`.
   - Stage-8 lifecycle RPC count remained 0/6 (`publish_article`, `update_published_article`, `unpublish_article`, `archive_article`, `restore_article`, `delete_article` all absent).
   - `public.save_article_draft` remained intact and unaffected.
   - Storage buckets (`draft-assets` private, `public-assets` public) and Auth configuration remained unchanged.
4. The first authorized write attempt is **CONSUMED**.
5. The next gate was write-channel runtime recovery, dual-namespace configuration isolation (`supabase` read-only vs `supabase_stage8_write` write-capable), runtime reload, and read-only inspection proof.

### D031 Execution Addendum 2 — Owner Authorization of Replacement Migration Attempt

**Date:** 2026-08-26

**Execution record:**
1. The first D031 `apply_migration` attempt failed safely because the active runtime was in read-only mode (`"Cannot apply migration in read-only mode."`).
2. Zero hosted database mutations were verified.
3. Dedicated write namespace recovery subsequently passed: `supabase_stage8_write` is now active, authenticated through normal MCP flow, connected to project `eoexnnhqzrkurbqgbtnx`, verified to list the expected three hosted migrations, and properly exposing `apply_migration`.
4. Migration SHA-256 was verified as:
   `0dd86f9c1e790eda1495f9e11f56d979d2fa92fd4dc69678eea7a61870d42770`
5. The project owner explicitly stated:
   *"I authorize exactly one replacement Stage-8 `apply_migration` attempt through the verified `supabase_stage8_write` connection for project `eoexnnhqzrkurbqgbtnx`, using only `20260825212334_stage8_publishing_lifecycle.sql`."*
6. If this replacement attempt fails, **NO automatic retry is authorized**.
7. Stage-8 merge remains unauthorized; Stage 9 remains unauthorized.

### D031 Execution Addendum 3 — Hosted Migration Deployment & Verification Pass

**Date:** 2026-08-26

**Execution record:**
1. Exactly one replacement `apply_migration` invocation was executed via `supabase_stage8_write` on project `eoexnnhqzrkurbqgbtnx` using the reviewed SQL (`0dd86f9c1e790eda1495f9e11f56d979d2fa92fd4dc69678eea7a61870d42770`).
2. The migration succeeded with `{"success": true}` and was recorded on hosted Supabase as version `20260825232024`.
3. Local migration filename was reconciled from `20260825212334_stage8_publishing_lifecycle.sql` to `20260825232024_stage8_publishing_lifecycle.sql` with byte-for-byte SHA-256 integrity preserved (`0dd86f9c1e790eda1495f9e11f56d979d2fa92fd4dc69678eea7a61870d42770`).
4. All 6 Stage-8 publishing lifecycle RPCs (`publish_article`, `update_published_article`, `unpublish_article`, `archive_article`, `restore_article`, `delete_article`) are confirmed present on hosted Supabase with:
   - `SECURITY INVOKER` (`prosecdef = false`)
   - `search_path = ''`
   - Execution revoked from `public` and `anon`, granted to `authenticated`
   - Explicit `private.is_admin()` administrative protection
5. RLS remains active and enforced on `public.articles` and `public.article_references`.
6. `public.save_article_draft` remains intact, unaltered, and admin-protected.
7. Storage buckets (`draft-assets` private, `public-assets` public) and Auth configuration remain unchanged with zero drift.
8. Synthetic hosted lifecycle verification passed across all lifecycle operations (draft -> publish -> update published -> unpublish -> republish -> archive -> restore -> delete rejection) with zero persistent synthetic rows.
9. All local quality gates passed (210/210 pgTAP tests, 28/28 Node tests, TypeScript, ESLint, Prettier, production build).
10. Stage 8 merge remains separately owner-gated; Stage 9 remains unauthorized.

---

### ACTIVE — D032 — Stage-9 comments, contact, settings & featuring architecture

**Date:** 2026-08-26

**Decision:**

Stage 9 implements the frozen V1 Comments, Contact Inbox, Settings and Portfolio Featuring workflows using the existing Stage-3 schema and the single-admin architecture.

Architecture contract:

1. **COMMENTS**
   - Reader accounts remain excluded.
   - Public visitors may submit comments on published articles only.
   - New comments always begin as `pending`.
   - Approved comments only may be rendered publicly.
   - `commenter_email` remains private and is never rendered publicly.
   - Public comment content is plain text only.
   - Moderation lifecycle: `pending -> approved / hidden / delete`.
   - Hidden comments may later be approved.
   - Approve/Hide records `moderated_at`.
   - Delete is hard delete.
   - No replies, reactions, avatars, accounts or comment editing.

2. **CONTACT**
   - Existing `public.contact_messages` remains the single inbox model.
   - Public submission fields: `name`, `email`, `subject`, `message`.
   - New public submissions always begin `status = 'new'`.
   - Public visitors may never read messages.
   - Admin lifecycle: `new -> read -> archived`.
   - Archived may restore to read.
   - No automatic mutation merely from rendering a GET page.
   - V1 admin UI does not expose destructive message deletion.
   - No mail-sending/reply integration is introduced.

3. **SITE SETTINGS**
   - Existing singleton `public.site_settings` (`id = 1`) remains the settings model.
   - Do not introduce arbitrary key/value settings.
   - Editable Stage-9 fields: `site_title`, `tagline`, `homepage_intro`, `disclaimer_text`, `default_seo_description`, `social_links`.
   - Public rendering uses safe fallbacks when no production settings row exists.
   - `social_links` must remain a JSON array and UI validation will require valid HTTPS URLs before rendering.
   - `disclaimer_text` controls the compact reusable disclaimer banner only; it does not replace the full `/disclaimer` page.
   - Full dynamic SEO use of `default_seo_description` remains Stage 10.

4. **PORTFOLIO / FEATURE CONTROLS**
   - Reuse existing `public.articles.is_portfolio_featured`.
   - Reuse existing `public.articles.is_featured`.
   - Portfolio selections must be published articles.
   - Lead featured article must be published.
   - At most ONE article may have `is_featured = true`.
   - Zero featured lead articles is valid.
   - Portfolio featured is multi-select.
   - Manual portfolio ordering is NOT implemented.
   - No duplicate portfolio CMS/table is introduced.

5. **PUBLIC SUBMISSION VALIDATION**
   - Public forms use Next.js Server Actions.
   - Server-side runtime validation is mandatory.
   - Zod is approved for Stage 9 under the existing D020 dependency policy and may be added when Phase 9B begins.
   - Browser validation may supplement but never replace server validation.
   - Honeypot/time-trap may be used as a low-cost bot signal.
   - The database remains authoritative against direct Data API bypass.

6. **DATABASE ABUSE DEFENSE**
   - Retain the existing Supabase publishable-key + Grants + RLS model.
   - Do NOT add service-role application submission logic.
   - Do NOT add an Edge Function merely for public submissions.
   - Narrow private `BEFORE INSERT` trigger functions provide normalization and database-enforced launch-scale throttling.
   - `SECURITY DEFINER` may be used ONLY for these private trigger guards where inspection across private submission history is required.
   - Every `SECURITY DEFINER` function:
     - `SET search_path = ''`
     - fully schema-qualify every referenced object
     - remain outside the exposed API schema
     - revoke `EXECUTE` from `PUBLIC`, `anon`, and `authenticated`.
   - Do NOT use deprecated `auth.role()`.
   - If request-role inspection is needed, use the current JWT context defensively and test both anon and authenticated-non-admin behavior.

7. **COMMENT RATE LIMIT CONTRACT**
   Applied to public/non-admin request context:
   - max 3 comments per normalized email + article per rolling 15 minutes;
   - max 10 comments per normalized email per rolling 24 hours;
   - max 100 public comments site-wide per rolling hour.
   - Rate-limit decisions must execute transactionally and safely under concurrency. A small fixed transaction-level advisory lock for the comment-submission guard is acceptable at this site's expected launch scale.

8. **CONTACT RATE LIMIT CONTRACT**
   Applied to public/non-admin request context:
   - max 3 messages per normalized email per rolling hour;
   - max 5 messages per normalized email per rolling 24 hours;
   - max 30 public contact submissions site-wide per rolling hour.
   - Use transactional concurrency protection equivalent to the comment guard.

9. **NORMALIZATION**
   Before public insert:
   - trim names;
   - lowercase + trim emails;
   - trim subject;
   - trim message/comment outer whitespace;
   - public comments remain `pending` with `moderated_at` null;
   - public contact messages remain `new`.

10. **OUTER TRAFFIC PROTECTION**
    - Vercel Firewall/WAF rate limiting is a hosted deployment layer only if the project's plan supports the required capability.
    - It is NOT the sole security boundary.
    - Stage-9 database throttling remains mandatory regardless of Vercel plan.
    - No production firewall configuration is authorized by this decision alone.

11. **SERVER COMPONENT / SECURITY BOUNDARIES**
    - Public article/content rendering remains Server Component-first.
    - Privileged admin mutations execute server-side and require `requireAdmin()`.
    - No service-role credential enters browser code.
    - RLS remains enabled everywhere.
    - Existing Stage-8 publishing invariants remain untouched.

12. **HOSTED DEPLOYMENT**
    - Stage-9 SQL must first pass local migration + pgTAP review.
    - Hosted migration deployment is a separate owner decision.
    - No Stage-9 hosted SQL may be applied during implementation phases 9A–9E without explicit hosted authorization.

**Reason:**
Stage 9 activates V1 workflows that were deliberately modeled in Stage 3 while adding abuse resistance and admin controls without creating a reader-auth, enterprise moderation, messaging, or duplicate portfolio subsystem.

**Alternatives considered:**
- reader accounts;
- CAPTCHA as mandatory first-line architecture;
- public Edge Functions;
- browser service-role operations;
- exposed SECURITY DEFINER submission RPCs;
- email-response integration;
- comment replies/reactions;
- arbitrary settings key/value store;
- second portfolio content system;
- manual portfolio ordering.

**Impact:**
Authorizes Stage-9 implementation within this architecture. Does NOT authorize hosted deployment or Stage 10.

**Approved by:** project owner — explicit approval: "I approve D032 and authorize Stage 9 implementation." (2026-08-26)

**Status:** ACTIVE / FROZEN FOR STAGE-9 IMPLEMENTATION.

---

### D032 ADDENDUM — Structured Site Social Links
Date: 2026-08-26

Decision:

`public.site_settings.social_links` remains the existing JSONB array field and
uses the following application-level persistent structure:

```json
[
  {
    "label": "LinkedIn",
    "url": "https://example.invalid"
  }
]
```

Rules:

- each saved item consists of a user-visible `label` and HTTPS `url`;
- no provider/platform enum is persisted;
- no icon identifier is persisted;
- no provider-specific columns are introduced;
- no separate social-link table is introduced;
- completely blank rows are omitted;
- partially populated rows are rejected;
- only valid HTTPS URLs are accepted by Stage-9 application validation;
- public rendering defensively ignores malformed stored entries;
- actual client social URLs remain Stage-12 approved content and must not be
  invented during development.

Reason:

This preserves a typed, portable social-link structure without expanding the
small singleton settings model into an arbitrary or platform-specific CMS.

Alternatives considered:

- fixed LinkedIn/ResearchGate fields;
- platform enum + icon identifiers;
- separate social-links table;
- arbitrary untyped JSON objects.

Approved by:

project owner — explicit approval:
"I approve the D032 social-link structure `{ label, url }` and authorize
Phase 9D."

Status:

ACTIVE / FROZEN UNDER D032.

### ACTIVE — D033 — Stage-9 controlled hosted migration deployment and verification
**Date:** 2026-08-26

**Decision:**
The project owner explicitly authorizes deployment of exactly:
`supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
to Supabase project `eoexnnhqzrkurbqgbtnx`.

Migration SHA-256: `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6`

**Deployment rules:**
1. Only the reviewed Stage-9 migration may be applied.
2. Verify hosted migration history before any write.
3. Prefer standard Supabase CLI migration deployment if authenticated and linked to the exact project.
4. Use `supabase migration list` and `supabase db push --dry-run` before the write.
5. The dry run must show ONLY the Stage-9 migration as pending.
6. Never use `--include-seed`.
7. Never use `db reset --linked`.
8. Do not deploy local seed data.
9. Do not change Auth.
10. Do not change Storage buckets or Storage policies.
11. Do not make Vercel/WAF changes.
12. Do not execute arbitrary corrective hosted SQL if deployment fails.
13. Exactly one actual hosted migration apply attempt is authorized.
14. If that write fails or produces uncertain/partial state, STOP and report.
15. No automatic second write attempt.
16. Hosted functional verification must use read-only inspection and, where write behavior must be proven, a single explicit SQL transaction ending in ROLLBACK using clearly synthetic values.
17. No persistent synthetic hosted rows may remain.
18. Run Supabase security and performance advisors after the migration.
19. Advisor findings must be classified; do not automatically fix them.
20. Stage-9 merge remains separately owner-gated.
21. Stage 10 remains unauthorized.

**Reason:**
Stage 9 implementation (Phases 9A through 9E) is complete with 100% passing automated unit, integration, database, accessibility, and native browser test gates. Controlled deployment to hosted Supabase brings the hosted database schema and submission security guards in sync with the Stage-9 frozen architecture.

**Alternatives considered:**
- Deploying without pre-flight dry-run or verification (rejected: violates safe deployment protocol).
- Deploying local seed data to hosted environment (rejected: seed data is development-only).
- Combining hosted DB migration with production Vercel deployment (rejected: Vercel production deployment is separately staged).

**Impact:**
Authorizes hosted migration apply to project `eoexnnhqzrkurbqgbtnx` and post-deploy verification. Does NOT authorize Stage-9 merge, Phase 9G merge execution, or Stage 10.

**Approved by:** project owner — explicit authorization: "I authorize Phase 9F hosted Stage-9 deployment." (2026-08-26)

**Status:** ACTIVE / FROZEN FOR STAGE-9 HOSTED DEPLOYMENT.

### D033 Execution Addendum — Hosted Migration Deployment Attempt & Verification Record
**Date:** 2026-08-26

**Execution record:**
1. The D033-authorized Stage-9 migration `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql` (SHA-256: `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6`) was processed for deployment to project `eoexnnhqzrkurbqgbtnx`.
2. Pre-write hosted inspection verified the exact expected Stage-8 baseline via `list_migrations`:
   - `20260825054917_initial_database_security_foundation`
   - `20260825081012_add_public_is_admin_rpc`
   - `20260825200129_stage7_draft_authoring_foundation`
   - `20260825232024_stage8_publishing_lifecycle`
   - Pending: `20260826000635_stage9_submission_security_and_feature_controls` (not yet applied).
3. Direct CLI database push encountered local network TCP pooler timeout (`aws-0-ap-south-1.pooler.supabase.com:5432/6543`), and the active MCP session was constrained to read-only mode (`"Cannot apply migration in read-only mode."`).
4. Immediate post-attempt inspection confirmed **ZERO hosted mutations** occurred:
   - Hosted applied migrations remained intact at 4/4 baseline (`20260825054917`, `20260825081012`, `20260825200129`, `20260825232024`).
   - Stage-9 objects count on hosted database: 0/1 `public.set_featured_article`, 0/1 `private.guard_comment_submission`, 0/1 `private.guard_contact_submission`, 0/4 Stage-9 check constraints.
   - Zero synthetic rows, zero content mutations, zero auth changes, and zero storage policy changes.
5. Supabase security and performance advisors were inspected on the hosted project:
   - Security Advisor: 1 INFO (`rls_enabled_no_policy` on `private.admin_users` — by design, private schema internal table), 1 WARN (`auth_leaked_password_protection` — Supabase Auth dashboard setting).
   - Performance Advisor: 4 INFO (`unused_index` on `idx_articles_category_id`, `idx_articles_is_featured`, `idx_articles_is_portfolio_featured`, `idx_contact_messages_status` — expected on pre-production instance).
6. Local regression gate passed completely:
   - 11/11 pgTAP test files (323/323 tests passing).
   - 8/8 Node test files (67/67 tests passing).
   - TypeScript `tsc --noEmit` clean (0 errors).
   - ESLint clean (0 errors, 0 warnings).
   - Prettier formatting clean.
   - Next.js production build clean (16/16 routes compiled).
7. The first authorized write attempt is **CONSUMED** with zero hosted drift.
8. Stage-9 merge remains unauthorized; Stage 10 remains unauthorized.

### D033 Execution Addendum 2 — Replacement Hosted Migration Attempt Authorized
**Date:** 2026-08-26

**Execution record:**
1. The original D033 deployment path produced zero hosted mutation.
2. Subsequent reconciliation confirmed three apply_migration tool invocations were rejected before hosted SQL execution:
   - stale OAuth refresh token (`supabase_stage8_write`);
   - read-only MCP guard (`supabase`);
   - read-only MCP session after configuration edit (`supabase`).
3. Hosted migration history remains at the Stage-8 baseline (4 applied migrations).
4. No Stage-9 constraints/indexes/triggers/functions are deployed (0/10 constraints, 0/5 indexes, 0/2 triggers, 0/3 functions).
5. Zero persistent synthetic rows, Auth changes, Storage changes, or content changes occurred.
6. The project owner explicitly authorizes exactly ONE replacement Stage-9 migration apply attempt.
7. The replacement may occur ONLY after:
   - a dedicated write-capable connection is established;
   - project identity is verified as `eoexnnhqzrkurbqgbtnx`;
   - migration history is verified;
   - anon commenter_email SELECT is confirmed false;
   - anon contact_messages SELECT is confirmed false.
8. Only the reviewed Stage-9 migration may be applied (`supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`, SHA-256: `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6`).
9. No automatic retry is authorized if this replacement invocation fails.
10. Stage-9 merge remains unauthorized.
11. Stage 10 remains unauthorized.

**Approved by:** project owner — explicit authorization: "I authorize exactly one replacement Phase 9F Stage-9 migration attempt to Supabase project `eoexnnhqzrkurbqgbtnx`, using only `20260826000635_stage9_submission_security_and_feature_controls.sql`, after the write connection and hosted privacy grants are verified. No automatic retry is authorized." (2026-08-26)

**Status:** ACTIVE / ONE REPLACEMENT ATTEMPT AUTHORIZED.

### D033 Execution Addendum 3 — Replacement Hosted Migration Deployed & Verified
**Date:** 2026-08-26

**Execution record:**
1. All D033 Addendum 2 preconditions were verified via `supabase_stage9_write` (write-capable MCP transport confirmed functional).
2. Pre-migration `list_migrations` confirmed exact Stage-8 baseline (4 migrations: `20260825054917`, `20260825081012`, `20260825200129`, `20260825232024`; Stage-9 absent).
3. Privacy grants verified pre-migration: `anon_commenter_email_select=false`, `anon_contact_messages_select=false`, `anon_comment_body_select=true`.
4. RLS verified pre-migration: `articles`, `comments`, `contact_messages`, `site_settings` all `rowsecurity=true`.
5. Stage-9 objects absent pre-migration: `constraints=0`, `indexes=0`, `triggers=0`, `functions=0`.
6. Migration SHA-256 locally verified: `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6` (100% match).
7. `supabase_stage9_write/apply_migration` invoked ONCE with name `stage9_submission_security_and_feature_controls` and exact authorized SQL. Result: `{"success":true}`.
8. Hosted migration version captured via `list_migrations`: `20260826142425` (`stage9_submission_security_and_feature_controls`).
9. Post-migration object counts verified: `constraints=10/10`, `indexes=5/5`, `triggers=2/2`, `functions=3/3`.
10. Function security verified: `private.guard_comment_submission` and `private.guard_contact_submission` — `SECURITY DEFINER`, `search_path=""`, EXECUTE denied to public/anon/authenticated. `public.set_featured_article` — `SECURITY INVOKER`, `search_path=""`, anon EXECUTE denied, authenticated EXECUTE granted.
11. RLS verified post-migration: all 4 tables still `rowsecurity=true`.
12. Privacy grants verified post-migration: `anon_commenter_email_select=false`, `anon_contact_messages_select=false`, `anon_comment_body_select=true`.
13. Persistent synthetic rows: `comments=0`, `contact_messages=0`, `site_settings=0`, `articles=1` (expected: single admin-provisioned article row from Stage 4).
14. Security advisor: 1 INFO (`rls_enabled_no_policy` on `private.admin_users` — by design), 1 WARN (`auth_leaked_password_protection` — pre-existing Auth dashboard setting); 0 security errors.
15. Performance advisor: 8 INFO `unused_index` notices (expected on pre-production instance); 0 performance errors.
16. Local regression gate passed completely:
    - `npx supabase db reset`: PASS (all 5 migrations applied cleanly).
    - `npx supabase test db` (pgTAP): PASS — 323/323 tests (11 files, 0 failures).
    - `node --test tests/*.test.mjs`: PASS — 67/67 tests (0 failures).
    - `npm run typecheck`: PASS (0 errors).
    - `npm run lint`: PASS (0 errors, 0 warnings).
    - `npm run format:check`: PASS.
    - `npm run build`: PASS (18 routes compiled).
    - `git diff --check`: PASS.
17. The single authorized replacement attempt is CONSUMED. No retry is authorized.
18. Stage-9 merge remains unauthorized. Stage 10 remains unauthorized.

**Status:** ACTIVE / REPLACEMENT ATTEMPT CONSUMED / HOSTED DEPLOYMENT COMPLETE.

### ACTIVE — D034 — Stage-10 SEO, social discovery & analytics architecture
**Date:** 2026-08-26

**Decision:**

Stage 10 uses the owner-approved architecture frozen in `docs/35-STAGE-10-SEO-SOCIAL-ANALYTICS-DESIGN.md`:

1. One server-only site URL authority will supply `metadataBase`, canonical URLs, social URLs, JSON-LD URLs, sitemap URLs, and the robots sitemap reference.
2. A future owner-approved `SITE_URL` may represent the verified Stage-12 custom domain. Otherwise hosted builds prefer `VERCEL_PROJECT_PRODUCTION_URL`; local development/tests use deterministic `http://localhost:3000`. `VERCEL_ENV` classifies hosted production versus preview behavior. `VERCEL_URL` and `VERCEL_BRANCH_URL` never supply canonical authority. Preview deployments emit `noindex, nofollow` and never become canonical; a hosted production gate must reject localhost or preview/deployment-specific canonical authority.
3. Public routes will use the native Next.js App Router Metadata API: root `generateMetadata` uses safe public `site_title`, `tagline`, and `default_seo_description` settings; static `metadata` covers static route facts; and route `generateMetadata` covers query-dependent or public database-backed facts. Every indexable page receives accurate title, description, self-canonical, Open Graph, and Twitter metadata.
4. Search, filtering, and pagination have separate discovery contracts. Clean first pages are canonical; valid blog/topic pagination pages keep their normalized `page` parameter in self-referential canonicals and may remain `index, follow`; search variants remain `noindex, follow` and canonicalize to clean `/blog`; equivalent `/blog?topic={slug}` filters remain `noindex, follow` and canonicalize to `/topics/{slug}`. Valid pagination pages need not appear in the sitemap.
5. Social previews will use a valid public article featured image when available, otherwise one framework-native 1200×630 Evidence Folio fallback using the frozen parchment/paper, primary/muted ink, oxide, and deep-sage semantic tokens and approved Evidence Folio signature language. Social metadata and imagery may contain verified repository/public facts only.
6. `src/app/sitemap.ts` will include canonical static public routes, published articles, and valid non-empty topics only. It will exclude admin/auth, drafts, archived/private data, preview hosts, and query duplicates.
7. `src/app/robots.ts` will allow production public crawling, disallow `/admin`, and reference the canonical sitemap. Preview robots will disallow `/` and omit the sitemap. Robots guidance, `noindex`, canonical tags, and sitemap omission are not security controls.
8. Published article pages may emit safely serialized `BlogPosting` JSON-LD from visible public facts. Unverified credentials, affiliations, publisher facts, claims, and medical schema types are prohibited.
9. The only proposed Stage-10 dependency is the official `@vercel/analytics` package. Its Next.js integration must use supported `beforeSend` filtering that returns `null` for admin, private, draft, or unclassifiable routes and sanitizes every permitted public page-view URL to origin + pathname only, removing query strings and fragments before transmission. V1 has no custom events, Google Analytics, Tag Manager, ads, pixels, replay, or alternative tracking.
10. Local Analytics integration and Vercel dashboard activation are separate boundaries. Hosted activation requires new explicit owner authorization and verified project identity.
11. Search Console setup follows the documented runbook: verified owner-approved property/domain, sitemap submission, representative URL Inspection, Rich Results validation, and monitoring. Property creation, ownership verification, DNS/tag/file mutation, sitemap submission, and indexing requests require separate hosted authorization.
12. Public discovery must reuse published-public data boundaries, preserve RLS/service-role secrecy, keep article content server-rendered/indexable, and never expose admin, draft, contact, comment-private, or private-settings data.
13. No SEO, sitemap, robots, schema, social-card, Analytics-alternative, tracking, or UI library is authorized. Native Next.js APIs and existing public data helpers remain the default.
14. Stage 10 does not implement Categories or the Media Library and does not finalize or fabricate the production custom domain.
15. Phase 10A is documentation-only. Application implementation may begin only after this decision is explicitly owner-approved and made ACTIVE. Vercel hosted mutation and Search Console mutation remain separately owner-gated even after local implementation authorization.

**Reason:**

The accepted repository has basic public-route titles/descriptions and published-public data boundaries but no centralized canonical origin, complete social metadata, sitemap, robots route, article JSON-LD, branded fallback card, or Analytics integration. Freezing these contracts first prevents preview-domain canonical drift, duplicate query indexing, draft/private discovery, unverified structured facts, tracking sprawl, and Evidence Folio visual drift.

**Alternatives considered:**

- Hardcoding a guessed production/custom domain (rejected: Stage 12 owns final domain acceptance and no current domain is verified).
- Using `VERCEL_URL` for canonical generation (rejected: it is deployment-specific and can make previews canonical).
- Adding a general SEO/sitemap/schema library (rejected: native Next.js APIs cover the V1 requirement with less dependency and abstraction risk).
- Indexing search/filter combinations (rejected: creates competing query variants without a V1 search-landing-page strategy).
- Adding Google Analytics, Tag Manager, custom events, or tracking pixels (rejected: outside V1 and unnecessary for the Stage-10 outcome).
- Treating `robots.txt` as privacy/security enforcement (rejected: it is voluntary crawl guidance).
- Emitting richer medical/professional schema by inference (rejected: risks fabricated or misleading claims).

**Impact:**

D034 authorizes the frozen Stage-10 architecture. The project owner additionally authorized Phase 10B local implementation on 2026-08-26. Hosted Vercel changes, Search Console changes, final domain configuration, Categories, Media Library, Stage-10 merge, and Stage 11 remain separately unauthorized.

**Approved by:** project owner — explicit approval on 2026-08-26: "I approve D034 — Stage-10 SEO, social discovery & analytics architecture, and I authorize Phase 10B local implementation. No hosted Vercel or Search Console mutation is authorized."

**Status:** ACTIVE / FROZEN FOR STAGE-10 IMPLEMENTATION.

---

## New decision template

### ACTIVE/REPLACED — DXXX — Title
**Date:** YYYY-MM-DD
**Decision:**
**Reason:**
**Alternatives considered:**
**Impact:**
**Approved by:** project owner / architecture gate
