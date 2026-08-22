# 09 — Testing & Quality Gates

## Required test categories

### Build/static
- TypeScript checks
- lint
- production build
- broken import/config checks

### UI contract conformance
For relevant UI stages:
- compare hierarchy, spacing, typography, proportions, color and signature devices against `docs/18-UI-IMPLEMENTATION-CONTRACT.md`
- review representative desktop/tablet/mobile compositions against `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`
- verify the implementation does not collapse into default shadcn styling
- verify synthetic mockup copy/data did not become factual production content
- verify no out-of-scope mockup feature was silently implemented

### Public UX
- homepage mobile/tablet/desktop
- blog listing
- article page long content
- category page
- search states
- portfolio
- contact validation
- 404/not-found

### Admin UX
- login/logout
- unauthorized redirect/response
- article create/edit
- draft persistence
- preview
- publish/update/archive/delete
- category management
- media management
- portfolio controls
- comment moderation
- message inbox
- settings

### Security
Follow `05-SECURITY-RLS.md` test matrix.

### Accessibility
Target WCAG 2.2 AA:
- keyboard navigation
- focus visibility/unobscured focus
- form labels/errors
- heading hierarchy
- alt text flow
- text and meaningful-control contrast
- responsive reflow/zoom
- reduced motion
- dialogs/menus if used
- color-independent meaning

When browser-test tooling is authorized, automated accessibility scans may supplement but never replace manual review.

### SEO
- metadata per route
- canonical
- sitemap
- robots
- structured data shape
- unpublished content not exposed/indexed

### Performance
- optimized images
- controlled font loading
- no excessive client bundle for public article pages
- no obvious data waterfalls
- acceptable layout stability
- mobile loading experience
- motion does not degrade responsiveness

### Visual regression
When Playwright/browser tooling is authorized by the relevant stage:
- capture representative viewport screenshots
- compare against approved UI baselines/contract
- tolerate content differences but investigate unexplained layout/design drift
- include public mobile as a first-class regression surface

## Quality gate policy
Do not declare a stage complete because the screen looks correct. Verify behavior, data rules, error states, accessibility, performance and security relevant to that stage.

A visually accurate screen that violates scope, accessibility, security or factual-content rules fails the gate.

## Regression rule
When fixing a defect, add or document a regression check appropriate to the failure so the same issue is less likely to recur.
