# Marie Medere Medical Writing Portfolio & Blog — AI Context

> This file is the primary project context for every AI agent, developer, researcher, reviewer, or automation working on this repository.
> Read this file first. Then read `AGENTS.md` and the relevant files in `/docs` before changing code, schema, architecture, UX, or scope.

## 1. Project identity

This project is a professional medical-writing portfolio and educational medical blog for Marie Medere.

The product has two primary goals:
1. Help Marie demonstrate her medical-writing ability to employers, clients, and collaborators.
2. Help the public and student doctors access clear, understandable, medically referenced educational content.

The site must feel like a serious professional publication and personal portfolio, not a generic hobby blog.

## 2. Product principle

Every V1 feature must do at least one of the following:
- help Marie publish professional medical content;
- help readers discover and understand that content;
- help employers evaluate Marie's writing ability and professional credibility.

Anything outside these goals is presumptively out of scope for V1.

## 3. Frozen V1 stack

The default stack is frozen unless the project owner explicitly changes it:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui as a component foundation, heavily customized
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Tiptap rich-text editor
- Vercel deployment
- Vercel Analytics and Google Search Console for launch analytics/search visibility

Do not replace a chosen technology merely because another tool is familiar.

## 4. Frozen V1 feature scope

### Public website
- Homepage
- About
- Blog listing
- Search
- Categories/topics
- Individual article pages
- Portfolio / featured writing samples
- Contact page
- CV download
- Medical disclaimer
- Responsive/mobile-first experience
- Social sharing
- SEO metadata and structured data

### Private writer/admin area
One primary authenticated writer/admin: Marie.

- Dashboard overview
- Article list
- New article
- Drafts
- Preview
- Publish
- Update
- Unpublish/archive
- Delete
- Category management
- Media management
- Portfolio feature selection
- Comment moderation
- Contact message inbox
- Basic site settings

### Article capabilities
- Title
- Slug
- Excerpt
- Rich content
- Featured image
- Image alt text/caption where appropriate
- Category
- Draft/published/archived state
- Featured state
- Portfolio-featured state
- SEO title and description
- Publication/update dates
- Reading time
- References/sources
- Related article presentation
- Author information
- Medical disclaimer

## 5. Explicit V1 exclusions

Do NOT add these unless the project owner explicitly approves a scope change:
- multiple writers or contributor applications
- editorial teams or complex role systems
- reader accounts
- memberships
- subscriptions/paywalls
- payment gateway
- ecommerce
- courses
- appointment booking
- telemedicine
- patient records
- medical diagnosis tools
- AI medical advice
- AI article generation as a product feature
- forums
- real-time chat
- ad-management platform
- native mobile apps
- multilingual publishing
- full drag-and-drop page builder
- complex revision/version-control product
- custom email-marketing platform
- custom analytics engine

## 6. UX direction — Evidence Folio

The owner has accepted and frozen the V1 visual direction as:

**Warm Medical Editorial with Scientific Restraint — The Evidence Folio.**

The site should be:
- professional;
- warm;
- editorial;
- calm;
- intelligent;
- medically credible;
- restrained;
- contemporary;
- distinctive without visual excess.

The accepted signature system is:
- Evidence Rail;
- Folio Numbers;
- Split Rule;
- Reference Ledger;
- Topic Imprint.

The accepted primary typography direction is Newsreader for public editorial display plus Source Sans 3 for body/UI/admin.

The accepted palette direction uses parchment/paper, deep ink, oxide and deep sage semantic roles.

The full UI implementation contract is `docs/18-UI-IMPLEMENTATION-CONTRACT.md`.
The accepted visual-reference manifest is `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`.

Do not reduce the design to generic beige + serif styling or default shadcn. Do not redesign the visual system without explicit owner approval and decision-log updates.

Do not require a personal profile photo in V1. The accepted layouts must remain complete without one.

Generated mockup text/data are visual placeholders and are not factual client content.

## 7. Core architectural constraints

- Use Server Components by default where appropriate.
- Add Client Components only for interactive functionality.
- Keep database access and privileged operations server-side where possible.
- Never expose secret or service-role credentials to the browser.
- Use migrations for schema changes.
- Treat RLS as part of schema design, not an afterthought.
- Never disable RLS to make a feature work.
- Public visitors may read only published/public content.
- Drafts, private contact messages, unpublished content, and admin operations must remain private.
- Public comment/contact submission must be narrowly permitted and validated.
- Do not create a complex permissions framework for one admin.

## 8. Publishing workflow

Preferred workflow:

New Article -> Write -> Save Draft -> Preview -> Publish -> Public Website

For published content:

Published Article -> Edit -> Preview Changes -> Update

Keep the writer experience simple and non-technical.

## 9. Comment workflow

All new comments are moderated.

Reader submits -> Pending -> Approve / Hide / Delete

No comment should become public automatically by default.
Commenter email, if collected, is private and never publicly rendered.

## 10. Medical-content standards

The platform is a publishing system, not a medical decision system.

- Do not fabricate qualifications.
- Do not call Marie a doctor unless that is factually correct and explicitly approved.
- Allow references from credible sources such as recognized public-health bodies, medical associations, peer-reviewed journals, and academic publications.
- Support article "last updated" information.
- Include a clear medical-information disclaimer.
- Medical accuracy and source selection ultimately belong to the author/editor, not the software.

## 11. SEO priorities

SEO is a first-class requirement, not a post-launch patch.

Implement/support:
- clean human-readable slugs;
- canonical URLs;
- page-specific metadata;
- Open Graph/social metadata;
- sitemap;
- robots rules;
- Article/BlogPosting structured data where appropriate;
- accessible semantic markup;
- strong performance and image optimization;
- author and publication/update context;
- internal linking and related content.

## 12. Development discipline

Before changing anything, an AI agent must:
1. Read `AI_CONTEXT.md`.
2. Read `AGENTS.md`.
3. When operating through ChatGPT or another remote context that may contain static snapshots, resolve live repository freshness under D021 and `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md` before relying on Project Sources.
4. Read `docs/13-PROJECT-STATUS.md` and the docs relevant to its stage.
5. For UI/UX/component work, read `docs/18-UI-IMPLEMENTATION-CONTRACT.md` and `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`.
6. Inspect the current repository before assuming structure or implementation state.
7. State the stage/objective being worked on and confirm that implementation is authorized.
8. Avoid unrelated refactors.
9. Preserve completed architecture and approved visual contracts unless there is a verified defect and approval to change them.
10. Test the work.
11. Write a handoff note if the stage is complete.

## 13. Source of truth order

If instructions conflict, use this priority:
1. Explicit latest instruction from project owner.
2. `docs/11-DECISION-LOG.md` decisions marked ACTIVE.
3. `AI_CONTEXT.md`.
4. `docs/01-SCOPE-FREEZE.md`.
5. Stage-specific documentation, including the canonical UI contract when relevant.
6. Existing implementation.

Never infer a scope or design-contract change from an unfinished experiment, old code, generated mockup wording, or an unapproved package suggestion.

## 14. Live repository context synchronization

D021 governs ChatGPT Project and remote-context freshness.

- The committed local repository remains the canonical durable source of project truth; synchronized GitHub `main` is the live remote freshness surface.
- When GitHub access is available, substantial project work must resolve the current accepted `main` SHA and read the required live governance set in `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md`.
- A newer verified accepted `main` supersedes older static ChatGPT Project Sources automatically for repository-derived context.
- Static Project Sources are bootstrap/fallback context and do not need routine replacement solely because `main` advanced.
- If GitHub live access is unavailable, use the newest verified fallback snapshot, state its source SHA/freshness limitation, and do not assume it is current.
- Unmerged branches, experiments, and recommendations remain non-authoritative unless a newer explicit owner instruction says otherwise and is then recorded back into governance.

See `docs/15-CHATGPT-REPO-SYNC.md` and `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md`.
## 15. Research rule

When researching libraries, APIs, SEO behavior, Supabase, Next.js, Vercel, Tiptap, accessibility, or security:
- verify against current official documentation;
- record any decision that affects architecture in `docs/11-DECISION-LOG.md`;
- do not implement a major technology change based only on a blog post or memory;
- prefer current stable features over experimental features unless there is a clear benefit and approval;
- for UI libraries/components, respect D020 and `docs/18-UI-IMPLEMENTATION-CONTRACT.md`.

## 16. Definition of project success

The website succeeds when:
- Marie can publish an article without developer assistance;
- a reader can comfortably consume content on mobile;
- an employer can quickly assess Marie's writing quality and professional profile;
- published content is indexable and shareable;
- private/admin content stays private;
- the accepted Evidence Folio visual language remains coherent across desktop/tablet/mobile;
- the site remains fast, maintainable, and easy to extend later without V1 scope creep.
