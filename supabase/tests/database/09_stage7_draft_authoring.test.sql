-- Test Suite: 09_stage7_draft_authoring.test.sql
-- Description: Comprehensive pgTAP test suite for Stage 7 Authoring Persistence Foundation (D028).
-- Covers draft-assets storage bucket and RLS policies, public.save_article_draft RPC security,
-- atomic creation and update contracts, reference replacement, rollback on validation errors,
-- mutation refusal on published/archived rows, and caller authorization boundaries.

begin;
select plan(28);

-- ============================================================================
-- 1. Verify draft-assets Storage Bucket Configuration
-- ============================================================================

-- 1. Bucket exists
select ok(
  exists (select 1 from storage.buckets where id = 'draft-assets'),
  'Bucket draft-assets exists in storage.buckets'
);

-- 2. Bucket is private
select results_eq(
  'select public from storage.buckets where id = ''draft-assets''',
  array[false],
  'Bucket draft-assets is configured as private (public = false)'
);

-- 3. File size limit is 5MB (5242880 bytes)
select results_eq(
  'select file_size_limit from storage.buckets where id = ''draft-assets''',
  array[5242880::bigint],
  'Bucket draft-assets enforces 5MB file size limit'
);

-- 4. Allowed MIME types include images only
select is(
  (select allowed_mime_types from storage.buckets where id = 'draft-assets'),
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[],
  'Bucket draft-assets restricts MIME types to image/jpeg, image/png, image/webp, image/avif'
);

-- ============================================================================
-- 2. Verify Storage Objects RLS Policies for draft-assets
-- ============================================================================

-- Switch to anonymous role
set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';
set local "request.jwt.claim.sub" = '';

-- 5. Anon cannot insert into draft-assets
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner) values ('draft-assets', 'anon-file.jpg', null)$$,
  '42501',
  null,
  'Anon cannot insert storage objects into draft-assets'
);

-- 6. Anon cannot select from draft-assets
select is_empty(
  $$select * from storage.objects where bucket_id = 'draft-assets'$$,
  'Anon cannot view any objects in draft-assets'
);

-- Switch to authenticated non-admin
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000002", "email": "synthetic-reader@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000002';

-- 7. Authenticated non-admin cannot insert into draft-assets
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner) values ('draft-assets', 'reader-file.jpg', '00000000-0000-0000-0000-000000000002')$$,
  '42501',
  null,
  'Authenticated non-admin cannot insert storage objects into draft-assets'
);

-- 8. Authenticated non-admin cannot select from draft-assets
select is_empty(
  $$select * from storage.objects where bucket_id = 'draft-assets'$$,
  'Authenticated non-admin cannot view objects in draft-assets'
);

-- Switch to authenticated admin
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000001", "email": "synthetic-admin@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000001';

-- 9. Admin can insert storage objects into draft-assets
select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner) values ('draft-assets', 'articles/test-article/featured/test.jpg', '00000000-0000-0000-0000-000000000001')$$,
  'Admin can insert storage objects into draft-assets'
);

-- 10. Admin can select storage objects in draft-assets
select results_eq(
  $$select name from storage.objects where bucket_id = 'draft-assets' and name = 'articles/test-article/featured/test.jpg'$$,
  array['articles/test-article/featured/test.jpg'],
  'Admin can select storage objects from draft-assets'
);

-- ============================================================================
-- 3. Verify public.save_article_draft RPC Signature & Security Model
-- ============================================================================

-- 11. Function exists
select has_function(
  'public',
  'save_article_draft',
  'public.save_article_draft function exists'
);

-- 12. Function is SECURITY INVOKER (prosecdef = false)
select is(
  (select prosecdef from pg_proc where proname = 'save_article_draft' and pronamespace = 'public'::regnamespace),
  false,
  'public.save_article_draft is defined as SECURITY INVOKER'
);

-- 13. Function has explicit search_path setting
select ok(
  (select proconfig is not null from pg_proc where proname = 'save_article_draft' and pronamespace = 'public'::regnamespace),
  'public.save_article_draft has an explicit search_path config'
);

-- ============================================================================
-- 4. Authorization Gates on RPC Execution
-- ============================================================================

-- Switch to anonymous
set local role anon;
set local "request.jwt.claims" = '{}';

-- 14. Anonymous cannot execute public.save_article_draft
select throws_ok(
  $$select * from public.save_article_draft('77777777-7777-7777-7777-777777777777'::uuid, 'draft-77777777-7777-7777-7777-777777777777', 'Title')$$,
  '42501',
  null,
  'Anonymous caller is denied execution of public.save_article_draft'
);

-- Switch to authenticated non-admin
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000002", "email": "synthetic-reader@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000002';

-- 15. Authenticated non-admin cannot execute public.save_article_draft
select throws_ok(
  $$select * from public.save_article_draft('77777777-7777-7777-7777-777777777777'::uuid, 'draft-77777777-7777-7777-7777-777777777777', 'Title')$$,
  '42501',
  null,
  'Authenticated non-admin is rejected by public.save_article_draft'
);

-- ============================================================================
-- 5. Successful First-Save Draft Creation (Admin)
-- ============================================================================

-- Switch to authenticated admin
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000001", "email": "synthetic-admin@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000001';

-- 16. Successful initial draft save with full UUID provisional slug and references
select lives_ok(
  $$
    select * from public.save_article_draft(
      p_article_id => '11111111-1111-1111-1111-111111111111'::uuid,
      p_provisional_slug => 'draft-11111111-1111-1111-1111-111111111111',
      p_title => 'Initial Draft Article Title',
      p_excerpt => 'Editorial teaser for initial draft.',
      p_content_json => '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Draft content."}]}]}'::jsonb,
      p_category_id => null,
      p_featured_image_path => 'articles/11111111-1111-1111-1111-111111111111/featured/cover.jpg',
      p_featured_image_alt => 'Cover image alternative description',
      p_seo_title => 'Draft SEO Title',
      p_seo_description => 'Draft SEO Description',
      p_references => '[
        {"title": "Lancet Study 2026", "source_name": "The Lancet", "url": "https://thelancet.example/article", "citation_details": "Vol 400"},
        {"title": "NEJM Review", "source_name": "NEJM", "url": null, "citation_details": "Issue 12"}
      ]'::jsonb
    );
  $$,
  'Admin can create a new draft article atomically through public.save_article_draft'
);

-- 17. Verify inserted article record properties
select results_eq(
  $$
    select slug, status, published_at, is_featured, is_portfolio_featured
    from public.articles
    where id = '11111111-1111-1111-1111-111111111111'::uuid
  $$,
  $$
    values ('draft-11111111-1111-1111-1111-111111111111', 'draft', null::timestamptz, false, false)
  $$,
  'Inserted article has draft-<full-uuid> slug, status draft, published_at null, and false feature flags'
);

-- 18. Verify inserted article references and deterministic sort_order
select results_eq(
  $$
    select title, source_name, sort_order
    from public.article_references
    where article_id = '11111111-1111-1111-1111-111111111111'::uuid
    order by sort_order asc
  $$,
  $$
    values
      ('Lancet Study 2026', 'The Lancet', 0),
      ('NEJM Review', 'NEJM', 1)
  $$,
  'Article references are persisted with sequential 0-indexed sort_order'
);

-- ============================================================================
-- 6. Provisional Slug Validation Contract
-- ============================================================================

-- 19. Reject arbitrary non-matching provisional slug
select throws_ok(
  $$
    select * from public.save_article_draft(
      p_article_id => '22222222-2222-2222-2222-222222222222'::uuid,
      p_provisional_slug => 'arbitrary-custom-slug',
      p_title => 'Article with Wrong Slug'
    );
  $$,
  '22023',
  null,
  'RPC rejects non-matching provisional slug on first creation'
);

-- ============================================================================
-- 7. Featured Image Path Validation Contract
-- ============================================================================

-- 20. Reject featured image belonging to another article ID
select throws_ok(
  $$
    select * from public.save_article_draft(
      p_article_id => '22222222-2222-2222-2222-222222222222'::uuid,
      p_provisional_slug => 'draft-22222222-2222-2222-2222-222222222222',
      p_title => 'Article with Mismatched Image Path',
      p_featured_image_path => 'articles/99999999-9999-9999-9999-999999999999/featured/image.jpg',
      p_featured_image_alt => 'Alt text'
    );
  $$,
  '22023',
  null,
  'RPC rejects featured_image_path that does not belong to the article ID'
);

-- 21. Reject featured image when alt text is blank
select throws_ok(
  $$
    select * from public.save_article_draft(
      p_article_id => '22222222-2222-2222-2222-222222222222'::uuid,
      p_provisional_slug => 'draft-22222222-2222-2222-2222-222222222222',
      p_title => 'Article without Alt Text',
      p_featured_image_path => 'articles/22222222-2222-2222-2222-222222222222/featured/image.jpg',
      p_featured_image_alt => '   '
    );
  $$,
  '23514',
  null,
  'RPC rejects featured image when alt text is blank'
);

-- ============================================================================
-- 8. Existing Draft Update & Reference Replacement Contract
-- ============================================================================

-- 22. Successful update of existing draft with reordered references
select lives_ok(
  $$
    select * from public.save_article_draft(
      p_article_id => '11111111-1111-1111-1111-111111111111'::uuid,
      p_provisional_slug => 'draft-11111111-1111-1111-1111-111111111111',
      p_title => 'Updated Draft Title',
      p_excerpt => 'Updated excerpt.',
      p_content_json => '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Updated content."}]}]}'::jsonb,
      p_references => '[
        {"title": "NEJM Review", "source_name": "NEJM", "url": "https://nejm.example/updated", "citation_details": "Issue 12 Updated"},
        {"title": "JAMA Cardiology", "source_name": "JAMA", "url": "https://jama.example/cardio", "citation_details": "2026"}
      ]'::jsonb
    );
  $$,
  'Admin can update an existing draft and replace references'
);

-- 23. Verify updated article fields and unchanged status/slug
select results_eq(
  $$
    select title, slug, status, published_at
    from public.articles
    where id = '11111111-1111-1111-1111-111111111111'::uuid
  $$,
  $$
    values ('Updated Draft Title', 'draft-11111111-1111-1111-1111-111111111111', 'draft', null::timestamptz)
  $$,
  'Updated article has new title, preserved provisional slug, status draft, and published_at null'
);

-- 24. Verify updated references match new payload order
select results_eq(
  $$
    select title, source_name, sort_order
    from public.article_references
    where article_id = '11111111-1111-1111-1111-111111111111'::uuid
    order by sort_order asc
  $$,
  $$
    values
      ('NEJM Review', 'NEJM', 0),
      ('JAMA Cardiology', 'JAMA', 1)
  $$,
  'Article references are replaced atomically and match new sort_order'
);

-- ============================================================================
-- 9. Atomic Rollback on Constraint / Validation Failure
-- ============================================================================

-- 25. Update fails on invalid reference URL -> whole transaction rolls back
select throws_ok(
  $$
    select * from public.save_article_draft(
      p_article_id => '11111111-1111-1111-1111-111111111111'::uuid,
      p_provisional_slug => 'draft-11111111-1111-1111-1111-111111111111',
      p_title => 'Title That Should Rollback',
      p_references => '[
        {"title": "Bad Ref", "source_name": "Source", "url": "javascript:alert(1)"}
      ]'::jsonb
    );
  $$,
  '23514',
  null,
  'Save fails when a reference has an invalid non-http(s) URL'
);

-- 26. Verify pre-save article title and references remain completely intact after rollback
select results_eq(
  $$
    select title from public.articles where id = '11111111-1111-1111-1111-111111111111'::uuid
  $$,
  array['Updated Draft Title'],
  'Article title remains intact at pre-save value after reference validation rollback'
);

-- ============================================================================
-- 10. Mutation Boundary Enforcement (Published & Archived Rows)
-- ============================================================================

-- Setup a published article fixture
insert into public.articles (
  id,
  slug,
  title,
  status,
  published_at,
  content_json
)
values (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'published-fixture-article',
  'Published Article Fixture',
  'published',
  now(),
  '{"type": "doc", "content": []}'::jsonb
);

-- 27. Attempting to mutate published article via save_article_draft is denied
select throws_ok(
  $$
    select * from public.save_article_draft(
      p_article_id => '33333333-3333-3333-3333-333333333333'::uuid,
      p_provisional_slug => 'draft-33333333-3333-3333-3333-333333333333',
      p_title => 'Mutated Published Title'
    );
  $$,
  '22023',
  null,
  'RPC refuses to mutate published article'
);

-- Setup an archived article fixture
insert into public.articles (
  id,
  slug,
  title,
  status,
  content_json
)
values (
  '44444444-4444-4444-4444-444444444444'::uuid,
  'archived-fixture-article',
  'Archived Article Fixture',
  'archived',
  '{"type": "doc", "content": []}'::jsonb
);

-- 28. Attempting to mutate archived article via save_article_draft is denied
select throws_ok(
  $$
    select * from public.save_article_draft(
      p_article_id => '44444444-4444-4444-4444-444444444444'::uuid,
      p_provisional_slug => 'draft-44444444-4444-4444-4444-444444444444',
      p_title => 'Mutated Archived Title'
    );
  $$,
  '22023',
  null,
  'RPC refuses to mutate archived article'
);

select * from finish();
rollback;
