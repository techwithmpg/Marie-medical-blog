# 08 — Gated Development Stages

Only one major stage should be the active focus at a time.

## Stage 0 — Repository & project governance
Deliver:
- base repo and synchronized GitHub remote
- AI context files
- authoritative active-stage/status contract
- branch strategy
- ChatGPT Project ↔ repository synchronization contract
- README/environment/toolchain baseline docs
- source-of-truth documents
Gate: every agent can identify stack, scope, active stage, authorization boundary, and branch/sync rules; Stage-1 bootstrap conventions are frozen.

## Stage 1 — Next.js foundation
Deliver:
- Next.js App Router TypeScript project
- Tailwind/shadcn foundation
- core folder conventions
- lint/type/build scripts
- environment template
Gate: clean production build with no product features invented.

Stage 1 does not broadly implement the Evidence Folio design. It establishes only the frozen foundation required for later Stage 2 implementation.

## Stage 2 — Design system & application shells
Deliver:
- implement the accepted Evidence Folio contract from `docs/18-UI-IMPLEMENTATION-CONTRACT.md`
- finalized CSS-variable tokens
- Newsreader + Source Sans 3 font foundation
- Evidence Rail / Folio Marker / Split Rule / Topic Imprint / Reference Ledger primitives
- public shell/header/footer/mobile navigation
- admin shell
- reusable base UI
- responsive foundations
- only Stage-2-approved dependencies from D020
Gate: mobile/tablet/desktop shells and signature system conform to `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md` before page proliferation.

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
- responsive behavior matching the accepted Evidence Folio public references
Gate: core public brand and responsive system are stable without inventing client credentials/content.

## Stage 6 — Article reading & discovery
Deliver:
- blog listing
- article route
- category route
- search
- related/featured article presentation
- references/author/disclaimer renderer
- article experience matching the Evidence Folio reading/reference contract
Gate: synthetic published content is excellent on mobile, indexable, accessible and visually conformant.

## Stage 7 — Writer dashboard & Tiptap editor [CRITICAL]
Deliver:
- articles list
- create/edit form
- Tiptap editor
- image/media insertion path
- references UI
- SEO fields
- draft saving
- approved admin UI patterns from the canonical contract
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
- admin UI remains single-writer and does not invent review/enterprise workflows
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

## Pre-Stage-11 V1 Admin Completion Gate — Categories + Media [CRITICAL]
Deliver:
- `/admin/categories` management using the existing Category schema and RLS
- immutable post-create category slugs for canonical topic URL stability
- referenced-category deletion protection
- `/admin/media` image inventory across private draft and public published assets
- private-by-default image upload
- article-owned copy-based featured-image reuse
- article reuse restricted to the canonical draft-assets image MIME and 5 MB limits
- private preview and referenced-asset deletion protection
- Categories and Media integration with the existing Evidence Folio admin navigation and article workflow
- governance closeout and handoff before Stage 11
Gate:
Category and Media management are functional for Marie; public topic discovery and the Stage-8 article-image lifecycle remain correct; anonymous and non-admin boundaries pass; referenced assets and categories cannot be deleted; complete regression, accessibility, responsive, security, and production-build gates pass; no known frozen V1 admin capability remains unimplemented.

This gate corrects omissions of frozen V1 scope. It does not renumber Stage 11 or Stage 12 and does not authorize Stage-11 hardening or Stage-12 launch/content work.

## Stage 11 — Quality, security & production hardening [CRITICAL]
Deliver:
- accessibility review
- responsive/browser review
- visual-conformance/regression review against canonical UI references
- performance review
- security/RLS test matrix
- error/empty/loading states
- production build
- dependency/config review against D020
Gate: no known critical security, publishing, accessibility, visual-contract, performance or mobile usability issue remains.

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
- replacement of synthetic visual-fixture copy with verified client-approved content
Gate: Marie can independently log in, edit, preview, publish, moderate, and update core content, and the client accepts the final responsive visual experience.

## Stage rule
An agent may prepare a later stage only if doing so does not bypass the current gate. "Preparation" must not become hidden implementation of out-of-order architecture.
