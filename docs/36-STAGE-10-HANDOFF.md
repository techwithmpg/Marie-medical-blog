# 36 — Stage 10 SEO, Social & Analytics Handoff

## Stage

`Stage 10 — SEO, Social & Analytics`

## Objective completed

Stage 10 is locally complete on `stage/10-seo-social-analytics`. D034 and the Phase 10A design freeze established one canonical authority and the metadata, discovery, structured-data, social-image, and privacy-safe Analytics contracts. Phases 10B–10D implemented those contracts. Phase 10E exercised the complete local database, security, Node, rendered metadata, browser, accessibility, visual, dependency, and production-build gates. One rendered cross-route canonical defect found during Phase 10E was corrected narrowly and covered by a strengthened regression assertion.

This handoff is a local implementation and verification checkpoint. It is not launch completion, hosted Analytics activation, Search Console execution, final-domain acceptance, or merge authorization.

## Repository checkpoints

- Accepted Stage-10 base (`origin/main`): `33736919c1cb5208faaf3d0ca63d9796fc98db3d`
- Branch: `stage/10-seo-social-analytics`
- Phase 10E starting implementation head: `159458093fb3e11d5b09a17014ec952eee941307`
- Phase 10E authorization commit: `51dbcedff08e0c1101a75c6a6da03923277f86f7`
- Phase 10E corrective commit: `62a15af` (`fix: preserve cross-route canonical URLs`)
- Stage-10 merge: NOT AUTHORIZED / NOT PERFORMED

## Phase completion

- Phase 10A — governance, official research, D034, and architecture freeze: COMPLETE.
- Phase 10B — site URL authority, environment classification, route metadata, canonicals, query/pagination indexability, titles, and textual social metadata: COMPLETE.
- Phase 10C — Evidence Folio social fallback, public article image selection, sitemap, robots, and published-article `BlogPosting` JSON-LD: COMPLETE.
- Phase 10D — exact official `@vercel/analytics@2.0.1` dependency, narrow Next.js integration, and fail-closed `beforeSend` privacy filter: COMPLETE.
- Phase 10E — full local verification, minimal canonical correction, and closeout: COMPLETE / GATE PASS.

## Files and areas delivered

- Canonical and metadata: `src/lib/site-url.ts`, `src/lib/discovery-query.ts`, `src/app/layout.tsx`, public route metadata, and `src/app/admin/layout.tsx`.
- Discovery artifacts: `src/app/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/discovery-artifacts.ts`, and article JSON-LD in `src/app/blog/[slug]/page.tsx`.
- Published-public reads: `src/lib/public-data.ts` and `src/lib/public-articles.ts`.
- Analytics: `src/components/analytics/privacy-safe-analytics.tsx` and `src/lib/analytics-privacy.ts`.
- Focused tests: `tests/stage10-phase10b-site-url.test.mjs`, `tests/stage10-phase10b-dynamic-discovery.test.mjs`, `tests/stage10-phase10c-discovery-artifacts.test.mjs`, and `tests/stage10-phase10d-analytics-privacy.test.mjs`.

## Database changes

None. Stage 10 added no schema, migration, RLS, Auth, or Storage change. Phase 10E used only the existing local Supabase project at `127.0.0.1:54321`, applied the five committed migrations through the established reset path, and loaded only committed synthetic seed fixtures. No linked or hosted Supabase command was run.

## Environment changes

No committed environment variable was added or removed. Production-classified local verification used the existing `SITE_URL` / `VERCEL_PROJECT_PRODUCTION_URL` contract with the synthetic host `https://publication.example.test`; this is not a configured or approved final domain.

## Dependency and configuration result

- `@vercel/analytics@2.0.1` is the only Stage-10 dependency addition and remains exact.
- Next.js `16.3.2`, React/React DOM `19.2.8`, Supabase JS `2.112.4`, and Supabase SSR `0.12.5` resolved as expected.
- Production dependency audit: 0 vulnerabilities.
- No SEO, sitemap, JSON-LD, OG-image, Google Analytics, Google Tag Manager, Speed Insights, replay, ads, pixels, or alternate analytics package was added.
- No `"type": "module"` workaround or unrelated configuration change was introduced.

## Phase 10E defect correction

Rendered verification found that a blog topic filter produced the correct topic OG URL but rendered `/blog` as its canonical. Installed Next.js 16.3.2 resolver source documents that a `URL` instance in `alternates.canonical` is treated as a base and receives the current pathname. The correction serializes the already-validated canonical URL to the documented string form. The topic-filter regression now asserts the exact cross-route canonical string. Rebuilt production HTML contains exactly one canonical at `/topics/clinical-communications`, matching the OG URL and retaining `noindex, follow`.

## Verification performed

### Local Supabase and security

- `npx supabase db reset`: PASS — 5/5 committed migrations applied and synthetic seed loaded.
- `npx supabase test db`: PASS — 323/323 pgTAP tests across 11 files.
- `npx supabase db lint`: PASS — no schema errors.
- Published-only reads, draft/admin isolation, commenter-email privacy, contact-message privacy, Storage boundaries, RLS, and service-role non-exposure remained covered and passed.
- The final local database was restored to committed synthetic seed state and the project-local Supabase stack was stopped.

### Stage-10 and repository tests

- Phase 10B: 43/43 PASS.
- Phase 10C: 25/25 PASS.
- Phase 10D: 18/18 PASS.
- Focused Stage-10 total: 86/86 PASS.
- Phase 10E introduced no new suite; it strengthened an existing Phase 10B cross-route canonical assertion without changing the inventory.
- Complete repository Node suite: 153/153 PASS. The two Stage-8 Auth/Storage lifecycle tests that previously failed without local services both passed against the guarded local stack.
- The known `MODULE_TYPELESS_PACKAGE_JSON` warning remained non-blocking; package configuration was not changed to silence it.

### Browser, accessibility, and visual

- Playwright Chromium: 15/15 PASS across 5 suites with one worker and the hard local Supabase guard.
- Responsive overflow matrix: PASS at 390×844, 768×1024, and 1440×900 for `/`, `/about`, `/contact`, `/portfolio`, `/blog`, a published article, and representative admin surfaces.
- Axe WCAG 2.0/2.1 A/AA plus WCAG 2.2 AA representative scans: 0 serious and 0 critical violations across public and admin surfaces.
- Keyboard/focus: PASS for public contact/comment forms, settings controls, moderation/inbox actions, and article preview open/Escape/focus return.
- Runtime/hydration guard: PASS with no actionable uncaught errors.
- Evidence Folio visual review: PASS. The generated PNG is 1200×630, readable, unclipped, network-independent, and uses the approved parchment/paper/ink/oxide/sage folio and ledger language without credentials, medical claims, final domain, or social handle.

### Rendered SEO and discovery

- Production-classified representative route matrix: PASS for home, about, clean blog, page 1, valid page 2, malformed/zero/negative/out-of-range pagination, search, empty/repeated queries, topic filter, combined search/filter/pagination, unknown/tracking parameters, portfolio, contact, disclaimer, topic, published article, and admin login.
- Each relevant public page rendered one title, description, canonical, OG title/description/URL, Twitter card, and social image without duplicate site-name suffixes.
- Search text did not enter head metadata; query, fragment, unknown, and tracking values did not enter canonical authority.
- Local/preview classification rendered `noindex, nofollow`; production-classified clean public routes rendered `index, follow`; search/filter variants followed D034.
- `/sitemap.xml`: PASS — absolute central-authority URLs only; approved static routes, published synthetic articles, and non-empty published topics; no localhost, admin, query, tracking, or pagination entries.
- `/robots.txt`: PASS — production allows `/`, disallows `/admin` and `/admin/`, and names the canonical sitemap with no host directive; local/preview disallows `/` with no sitemap/host.
- Published article JSON-LD: PASS — exactly one truthful `BlogPosting` with canonical URL/mainEntity, stored dates, safe description, and public `Person`/`/about`; prohibited publisher, credentials, medical types, ratings, comments, contact, and private/draft facts are absent.
- Social image selection and safe fallback behavior: PASS in the focused discovery suite for valid public image plus truthful alt, and for private/signed/unsupported/inaccessible/alt-less candidates.

### Analytics privacy

- Frozen public-route allowlist, query stripping, fragment stripping, origin/path normalization, admin/login/private/draft/internal/malformed/non-HTTP rejection, and custom-event suppression: PASS (18/18).
- Representative `https://example.com/blog?q=diabetes&page=2&utm_source=test#results` resolves to `https://example.com/blog`.
- Root layout remains a Server Component; the Analytics wrapper remains the narrow Client Component; no visible UI, custom tracking call, or layout shift was introduced.
- The local production runtime requested the expected `/_vercel/insights/script.js`; hosted Analytics was not activated to change local endpoint behavior.

### Quality and build

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run format:check`: PASS.
- `git diff --check`: PASS.
- `npm audit --omit=dev --audit-level=high`: PASS — 0 vulnerabilities.
- `npm run build`: PASS — Next.js 16.3.2 production build compiled all 18 App Router routes.

## Stage-10 requirement matrix

| Requirement | Classification |
| --- | --- |
| Canonical site URL authority | COMPLETE |
| Production/preview/local environment classification | COMPLETE |
| `metadataBase` | COMPLETE |
| Static and dynamic route metadata | COMPLETE |
| Canonical and query/pagination behavior | COMPLETE |
| Preview/local `noindex` protection | COMPLETE |
| Open Graph and Twitter metadata | COMPLETE |
| Evidence Folio fallback | COMPLETE |
| Published article social-image preference | COMPLETE |
| Sitemap | COMPLETE |
| Robots | COMPLETE |
| Published `BlogPosting` JSON-LD | COMPLETE |
| Exact official Analytics dependency | COMPLETE |
| Minimal Analytics integration | COMPLETE |
| Analytics privacy filter | COMPLETE |
| Hosted Vercel Analytics activation | OWNER-GATED / DEFERRED TO LAUNCH BY GOVERNANCE |
| Search Console property/verification/submission | OWNER-GATED / DEFERRED TO LAUNCH BY GOVERNANCE |
| Final custom domain | OWNER-GATED / DEFERRED TO STAGE 12 |
| Categories | OUT OF STAGE-10 SCOPE |
| Media Library | OUT OF STAGE-10 SCOPE |

## Known limitations and deferred work

- Hosted Vercel Analytics remains NOT ACTIVATED. Dashboard mutation remains unauthorized.
- Search Console property creation, ownership verification, sitemap submission, and indexing requests were not executed.
- The final production/custom domain remains unconfigured and must not be inferred from the synthetic verification host.
- Categories and Media Library remain intentionally unimplemented and outside Stage 10.
- The stage branch is not merged. Merge into `main` requires a separate owner decision.
- Stage 11 is not active and no next development work is automatically authorized.

## Decisions made

- D034 remains the active frozen architecture decision in `docs/11-DECISION-LOG.md`.
- Phase 10E used the existing D034 defect-correction allowance; it introduced no new architecture decision.

## Next stage readiness

- Stage-10 local implementation: READY / FULL LOCAL GATE PASS.
- Owner merge review: READY FOR OWNER DECISION.
- Hosted launch operations: BLOCKED BY EXPLICIT OWNER GATES.
- Stage 11: NOT AUTHORIZED.

## Rule for the next agent

Read this handoff, D034, and the live-context manifest before modifying Stage-10 output. Do not activate hosted Analytics, mutate Search Console/DNS/domain settings, merge Stage 10, implement Categories/Media, or begin Stage 11 without new explicit owner authorization.
