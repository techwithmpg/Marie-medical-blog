# 13 — Project Status & Stage Authority

This file is the authoritative repository record of the currently active development stage and its authorization state.

## Current status

- **Current stage:** Stage 3 — Supabase Database & Security Foundation — COMPLETE (GATE PASS)
- **Stage authorization:** AUTHORIZED BY PROJECT OWNER — 2026-08-25
- **Stage-3 implementation status:** COMPLETE
- **Stage-3 gate status:** PASS
- **Stage-3 merge status:** READY FOR OWNER-APPROVED MERGE
- **Application coding authorized:** YES — STAGE 3 SCOPE ONLY (STAGE 3 IMPLEMENTATION COMPLETE)
- **Active working branch:** `stage/03-supabase-security`
- **Canonical Stage-3 base:** `e9480f7e0ae1a945203066aeedf04050112ac154`
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
- **Stage-3 implementation commit:** `ebc5618b267ac90a78474d4b1cfdd30bb3b54bf2`
- **Stage-3 correction commit:** `a2de6c0ed8638f4b080669f5c98eed2afa54ce65`
- **Stage-3 deployment & reconciliation commit:** `652f483637e24778ae5437b8e561f5b41231def1`
- **Next implementation stage:** Stage 4 — Authentication & Admin Access — NOT AUTHORIZED
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
- [x] Stage 3 authorized separately.

Final Stage-2 post-merge gate record (on `21c74c6c4025e63f8ae396678f1dfc95b892f900`):
- `npm ci`: PASS (375 packages added, 376 audited, 0 vulnerabilities)
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run format:check`: PASS
- `npm run build`: PASS (`/` and `/_not-found` generated statically via Next.js 16.3.2 / Turbopack)
- `git diff --check`: PASS

## Stage 3 outcome

Stage 3 is complete and verified on `stage/03-supabase-security`. Gate status is PASS; merge status is READY FOR OWNER-APPROVED MERGE:

- [x] Schema migration foundation established in `supabase/migrations/20260825054917_initial_database_security_foundation.sql`;
- [x] Single-admin authorization model implemented in dedicated `private` schema via `private.admin_users` and `private.is_admin()` (`security definer`, `search_path = ''`);
- [x] All 7 public domain tables created: `profiles`, `categories`, `articles`, `article_references`, `comments`, `contact_messages`, `site_settings`;
- [x] Row Level Security (RLS) enabled and verified across all public, private, and storage tables;
- [x] Granular table and column-level PostgreSQL grants/revokes established (defense in depth);
- [x] Commenter email privacy strictly protected under D023 (SELECT revoked from `anon`; authenticated SELECT restricted strictly to `private.is_admin()`);
- [x] Narrow public insert access configured for comments (status forced to `pending`) and contact messages (status forced to `new`);
- [x] Storage bucket `public-assets` configured (public read, 10MB limit, strict MIME allowlist: JPEG/PNG/WebP/AVIF/PDF, admin-only mutations);
- [x] Timestamp trigger utility `public.set_updated_at()` established with search_path safety;
- [x] Synthetic local seed fixtures established in `supabase/seed.sql` (excluded from hosted deployment);
- [x] Automated pgTAP test suite created across 7 test files (85 subtests, 100% passing);
- [x] Project-scoped hosted migration deployed to `eoexnnhqzrkurbqgbtnx` via temporary MCP write transport under D024;
- [x] Hosted migration version `20260825054917` captured and reconciled with local migration filename under D025;
- [x] Migration SQL SHA-256 hash verified identical pre- and post-deployment (`53C5AB6C77F397E738119B36CB4918C50E1677021631204FEBD3928D28D187E2`);
- [x] Temporary MCP write server completely removed; original read-only protection verified (`read_only=true`);
- [x] Hosted database state verified: 0 security errors, 0 seed rows, 0 admin allowlist rows (pending Stage 4);
- [x] Complete local regression suite passed 100% (`supabase db reset`, `supabase test db`, `supabase db lint`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`, `git diff --check`);
- [x] No Marie sign-in UI, login forms, or dashboard routes implemented;
- [x] No Tiptap editor, draft persistence, or publishing workflows implemented;
- [x] Stage 4 remains NOT AUTHORIZED.

Final Stage-3 gate record (on `stage/03-supabase-security` @ `652f483637e24778ae5437b8e561f5b41231def1`):
- `supabase db reset`: PASS
- `supabase test db` (pgTAP): PASS (7 files, 85 tests, 0 failures)
- `supabase db lint --level warning --local`: PASS (0 errors, 0 warnings)
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run format:check`: PASS
- `npm run build`: PASS
- `git diff --check`: PASS
- `git diff --cached --check`: PASS

## Accepted UI governance

The owner accepted **Warm Medical Editorial with Scientific Restraint — The Evidence Folio** as the V1 visual direction.

The UI research/prototypes are now governed by:

- `docs/06-UI-DESIGN-SYSTEM.md`
- `docs/18-UI-IMPLEMENTATION-CONTRACT.md`
- `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`
- ACTIVE decisions D019 and D020

This acceptance defines future implementation requirements only. It does **not** authorize application code, packages, Stage 1, or out-of-order Stage 2 work.

## Current authorization boundary

**Stage 3 — Supabase Database & Security Foundation is AUTHORIZED and ACTIVE.**

Owner authorization was given on **2026-08-25** in ChatGPT after Stage 2 was fully merged, synchronized, and verified on `main`.

Stage 3 may implement only:

- Supabase project-local development foundation;
- schema migrations;
- database constraints and indexes;
- Auth database foundation and Supabase integration foundation only;
- Row Level Security policies;
- Postgres grants;
- Storage buckets and Storage policies only if Stage-3 design proves they are required;
- synthetic seed/development fixtures;
- database/security verification tests;
- generated database types if appropriate to the approved Stage-3 implementation.

Stage 3 must NOT implement:

- Marie sign-in UI;
- login forms;
- logout UI;
- session refresh UI;
- protected admin routing;
- authenticated dashboard route implementation;
- Stage-4 unauthorized/access-denied UX;
- Tiptap rich-text editor;
- article editor implementation;
- publishing workflows;
- public article page implementation;
- comments UI;
- contact UI;
- inbox UI;
- later-stage product features;
- reader accounts;
- multi-author roles or permission systems.

Stage 4 remains NOT AUTHORIZED.

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

## Stage-3 start record

Stage 3 began from verified canonical base:

`main @ e9480f7e0ae1a945203066aeedf04050112ac154`

Start conditions verified:

1. Stage 2 was fully completed, merged and synchronized into `main`;
2. working tree was clean;
3. Node.js `v24.19.0` was active;
4. npm `11.17.0` was available;
5. Git `2.53.0.windows.2` was available;
6. canonical GitHub/local `main` was verified at `e9480f7e0ae1a945203066aeedf04050112ac154`;
7. project owner explicitly authorized Stage 3 in ChatGPT on 2026-08-25;
8. `stage/03-supabase-security` was created from that exact canonical `main`;
9. this authorization commit contains governance only;
10. no schema implementation occurred in this commit;
11. no package installation occurred in this commit;
12. no Supabase initialization occurred in this commit;
13. no hosted Supabase project was created or linked in this commit;
14. Stage 4 remains NOT AUTHORIZED.

## Stage-3 progress & hosted deployment record

Stage 3 implementation and verification record:

- **Stage status:** Stage 3 remains ACTIVE
- **Hosted project ref:** `eoexnnhqzrkurbqgbtnx` (Marie Medical Blog)
- **Active decisions:** D022, D023, D024, D025 ACTIVE in `docs/11-DECISION-LOG.md`
- **MCP transport verification & hosted deployment:**
  - Historical note: Initial deployment attempt failed due to active read-only session enforcement (`Cannot apply migration in read-only mode.`).
  - Temporary project-scoped write server `supabase_stage3_write` configured under D024 (`https://mcp.supabase.com/mcp?project_ref=eoexnnhqzrkurbqgbtnx&features=database`).
  - Pre-deployment hosted state: migration history empty (`[]`), public tables absent (`[]`), `private.admin_users` absent.
  - Migration deployment executed via `supabase_stage3_write/apply_migration` with exact authoritative SQL for `initial_database_security_foundation`.
  - Result: `apply_migration` SUCCESS (`{"success":true}`).
  - Generated hosted migration version captured via `supabase_stage3_write/list_migrations`: `20260825054917`.
  - Temporary write server `supabase_stage3_write` immediately and completely removed from global MCP configuration.
  - Read-only protection restored/retained on original `supabase` server (`https://mcp.supabase.com/mcp?project_ref=eoexnnhqzrkurbqgbtnx&read_only=true&features=database%2Cdebugging%2Cdocs`).
- **Migration integrity & D025 reconciliation:**
  - Authoritative migration: `supabase/migrations/20260825054917_initial_database_security_foundation.sql`
  - Pre-deployment SHA-256 hash: `53C5AB6C77F397E738119B36CB4918C50E1677021631204FEBD3928D28D187E2`
  - Post-reconciliation SHA-256 hash: `53C5AB6C77F397E738119B36CB4918C50E1677021631204FEBD3928D28D187E2` (100% match)
  - Local migration version reconciled: renamed from `20260825032113` to `20260825054917` under D025 to match hosted metadata.
  - Hosted migration version: `20260825054917` (`initial_database_security_foundation`).
  - Local and hosted migration histories in exact parity.
- **Hosted database verification (via read-only `supabase` MCP):**
  - Migrations: `[{"version":"20260825054917","name":"initial_database_security_foundation"}]`
  - Public tables: 7 tables verified (`public.profiles`, `public.categories`, `public.articles`, `public.article_references`, `public.comments`, `public.contact_messages`, `public.site_settings`), all RLS enabled, 0 rows.
  - Private schema: `private.admin_users` verified, RLS enabled, 0 rows.
  - Storage bucket: `public-assets` verified in `storage.buckets` (public=true, 10MB limit, mime allowlist), `storage.objects` = 0 rows.
  - Hosted security advisors: 0 security errors/vulnerabilities (1 INFO notice on `private.admin_users` intentional per `security definer` design).
  - Hosted performance advisors: 0 performance errors (INFO notices on unused indexes on empty tables).
  - Seed/synthetic production data: NONE exists on hosted project (all tables have 0 rows).
- **Local database regression gate:**
  - Local `supabase db reset`: PASS
  - pgTAP test suite: Files = 7, Tests = 85, Result = PASS (100%)
    - `01_schema_structure.test.sql`: PASS
    - `02_anonymous_access.test.sql`: PASS
    - `03_comments_security.test.sql`: PASS
    - `04_contact_messages_security.test.sql`: PASS
    - `05_authenticated_non_admin.test.sql`: PASS
    - `06_admin_access.test.sql`: PASS
    - `07_storage_security.test.sql`: PASS
  - Local database lint (`supabase db lint --level warning --local`): PASS (0 errors, 0 warnings)
- **Project quality gates:**
  - `npm run typecheck`: PASS
  - `npm run lint`: PASS
  - `npm run format:check`: PASS
  - `npm run build`: PASS
  - `git diff --check`: PASS
- **Security & data boundaries:**
  - Production seed NOT deployed (`supabase/seed.sql` remains local-only)
  - Synthetic fixtures remain local only
  - Hosted admin allowlist remains unprovisioned pending Stage 4
  - Auth configuration NOT modified
  - Edge Functions NOT modified
  - Stage 4 remains NOT AUTHORIZED

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
