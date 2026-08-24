# 13 — Project Status & Stage Authority

This file is the authoritative repository record of the currently active development stage and its authorization state.

## Current status

- **Current stage:** Stage 2 — Design System & Application Shells — COMPLETE / MERGED
- **Stage authorization:** AUTHORIZED BY PROJECT OWNER — 2026-08-24
- **Application coding authorized:** NO — STAGE 2 IS COMPLETE; STAGE 3 IS NOT AUTHORIZED
- **Gate status:** PASS
- **Active working branch:** `main` — no implementation stage currently active
- **Canonical Stage-1 main:** `4da2ff7adb0f7d46d3f5f1ff249f69cfb996f717`
- **Stage-0 merge commit:** `bca3483d844e3e931f3de300e20dd5670fa2c5ee` — `merge: complete stage 0 governance`
- **Stage-1 implementation commit:** `d99879076ac6283ef84e546f99dacc55fcc9374c`
- **Stage-1 closeout commit:** `fdcfaebc1dd24486c88304326cd8c52e3fca028c`
- **Stage-1 merge commit:** `7703d507d491acaf4c33d341f328ff41bbd69293`
- **Stage-1 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-24
- **Stage-2 authorization commit:** `18dc2c65aed7ae76b5905b5a02add28babfbec0a`
- **Stage-2 implementation commit:** `69844dab57380959abdb4ff43779035be6498446`
- **Stage-2 correction commit:** `c5e89f0617c9b2b56f6f75418ab62eed750c7a3d`
- **Stage-2 closeout commit:** `4593adfba196582e4ce89e348530d80be20c434c`
- **Stage-2 governance-reference correction:** `e33875485ab5f37fe813081479e40fabf39bc4bb`
- **Stage-2 merge commit:** `21c74c6c4025e63f8ae396678f1dfc95b892f900`
- **Stage-2 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-25
- **Stage-2 merge parents:**
  - first parent (prior main): `4da2ff7adb0f7d46d3f5f1ff249f69cfb996f717`
  - second parent (approved Stage-2 head): `e33875485ab5f37fe813081479e40fabf39bc4bb`
- **Next implementation stage:** Stage 3 — Supabase Database & Security Foundation — NOT AUTHORIZED
- **Remote:** `origin` → `https://github.com/techwithmpg/Marie-medical-blog.git`
- **Repository visibility:** public by owner decision
- **Accepted predevelopment UI contract:** Evidence Folio — `docs/18-UI-IMPLEMENTATION-CONTRACT.md`
- **Accepted visual-reference manifest:** `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`
- **Live ChatGPT context manifest:** `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md` — D021

## Stage 0 outcome

Stage 0 is complete. The repository now has the governance required for controlled implementation:

- [x] Base Git repository established.
- [x] AI context and agent instruction files established.
- [x] Frozen V1 scope and technical stack documented.
- [x] Development stages and quality gates documented.
- [x] GitHub remote synchronized.
- [x] Branch strategy defined in `docs/14-BRANCH-STRATEGY.md`.
- [x] ChatGPT Project ↔ repository synchronization contract defined in `docs/15-CHATGPT-REPO-SYNC.md`.
- [x] Stage-1 environment/toolchain baseline frozen in `docs/16-STAGE-1-TOOLCHAIN-BASELINE.md`.
- [x] ACTIVE governance/toolchain/UI/synchronization decisions D011–D021 recorded.
- [x] ChatGPT Project mirror refreshed from final Stage-0 main and verified.
- [x] Stage 0 formal gate reviewed and recorded as PASS.
- [x] Stage 0 governance branch merged into main with owner approval.
- [x] Owner accepted the Evidence Folio design direction and responsive visual prototypes.
- [x] Canonical UI implementation/dependency/no-drift policy merged and canonical under D019–D020.
- [x] Live GitHub context synchronization model accepted under D021 with static Project Sources retained as bootstrap/fallback only.

No application code or application dependencies were initialized during Stage 0 or by the UI research/design process.

## Stage 1 outcome

Stage 1 is complete, verified, and merged into `main`:

- [x] Next.js App Router + TypeScript foundation established;
- [x] Node 24.x / npm / `package-lock.json` contract established;
- [x] Tailwind CSS v4 foundation established;
- [x] Structural shadcn/ui Base UI configuration established;
- [x] Strict TypeScript, ESLint, and Prettier tooling established;
- [x] `.env.example` placeholder contract established;
- [x] Clean install verified (`npm ci` PASS, 0 vulnerabilities);
- [x] Typecheck PASS (`tsc --noEmit`);
- [x] Lint PASS (`eslint .`);
- [x] Format check PASS (`prettier . --check`);
- [x] Production build PASS (`next build`);
- [x] Git diff check PASS (`git diff --check`);
- [x] No database, auth, editor, or product feature scope was implemented;
- [x] No credentials or secrets were introduced;
- [x] Project owner explicitly approved the Stage-1 merge;
- [x] Merge used `--no-ff` at merge commit `7703d507d491acaf4c33d341f328ff41bbd69293`;
- [x] Merge commit verified with expected two parents:
  - `5e30fac03bdb2efc334399800a7842aa5af8e584` (accepted pre-merge `main`)
  - `fdcfaebc1dd24486c88304326cd8c52e3fca028c` (Stage-1 branch head)
- [x] Initial post-merge format check exposed Windows CRLF checkout behavior from global `core.autocrlf=true`;
- [x] Repository-level `.gitattributes` added (`* text=auto eol=lf`, `*.bat text eol=crlf`, `*.cmd text eol=crlf`);
- [x] Zero application source content modified during LF normalization;
- [x] Complete post-merge gate re-run and passed 100%.

Final post-merge gate record:
- `npm ci`: PASS, 0 vulnerabilities
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run format:check`: PASS
- `npm run build`: PASS
- `git diff --check`: PASS
- `git diff --cached --check`: PASS

## Stage 2 outcome

Stage 2 is complete, verified, and merged into `main`:

- [x] Evidence Folio CSS tokens implemented in `src/app/globals.css` with `@theme inline` mappings;
- [x] Newsreader and Source Sans 3 typography integrated via `next/font/google` in `src/app/layout.tsx`;
- [x] Evidence Folio signature primitives implemented: `EvidenceRail`, `FolioMarker`, `SplitRule`, `TopicImprint`, and `ReferenceLedger`;
- [x] Public application shell implemented: `PublicShell`, `SiteHeader`, `MobileNav`, and `SiteFooter`;
- [x] Admin application shell implemented: `AdminShell` and `AdminMobileNav`;
- [x] Minimal reusable Base UI primitives implemented: `Button`, `Separator`, and `Sheet`;
- [x] Only justified direct dependencies added: `@base-ui/react`, `class-variance-authority`, `lucide-react`;
- [x] Code review corrections applied: Button/Link semantics fixed, misleading actions removed, unverified claims removed, fake references replaced with neutral placeholders, ReferenceLedger IDs wired via `React.useId()`, mobile drawer semantics streamlined, reduced motion added, admin touch target increased;
- [x] Project owner explicitly approved the Stage-2 merge on 2026-08-25;
- [x] Merge used `--no-ff` at merge commit `21c74c6c4025e63f8ae396678f1dfc95b892f900`;
- [x] Merge commit verified with expected two parents:
  - `4da2ff7adb0f7d46d3f5f1ff249f69cfb996f717` (prior `main`)
  - `e33875485ab5f37fe813081479e40fabf39bc4bb` (approved Stage-2 branch head)
- [x] Complete post-merge quality gate re-run on `main` and passed 100%;
- [x] No Supabase, database schema, migrations, or RLS initialized;
- [x] No authentication, sessions, or login workflows initialized;
- [x] No Tiptap editor, draft persistence, or publishing workflows initialized;
- [x] No secrets or credentials added;
- [x] Stage 3 remains NOT AUTHORIZED.

Final Stage-2 post-merge gate record (on `21c74c6c4025e63f8ae396678f1dfc95b892f900`):
- `npm ci`: PASS (375 packages added, 376 audited, 0 vulnerabilities)
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run format:check`: PASS
- `npm run build`: PASS (`/` and `/_not-found` generated statically via Next.js 16.3.2 / Turbopack)
- `git diff --check`: PASS

## Accepted UI governance

The owner accepted **Warm Medical Editorial with Scientific Restraint — The Evidence Folio** as the V1 visual direction.

The UI research/prototypes are now governed by:

- `docs/06-UI-DESIGN-SYSTEM.md`
- `docs/18-UI-IMPLEMENTATION-CONTRACT.md`
- `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`
- ACTIVE decisions D019 and D020

This acceptance defines future implementation requirements only. It does **not** authorize application code, packages, Stage 1, or out-of-order Stage 2 work.

## Current authorization boundary

**Stage 2 — Design System & Application Shells is COMPLETE, PASS, and MERGED into main.**

Owner authorization was given on **2026-08-24** in ChatGPT after Stage 1 was fully merged and verified under D021, and owner merge approval was given on **2026-08-25**.

Stage 2 implementation delivered:

- finalized Evidence Folio CSS-variable tokens;
- Newsreader + Source Sans 3 framework font foundation;
- `EvidenceRail`;
- `FolioMarker`;
- `SplitRule`;
- `TopicImprint`;
- `ReferenceLedger`;
- public shell;
- `SiteHeader`;
- `MobileNav`;
- `SiteFooter`;
- `AdminShell`;
- `AdminMobileNav`;
- reusable Stage-2 Base UI (`Button`, `Separator`, `Sheet`);
- responsive foundations;
- only dependencies genuinely required by Stage 2 and permitted under D020.

Stage 2 did NOT implement:

- Supabase schema, migrations, RLS or CLI initialization;
- authentication or user sessions;
- Tiptap rich-text editor;
- publishing workflows;
- comments or contact message functionality;
- real data integration;
- full homepage, About, Contact, or other page content;
- full article discovery or read experience;
- later-stage admin features;
- analytics;
- real client content;
- any Stage-3-or-later functionality.

No further Stage-2 application implementation is authorized. No new implementation stage is active. Stage 3 remains NOT AUTHORIZED.

## Stage-1 start record

Stage 1 began from verified canonical base:

`main @ 5e30fac03bdb2efc334399800a7842aa5af8e584`

Start conditions verified:

1. local `main` matched `origin/main`;
2. working tree was clean;
3. Node.js `v24.19.0` was active;
4. npm `11.17.0` was available;
5. Git `2.53.0.windows.2` was available;
6. no `.env*` files were detected;
7. project owner explicitly authorized Stage 1;
8. `stage/01-nextjs-foundation` was created from the verified base and pushed to GitHub.

Stage 1 implementation and merge closeout are complete.

## Stage-2 start & merge record

Stage 2 began from verified canonical base:

`main @ 4da2ff7adb0f7d46d3f5f1ff249f69cfb996f717`

Start conditions verified:

1. Stage 1 was fully merged into `main` and verified;
2. working tree was clean;
3. Node.js `v24.19.0` was active;
4. npm `11.17.0` was available;
5. Git `2.53.0.windows.2` was available;
6. `.gitattributes` line-ending policy was in place and clean;
7. project owner explicitly authorized Stage 2 in ChatGPT on 2026-08-24;
8. `stage/02-design-system` was created from the verified base.

Stage 2 implementation, review corrections, closeout, and merge into `main` at `21c74c6c4025e63f8ae396678f1dfc95b892f900` are complete.

## Stage transition rule

A future stage transition requires all of the following:

1. current stage deliverables completed;
2. relevant quality/security gate passed;
3. handoff/status documentation updated;
4. material decisions recorded in `docs/11-DECISION-LOG.md`;
5. stage branch merged into `main` under `docs/14-BRANCH-STRATEGY.md`;
6. local `main` synchronized with `origin/main`;
7. ChatGPT live-context freshness verified against current accepted `main` under D021 / `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md` (or newest verified fallback snapshot if live access is unavailable);
8. explicit owner authorization for the next implementation stage.

A branch name, research note, chat recommendation, visual prototype, or partial experiment never grants implementation authorization.
