# 21 — Stage 1 Handoff

## Stage
Stage 1 — Next.js Foundation

## Objective completed
The Stage 1 Next.js Foundation is complete, its formal quality gate passed, and the approved `stage/01-nextjs-foundation` branch was merged into `main` at merge commit `7703d507d491acaf4c33d341f328ff41bbd69293` with explicit project-owner approval.

Stage 1 established a clean, reproducible, production-quality Next.js App Router and toolchain baseline without altering repository governance or initializing out-of-scope features.

Key commit record:
- **Implementation commit:** `d99879076ac6283ef84e546f99dacc55fcc9374c` (`build: establish stage 1 nextjs foundation`)
- **Stage-1 closeout commit:** `fdcfaebc1dd24486c88304326cd8c52e3fca028c` (`docs: close stage 1 foundation gate`)
- **Stage-1 merge commit:** `7703d507d491acaf4c33d341f328ff41bbd69293` (merged `--no-ff` into `main` from parents `5e30fac03bdb2efc334399800a7842aa5af8e584` and `fdcfaebc1dd24486c88304326cd8c52e3fca028c`)

## Files/areas changed
Stage 1 foundation changes are represented by:
- `package.json`: Node `24.x` engine constraint, required lifecycle scripts (`dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`), and Stage-1 direct dependencies.
- `package-lock.json`: Synchronized npm lockfile (365 audited packages, 0 vulnerabilities).
- `.nvmrc`: Node runtime pinned to `24`.
- `.env.example`: Tracked environment variable template.
- `.gitignore`: Merged Next.js and build exclusions while preserving all security rules and governance comments.
- `.gitattributes`: Repository-level line ending normalization (`* text=auto eol=lf`).
- `.prettierrc` & `.prettierignore`: Exact Prettier formatting configuration with Tailwind v4 plugin, with governance documents explicitly scoped to avoid churn.
- `eslint.config.mjs`: ESLint 9 flat configuration integrating `eslint-config-next` and `eslint-config-prettier`.
- `tsconfig.json`: Strict TypeScript compiler configuration with `@/*` path mapping.
- `next.config.ts`: Next.js 16 configuration.
- `postcss.config.mjs`: PostCSS configuration for `@tailwindcss/postcss`.
- `components.json`: Structural Base UI (`base-nova`) configuration with Tailwind v4, CSS variables, and RSC enabled.
- `src/app/globals.css`: Tailwind v4 stylesheet with structural Base UI CSS variable tokens.
- `src/app/layout.tsx`: Minimal neutral root layout without placeholder fonts.
- `src/app/page.tsx`: Minimal neutral heading placeholder.
- `src/lib/utils.ts`: Standard `cn` helper combining `clsx` and `tailwind-merge`.
- `docs/13-PROJECT-STATUS.md`: Authoritative stage and gate status record.

## Database changes
None.

Supabase CLI initialization, schema design, migrations, client SDKs, and Row Level Security (RLS) policies remain deferred to Stage 3.

## Environment changes
Added the tracked placeholder template `.env.example` containing variable names only:
```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```
No real environment values, `.env` files, API keys, credentials, or secrets were added.

## Decisions made
Stage 1 implemented existing ACTIVE decisions:
- `D015` — Stage-1 runtime and package-manager baseline (Node 24.x LTS, npm, Next.js 16.x).
- `D016` — Next.js scaffold conventions (TypeScript, App Router, Tailwind CSS, `src/`, empty scaffold).
- `D017` — Linting, formatting, and shadcn structural baseline (strict TS, ESLint, Prettier, Base UI).
- `D018` — Supabase key and CLI timing baseline (`.env.example` placeholders, CLI deferred).

Stage 1 remained fully compliant with the `D019`/`D020` Evidence Folio contract and no-drift dependency policy. No new material architecture, product, security, or scope decision was required during Stage 1.

## Verification performed
- **Node.js:** `v24.19.0`
- **npm:** `11.17.0`
- **create-next-app:** `16.3.2`
- **Next.js:** `16.3.2`
- **React:** `19.2.8`
- **React DOM:** `19.2.8`
- **TypeScript:** `5.9.3`
- **Tailwind CSS:** `4.3.3`
- **Prettier:** `3.9.6`
- **prettier-plugin-tailwindcss:** `0.8.1`
- **eslint-config-prettier:** `10.1.8`
- **ESLint:** `9.39.5`
- **eslint-config-next:** `16.3.2`

Quality gate results:
- `npm ci`: **PASS** (365 packages audited, 0 vulnerabilities).
- `npm run typecheck`: **PASS** (`tsc --noEmit` exited 0).
- `npm run lint`: **PASS** (`eslint .` exited 0).
- `npm run format:check`: **PASS** (`prettier . --check` verified all matched files).
- `npm run build`: **PASS** (Turbopack production build succeeded; static routes generated).
- `git diff --check`: **PASS** (zero whitespace or conflict defects).
- `git diff --cached --check`: **PASS**.
- Stage-1 implementation commit: `d99879076ac6283ef84e546f99dacc55fcc9374c`.
- Stage-1 closeout commit: `fdcfaebc1dd24486c88304326cd8c52e3fca028c`.
- Stage-1 merge commit: `7703d507d491acaf4c33d341f328ff41bbd69293`.

## Post-merge verification and regression correction
The first post-merge Prettier check failed because Windows Git `core.autocrlf=true` checked LF repository blobs out as CRLF in the worktree.

The source blobs themselves remained LF and no application-content difference existed.

A repository-level `.gitattributes` policy was added to enforce LF for normal text while preserving CRLF for `.bat`/`.cmd` files:
```text
* text=auto eol=lf

*.bat text eol=crlf
*.cmd text eol=crlf
```

After normalization:
- all targeted source/config files reported `i/lf w/lf`;
- `npm ci`: **PASS** (0 vulnerabilities);
- `npm run typecheck`: **PASS**;
- `npm run lint`: **PASS**;
- `npm run format:check`: **PASS**;
- `npm run build`: **PASS**;
- `git diff --check`: **PASS**;
- `git diff --cached --check`: **PASS**.

This is repository/toolchain hygiene under the existing formatting contract (`D017`), not a new product/architecture/security/scope decision.

## Known limitations
Stage 1 is strictly a foundation stage and intentionally does NOT provide:
- final Evidence Folio visual tokens (parchment, ink, oxide, deep sage);
- Newsreader or Source Sans 3 typography;
- public or administrative application shells;
- Supabase schema, client configuration, or RLS;
- authentication or user sessions;
- Tiptap rich-text editor;
- article publishing workflows;
- public pages beyond the neutral build placeholder;
- comments or contact message submission;
- production SEO metadata;
- real client content.

All application features remain deferred to their authorized stages.

## Scope not implemented
The following Stage-2-and-later functionality was intentionally excluded from Stage 1:
- Evidence Rail, Folio Numbers, Split Rule, Reference Ledger, and Topic Imprint components;
- Public reader layouts, navigation, and portfolio grids;
- Admin workspace layouts, draft editors, and settings views;
- Database migrations, tables, views, and security functions;
- Third-party analytics, backend services, or AI integrations.

## Next stage readiness
- **Stage 1:** COMPLETE / PASS / MERGED.
- **Stage 2:** NOT AUTHORIZED.

Before Stage 2 may begin:
1. finalized `main` must be pushed to GitHub;
2. `origin/main` must be verified;
3. local `main` must match `origin/main`;
4. ChatGPT live-context freshness must be re-resolved under D021;
5. the project owner must explicitly authorize Stage 2.
