# 06 — UI / Design Direction

## Status

**OWNER-ACCEPTED / FROZEN FOR V1 VISUAL IMPLEMENTATION**

The canonical detailed contract is:

- `docs/18-UI-IMPLEMENTATION-CONTRACT.md`
- `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`

ACTIVE decision authority: D019 and D020.

## Brand direction

**Warm Medical Editorial with Scientific Restraint — The Evidence Folio**

Brand personality:
- professional
- editorial
- calm
- warm
- contemporary
- trustworthy
- medically credible
- intelligent
- restrained
- distinctive without visual excess

## Signature system

The approved identity is carried by:
- Evidence Rail
- Folio Numbers
- Split Rule
- Reference Ledger
- Topic Imprint

Do not replace this system with default shadcn styling or generic beige editorial templates.

## Core visual direction

Accepted semantic palette direction:
- parchment / warm-ivory page surfaces
- near-white reading surfaces
- deep ink foreground
- oxide brand accent
- deep sage secondary accent
- restrained functional colors for focus/status

Accepted typography:
- Newsreader for public editorial display
- Source Sans 3 for body/UI/metadata/references/admin

## Layout principles

- mobile-first
- generous whitespace
- fewer, stronger sections rather than card overload
- consistent max-width containers
- article content narrower than general public composition
- typography/rules/spacing before floating cards
- obvious but restrained calls to action
- admin is intentionally quieter/utilitarian

## Component contract

Establish reusable components before page proliferation:
- site header/navigation
- mobile navigation
- footer
- buttons/links/forms
- article card/list item
- topic imprint
- split rule/folio marker/evidence rail
- article typography renderer
- reference ledger
- key-takeaway block
- author block
- disclaimer block
- empty/loading/error states
- admin shell/navigation
- admin table/list/status patterns

See `docs/18-UI-IMPLEMENTATION-CONTRACT.md` for the complete component and dependency policy.

## Privacy/content safety

A portrait is optional and must never be structurally required.

Generated visual mockups contain synthetic content. Do not copy their medical claims, credentials, statistics, emails, response-time promises, dates or workflow labels into production unless separately verified/approved.

## Accessibility

Target WCAG 2.2 AA.

At minimum:
- semantic landmarks/headings
- labels for every form field
- keyboard navigation
- visible/unobscured focus
- adequate text/control contrast
- descriptive alt-text support
- reduced-motion support
- responsive reflow
- no information conveyed by color alone
