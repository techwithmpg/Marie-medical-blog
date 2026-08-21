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

## 6. UX direction

The design should be:
- professional;
- warm;
- modern;
- editorial;
- medically credible;
- colorful in a restrained way;
- soft/nude rather than sterile hospital blue.

Aim for a visual personality that feels intelligent, warm, trustworthy, and polished.

Do not require a personal profile photo in V1. Marie previously preferred to keep personal information limited and asked whether the site could work without her picture.

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
3. Read the docs relevant to its stage.
4. Inspect the current repository before assuming structure or implementation state.
5. State the stage/objective being worked on.
6. Avoid unrelated refactors.
7. Preserve completed architecture unless there is a verified defect.
8. Test the work.
9. Write a handoff note if the stage is complete.

## 13. Source of truth order

If instructions conflict, use this priority:
1. Explicit latest instruction from project owner.
2. `docs/11-DECISION-LOG.md` decisions marked ACTIVE.
3. `AI_CONTEXT.md`.
4. `docs/01-SCOPE-FREEZE.md`.
5. Stage-specific documentation.
6. Existing implementation.

Never infer a scope change from an unfinished experiment or old code.

## 14. Research rule

When researching libraries, APIs, SEO behavior, Supabase, Next.js, Vercel, Tiptap, accessibility, or security:
- verify against current official documentation;
- record any decision that affects architecture in `docs/11-DECISION-LOG.md`;
- do not implement a major technology change based only on a blog post or memory;
- prefer current stable features over experimental features unless there is a clear benefit and approval.

## 15. Definition of project success

The website succeeds when:
- Marie can publish an article without developer assistance;
- a reader can comfortably consume content on mobile;
- an employer can quickly assess Marie's writing quality and professional profile;
- published content is indexable and shareable;
- private/admin content stays private;
- the site remains fast, maintainable, and easy to extend later without V1 scope creep.
