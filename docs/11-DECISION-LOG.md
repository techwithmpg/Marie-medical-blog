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

---

## New decision template

### ACTIVE/REPLACED — DXXX — Title
**Date:** YYYY-MM-DD
**Decision:**
**Reason:**
**Alternatives considered:**
**Impact:**
**Approved by:** project owner / architecture gate
