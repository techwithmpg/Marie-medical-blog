# 02 — Frozen Technical Stack

## Application
- Next.js App Router
- TypeScript

## UI
- Tailwind CSS
- shadcn/ui as component primitives/foundation
- project-specific design tokens and custom compositions

## Backend/data
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage

## Editor
- Tiptap

## Hosting
- Vercel

## Analytics/search visibility
- Vercel Analytics
- Google Search Console

## Architectural preferences
- Server Components by default for public/content pages.
- Client Components only where interaction requires them.
- Server-side mutations for privileged operations.
- Route Handlers only where they provide a clear API/integration boundary.
- Avoid unnecessary global state.
- Keep one-admin access model simple.
- Render published article content in an SEO-friendly server-rendered form.

## Dependency rule
Before adding a dependency, document:
- why existing stack cannot satisfy the need;
- maintenance/security implications;
- impact on bundle/runtime;
- whether it affects scope or architecture.

Minor utility packages do not require owner approval if they do not alter architecture.

## Current-documentation rule
Next.js, Supabase, Vercel, Tiptap, and related libraries evolve. Agents must check current official docs before using version-sensitive APIs or security patterns.

## Stage-1 toolchain baseline

The frozen runtime, package-manager, scaffold, TypeScript, lint/format, shadcn structural, environment-variable, and Supabase-CLI timing conventions are defined in `docs/16-STAGE-1-TOOLCHAIN-BASELINE.md`.

These conventions are implementation-authoritative only when `docs/13-PROJECT-STATUS.md` authorizes Stage 1.
