# 08 — Gated Development Stages

Only one major stage should be the active focus at a time.

## Stage 0 — Repository & project governance
Deliver:
- base repo
- AI context files
- branch strategy
- README/environment docs
- source-of-truth documents
Gate: every agent can identify stack, scope, and active stage.

## Stage 1 — Next.js foundation
Deliver:
- Next.js App Router TypeScript project
- Tailwind/shadcn foundation
- core folder conventions
- lint/type/build scripts
- environment template
Gate: clean production build with no product features invented.

## Stage 2 — Design system & application shells
Deliver:
- finalized tokens
- public shell/header/footer
- admin shell
- reusable base UI
- responsive foundations
Gate: mobile/desktop shells approved before page proliferation.

## Stage 3 — Supabase database & security foundation [CRITICAL]
Deliver:
- schema migrations
- Auth integration foundation
- RLS and grants
- Storage buckets/policies if needed
- seed/dev fixtures
Gate: public/private access tests pass before UI depends on insecure shortcuts.

## Stage 4 — Authentication & admin access [CRITICAL]
Deliver:
- Marie/admin sign-in
- protected admin routing
- logout/session handling
- unauthorized behavior
Gate: private pages/data cannot be reached anonymously.

## Stage 5 — Public static/identity pages
Deliver:
- homepage structure
- About
- Portfolio shell
- Contact shell
- Disclaimer
Gate: core public brand and responsive system are stable.

## Stage 6 — Article reading & discovery
Deliver:
- blog listing
- article route
- category route
- search
- related/featured article presentation
- references/author/disclaimer renderer
Gate: synthetic published content is excellent on mobile and indexable.

## Stage 7 — Writer dashboard & Tiptap editor [CRITICAL]
Deliver:
- articles list
- create/edit form
- Tiptap editor
- image/media insertion path
- references UI
- SEO fields
- draft saving
Gate: author can create and reliably reopen a draft without data loss.

## Stage 8 — Publishing workflow [CRITICAL]
Deliver:
- preview
- publish
- update
- unpublish/archive
- delete rules
- slug handling
- published timestamps
Gate: end-to-end draft-to-public workflow works and private drafts never leak.

## Stage 9 — Comments, contact inbox, settings
Deliver:
- moderated comments
- public comment submission
- contact message submission/inbox
- basic site settings
- portfolio featuring controls
Gate: public submission abuse surface is validated/protected and private inbox remains private.

## Stage 10 — SEO, social, analytics
Deliver:
- dynamic metadata
- canonical URLs
- OG/social previews
- sitemap/robots
- structured article data
- Vercel Analytics
- Search Console launch instructions
Gate: representative pages validate and private/admin URLs are excluded appropriately.

## Stage 11 — Quality, security & production hardening [CRITICAL]
Deliver:
- accessibility review
- responsive/browser review
- performance review
- security/RLS test matrix
- error/empty/loading states
- production build
- dependency/config review
Gate: no known critical security, publishing, or mobile usability issue remains.

## Stage 12 — Real content, client acceptance & launch [CRITICAL]
Deliver:
- Marie's approved profile content
- CV
- initial categories
- at least 3 strong launch articles recommended
- production domain
- analytics/search setup
- client training
- launch acceptance checklist
Gate: Marie can independently log in, edit, preview, publish, moderate, and update core content.

## Stage rule
An agent may prepare a later stage only if doing so does not bypass the current gate. "Preparation" must not become hidden implementation of out-of-order architecture.
