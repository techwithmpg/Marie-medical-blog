# 13 — Project Status & Stage Authority

This file is the authoritative repository record of the currently active development stage and its authorization state.

## Current status

- **Current stage:** Stage 1 — Next.js Foundation — ACTIVE
- **Stage authorization:** AUTHORIZED BY PROJECT OWNER — 2026-08-23
- **Application coding authorized:** YES — STAGE 1 SCOPE ONLY
- **Gate status:** IN PROGRESS
- **Stage-0 merge commit:** `bca3483d844e3e931f3de300e20dd5670fa2c5ee` — `merge: complete stage 0 governance`
- **Active working branch:** `stage/01-nextjs-foundation`
- **Next implementation stage:** Stage 2 — Design System & Application Shells — NOT AUTHORIZED
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

## Accepted UI governance

The owner accepted **Warm Medical Editorial with Scientific Restraint — The Evidence Folio** as the V1 visual direction.

The UI research/prototypes are now governed by:

- `docs/06-UI-DESIGN-SYSTEM.md`
- `docs/18-UI-IMPLEMENTATION-CONTRACT.md`
- `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`
- ACTIVE decisions D019 and D020

This acceptance defines future implementation requirements only. It does **not** authorize application code, packages, Stage 1, or out-of-order Stage 2 work.

## Current authorization boundary

**Stage 1 — Next.js Foundation is AUTHORIZED and ACTIVE.**

Owner authorization was given on **2026-08-23** after successful Stage-0 completion, live-context verification, and local-machine preflight.

Stage 1 may implement only the frozen foundation defined in `docs/16-STAGE-1-TOOLCHAIN-BASELINE.md`, including:

- Next.js App Router + TypeScript foundation;
- Tailwind CSS foundation;
- structural shadcn/ui Base UI foundation;
- `src/` structure and aliases;
- strict TypeScript, ESLint and Prettier tooling;
- `.env.example` placeholders only;
- required npm/package/build scripts.

Stage 1 must NOT implement:

- broad Evidence Folio UI/page design;
- Supabase schema, migrations, RLS or CLI initialization;
- authentication;
- Tiptap/editor functionality;
- publishing workflows;
- comments/contact functionality;
- product SEO implementation;
- real client content;
- Stage-2-or-later application features.

Stage 2 remains NOT AUTHORIZED.
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

Stage 1 remains subject to its documented gate before merge or Stage-2 authorization.
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
