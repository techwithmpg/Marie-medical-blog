# 35 — Stage 10 SEO, Social & Analytics Design

## 1. Authority and status

- **Stage:** Stage 10 — SEO, Social & Analytics
- **Current phase:** Phase 10A — Governance, Research & Design Freeze
- **Phase status:** COMPLETE / EXTERNAL REVIEW CORRECTION APPLIED / OWNER REVIEW PENDING
- **Owner authorization date:** 2026-08-26
- **Canonical accepted `main`:** `33736919c1cb5208faaf3d0ca63d9796fc98db3d`
- **Stage branch:** `stage/10-seo-social-analytics`
- **Architecture decision:** D034 — PROPOSED / OWNER REVIEW REQUIRED
- **Application implementation:** NOT STARTED / NOT AUTHORIZED IN PHASE 10A
- **Hosted Vercel mutation:** NOT AUTHORIZED IN PHASE 10A
- **Google Search Console mutation:** NOT AUTHORIZED IN PHASE 10A

This document is the Phase-10A design-freeze candidate. It records the exact architecture proposed for Stage 10 before application code, dependency installation, production-domain configuration, hosted Analytics activation, or Search Console ownership work begins. It does not activate D034 by itself.

## 2. Governance basis

This design is constrained by:

- `AI_CONTEXT.md` and `AGENTS.md`;
- the frozen V1 scope in `docs/01-SCOPE-FREEZE.md`;
- the frozen stack in `docs/02-TECH-STACK.md` and route/information architecture in `docs/03-INFORMATION-ARCHITECTURE.md`;
- the SEO and medical-content requirements in `docs/07-SEO-CONTENT-STANDARDS.md`;
- the Stage-10 outcomes and gate in `docs/08-DEVELOPMENT-STAGES.md`;
- the testing, SEO, security, accessibility, and performance gate requirements in `docs/09-TESTING-QUALITY-GATES.md`;
- the handoff, decision, status, branch, and live-context rules in `docs/10-HANDOFF-PROTOCOL.md`, `docs/11-DECISION-LOG.md`, `docs/13-PROJECT-STATUS.md`, `docs/14-BRANCH-STRATEGY.md`, `docs/15-CHATGPT-REPO-SYNC.md`, and `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md`;
- the accepted Evidence Folio UI contract and reference policy in `docs/18-UI-IMPLEMENTATION-CONTRACT.md` and `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`; and
- the completed Stage-9 boundary recorded in `docs/34-STAGE-9-HANDOFF.md`.

When this document and an ACTIVE decision conflict, the ACTIVE decision wins. D034 must receive explicit owner approval before any Stage-10 application implementation.

## 3. Phase-10A scope and exclusions

### 3.1 Authorized in Phase 10A

- inspect the accepted repository and existing SEO/data boundaries;
- research current official Next.js, Vercel, and Google Search guidance;
- freeze a centralized canonical URL contract;
- freeze route metadata, canonicalization, social preview, sitemap, robots, and structured-data behavior;
- freeze the official Vercel Web Analytics integration and privacy boundary;
- prepare the Search Console launch/setup runbook contract;
- record D034 as proposed and update project status; and
- run documentation-only quality checks, commit, and push the Stage-10 branch.

### 3.2 Not authorized in Phase 10A

- editing application, test, configuration, migration, or environment-template files;
- installing `@vercel/analytics` or any other dependency;
- implementing Metadata API changes, sitemap, robots, JSON-LD, or social images;
- enabling Vercel Web Analytics in a hosted project;
- adding or verifying a Search Console property;
- submitting a sitemap or requesting indexing;
- configuring the final custom domain;
- adding Google Analytics, Google Tag Manager, advertising pixels, custom analytics, or custom events;
- implementing Categories or Media Library work; or
- adding fabricated profile, medical, business, social, domain, author, publisher, or credential facts.

## 4. Verified repository baseline

The following statements are verified against canonical `main` at the Phase-10A base SHA:

| Area | Verified current state | Stage-10 implication |
| --- | --- | --- |
| Framework | Next.js App Router `16.3.2`, React `19.2.8` | Use the current App Router Metadata API and metadata file conventions. |
| Root metadata | `src/app/layout.tsx` has a basic static title and description | Replace it later with centralized dynamic defaults sourced from the public settings singleton, plus `metadataBase` and root social defaults. |
| Static public routes | `/`, `/about`, `/blog`, `/portfolio`, `/contact`, and `/disclaimer` have basic route metadata | Complete title, description, self-canonical, OG, and Twitter coverage. |
| Dynamic public routes | `/blog/[slug]` and `/topics/[slug]` use `generateMetadata` | Extend existing server-side metadata without moving indexable content client-side. |
| Blog variants | `/blog` accepts `q`, `topic`, and `page` query parameters | Prevent search/filter/pagination variants from competing with the clean listing URL. |
| Public article reads | Public helpers filter articles to `status = 'published'` | Reuse that boundary for metadata, sitemap, and JSON-LD. Never create a draft discovery path. |
| Public media | Published article data can include a featured-image path and alt text | Use only a valid public featured image; otherwise use the controlled brand fallback. |
| Topics | Topic routes and category data exist | Include only valid topics backed by published public content; do not implement category management. |
| Private routes | Admin routes are under `/admin`; current admin pages individually declare `noindex` | Add defense-in-depth route metadata and robots guidance without treating either as access control. |
| Discovery files | No centralized site URL helper, sitemap route, robots route, JSON-LD renderer, or branded OG fallback exists | These are later Stage-10 implementation deliverables. |
| Analytics | `@vercel/analytics` is not installed and no analytics integration exists | No dependency or hosted activation occurs in Phase 10A. |
| Domain | No verified final custom domain is recorded | Never invent or hardcode one. Stage 12 owns final domain acceptance. |

## 5. Research classification

The classifications below follow the repository synchronization discipline: official behavior is a VERIFIED FACT; repository requirements are PROJECT CONSTRAINTS; D034 content is a PROPOSED DECISION until owner approval.

| Classification | Statement | Decision impact |
| --- | --- | --- |
| VERIFIED FACT | Next.js App Router supports static `metadata`, dynamic `generateMetadata`, `metadataBase`, metadata file conventions, `app/sitemap.ts`, `app/robots.ts`, and generated OG images. Metadata exports are Server Component APIs. | Use framework-native features; do not add an SEO or sitemap library. |
| VERIFIED FACT | `VERCEL_PROJECT_PRODUCTION_URL` supplies the production-domain name when Vercel System Environment Variables are exposed and remains available on preview deployments. `VERCEL_ENV` distinguishes `production`, `preview`, and `development`; `VERCEL_URL` identifies the generated deployment URL. | Use `VERCEL_ENV` for hosted deployment classification and `VERCEL_PROJECT_PRODUCTION_URL` for Vercel production-origin authority. Preview/deployment-specific hosts must never become canonical. |
| VERIFIED FACT | `@vercel/analytics/next` supports `beforeSend`; returning `null` discards an event and returning a modified event permits URL redaction before transmission. | The official integration can exclude private surfaces and sanitize public URLs before transmission, including removal of search/filter/query values. |
| VERIFIED FACT | Google recommends absolute canonical URLs in sitemaps, canonical-only sitemap entries, Search Console sitemap submission, URL Inspection for representative URLs, and Rich Results Test validation. | Build one absolute canonical URL authority and keep duplicate query URLs out of the sitemap. |
| VERIFIED FACT | Google recommends JSON-LD, requires structured data to represent visible page content accurately, and documents `BlogPosting` under Article structured data. | Emit only article facts already present in the rendered public page. |
| PROJECT CONSTRAINT | Published public content only is indexable; drafts, admin data, contact messages, and private settings stay protected. | Every discovery surface must reuse public data boundaries and fail closed. |
| PROJECT CONSTRAINT | Evidence Folio is the accepted public visual contract and generated mockup content is not product truth. | Any generated social card uses Evidence Folio composition and verified text only. |
| PROPOSED DECISION | The contracts in Sections 6–17 become the Stage-10 implementation freeze. | Requires explicit owner approval of D034 before code. |

## 6. Central site URL and canonical authority

### 6.1 Single server-side authority

A later authorized implementation shall create one server-only site URL module, proposed as `src/lib/site-url.ts`. All canonical links, `metadataBase`, OG URLs, JSON-LD URLs, sitemap entries, and the robots sitemap URL must use this module. Route files must not assemble production origins independently.

The resolver returns a normalized `URL` origin with:

- an allowed `http:` or `https:` scheme;
- no credentials, path, query, or fragment;
- no trailing slash in serialized origin form; and
- `https:` for Vercel-hosted production authority.

Invalid configured values must fail fast in production builds rather than silently publish malformed canonical URLs.

### 6.2 Precedence contract

1. A future Stage-12 owner-approved, server-only canonical origin override may be used after the real custom domain is verified and recorded. The proposed name is `SITE_URL`; it is a reserved design contract, not a Phase-10A environment change.
2. In Vercel-hosted builds without that approved override, use `https://${VERCEL_PROJECT_PRODUCTION_URL}`.
3. In local development and tests, use the deterministic fallback `http://localhost:3000` unless the test explicitly supplies a valid isolated origin.

`VERCEL_ENV` is the hosted environment classifier when available: `production` permits the production route-indexability matrix, while `preview` forces `noindex, nofollow`. `NODE_ENV` must not be used by itself to distinguish Vercel production from preview deployments.

`VERCEL_URL` and `VERCEL_BRANCH_URL` must not be canonical-origin sources. They are deployment/branch specific and can identify previews. Preview deployments may render metadata whose absolute links point to the production authority, but the preview host itself is never canonical. A hosted production deployment must fail verification rather than publish `localhost` or a preview deployment URL as canonical authority.

No `.vercel.app` hostname or future custom domain may be hardcoded in source or documentation as the product's factual final domain.

### 6.3 Metadata base and URL helpers

- Root `src/app/layout.tsx` will use `generateMetadata` to set `metadataBase` from the central resolver and to read the public settings singleton's `site_title`, `tagline`, and `default_seo_description` through the existing safe-fallback helper.
- The public settings read will be request-memoized and shared with `PublicShell` where practical so dynamic metadata does not create a duplicate data waterfall.
- A small helper will join validated route paths to the same origin for sitemap, robots, and JSON-LD.
- Canonical paths will be deliberate leading-slash paths. Search, filter, tracking, unknown, hash, and preview parameters are removed unless a reviewed route contract explicitly maps the request elsewhere. Valid pagination retains its normalized `page` parameter because each page in a paginated sequence is a distinct canonical page.
- Dynamic slugs must come only from existing published public records and must be URL encoded by the platform/URL API rather than string-trusted.
- Hosted deployment classification uses `VERCEL_ENV` when available. Only `VERCEL_ENV=production` may apply production indexability rules; `VERCEL_ENV=preview` forces `noindex, nofollow`. Local/test rendering remains non-production. Canonical production authority still comes from the approved `SITE_URL` override or `VERCEL_PROJECT_PRODUCTION_URL`, never `VERCEL_URL` or `VERCEL_BRANCH_URL`.

## 7. Public route metadata contract

Use static `metadata` when all route facts are static and `generateMetadata` when metadata depends on search parameters or public database content. Metadata generation stays server-side. Shared public reads used by both metadata and the page should be request-memoized with React `cache` or an equivalent framework-supported server pattern to avoid duplicate data waterfalls.

Root dynamic metadata supplies the verified/safe-fallback `site_title`, optional `tagline`, and `default_seo_description`. The title contract uses the site title as the root default and as the suffix for child route titles; it does not concatenate a blank tagline. Route-specific descriptions win when accurate. Otherwise `default_seo_description` is the shared fallback. This completes the Stage-10 use of the existing settings field without adding schema.

Every indexable public page receives:

- a concise, accurate title;
- an accurate description from verified route content or the safe existing site fallback;
- a self-referencing absolute canonical through `metadataBase`;
- Open Graph URL/title/description/type/image data;
- Twitter card/title/description/image data; and
- explicit `index, follow` only where the route satisfies the indexability rules below.

A shared metadata helper must combine route-level indexability with deployment-level indexability. Production may honor the route matrix; preview always resolves to `noindex, nofollow`. Child route metadata must not be able to overwrite the preview safeguard with `index, follow`.

### 7.1 Route matrix

| Route | Metadata mode | Canonical | Indexing behavior | Data source/fallback |
| --- | --- | --- | --- | --- |
| `/` | Root/page `generateMetadata` from public site settings | `/` | `index, follow` in production | Safe-fallback `site_title`, optional verified `tagline`, and `default_seo_description`. |
| `/about` | Static export | `/about` | `index, follow` in production | Existing page purpose and verified public profile fallback. |
| `/blog` with no query | Dynamic metadata because query variants require inspection | `/blog` | `index, follow` in production | Existing listing description or safe site default. |
| `/portfolio` | Static export | `/portfolio` | `index, follow` in production | Existing page purpose; no invented client claims. |
| `/contact` | Static export | `/contact` | `index, follow` in production | Existing contact purpose; no response-time promise. |
| `/disclaimer` | Static export | `/disclaimer` | `index, follow` in production | Existing disclaimer purpose. |
| `/blog/[slug]` | `generateMetadata` from the published article helper | `/blog/{slug}` | `index, follow` in production only for a published article; missing/non-public records use `notFound()` and must not publish indexable article metadata | `seo_title` → article `title`; `seo_description` → article `excerpt` → safe site description. |
| `/topics/[slug]` | `generateMetadata` from valid public topic data | `/topics/{slug}` | `index, follow` in production only when the topic exists and has at least one published article; missing topic uses `notFound()`; empty topic is `noindex, follow` | Verified topic name plus neutral listing language; no medical claim. |

Unknown public query parameters must not alter the canonical URL or cause unsanitized values to appear in titles, descriptions, social metadata, or structured data.

### 7.2 Non-production and private metadata

- Vercel preview deployments emit `noindex, nofollow` for every route and keep any absolute canonical/social URL on the production authority, never the preview host.
- A shared `/admin` layout metadata boundary emits `noindex, nofollow` for the entire admin/auth subtree so future admin pages cannot accidentally omit the directive.
- Draft/private preview routes do not exist in the public V1 route tree. If one is ever separately authorized, it must be authenticated, absent from discovery artifacts, excluded from Analytics, and `noindex, nofollow`.

### 7.3 Article metadata details

- Open Graph type is `article`.
- `publishedTime` uses the stored published timestamp when present.
- `modifiedTime` uses the stored updated timestamp when present and truthful.
- Author display uses only the verified public profile name already rendered by the page.
- A valid public featured image may be the article social image; otherwise use the controlled branded fallback.
- Missing SEO fields never produce empty tags when an existing accurate content fallback is available.
- Database errors must not expose private data or draft metadata. The route follows its existing safe error/not-found behavior.

## 8. Search, filter, and pagination canonicalization

Search, filtering, pagination, and unknown query parameters are not treated as one SEO case.

### 8.1 Base blog listing

The clean `/blog` route is the canonical first listing page.

- canonical: `/blog`;
- production indexing: `index, follow`;
- included in `sitemap.xml`.

### 8.2 Valid pagination

Valid pagination such as `/blog?page=2` and `/blog?page=3` represents distinct pages in the listing sequence.

- each valid pagination page uses a self-referential canonical that retains the normalized `page` parameter;
- valid pagination pages may emit `index, follow` in production;
- pagination pages remain crawlable;
- pagination pages are not required in `sitemap.xml`;
- page `1`, an empty page value, or an equivalent first-page representation canonicalizes to clean `/blog`;
- malformed, negative, zero, non-integer, or out-of-range pagination must not become an indexable thin URL and follows the application's validated empty/not-found behavior.

A paginated page must not canonicalize to page 1 merely because it belongs to the same sequence.

### 8.3 Search variants

Requests containing a public search query such as `/blog?q=...`:

- remain usable for readers;
- emit `noindex, follow`;
- canonicalize to clean `/blog`;
- remain absent from the sitemap; and
- never echo unsanitized search text into metadata, social cards, structured data, or Analytics URLs.

Combined search + pagination remains `noindex, follow` and canonicalizes to clean `/blog`; search-result pagination is not promoted into a separate indexable search corpus.

### 8.4 Topic filter variants

The application already has the dedicated topic route `/topics/{slug}`.

When `/blog?topic={slug}` represents the same public topic collection:

- the filter view emits `noindex, follow`;
- its canonical points to `/topics/{slug}`;
- it remains absent from the sitemap as a duplicate filter representation.

If `q` is also present, the request remains a search variant and canonicalizes to clean `/blog`.

Unknown, malformed, or invalid topic filters must not create indexable metadata.

### 8.5 Topic pagination

If the existing `/topics/{slug}` route supports genuine pagination:

- the clean first page canonicalizes to `/topics/{slug}`;
- each valid subsequent page such as `/topics/{slug}?page=2` uses its own self-referential canonical retaining the normalized page parameter;
- valid topic-pagination pages may remain `index, follow` in production;
- they are not required in the sitemap;
- invalid/out-of-range pagination must not create an indexable thin URL.

### 8.6 Unknown and tracking parameters

Unknown and tracking parameters:

- must not alter metadata text;
- must not become part of canonical authority;
- are stripped from canonical URLs unless a separately reviewed route contract gives them content identity.

Canonical tags are discovery signals, not security controls or redirects. Query validation, published-public filtering, and authorization remain separate application responsibilities.

## 9. Open Graph and Twitter preview architecture

### 9.1 Shared defaults

Root metadata provides shared Open Graph and Twitter defaults using the canonical origin, safe site title/description, `website` Open Graph type, and one controlled fallback image. Twitter uses `summary_large_image`. No social account handle is emitted until verified owner content exists.

### 9.2 Controlled Evidence Folio fallback

The proposed implementation uses the framework-native `src/app/opengraph-image.tsx` convention with `ImageResponse` from `next/og`; no image-generation or social-card package is added. The image must be 1200×630 with an explicit content type and accurate alt description.

The fallback visual must preserve the canonical Evidence Folio system and reuse its established semantic tokens:

- page/parchment `#F6F1E8`;
- reading surface/paper `#FFFDF9`;
- primary ink `#242321`;
- muted ink `#5E5953`;
- brand oxide `#7B3F35`;
- deep sage `#3F5E52`;
- strong editorial hierarchy and generous whitespace; and
- an approved Evidence Folio document/folio signature device rather than generic gradient marketing art.

The social card must not establish a parallel navy/teal/red palette outside the frozen design contract.

It may show only the verified site/publication name and neutral product language already accepted in the repository. It must not invent Marie's credentials, medical claims, dates, readership, clients, testimonials, contact facts, social handles, or a final domain.

### 9.3 Article images

- Prefer the article's valid, publicly accessible featured image when present.
- Include accurate stored alt text; if a specific article image lacks required public accessibility data, use the branded fallback rather than inventing alt text.
- Do not use draft/private storage URLs, expired signed URLs, data URLs, or unsupported media.
- Do not generate a synthetic medical illustration for an article.
- The root branded image is the deterministic fallback for all routes; per-article generated cards are not required for V1.

## 10. Sitemap architecture

Implement `src/app/sitemap.ts` using `MetadataRoute.Sitemap` and the central canonical authority. It emits fully qualified absolute URLs only.

### 10.1 Included URLs

- static canonical public routes: `/`, `/about`, `/blog`, `/portfolio`, `/contact`, `/disclaimer`;
- one entry per published public article at `/blog/{slug}`; and
- one entry per valid topic at `/topics/{slug}` only when at least one published article belongs to it.

Article `lastModified` uses `updated_at` when truthful, otherwise `published_at`. Do not emit fabricated modification dates. Static routes may omit `lastModified` unless a truthful source is introduced.

### 10.2 Excluded URLs

- every `/admin` and authentication route;
- drafts, archived records, unpublished records, and private preview URLs;
- contact messages, comments administration, settings, and other private data;
- search/filter/tracking/query duplicates; valid canonical pagination pages remain outside the sitemap by design but are not treated as canonical duplicates;
- empty or invalid topic routes;
- non-canonical preview hosts; and
- future Categories or Media Library routes unless separately implemented and authorized.

The sitemap query must use the established published-public data boundary. If dynamic sitemap data cannot be read safely, the implementation must fail closed to the known static public set and surface an operational error; it must never relax the published filter or expose private rows.

The current V1 volume does not justify sitemap partitioning. If the official 50,000-URL/50 MB limits ever become relevant, partitioning requires a later reviewed change.

## 11. Robots architecture

Implement `src/app/robots.ts` using `MetadataRoute.Robots` and the central canonical authority.

The production V1 policy is:

- allow crawling of public routes from `/`;
- disallow `/admin` and `/admin/` for all user agents;
- list the absolute canonical `/sitemap.xml` URL; and
- omit a `host` directive until the final production domain is owner-verified and Stage 12 has finalized it.

On Vercel preview deployments, `robots.ts` will disallow `/` and omit sitemap/host directives as supplemental crawl guidance. Page-level preview `noindex, nofollow` remains the explicit indexing directive, while canonical fields continue to name production.

Do not disallow `/_next/` assets required for rendering. Search/filter URLs are controlled by page-level `noindex` and canonical metadata rather than a broad robots block that could interfere with the base blog route.

`robots.txt` is crawl guidance only. It is not authentication, authorization, secrecy, or a substitute for RLS. Admin protection, draft isolation, private schema boundaries, and service-role secrecy remain enforced by the existing application and database security architecture.

## 12. `BlogPosting` JSON-LD architecture

Published article pages may emit one JSON-LD object with `@context: "https://schema.org"` and `@type: "BlogPosting"`. It must be rendered in the Server Component with a native `<script type="application/ld+json">` element and must describe the visible article on that same page.

### 12.1 Allowed properties and sources

| Property | Source |
| --- | --- |
| `headline` | Published article title. |
| `description` | `seo_description`, then excerpt, then the accurate safe site description. |
| `url` | Absolute self-canonical article URL. |
| `mainEntityOfPage` | The same absolute self-canonical article URL. |
| `datePublished` | Stored `published_at`, only when present. |
| `dateModified` | Stored `updated_at`, only when present and truthful. |
| `author` | `Person` with verified public display name and canonical `/about` URL. |
| `image` | Valid, crawlable public featured-image URL only. Omit when unavailable. |

Publisher, organization, credentials, medical specialty, affiliation, logo, `sameAs`, awards, claims, ratings, and clinical/medical schema types are omitted until their facts and assets are explicitly verified. Do not label general editorial content as `MedicalWebPage`, `MedicalScholarlyArticle`, or another medical type merely because the site is medically oriented.

### 12.2 Safe serialization

Build the object from server-trusted, already-public fields. Serialize with `JSON.stringify(value).replace(/</g, "\\u003c")` before assigning it to the script HTML so content cannot terminate the script element. Never interpolate raw rich-text HTML or reader input. Structured data must never contain comments, contact messages, admin settings unavailable publicly, or draft content.

## 13. Vercel Web Analytics architecture

### 13.1 Approved integration candidate

After D034 approval, a later local implementation phase may add only the official `@vercel/analytics` package and its Next.js integration from `@vercel/analytics/next`. The resolved package version must be recorded by the lockfile and checked against current official documentation at implementation time.

The `<Analytics />` component belongs in the root application layout so public client-side navigations are measured consistently, with a supported `beforeSend` filter applied before any event is transmitted.

### 13.2 Privacy filter

The filter must parse the event URL safely and return `null` for:

- `/admin` and every `/admin/...` route, including login;
- any future private preview route;
- any future draft route or URL that can reveal a draft identifier; and
- malformed or unclassifiable URLs.

For every permitted public page-view event, the filter must sanitize the URL before transmission:

1. parse `event.url` with the URL API;
2. retain only the normalized origin and pathname;
3. remove the complete query string;
4. remove any fragment/hash;
5. return the event with the sanitized URL.

For example, a page view for `/blog?q=diabetes&page=2` is transmitted only as the public `/blog` path, never with the search term or pagination query attached.

This privacy rule applies to `q`, `topic`, `page`, tracking parameters, unknown parameters, and any future public query parameter. Removed values must never be copied into custom event properties. V1 continues to prohibit custom Analytics events.

### 13.3 Explicit exclusions

- No custom analytics implementation.
- No Google Analytics or Google Tag Manager.
- No advertising, retargeting, conversion, heatmap, session-replay, or third-party tracking pixels.
- No V1 custom events.
- No reader fingerprinting or identity enrichment.
- No admin or draft telemetry.
- No analytics dashboard, metric card, or invented readership number added to the application.

Installing the package and committing local integration code do not enable the hosted service. Vercel dashboard activation is a separate hosted mutation requiring explicit owner authorization, verified project identity, and a recorded execution result. Phase 10A authorizes neither the package installation nor dashboard activation.

## 14. Google Search Console launch/setup runbook contract

The following is the frozen launch sequence for a later explicitly authorized hosted phase. No step is executed in Phase 10A.

### 14.1 Preconditions

1. The final public production domain is owner-approved and recorded under Stage 12.
2. Production serves the intended canonical domain over HTTPS.
3. Canonical metadata, OG/Twitter metadata, JSON-LD, `/robots.txt`, and `/sitemap.xml` have passed local and production verification.
4. The sitemap contains only absolute canonical public URLs and no draft/admin/query duplicates.
5. The operator is signed into the owner-approved Google account and has explicit authority to create or modify the property.

### 14.2 Property and ownership

1. Prefer a Domain property when the owner controls DNS and wants all protocols/subdomains covered; Domain properties require DNS verification.
2. Use a URL-prefix property only when the owner deliberately limits coverage to the exact HTTPS prefix or cannot authorize domain-level verification.
3. Record the chosen property type, exact verified domain/prefix, verification method, operator, and timestamp.
4. Do not add a Search Console HTML verification tag, file, DNS record, Google Analytics dependency, or Google Tag Manager solely by assumption. The chosen verification mechanism is a separate owner-authorized mutation.

### 14.3 Submission and validation

1. Open the verified property and submit the production `/sitemap.xml` in the Sitemaps report.
2. Record the submission timestamp and immediate processing result; sitemap submission is a discovery hint, not an indexing guarantee.
3. Use URL Inspection on representative canonical URLs: home, clean blog listing, one published article, and one valid non-empty topic.
4. Confirm the user-declared canonical matches the intended production URL and inspect the rendered page/resources.
5. Run Rich Results Test against at least one representative published article and resolve critical `BlogPosting` errors. Treat warnings according to truthful data availability; never invent fields to silence them.
6. Request indexing only for a small representative set when explicitly authorized. Repeated submissions do not guarantee or accelerate indexing.

### 14.4 Monitoring after launch

- monitor sitemap processing/errors;
- monitor Page Indexing and URL Inspection outcomes for canonical mismatches, excluded pages, and crawl problems;
- monitor Article rich-result/structured-data reports when available;
- inspect representative OG/Twitter previews with platform-appropriate debuggers without adding platform SDKs;
- confirm admin, draft, query variants, and preview hosts remain absent from discovery surfaces; and
- record issues as evidence-backed follow-up work rather than changing schema, content, or tracking scope speculatively.

## 15. Security, privacy, and content boundaries

1. Metadata, sitemap, social images, and JSON-LD may consume published public fields only.
2. Drafts and archived records remain undiscoverable; metadata work never bypasses `status = 'published'` filters.
3. RLS remains enabled. No service-role credential enters client code, metadata, analytics, or structured data.
4. `robots.txt`, `noindex`, canonical links, and sitemap omission are defense-in-depth discovery controls, not security controls.
5. Contact messages, commenter emails, private settings, admin routes, and authentication state never enter discovery or analytics payloads.
6. Rich text is rendered through the existing sanitization boundary; JSON-LD never embeds raw article HTML.
7. No medical advice, credentials, clinical claims, author qualifications, affiliations, testimonials, readership statistics, or business facts are inferred from visual references.
8. Preview deployment hosts are never canonical and are not submitted to Search Console.
9. Analytics collection remains limited to the official automatic page-view behavior after separate authorization; no custom-event personal data is permitted in V1.
10. Search Console and Vercel dashboard changes must verify the exact external project/property before mutation and must be logged in the handoff/status record.

## 16. Dependency boundary

Phase 10A adds no dependency.

Subject to D034 owner approval, a later implementation phase may add one dependency: `@vercel/analytics`. No other Stage-10 package is approved by this design.

Specifically prohibited without a new owner-reviewed decision:

- SEO abstraction libraries;
- sitemap or robots generators;
- schema/JSON-LD libraries;
- Open Graph/social-card libraries;
- Google Analytics, Tag Manager, advertising, or pixel packages;
- alternative analytics SDKs; and
- UI libraries or image-generation dependencies.

Next.js Metadata API, metadata file conventions, `next/og`, native JSON serialization, and existing public data helpers are sufficient for the frozen architecture.

## 17. Later work sequence and gates

This sequence is a boundary, not authorization.

### Future local discovery implementation

Requires D034 owner approval plus an explicit owner instruction opening application implementation. Proposed work: central URL authority, metadata/canonical completion, query-variant controls, social fallback, sitemap, robots, `BlogPosting` JSON-LD, and focused unit/integration tests. No hosted mutation.

### Future local Analytics integration and complete verification

Requires dependency authorization under active D034 plus an explicit owner instruction opening the work. Proposed work: install official `@vercel/analytics`, add the privacy filter, verify package/build behavior, and complete browser/accessibility/visual checks. No Vercel dashboard or Search Console mutation.

### Deferred controlled hosted operations

These are not implicitly authorized by local Stage-10 implementation and are not prerequisites for approving the local architecture/code gate unless the owner explicitly makes them so. Vercel Web Analytics activation requires separate authorization after local review. Search Console property creation, ownership verification, and sitemap submission remain launch operations for the final owner-approved production domain; when a custom domain is intended, Stage 12 must finalize it first. Each operation must verify the exact external project/property and record its result.

No phase may silently absorb Categories, Media Library, advertising, reader authentication, custom analytics events, or unrelated launch work.

## 18. Verification plan

Before Stage 10 can pass, later authorized implementation must prove:

### 18.1 Automated and source checks

- site-origin precedence, validation, normalization, and deterministic fallback tests;
- `VERCEL_ENV=production` and `VERCEL_ENV=preview` classification tests;
- no production canonical can resolve from `VERCEL_URL`, `VERCEL_BRANCH_URL`, a preview host, or localhost;
- metadata tests for every public route and article fallback path;
- clean `/blog` uses its clean self-canonical;
- valid blog/topic pagination retains normalized `page` in a self-referential canonical and may remain `index, follow`;
- search variants emit `noindex, follow` and canonicalize to clean `/blog`;
- topic-filter duplicates emit `noindex, follow` and canonicalize to the dedicated `/topics/{slug}` route when equivalent;
- unknown/tracking parameters never enter canonical authority or metadata text;
- unpublished/missing articles cannot emit indexable metadata or JSON-LD;
- sitemap contains only the approved static routes, published articles, and non-empty valid topics;
- robots permits public crawling, disallows `/admin`, and lists the canonical sitemap;
- JSON-LD serialization escapes `<` and omits unverified fields;
- Analytics `beforeSend` drops admin/private/draft/malformed events, preserves approved public page views, and removes `q`, `topic`, `page`, unknown query parameters, tracking parameters, and fragments from transmitted public URLs; and
- no forbidden analytics or SEO dependency is present.

### 18.2 Repository quality gate

- `npm run typecheck`;
- `npm run lint`;
- focused unit/integration tests;
- `npm run format:check`;
- `npm run build`;
- `git diff --check`;
- dependency and lockfile review; and
- diff-scope confirmation against the active phase.

### 18.3 Browser and rendered-output checks

- inspect rendered `<head>` on all public route classes at desktop and mobile sizes;
- verify exactly one intended canonical per public page;
- verify metadata remains server-rendered for crawlers and article content remains indexable;
- verify the 1200×630 fallback at representative rendering sizes against Evidence Folio;
- verify social image alt, focus behavior, and existing page accessibility are not regressed;
- fetch and inspect `/sitemap.xml` and `/robots.txt`;
- validate one representative article JSON-LD object from rendered HTML;
- confirm `/admin` and draft/private surfaces do not emit discoverable metadata or Analytics events; and
- confirm no avoidable client-side data waterfall or material layout shift was introduced.

### 18.4 Hosted checks

Hosted checks occur only with separate authorization. They include exact Vercel project identity; confirmation that required Vercel System Environment Variables are exposed; `VERCEL_ENV` classification; confirmation that the resolved production canonical origin is neither localhost nor a preview/deployment-specific host; Analytics activation and sanitized/filtered intake; Search Console property identity; sitemap processing; URL Inspection; Rich Results Test; and absence of preview/admin/draft URLs from submitted discovery artifacts.

## 19. Stage-10 acceptance criteria

Stage 10 is not complete until all of the following are true:

- D034 is explicitly owner-approved and ACTIVE;
- all indexable public routes have accurate metadata and self-canonicals;
- search/filter/query variants cannot compete with clean public routes;
- social previews use valid article media or the Evidence Folio fallback;
- sitemap and robots outputs match this freeze;
- published articles emit safe, truthful `BlogPosting` JSON-LD;
- official Vercel Web Analytics is integrated with the privacy filter, with no custom events or alternate trackers;
- any hosted activation and Search Console work has separate authorization and an auditable result;
- private/admin/draft data remains protected and undiscoverable;
- all relevant automated, build, browser, accessibility, visual, and production checks pass; and
- the handoff and project-status history are updated without prematurely authorizing Stage 11.

## 20. Official research references

- [Next.js — Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Next.js — `generateMetadata` and `metadataBase`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js — Open Graph and Twitter image file conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Next.js — `robots.txt` file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js — `sitemap.xml` file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js — JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld)
- [Vercel — System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)
- [Vercel — Advanced Web Analytics configuration and `beforeSend`](https://vercel.com/docs/analytics/package)
- [Vercel — Redacting sensitive Analytics data](https://vercel.com/docs/analytics/redacting-sensitive-data)
- [Vercel — Web Analytics privacy and compliance](https://vercel.com/docs/analytics/privacy-policy)
- [Google Search Central — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search Central — Canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google Search Central — Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google Search Central — Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google Search Central — Structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google Search Central — Ask Google to recrawl URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Google Search Console Help — Add a property](https://support.google.com/webmasters/answer/34592)
- [Google Search Console Help — Verify site ownership](https://support.google.com/webmasters/answer/9008080)

## 21. Phase-10A ending boundary

At the end of this authorized work:

- Stage 10 remains ACTIVE with Phase 10A COMPLETE / EXTERNAL REVIEW CORRECTION APPLIED / OWNER REVIEW PENDING;
- D034 remains PROPOSED / OWNER REVIEW REQUIRED;
- application implementation remains NOT STARTED;
- `@vercel/analytics` remains uninstalled;
- Vercel hosted Analytics activation remains unauthorized;
- Search Console property/verification/submission work remains unauthorized;
- Categories and Media Library work remain unauthorized; and
- the next permissible action is owner review of D034, not application coding.
