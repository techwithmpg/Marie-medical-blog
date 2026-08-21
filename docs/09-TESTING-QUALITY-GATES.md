# 09 — Testing & Quality Gates

## Required test categories

### Build/static
- TypeScript checks
- lint
- production build
- broken import/config checks

### Public UX
- homepage mobile/desktop
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
- comment moderation
- message inbox
- settings

### Security
Follow `05-SECURITY-RLS.md` test matrix.

### Accessibility
- keyboard navigation
- focus visibility
- form labels/errors
- heading hierarchy
- alt text flow
- contrast
- dialogs/menus if used

### SEO
- metadata per route
- canonical
- sitemap
- robots
- structured data shape
- unpublished content not exposed/indexed

### Performance
- optimized images
- no excessive client bundle for public article pages
- no obvious data waterfalls
- acceptable layout stability
- mobile loading experience

## Quality gate policy
Do not declare a stage complete because the screen looks correct. Verify behavior, data rules, error states, and security relevant to that stage.

## Regression rule
When fixing a defect, add or document a regression check appropriate to the failure so the same issue is less likely to recur.
