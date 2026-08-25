-- Test Suite: 10_stage8_publishing_workflow.test.sql
-- Description: Comprehensive pgTAP test suite for Stage 8 Publishing Lifecycle Foundation (D030).
-- Covers publish_article, update_published_article, unpublish_article, archive_article,
-- restore_article, delete_article, single-path state machine, slug collision retry,
-- permanent slug freeze, immutable published_at timestamp, permalink delete protection,
-- reference atomicity, and anonymous public leak defense.

begin;
select plan(75);

-- ============================================================================
-- 1. Verify RPC Existence and SECURITY INVOKER Configuration
-- ============================================================================

-- 1-6. Functions exist
select has_function('public', 'publish_article', 'Function public.publish_article exists');
select has_function('public', 'update_published_article', 'Function public.update_published_article exists');
select has_function('public', 'unpublish_article', 'Function public.unpublish_article exists');
select has_function('public', 'archive_article', 'Function public.archive_article exists');
select has_function('public', 'restore_article', 'Function public.restore_article exists');
select has_function('public', 'delete_article', 'Function public.delete_article exists');

-- 7-12. Functions are SECURITY INVOKER (prosecdef = false)
select results_eq(
  $$select prosecdef from pg_proc where proname = 'publish_article' and pronamespace = 'public'::regnamespace$$,
  array[false],
  'Function public.publish_article is SECURITY INVOKER'
);

select results_eq(
  $$select prosecdef from pg_proc where proname = 'update_published_article' and pronamespace = 'public'::regnamespace$$,
  array[false],
  'Function public.update_published_article is SECURITY INVOKER'
);

select results_eq(
  $$select prosecdef from pg_proc where proname = 'unpublish_article' and pronamespace = 'public'::regnamespace$$,
  array[false],
  'Function public.unpublish_article is SECURITY INVOKER'
);

select results_eq(
  $$select prosecdef from pg_proc where proname = 'archive_article' and pronamespace = 'public'::regnamespace$$,
  array[false],
  'Function public.archive_article is SECURITY INVOKER'
);

select results_eq(
  $$select prosecdef from pg_proc where proname = 'restore_article' and pronamespace = 'public'::regnamespace$$,
  array[false],
  'Function public.restore_article is SECURITY INVOKER'
);

select results_eq(
  $$select prosecdef from pg_proc where proname = 'delete_article' and pronamespace = 'public'::regnamespace$$,
  array[false],
  'Function public.delete_article is SECURITY INVOKER'
);

-- ============================================================================
-- 2. Anonymous & Non-Admin Execution Denial
-- ============================================================================

-- Switch to anonymous role
set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';
set local "request.jwt.claim.sub" = '';

-- 13-18. Anonymous execution denied (SQLSTATE 42501)
select throws_ok(
  $$select * from public.publish_article('80000000-0000-0000-0000-000000000001'::uuid, 'test-slug', 'Test Title')$$,
  '42501',
  null,
  'Anon execution of publish_article is denied'
);

select throws_ok(
  $$select * from public.update_published_article('80000000-0000-0000-0000-000000000001'::uuid, 'Test Title')$$,
  '42501',
  null,
  'Anon execution of update_published_article is denied'
);

select throws_ok(
  $$select * from public.unpublish_article('80000000-0000-0000-0000-000000000001'::uuid)$$,
  '42501',
  null,
  'Anon execution of unpublish_article is denied'
);

select throws_ok(
  $$select * from public.archive_article('80000000-0000-0000-0000-000000000001'::uuid)$$,
  '42501',
  null,
  'Anon execution of archive_article is denied'
);

select throws_ok(
  $$select * from public.restore_article('80000000-0000-0000-0000-000000000001'::uuid)$$,
  '42501',
  null,
  'Anon execution of restore_article is denied'
);

select throws_ok(
  $$select * from public.delete_article('80000000-0000-0000-0000-000000000001'::uuid)$$,
  '42501',
  null,
  'Anon execution of delete_article is denied'
);

-- Switch to authenticated non-admin
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000002", "email": "synthetic-reader@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000002';

-- 19-24. Authenticated non-admin execution rejected (42501)
select throws_ok(
  $$select * from public.publish_article('80000000-0000-0000-0000-000000000001'::uuid, 'test-slug', 'Test Title')$$,
  '42501',
  null,
  'Non-admin execution of publish_article is rejected'
);

select throws_ok(
  $$select * from public.update_published_article('80000000-0000-0000-0000-000000000001'::uuid, 'Test Title')$$,
  '42501',
  null,
  'Non-admin execution of update_published_article is rejected'
);

select throws_ok(
  $$select * from public.unpublish_article('80000000-0000-0000-0000-000000000001'::uuid)$$,
  '42501',
  null,
  'Non-admin execution of unpublish_article is rejected'
);

select throws_ok(
  $$select * from public.archive_article('80000000-0000-0000-0000-000000000001'::uuid)$$,
  '42501',
  null,
  'Non-admin execution of archive_article is rejected'
);

select throws_ok(
  $$select * from public.restore_article('80000000-0000-0000-0000-000000000001'::uuid)$$,
  '42501',
  null,
  'Non-admin execution of restore_article is rejected'
);

select throws_ok(
  $$select * from public.delete_article('80000000-0000-0000-0000-000000000001'::uuid)$$,
  '42501',
  null,
  'Non-admin execution of delete_article is rejected'
);

-- ============================================================================
-- 3. Authenticated Admin Tests & Lifecycle Execution
-- ============================================================================

-- Switch to authenticated admin
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000001", "email": "synthetic-admin@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000001';

-- Setup test category
insert into public.categories (id, name, slug, description)
values ('80000000-0000-0000-0000-000000000099', 'Clinical Endocrinology', 'clinical-endocrinology', 'Hormonal science')
on conflict (id) do nothing;

-- Setup test draft article #1 via save_article_draft
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000001'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000001',
  p_title := 'Evidence-Based Thyroid Management',
  p_excerpt := 'A comprehensive clinical overview of thyroid hormone regulation.',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Thyroid hormones regulate metabolic rate."}]}]}'::jsonb,
  p_category_id := '80000000-0000-0000-0000-000000000099'::uuid,
  p_featured_image_path := 'articles/80000000-0000-0000-0000-000000000001/featured/draft-thyroid.png',
  p_featured_image_alt := 'Thyroid diagram',
  p_references := '[{"title": "Thyroid Guidelines", "source_name": "NEJM", "url": "https://nejm.org/example", "citation_details": "2026; 390:100-110"}]'::jsonb
);

-- 25. Publish article succeeds and sets status = 'published' and slug
select results_eq(
  $$select article_id, slug, status from public.publish_article(
      p_article_id := '80000000-0000-0000-0000-000000000001'::uuid,
      p_slug := 'evidence-based-thyroid-management',
      p_title := 'Evidence-Based Thyroid Management',
      p_excerpt := 'A comprehensive clinical overview of thyroid hormone regulation.',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Thyroid hormones regulate metabolic rate."}]}]}'::jsonb,
      p_category_id := '80000000-0000-0000-0000-000000000099'::uuid,
      p_featured_image_path := 'articles/80000000-0000-0000-0000-000000000001/featured/public-thyroid.png',
      p_featured_image_alt := 'Thyroid diagram',
      p_references := '[{"title": "Thyroid Guidelines", "source_name": "NEJM", "url": "https://nejm.org/example", "citation_details": "2026; 390:100-110"}]'::jsonb
    )$$,
  $$values ('80000000-0000-0000-0000-000000000001'::uuid, 'evidence-based-thyroid-management'::text, 'published'::text)$$,
  'publish_article successfully transitions draft to published'
);

-- 26. published_at is set to non-null on first publication
select ok(
  (select published_at is not null from public.articles where id = '80000000-0000-0000-0000-000000000001'),
  'published_at timestamp is populated on first publication'
);

-- 27. References persisted in deterministic order
select results_eq(
  $$select title, source_name, sort_order from public.article_references where article_id = '80000000-0000-0000-0000-000000000001' order by sort_order$$,
  $$values ('Thyroid Guidelines'::text, 'NEJM'::text, 0)$$,
  'References are persisted with deterministic sort_order'
);

-- 28. Reject publication with blank title
select throws_ok(
  $$select * from public.publish_article('80000000-0000-0000-0000-000000000001'::uuid, 'some-slug', '   ')$$,
  '23514',
  null,
  'publish_article rejects blank title'
);

-- 29. Reject publication with empty content document
select throws_ok(
  $$select * from public.publish_article('80000000-0000-0000-0000-000000000001'::uuid, 'some-slug', 'Title', null, '{"type": "doc", "content": []}'::jsonb)$$,
  '23514',
  null,
  'publish_article rejects empty document content'
);

-- 30. Reject publication with invalid content_json format
select throws_ok(
  $$select * from public.publish_article('80000000-0000-0000-0000-000000000001'::uuid, 'some-slug', 'Title', null, '{"type": "invalid"}'::jsonb)$$,
  '22023',
  null,
  'publish_article rejects non-doc content_json'
);

-- 31. Reject publication with featured image path but missing alt text
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000001'::uuid,
      'some-slug',
      'Title',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      null,
      'articles/80000000-0000-0000-0000-000000000001/featured/test.png',
      '   '
    )$$,
  '23514',
  null,
  'publish_article rejects image without alt text'
);

-- 32. Reject publication with featured image path belonging to another article
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000001'::uuid,
      'some-slug',
      'Title',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      null,
      'articles/99999999-0000-0000-0000-000000000001/featured/test.png',
      'Alt text'
    )$$,
  '22023',
  null,
  'publish_article rejects image path belonging to different article'
);

-- Setup draft article #2 for validation tests
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000002'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000002',
  p_title := 'Second Draft',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
);

-- 33. Reject publication with blank reference title
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000002'::uuid,
      'second-draft',
      'Second Draft',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      null,
      null,
      null,
      null,
      null,
      '[{"title": "   ", "source_name": "Journal"}]'::jsonb
    )$$,
  '23514',
  null,
  'publish_article rejects blank reference title'
);

-- 34. Reject publication with blank reference source_name
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000002'::uuid,
      'second-draft',
      'Second Draft',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      null,
      null,
      null,
      null,
      null,
      '[{"title": "Valid Title", "source_name": "  "}]'::jsonb
    )$$,
  '23514',
  null,
  'publish_article rejects blank reference source_name'
);

-- 35. Reject publication with non-http/https reference URL
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000002'::uuid,
      'second-draft',
      'Second Draft',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      null,
      null,
      null,
      null,
      null,
      '[{"title": "Valid Title", "source_name": "Journal", "url": "ftp://invalid.com"}]'::jsonb
    )$$,
  '23514',
  null,
  'publish_article rejects non-http reference URL'
);

-- 36. Reject publication with invalid category ID
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000002'::uuid,
      'second-draft',
      'Second Draft',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      '77777777-0000-0000-0000-000000000077'::uuid
    )$$,
  '23503',
  null,
  'publish_article rejects nonexistent category ID'
);

-- 37. Reject publication with system provisional UUID slug pattern
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000002'::uuid,
      'draft-80000000-0000-0000-0000-000000000002',
      'Second Draft',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
    )$$,
  '22023',
  null,
  'publish_article rejects system provisional UUID slug'
);

-- 38. Reject publication with malformed slug (uppercase or non-kebab)
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000002'::uuid,
      'Second_Draft_Title!',
      'Second Draft',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
    )$$,
  '23514',
  null,
  'publish_article rejects non-kebab-case slug'
);

-- Setup collision test articles
-- Article #1 already owns 'evidence-based-thyroid-management'
-- Setup draft #3 and publish with same candidate slug -> should allocate '-2'
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000003'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000003',
  p_title := 'Evidence-Based Thyroid Management',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
);

-- 39. Collision resolution: allocates '-2' suffix on collision
select results_eq(
  $$select slug from public.publish_article(
      p_article_id := '80000000-0000-0000-0000-000000000003'::uuid,
      p_slug := 'evidence-based-thyroid-management',
      p_title := 'Evidence-Based Thyroid Management',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      p_references := '[{"title": "Thyroid Reference", "source_name": "Lancet", "url": "https://thelancet.com/thyroid"}]'::jsonb
    )$$,
  array['evidence-based-thyroid-management-2'::text],
  'publish_article resolves first collision by allocating -2 suffix'
);

-- Setup draft #4 and publish with same candidate slug -> should allocate '-3'
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000004'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000004',
  p_title := 'Evidence-Based Thyroid Management',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
);

-- 40. Collision resolution: allocates '-3' suffix on subsequent collision
select results_eq(
  $$select slug from public.publish_article(
      p_article_id := '80000000-0000-0000-0000-000000000004'::uuid,
      p_slug := 'evidence-based-thyroid-management',
      p_title := 'Evidence-Based Thyroid Management',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
    )$$,
  array['evidence-based-thyroid-management-3'::text],
  'publish_article resolves second collision by allocating -3 suffix'
);

-- Setup draft #5 with exactly 80 character candidate slug and force collision
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000005'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000005',
  p_title := 'Long Title',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
);

-- First 80-char publish
select public.publish_article(
  p_article_id := '80000000-0000-0000-0000-000000000005'::uuid,
  p_slug := 'a123456789-b123456789-c123456789-d123456789-e123456789-f123456789-g123456789-h12',
  p_title := 'Long Title 1',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
);

-- Second 80-char publish with collision
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000006'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000006',
  p_title := 'Long Title 2',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
);

-- 41. Collision resolution truncates base dynamically to keep total length <= 80
select ok(
  (select char_length(slug) <= 80 and slug like '%-2' from public.publish_article(
      p_article_id := '80000000-0000-0000-0000-000000000006'::uuid,
      p_slug := 'a123456789-b123456789-c123456789-d123456789-e123456789-f123456789-g123456789-h12',
      p_title := 'Long Title 2',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
  )),
  'publish_article collision truncation guarantees total slug length <= 80'
);

-- 42. publish_article rejects already-published article
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000001'::uuid,
      'evidence-based-thyroid-management',
      'Evidence-Based Thyroid Management',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
    )$$,
  '22023',
  null,
  'publish_article rejects already-published source status'
);

-- Setup an archived article
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000007'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000007',
  p_title := 'Archived Draft',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
);
select public.archive_article('80000000-0000-0000-0000-000000000007'::uuid);

-- 43. publish_article rejects direct archived -> published transition
select throws_ok(
  $$select * from public.publish_article(
      '80000000-0000-0000-0000-000000000007'::uuid,
      'archived-draft',
      'Archived Draft',
      null,
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
    )$$,
  '22023',
  null,
  'publish_article rejects archived source status (single-path lifecycle)'
);

-- ============================================================================
-- 4. Published Article Updates
-- ============================================================================

-- Capture initial timestamps on article #1 in a temp table
create temp table temp_initial_pub as
select id as article_id, slug, published_at from public.articles where id = '80000000-0000-0000-0000-000000000001';

-- 44. update_published_article updates content and references
select results_eq(
  $$select article_id, status from public.update_published_article(
      p_article_id := '80000000-0000-0000-0000-000000000001'::uuid,
      p_title := 'Updated Thyroid Management 2026',
      p_excerpt := 'Updated clinical guidelines.',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Updated content"}]}]}'::jsonb,
      p_category_id := '80000000-0000-0000-0000-000000000099'::uuid,
      p_featured_image_path := 'articles/80000000-0000-0000-0000-000000000001/featured/updated.png',
      p_featured_image_alt := 'Updated alt',
      p_references := '[{"title": "Updated Guideline", "source_name": "Lancet", "url": "https://thelancet.com/article"}]'::jsonb
    )$$,
  $$values ('80000000-0000-0000-0000-000000000001'::uuid, 'published'::text)$$,
  'update_published_article updates published article successfully'
);

-- 45. update_published_article strictly preserves existing slug and published_at
select ok(
  (select a.slug = t.slug and a.published_at = t.published_at
   from public.articles a
   join temp_initial_pub t on t.article_id = a.id
   where a.id = '80000000-0000-0000-0000-000000000001'),
  'update_published_article preserves canonical slug and published_at'
);

-- 46. update_published_article reference validation failure rolls back
select throws_ok(
  $$select * from public.update_published_article(
      p_article_id := '80000000-0000-0000-0000-000000000001'::uuid,
      p_title := 'Bad Reference Title',
      p_references := '[{"title": "   ", "source_name": "Journal"}]'::jsonb
    )$$,
  '23514',
  null,
  'update_published_article rolls back on invalid reference title'
);

-- 47. update_published_article fails on draft article
select throws_ok(
  $$select * from public.update_published_article(
      p_article_id := '80000000-0000-0000-0000-000000000002'::uuid,
      p_title := 'Attempting to update draft',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
    )$$,
  '22023',
  null,
  'update_published_article fails on draft article'
);

-- 48. update_published_article fails on archived article
select throws_ok(
  $$select * from public.update_published_article(
      p_article_id := '80000000-0000-0000-0000-000000000007'::uuid,
      p_title := 'Attempting to update archived',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
    )$$,
  '22023',
  null,
  'update_published_article fails on archived article'
);

-- ============================================================================
-- 5. Unpublishing & Republishing
-- ============================================================================

-- 49. unpublish_article succeeds on published article
select results_eq(
  $$select article_id, status from public.unpublish_article(
      p_article_id := '80000000-0000-0000-0000-000000000001'::uuid,
      p_private_image_path := 'articles/80000000-0000-0000-0000-000000000001/featured/demoted-thyroid.png'
    )$$,
  $$values ('80000000-0000-0000-0000-000000000001'::uuid, 'draft'::text)$$,
  'unpublish_article transitions published article to draft'
);

-- 50. unpublish_article preserves slug and published_at
select ok(
  (select a.slug = t.slug and a.published_at = t.published_at and a.featured_image_path = 'articles/80000000-0000-0000-0000-000000000001/featured/demoted-thyroid.png'
   from public.articles a
   join temp_initial_pub t on t.article_id = a.id
   where a.id = '80000000-0000-0000-0000-000000000001'),
  'unpublish_article preserves canonical slug, published_at, and sets private image path'
);

-- Setup published article #8 with image
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000008'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000008',
  p_title := 'Image Demotion Test',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
  p_featured_image_path := 'articles/80000000-0000-0000-0000-000000000008/featured/draft.png',
  p_featured_image_alt := 'Alt text'
);
select public.publish_article(
  p_article_id := '80000000-0000-0000-0000-000000000008'::uuid,
  p_slug := 'image-demotion-test',
  p_title := 'Image Demotion Test',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
  p_featured_image_path := 'articles/80000000-0000-0000-0000-000000000008/featured/public.png',
  p_featured_image_alt := 'Alt text'
);

-- 51. unpublish_article requires private destination path when article has featured image
select throws_ok(
  $$select * from public.unpublish_article('80000000-0000-0000-0000-000000000008'::uuid, null)$$,
  '23514',
  null,
  'unpublish_article requires private image path when image exists'
);

-- 52. unpublish_article rejects private path belonging to wrong article
select throws_ok(
  $$select * from public.unpublish_article('80000000-0000-0000-0000-000000000008'::uuid, 'articles/99999999-0000-0000-0000-000000000008/featured/demoted.png')$$,
  '22023',
  null,
  'unpublish_article rejects mismatched private image path'
);

-- 53. unpublish_article rejects non-published source
select throws_ok(
  $$select * from public.unpublish_article('80000000-0000-0000-0000-000000000002'::uuid)$$,
  '22023',
  null,
  'unpublish_article rejects non-published source'
);

-- 54. Republishing article #1 preserves original slug and published_at
select results_eq(
  $$select slug, status from public.publish_article(
      p_article_id := '80000000-0000-0000-0000-000000000001'::uuid,
      p_slug := 'evidence-based-thyroid-management',
      p_title := 'Evidence-Based Thyroid Management (Republished)',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      p_featured_image_path := 'articles/80000000-0000-0000-0000-000000000001/featured/republished.png',
      p_featured_image_alt := 'Alt text'
    )$$,
  $$values ('evidence-based-thyroid-management'::text, 'published'::text)$$,
  'Republishing article preserves original slug and published status'
);

-- 55. Republishing rejects caller attempting to change canonical slug
select public.unpublish_article(
  p_article_id := '80000000-0000-0000-0000-000000000001'::uuid,
  p_private_image_path := 'articles/80000000-0000-0000-0000-000000000001/featured/demoted.png'
);

select throws_ok(
  $$select * from public.publish_article(
      p_article_id := '80000000-0000-0000-0000-000000000001'::uuid,
      p_slug := 'new-slug-attempt',
      p_title := 'Title',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
    )$$,
  '22023',
  null,
  'publish_article rejects slug mutation during republish'
);

-- ============================================================================
-- 6. Archiving & Restoring
-- ============================================================================

-- 56. archive_article from published succeeds and demotes image
select results_eq(
  $$select article_id, status from public.archive_article(
      p_article_id := '80000000-0000-0000-0000-000000000008'::uuid,
      p_private_image_path := 'articles/80000000-0000-0000-0000-000000000008/featured/archived.png'
    )$$,
  $$values ('80000000-0000-0000-0000-000000000008'::uuid, 'archived'::text)$$,
  'archive_article transitions published article to archived'
);

-- 57. archive_article from draft succeeds and preserves draft image path
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000009'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000009',
  p_title := 'Draft for Archive',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
  p_featured_image_path := 'articles/80000000-0000-0000-0000-000000000009/featured/draft-img.png',
  p_featured_image_alt := 'Alt text'
);

select public.archive_article('80000000-0000-0000-0000-000000000009'::uuid);

select results_eq(
  $$select status, featured_image_path from public.articles where id = '80000000-0000-0000-0000-000000000009'$$,
  $$values ('archived'::text, 'articles/80000000-0000-0000-0000-000000000009/featured/draft-img.png'::text)$$,
  'archive_article transitions draft to archived and preserves draft image path'
);

-- 58. archive_article preserves slug and published_at on article #8
select ok(
  (select slug = 'image-demotion-test' and published_at is not null from public.articles where id = '80000000-0000-0000-0000-000000000008'),
  'archive_article preserves canonical slug and published_at'
);

-- 59. archive_article rejects non-draft/published source (already archived)
select throws_ok(
  $$select * from public.archive_article('80000000-0000-0000-0000-000000000008'::uuid)$$,
  '22023',
  null,
  'archive_article rejects already-archived article'
);

-- 60. restore_article from archived succeeds
select results_eq(
  $$select article_id, status from public.restore_article('80000000-0000-0000-0000-000000000008'::uuid)$$,
  $$values ('80000000-0000-0000-0000-000000000008'::uuid, 'draft'::text)$$,
  'restore_article transitions archived article to draft'
);

-- 61. restore_article preserves slug, published_at, and image path
select ok(
  (select slug = 'image-demotion-test' and published_at is not null and featured_image_path is not null from public.articles where id = '80000000-0000-0000-0000-000000000008'),
  'restore_article preserves slug, published_at, and image path'
);

-- 62. restore_article fails on published article
select throws_ok(
  $$select * from public.restore_article('80000000-0000-0000-0000-000000000003'::uuid)$$,
  '22023',
  null,
  'restore_article fails on published article'
);

-- 63. restore_article fails on draft article
select throws_ok(
  $$select * from public.restore_article('80000000-0000-0000-0000-000000000002'::uuid)$$,
  '22023',
  null,
  'restore_article fails on draft article'
);

-- 64. Restored draft can subsequently be published
select results_eq(
  $$select status, slug from public.publish_article(
      p_article_id := '80000000-0000-0000-0000-000000000008'::uuid,
      p_slug := 'image-demotion-test',
      p_title := 'Image Demotion Restored and Published',
      p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      p_featured_image_path := 'articles/80000000-0000-0000-0000-000000000008/featured/public2.png',
      p_featured_image_alt := 'Alt text'
    )$$,
  $$values ('published'::text, 'image-demotion-test'::text)$$,
  'Restored draft can be published via publish_article'
);

-- ============================================================================
-- 7. Deletion Governance & Safety
-- ============================================================================

-- Setup a never-published draft #10
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000010'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000010',
  p_title := 'Disposable Draft',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
  p_references := '[{"title": "Ref 1", "source_name": "Journal 1"}]'::jsonb
);

-- 65. delete_article succeeds on never-published draft
select results_eq(
  $$select deleted from public.delete_article('80000000-0000-0000-0000-000000000010'::uuid)$$,
  array[true],
  'delete_article succeeds on never-published draft'
);

-- 66. delete_article cascaded reference deletion
select is_empty(
  $$select * from public.article_references where article_id = '80000000-0000-0000-0000-000000000010'$$,
  'delete_article cascades reference deletion'
);

-- Setup a never-published archived article #11
select public.save_article_draft(
  p_article_id := '80000000-0000-0000-0000-000000000011'::uuid,
  p_provisional_slug := 'draft-80000000-0000-0000-0000-000000000011',
  p_title := 'Never Published Archived',
  p_content_json := '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb
);
select public.archive_article('80000000-0000-0000-0000-000000000011'::uuid);

-- 67. delete_article succeeds on never-published archived article
select results_eq(
  $$select deleted from public.delete_article('80000000-0000-0000-0000-000000000011'::uuid)$$,
  array[true],
  'delete_article succeeds on never-published archived article'
);

-- 68. delete_article fails on live published article #3
select throws_ok(
  $$select * from public.delete_article('80000000-0000-0000-0000-000000000003'::uuid)$$,
  '22023',
  null,
  'delete_article rejects live published article'
);

-- 69. delete_article fails on ever-published draft article #1 (unpublished)
select throws_ok(
  $$select * from public.delete_article('80000000-0000-0000-0000-000000000001'::uuid)$$,
  '22023',
  null,
  'delete_article rejects ever-published draft article'
);

-- Setup ever-published archived article #8
select public.archive_article(
  p_article_id := '80000000-0000-0000-0000-000000000008'::uuid,
  p_private_image_path := 'articles/80000000-0000-0000-0000-000000000008/featured/archived.png'
);

-- 70. delete_article fails on ever-published archived article #8
select throws_ok(
  $$select * from public.delete_article('80000000-0000-0000-0000-000000000008'::uuid)$$,
  '22023',
  null,
  'delete_article rejects ever-published archived article'
);

-- ============================================================================
-- 8. Anonymous Public Leak & RLS Regressions
-- ============================================================================

-- Switch to anonymous role
set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';
set local "request.jwt.claim.sub" = '';

-- 71. Anon can select published articles
select ok(
  exists (select 1 from public.articles where id = '80000000-0000-0000-0000-000000000003' and status = 'published'),
  'Anon can view published articles'
);

-- 72. Anon cannot select draft articles (article #1 is draft)
select ok(
  not exists (select 1 from public.articles where id = '80000000-0000-0000-0000-000000000001'),
  'Anon cannot view draft articles'
);

-- 73. Anon cannot select archived articles (article #8 is archived)
select ok(
  not exists (select 1 from public.articles where id = '80000000-0000-0000-0000-000000000008'),
  'Anon cannot view archived articles'
);

-- 74. Anon can select references for published articles
select ok(
  exists (select 1 from public.article_references where article_id = '80000000-0000-0000-0000-000000000003'),
  'Anon can view references for published articles'
);

-- 75. Anon cannot select references for draft or archived articles
select is_empty(
  $$select * from public.article_references where article_id in ('80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000008')$$,
  'Anon cannot view references for draft or archived articles'
);

select * from finish();
rollback;
