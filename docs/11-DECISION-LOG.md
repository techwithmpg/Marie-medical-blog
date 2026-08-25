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
1. ONLY the single reviewed and local-gate-passed Stage-7 migration (`supabase/migrations/20260825160000_stage7_draft_authoring_foundation.sql`) may be deployed.
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

---

## New decision template

### ACTIVE/REPLACED — DXXX — Title
**Date:** YYYY-MM-DD
**Decision:**
**Reason:**
**Alternatives considered:**
**Impact:**
**Approved by:** project owner / architecture gate
