# AGENTS.md — Mandatory AI Development Rules

All AI coding agents must read `AI_CONTEXT.md` before doing any work.

## Mandatory rules

1. **Do not drift from scope.** V1 scope and exclusions are defined in `AI_CONTEXT.md` and `docs/01-SCOPE-FREEZE.md`.
2. **Do not change the frozen stack** without explicit owner approval recorded in `docs/11-DECISION-LOG.md`.
3. **Inspect before editing.** Never assume routes, schema, component structure, or current state.
4. **One stage at a time.** Read `docs/13-PROJECT-STATUS.md` and work only within the currently authorized development stage unless a blocking dependency requires a narrowly scoped fix.
5. **No speculative features.** Do not add features because they are "nice to have."
6. **No silent schema changes.** All database changes require a migration and documentation update.
7. **RLS is mandatory.** Never disable Row Level Security as a shortcut. Never expose service-role credentials client-side.
8. **Public vs private data must remain explicit.** Public visitors may access published public content only. Drafts, contact messages, private settings, and administrative data are protected.
9. **Do not build reader authentication in V1.** Only Marie/admin requires authenticated dashboard access.
10. **Prefer simple architecture.** This is a single-author professional publication, not an enterprise CMS.
11. **Preserve SEO.** Do not convert indexable public article content into unnecessary client-only rendering.
12. **Preserve accessibility.** Use semantic HTML, keyboard-accessible controls, labels, alt text fields, visible focus, and sufficient contrast.
13. **Preserve performance.** Optimize images, avoid unnecessary client JS, and prevent avoidable data waterfalls.
14. **Do not fabricate medical or professional credentials.** Use placeholders until verified client content is provided.
15. **Use safe sample content.** Development fixtures must be clearly synthetic and must not make misleading medical claims.
16. **Preserve the accepted UI contract.** Before UI/UX/component work, read `docs/18-UI-IMPLEMENTATION-CONTRACT.md` and `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`. Do not redesign the Evidence Folio system, replace it with default shadcn styling, install unapproved UI libraries, or treat generated mockup text/data as product truth without explicit owner approval and decision-log updates.
17. **Resolve live repository context for remote/ChatGPT work.** When operating through ChatGPT or another environment that may hold stale static snapshots, resolve current accepted `main` and read `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md` plus its required live governance set before substantial architecture, UX, data, security, SEO, dependency, implementation, or scope work. Static Project Sources never outrank a newer verified accepted `main`.

## Before coding

- Read `AI_CONTEXT.md`.
- Read `AGENTS.md`.
- Read `docs/13-PROJECT-STATUS.md`.
- When working through ChatGPT/remote context, complete the D021 live-context freshness check in `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md`.
- Read the relevant `/docs` file(s).
- For any UI/UX/component work, read `docs/18-UI-IMPLEMENTATION-CONTRACT.md` and `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`.
- Inspect `package.json`, app structure, configuration, migrations, and current git diff.
- Identify the current stage and confirm that implementation is explicitly authorized.
- Confirm dependencies are already present or explicitly allowed for the authorized stage before adding new ones.

## During coding

- Keep changes focused.
- Reuse established components/tokens.
- Preserve Evidence Folio signature devices where the contract specifies them.
- Avoid broad rewrites unless required by the assigned stage.
- Keep Server/Client Component boundaries intentional.
- Validate all public input server-side.
- Sanitize/render rich content safely.
- Keep secrets server-only.
- Never copy synthetic medical/profile/business claims from visual mockups into real content.

## Before handoff

Run the appropriate checks available in the repo, such as:
- typecheck
- lint
- unit/integration tests
- production build
- targeted browser verification
- accessibility/visual verification for UI stages
- migration/security verification for database changes

Then update `docs/10-HANDOFF-PROTOCOL.md` or append a stage handoff note in the repository's chosen handoff log.

## If something conflicts

Do not guess. Check `docs/11-DECISION-LOG.md`. If still unresolved, stop the disputed change and document the decision needed. Continue only with non-blocked work.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
