# 13 — Project Status & Stage Authority

This file is the authoritative repository record of the currently active development stage and its authorization state.

## Current status

- **Current stage:** Stage 0 — Repository & Project Governance — COMPLETE
- **Stage authorization:** COMPLETE
- **Application coding authorized:** NO
- **Gate status:** PASS
- **Stage-0 merge commit:** `bca3483d844e3e931f3de300e20dd5670fa2c5ee` — `merge: complete stage 0 governance`
- **Active working branch:** none on accepted `main`
- **Next implementation stage:** Stage 1 — Next.js Foundation — NOT AUTHORIZED
- **Remote:** `origin` → `https://github.com/techwithmpg/Marie-medical-blog.git`
- **Repository visibility:** public by owner decision
- **Accepted predevelopment UI contract:** Evidence Folio — `docs/18-UI-IMPLEMENTATION-CONTRACT.md`
- **Accepted visual-reference manifest:** `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`

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
- [x] ACTIVE governance/toolchain decisions D011–D018 recorded.
- [x] ChatGPT Project mirror refreshed from final Stage-0 main and verified.
- [x] Stage 0 formal gate reviewed and recorded as PASS.
- [x] Stage 0 governance branch merged into main with owner approval.
- [x] Owner accepted the Evidence Folio design direction and responsive visual prototypes.
- [x] Canonical UI implementation/dependency/no-drift policy prepared for governance merge under D019–D020.

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

**Stage 1 has NOT been authorized.**

Until the project owner explicitly authorizes **Stage 1 — Next.js Foundation**:

- do not create `stage/01-nextjs-foundation`;
- do not initialize the Next.js application;
- do not install project dependencies;
- do not create application routes/components;
- do not create Supabase schema or migrations;
- do not implement UI, auth, publishing, comments, SEO features, or other product functionality.

Permitted work is limited to repository synchronization, Project-context refresh, review, research, and governance maintenance that does not implement Stage 1.

## Remaining pre-Stage-1 transition requirements

After the UI-governance patch is merged into `main`:

1. synchronize local `main` and `origin/main`;
2. refresh the ChatGPT Project mirror because governance/design authority changed;
3. verify Project Source retrieval resolves to the new final `main` commit and includes D019/D020 plus the UI contract;
4. obtain explicit project-owner authorization for **Stage 1 — Next.js Foundation**;
5. only then create the Stage-1 branch from synchronized `main`.

## Stage transition rule

A future stage transition requires all of the following:

1. current stage deliverables completed;
2. relevant quality/security gate passed;
3. handoff/status documentation updated;
4. material decisions recorded in `docs/11-DECISION-LOG.md`;
5. stage branch merged into `main` under `docs/14-BRANCH-STRATEGY.md`;
6. local `main` synchronized with `origin/main`;
7. ChatGPT Project snapshot refreshed when governance context changed;
8. explicit owner authorization for the next implementation stage.

A branch name, research note, chat recommendation, visual prototype, or partial experiment never grants implementation authorization.
