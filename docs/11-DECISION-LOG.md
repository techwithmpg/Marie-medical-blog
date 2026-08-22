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
**Impact:** Governance changes trigger Project snapshot refreshes; research outputs must distinguish facts, constraints, recommendations, decision impact, and implementation status.
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

---

## New decision template

### ACTIVE/REPLACED — DXXX — Title
**Date:** YYYY-MM-DD
**Decision:**
**Reason:**
**Alternatives considered:**
**Impact:**
**Approved by:** project owner / architecture gate
