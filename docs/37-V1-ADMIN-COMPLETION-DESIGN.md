# 37 — V1 Admin Completion Design: Categories + Media

## 1. Authority and status

- **Decision:** D035 — V1 Admin Completion Gate: Categories & Media
- **Date:** 2026-08-29
- **Canonical design base:** `e8a7784fee2044d9be3aee80818f69784b2b5d7f`
- **Status:** ACTIVE / ARCHITECTURE APPROVED / IMPLEMENTATION NOT YET AUTHORIZED
- **Current phase:** Governance/design activation only
- **Recommended future implementation branch:** `fix/v1-admin-completion` (not created and not authorized by D035 activation)

This document freezes the architecture for the **Pre-Stage-11 V1 Admin Completion Gate — Categories + Media**. Category management and Media management are already frozen V1 scope. Their absence after Stage 10 is an implementation omission, not an expansion of scope.

Stage 11 remains blocked until this gate is implemented, tested, reconciled, merged, and verified under separate explicit owner authorization. Stage 12 remains unauthorized.

## 2. Design principles and inherited contracts

1. Reuse the accepted schema, Row Level Security, Storage buckets, and Stage-8 copy-first article-image lifecycle.
2. Keep the application single-author and operationally simple.
3. Use Server Components for route loading by default.
4. Use Server Actions for mutations, with an independent `requireAdmin()` check at each action boundary.
5. Keep all privileged credentials server-only. A browser may receive only the minimum path-specific signed upload or preview capability required for an authorized operation.
6. Preserve public published-only reads, private draft isolation, Evidence Folio UI conventions, accessibility, and targeted cache revalidation.
7. Do not introduce schema, Storage-policy, bucket, dependency, or hosted-service changes where the accepted foundation already satisfies the requirement.

## 3. Categories architecture

### 3.1 Existing data and security baseline

Category management reuses `public.categories` exactly as accepted:

- `id` — UUID primary key;
- `name` — required category label;
- `slug` — required unique kebab-case route identifier;
- `description` — optional explanatory text;
- `created_at` and `updated_at` timestamps;
- existing timestamp trigger;
- existing grants and RLS policies;
- public read access required for published topic discovery;
- authenticated-admin create, update, and delete access enforced through existing authorization rules; and
- `public.articles.category_id` references `public.categories(id)` with `ON DELETE RESTRICT`.

No Category migration, new table, new column, new constraint, new policy, new grant, or new RPC is required.

### 3.2 Route and loading model

`/admin/categories` is a protected admin route rendered as a Server Component. Its server loader independently requires Marie/admin access and returns categories ordered predictably by name, together with an article-usage count for each category.

The usage indication is an aggregate read over the existing article relationship. It is not a denormalized counter and does not add a new persisted field.

### 3.3 Exact V1 UX

The page provides:

- an Evidence Folio admin heading and concise scope explanation;
- a category list showing name, canonical slug, article-use count, and available actions;
- a Create Category action;
- a create form containing name, editable slug, and optional description;
- an edit surface containing editable name and description plus a visibly read-only slug;
- a guarded Delete action only when the category is unreferenced;
- clear empty, loading, success, validation-error, conflict, and server-error states; and
- a direct explanation that an incorrect slug on a new unused category must be corrected by deleting and recreating the category.

Desktop uses the established admin content rhythm with a list and adjacent detail/edit panel where space permits. Mobile uses a single-column list and the accepted Sheet/dialog pattern for create, edit, and delete confirmation. The desktop and mobile surfaces expose the same operations and rules.

### 3.4 Validation

All inputs are validated server-side before mutation. Client validation may improve feedback but is never authoritative.

- Trim category names and reject empty values.
- Normalize and validate a create-time slug as lowercase kebab-case.
- Reject an empty, malformed, or duplicate slug.
- Permit Marie to accept an automatically generated slug or manually edit it before submitting Create Category.
- Normalize optional description whitespace and enforce the existing database-compatible length boundary.
- Reject unknown fields and malformed identifiers.
- Convert uniqueness and reference failures into safe, actionable admin feedback without exposing database internals.

Implementation may use the repository's existing validation conventions and dependencies; D035 does not authorize a new dependency.

### 3.5 Immutable post-create slug invariant

The category slug is editable only during category creation. Once the insert succeeds, the slug is immutable forever in V1.

This rule is not dependent on current article usage. The schema does not preserve historical category assignment or route history, so an empty current relationship cannot prove that `/topics/{slug}` was never public. Permanent post-create immutability therefore provides deterministic canonical topic URLs without a slug-history or redirect subsystem.

Name and description remain editable after creation. Update actions must accept only those editable fields and must never write the slug. The UI must render the slug as read-only and explain the rule.

If a newly created category has an incorrect slug, it may be deleted only while unreferenced and then recreated with the correct slug. No redirect or history entry is created.

### 3.6 Guarded deletion

Before deletion, the Server Action must:

1. call `requireAdmin()` independently;
2. validate the category identifier;
3. query current article usage;
4. reject deletion when one or more articles reference the category; and
5. delete only an unreferenced category through existing RLS/grants.

`ON DELETE RESTRICT` remains the final database safety boundary against races or missed application checks. The UI must not present bulk reassignment. Reassignment, when needed, remains an article-by-article editorial operation through the existing article workflow.

### 3.7 Category revalidation matrix

| Mutation | Required revalidation |
| --- | --- |
| Create category | `/admin/categories`, `/admin/articles/new`, and article editor routes that consume category options |
| Edit name or description | `/admin/categories`, `/blog`, `/topics`, `/topics/{slug}`, and affected article/editor routes |
| Delete unused category | `/admin/categories`, `/admin/articles/new`, `/blog`, `/topics`, and the deleted `/topics/{slug}` route |

Implementation should use targeted `revalidatePath` calls. It must preserve the Stage-8 lifecycle matrix for article mutations and must not turn public content into client-only rendering.

### 3.8 Category security requirements

- Anonymous users may read only the category data already needed by public topic discovery.
- Anonymous and authenticated non-admin users cannot create, update, or delete categories.
- Every mutation independently calls `requireAdmin()` even though the route is protected.
- The browser never receives service-role credentials.
- RLS remains enabled and unchanged.
- The immutable-slug rule is enforced by the accepted server mutation contract; implementation tests must prove no update path accepts or persists a slug change.

## 4. Media architecture

### 4.1 Canonical Storage inventory

Supabase Storage is the canonical V1 Media inventory. No `public.media` table, metadata mirror, asset database, folder model, or synchronization job is introduced.

The Media surface reads the two existing buckets:

| Bucket | Visibility | Accepted object boundary | V1 Media role |
| --- | --- | --- | --- |
| `draft-assets` | Private | JPEG, PNG, WebP, AVIF; maximum 5 MB | General private library uploads and draft/article-owned images |
| `public-assets` | Public | JPEG, PNG, WebP, AVIF, PDF; maximum 10 MB | Published article images and other already-public assets |

`/admin/media` is an **image-management surface only**. PDFs are excluded even if present in `public-assets`. Unsupported MIME types are not selectable. No bucket limit, allowed-MIME list, RLS policy, or Storage policy changes are required or authorized.

### 4.2 Inventory representation

The protected server loader lists appropriate image objects from `draft-assets` and `public-assets` and maps Storage metadata into a transient view model. At minimum, each item exposes:

- bucket and bucket-relative path;
- filename;
- MIME type;
- byte size;
- created/upload timestamp when supplied by Storage;
- private or public visibility;
- reuse eligibility and, when ineligible, the reason;
- current usage state; and
- a safe preview source.

Inventory is derived, not persisted. A missing or incomplete Storage metadata field must fail safely and must not make an unknown asset selectable.

### 4.3 Exact V1 UX

`/admin/media` provides:

- image inventory across the appropriate private draft and public published objects;
- bucket/visibility distinction;
- image preview;
- filename, MIME, size, and upload-date information where available;
- private-by-default upload;
- selection/reuse from the article featured-image workflow;
- in-use indication;
- guarded deletion; and
- clear loading, empty, partial-error, upload-progress, success, and failure states.

Desktop uses an Evidence Folio responsive image grid with a details/inspection panel. Mobile uses a compact grid or list and a Sheet for details and actions. Information must remain readable without hover.

Search is useful but deferred. Caption management, rename workflows, folder management, bulk operations, asset-global alt text, document management, and image editing are outside this gate.

### 4.4 Private-by-default upload workflow

General Media uploads use:

`draft-assets/library/{uuid}-{sanitizedFilename}`

The workflow is:

1. The client submits file facts to a server upload-preparation action.
2. The action independently calls `requireAdmin()`.
3. The action validates image MIME, maximum 5 MB size, safe filename, and the fixed `library/` namespace.
4. The server generates a UUID-prefixed destination path and issues only a short-lived, path-specific signed upload token compatible with the installed Supabase SDK.
5. The browser uploads directly to that exact private path without any privileged secret.
6. The UI refreshes the protected inventory after success.

Upload replacement/upsert is not the default. Paths are unique, so an upload cannot silently overwrite another object. No image resizing, compression, transcoding, optimization pipeline, or derivative generation is introduced.

### 4.5 Preview workflow

- Private `draft-assets` previews use short-lived signed URLs issued only after admin authorization.
- `getPublicUrl()` is prohibited for `draft-assets`.
- Public `public-assets` images may use their existing public URL behavior.
- Preview failures remain local to the affected item and do not expose private paths or privileged errors to unauthorized users.
- Signed URLs are presentation capabilities only; they are not persisted as canonical asset references.

### 4.6 Featured-image reuse eligibility

Every selected Media asset must be compatible with the destination `draft-assets` constraints before it may enter the article workflow.

| Source asset | Inventory visibility | Selectable for article reuse |
| --- | --- | --- |
| Private JPEG/PNG/WebP/AVIF at or below 5 MB | Visible | Yes |
| Public JPEG/PNG/WebP/AVIF at or below 5 MB | Visible | Yes, through copy to a new private article-owned path |
| Otherwise appropriate image over 5 MB | Visible | No; explain the 5 MB destination limit |
| PDF | Excluded from the V1 Media image surface | No |
| Unsupported or unknown MIME | If encountered, fail safely | No |

The source bucket's larger allowance never overrides the destination bucket's rules. Existing limits must not be weakened or enlarged merely to make an asset selectable.

### 4.7 Article-owned reuse workflow

Reusing an eligible Media image never assigns the shared library/public path directly to the article. It creates a new private article-owned object:

`draft-assets/articles/{articleId}/featured/{uuid}-{filename}`

The workflow is:

1. The article exists and its identifier is validated.
2. A Server Action calls `requireAdmin()` independently.
3. The server validates the selected source bucket/path and obtains trustworthy object metadata.
4. The server rechecks JPEG/PNG/WebP/AVIF MIME and the maximum 5 MB size.
5. The server generates a unique article-owned destination path.
6. Supabase Storage performs an authenticated copy to `draft-assets` using the installed cross-bucket-capable `copy()` contract when source and destination differ, or the equivalent native copy within the private bucket.
7. The article form receives or persists only the new article-owned private path through the existing article mutation boundary.
8. If later database mutation fails, the new destination is removed as compensation; the source remains intact.

Articles do not intentionally share one physical featured-image object. The Stage-8 publish, update, unpublish, archive, and delete lifecycle remains authoritative after reuse. Publication promotes the article-owned private object to a new article-owned public path; demotion copies it back to a new private article-owned path; cleanup follows the accepted compensation rules.

### 4.8 Contextual alt-text model

Alt text belongs to the article's use of an image, not to the Storage object. The existing `articles.featured_image_alt` field remains authoritative. Media selection must not invent, copy, or persist asset-global alt text.

The article editor continues to require meaningful contextual alt text where the existing workflow requires it. AI-generated alt text is outside V1.

### 4.9 Usage lookup and guarded deletion

Before deleting an object, the Server Action must independently authorize the admin and perform an exact normalized bucket/path usage lookup against:

- `articles.featured_image_path`;
- `profiles.cv_storage_path` defensively; and
- any later owner-approved persisted Storage-path field.

An in-use asset cannot be deleted. Unknown usage state, failed lookup, malformed metadata, or ambiguous path ownership must fail closed. The action must recheck usage immediately before `.remove()` to reduce race risk.

Deletion affects only the exact selected object. It does not cascade through prefixes, delete folders, mutate article rows, or bulk-remove variants. Public and private deletion both remain admin-only under existing Storage policies.

### 4.10 Media security requirements

- The Media route and every loader/action independently verify Marie/admin access.
- Private inventory and signed previews are never available anonymously.
- Upload tokens are short-lived, unique-path, and scoped to one validated destination.
- The browser receives no service-role or secret key.
- Existing RLS and Storage policies remain enabled and unchanged.
- Object listing, copying, signing, and removal use the authenticated server/admin context already accepted by the application.
- User-provided filenames are sanitized; server-generated UUIDs prevent collision and overwrite.
- MIME and size are validated before upload preparation and revalidated from trustworthy Storage facts before reuse.
- Failures do not fall back to public exposure, shared object assignment, upsert, or bucket-policy relaxation.

### 4.11 No-migration conclusion

Media requires no database migration, `public.media` table, hosted Supabase migration, Storage bucket change, Storage policy change, or data backfill. Implementation is application-layer orchestration over the accepted buckets, policies, article path fields, and SDK operations.

## 5. Evidence Folio UI integration

Categories and Media join the existing admin navigation without redesigning the admin shell or replacing the accepted visual system.

- Reuse Evidence Folio typography, color tokens, borders, spacing, folio/reference cues, and restrained admin controls.
- Add Categories and Media as clear peer destinations in desktop and mobile admin navigation.
- Preserve semantic headings, lists/tables/grids, labels, descriptions, and status text.
- Every interactive control must be keyboard reachable and expose a visible focus indicator.
- Sheets/dialogs must trap focus when open, support Escape where appropriate, name themselves accessibly, and return focus to the trigger on close.
- Destructive confirmation must identify the exact category or asset and explain why deletion may be unavailable.
- Do not encode visibility, eligibility, usage, or errors by color alone.
- Images require useful accessible names derived from safe filenames/context; decorative UI does not create fabricated content descriptions.
- Mobile layouts must avoid horizontal overflow and preserve touch target size.
- Loading skeletons or progress indicators must not cause destructive actions to become available before usage checks complete.
- Route-level and item-level failures provide recovery without revealing secrets or database internals.

## 6. Integration boundaries

### 6.1 Article workflow

- Category create/edit/delete changes refresh article category selectors.
- Media reuse integrates only with the existing featured-image field.
- Inline article images remain outside V1.
- The existing article draft/publish/update/unpublish/archive/delete contracts and their Storage compensation rules remain canonical.

### 6.2 Public experience

- `/topics/{slug}` remains the canonical topic route.
- Category name/description edits must refresh affected public topic/discovery views.
- Immutable slugs prevent route changes after creation.
- Published article images continue to resolve only from `public-assets`; draft/archived images continue to resolve only through private access.
- Public article queries remain published-only and server-rendered/indexable.

### 6.3 Hosted and launch boundaries

D035 does not authorize hosted Supabase mutation, hosted Analytics activation, Vercel dashboard mutation, Search Console operation, final-domain/DNS configuration, production deployment, or Stage-12 content work.

## 7. Testing and verification contract

Implementation cannot close this gate without focused and full regression evidence.

### 7.1 Category-focused tests

- admin can list categories with truthful usage counts;
- create validates, normalizes, and rejects duplicate/malformed input;
- create permits manual slug editing before submission;
- post-create updates can change name and description but cannot change slug;
- referenced deletion is rejected in the application and by `ON DELETE RESTRICT`;
- unreferenced deletion succeeds;
- anonymous and authenticated non-admin mutations fail;
- empty/error/conflict states are safe and actionable; and
- the revalidation matrix refreshes affected admin and public routes.

### 7.2 Media-focused tests

- inventory distinguishes private and public image objects;
- PDFs are excluded and unsupported MIME is not selectable;
- private/public compatible images at or below 5 MB are selectable;
- images over 5 MB remain visible where appropriate but are not selectable;
- general upload uses only `draft-assets/library/{uuid}-{sanitizedFilename}`;
- invalid MIME, oversized file, unsafe path, and overwrite attempts fail;
- private preview uses expiring signed URLs and never public URLs;
- reuse creates a unique article-owned private copy and never shares the source object;
- copy/database failure compensation leaves the source intact and removes orphan destinations;
- usage checks protect article featured images and profile CV paths;
- unknown usage state fails closed; and
- no privileged secret reaches client output.

### 7.3 RLS and Storage tests

- anonymous and non-admin users cannot list private objects or mutate either bucket;
- public reads retain only the existing intended `public-assets` boundary;
- admin upload, copy, signed-preview, and delete paths work under existing policies;
- RLS remains enabled for existing public tables;
- Category policies and grants remain unchanged and enforce the accepted roles; and
- no test relies on service-role credentials in browser code.

### 7.4 Lifecycle regression tests

- Stage-8 publish promotion still copies private article-owned images to public article-owned paths;
- update replacement preserves compensation and cleanup behavior;
- unpublish/archive demotion restores a private article-owned path;
- article delete rules remain correct;
- category changes refresh old/new topic routes as applicable;
- drafts and archived content never leak publicly; and
- published image metadata/SEO behavior remains correct.

### 7.5 Browser, accessibility, and responsive gates

- authenticated navigation reaches Categories and Media on desktop and mobile;
- create/edit/delete/reuse flows work with keyboard-only input;
- focus trap, Escape, and focus return work for Sheets/dialogs;
- visible focus, labels, names, status announcements, and destructive warnings pass representative accessibility checks;
- loading, empty, partial-error, validation-error, and success states render correctly;
- representative 390 px, 768 px, and 1440 px viewports have no horizontal overflow; and
- Evidence Folio visual conformance shows no redesign drift.

### 7.6 Complete regression gate

The closeout phase must run all repository quality gates available at implementation time, including focused tests, full Node/integration tests, database/RLS/Storage tests, typecheck, lint, formatting, `git diff --check`, production dependency review, production build, and targeted browser/accessibility/responsive verification. Local Supabase use must remain within the guarded project-local workflow. Any hosted operation remains separately owner-gated.

## 8. Implementation phases and authorization state

| Phase | Purpose | Authorization |
| --- | --- | --- |
| 1. Governance/design activation | Activate D035, insert the gate, freeze this design, and update status | **CURRENT / AUTHORIZED** |
| 2. Categories implementation | Implement `/admin/categories`, validation, security, revalidation, and focused tests | **NOT AUTHORIZED** |
| 3. Media implementation | Implement `/admin/media`, upload/preview/reuse/delete orchestration, integration, and focused tests | **NOT AUTHORIZED** |
| 4. Integration/full regression | Run lifecycle, security, browser, accessibility, responsive, and production gates; correct only in-scope verified defects | **NOT AUTHORIZED** |
| 5. Closeout/owner merge gate | Reconcile governance, prepare handoff, and request owner merge authorization | **NOT AUTHORIZED** |

Authorization for one future phase does not implicitly authorize a later phase, branch merge, hosted mutation, Stage 11, or Stage 12.

## 9. Explicit exclusions

The following are not part of this gate:

- generic digital asset management;
- folder-management product;
- bulk category reassignment;
- bulk asset operations;
- image editor, cropper, compression, transformation, or processing pipeline;
- AI tagging or AI alt generation;
- asset-global alt-text metadata;
- inline article images;
- PDF/document management;
- category slug history or redirects;
- a `public.media` table;
- new Category RPCs or schema changes;
- Storage bucket limits, MIME lists, or policy changes;
- dependency additions unless separately authorized;
- hosted Supabase migration or mutation;
- hosted Analytics activation;
- Search Console operations;
- final domain or DNS configuration;
- Stage 11 implementation; and
- Stage 12 launch/content work.

## 10. Gate completion definition

This gate is complete only when Categories and Media are functional for Marie; public topic discovery and the Stage-8 article-image lifecycle remain correct; anonymous and non-admin boundaries pass; referenced assets and categories cannot be deleted; complete regression, accessibility, responsive, security, and production-build gates pass; governance and handoff are reconciled; the approved implementation is merged and post-merge verified; and no known frozen V1 admin capability remains unimplemented.

Until the owner separately authorizes implementation, this document changes governance and design state only.
