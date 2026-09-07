# 41 — Stage 11 Admin Quality Hardening Handoff

**Date:** 2026-09-07
**Branch:** `stage/11-quality-hardening`
**Starting branch head:** `aa8beefb6873db22353c977f189e713ddd3037fe`
**Accepted base:** `origin/main` at
`ecd813394a09259d489c352edc46ca95d1a0ae65`
**Status:** IMPLEMENTATION COMPLETE / FULL LOCAL GATE PASS / NOT MERGED

## Objective completed

The existing single-writer V1 admin is now a more cohesive, responsive and
operational Marie Medical workspace. The pass refined the existing architecture
in place: it did not create an admin V2, alter public Evidence Folio behavior,
change schema/security rules, or add dependencies.

## Delivered behavior

- one typed, grouped navigation definition now drives desktop and mobile;
- the admin shell has a skip link, reliable main target, current-route state and
  a tablet-safe sidebar breakpoint;
- the dashboard reports live published, draft, archived, portfolio, pending
  comment and new-message counts plus recently edited articles;
- Articles, Comments and Messages use navigation/link semantics for URL-driven
  filters instead of incomplete ARIA tab semantics;
- shared admin page-header, filter, status, submit-feedback and confirmation
  recipes reduce interaction drift without affecting the public design system;
- Articles and Portfolio avoid cramped/scroll-dependent tables at tablet and
  mobile widths;
- media placements and the library have clearer hierarchy, and clearing a site
  placement uses an accessible confirmation instead of `window.confirm`;
- comment deletion is deliberately confirmed, while other moderation and inbox
  actions expose pending state;
- the Article Editor tracks unsaved changes, warns on page/browser navigation,
  restores focus when the user stays, improves error association and provides
  larger narrow-screen toolbar targets;
- admin loading/error states and quiet reduced-motion behavior are consistent.

## Meaningful files and areas

- `src/components/admin/admin-navigation.ts`
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/admin-mobile-nav.tsx`
- `src/components/admin/admin-ui.tsx`
- `src/components/admin/admin-submit-button.tsx`
- `src/components/admin/confirmation-dialog.tsx`
- `src/components/admin/admin-dashboard.tsx`
- `src/lib/admin/dashboard.ts`
- `src/components/admin/editor/unsaved-changes-guard.tsx`
- existing admin route/editor/media components under `src/app/admin` and
  `src/components/admin`
- Stage 9 source/browser contracts aligned to corrected navigation and
  confirmation semantics
- `tests/e2e/stage11-admin-quality.spec.ts`

## Preserved behavior and boundaries

- all existing admin routes, fields and publishing lifecycle rules;
- Supabase Auth, RLS, Storage boundaries and public/private data separation;
- Tiptap, App Router, server-side privileged operations and SEO rendering;
- public Evidence Folio visual system and route behavior;
- zero new dependencies, migrations or schema changes;
- no autosave, analytics dashboard, search, pagination, bulk operations, tags,
  scheduling, profile editing or new routes.

Pre-existing local changes in `playwright.config.ts` and
`src/components/site/site-footer.tsx` were preserved. The pre-existing
`overflow-x-hidden` change in `src/app/admin/portfolio/page.tsx` overlapped the
authorized responsive remediation and was retained. No authorship beyond the
previous audit evidence is claimed for those changes.

## Verification performed

- `npm run typecheck` — PASS.
- `npm run lint` — PASS.
- scoped Prettier check — PASS.
- `git diff --check` — PASS.
- `node --test tests/*.test.mjs` — PASS, 174/174.
- `supabase db lint --local` — PASS, no schema errors.
- tracked pgTAP database suite — PASS, 323/323 across 11 files. Docker Desktop's
  known stale `E:` host-bind mount prevented `supabase test db` from mounting
  the directory, so the same tracked files were copied into the cached
  `public.ecr.aws/supabase/pg_prove:3.36` runner and executed against the local
  Supabase database. The uniquely named runner and test-only pgTAP extension
  were removed afterward.
- targeted Stage 11 Chromium workflows — PASS, 4/4.
- complete Playwright suite against the production build — 61/63 on the first
  Chromium/Firefox/WebKit run; the two WebKit-specific focus/hydration findings
  were corrected and rerun PASS, 2/2. All 63 covered cases are green.
- responsive overflow matrix at 1440, 1280, 1024, 768, 430 and 390 — PASS across
  representative public and admin routes.
- targeted axe WCAG 2.0/2.1/2.2 A/AA checks — zero serious/critical violations.
- `npm run build` — PASS, 20 routes generated/validated.

The production-server browser run logged expected local-only Next Image SSRF
guards for loopback Supabase image URLs. Those warnings did not produce page
errors or test failures and no production image-security policy was weakened.

## Known local runtime limitation

A stale inaccessible Next.js dev PID currently holds this checkout's dev lock
and could not be stopped from the current permission boundary. Verification
therefore used the successful production build with an isolated temporary
Playwright server. The verified production build was restored afterward at
`http://localhost:3001` (HTTP 200). The stale development lock is local runtime
state, not an application or repository defect.

## Next-stage readiness

The bounded admin quality pass is ready for owner review. It is **not merged**.
A normal merge to `main` requires separate explicit owner authorization. Stage
12, hosted Supabase changes, hosted Analytics/Search Console work, final-domain
configuration and production deployment remain unauthorized.
