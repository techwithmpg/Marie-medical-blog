# Stage 7 — Writer Dashboard & Tiptap Editor Handoff

## Stage metadata

- **Stage:** Stage 7 — Writer Dashboard & Tiptap Editor
- **Final Status:** COMPLETE / LOCAL + HOSTED GATE PASS / READY FOR OWNER MERGE APPROVAL
- **Canonical Base:** `927412a054ccf15bbb1caa23a54a48d761731a04`
- **Approved Active Branch:** `stage/07-writer-dashboard-editor`
- **Current Approved Branch Head:** `0d9b93b9bc264763ccfc6135afcfb3b6838d3b60`

### Implementation and Governance Commit Provenance

1. **Stage Authorization & Pre-Implementation Design Freeze:** `05f4bf880b06b83f3e1b089c20aa0f5926ec00ae`
2. **Phase 7A Core Editor & Tiptap Toolbar Implementation:** `a711ba5a9d20c563e414986420fa26f6345ec7ca`
3. **Phase 7B Drafting State, Persistence & Navigation:** `ebaa7df825b42db629088669527f547c87c0505b`
4. **Phase 7C Editorial Polish & Visual Review Integration:** `ef569327d384f69076581e6351d346fac529e580`
5. **Phase 7 External Review Correction:** `4d8c648f98716de638f5b6c1dbad7eabf3af3fec`
6. **Phase 7 Final Persistence Micro-Correction:** `69d5aede201e780af98f946e949827113c948483`
7. **Local Gate Handoff & Pre-Deployment Freeze:** `5964899ba6bd0fe291b116f94609a6d6071e2c1a`
8. **Owner Hosted Deployment Authorization (D029):** `7c4a1739a13fa0c574e07f49ca02157091c29b6d`
9. **D029 Replacement Addendum & Status Alignment:** `2a654e232c025adc7b55aa371126250ebab8739c`
10. **Final Migration Authorization & Transport Proof:** `0d9b93b9bc264763ccfc6135afcfb3b6838d3b60`

---

## 1. Objective Completed

Delivered the complete private administrative draft authoring, Tiptap rich text editing, structured reference management, private image handling, and atomic database persistence system for Marie Medical Blog under the Evidence Folio design system:

- **Editorial Article Workspace (`/admin/articles`):** Articles management index featuring live statistics cards, status filtering pills, search filter, responsive data table with folio styling, status badges, publication dates, and direct edit/preview action triggers.
- **Dedicated Draft Authoring Workspace (`/admin/articles/new` & `/admin/articles/[id]`):** Complete Evidence Folio split-pane drafting environment featuring distraction-free metadata sidebar, title, excerpt, category selection, private featured image uploader with real-time signed preview generation, structured Reference Ledger editor with live reordering, SEO metadata inputs, and word/character counters.
- **Tiptap ProseMirror Rich Text Editor:** Fully customized Tiptap editor matching Evidence Folio long-form typography, floating and bubble formatting toolbars (H2, H3, bold, italic, bullet list, ordered list, blockquote, horizontal rule, code block, internal/external links), and custom character/word count integrations.
- **Read-Only Draft Preview Modal:** Authentic full-fidelity Evidence Folio reading preview rendering the drafted ProseMirror document tree, structured references, and metadata side-by-side with zero draft data leakage to public endpoints.
- **Atomic Draft Persistence RPC (`public.save_article_draft`):** Transactional database RPC ensuring atomic draft creation, update, and reference replacement with strict `private.is_admin()` gate, parameter validation, and provisional slug consistency.
- **Private Draft Storage (`draft-assets`):** Dedicated private Supabase storage bucket with administrator-only RLS policies for unpromoted draft assets, preventing public access until explicit Stage-8 publication.

---

## 2. Database Changes & Hosted Deployment

### Migration Record
- **Hosted Migration Version:** `20260825200129` (`stage7_draft_authoring_foundation`)
- **Local Reconciled File:** `supabase/migrations/20260825200129_stage7_draft_authoring_foundation.sql`
- **Migration SHA-256:** `7c81d861a5288d17b4ea2748c9b3ab1e95bfcf768a3d32ed8540d7252ecb5343` (byte-for-byte preserved)
- **Target Project:** `eoexnnhqzrkurbqgbtnx` (Marie Medical Blog)

### Database Objects Deployed
1. **Private Storage Bucket (`draft-assets`):**
   - `id`: `draft-assets`
   - `public`: `false`
   - `file_size_limit`: `5242880` (5MB)
   - `allowed_mime_types`: `['image/jpeg', 'image/png', 'image/webp', 'image/avif']`
   - Storage RLS Policies: `SELECT`, `INSERT`, `UPDATE`, `DELETE` restricted to `authenticated` users where `private.is_admin() = true`.
2. **Atomic Persistence RPC (`public.save_article_draft`):**
   - Security: `SECURITY INVOKER` (`prosecdef = false`)
   - Search Path: `set search_path = ''` (locked safe search path)
   - Permissions: `REVOKE ALL ON FUNCTION public.save_article_draft FROM public, anon;` / `GRANT EXECUTE ON FUNCTION public.save_article_draft TO authenticated;`
   - Authorization: Enforces `if not coalesce(private.is_admin(), false) then raise exception ...`
   - Validation: Strict title presence, ProseMirror doc type verification, array structure check, article-scoped featured image path validation, and strict JSON reference key enforcement (`title`, `source_name`, `url`, `citation_details`).

---

## 3. Hosted Verification & Security Results

### Hosted Security Matrix
- **Anonymous RPC Denial:** Anonymous invocation of `save_article_draft` is rejected with SQLSTATE `42501` (`permission denied for function save_article_draft`).
- **Anonymous Storage Denial:** Anonymous listing or fetching from `draft-assets` returns `HTTP 400/403` (Access Denied).
- **Public Route Isolation:** Draft articles and provisional slugs (`draft-<UUID>`) return `404 Not Found` across `/blog`, `/blog/[slug]`, `/topics/[slug]`, homepage feeds, and portfolio listings.
- **Zero Public Leakage:** Anonymous queries against `public.articles` and `storage.objects` return 0 rows for draft content.

### Synthetic Draft Persistence Verification
- **Article ID:** `70000000-0000-0000-0000-000000000001`
- **Initial State:** Zero rows existed prior to explicit save action.
- **First Save:** Created exactly one draft record (`status: draft`, `slug: draft-70000000-0000-0000-0000-000000000001`, `published_at: null`, `is_featured: false`, `is_portfolio_featured: false`, 2 structured references).
- **Second Save / Duplicate Regression:** Updated existing record in place without generating duplicate rows. `updated_at` updated, reference ordering persisted deterministically.
- **Private Featured Image:** Asset persisted at `articles/70000000-0000-0000-0000-000000000001/featured/synthetic-image.png` in `draft-assets` only. 0 items created in `public-assets`.
- **Synthetic Data Retention:** Exactly one synthetic draft and private image remains in the hosted database under D029 for controlled cleanup in Stage 8.

---

## 4. Local Quality Gates

- **Database Reset:** `npx supabase db reset` completed with zero errors on branch `stage/07-writer-dashboard-editor`.
- **pgTAP Test Suite:** `npx supabase test db` (9 files, 124 tests, 0 failures, 100% pass).
- **TypeScript Typecheck:** `npm run typecheck` (`tsc --noEmit`) passed with 0 errors.
- **ESLint:** `npm run lint` passed with 0 warnings/errors.
- **Prettier:** `npm run format:check` passed with 100% compliant formatting.
- **Production Build:** `npm run build` (`next build`) succeeded with optimized static and dynamic route generation.
- **Git Diff Hygiene:** `git diff --check` passed with 0 whitespace or conflict errors.

---

## 5. Next Stage Readiness

- **Current Stage Status:** Stage 7 — Writer Dashboard & Tiptap Editor is **COMPLETE** and **VERIFIED**.
- **Stage 8 Status:** Stage 8 — Publishing Workflow remains **NOT AUTHORIZED**.
- **Merge Status:** **READY FOR OWNER MERGE APPROVAL**. No merge into `main` has occurred.
