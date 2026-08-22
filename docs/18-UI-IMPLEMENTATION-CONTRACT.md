# 18 — Canonical UI Implementation Contract

**Status:** OWNER-ACCEPTED DESIGN CONTRACT / PRE-IMPLEMENTATION
**Decision authority:** D019 and D020 in `docs/11-DECISION-LOG.md`
**Accepted:** 2026-08-23
**Implementation authorization:** NONE. This document does not authorize Stage 1 or any application coding.

## 1. Purpose and authority

This document converts the approved UI research and visual prototypes into the canonical implementation contract for the Marie Medere Medical Writing Portfolio & Educational Blog.

It governs UI/UX implementation once the relevant development stages are explicitly authorized.

When implementing or reviewing UI, use this priority:

1. explicit latest owner instruction;
2. ACTIVE decisions in `docs/11-DECISION-LOG.md`;
3. `AI_CONTEXT.md`;
4. `docs/01-SCOPE-FREEZE.md`;
5. relevant stage-specific documentation, including this contract and `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md` when UI-related;
6. existing implementation.

If a visual mockup conflicts with frozen scope, security, accessibility, factual client content, or this contract, the mockup does not win.

## 2. Accepted design direction — The Evidence Folio

The approved public visual system is:

**Warm Medical Editorial with Scientific Restraint — “The Evidence Folio.”**

The site should feel like a small premium evidence-led medical publication plus professional writing portfolio. It must not resemble:

- a hospital or clinic website;
- a generic SaaS dashboard;
- a wellness-influencer site;
- a beauty/lifestyle template;
- a journal clone;
- a generic beige portfolio template.

The public experience should be recognizable through a repeatable design grammar, not merely through color.

### Signature devices

The following devices are part of the accepted identity:

1. **Evidence Rail** — restrained long-form editorial rail for article structure/reference cues; never a competing sidebar.
2. **Folio Numbers** — occasional `01`, `02`, `03` editorial indexing for major sections and selected-writing entries.
3. **Split Rule** — short oxide segment transitioning into a neutral hairline.
4. **Reference Ledger** — carefully designed numbered source/reference presentation.
5. **Topic Imprint** — small consistent editorial category label, not a wall of colored pills.

Removing these devices and using only cream + sage + serif typography is considered design drift.

## 3. Visual tokens

### Color candidates accepted for implementation

| Semantic role | Token |
|---|---|
| Page / parchment | `#F6F1E8` |
| Reading surface / paper | `#FFFDF9` |
| Primary ink | `#242321` |
| Muted ink | `#5E5953` |
| Brand oxide | `#7B3F35` |
| Deep sage | `#3F5E52` |
| Inline link | `#704037` |
| Subtle field | `#E8E2D7` |
| Subtle divider | `#D2C9BC` |
| Control boundary | `#918579` |
| Success | `#2F6A4F` |
| Warning | `#8B5A13` |
| Destructive | `#9A3636` |
| Focus slate | `#265D7A` |

Pale colors are primarily surfaces/decorative accents, not low-contrast body text.

### Typography

- **Newsreader** — public display, page titles, article H1/H2 and selected editorial display text.
- **Source Sans 3** — article body, navigation, metadata, buttons, forms, references, captions and all admin UI.

Load through the framework font system when implementation is authorized. Do not introduce decorative third/fourth typefaces without an approved decision.

### Type targets

| Role | Desktop | Mobile |
|---|---:|---:|
| Masthead/display | ~64px | ~44px |
| Article H1 | ~56px | ~38–40px |
| Page H1 | ~48px | ~36px |
| H2 | ~32px | ~28px |
| H3 | ~24px | ~22px |
| Deck/intro | ~21–22px | ~20px |
| Body | ~19px | ~18px |
| Metadata | ~14–15px | ~14px |
| References | ~16px | ~16px |

Long-form body line-height should be approximately `1.6–1.65`.

## 4. Layout and spacing

### Public layout

- maximum editorial site container: approximately `1248px`;
- desktop composition: 12-column grid;
- desktop outer gutter: approximately `40–48px`;
- tablet gutter: approximately `32px`;
- mobile gutter: approximately `20px`;
- article header may be wider than reading body;
- reading column: tune approximately `680–720px`;
- long-form line measure: approximately `60–72` characters, targeting about `66`;
- major desktop section rhythm: approximately `80–112px`;
- major mobile section rhythm: approximately `56–72px`.

### Spacing scale

Prefer a controlled scale such as:

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 112`

### Shape language

- editorial surfaces: usually `0–4px` radius;
- buttons/form controls: generally `6–8px`;
- default editorial card maximum: about `8px`;
- shadows are rare and reserved for real elevation such as menus/dialogs;
- story hierarchy should come from type, spacing, imagery and rules before cards.

Do not turn the publication into a collection of large floating rounded cards.

## 5. Responsive contract

Mobile and tablet are separate compositions, not scaled desktop.

### Public mobile

- compact wordmark + menu trigger;
- primary public content remains Server Component-friendly and indexable;
- major stories stack in reading order;
- touch targets should aim for approximately 44px comfort on primary controls;
- article body approximately 18px with generous line-height;
- Evidence Rail collapses to a compact rule/folio marker;
- references become full-width ledger;
- filters wrap/scroll intentionally without tiny controls;
- no persistent UI may obscure article content or keyboard focus.

### Tablet

- preserve editorial asymmetry where space permits;
- reduce desktop grid complexity;
- keep reading measure controlled;
- maintain clear navigation/search without forcing desktop density.

## 6. Public-page contracts

### `/` — Homepage

Required hierarchy:

1. compact publication header;
2. professional/editorial positioning;
3. dominant featured story;
4. limited supporting/latest stories;
5. topic discovery;
6. selected writing/portfolio proof;
7. concise About Marie bridge;
8. professional contact CTA;
9. footer/disclaimer/navigation.

Do not use a full-screen marketing hero before readers encounter the publication.

### `/blog` — Article listing

- page title/deck;
- search;
- topic filter;
- sensible sorting if already within approved behavior;
- one dominant featured/latest item where appropriate;
- secondary stories with clear metadata;
- pagination/load-more behavior chosen during implementation without changing product scope;
- topic labels use Topic Imprint treatment.

### `/blog/[slug]` — Article

Highest-priority public UI.

Order:

1. breadcrumb/topic imprint;
2. title;
3. deck/excerpt;
4. author/date/updated/read-time metadata;
5. optional featured media + caption/credit;
6. long-form body;
7. restrained key-takeaway/callout where content warrants it;
8. Reference Ledger;
9. author block;
10. medical-information disclaimer;
11. related writing;
12. comments where enabled.

Article chrome must stay subordinate to reading.

### `/portfolio`

Visual title may be **Selected Writing**.

Portfolio primarily presents selected published articles under D006. Do not create a duplicate content CMS.

Sample context such as Audience / Format / Demonstrates may be displayed only if the approved data model supports it. A mockup does not authorize schema fields.

### `/about`

- typographic professional profile;
- portrait optional;
- factual, client-approved bio/credentials only;
- writing approach;
- approved focus/interests;
- selected-writing link;
- CV download;
- contact CTA.

The layout must remain complete without a personal portrait.

### `/contact`

- restrained introduction;
- accessible form;
- clear labels/errors/success state;
- no invented address, response-time promise, email or client claim;
- private submission handling belongs to later authorized stages.

## 7. Admin UX contract

The admin is intentionally quieter than the public publication.

It should feel like a calm single-writer tool, not enterprise SaaS.

Canonical modules remain:

- Dashboard
- Articles
- Drafts
- Categories
- Media
- Portfolio
- Comments
- Messages
- Settings

`Drafts` is an article workflow/view under the existing admin article contract; it does not authorize a new `/admin/drafts` route. Route authority remains `docs/03-INFORMATION-ARCHITECTURE.md`.

### Admin rules

- Source Sans 3 may be used throughout.
- New Article must be easy to find.
- Prefer clear lists/tables and contextual panels.
- Use status labels consistently.
- Avoid decorative public-site theatrics.
- Avoid vanity analytics and invented metrics.
- Avoid complex role/permission UI.
- Avoid multi-author/editorial review workflow.

### Mockup features explicitly NOT authorized by visuals

Do not implement solely because a generated mockup contains them:

- `Needs Review` / `Request a Review` workflow;
- multi-person editorial review;
- scheduled publishing;
- article PDF export/download;
- category export;
- fake analytics/reader-count claims;
- fake client/testimonial/logo proof;
- unverified profile data;
- arbitrary drag-and-drop page building.

Manual portfolio ordering remains a separate decision gate under D006.

## 8. Component architecture

### Primitive layer

Use customized shadcn/ui on the frozen Base UI + Tailwind v4 + CSS-variable foundation.

Install only components actually required by an authorized stage.

Expected primitives include, as required:

- Button
- Input
- Textarea
- Label/Field
- Select/Native Select
- Checkbox
- Radio Group
- Switch
- Badge
- Avatar
- Breadcrumb
- Separator
- Tabs
- Table
- Pagination
- Dropdown Menu
- Dialog
- Alert Dialog
- Sheet
- Popover
- Tooltip
- Scroll Area
- Skeleton
- Empty state
- Sidebar
- Aspect Ratio
- Toggle/Toggle Group
- Sonner/toast feedback

Do not bulk-install all shadcn components.

### Marie-specific components

Build these as project components rather than third-party design kits:

- `EvidenceRail`
- `FolioMarker`
- `SplitRule`
- `TopicImprint`
- `ReferenceLedger`
- `ArticleTypography`
- `ArticleHeader`
- `KeyTakeaways`
- `MedicalDisclaimer`
- `AuthorBlock`
- `FeaturedArticle`
- `ArticleListItem`
- `TopicIndex`
- `SelectedWritingItem`
- `SiteHeader`
- `MobileNav`
- `SiteFooter`
- `AdminShell`
- `AdminPageHeader`
- `StatusBadge`
- `FilterBar`
- `MediaCard`
- `MediaDetailPanel`
- `CommentReviewPanel`
- `MessageReader`

shadcn is the primitive layer. Evidence Folio is the product design system.

## 9. Dependency policy

A library listed here is **allowed only when its owning stage is authorized and there is a real implementation need**. This document does not order installation now.

### Frozen/core

- Next.js / React
- TypeScript
- Tailwind CSS v4
- customized shadcn/ui using Base UI
- Supabase
- Tiptap
- Vercel

### Approved UI/helper policy

- `lucide-react` — icon system;
- shadcn foundation helpers such as CVA, `clsx`, `tailwind-merge`, `tw-animate-css`;
- `sonner` — compact action feedback;
- `motion` — only for restrained premium transitions where CSS is insufficient;
- `zod` — runtime/server-boundary validation;
- `react-hook-form` + `@hookform/resolvers` — complex admin forms when justified;
- Playwright + `@axe-core/playwright` — later browser/visual/accessibility verification.

### Tiptap extension policy — Stage 7

Preferred controlled set, subject to current official API verification at execution:

- React integration;
- StarterKit;
- Image;
- table support/TableKit;
- TextAlign where needed;
- Placeholder;
- CharacterCount;
- server/static renderer for public article rendering where appropriate.

Do not add collaboration/multi-user or AI-authoring extensions in V1.

### Stage-gated backend packages

Supabase framework packages belong to the authorized database/auth stages, not Stage 1.

### Decision-gated

`dnd-kit` or equivalent reorder tooling is not approved merely because a portfolio mockup depicts ordering. Manual portfolio ordering must first be explicitly approved under D006.

### Do-not-add by default

Do not introduce without a verified need and approval:

- MUI, Chakra, Ant Design, Bootstrap;
- Redux or Zustand;
- TanStack Query;
- Axios;
- TanStack Table;
- Recharts/Chart.js;
- Swiper;
- GSAP;
- a second icon library;
- `next-themes` without a dark-mode decision;
- article-PDF generation;
- AI editor plugins;
- collaboration extensions;
- page-builder libraries.

## 10. Motion policy

The accepted design is calm.

Prefer CSS/Tailwind/shadcn state transitions for most interactions.

Use `motion` only where it provides clear quality:

- subtle editorial section entrance;
- filtered list reflow;
- selected-writing transitions;
- mobile navigation presence;
- small admin layout transitions.

Targets:

- buttons/links: roughly `120–160ms`;
- dropdown/tooltip: roughly `140–180ms`;
- sheet/dialog: roughly `180–240ms`;
- list/layout transition: roughly `200–260ms`;
- editorial entrance: roughly `250–320ms`;
- transform distance: usually `4–10px`.

No parallax, particles, looping decorative motion, bouncing medical icons or scroll spectacle.

Honor `prefers-reduced-motion`; remove major transforms when reduced motion is requested.

## 11. Accessibility contract

Target WCAG 2.2 AA.

Minimum expectations:

- semantic landmarks/headings;
- keyboard-operable controls;
- visible, unobscured focus;
- normal text contrast >= 4.5:1;
- meaningful non-text/control contrast where required;
- persistent form labels and explicit errors;
- no meaning by color alone;
- alt-text workflow for informative media;
- decorative images receive appropriate empty alt handling;
- responsive reflow/zoom;
- meaningful table headers/captions;
- reduced-motion support;
- comfortable primary mobile targets.

Accessibility is not optional visual polish. It is a release constraint.

## 12. SEO and performance constraints

- public article content must remain indexable;
- Server Components by default where appropriate;
- do not turn static editorial content into unnecessary client-only rendering;
- optimize images through the framework;
- keep fonts controlled;
- avoid layout shifts;
- avoid unnecessary JavaScript;
- keep main content visually obvious;
- preserve author/date/update/reference context;
- do not add intrusive overlays/interstitials.

## 13. Visual reference policy

See `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`.

The optimized contact sheets under `docs/ui-reference/` are **composition references**, not content truth.

Generated text, medical claims, dates, statistics, names, email addresses, credentials, categories and workflow labels inside the images are synthetic placeholders unless separately verified by canonical project documentation or approved client content.

If mockups disagree with each other, this textual contract wins.

## 14. Visual verification

When browser testing becomes authorized, representative pages should be checked against the accepted reference system at:

- desktop;
- tablet;
- mobile.

Later quality stages should use browser automation/visual comparison when practical, with accessibility scanning as a supplement to manual review.

Visual regression must not force pixel-perfect copying of synthetic content. Compare:

- hierarchy;
- spacing;
- typography;
- proportions;
- color;
- signature devices;
- responsive behavior;
- interaction states.

## 15. Stage ownership

This contract crosses multiple stages but does not reorder them.

- **Stage 1:** foundation only; no broad visual implementation.
- **Stage 2:** implement tokens, fonts, public/admin shells, signature primitives and responsive foundations.
- **Stage 5:** public identity pages against this contract.
- **Stage 6:** article/listing/search/category reading/discovery UI.
- **Stage 7:** admin article/editor/media authoring UI.
- **Stage 8:** publishing-state behavior.
- **Stage 9:** comments/messages/settings/portfolio controls.
- **Stage 10:** SEO/social/analytics presentation.
- **Stage 11:** visual regression, accessibility, responsive/browser/performance hardening.
- **Stage 12:** replace synthetic content with approved real client content and conduct acceptance.

No agent may implement a later-stage screen simply because a mockup already exists.

## 16. No-drift acceptance checklist

Before any UI stage is considered complete, verify:

- Evidence Folio signature devices are present where specified;
- the app does not look like default shadcn;
- public/admin visual personalities remain intentionally distinct;
- mobile is designed, not merely shrunk;
- article reading comfort remains the priority;
- references are visible and deliberate;
- mockup placeholders did not become factual product data;
- no out-of-scope visual feature was implemented;
- no new package was added outside D020/this policy without approval;
- accessibility and performance checks relevant to the stage pass.

## 17. Implementation status

**NO APPLICATION CODE IS AUTHORIZED BY THIS CONTRACT.**

At the time this contract was accepted:

- Stage 0 is complete/pass;
- Stage 1 remains not authorized;
- no application scaffold or dependency installation is authorized;
- this is a predevelopment governance/design artifact.
