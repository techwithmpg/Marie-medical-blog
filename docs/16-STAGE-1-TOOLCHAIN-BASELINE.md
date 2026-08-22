# 16 — Stage 1 Toolchain & Bootstrap Baseline

**Research date:** 2026-08-23
**Purpose:** freeze Stage-1 initialization conventions before any application code or project dependency is created.

This document defines the bootstrap contract for **Stage 1 — Next.js Foundation**. It does not authorize Stage 1 by itself. `docs/13-PROJECT-STATUS.md` remains the authorization record.

## 1. Verified current platform facts

The following were checked against current official documentation on 2026-08-23:

- Node.js 24 (`Krypton`) is an LTS release; Node.js 26 is Current, not LTS. Node recommends production applications use an LTS release.
- Vercel supports Node.js `24.x` and uses it as the default for new projects; Vercel can also honor `package.json#engines.node`.
- Next.js `16.x` is the current Active LTS major line; Next.js 16.3 is available as the current stable feature release line.
- `create-next-app` supports TypeScript, ESLint, Tailwind CSS, App Router, `src/`, Turbopack, npm, custom import aliases, empty projects, and disabled Git initialization.
- Turbopack is the default bundler for current Next.js applications.
- Next.js production builds fail on TypeScript errors unless an explicit dangerous override is enabled.
- Next.js loads environment variables from root `.env*` files; only variables prefixed with `NEXT_PUBLIC_` are exposed to browser bundles.
- shadcn/ui supports Tailwind CSS v4; current shadcn/ui new projects default to Base UI, while Radix remains supported.
- shadcn/ui recommends CSS variables for theming.
- Tailwind maintains an official Prettier plugin for deterministic utility-class ordering.
- Supabase recommends new publishable (`sb_publishable_...`) and secret (`sb_secret_...`) API keys for new work; legacy `anon` and `service_role` keys are being deprecated.
- `supabase init` creates the project-local `supabase/` configuration and is appropriate when local database development begins.

## 2. Frozen Stage-1 runtime

### Node.js

- **Runtime major:** Node.js `24.x` LTS.
- Stage 1 will add `.nvmrc` containing `24`.
- Stage 1 will add this `package.json` engine constraint:

```json
{
  "engines": {
    "node": "24.x"
  }
}
```

Do not use Node.js 26 Current for this production project while Node 24 is the supported LTS baseline.

### Package manager

- **Package manager:** npm.
- **Lockfile:** `package-lock.json` is mandatory and committed.
- Do not create `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, or mixed package-manager metadata.
- Use `npm ci` for clean/reproducible installs once a lockfile exists.
- Exact installed dependency versions are captured by `package-lock.json`; framework dependencies must not use canary/pre-release channels without a recorded decision.

## 3. Frozen Next.js bootstrap

### Framework line

- Use **Next.js 16.x Active LTS**.
- At Stage-1 execution, bootstrap with the latest stable `create-next-app@latest`; the resulting lockfile records the exact stable patch/minor actually installed.
- Do not use `next@canary`, beta, RC, or experimental scaffolds.

### Initialization choices

- TypeScript: **yes**.
- App Router: **yes**.
- Tailwind CSS: **yes**.
- ESLint: **yes**.
- Turbopack: **yes / default**.
- `src/` directory: **yes**.
- Import alias: **`@/*` → `./src/*`**.
- React Compiler: **disabled initially**; it is stable but not required for this content-focused V1 and adds build complexity without a verified project need.
- Monorepo: **no**.
- Starter product content: **no**; use the empty scaffold option.
- Git initialization by `create-next-app`: **disabled** because the repository already has canonical Git history.

## 4. Existing-repository initialization procedure

The repository is intentionally non-empty and already contains authoritative governance files such as `AI_CONTEXT.md`, `AGENTS.md`, `README.md`, `.gitignore`, and `/docs`. Stage 1 must therefore **not** run a scaffold command that overwrites the repository root blindly.

Use this controlled procedure:

1. Start from synchronized `main` and create `stage/01-nextjs-foundation` under `docs/14-BRANCH-STRATEGY.md`.
2. Create the Next.js scaffold in a temporary sibling directory, not inside the canonical repo.
3. Inspect the scaffold before copying files.
4. Copy only the application/toolchain files needed by Stage 1 into the repository root.
5. Preserve all existing governance files and merge `.gitignore` rules rather than overwriting them.
6. Do not replace this repository's `AGENTS.md` or other agent instruction files if `create-next-app` generates agent-oriented documentation.
7. Delete the temporary scaffold after successful verification.

Reference scaffold command for Windows/PowerShell execution from the parent directory:

```powershell
npx create-next-app@latest marie-medical-blog-scaffold `
  --ts `
  --eslint `
  --tailwind `
  --app `
  --src-dir `
  --turbopack `
  --import-alias "@/*" `
  --use-npm `
  --empty `
  --disable-git
```

The Stage-1 agent must first run `npx create-next-app@latest --version` and record the exact version used in the handoff.

## 5. TypeScript contract

- Keep `strict: true`.
- Do not set `typescript.ignoreBuildErrors: true`.
- Add an explicit script:

```json
"typecheck": "tsc --noEmit"
```

- Use the workspace TypeScript version in the editor.
- Do not hand-edit generated `next-env.d.ts`; the existing `.gitignore` intentionally excludes it in line with current Next.js guidance.
- Do not introduce a relaxed production-only tsconfig unless a future verified need is approved.

## 6. Linting and formatting contract

### Linting

- Use ESLint generated for current Next.js.
- Keep Next.js Core Web Vitals and TypeScript rules enabled.
- Since current Next.js no longer relies on `next lint`, the project script must invoke ESLint directly:

```json
"lint": "eslint ."
```

### Formatting

Use Prettier for deterministic formatting across human and AI contributors.

Stage 1 will install as exact dev dependencies:

- `prettier`
- `prettier-plugin-tailwindcss`
- `eslint-config-prettier`

Use `--save-exact` when installing formatter dependencies so formatting does not drift across machines.

The Tailwind Prettier plugin must point to the Tailwind v4 stylesheet entry (`./src/app/globals.css`).

Required scripts:

```json
"format": "prettier . --write",
"format:check": "prettier . --check"
```

Do not add Husky/lint-staged in Stage 1. The stage gate and explicit scripts are sufficient for V1 foundation; Git-hook automation may be added later only if a verified workflow need emerges.

## 7. shadcn/ui structural foundation

Stage 1 initializes shadcn/ui only as a **structural component foundation**. Stage 2 owns the final design tokens, typography, color system, radius, spacing, and public/admin visual shells.

Frozen structural choices:

- component base: **Base UI** (current shadcn/ui default and recommendation for new projects);
- Tailwind CSS v4 integration;
- CSS variables: **enabled**;
- React Server Components: **enabled**;
- aliases remain under `@/*`;
- no monorepo;
- no RTL requirement for V1;
- do not bulk-install UI components in Stage 1;
- do not treat a generated shadcn preset/theme as the final Marie visual design.

Stage 2 must finalize the visual preset/tokens **before broad component proliferation**.

## 8. Environment-variable contract

### Repository rules

- Real `.env*` files remain untracked.
- `.env.example` is tracked and contains names/placeholders only.
- Environment files live at the repository root, not inside `src/`.
- `NEXT_PUBLIC_` is used only for values intentionally exposed to the browser.
- Server secrets must never use the `NEXT_PUBLIC_` prefix.
- No real credential may appear in Git history, documentation, fixtures, screenshots, or chat-pasted repo content.

### Reserved V1 variable names

Stage 1 may create placeholders for future Stage-3 integration:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do **not** add a Supabase secret/service-role variable by default. The V1 architecture should operate through authenticated sessions and RLS wherever possible. If a later server-only privileged operation genuinely requires a Supabase secret key, Stage 3 must justify and document it before adding a server-only variable such as `SUPABASE_SECRET_KEY`.

Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` names should not be introduced for this new project unless a verified compatibility constraint requires legacy keys and is recorded.

## 9. Supabase CLI timing

- **Do not install or initialize Supabase CLI in Stage 1.**
- Begin project-local Supabase CLI work in **Stage 3 — Supabase Database & Security Foundation**.
- At Stage 3, prefer the official project dev-dependency installation and invoke through `npx supabase`.
- `supabase init`, local stack configuration, migrations, schema, RLS, grants, and seed fixtures belong to Stage 3.

This prevents the Next.js foundation stage from silently creating database architecture before the security/schema gate is active.

## 10. Stage-1 scripts and verification target

By the Stage-1 gate, `package.json` should expose at least:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

Before Stage 1 can pass:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

must all succeed from a clean install. No product feature may be invented merely to satisfy the build.

## 11. Deferred decisions

The following are intentionally **not** Stage-1 decisions:

- final shadcn visual preset/theme;
- exact Marie brand colors and design tokens;
- final fonts;
- login route;
- Supabase schema/RLS SQL;
- Supabase project creation/linking;
- Tiptap extension set;
- testing framework beyond foundation checks;
- real client content/domain values.

Resolve those in their authorized stages instead of expanding Stage 1.

## 12. Official sources checked

- Next.js installation / create-next-app / TypeScript / ESLint / environment-variable documentation: `https://nextjs.org/docs`
- Next.js support policy and release blog: `https://nextjs.org/support-policy`, `https://nextjs.org/blog`
- Node.js release schedule: `https://nodejs.org/en/about/previous-releases`
- Vercel Node.js versions: `https://vercel.com/docs/functions/runtimes/node-js/node-js-versions`
- shadcn/ui installation, CLI, Tailwind v4, theming, and July 2026 Base UI default notice: `https://ui.shadcn.com/docs`
- Tailwind editor/Prettier guidance: `https://tailwindcss.com/docs/editor-setup`
- Prettier installation guidance: `https://prettier.io/docs/install/`
- Supabase API-key and local-development/CLI guidance: `https://supabase.com/docs/guides/getting-started/api-keys`, `https://supabase.com/docs/guides/local-development`
