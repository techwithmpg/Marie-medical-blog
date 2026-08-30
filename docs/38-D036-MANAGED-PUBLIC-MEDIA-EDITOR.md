# 38 — D036 — Managed Public Media Editor

**Status:** IMPLEMENTATION COMPLETE / FULL LOCAL GATE PASS / MERGE READY
**Date:** 2026-08-30
**Branch:** `fix/v1-admin-completion`
**Accepted main during closeout:** `6fc9d6d1618e4308d88abaf9a5757032f619fc5c`

## Objective completed

D036 adds the fixed V1 website-media placement layer required for the
Evidence Folio public experience and integrates those placements into the
approved public-page presentation.

## Fixed V1 placements

- `home_hero`
- `about_hero`
- `portfolio_hero`
- `contact_hero`
- `author_portrait`
- `default_social`

The placement model is intentionally fixed. It is not a page builder or a
generic digital-asset-management subsystem.

## Implemented behavior

- fixed website-image placements are managed through the private admin Media
  workspace;
- assigned files become site-owned public Storage copies;
- contextual alt/decorative semantics are persisted;
- desktop and mobile focal positions are independently configurable;
- website-assigned images participate in deletion protection;
- public routes consume the managed placement layer with safe fallbacks;
- public Home, About, Blog, Article, Portfolio and Contact presentation has
  been refined while preserving the Evidence Folio design language.

## Public structural layout refinement

The owner approved a fluid public structural model during the implementation
review:

- the public shell, header and footer fill the viewport with responsive gutters;
- structural grids, images and editorial cards may fill their parent width;
- fluid fractional tracks are preferred over unnecessary fixed desktop shells;
- actual reading content such as prose, biographies and form copy may retain
  deliberate max-width constraints;
- this rule does not redesign or alter the admin workspace.

This refinement preserves Evidence Folio typography, palette and signature
devices and does not authorize a different design system.

## Database change

D036 introduces:

`supabase/migrations/20260830090000_managed_public_media_slots.sql`

The migration provides the fixed managed-site-media persistence and RLS
boundary required for the approved placements.

The migration has been exercised locally only. No hosted Supabase migration,
Storage-policy mutation or production deployment is claimed by this document.

## Verification

Final local verification passed:

- pgTAP: 323/323;
- complete Node regression: 174/174;
- Playwright: 17/17;
- TypeScript;
- ESLint;
- Prettier;
- production build;
- staged diff integrity.

The final pre-governance branch relationship was 0 commits behind and 6 commits
ahead of accepted `origin/main`.

## Scope explicitly not introduced

D036 does not introduce:

- page-builder functionality;
- arbitrary placement creation;
- generic DAM/folder management;
- bulk media operations;
- image editing or compression;
- AI tagging or AI alt generation;
- reader accounts;
- multi-author workflows;
- hosted Analytics activation;
- Search Console mutation;
- final-domain or DNS work;
- Stage 11 or Stage 12 implementation.

## Integration state

Implementation and the full local gate are complete.

The owner-authorized remaining sequence is:

1. governance and handoff reconciliation;
2. commit and push `fix/v1-admin-completion`;
3. normal merge into `main` preserving history;
4. post-merge verification;
5. only then evaluate the next explicitly authorized development stage.

Hosted Supabase deployment of the D036 migration remains separate and has not
been performed by this closeout.
