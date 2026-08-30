# 13 — Project Status & Stage Authority

This file is the authoritative repository record of the currently active development stage and its authorization state.

## Current status

- **Current stage:** Pre-Stage-11 V1 Admin Completion — COMPLETE / MERGED / POST-MERGE QUALITY GATE PASS / CANONICAL SYNCHRONIZATION CONFIRMED
- **Stage authorization:** D035 + D036 ACTIVE / IMPLEMENTATION COMPLETE / MERGED / POST-MERGE QUALITY GATE PASS / CANONICAL SYNCHRONIZATION CONFIRMED — 2026-08-30
- **D035 canonical base:** `e8a7784fee2044d9be3aee80818f69784b2b5d7f`
- **Canonical Stage-10 base:** `33736919c1cb5208faaf3d0ca63d9796fc98db3d`
- **Active working branch:** `main` — CANONICAL / SYNCHRONIZED
- **Application coding authorized:** NO — V1 ADMIN COMPLETION GATE CLOSED / WAITING FOR NEW EXPLICIT OWNER AUTHORIZATION
- **Current implementation phase:** GATE CLOSED — CANONICAL INTEGRATION COMPLETE / WAITING FOR NEXT OWNER-CONTROLLED AUTHORIZATION
- **D035 status:** ACTIVE / IMPLEMENTATION COMPLETE / MERGED / POST-MERGE QUALITY GATE PASS
- **D036 status:** ACTIVE / MANAGED PUBLIC MEDIA + PUBLIC INTEGRATION COMPLETE / MERGED / POST-MERGE QUALITY GATE PASS
- **D036 migration:** `supabase/migrations/20260830090000_managed_public_media_slots.sql` — LOCAL ONLY / HOSTED NOT DEPLOYED
- **D036 fixed placements:** `home_hero`, `about_hero`, `portfolio_hero`, `contact_hero`, `author_portrait`, `default_social`
- **Public structural layout:** OWNER APPROVED / VIEWPORT-FLUID SHELL + RESPONSIVE GUTTERS / FLUID STRUCTURAL GRIDS / READING-WIDTH CONSTRAINTS RETAINED FOR PROSE
- **Gate-2 verification:** PASS — Node 174/174; pgTAP 323/323; Playwright 17/17; TypeScript; ESLint; Prettier; production build; staged diff integrity
- **Local integration merge commit:** `a018704a0d9ed68db3bd49f83c84212d80167ab5`
- **Local integration merge parents:** first parent `6fc9d6d1618e4308d88abaf9a5757032f619fc5c`; second parent `4682c1b1bc2843a4aea1bd2f16379f9fb08ffe06`
- **Post-merge quality gate:** PASS — Node 174/174; Playwright 17/17; pgTAP 323/323 rerun after browser mutations; TypeScript; ESLint; Prettier; diff integrity; production build previously PASS on the same application tree
- **Post-merge deterministic test corrections:** `supabase/tests/database/06_admin_access.test.sql` and `tests/e2e/stage9-settings-portfolio.spec.ts` only; no production application behavior, RLS, abuse limits, schema or UI contract changed
- **Post-merge runtime recovery:** Docker Desktop/WSL host bind-mount state was repaired locally; no repository/runtime dependency change resulted
- **Gate-2 branch relationship:** `fix/v1-admin-completion` = 0 behind / 6 ahead of accepted `origin/main` before final governance commit
- **Accepted main during Gate-2 closeout:** `6fc9d6d1618e4308d88abaf9a5757032f619fc5c`
- **Merge flow:** OWNER AUTHORIZED — GOVERNANCE CLOSEOUT → COMMIT/PUSH BRANCH → NORMAL MERGE PRESERVING HISTORY → POST-MERGE VERIFICATION

- **D035 design specification:** `docs/37-V1-ADMIN-COMPLETION-DESIGN.md`
- **Implementation branch:** `fix/v1-admin-completion` — CREATED FROM `6fc9d6d1618e4308d88abaf9a5757032f619fc5c`
- **Phase 10A status:** COMPLETE / EXTERNAL REVIEW PASS / D034 OWNER APPROVED
- **D034 status:** ACTIVE / FROZEN FOR STAGE-10 IMPLEMENTATION
- **Phase 10B status:** COMPLETE / LOCAL QUALITY GATE PASS
- **Phase 10B scope:** SITE URL AUTHORITY + ROUTE METADATA + CANONICALS + QUERY/PAGINATION INDEXABILITY
- **Phase 10C status:** COMPLETE / LOCAL DISCOVERY GATE PASS
- **Phase 10C scope:** EVIDENCE FOLIO SOCIAL FALLBACK + SITEMAP + ROBOTS + PUBLISHED-ARTICLE BLOGPOSTING JSON-LD
- **Phase 10D status:** COMPLETE / LOCAL ANALYTICS GATE PASS
- **Phase 10D scope:** OFFICIAL `@vercel/analytics` DEPENDENCY + MINIMAL NEXT.JS ROOT INTEGRATION + `beforeSend` PRIVACY FILTER + FOCUSED LOCAL VERIFICATION
- **Phase 10D dependency:** `@vercel/analytics@2.0.1` — EXACT CURRENT STABLE VERSION
- **Phase 10E status:** COMPLETE / FULL LOCAL GATE PASS
- **Phase 10E scope:** LOCAL-ONLY SUPABASE TEST INFRASTRUCTURE + COMPLETE REGRESSION/SECURITY/RENDERED/BROWSER/ACCESSIBILITY/VISUAL/BUILD GATE + STAGE-10 CLOSEOUT DOCUMENTATION
- **Phase 10E activation commit:** `51dbcedff08e0c1101a75c6a6da03923277f86f7`
- **Phase 10E corrective commit:** `62a15af` — rendered cross-route canonical serialization
- **Phase 10E closeout commit:** `665aaab5a23f0116deecc5b246bc0674a286f9f7`
- **Stage-10 approved branch head:** `b4cbd713b8e2f82ccbc93431106aa4825f9d11e5`
- **Stage-10 handoff:** `docs/36-STAGE-10-HANDOFF.md`
- **Stage-10 merge:** MERGED INTO `main` WITH EXPLICIT PROJECT-OWNER APPROVAL — 2026-08-29
- **Stage-10 merge commit:** `110a58d1de20648f408d49e4fd34e11969719501`
- **Stage-10 merge parents:**
  - first parent: `33736919c1cb5208faaf3d0ca63d9796fc98db3d`
  - second parent: `b4cbd713b8e2f82ccbc93431106aa4825f9d11e5`
- **Stage-10 post-merge gate:** PASS — focused 86/86; Node 153/153; pgTAP 323/323; application-schema lint clean; Playwright 15/15; axe serious/critical 0/0; typecheck, lint, format, diff check, production audit, rendered verification, and 18-route build PASS
- **Canonical main:** current clean `origin/main` after Stage-10 post-merge governance reconciliation; resolve live
- **Canonical local database workflow:** Docker-compatible runtime + project-local Supabase CLI + tracked `supabase/config.toml`; local API port `54321`
- **Redundant Docker experiment:** NOT STAGE-10 WORK / ARCHIVED EXTERNALLY BEFORE MERGE / NOT CANONICAL TOOLING / NOT COMMITTED
- **Hosted Analytics activation:** NOT ACTIVATED / NOT AUTHORIZED
- **Vercel hosted mutation:** NOT AUTHORIZED
- **Google Search Console mutation:** NOT EXECUTED / DEFERRED
- **Final production domain:** NOT CONFIGURED / STAGE 12
- **Categories:** PHASE 1 COMPLETE / LOCAL GATE PASS
- **Category migration:** NOT REQUIRED
- **Media:** D035 PHASE 2 + D036 MANAGED PUBLIC MEDIA COMPLETE / FULL LOCAL GATE PASS — complete Node regression 174/174 PASS; pgTAP 323/323 PASS; Playwright 17/17 PASS; typecheck/lint/format/build/diff integrity PASS
- **Media migration:** NOT REQUIRED
- **Hosted Supabase migration for this gate:** D036 LOCAL MIGRATION `20260830090000_managed_public_media_slots.sql` EXISTS / LOCAL VERIFICATION PASS / HOSTED DEPLOYMENT NOT EXECUTED OR AUTHORIZED BY THIS CLOSEOUT
- **Stage 11:** NOT AUTHORIZED / V1 ADMIN COMPLETION PREREQUISITE GATE COMPLETE / AWAITING NEW EXPLICIT OWNER AUTHORIZATION
- **Stage 12:** NOT AUTHORIZED
- **Next action:** VERIFY THIS FINAL GOVERNANCE-ONLY RECONCILIATION ON CANONICAL `main` → OPTIONAL `fix/v1-admin-completion` BRANCH CLEANUP → WAIT FOR NEW EXPLICIT OWNER AUTHORIZATION BEFORE STAGE 11
- **Stage-10 design specification:** `docs/35-STAGE-10-SEO-SOCIAL-ANALYTICS-DESIGN.md`
- **Phase 9A status:** COMPLETE / EXTERNAL PASS
- **Phase 9A final reviewed head:** `a329d34234b24def8607a5dea1747ddef800c393`
- **Phase 9A migration:** `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
- **Phase 9A migration SHA-256:** `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6`
- **Phase 9B status:** COMPLETE / FINAL EXTERNAL PASS
- **Phase 9B final reviewed head:** `d43d4c2bba1ed389cf772952daed3ed560a8c3e7`
- **Phase 9C status:** COMPLETE / EXTERNAL PASS
- **Phase 9C final reviewed head:** `f2b5527c8cb35052be365c9afc6d50031af28cff`
- **Phase 9D status:** COMPLETE / FINAL EXTERNAL PASS
- **Phase 9D final reviewed head:** `2fad9ae5b2b4af04634866e08c22671e10e83789`
- **Phase 9D final preview-fidelity correction:** PASS (Reusable disclaimer propagation: COMPLETE INCLUDING ADMIN-LOCAL ARTICLE PREVIEW; Admin-local preview profile: VERIFIED PUBLIC PROFILE / NO FABRICATED PROFESSIONAL CREDENTIALS; Client profile/settings reads in preview: NONE)
- **D032 social-link addendum:** APPROVED / { label, url }[] / HTTPS ONLY
- **Phase 9E status:** COMPLETE / FULL EXTERNAL PASS
- **Phase 9E final reviewed head:** `93a26e03e15d0bf4c42b7694c02db4b058c51f7f`
- **Playwright resolved version:** `1.62.1`
- **axe-core Playwright resolved version:** `4.13.0`
- **WCAG automated rules:** 2.0 / 2.1 / 2.2 AA supplemental coverage
- **axe serious violations:** 0
- **axe critical violations:** 0
- **Admin keyboard / focus:** PASS (Settings Space/Enter activation, Comments Tab reachability, Messages activation, Article Preview Space/Escape/focus return)
- **Representative visual review:** PASS (9 screenshots reviewed; Evidence Folio drift: NONE)
- **Local-only guard:** `http://127.0.0.1:54321` or `http://localhost:54321` ONLY (Port 54321 strictly enforced)
- **Native browser E2E:** 15/15 tests passed (Playwright Chromium + local Supabase)
- **Design specification:** `docs/33-STAGE-9-COMMENTS-CONTACT-SETTINGS-DESIGN.md`
- **Handoff document:** `docs/34-STAGE-9-HANDOFF.md`
- **Owner-approved architecture decisions:** D032 (Comments, Contact, Settings & Featuring) + D032 Addendum (Structured Social Links) + D033 (Stage-9 Controlled Hosted Deployment)
- **Gate status:** PHASE 9A COMPLETE / EXTERNAL PASS; PHASE 9B COMPLETE / FINAL EXTERNAL PASS; PHASE 9C COMPLETE / EXTERNAL PASS; PHASE 9D COMPLETE / FINAL EXTERNAL PASS; PHASE 9E COMPLETE / FULL EXTERNAL PASS; PHASE 9F COMPLETE / HOSTED DEPLOYMENT VERIFIED; PHASE 9G COMPLETE / STAGE CLOSEOUT; POST-MERGE GATE PASS
- **Hosted project:** `eoexnnhqzrkurbqgbtnx`
- **Hosted Stage-9 migration:** DEPLOYED / VERIFIED — 2026-08-26
- **Hosted Stage-9 migration version:** `20260826142425`
- **Hosted Stage-9 migration name:** `stage9_submission_security_and_feature_controls`
- **Authorized migration file:** `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
- **Authorized migration SHA-256:** `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6`
- **Replacement hosted attempt:** CONSUMED / SUCCEEDED
- **Hosted Supabase mutation:** Stage-9 objects deployed (constraints 10/10, indexes 5/5, triggers 2/2, functions 3/3)
- **Vercel production/WAF mutation:** NOT AUTHORIZED IN STAGE 9
- **Phase 9F status:** COMPLETE / HOSTED DEPLOYMENT VERIFIED
- **Phase 9G status:** COMPLETE / STAGE CLOSEOUT & HANDOFF
- **Stage-9 status:** COMPLETE / MERGED / GATE PASS
- **Stage-9 approved branch head:** `c3bc682ec401959745e17037124a1f1381302997`
- **Stage-9 merge commit:** `e4525f2496f68ea969d686d81f8abc9755d30007`
- **Stage-9 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-26
- **Stage-9 merge parents:**
  - first parent: `d7efeb7687e3d98f6af94c06300027b6275022ef`
  - second parent: `c3bc682ec401959745e17037124a1f1381302997`
- **Stage 10:** COMPLETE / MERGED / FULL LOCAL GATE PASS / POST-MERGE GATE PASS
- **Stage-8 status:** COMPLETE / MERGED / GATE PASS
- **Stage-8 approved branch head:** `fa06f386d2b69f64d9762120b95408226fea6b2c`
- **Stage-8 merge commit:** `e03b199e9a664e2ff2ce3f169ff286a7513e5ccb`
- **Stage-8 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-26
- **Stage-8 merge parents:**
  - first parent: `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
  - second parent: `fa06f386d2b69f64d9762120b95408226fea6b2c`
- **Hosted Stage-8 deployment:** DEPLOYED / VERIFIED — 2026-08-26
- **Hosted Stage-8 migration:** `20260825232024_stage8_publishing_lifecycle.sql`
- **Hosted migration version:** `20260825232024`
- **Canonical Stage-8 base:** `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
- **Stage-7 status:** COMPLETE / MERGED / GATE PASS
- **Stage-6 status:** COMPLETE / MERGED / GATE PASS
- **Stage-6 approved branch head:** `b31233eb644182cb84cad64642c824846cac9761`
- **Stage-6 merge commit:** `e28665e550dbc9150829351d9e06cafa26c5a577`
- **Stage-6 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-25
- **Stage-6 merge parents:**
  - first parent (prior main): `7d4af1583473d4851f9bf165e21b0b21e0c53570`
  - second parent (approved Stage-6 head): `b31233eb644182cb84cad64642c824846cac9761`
- **Stage-5 status:** COMPLETE / MERGED / GATE PASS
- **Stage-5 approved branch head:** `adc77b6bf1deb92951879a5746597cbe34e029cd`
- **Stage-5 merge commit:** `cd1007538a16868deca1f404ae62f54142df308c`
- **Stage-5 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-25
- **Stage-5 merge parents:**
  - first parent (prior main): `420a487cf38c991119965c0a0735a46d565be2d6`
  - second parent (approved Stage-5 head): `adc77b6bf1deb92951879a5746597cbe34e029cd`
- **Stage-4 status:** COMPLETE / MERGED / GATE PASS
- **Stage-4 approved branch head:** `daf172e574eebe05b164f988455cd7d69d418d4f`
- **Stage-4 merge commit:** `f88b84e65b1e7f30d133fdb7bd61d30f2059223b`
- **Stage-4 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-25
- **Stage-4 merge parents:**
  - first parent (prior main): `bd35efcbb3541579b63fc50e6797ab551a7a05b9`
  - second parent (approved Stage-4 head): `daf172e574eebe05b164f988455cd7d69d418d4f`
- **Stage-3 status:** COMPLETE / MERGED / GATE PASS
- **Stage-3 final canonical main:** `bd35efcbb3541579b63fc50e6797ab551a7a05b9`
- **Canonical Stage-6 base:** `7d4af1583473d4851f9bf165e21b0b21e0c53570`
- **Stage-6 initial implementation commit:** `94dcc614154f107cf271c4a79f9b4872d8a94e02`
- **Stage-6 first review correction commit:** `b84b4c5e3578952a52008d79b298b9b515d8d8c5`
- **Stage-6 final review micro-correction commit:** `e6fdad81f738b3eedacd0b1eb098584bd5fe614f`
- **Stage-6 governance alignment commit:** `55c10cc7501b685129cc56d69a5128ac124dc603`
- **Stage-6 visual-control correction commit:** `dd12e1c527c757aef1b4127905caaa1dbac5062a`
- **Stage-6 gate-closeout commit:** `18a624be0b2c00e31248fcb4fc3d3b0672cd468f`
- **Canonical Stage-5 base:** `420a487cf38c991119965c0a0735a46d565be2d6`
- **Canonical Stage-4 base:** `bd35efcbb3541579b63fc50e6797ab551a7a05b9`
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
- **Stage-3 gate closeout commit:** `026f1685e770344b65532b693f4374f208d902cf`
- **Stage-3 reference correction commit:** `184e3be6530708bd4d02c30d2fb2f38ff2399e6a`
- **Stage-3 merge commit:** `12ac9f446969179355871de3ce99fcf2f1bce162`
- **Stage-3 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-25
- **Stage-3 merge parents:**
  - first parent (prior main): `e9480f7e0ae1a945203066aeedf04050112ac154`
  - second parent (approved Stage-3 head): `184e3be6530708bd4d02c30d2fb2f38ff2399e6a`
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

Stage 3 is complete, verified, and merged into `main`:

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
- [x] Project owner explicitly approved the Stage-3 merge on 2026-08-25;
- [x] Merge used `--no-ff` at merge commit `12ac9f446969179355871de3ce99fcf2f1bce162`;
- [x] Merge commit verified with expected two parents:
  - `e9480f7e0ae1a945203066aeedf04050112ac154` (prior `main`)
  - `184e3be6530708bd4d02c30d2fb2f38ff2399e6a` (approved Stage-3 branch head)
- [x] Merge tree verified identical to approved Stage-3 branch tree (`b6558f6aeb633929015cf08b330a6de50c40eb42`);
- [x] No Marie sign-in UI, login forms, or dashboard routes implemented;
- [x] No Tiptap editor, draft persistence, or publishing workflows implemented;
- [x] Stage 4 remains NOT AUTHORIZED.

Final Stage-3 post-merge gate record (on `12ac9f446969179355871de3ce99fcf2f1bce162`):
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

## Historical authorization boundary — Stage 8 checkpoint

> Historical snapshot retained for provenance. This section records the authorization state at the Stage-8 checkpoint on 2026-08-26 and does not represent the current project authorization boundary. The authoritative current state is the `## Current status` section at the top of this file.

**Stage 8 — Publishing Workflow: Phase 8A & Phase 8B COMPLETED / LOCAL GATE PASS (2026-08-26).**

- The project owner approved D030 and authorized Stage-8 implementation.
- Phase 8A (Database Publishing Lifecycle Foundation) and Phase 8B (Server Actions & Storage Asset Promotion) are complete on branch `stage/08-publishing-workflow`.
- Phase 8C (UI & Admin-Local Preview Workspace), hosted Supabase deployment, and Stage 9 were separately gated and **NOT AUTHORIZED AT THIS HISTORICAL CHECKPOINT**.
- Stage 7 was **COMPLETE**, **MERGED** into `main`, and **GATE PASS** at this historical checkpoint.

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
  - Stage 4 authorized separately

## Stage-4 start record

Stage 4 began from verified canonical base:

`main @ bd35efcbb3541579b63fc50e6797ab551a7a05b9`

Start conditions verified:

1. Stage 3 was fully completed, verified, merged into `main` (`12ac9f446969179355871de3ce99fcf2f1bce162`), and synchronized on `main` at `bd35efcbb3541579b63fc50e6797ab551a7a05b9`;
2. working tree was clean;
3. Node.js `v24.19.0` was active;
4. npm `11.17.0` was available;
5. Git `2.53.0.windows.2` was available;
6. canonical GitHub/local `main` was verified at `bd35efcbb3541579b63fc50e6797ab551a7a05b9`;
7. project owner explicitly authorized Stage 4 in ChatGPT on 2026-08-25;
8. `stage/04-auth-admin` was created from that exact canonical `main`;
9. this authorization commit contains governance only;
10. no application code or package installation occurred in this commit;
11. Stage 5 remains NOT AUTHORIZED.

## Stage-4 final gate & merge record

STAGE 4 — AUTHENTICATION & ADMIN ACCESS

- **IMPLEMENTATION:** COMPLETE
- **GATE STATUS:** PASS
- **STAGE-4 MERGE:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-25
- **STAGE-4 APPROVED BRANCH HEAD:** `daf172e574eebe05b164f988455cd7d69d418d4f`
- **STAGE-4 MERGE COMMIT:** `f88b84e65b1e7f30d133fdb7bd61d30f2059223b`
- **STAGE-4 MERGE FIRST PARENT:** `bd35efcbb3541579b63fc50e6797ab551a7a05b9`
- **STAGE-4 MERGE SECOND PARENT:** `daf172e574eebe05b164f988455cd7d69d418d4f`
- **ACTIVE WORKING BRANCH:** `main`
- **APPLICATION CODING AUTHORIZED:** NO NEW IMPLEMENTATION STAGE AUTHORIZED
- **NEXT STAGE:** Stage 5 — Public Static / Identity Pages — NOT AUTHORIZED
- **STAGE-4 HANDOFF:** `docs/25-STAGE-4-HANDOFF.md`
- **D026:** ACTIVE / FROZEN FOR STAGE 4 (Stage-4 single-admin authentication & route protection architecture)
- **D027:** ACTIVE / FROZEN FOR STAGE 4 (Stage-4 controlled MCP migration deployment and version reconciliation)
- **LOCAL DATABASE / SECURITY GATE:** PASS
- **HOSTED DATABASE GATE:** PASS
- **HOSTED AUTH CONFIGURATION:** PASS / OWNER VERIFIED — 2026-08-25
  - Allow new users to sign up: OFF
  - Anonymous sign-ins: OFF
  - Email/password authentication: ENABLED
  - Phone authentication/provider for V1: DISABLED
  - OAuth/social providers for V1: DISABLED
  - Auth Hooks added: NO
- **PRODUCTION ADMIN PROVISIONING:** PASS
- **AUTH USERS:** 1
- **ADMIN ALLOWLIST ROWS:** 1
- **VALID AUTH/ADMIN ASSOCIATIONS:** 1 (0 orphan allowlist rows)
- **REAL ADMIN LOGIN:** PASS / OWNER VERIFIED
- **PROTECTED /admin ACCESS:** PASS
- **SESSION REFRESH / PERSISTENCE:** PASS
- **LOGOUT:** PASS
- **POST-LOGOUT /admin DENIAL:** PASS
- **PGTAP:** 8 files / 95 tests / PASS (100%)
- **DATABASE LINT:** PASS — 0 errors / 0 warnings
- **TYPECHECK:** PASS (0 errors)
- **LINT:** PASS (0 errors, 0 warnings)
- **FORMAT:** PASS (All files match Prettier style)
- **BUILD:** PASS (Production build successful)

### Stage 4 detailed technical and provenance record

- **D026 activation commit:** `f72aad0b995c08a7978b689a67c7d3b6ebaeb9d4` (`docs: activate stage 4 auth architecture`)
- **Stage-4 implementation commit:** `1fb556382be70f0ec3f073a46279bd777fd68e55` (`feat: implement stage 4 authentication foundation`)
- **D027 authorization commit:** `c521a5b6ae867a16e347f6e3ecd4464373a34893` (`docs: authorize stage 4 hosted deployment`)
- **D027 replacement authorization commit:** `6049f146581ed6cc2d5c1818fcc7120c0fd8260e` (`docs: authorize stage 4 migration replacement attempt`)
- **Stage-4 hosted deployment & reconciliation commit:** `d8c359421bec9b98a321a32a9f3473952d86f4b7` (`feat: deploy stage 4 auth migration and reconcile version`)
- **Hosted Auth hardening confirmation commit:** `67d86a4fbe138a2ffe2b0dd85017e150dc35233b` (`docs: record hosted auth hardening`)
- **Final provisioning authorization commit:** `f7f0c27e39582a3fab24131eb47ad9aff1ca4a66` (`docs: authorize final stage 4 admin provisioning`)
- **Local Supabase Auth hardening (`supabase/config.toml`):**
  - `auth.enable_signup = false`
  - `auth.email.enable_signup = false`
  - `auth.enable_anonymous_sign_ins = false` (anonymous sign-ins disabled)
  - Local public email signup rejection verified: REJECTED — PASS (`signup_disabled`)
  - Local anonymous sign-in rejection verified: DISABLED — PASS (`anonymous_provider_disabled`)
- **Selected package versions:**
  - `@supabase/supabase-js`: `2.112.4`
  - `@supabase/ssr`: `0.12.5`
  - Unrelated dependencies added: NONE
- **Database migration & D027 reconciliation:**
  - Migration file: `supabase/migrations/20260825081012_add_public_is_admin_rpc.sql` (reconciled from `20260825071105` to match hosted version)
  - Pre/post reconciliation SHA-256: `31BB810BAEE4355DDA25363B6A18AA9C5A124A2599DD93EF285F3AA18290B5F3` (100% match)
  - Function: `public.is_admin()` defined as `SECURITY INVOKER` with `set search_path = ''`, 0 arguments, delegating to `private.is_admin()`
  - Permissions: revoked from `public, anon`; granted to `authenticated`
  - Zero exposure of `private.admin_users`
- **Hosted database state (via read-only `supabase` MCP):**
  - Hosted migrations: `[{"version":"20260825054917","name":"initial_database_security_foundation"},{"version":"20260825081012","name":"add_public_is_admin_rpc"}]`
  - `public.is_admin()` verified: `SECURITY INVOKER`, 0 arguments, boolean return, `search_path locked to empty`, stable
  - `public.is_admin()` permissions: `anon` EXECUTE denied, `authenticated` EXECUTE granted
  - `private.is_admin()` verified: `SECURITY DEFINER`, stable, unchanged
  - `private.admin_users`: 1 row (matches the single authorized Marie Auth user)
  - Application tables: 7 public tables, all RLS enabled, 0 rows
  - Hosted security advisors: 0 security errors/warnings (1 expected INFO notice on `private.admin_users`)
  - Seed / synthetic production data: NONE exists hosted (all application tables have 0 rows)
- **Application auth & client helpers:**
  - `src/lib/supabase/client.ts`: browser client using `createBrowserClient` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `src/lib/supabase/server.ts`: request-scoped server client using `createServerClient` and `cookies()`
  - `src/lib/supabase/proxy.ts`: session refresh and anonymous redirect helper using `getClaims()` and cookie propagation
  - `src/proxy.ts`: Next.js 16 proxy interceptor (`export async function proxy(...)`, legacy middleware export removed)
  - `src/lib/auth/admin.ts`: `requireAdmin()` server authorization gate verifying `getClaims()` and `public.is_admin()`
  - `src/app/admin/login/actions.ts`: `loginAction` (signInWithPassword + allowlist verification + generic error) and `logoutAction` (signOut Server Action)
  - `src/app/admin/login/page.tsx` & `login-form.tsx`: Evidence Folio admin login interface (clean inputs, no placeholder credentials)
  - `src/app/admin/layout.tsx`: protected layout invoking `requireAdmin()` before rendering `AdminShell`
  - `src/app/admin/page.tsx`: authenticated editorial workspace overview (restrained Data Access / Protected by RLS status)
  - `src/components/admin/admin-shell.tsx` & `admin-mobile-nav.tsx`: logout action wired to Server Action form
- **Route & auth HTTP verification:**
  - Anonymous `GET /admin`: 307 redirect to `/admin/login` (PASS)
  - Anonymous `GET /admin/login`: 200 with Evidence Folio login UI (PASS)
  - Authenticated non-admin caller: `public.is_admin()` returns `false` (PASS)

## Stage 5 outcome

Stage 5 is complete, verified, and merged into `main`:

- **Stage status:** COMPLETE / MERGED / GATE PASS
- **Stage authorization:** AUTHORIZED BY PROJECT OWNER — 2026-08-25
- **Stage-5 approved branch head:** `adc77b6bf1deb92951879a5746597cbe34e029cd`
- **Stage-5 merge commit:** `cd1007538a16868deca1f404ae62f54142df308c`
- **Stage-5 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-25
- **Stage-5 merge parents:**
  - first parent (prior main): `420a487cf38c991119965c0a0735a46d565be2d6`
  - second parent (approved Stage-5 head): `adc77b6bf1deb92951879a5746597cbe34e029cd`
- **Final implementation commit:** `8d8f82c37e7a6bbd13f694ec6be9e34e4aa0b45f`
- [x] Evidence Folio public identity pages implemented: `/`, `/about`, `/portfolio`, `/contact`, `/disclaimer`;
- [x] Reusable public components implemented: `PageIntro`, `EmptyEditorialState`, `ContactFormShell`, `MedicalDisclaimer`;
- [x] Public data helpers and CV public URL resolution implemented in `src/lib/public-data.ts`;
- [x] Public shell navigation refined for Stage-5 routes: `SiteHeader`, `MobileNav`, `SiteFooter`;
- [x] Content-truth external review PASS (zero fabricated credentials, unverified services, or speculative claims);
- [x] Desktop visual review (1440x900) PASS;
- [x] Tablet visual review (1024x768) PASS;
- [x] Mobile 390 visual review (390x844) PASS;
- [x] Narrow 320 visual review (320x640) PASS;
- [x] Responsive overflow verification PASS (0px overflow via true Playwright viewport emulation);
- [x] Accessibility manual review PASS (semantic headings, skip link, persistent labels, 44px touch targets, contrast);
- [x] Quality gates: typecheck, lint, format, and production build PASS;
- [x] Stage 5 merged into `main` at merge commit `cd1007538a16868deca1f404ae62f54142df308c`.

## Stage-6 progress & implementation record

Stage 6 — Article Reading & Discovery:

- **Stage status:** COMPLETE / MERGED / GATE PASS
- **Stage authorization:** AUTHORIZED BY PROJECT OWNER — 2026-08-25
- **Canonical Stage-6 base:** `7d4af1583473d4851f9bf165e21b0b21e0c53570`
- **Active working branch:** `main` (merged from `stage/06-article-discovery`)
- **Initial implementation commit:** `94dcc614154f107cf271c4a79f9b4872d8a94e02`
- **First review correction commit:** `b84b4c5e3578952a52008d79b298b9b515d8d8c5`
- **Final review micro-correction commit:** `e6fdad81f738b3eedacd0b1eb098584bd5fe614f`
- **Governance alignment commit:** `55c10cc7501b685129cc56d69a5128ac124dc603`
- **Visual-control correction commit:** `dd12e1c527c757aef1b4127905caaa1dbac5062a`
- **Gate-closeout commit:** `18a624be0b2c00e31248fcb4fc3d3b0672cd468f`
- **Handoff metadata correction commit:** `b31233eb644182cb84cad64642c824846cac9761`
- **Stage-6 merge commit:** `e28665e550dbc9150829351d9e06cafa26c5a577`
- **Stage-6 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-25
- **Implementation scope & review corrections:**
  - [x] `/blog` (Published article discovery, lead story hero, topic filtering, sanitized search, strict positive-integer pagination, lead deduplication across all pages);
  - [x] `/blog/[slug]` (Evidence Folio long-form article view, Reference Ledger with data preservation, author context, medical disclaimer, category-based related writing);
  - [x] `/topics/[slug]` (Topic/category article discovery, strict positive-integer pagination, truthful empty states);
  - [x] PublicShell layout integration (`src/app/blog/layout.tsx` and `src/app/topics/layout.tsx`) preserving single `<main id="main-content">`, skip links, and gutters;
  - [x] Homepage (`/`) and Selected Writing (`/portfolio`) published article integration with neutral section semantics ("Recent Writing", "Published writing and educational articles");
  - [x] SiteHeader, MobileNav, and SiteFooter navigation integration with "Articles" (`/blog`);
  - [x] Server-side public article data access layer (`src/lib/public-articles.ts`) with explicit `status = 'published'` enforcement;
  - [x] Safe Tiptap/ProseMirror JSON read-only renderer (`src/components/public/article-typography.tsx`) with native React elements, 0 `dangerouslySetInnerHTML`, mark rendering, and URL protocol validation;
  - [x] Deterministic multi-column ordering and reading time calculation;
  - [x] Local synthetic test fixtures in `supabase/seed.sql` with neutral `site_settings` and `Synthetic Stage 6 Author` profile;
  - [x] Database failures vs truthful empty states separated with controlled unavailable notices and route error boundaries (`src/app/blog/error.tsx`, `src/app/topics/error.tsx`);
  - [x] Next.js image handling via `next/image` with narrow Supabase storage remote patterns and strict `featured_image_alt` check;
  - [x] Heading hierarchy normalized across all article views with single H1 per page;
  - [x] Mobile 44px minimum touch targets and `aria-current="page"` topic filter states;
  - [x] Visual control colors aligned with canonical `globals.css` tokens (`oxide`, `paper`, `ink-muted`, `control-border`);
  - [x] Security matrix SEC-01 through SEC-10 verified;
  - [x] Quality gates: local db reset, pgTAP (8 files, 95 tests), typecheck, lint, format check, and production build PASS;
  - [x] Responsive screenshots captured (1440x900, 1024x768, 390x844, 320x640) with 0px horizontal overflow;
  - [x] External visual, code, and security reviews: PASS;
  - [x] Stage 6 merged into `main` at merge commit `e28665e550dbc9150829351d9e06cafa26c5a577`.
- **Application coding authorized:** NO NEW IMPLEMENTATION STAGE AUTHORIZED
- **Gate status:** PASS

## Stage-7 outcome & implementation record

Stage 7 is complete, verified, and merged into `main`:

- **Stage status:** COMPLETE / MERGED / GATE PASS
- **Stage authorization:** AUTHORIZED BY PROJECT OWNER — 2026-08-25 (HOSTED DEPLOYMENT AUTHORIZED 2026-08-26, MERGE AUTHORIZED 2026-08-26)
- **Canonical Stage-7 base:** `927412a054ccf15bbb1caa23a54a48d761731a04`
- **Stage-7 initial design commit:** `0c0ceb58fe823f4bfffa3e61020327fe5bd6e7fe`
- **Stage-7 design-hardening commit:** `d941c2e100bf00965fd27f8c3ecc3c7eefb6d544`
- **Stage-7 implementation authorization SHA:** `8f6ac82f3c198e5a28b125ae93209b17e68db1df`
- **Stage-7 persistence foundation SHA:** `da2d2344e57a307e808d5d575bf7ab1132411f37`
- **Stage-7 initial implementation SHA:** `5b07ee2580e5f95fe360138ad560c9257e397017`
- **Stage-7 initial status SHA:** `ef569327d384f69076581e6351d346fac529e580`
- **Stage-7 correction implementation SHA:** `4d8c648f98716de638f5b6c1dbad7eabf3af3fec`
- **Stage-7 final persistence micro-correction SHA:** `69d5aede201e780af98f946e949827113c948483`
- **Stage-7 owner-approved architecture decision:** D028, D029
- **Stage-7 status:** COMPLETE / MERGED / GATE PASS
- **Stage-7 approved branch head:** `1fd848d60aa223d53589e6eea598399085ca7157`
- **Stage-7 merge commit:** `e8ab70f730bea656b421a4bbb0ea6afd30073141`
- **Stage-7 merge status:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-26
- **Stage-7 merge parents:**
  - first parent (prior main): `927412a054ccf15bbb1caa23a54a48d761731a04`
  - second parent (approved Stage-7 head): `1fd848d60aa223d53589e6eea598399085ca7157`
- **Active working branch:** `main`
- **Application coding authorized:** NO NEW IMPLEMENTATION STAGE AUTHORIZED
- **Gate status:** PASS
- **Hosted Stage-7 deployment:** DEPLOYED / VERIFIED — 2026-08-26
- **Next implementation stage:** Stage 8 — Publishing Workflow — NOT AUTHORIZED
- **Design specification:** `docs/29-STAGE-7-WRITER-DASHBOARD-EDITOR-DESIGN.md`
- **Phase 7A deliverables completed:**
  - [x] Exact Tiptap dependencies installed (`@tiptap/react@3.30.3`, `@tiptap/pm@3.30.3`, `@tiptap/starter-kit@3.30.3`, `@tiptap/extension-placeholder@3.30.3`);
  - [x] Private `draft-assets` bucket created (`public = false`, 5MB limit, image MIME types only);
  - [x] Storage RLS policies for `draft-assets` (admin only, anonymous/non-admin denied);
  - [x] Atomic persistence RPC `public.save_article_draft` created as `SECURITY INVOKER` with search_path safety;
  - [x] Quality gates: local db reset, pgTAP (9 files, 124 tests, 0 failures), typecheck, lint, format check, and production build PASS.
- **Phase 7B deliverables & review corrections completed:**
  - [x] Route `/admin/articles` implemented with status filters (All, Drafts, Published, Archived), responsive table/card layout, empty states, and "New Article" action link;
  - [x] Route `/admin/articles/new` implemented with clean unsaved initial state (0 database row created on page load);
  - [x] Route `/admin/articles/[id]` implemented with UUID regex validation (invalid UUID yields controlled 404 without database query), draft editing workspace for drafts, and read-only view for published/archived rows;
  - [x] Next.js route error boundary `src/app/admin/articles/error.tsx` implemented with controlled recovery and return navigation;
  - [x] Next.js development diagnostics root-cause resolved: deterministic date formatting `formatAdminDate()` implemented eliminating SSR/client hydration mismatch and Next.js "1 Issue" badge across all viewports;
  - [x] Hardened URL validation in `tiptap-toolbar.tsx` and `article-typography.tsx` rejecting protocol-relative URLs (`//`, `/\`) and accepting `/path`, `#hash`, `https://`, `http://`, `mailto:`;
  - [x] Hardcoded hex colors replaced with semantic tokens (`bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-muted`, `bg-card`) across all Stage 7 admin components;
  - [x] Tiptap typography hierarchy explicitly configured (H2: 24px Newsreader serif, H3: 20px Newsreader serif, P: 16px font-sans);
  - [x] Featured image upload component hardened with keyboard focusable `<button>`, visible focus ring, concurrent upload guard, and authenticated signed preview;
  - [x] Interactive Reference Ledger implemented with title, source, URL, citation details, Add, Remove, Move Up, Move Down, and persistent sequential `sort_order`;
  - [x] Revision-aware dirty tracking (`changeRevisionRef`) implemented so in-flight edits retain dirty "Unsaved changes" state until saved;
  - [x] Server-Action session invalidation redirect handled cleanly without unhandled rejection or swallowing;
  - [x] First-save persistent-ID reuse hardened in `ArticleEditor` (`persistedArticleId` ref/state initialized from `article?.id`, captured immediately upon save response before/during `router.replace()`, preventing duplicate draft row creation on rapid saves/Ctrl+S during route transition);
  - [x] Canonical snake_case RPC reference payload enforced in `public.save_article_draft` migration (strictly accepting `title`, `source_name`, `url`, `citation_details`, removing legacy camelCase fallbacks);
  - [x] Automated pgTAP regression added in `09_stage7_draft_authoring.test.sql` verifying atomic rollback when non-canonical camelCase `sourceName` is passed (suite updated to 9 files, 124 tests, 0 failures, 100% PASS);
  - [x] Quality gates: local db reset, pgTAP (9 files, 124 tests, 0 failures), typecheck, lint, format check, and production build PASS;
  - [x] Responsive screenshots captured (1440x900, 1024x768, 390x844, 320x640) with 0px horizontal overflow and 0 unresolved Next.js diagnostics.
- **Hosted Deployment & Verification completed (2026-08-26):**
  - [x] Owner authorization D029 and replacement addenda recorded;
  - [x] First two read-only MCP attempts rejected with verified ZERO hosted mutation;
  - [x] Dedicated authenticated write transport `supabase_stage7_write` verified;
  - [x] Final owner-authorized migration invocation executed: single reviewed migration deployed to hosted project `eoexnnhqzrkurbqgbtnx`;
  - [x] Hosted migration version captured: `20260825200129` (`stage7_draft_authoring_foundation`);
  - [x] Migration filename reconciled locally to `supabase/migrations/20260825200129_stage7_draft_authoring_foundation.sql` under D025/D027/D029 with byte-for-byte SHA-256 preservation (`7c81d861a5288d17b4ea2748c9b3ab1e95bfcf768a3d32ed8540d7252ecb5343`);
  - [x] Storage bucket `draft-assets` verified: private (`public = false`), 5MB limit, image MIME types only, administrator-only RLS policies, zero public access;
  - [x] Persistence RPC `public.save_article_draft` verified: `SECURITY INVOKER`, locked safe search path, public/anon execution revoked, strict parameter validation;
  - [x] Anonymous security checks verified: anonymous RPC denial, anonymous storage denial, zero public leakage;
  - [x] Synthetic draft verification completed: zero rows before save, initial save created draft record with provisional slug `draft-<UUID>`, second save updated in place without duplicate row creation, private featured image uploaded and verified in `draft-assets` only;
  - [x] Public leakage test verified: draft content completely inaccessible across `/blog`, `/blog/[slug]`, `/topics/[slug]`, search, and anonymous client queries;
  - [x] Local quality gates re-verified after reconciliation: `npx supabase db reset`, pgTAP (9 files, 124 tests, 0 failures), typecheck, lint, format check, and production build PASS;
  - [x] Stage-7 handoff documentation completed in `docs/30-STAGE-7-HANDOFF.md`.

## Stage-8 progress record — Phase 8A (2026-08-26)

- **Stage:** Stage 8 — Publishing Workflow
- **Phase:** Phase 8A — Database Publishing Lifecycle Foundation
- **Owner authorization:** D030 APPROVED + STAGE-8 IMPLEMENTATION AUTHORIZED BY PROJECT OWNER (2026-08-26)
- **Canonical Stage-8 base:** `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
- **Active working branch:** `stage/08-publishing-workflow`
- **Design specification:** `docs/31-STAGE-8-PUBLISHING-WORKFLOW-DESIGN.md`
- **Phase 8A migration:** `supabase/migrations/20260825232024_stage8_publishing_lifecycle.sql`
- **Phase 8A test suite:** `supabase/tests/database/10_stage8_publishing_workflow.test.sql`
- **Phase 8A deliverables completed:**
  - [x] Lifecycle RPC `public.publish_article` implemented (single-path from `draft`, canonical kebab slug validation, provisional draft slug pattern rejection, dynamic base truncation with unique collision suffix loop <=80 chars, first-time timestamp assignment `published_at = now()`, atomic reference replacement);
  - [x] Lifecycle RPC `public.update_published_article` implemented (updates published article content and references while strictly preserving slug, status, published_at, and featured flags);
  - [x] Lifecycle RPC `public.unpublish_article` implemented (transitions published article to `draft`, clears featured flags, demotes image path to `draft-assets`, preserves canonical slug and original `published_at`);
  - [x] Lifecycle RPC `public.archive_article` implemented (transitions `draft` or `published` article to `archived`, clears featured flags, demotes image to private bucket if published, preserves canonical slug and `published_at`);
  - [x] Lifecycle RPC `public.restore_article` implemented (transitions `archived` article to `draft`, preserving canonical slug, `published_at`, and draft image path);
  - [x] Lifecycle RPC `public.delete_article` implemented (permanently deletes never-published draft/archived records where `published_at IS NULL`; strictly rejects deletion of ever-published records to protect permanent URL integrity; cascades reference deletion);
  - [x] All 6 RPCs configured as `SECURITY INVOKER`, locked `search_path = ''`, protected by `private.is_admin()`, revoked from `PUBLIC` and `anon`, granted to `authenticated`;
  - [x] Comprehensive pgTAP test suite created with 75 subtests covering security invoker configuration, anonymous/non-admin denial, publication, canonical slug validation, collision retry handling, single-path state transitions, unpublishing, republishing slug freeze, archiving, restoring, deletion safety, and public leakage defense.
- **Local Quality Gates (Phase 8A):**
  - `npx supabase db reset`: PASS (clean reset from zero across all migrations)
  - `npx supabase test db`: PASS (10 files, 199 tests, 0 failures; 75 tests in Stage-8 suite)
  - `npm run typecheck`: PASS (0 errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier code style verified)
  - `npm run build`: PASS (Next.js production build successful)
  - `git diff --check`: PASS (clean diff)
- **Hosted Stage-8 deployment:** NOT AUTHORIZED
- **Phase 8B status:** COMPLETE / LOCAL GATE PASS
- **Phase 8C status:** NOT AUTHORIZED

## Stage-8 progress record — Phase 8B (2026-08-26)

- **Stage:** Stage 8 — Publishing Workflow
- **Phase:** Phase 8B — Server Actions & Storage Asset Promotion
- **Owner authorization:** Explicit continuation authorization for Phase 8B (2026-08-26)
- **Canonical Stage-8 base:** `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
- **Active working branch:** `stage/08-publishing-workflow`
- **Implementation commit SHA:** `fd73417c83d876c0872a348ca6488b578d6caa43`
- **Phase 8B files created/modified:**
  - `src/lib/admin/publishing.ts` (canonical slug generator, NFKD accent stripping, truncation <= 80 chars, validation, provisional pattern check)
  - `src/app/admin/articles/actions.ts` (lifecycle Server Actions: `publishArticleAction`, `updatePublishedArticleAction`, `unpublishArticleAction`, `archiveArticleAction`, `restoreArticleAction`, `deleteArticleAction`, `saveDraftAction`)
  - `tests/publishing-slug.test.mjs` (unit tests for canonical slug utilities)
  - `tests/stage8-phase8b-actions.test.mjs` (unit & integration tests for actions, storage promotion/demotion, failure compensation, cleanup)
- **Phase 8B deliverables completed:**
  - [x] Application-layer bridge implemented for all 6 lifecycle database RPCs with strict `await requireAdmin()` security gates;
  - [x] Server-side storage asset promotion from `draft-assets` to `public-assets` via native `@supabase/storage-js` authenticated cross-bucket `.copy()` with unique destination paths;
  - [x] Server-side storage asset demotion from `public-assets` to `draft-assets` on unpublish and archive transitions;
  - [x] Compensating transaction rollback: automatically removes newly copied destination assets if subsequent database RPC encounters an error;
  - [x] Post-success source asset cleanup: removes private draft source upon publication and removes superseded public asset upon published image replacement;
  - [x] Deletion safety invariant enforced: hard deletion permitted strictly when `status IN ('draft', 'archived') AND published_at IS NULL`; ever-published deletion strictly rejected;
  - [x] Surgical cache revalidation executed across all affected public routes (`/`, `/blog`, `/blog/[slug]`, `/topics/[slug]`, `/portfolio`) and admin workspaces (`/admin/articles`, `/admin/articles/[id]`);
  - [x] Comprehensive test coverage added: 14/14 automated tests passing (slug generation, NFKD normalization, 80-char truncation, provisional slug rejection, promotion/demotion path scoping, failure rollback compensation, post-success cleanup, and permalink safety).
- **Local Quality Gates (Phase 8B):**
  - `npx supabase db reset`: PASS
  - `npx supabase test db`: PASS (10 files, 199 tests, 0 failures)
  - `node --test tests/*.test.mjs`: PASS (14 tests, 0 failures)
  - `npm run typecheck`: PASS (0 type errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier verified)
  - `npm run build`: PASS (Next.js production build verified)
  - `git diff --check`: PASS (clean diff)
- **Hosted Stage-8 deployment:** NOT AUTHORIZED
- **Phase 8C status:** COMPLETE / LOCAL GATE PASS

## Stage-8 progress record — Phase 8C (2026-08-26)

- **Stage:** Stage 8 — Publishing Workflow
- **Phase:** Phase 8C — Publishing UI + Preview Workspace
- **Owner authorization:** Explicit continuation authorization for Phase 8C (2026-08-26)
- **Canonical Stage-8 base:** `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
- **Active working branch:** `stage/08-publishing-workflow`
- **Implementation commit SHA:** `02fbd452c855a059e6455797871596e3be96871e`
- **Phase 8C files created/modified:**
  - `src/components/admin/editor/article-preview-modal.tsx` (Evidence Folio in-memory preview workspace, responsive desktop/tablet/mobile viewport switcher, signed draft asset previews, live reading time, secure private admin containment);
  - `src/components/admin/editor/publish-modal.tsx` (first publication candidate slug customization with live kebab preview, republishing permanent slug freeze indicator, publication summary grid, in-flight action locks, error banner);
  - `src/components/admin/editor/lifecycle-modals.tsx` (dedicated accessible confirmation dialogs for Unpublish, Archive, Restore, and Delete with ever-published deletion block);
  - `src/components/admin/editor/article-editor.tsx` (state-aware lifecycle workspace supporting Draft, Published, and Archived modes, in-flight status indicators, keyboard shortcuts, clean dirty tracking, toast notifications);
  - `src/app/admin/articles/[id]/page.tsx` (routes all valid article statuses into the complete Stage 8 `ArticleEditor`);
  - `src/app/admin/articles/page.tsx` (articles dashboard with state-aware table/card action buttons and direct "Live Post" external links);
  - `tests/stage8-phase8c-ui-lifecycle.test.mjs` (automated test suite covering UI state machine action availability, slug immutability rules, ever-published deletion guards, and in-flight operation locks);
  - `tests/stage8-phase8c-e2e.test.mjs` (automated end-to-end publishing lifecycle test suite executing complete 8-step lifecycle against local database).
- **Phase 8C deliverables completed:**
  - [x] Evidence Folio Admin Preview Modal implemented reusing genuine public presentation components (`ArticleHeader`, `ArticleTypography`, `ReferenceLedger`, `AuthorBlock`, `MedicalDisclaimer`) while strictly remaining within authenticated admin boundary;
  - [x] Multi-device viewport switcher implemented (Desktop 100%, Tablet 768px, Mobile 375px) with genuine aspect scaling and typography containment;
  - [x] First publication flow allows candidate slug customization (<= 80 chars, kebab-case, no draft UUIDs); republishing permanently locks canonical slug;
  - [x] Complete lifecycle action modals implemented with clear, unambiguous consequence copy;
  - [x] Ever-published deletion protection enforced in UI: hard deletion disabled with descriptive tooltip for any article where `published_at` is non-null;
  - [x] Admin article dashboard updated to display state-aware actions and live public post links;
  - [x] Comprehensive test suites added: 21/21 automated node tests passing across 4 test suites + 199/199 database pgTAP tests passing.
- **Local Quality Gates (Phase 8C):**
  - `npx supabase db reset`: PASS (clean reset from zero across all migrations)
  - `npx supabase test db`: PASS (10 files, 199 tests, 0 failures; 75 tests in Stage-8 suite)
  - `node --test tests/*.test.mjs`: PASS (4 test files, 21 tests, 0 failures)
  - `npm run typecheck`: PASS (0 type errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier verified across entire codebase)
  - `npm run build`: PASS (Next.js production build verified cleanly)
  - `git diff --check`: PASS (clean diff)
- **Hosted Stage-8 deployment:** NOT AUTHORIZED
- **Stage 8 Implementation Status:** COMPLETE / ALL PHASES (8A, 8B, 8C) VERIFIED / READY FOR HANDOFF PROTOCOL

## Stage-8 progress record — External Pre-Hosted Review Corrections (2026-08-26)

- **Stage:** Stage 8 — Publishing Workflow
- **Phase:** External Pre-Hosted Review Hardening
- **Objective:** Apply pre-hosted review hardening corrections to the pending Stage-8 migration, server actions, and UI prior to owner deployment authorization.
- **Canonical Stage-8 base:** `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
- **Active working branch:** `stage/08-publishing-workflow`
- **Pending migration modified in place:** `supabase/migrations/20260825232024_stage8_publishing_lifecycle.sql`
- **Hosted Supabase status:** NOT APPLIED / ZERO HOSTED MUTATION / WRITE CHANNEL REMAINS DORMANT
- **Pre-hosted review corrections completed:**
  - [x] **Meaningful Content Validation (PostgreSQL & TypeScript):** Native `jsonb_path_exists(p_content_json, '$.** ? (@.type == "text" && @.text like_regex "\\S")')` added to both `public.publish_article` and `public.update_published_article`; shared helper `hasMeaningfulArticleContent(content)` added to `src/lib/admin/publishing.ts` and enforced in `publishArticleAction` and `updatePublishedArticleAction`. Empty ProseMirror docs, empty paragraphs, and whitespace-only text nodes are strictly rejected upon publication/update.
  - [x] **Deterministic Slug Fallback:** Restored D030 contract `generateCanonicalSlug(title, articleId)` yielding `article-${articleId.slice(0,8)}` when title normalization produces an empty string. Callers updated in actions, modals, and test suites.
  - [x] **Elimination of Ambiguous Storage List Probe:** Removed `draft-assets.list()` probe from publish/update workflows. Draft images are strictly treated as private objects residing in `draft-assets` and promoted via cross-bucket copy to unique paths in `public-assets`. If private source does not exist or copy fails, publication is aborted.
  - [x] **Storage Remove Result Checking & UI Warning Propagation:** Every `storage.from(...).remove(...)` invocation across publish, update, unpublish, archive, and delete now inspects the returned error. On DB failure, compensation cleanup is performed (surfacing double-faults if compensation fails). On transition success with asset cleanup failure, cleanups return a structured `warning` property surfaced visibly in the Evidence Folio `ArticleEditor` warning banner.
  - [x] **Hardened RPC Image Validation:** `unpublish_article` and `archive_article` strictly reject non-empty `p_private_image_path` when the source article has no featured image, and draft archiving strictly rejects private destination path mutations.
  - [x] **Defense-in-Depth Republish Slug Invariant:** `publish_article` on republish defensively rejects ever-published articles whose slug matches provisional draft UUID patterns.
  - [x] **Real Local Storage Integration Test Suite:** Added `tests/stage8-storage-lifecycle-e2e.test.mjs` verifying real local Supabase (`http://127.0.0.1:54321`) storage upload, anon denial, cross-bucket copy, publication, private cleanup, public availability, unpublish demotion, public raw object invalidation, and replacement flows with synthetic PNG buffers.
  - [x] **Compensation Failure & Error Testing:** Expanded `tests/stage8-phase8b-actions.test.mjs` with double-fault error handling and cleanup warning verification.
- **Local Quality Gates (Pre-Hosted Correction):**
  - `npx supabase db reset`: PASS (clean reset from zero across all 4 migrations)
  - `npx supabase test db`: PASS (10 files, 210 tests, 0 failures; 86 tests in Stage-8 suite)
  - `node --test tests/*.test.mjs`: PASS (5 test files, 27 tests, 0 failures)
  - `npm run typecheck`: PASS (0 type errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier verified across entire codebase)
  - `npm run build`: PASS (Next.js production build verified cleanly)
  - `git diff --check`: PASS (clean diff)
- **Hosted Stage-8 deployment:** NOT AUTHORIZED — AWAITING EXPLICIT OWNER DEPLOYMENT APPROVAL
- **Next implementation stage:** Stage 9 — Comments, Contact Inbox & Settings — NOT AUTHORIZED

## Stage-8 progress record — Final Pre-Hosted Draft-Save Regression Fix (2026-08-26)

- **Stage:** Stage 8 — Publishing Workflow
- **Phase:** Final Pre-Hosted Draft Persistence Regression Fix
- **Objective:** Correct the application-layer RPC invocation in `saveDraftAction` to restore the established Stage-7 database RPC `public.save_article_draft` with its exact parameter contract including `p_provisional_slug: provisionalSlug`.
- **Canonical Stage-8 base:** `25a3ac5489703a6ca2e28413f8d6046c52f55dd4`
- **Active working branch:** `stage/08-publishing-workflow`
- **Application file modified:** `src/app/admin/articles/actions.ts`
- **Regression test file updated:** `tests/stage8-phase8b-actions.test.mjs` (added source contract & RPC parameter regression check)
- **Hosted Supabase status:** NOT APPLIED / ZERO HOSTED MUTATION / WRITE CHANNEL REMAINS DORMANT
- **Deliverables completed:**
  - [x] **Restored Stage-7 RPC Invocation:** `saveDraftAction` in `src/app/admin/articles/actions.ts` updated to call `save_article_draft` supplying all required parameters: `p_article_id`, `p_provisional_slug`, `p_title`, `p_excerpt`, `p_content_json`, `p_category_id`, `p_featured_image_path`, `p_featured_image_alt`, `p_seo_title`, `p_seo_description`, `p_references`.
  - [x] **Zero Incorrect References:** Verified zero occurrences of `save_draft_article` across the entire codebase.
  - [x] **Automated Action Contract Regression Test:** Added regression test in `tests/stage8-phase8b-actions.test.mjs` that continuously asserts zero occurrences of `save_draft_article` and validates the presence of `save_article_draft` with `p_provisional_slug: provisionalSlug`.
  - [x] **Real Writer Workflow Verification:** Executed full end-to-end admin writer workflow: initial save creates draft record with `slug = draft-<full UUID>`, `status = 'draft'`, `published_at = null`; second save updates the existing row in place with 0 duplicate rows created; reload/persistence confirmed.
- **Local Quality Gates (Final Pre-Hosted Gate):**
  - `npx supabase db reset`: PASS (clean reset from zero across all 4 migrations)
  - `npx supabase test db`: PASS (10 files, 210 tests, 0 failures; 86 tests in Stage-8 suite)
  - `node --test tests/*.test.mjs`: PASS (5 test files, 28 tests, 0 failures)
  - `npm run typecheck`: PASS (0 type errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier verified across entire codebase)
  - `npm run build`: PASS (Next.js production build verified cleanly)
  - `git diff --check`: PASS (clean diff)
- **Hosted Stage-8 deployment:** DEPLOYED / VERIFIED — 2026-08-26
- **Stage-8 final status:** COMPLETE / MERGED / GATE PASS

## Stage-9 progress record — Phase 9A & Review Corrections (2026-08-26)

- **Stage:** Stage 9 — Comments, Contact Inbox & Settings
- **Phase:** Phase 9A — Database / Public-Submission Security Foundation
- **Owner authorization:** D032 APPROVED + STAGE-9 IMPLEMENTATION AUTHORIZED BY PROJECT OWNER (2026-08-26)
- **Canonical Stage-9 base:** `d7efeb7687e3d98f6af94c06300027b6275022ef`
- **Active working branch:** `stage/09-comments-contact-settings`
- **Design specification:** `docs/33-STAGE-9-COMMENTS-CONTACT-SETTINGS-DESIGN.md`
- **Phase 9A migration:** `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
- **Phase 9A migration SHA-256:** `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6`
- **Phase 9A test suite:** `supabase/tests/database/11_stage9_comments_contact_settings.test.sql`
- **External Phase-9A review:** CORRECTIONS APPLIED / LOCAL GATE PASS
- **Phase 9A final boundary-test correction:** PASS
- **Exact global limits verified:**
  - Comments: 99 qualifying in rolling hour -> 100th allowed; >100 rejected (`Comment system is currently busy. Please try again later.`)
  - Contact messages: 29 qualifying in rolling hour -> 30th allowed; >30 rejected (`Contact service is currently experiencing high volume. Please try again later.`)
- **Phase 9A deliverables completed & hardened:**
  - [x] **Comment Moderation Consistency Check:** Added constraint `comments_moderation_consistency_check` enforcing `(status = 'pending' AND moderated_at IS NULL) OR (status IN ('approved', 'hidden') AND moderated_at IS NOT NULL)`.
  - [x] **Feature Flag Publication Checks & Lead Uniqueness:** Added constraints `articles_is_featured_published_check` and `articles_is_portfolio_featured_published_check` enforcing that only published articles can be featured; created partial unique index `idx_articles_single_featured` ensuring at most one lead featured article site-wide.
  - [x] **Site Settings Singleton Invariants:** Added constraints on `public.site_settings` enforcing `id = 1`, title length (1-120 chars, trimmed), tagline <=200 chars, homepage intro <=1200 chars, disclaimer <=1500 chars, SEO description <=320 chars, and JSON array type for `social_links`.
  - [x] **Rate-Limit Supporting Indexes:** Created indexes on `public.comments (commenter_email, created_at DESC)`, `public.comments (created_at DESC)`, `public.contact_messages (email, created_at DESC)`, and `public.contact_messages (created_at DESC)`.
  - [x] **Private Comment Submission Guard (`private.guard_comment_submission`):** Created `BEFORE INSERT` trigger function in `private` schema with `SECURITY DEFINER`, `search_path = ''`, execution revoked from `PUBLIC, anon, authenticated`. Forces system fields (`id := extensions.gen_random_uuid()`, `created_at := pg_catalog.now()`, `status := 'pending'`, `moderated_at := NULL`), trims name/email/body, and applies transaction-locked rate limits (3/15m/email+article, 10/24h/email, 100/1h global).
  - [x] **Private Contact Submission Guard (`private.guard_contact_submission`):** Created `BEFORE INSERT` trigger function in `private` schema with `SECURITY DEFINER`, `search_path = ''`, execution revoked from `PUBLIC, anon, authenticated`. Forces system fields (`id := extensions.gen_random_uuid()`, `created_at := pg_catalog.now()`, `status := 'new'`), trims name/email/subject/message, and applies transaction-locked rate limits (3/1h/email, 5/24h/email, 30/1h global).
  - [x] **Admin Lead-Feature RPC (`public.set_featured_article`):** Implemented `public.set_featured_article(p_article_id uuid)` as `SECURITY INVOKER`, empty `search_path`, protected by `private.is_admin()`, revoked from `PUBLIC` and `anon`, granted to `authenticated`. Atomically sets or clears lead featured article.
  - [x] **Hardened Authenticated Non-Admin Regression Tests:** Tested authenticated non-admin comment INSERT (rejected by RLS `42501`) and authenticated non-admin contact INSERT with spoofed client UUID, historical `created_at`, and `status = 'archived'`. Verified that client-supplied ID/timestamp/status are discarded, generated ID and current `created_at` are enforced, and historical timestamps cannot bypass rate limiting.
  - [x] **Explicit Rate-Limit Boundary Tests:** Verified all 6 rate-limit boundaries:
    - comment 3/15m: PASS
    - comment 10/24h: PASS
    - comment 100/1h global (exact 99 -> 100 allowed -> 101 rejected): PASS
    - contact 3/1h: PASS
    - contact 5/24h: PASS
    - contact 30/1h global (exact 29 -> 30 allowed -> 31 rejected): PASS
  - [x] **Neutral Synthetic Fixture Cleanup:** Replaced all medical/professional identity claims with neutral synthetic fixtures across test suites and migrations.
  - [x] **Comprehensive pgTAP Test Suite:** 113 subtests in `supabase/tests/database/11_stage9_comments_contact_settings.test.sql` covering moderation invariants, feature flag constraints, lead uniqueness, site settings constraints, private guard function security, anonymous comment submission normalization, rate limiting boundaries, anonymous contact message normalization, column/table permission denials, authenticated non-admin system-field defense, admin moderation/contact operations, and prior regression integrity.
- **Local Quality Gates (Phase 9A):**
  - `npx supabase db reset`: PASS (clean reset across all 5 migrations)
  - `npx supabase test db`: PASS (11 files, 323 tests, 0 failures; 113 tests in Stage-9 suite)
  - `node --test tests/*.test.mjs`: PASS (5 test files, 28 tests, 0 failures)
  - `npm run typecheck`: PASS (0 type errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier verified across entire codebase)
  - `npm run build`: PASS (Next.js production build verified cleanly)
  - `git diff --check`: PASS (clean diff)
- **Hosted Stage-9 deployment:** NOT AUTHORIZED / NOT APPLIED
- **Phase 9A status:** COMPLETE / LOCAL + EXTERNAL GATE PASS
- **Phase 9B status:** COMPLETE / LOCAL PASS / AWAITING CHATGPT EXTERNAL REVIEW
- **Stage-9 merge:** NOT AUTHORIZED
- **Stage 10:** NOT AUTHORIZED

## Stage-9 progress record — Phase 9B Public Comments & Contact Submissions (2026-08-26)

- **Stage:** Stage 9 — Comments, Contact Inbox & Settings
- **Phase:** Phase 9B — Public Comments & Contact Submissions
- **Owner authorization:** D032 APPROVED + STAGE-9 IMPLEMENTATION AUTHORIZED BY PROJECT OWNER (2026-08-26)
- **Canonical Stage-9 base:** `d7efeb7687e3d98f6af94c06300027b6275022ef`
- **Active working branch:** `stage/09-comments-contact-settings`
- **Design specification:** `docs/33-STAGE-9-COMMENTS-CONTACT-SETTINGS-DESIGN.md`
- **Phase 9A migration:** `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
- **Phase 9A migration SHA-256:** `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6` (verified intact)
- **New runtime dependency:** `zod` (`^4.4.3` / `4.4.3`) — authorized by D032
- **New test suite:** `tests/stage9-phase9b-public-submissions.test.mjs`
- **Hosted Supabase status:** NOT APPLIED / ZERO HOSTED MUTATION / WRITE CHANNEL REMAINS DORMANT
- **Deliverables completed:**
  - [x] **Zod Validation Schemas (`src/lib/public-submissions.ts`):** Implemented `commentSubmissionSchema` and `contactSubmissionSchema` aligning with PostgreSQL schema invariants (UUID regex, trim, lowercased email, lengths: comment name 100, email 255, body 2000; contact name 100, email 255, subject 200, message 5000), honeypot check helper `isHoneypotTriggered`, and typed action response `SubmissionActionResult`.
  - [x] **Safe Public Comments Query Helper (`src/lib/public-comments.ts`):** Implemented `getApprovedCommentsByArticleId(articleId)` which explicitly selects only public columns (`id, article_id, commenter_name, body, created_at`), filters `status = 'approved'`, and orders `created_at ASC`. Never selects `commenter_email` or `moderated_at`.
  - [x] **Comment Server Action (`src/app/blog/[slug]/actions.ts`):** Implemented `submitCommentAction` using standard server client (`createClient()`), checking honeypot, validating with Zod schema, inserting only allowed columns (`article_id, commenter_name, commenter_email, body`), and returning safe generic messages without leaking SQL internals.
  - [x] **Contact Server Action (`src/app/contact/actions.ts`):** Implemented `submitContactAction` using standard server client (`createClient()`), checking honeypot, validating with Zod schema, inserting only allowed columns (`name, email, subject, message`), and returning safe generic messages without leaking SQL internals.
  - [x] **Accessible Comment Form Component (`src/components/public/comment-form.tsx`):** Created Client Component using React `useActionState(submitCommentAction)`, off-screen honeypot input, accessible labels, aria-invalid/aria-describedby error states, email privacy note, moderation review notice, and 44px submit button.
  - [x] **Comment Section Server Component (`src/components/public/comment-section.tsx`):** Implemented Server Component with section header, `SplitRule`, comment count `TopicImprint`, approved comment list, and embedded `CommentForm`. Integrated into `src/app/blog/[slug]/page.tsx` directly after Related Writing.
  - [x] **Active Contact Form Component (`src/components/public/contact-form-shell.tsx`):** Activated the contact form with `useActionState(submitContactAction)`, live character counters for subject (current / 200) and message (current / 5000), off-screen honeypot, accessible error alerts, and preserved Evidence Folio styling and medical disclaimer.
  - [x] **Automated Application Test Suite (`tests/stage9-phase9b-public-submissions.test.mjs`):** 11 tests covering validation contracts, whitespace normalization, length boundaries, Server Action source constraints (createClient, narrow insert columns, no service-role, safe errors), public comment query privacy invariants, UI contracts (contact form active, counters present, comment notices present), and scope drift guards (zero reader auth, captcha, email providers, or client writes).
  - [x] **Real Database E2E Verification:** Verified comment insertion (default pending), pending comment invisibility against anon queries, contact insertion (default unread), and anon read confidentiality against contact table.
- **Local Quality Gates (Phase 9B Initial & External Corrections):**
  - `npx supabase db reset`: PASS (clean reset across all 5 migrations)
  - `npx supabase test db`: PASS (11 files, 323 tests, 0 failures; 113 tests in Stage-9 suite)
  - `node --test tests/*.test.mjs`: PASS (6 test files, 39 tests, 0 failures)
  - `npm run typecheck`: PASS (0 type errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier verified across entire codebase)
  - `npm run build`: PASS (Next.js production build verified cleanly across all 12 routes)
  - `git diff --check`: PASS (clean diff)
- **Phase 9B External Review Corrections (2026-08-26):**
  - [x] **Contact Form Repeated-Use Counter Fix:** Updated `src/components/public/contact-form-shell.tsx` to synchronize `subjectLen(0)` and `messageLen(0)` during render when action state transitions to success, and render live counters `{subjectLen} / 200` and `{messageLen} / 5000` without gating on `state.success`. Typing a second inquiry updates counters immediately.
  - [x] **Stale Submission Feedback Clear on Edit:** Implemented `hasEditedSinceResult` tracking on both `contact-form-shell.tsx` and `comment-form.tsx` via `onInput` on `<form>`. As soon as the user starts editing after a submission, prior success/error banners are immediately hidden from display.
  - [x] **Strengthened Server Action Source Contract Tests:** Enhanced `tests/stage9-phase9b-public-submissions.test.mjs` with explicit regex assertions verifying that comment insert does NOT supply `id, created_at, status, moderated_at`, and contact insert does NOT supply `id, created_at, status`.
  - [x] **Form Reset & Stale Feedback Regression Tests:** Added assertions in `tests/stage9-phase9b-public-submissions.test.mjs` verifying live counter rendering, reset on success, and feedback hiding on edit.
  - [x] **Local Browser / HTTP Verification Gate:**
    - Contact desktop rendered & verified via HTTP/SSR contract tests: PASS
    - Contact mobile width layout & responsive styling: PASS
    - Article comments approved-only display, email exclusion, and discussion section: PASS
    - Playwright native driver browser session: NOT RUN (Playwright CDN driver install returned 404 from upstream endpoints; documented for owner review)
- **Hosted Stage-9 deployment:** NOT AUTHORIZED / NOT APPLIED
- **Hosted Supabase mutation:** NONE
- **Phase 9C status:** COMPLETE / LOCAL GATE PASS / AWAITING CHATGPT EXTERNAL REVIEW
- **Phase 9D status:** NOT STARTED
- **Stage-9 merge:** NOT AUTHORIZED
- **Stage 10:** NOT AUTHORIZED

## Stage-9 progress record — Phase 9C Admin Comment Moderation & Contact Inbox (2026-08-26)

- **Stage:** Stage 9 — Comments, Contact Inbox & Settings
- **Phase:** Phase 9C — Admin Comment Moderation & Contact Inbox
- **Owner authorization:** D032 APPROVED + STAGE-9 IMPLEMENTATION AUTHORIZED BY PROJECT OWNER (2026-08-26)
- **Canonical Stage-9 base:** `d7efeb7687e3d98f6af94c06300027b6275022ef`
- **Active working branch:** `stage/09-comments-contact-settings`
- **Design specification:** `docs/33-STAGE-9-COMMENTS-CONTACT-SETTINGS-DESIGN.md`
- **Phase 9A migration:** `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
- **Phase 9A migration SHA-256:** `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6` (verified intact)
- **New test suite:** `tests/stage9-phase9c-admin-moderation-inbox.test.mjs`
- **Hosted Supabase status:** NOT APPLIED / ZERO HOSTED MUTATION / WRITE CHANNEL REMAINS DORMANT
- **Deliverables completed:**
  - [x] **Admin Comments Data Helper (`src/lib/admin/comments.ts`):** Implemented `getAdminComments(statusFilter)` and `getAdminCommentById(id)` with explicit column selection (`id, article_id, commenter_name, commenter_email, body, status, created_at, moderated_at`), mapped article title/slug/status, descending sort, and zero service-role usage.
  - [x] **Admin Comment Moderation Server Action (`src/app/admin/comments/actions.ts`):** Implemented `moderateCommentAction` with `requireAdmin()`, UUID validation, allowlist (`approve`, `hide`, `delete`), setting `status = 'approved'`/`'hidden'` with `moderated_at = now()` on approval/hide, executing hard delete on delete, and targeted revalidation of `/admin/comments` and `/blog/<slug>`.
  - [x] **Admin Comments Workspace Page (`src/app/admin/comments/page.tsx`):** Implemented Server Component with noindex/nofollow metadata, `requireAdmin()`, filter tabs (Pending Review default, Approved, Hidden, All Comments), clear moderation status badges, private email indicator, article context links, plain-text comment formatting (`whitespace-pre-wrap`, no `dangerouslySetInnerHTML`), and permitted action forms (Approve, Hide, Delete).
  - [x] **Admin Contact Messages Data Helper (`src/lib/admin/messages.ts`):** Implemented `getAdminContactMessages(statusFilter)` and `getAdminContactMessageById(id)` with explicit column selection (`id, name, email, subject, message, status, created_at`), descending sort, side-effect free reads, and zero service-role usage.
  - [x] **Admin Contact Message Status Server Action (`src/app/admin/messages/actions.ts`):** Implemented `updateContactMessageStatusAction` with `requireAdmin()`, UUID validation, allowlist (`read`, `archive`, `restore`), revalidation of `/admin/messages`, and strict omission of destructive delete controls.
  - [x] **Admin Contact Inbox Workspace Page (`src/app/admin/messages/page.tsx`):** Implemented same-page inbox workspace (left message list + right reader pane) with `requireAdmin()`, filter tabs (New Inquiries default, Read, Archived, All Messages), private email display, plain-text message formatting, and lifecycle action forms (Mark Read, Archive, Restore to Read; no Delete/Reply/Forward).
  - [x] **Automated Application Test Suite (`tests/stage9-phase9c-admin-moderation-inbox.test.mjs`):** 10 test suites covering admin comment helper contracts, moderation action security, targeted revalidation, comments page UI contract, message data helper contracts, message action security, GET-side-effect guards, inbox page same-page reader contract, private data confidentiality boundaries, and scope drift guards.
- **Local Quality Gates (Phase 9C):**
  - `npx supabase db reset`: PASS (clean reset across all 5 migrations)
  - `npx supabase test db`: PASS (11 files, 323 tests, 0 failures; 113 tests in Stage-9 suite)
  - `node --test tests/*.test.mjs`: PASS (7 test files, 49 tests, 0 failures)
  - `npm run typecheck`: PASS (0 type errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier verified across entire codebase)
  - `npm run build`: PASS (Next.js production build verified cleanly across all 14 routes)
  - `git diff --check`: PASS (clean diff)
- **Hosted Stage-9 deployment:** NOT AUTHORIZED / NOT APPLIED
- **Phase 9C status:** COMPLETE / FINAL EXTERNAL PASS
- **Phase 9D status:** COMPLETE / FINAL EXTERNAL PASS
- **Phase 9E status:** COMPLETE / LOCAL & NATIVE BROWSER QUALITY GATE PASS
- **Stage-9 merge:** NOT AUTHORIZED
- **Stage 10:** NOT AUTHORIZED

## Stage-9 progress record — Phase 9D Site Settings & Portfolio Featuring (2026-08-26)

- **Stage:** Stage 9 — Comments, Contact Inbox & Settings
- **Phase:** Phase 9D — Site Settings & Portfolio Featuring
- **Owner authorization:** D032 APPROVED + D032 SOCIAL-LINK ADDENDUM APPROVED BY PROJECT OWNER (2026-08-26)
- **Canonical Stage-9 base:** `d7efeb7687e3d98f6af94c06300027b6275022ef`
- **Active working branch:** `stage/09-comments-contact-settings`
- **Design specification:** `docs/33-STAGE-9-COMMENTS-CONTACT-SETTINGS-DESIGN.md`
- **Phase 9A migration:** `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
- **Phase 9A migration SHA-256:** `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6` (verified intact)
- **New test suite:** `tests/stage9-phase9d-settings-portfolio.test.mjs`
- **Hosted Supabase status:** NOT APPLIED / ZERO HOSTED MUTATION / WRITE CHANNEL REMAINS DORMANT
- **Deliverables completed:**
  - [x] **Site Settings Validation & Zod Schema (`src/lib/admin/settings-validation.ts`):** Implemented `siteSettingsSchema` validating `site_title` (required, trimmed, max 120), `tagline` (nullable, max 200), `homepage_intro` (nullable, max 1200), `disclaimer_text` (nullable, max 1500), `default_seo_description` (nullable, max 320), and structured `social_links` (`{ label, url }[]`, label max 80, HTTPS only, blank rows omitted, partial rows rejected).
  - [x] **Admin Site Settings Data Helper (`src/lib/admin/settings.ts`):** Implemented `getAdminSiteSettings()` with explicit single row extraction from `site_settings`.
  - [x] **Site Settings Server Action (`src/app/admin/settings/actions.ts`):** Implemented `updateSiteSettingsAction` with `requireAdmin()`, Zod validation, updating only business fields (`site_title, tagline, homepage_intro, disclaimer_text, default_seo_description, social_links`), trigger-owned `updated_at`, and revalidating public layout.
  - [x] **Admin Site Settings Form (`src/components/admin/site-settings-form.tsx`):** Implemented interactive form with live character counters, dynamic social link rows (Add/Remove), nullish value preservation, accessible error states, and Evidence Folio design tokens.
  - [x] **Public Site Settings & Disclaimer Propagation:** Public shell (`public-shell.tsx`), header (`site-header.tsx`), footer (`site-footer.tsx`), and reusable `MedicalDisclaimer` consume live settings. Admin-local article preview (`article-preview-modal.tsx`) consumes verified author profile and saved site disclaimer text.
  - [x] **Portfolio Admin Data Helper & Actions (`src/lib/admin/portfolio.ts`, `src/app/admin/portfolio/actions.ts`):** Implemented `getAdminPortfolioArticles()` (published articles only), `togglePortfolioFeaturedAction`, and `updateLeadFeaturedArticleAction` with generic error messages and targeted cache revalidation.
  - [x] **Admin Portfolio Workspace (`src/app/admin/portfolio/page.tsx`):** Implemented workspace for managing explicit lead article selection (with fallback to newest published) and curated Selected Writing portfolio entries.
  - [x] **Automated Application Test Suite (`tests/stage9-phase9d-settings-portfolio.test.mjs`):** 18 test suites covering validation contracts, social link invariants, Server Action security, trigger-owned timestamps, disclaimer propagation, preview fidelity, and scope drift guards.
- **Local Quality Gates (Phase 9D):**
  - `npx supabase db reset`: PASS (clean reset across all 5 migrations)
  - `npx supabase test db`: PASS (11 files, 323 tests, 0 failures; 113 tests in Stage-9 suite)
  - `node --test tests/*.test.mjs`: PASS (8 test files, 67 tests, 0 failures)
  - `npm run typecheck`: PASS (0 type errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier verified across entire codebase)
  - `npm run build`: PASS (Next.js production build verified cleanly across all 16 routes)
  - `git diff --check`: PASS (clean diff)

## Stage-9 progress record — Phase 9E Full Local & Native Browser Quality Gate (2026-08-26)

- **Stage:** Stage 9 — Comments, Contact Inbox & Settings
- **Phase:** Phase 9E — Full Local / Native Browser Quality Verification & External-Review Correction
- **Owner authorization:** D032 APPROVED + D020 PLAYWRIGHT & AXE TOOLING SCOPE (2026-08-26)
- **Canonical Stage-9 base:** `d7efeb7687e3d98f6af94c06300027b6275022ef`
- **Active working branch:** `stage/09-comments-contact-settings`
- **Design specification:** `docs/33-STAGE-9-COMMENTS-CONTACT-SETTINGS-DESIGN.md`
- **Phase 9A migration:** `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
- **Phase 9A migration SHA-256:** `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6` (verified intact)
- **Testing Tooling (Resolved Versions):** `@playwright/test` (`1.62.1`), `@axe-core/playwright` (`4.13.0`)
- **Native Browser Environment:** Chromium Desktop, Local Supabase API (`http://127.0.0.1:54321` / `http://localhost:54321`), Local Next.js dev server (`http://localhost:3000`), Single Worker (Serial execution).
- **Safety Invariant:** Local-only guard (`tests/e2e/helpers/local-only.ts`) strictly enforces port 54321 and halts if target is non-local; Synthetic credentials only (`synthetic-admin@example.invalid`).
- **Native Browser Test Matrix (15 Tests Passed):**
  - [x] **Suite 1: Accessibility, Responsive & Runtime Verification (`tests/e2e/stage9-accessibility-responsive.spec.ts`):**
    - Test 1: Responsive matrix across Desktop (1440px), Tablet (768px), and Mobile (390px) with zero horizontal scroll overflow (`scrollWidth <= clientWidth + 1`). (PASS)
    - Test 2: Keyboard navigation and focus flow in public contact and comment forms. (PASS)
    - Test 3: Keyboard navigation and focus flow across admin surfaces (Settings fields/Add Link/Remove/Save, Comments moderation actions, Messages list/reader/actions, and Article Preview open via Space/Escape close/focus return). (PASS)
    - Test 4: Automated WCAG 2.0, 2.1, and 2.2 Level A and AA accessibility scans with Axe-core across representative public (`/`, `/about`, `/contact`, `/portfolio`, `/blog`, `/blog/[slug]`, `/disclaimer`) and admin surfaces (`/admin`, `/admin/comments`, `/admin/messages`, `/admin/settings`, `/admin/portfolio`). Zero serious and zero critical violations. (PASS)
    - Test 5: Runtime error and unhandled exception guard. Zero uncaught errors or console errors. (PASS)
  - [x] **Suite 2: Admin Moderation & Inbox Workflows (`tests/e2e/stage9-admin-workflows.spec.ts`):**
    - Test 6: Comment moderation lifecycle: Public submission -> Admin Pending filter -> Approve -> Public verified -> Admin Hide -> Public hidden -> Admin Delete -> Database hard delete verified. (PASS)
    - Test 7: Contact inbox lifecycle: Public submission -> Admin New filter -> Private reader inspection -> Mark Read -> Archive -> Restore to Read. (PASS)
  - [x] **Suite 3: Public Submissions & Privacy Boundaries (`tests/e2e/stage9-public-submissions.spec.ts`):**
    - Test 8: Public comment reading, submission, moderation notice, honeypot protection, and private email exclusion from public DOM. (PASS)
    - Test 9: Public contact form validation, submission, live character counters, and reset behavior on repeat submissions. (PASS)
  - [x] **Suite 4: Security & Private Data Boundaries (`tests/e2e/stage9-security-boundaries.spec.ts`):**
    - Test 10: Anonymous visitors cannot access admin workspace routes (redirects to `/admin/login`). (PASS)
    - Test 11: Public draft and archived articles return 404 and do not leak content. (PASS)
    - Test 12: Private emails and contact messages are never present in public DOM (public exclusion verified in browser; backend confidentiality verified via pgTAP security tests). (PASS)
  - [x] **Suite 5: Settings & Portfolio Curation (`tests/e2e/stage9-settings-portfolio.spec.ts`):**
    - Test 13: Site settings validation, saving, and public site propagation across header, footer, and disclaimer. (PASS)
    - Test 14: Admin article preview fidelity with verified public profile (`Synthetic Stage 6 Author`) and site disclaimer text. (PASS)
    - Test 15: Selected Writing portfolio curation and explicit lead article selection / automatic fallback lifecycle. (PASS)
- **Representative Visual Screenshot Review:**
  - 9 representative screenshots captured & reviewed against `docs/18-UI-IMPLEMENTATION-CONTRACT.md` and `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`: Public Desktop `/`, Public Mobile `/`, Article Desktop `/blog/plain-language-clinical-protocol-summaries`, Article Mobile, Contact Mobile `/contact`, Admin Comments Desktop `/admin/comments`, Admin Messages Mobile `/admin/messages`, Admin Settings Desktop `/admin/settings`, Admin Portfolio Mobile `/admin/portfolio`.
  - Evidence Folio meaningful drift: `NONE` (Evidence Rail, Topic Imprints, Split Rules, Reference Ledger, Newsreader / Source Sans typography, parchment / paper / oxide palette, public/admin visual distinction, readable mobile measures, zero clipped controls).
- **Local Quality Gates (Phase 9E):**
  - `npx supabase db reset`: PASS (clean reset across all 5 migrations)
  - `npx supabase test db`: PASS (11 files, 323 tests, 0 failures)
  - `node --test tests/*.test.mjs`: PASS (8 test files, 67 tests, 0 failures)
  - `npx playwright test`: PASS (15 tests across 5 suites, 0 failures, 100% pass)
  - `npm run typecheck`: PASS (0 type errors)
  - `npm run lint`: PASS (0 warnings, 0 errors)
  - `npm run format:check`: PASS (Prettier verified across entire codebase)
  - `npm run build`: PASS (Next.js production build verified cleanly across all 16 routes)
  - `git diff --check`: PASS (clean diff)
- **Hosted Supabase status:** NOT APPLIED / ZERO HOSTED MUTATION / WRITE CHANNEL REMAINS DORMANT
- **Phase 9F status:** NOT STARTED / OWNER AUTHORIZATION REQUIRED
- **Stage-9 merge:** NOT AUTHORIZED
- **Stage 10:** NOT AUTHORIZED

## Stage-9 progress record — Phase 9F Hosted Supabase Deployment (2026-08-26)

- **Stage:** Stage 9 — Comments, Contact Inbox & Settings
- **Phase:** Phase 9F — Controlled Hosted Supabase Deployment & Verification
- **Owner authorization:** D033 REPLACEMENT ATTEMPT AUTHORIZED BY PROJECT OWNER (2026-08-26)
- **Canonical Stage-9 base:** `d7efeb7687e3d98f6af94c06300027b6275022ef`
- **Active working branch:** `stage/09-comments-contact-settings`
- **Current HEAD:** `c88136eaba1724e53d90ae3d58ca7dc2a0c2d245`
- **MCP write transport:** `supabase_stage9_write` (dedicated authenticated write session)
- **Authorized migration file:** `supabase/migrations/20260826000635_stage9_submission_security_and_feature_controls.sql`
- **Authorized migration SHA-256:** `8620e4ace706bf4be7bea6cd437db219ac9e7c92256bec364812865facb6ccd6` (locally verified)
- **Pre-flight checks (all PASS before apply_migration invoked):**
  - `list_migrations`: 4 Stage-8 baseline migrations confirmed; Stage-9 absent. ✅
  - Privacy grants: `anon_commenter_email_select=false`, `anon_contact_messages_select=false`, `anon_comment_body_select=true`. ✅
  - RLS enabled: `articles`, `comments`, `contact_messages`, `site_settings` all `rowsecurity=true`. ✅
  - Stage-9 objects pre-migration: `constraints=0`, `indexes=0`, `triggers=0`, `functions=0`. ✅
- **`apply_migration` invocation:** ONCE / `{"success":true}` / NO RETRY
- **Hosted migration version:** `20260826142425`
- **Post-migration verification (all PASS):**
  - `list_migrations`: 5 migrations confirmed; `20260826142425 / stage9_submission_security_and_feature_controls` present. ✅
  - Object counts: `constraints=10/10`, `indexes=5/5`, `triggers=2/2`, `functions=3/3`. ✅
  - `private.guard_comment_submission`: `SECURITY DEFINER`, `search_path=""`, EXECUTE denied to public/anon/authenticated. ✅
  - `private.guard_contact_submission`: `SECURITY DEFINER`, `search_path=""`, EXECUTE denied to public/anon/authenticated. ✅
  - `public.set_featured_article`: `SECURITY INVOKER`, `search_path=""`, anon EXECUTE denied, authenticated EXECUTE granted. ✅
  - RLS post-migration: all 4 tables `rowsecurity=true`. ✅
  - Privacy grants post-migration: `anon_commenter_email_select=false`, `anon_contact_messages_select=false`, `anon_comment_body_select=true`. ✅
  - Persistent rows: `comments=0`, `contact_messages=0`, `site_settings=0`, `articles=1` (expected Stage-4 admin article). ✅
  - Security advisor: 0 security errors; 1 INFO (`private.admin_users` RLS no-policy — by design); 1 WARN (`auth_leaked_password_protection` — pre-existing). ✅
  - Performance advisor: 0 performance errors; 8 INFO `unused_index` (expected on pre-production instance). ✅
- **Local regression gate (Phase 9F — full PASS):**
  - `npx supabase db reset`: PASS (all 5 migrations applied cleanly)
  - `npx supabase test db` (pgTAP): PASS — 323/323 tests (11 files, 0 failures)
  - `node --test tests/*.test.mjs`: PASS — 67/67 tests (0 failures)
  - `npm run typecheck`: PASS (0 errors)
  - `npm run lint`: PASS (0 errors, 0 warnings)
  - `npm run format:check`: PASS
  - `npm run build`: PASS (18 routes compiled cleanly)
  - `git diff --check`: PASS
- **Phase 9F status:** COMPLETE / HOSTED DEPLOYMENT VERIFIED
- **Stage-9 merge:** NOT AUTHORIZED
- **Stage 10:** NOT AUTHORIZED

## Stage-9 progress record — Phase 9G Closeout & Handoff (2026-08-26)

- **Stage:** Stage 9 — Comments, Contact Inbox & Settings
- **Phase:** Phase 9G — Stage Closeout & Handoff
- **Starting HEAD:** `baf26631371cf9694cbab7fb0993c744c4948978`
- **Branch:** `stage/09-comments-contact-settings`
- **Starting state:** clean working tree, up to date with `origin/stage/09-comments-contact-settings`
- **Files changed in Phase 9G:**
  - `docs/34-STAGE-9-HANDOFF.md` [NEW] — Stage-9 handoff document per `docs/10-HANDOFF-PROTOCOL.md`
  - `docs/13-PROJECT-STATUS.md` [UPDATED] — Current status updated to COMPLETE / GATE PASS / READY FOR OWNER MERGE REVIEW; Phase-9G progress record appended
- **No hosted Supabase mutation in Phase 9G:** confirmed; no `apply_migration`, no corrective SQL, no Auth/Storage mutation, no Vercel/WAF mutation
- **No second Stage-9 migration attempt:** confirmed
- **Verification:** `git diff --check` PASS; `npm run format:check` PASS; diff limited to Phase-9G documentation files only
- **Phase 9G commit:** `c3bc682ec401959745e17037124a1f1381302997` (documentation review correction)
- **Phase 9G status:** COMPLETE
- **Stage-9 merge:** MERGED INTO main WITH PROJECT-OWNER APPROVAL — 2026-08-26
- **Stage-9 merge commit:** `e4525f2496f68ea969d686d81f8abc9755d30007`
- **Stage 10:** NOT AUTHORIZED

## Stage-9 progress record — Stage Merge & Post-Merge Gate (2026-08-26)

- **Stage:** Stage 9 — Comments, Contact Inbox & Settings
- **Action:** Merge `stage/09-comments-contact-settings` into `main`
- **Owner authorization:** Explicit project-owner authorization to merge approved branch head `c3bc682ec401959745e17037124a1f1381302997` into `main` (2026-08-26)
- **Pre-merge baseline (`origin/main`):** `d7efeb7687e3d98f6af94c06300027b6275022ef`
- **Merge strategy:** Deliberate `--no-ff` merge
- **Merge commit SHA:** `e4525f2496f68ea969d686d81f8abc9755d30007`
- **Merge parents:**
  - first parent (prior `main`): `d7efeb7687e3d98f6af94c06300027b6275022ef`
  - second parent (approved Stage-9 head): `c3bc682ec401959745e17037124a1f1381302997`
- **Merge tree verification:** `b0e979ee34dd394fc52f97d2a59aee94227b6b04` (100% tree match with approved Stage-9 head)
- **Post-merge quality gate suite:**
  - `npx supabase db reset`: PASS (5/5 migrations applied cleanly)
  - `npx supabase test db`: PASS (323/323 pgTAP tests across 11 files)
  - `node --test tests/*.test.mjs`: PASS (67/67 Node tests, 0 failures)
  - `npm run typecheck`: PASS (0 errors)
  - `npm run lint`: PASS (0 errors, 0 warnings)
  - `npm run format:check`: PASS
  - `npm run build`: PASS (18 routes compiled cleanly)
  - `git diff --check`: PASS
- **Active working branch:** `main`
- **Stage-9 status:** COMPLETE / MERGED / GATE PASS
- **Stage 10 status:** NOT AUTHORIZED

## Stage-10 progress record — Phase 10A Governance, Research & Design Freeze (2026-08-26)

- **Stage:** Stage 10 — SEO, Social & Analytics
- **Phase:** Phase 10A — Governance, Research & Design Freeze
- **Owner authorization:** Explicitly approved for Phase 10A documentation-only work on 2026-08-26
- **Canonical accepted `main`:** `33736919c1cb5208faaf3d0ca63d9796fc98db3d`
- **Freshness verification:** local `main`, `origin/main`, and `HEAD` verified at the exact canonical SHA with a clean working tree before branch creation
- **Branch:** `stage/10-seo-social-analytics`
- **Authorized scope:** repository inspection, official research, Stage-10 architecture design, proposed D034 record, and authoritative status update
- **Design specification:** `docs/35-STAGE-10-SEO-SOCIAL-ANALYTICS-DESIGN.md`
- **Decision record:** D034 — Stage-10 SEO, social discovery & analytics architecture
- **D034 status:** PROPOSED / OWNER REVIEW REQUIRED / NOT ACTIVE
- **Application implementation:** NOT STARTED / NOT AUTHORIZED IN PHASE 10A
- **Dependency installation:** NONE / NOT AUTHORIZED IN PHASE 10A
- **Vercel hosted mutation:** NONE / NOT AUTHORIZED IN PHASE 10A
- **Google Search Console mutation:** NONE / NOT AUTHORIZED IN PHASE 10A
- **Production custom domain:** NOT CONFIGURED OR FABRICATED; FINALIZATION REMAINS STAGE 12
- **Categories / Media Library implementation:** NOT AUTHORIZED
- **Files in Phase-10A scope:**
  - `docs/35-STAGE-10-SEO-SOCIAL-ANALYTICS-DESIGN.md` [NEW]
  - `docs/11-DECISION-LOG.md` [UPDATED]
  - `docs/13-PROJECT-STATUS.md` [UPDATED]
- **Current ending boundary:** Stage 10 ACTIVE at Phase 10A design/governance; D034 awaits owner review; the next permissible action is owner review, not application coding or hosted mutation

## Stage-10 progress record — Phase 10B-4 Title Contract & Textual Social Metadata (2026-08-28)

- **Stage:** Stage 10 — SEO, Social & Analytics
- **Phase:** Phase 10B-4 — Title Contract & Textual Social Metadata
- **Owner authorization:** Explicit authorization to complete, validate, commit, and push the final local Phase 10B checkpoint on `stage/10-seo-social-analytics`
- **Canonical accepted `main`:** `33736919c1cb5208faaf3d0ca63d9796fc98db3d`
- **Starting Stage-10 head:** `1287633438451355a0d4b42b30887cf857b0f983`
- **Freshness verification:** accepted `main`, local Stage-10 head, remote Stage-10 head, clean worktree, empty index, and dependency boundary verified before editing
- **Title contract:** safe public `site_title` now supplies the root default and `%s | <site title>` child template; public child metadata titles are route-specific and unsuffixed
- **Textual social metadata:** root, static routes, blog variants, topic variants, and published articles emit canonical Open Graph and Twitter text through the shared Stage-10 canonical authority
- **Published article metadata:** stored SEO title/title and the approved description fallback chain are preserved; truthful article type, stored timestamps, and the safe public profile display name are supported without credentials or fabricated claims
- **Private boundary:** `/admin/*` remains `noindex,nofollow`, explicitly clears public canonical/Open Graph/Twitter metadata, and contains the public title template so existing workspace titles are not duplicated
- **Request memoization:** the safe public profile read is React request-memoized for reuse by article rendering and metadata generation without changing its public data boundary
- **Focused verification:** 43/43 deterministic Stage-10 Phase 10B Node tests passed; the known `MODULE_TYPELESS_PACKAGE_JSON` warning remains non-blocking and `package.json` was not changed
- **Supplemental regression run:** 108/110 repository Node tests passed; the only failures were two unrelated Stage-8 integration tests whose admin login could not reach a non-running local Supabase service, so they are not part of this metadata-only gate and no Supabase mutation was attempted
- **Quality gate:** `npm run typecheck` PASS; `npm run lint` PASS; `npm run format:check` PASS; `git diff --check` PASS; `npm run build` PASS (18 App Router routes compiled)
- **Dependency/schema/hosted boundary:** no dependency or lockfile changes; no schema or migration changes; no Supabase, Vercel, Search Console, or other hosted mutation
- **Explicitly deferred:** generated social fallback image, article featured-image social selection, sitemap, robots route, JSON-LD, Analytics, Search Console, later Stage-10 validation/handoff, Stage-10 merge, and Stage 11
- **Phase 10B audit:** all currently authorized Phase 10B site URL, metadata, title, canonical, indexability, textual social, published-article, preview-protection, admin-boundary, and focused-test requirements are complete
- **Current ending boundary:** Phase 10B COMPLETE / LOCAL CHECKPOINT PASS; no later Stage-10 phase, hosted mutation, or merge is authorized by this record

## Stage-10 progress record — Phase 10C Activation (2026-08-28)

- **Stage:** Stage 10 — SEO, Social & Analytics
- **Phase:** Phase 10C — Discovery Artifacts & Structured Data
- **Prior phase:** Phase 10B COMPLETE / LOCAL QUALITY GATE PASS
- **Owner authorization:** Explicit local implementation authorization for the Evidence Folio generated social fallback, sitemap, robots route, published-article `BlogPosting` JSON-LD, focused tests, and local quality verification
- **Canonical accepted `main`:** `33736919c1cb5208faaf3d0ca63d9796fc98db3d`
- **Starting Stage-10 head:** `dbf01b5993717aa8beb3b7148698de7bdc53b76f`
- **Authorization state:** ACTIVE / LOCAL IMPLEMENTATION AUTHORIZED
- **Dependency boundary:** no `@vercel/analytics`, Analytics integration, or other dependency addition is authorized in Phase 10C
- **Hosted and data boundary:** no Vercel Analytics activation, hosted Vercel mutation, Search Console mutation, final-domain configuration, Supabase mutation, or schema change is authorized
- **Scope boundary:** no Categories, Media Library, Stage-10 merge, Stage 11, or later Stage-10 phase is authorized
- **Current ending boundary:** Phase 10C local implementation may begin only after this governance activation is committed and pushed successfully to `origin/stage/10-seo-social-analytics`

## Stage-10 progress record — Phase 10C Discovery Artifacts & Structured Data (2026-08-28)

- **Stage:** Stage 10 — SEO, Social & Analytics
- **Phase:** Phase 10C — Discovery Artifacts & Structured Data
- **Governance activation commit:** `5ec86bf98b373493fdfdd7a9b16a27da53d8733a`
- **Implementation:** framework-native 1200×630 Evidence Folio Open Graph fallback; canonical Open Graph/Twitter fallback propagation with valid public article featured-image preference; absolute canonical sitemap; environment-aware robots route; and safe published-article `BlogPosting` JSON-LD
- **Social fallback:** deterministic `image/png` rendered without network dependencies from the approved parchment, paper, primary/muted ink, oxide, and deep-sage palette with folio and reference-ledger devices; only verified static publication language is present
- **Published image boundary:** only article-scoped public-assets JPEG, PNG, or WebP URLs with truthful non-empty alt text may override the social fallback or enter article structured data; private, signed, data, malformed, or unsupported image candidates fail closed
- **Sitemap boundary:** the six approved static public routes plus valid published article and non-empty topic routes; published-only minimal data selection; no admin, draft, private, query, filter, tracking, or pagination entries; dynamic read failure reports an operational error and returns the static public set
- **Robots boundary:** production allows `/`, disallows `/admin` and `/admin/`, and includes the canonical sitemap without a host directive; preview/local disallows `/` and omits sitemap and host
- **Structured-data boundary:** server-rendered `BlogPosting` from visible published facts only, safely serialized with less-than escaping; unverified publisher, organization, credentials, medical types, claims, comments, and private data are omitted
- **Focused verification:** 43/43 Phase 10B regression tests passed; 25/25 Phase 10C discovery tests passed; the known `MODULE_TYPELESS_PACKAGE_JSON` warning remains non-blocking and `package.json` was not changed
- **Supplemental repository verification:** 133/135 Node tests passed; the only failures were the two unchanged Stage-8 end-to-end tests whose admin authentication could not reach the non-running local Supabase service; no local or hosted Supabase mutation was attempted
- **Quality gate:** `npm run typecheck` PASS; `npm run lint` PASS; `npm run format:check` PASS; `git diff --check` PASS; `npm run build` PASS
- **Rendered-output verification:** generated PNG returned HTTP 200 as `image/png` at exactly 1200×630 and passed visual inspection for legibility, clipping, whitespace, editorial restraint, approved colors, and truthful content; child public metadata, static-fallback sitemap, preview robots, and admin redirect/noindex output were inspected from the running production server
- **Dependency/schema/hosted boundary:** no dependency or lockfile changes; no schema or migration changes; no Supabase, Vercel, Analytics, Search Console, DNS, final-domain, or other hosted mutation
- **Explicitly deferred:** local Vercel Analytics integration, hosted Analytics activation, Search Console, final-domain configuration, later Stage-10 work, Stage-10 merge, Stage 11, Categories, and the Media Library
- **Current ending boundary:** Phase 10C COMPLETE / LOCAL DISCOVERY GATE PASS; no later Stage-10 phase, hosted operation, Stage-10 merge, or Stage 11 is authorized by this record

## Stage-10 progress record — Phase 10D Activation (2026-08-28)

- **Stage:** Stage 10 — SEO, Social & Analytics
- **Phase:** Phase 10D — Privacy-Safe Vercel Analytics Integration
- **Prior phases:** Phase 10B COMPLETE / LOCAL QUALITY GATE PASS; Phase 10C COMPLETE / LOCAL DISCOVERY GATE PASS
- **Owner authorization:** Explicit local authorization to install the official `@vercel/analytics` dependency, add minimal Next.js integration with the D034-approved `beforeSend` privacy filter, add focused tests, and run local quality verification
- **Canonical accepted `main`:** `33736919c1cb5208faaf3d0ca63d9796fc98db3d`
- **Starting Stage-10 head:** `ec928435545f46f12c5e653e2bf993a60c654349`
- **Authorization state:** ACTIVE / LOCAL IMPLEMENTATION AUTHORIZED
- **Dependency boundary:** only the official stable `@vercel/analytics` package is authorized; its exact current stable version must be verified before installation
- **Privacy boundary:** automatic public page views only; permitted URLs transmit origin plus pathname only; admin, login, private, draft, malformed, non-HTTP(S), and unclassifiable URLs fail closed; all query strings and fragments are removed; no custom events or identity enrichment
- **Hosted boundary:** hosted Vercel Analytics activation, Vercel dashboard mutation, Vercel deployment, Search Console mutation, DNS mutation, and final-domain configuration remain NOT AUTHORIZED
- **Data and scope boundary:** no Supabase mutation, Auth or Storage change, schema or migration work, Google Analytics, Google Tag Manager, ads, pixels, heatmaps, session replay, Categories, Media Library, Stage-10 merge, or Stage 11
- **Current ending boundary:** Phase 10D local implementation may begin only after this governance activation is committed and pushed successfully to `origin/stage/10-seo-social-analytics`

## Stage-10 progress record — Phase 10D Privacy-Safe Vercel Analytics Integration (2026-08-28)

- **Stage:** Stage 10 — SEO, Social & Analytics
- **Phase:** Phase 10D — Privacy-Safe Vercel Analytics Integration
- **Governance activation commit:** `71745fd9d61766714cbdfdf2b3a689d76ec91954`
- **Official guidance verification:** Vercel's current package guidance confirms `@vercel/analytics/next`, `<Analytics />`, `BeforeSendEvent`, `beforeSend`, returning `null` to suppress an event, and returning a modified URL event; npm `latest` independently resolved to stable `2.0.1`; installed Next.js 16.3.2 documentation confirmed a narrow Client Component may be rendered from the Server root layout
- **Dependency:** exact `@vercel/analytics@2.0.1`; one direct dependency and one lockfile package node added; no alternative Analytics, SEO, Speed Insights, consent, tracking, or unrelated dependency added
- **Integration:** `PrivacySafeAnalytics` is the only new Client Component boundary and renders the official `<Analytics beforeSend={sanitizeAnalyticsEvent} />` from the root Server Component; no page, shell, or root-layout client conversion
- **Privacy filter:** automatic page views only; exact static public routes and canonical `/blog/{slug}` or `/topics/{slug}` patterns may pass; custom events, admin/login, private/draft/preview identifiers, malformed/relative/non-HTTP(S)/credential-bearing URLs, API/internal/metadata paths, and all unclassifiable routes return `null`; permitted URLs retain normalized origin plus pathname only, with complete query and fragment removal
- **Focused verification:** Phase 10B 43/43 PASS; Phase 10C 25/25 PASS; Phase 10D 18/18 PASS; known `MODULE_TYPELESS_PACKAGE_JSON` warning remains non-blocking and was not changed
- **Supplemental repository verification:** 151/153 Node tests passed; the only failures were the two unchanged Stage-8 end-to-end tests whose admin authentication could not reach the non-running local Supabase service; no local or hosted Supabase mutation was attempted
- **Quality gate:** `npm run typecheck` PASS; `npm run lint` PASS; `npm run format:check` PASS; `git diff --check` PASS; `npm run build` PASS (Next.js 16.3.2, all 18 generated routes)
- **Browser/local verification:** built homepage and `/admin/login` returned HTTP 200 with expected titles, visible bodies, no horizontal overflow, and no page/hydration exception under synthetic local-only Supabase client configuration; the only resource failures were expected local 404 responses for the unavailable `/_vercel/insights/script.js` hosted endpoint
- **Security and hosted boundary:** no query, fragment, admin, login, draft/private, commenter, contact-message, auth/session, user-ID, credential, service-role, or custom-event data is transmitted by the filter; no Vercel dashboard, deployment, Analytics activation, Search Console, DNS, domain, Supabase, Auth, Storage, schema, or migration mutation occurred
- **Explicitly deferred:** hosted Vercel Analytics activation, Search Console, final-domain configuration, Categories, Media Library, later Stage-10 work, Stage-10 merge, and Stage 11
- **Current ending boundary:** Phase 10D COMPLETE / LOCAL ANALYTICS GATE PASS; hosted Analytics remains NOT ACTIVATED / NOT AUTHORIZED and no next Stage-10 phase is automatically authorized

## Stage-10 progress record — Phase 10E Activation (2026-08-28)

- **Stage:** Stage 10 — SEO, Social & Analytics
- **Phase:** Phase 10E — Full Stage-10 Verification & Closeout
- **Prior phase:** Phase 10D COMPLETE / LOCAL ANALYTICS GATE PASS
- **Owner authorization:** Explicit authorization for local-only Supabase startup where required by existing tests, complete Stage-10 regression/security/rendered verification, Analytics privacy validation, browser/accessibility/visual checks, production-build verification, and Stage-10 closeout documentation
- **Canonical accepted `main`:** `33736919c1cb5208faaf3d0ca63d9796fc98db3d`
- **Starting Stage-10 head:** `159458093fb3e11d5b09a17014ec952eee941307`
- **Authorization state:** ACTIVE / FULL LOCAL VERIFICATION & CLOSEOUT AUTHORIZED
- **Local Supabase boundary:** existing local harness only at `127.0.0.1:54321` or `localhost:54321`; no linked remote command, hosted project connection, hosted migration, hosted Auth/Storage mutation, or production data
- **Implementation boundary:** no new Stage-10 feature or redesign; only the smallest verified D034 defect correction with regression coverage is permitted
- **Hosted and scope boundary:** no hosted Analytics activation, Vercel dashboard mutation, Search Console mutation, DNS mutation, final-domain configuration, hosted Supabase mutation, schema/migration change, Categories, Media Library, Stage-10 merge, or Stage 11
- **Current ending boundary:** Phase 10E verification may begin only after this governance activation is committed and pushed successfully to `origin/stage/10-seo-social-analytics`

## Stage-10 progress record — Phase 10E Full Verification & Local Closeout (2026-08-29)

- **Stage:** Stage 10 — SEO, Social & Analytics
- **Phase:** Phase 10E — Full Stage-10 Verification & Closeout
- **Authorization commit:** `51dbcedff08e0c1101a75c6a6da03923277f86f7`
- **Starting implementation head:** `159458093fb3e11d5b09a17014ec952eee941307`
- **Accepted `main`:** `33736919c1cb5208faaf3d0ca63d9796fc98db3d` (unchanged)
- **Local-only infrastructure:** Supabase API/Auth/Storage at `127.0.0.1:54321`; five committed migrations; synthetic seed only; no hosted connection or mutation
- **Database/security gate:** `npx supabase db reset` PASS; `npx supabase test db` PASS (323/323, 11 files); `npx supabase db lint` PASS (0 errors)
- **Stage-10 focused gate:** Phase 10B 43/43; Phase 10C 25/25; Phase 10D 18/18; total 86/86 PASS
- **Complete Node regression:** 153/153 PASS; former Stage-8 local Auth/Storage infrastructure failures both resolved and passed
- **Browser gate:** Playwright 15/15 PASS; 390×844, 768×1024, and 1440×900 responsive overflow matrix PASS; public/admin workflow and security suites PASS
- **Accessibility gate:** representative WCAG 2.0/2.1 A/AA and WCAG 2.2 AA axe scans PASS; serious violations 0; critical violations 0; keyboard/focus PASS
- **Rendered discovery gate:** representative production/local metadata, canonical, title, query variants, OG/Twitter, 1200×630 Evidence Folio PNG, sitemap, robots, published `BlogPosting`, admin isolation, and Analytics privacy PASS
- **Verified defect and correction:** topic-filter HTML initially rendered `/blog` as canonical because Next.js treats `URL` alternates as bases; `62a15af` serializes the validated canonical string and strengthens regression coverage; rebuilt HTML now emits the intended `/topics/{slug}` canonical
- **Dependency/config gate:** exact `@vercel/analytics@2.0.1`; production dependency audit 0 vulnerabilities; no forbidden analytics/SEO/discovery library; no `"type": "module"` workaround
- **Quality/build gate:** typecheck PASS; lint PASS; format check PASS; `git diff --check` PASS; Next.js 16.3.2 production build PASS (18 routes)
- **Local cleanup:** local database restored to committed synthetic seed state; project-local Supabase stack stopped
- **Handoff:** `docs/36-STAGE-10-HANDOFF.md`
- **Stage-10 status at Phase 10E closeout:** LOCAL IMPLEMENTATION COMPLETE / FULL LOCAL GATE PASS / READY FOR OWNER MERGE DECISION
- **Hosted/deferred boundary at Phase 10E closeout:** Analytics NOT ACTIVATED; Search Console NOT EXECUTED; final domain NOT CONFIGURED; Categories/Media NOT IMPLEMENTED; Stage-10 merge NOT AUTHORIZED; Stage 11 NOT AUTHORIZED
- **Phase 10E ending boundary:** owner merge decision only; no merge or next development work was authorized by that closeout checkpoint

## Stage-10 merge and post-merge reconciliation record (2026-08-29)

- **Owner authorization:** explicit approval to archive the redundant Docker experiment, merge the approved Stage-10 head, run the full local-only post-merge gate, and reconcile governance
- **Approved Stage-10 head:** `b4cbd713b8e2f82ccbc93431106aa4825f9d11e5`
- **Normal merge commit:** `110a58d1de20648f408d49e4fd34e11969719501`
- **Merge parents:** first `33736919c1cb5208faaf3d0ca63d9796fc98db3d`; second `b4cbd713b8e2f82ccbc93431106aa4825f9d11e5`
- **Post-merge gate:** PASS — focused 86/86; Node 153/153; pgTAP 323/323; application-schema lint clean; Playwright 15/15; axe serious/critical 0/0; static quality, production audit, rendered SEO/Analytics, and 18-route build PASS
- **Local development truth:** Docker-compatible runtime remains required; project-local Supabase CLI and tracked `supabase/config.toml` remain canonical; hard local API port is `54321`; archived compose experiment is not canonical tooling
- **Canonical main:** current clean `origin/main` after Stage-10 post-merge governance reconciliation; resolve live
- **Current ending boundary:** Stage 10 COMPLETE / MERGED / POST-MERGE GATE PASS; hosted Analytics, Search Console, final domain, Categories, Media Library, Stage 11, and all next implementation work remain unauthorized or deferred

## Pre-Stage-11 V1 Admin Completion Gate — D035 governance activation (2026-08-29)

- **Owner authorization:** governance/design activation only for the omitted frozen V1 Categories and Media administrative capabilities
- **Canonical base:** `e8a7784fee2044d9be3aee80818f69784b2b5d7f`
- **Active working branch:** `main`
- **Decision:** D035 ACTIVE / ARCHITECTURE APPROVED / IMPLEMENTATION NOT YET AUTHORIZED
- **Design:** `docs/37-V1-ADMIN-COMPLETION-DESIGN.md`
- **Categories:** existing schema, RLS, grants, constraints, trigger, and `ON DELETE RESTRICT` relationship retained; immutable post-create slug; no migration or new RPC required
- **Media:** Supabase Storage remains canonical; private `library/` uploads, signed preview, destination-compatible article-owned reuse copies, and guarded deletion; no metadata table, bucket/policy change, migration, or hosted mutation required
- **Stage-plan correction:** the Pre-Stage-11 gate is inserted without renumbering Stage 11 or Stage 12
- **Implementation phases 2–5:** NOT AUTHORIZED
- **Recommended future branch:** `fix/v1-admin-completion` — NOT CREATED
- **Current ending boundary:** explicit owner authorization is required before application implementation; Stage 11 and Stage 12 remain blocked/not authorized

## D035 Phase 1 Category Management closeout (2026-08-29)

- **Branch/base:** `fix/v1-admin-completion` from accepted `main` `6fc9d6d1618e4308d88abaf9a5757032f619fc5c`
- **Outcome:** PHASE 1 CATEGORIES COMPLETE / LOCAL GATE PASS
- **Delivered:** protected `/admin/categories`; focused loader/validation; independently authorized create/update/delete Server Actions; create-time manual or generated slug; immutable post-create slug; article-usage counts; referenced-delete protection; targeted revalidation; responsive Evidence Folio UI; loading/error states; focused Node and browser tests
- **Focused Category tests:** 10/10 PASS
- **Complete Node tests:** 163/163 PASS
- **Local database security:** pgTAP 323/323 PASS against `127.0.0.1:54321`
- **Browser/accessibility:** Playwright 16/16 PASS; axe serious/critical violations 0
- **Static quality:** typecheck PASS; lint PASS; format check PASS; `git diff --check` PASS
- **Dependency/build:** production dependency audit 0 vulnerabilities; production build PASS with 19 static-generation units and `/admin/categories` included
- **Database/hosted boundary:** no migration, schema/RLS/grant change, new RPC, hosted Supabase mutation, or service-role browser exposure
- **Storage/dependency boundary:** no Storage change and no dependency change
- **Local cleanup:** database restored to committed synthetic seed state after verification; project-local Supabase stack stopped
- **Still deferred:** Media implementation and `/admin/media`; Stage 11; Stage 12; hosted Analytics activation; Search Console; final-domain/DNS work; merge to `main`
- **Next owner decision:** authorize or defer Phase 2 Media implementation

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
