BEGIN;
SELECT plan(113);

-- ============================================================================
-- Test Suite 11: Stage 9 Comments, Contact Inbox & Settings Security
-- Architecture: Approved Decision D032
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Setup Synthetic Test Fixtures (Strictly Neutral Fixtures)
-- ----------------------------------------------------------------------------

INSERT INTO public.categories (id, name, slug)
VALUES ('99999999-9999-9999-9999-999999999999', 'Synthetic Category', 'synthetic-category')
ON CONFLICT (id) DO NOTHING;

-- Published article 1
INSERT INTO public.articles (id, title, slug, excerpt, content_json, status, published_at, category_id)
VALUES (
  '90000000-0000-0000-0000-000000000001',
  'Synthetic Published Article 1',
  'synthetic-published-article-1',
  'Synthetic Excerpt 1',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Synthetic article body content 1."}]}]}'::jsonb,
  'published',
  now(),
  '99999999-9999-9999-9999-999999999999'
);

-- Published article 2
INSERT INTO public.articles (id, title, slug, excerpt, content_json, status, published_at, category_id)
VALUES (
  '90000000-0000-0000-0000-000000000002',
  'Synthetic Published Article 2',
  'synthetic-published-article-2',
  'Synthetic Excerpt 2',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Synthetic article body content 2."}]}]}'::jsonb,
  'published',
  now(),
  '99999999-9999-9999-9999-999999999999'
);

-- Published article 3 (for multi-article daily distribution)
INSERT INTO public.articles (id, title, slug, excerpt, content_json, status, published_at, category_id)
VALUES (
  '90000000-0000-0000-0000-000000000005',
  'Synthetic Published Article 3',
  'synthetic-published-article-3',
  'Synthetic Excerpt 3',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Synthetic article body content 3."}]}]}'::jsonb,
  'published',
  now(),
  '99999999-9999-9999-9999-999999999999'
);

-- Draft article
INSERT INTO public.articles (id, title, slug, excerpt, content_json, status, published_at, category_id)
VALUES (
  '90000000-0000-0000-0000-000000000003',
  'Synthetic Draft Article 1',
  'draft-90000000-0000-0000-0000-000000000003',
  'Synthetic Draft Excerpt',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Synthetic draft content"}]}]}'::jsonb,
  'draft',
  NULL,
  '99999999-9999-9999-9999-999999999999'
);

-- Archived article
INSERT INTO public.articles (id, title, slug, excerpt, content_json, status, published_at, category_id)
VALUES (
  '90000000-0000-0000-0000-000000000004',
  'Synthetic Archived Article 1',
  'synthetic-archived-article-1',
  'Synthetic Archived Excerpt',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Synthetic archived content"}]}]}'::jsonb,
  'archived',
  now(),
  '99999999-9999-9999-9999-999999999999'
);

-- ----------------------------------------------------------------------------
-- Section A: Comment Moderation Consistency Invariants
-- ----------------------------------------------------------------------------

SELECT has_table('public', 'comments', 'public.comments table exists');

SELECT col_is_pk('public', 'comments', 'id', 'public.comments has id primary key');

-- 1. Valid pending comment with null moderated_at is accepted
PREPARE insert_valid_pending AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic Tester', 'synthetic-test1@example.invalid', 'Synthetic valid pending body', 'pending', NULL);

SELECT lives_ok('insert_valid_pending', 'Valid pending comment with null moderated_at is accepted');

-- 2. Pending with non-null moderated_at is rejected
PREPARE insert_invalid_pending AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic Tester', 'synthetic-test2@example.invalid', 'Synthetic invalid pending body', 'pending', now());

SELECT throws_ok('insert_invalid_pending', '23514', NULL, 'Pending comment with non-null moderated_at is rejected by check constraint');

-- 3. Approved with null moderated_at is rejected
PREPARE insert_invalid_approved AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic Tester', 'synthetic-test3@example.invalid', 'Synthetic invalid approved body', 'approved', NULL);

SELECT throws_ok('insert_invalid_approved', '23514', NULL, 'Approved comment with null moderated_at is rejected by check constraint');

-- 4. Hidden with null moderated_at is rejected
PREPARE insert_invalid_hidden AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic Tester', 'synthetic-test4@example.invalid', 'Synthetic invalid hidden body', 'hidden', NULL);

SELECT throws_ok('insert_invalid_hidden', '23514', NULL, 'Hidden comment with null moderated_at is rejected by check constraint');

-- 5. Valid approved with non-null moderated_at is accepted
PREPARE insert_valid_approved AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic Tester', 'synthetic-test5@example.invalid', 'Synthetic valid approved body', 'approved', now());

SELECT lives_ok('insert_valid_approved', 'Approved comment with non-null moderated_at is accepted');

-- 6. Valid hidden with non-null moderated_at is accepted
PREPARE insert_valid_hidden AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic Tester', 'synthetic-test6@example.invalid', 'Synthetic valid hidden body', 'hidden', now());

SELECT lives_ok('insert_valid_hidden', 'Hidden comment with non-null moderated_at is accepted');

-- ----------------------------------------------------------------------------
-- Section B: Site Settings Constraints
-- ----------------------------------------------------------------------------

SELECT has_table('public', 'site_settings', 'public.site_settings table exists');

-- Verify singleton ID check (id <> 1 is rejected)
PREPARE insert_invalid_settings_id AS
  INSERT INTO public.site_settings (id, site_title, tagline)
  VALUES (2, 'Invalid ID Publication', 'Tagline');

SELECT throws_ok('insert_invalid_settings_id', '23514', NULL, 'Site settings with id <> 1 is rejected by constraint');

-- Verify blank site_title is rejected
PREPARE update_blank_site_title AS
  UPDATE public.site_settings SET site_title = '   ' WHERE id = 1;

SELECT throws_ok('update_blank_site_title', '23514', NULL, 'Blank site_title is rejected by constraint');

-- Verify over-limit lengths are rejected
PREPARE update_long_site_title AS
  UPDATE public.site_settings SET site_title = repeat('A', 121) WHERE id = 1;

SELECT throws_ok('update_long_site_title', '23514', NULL, 'Site title > 120 chars is rejected');

PREPARE update_long_tagline AS
  UPDATE public.site_settings SET tagline = repeat('B', 201) WHERE id = 1;

SELECT throws_ok('update_long_tagline', '23514', NULL, 'Tagline > 200 chars is rejected');

PREPARE update_long_seo_desc AS
  UPDATE public.site_settings SET default_seo_description = repeat('C', 321) WHERE id = 1;

SELECT throws_ok('update_long_seo_desc', '23514', NULL, 'Default SEO description > 320 chars is rejected');

-- Verify non-array social_links is rejected
PREPARE update_invalid_social_links AS
  UPDATE public.site_settings SET social_links = '{"url": "https://example.invalid"}'::jsonb WHERE id = 1;

SELECT throws_ok('update_invalid_social_links', '23514', NULL, 'Non-array social_links JSON is rejected');

-- Verify valid update is accepted with neutral synthetic data
PREPARE update_valid_settings AS
  UPDATE public.site_settings SET
    site_title = 'Synthetic Publication',
    tagline = 'Synthetic editorial testing tagline',
    homepage_intro = 'Synthetic homepage introduction used only for local settings validation.',
    disclaimer_text = 'Synthetic disclaimer text used only for local settings validation.',
    default_seo_description = 'Synthetic default SEO description.',
    social_links = '[{"platform": "github", "url": "https://example.invalid/synthetic-author"}]'::jsonb
  WHERE id = 1;

SELECT lives_ok('update_valid_settings', 'Valid site settings update is accepted');

-- ----------------------------------------------------------------------------
-- Section C: Feature Flag Integrity & Uniqueness
-- ----------------------------------------------------------------------------

-- Draft article cannot be lead featured
PREPARE draft_is_featured AS
  UPDATE public.articles SET is_featured = true WHERE id = '90000000-0000-0000-0000-000000000003';

SELECT throws_ok('draft_is_featured', '23514', NULL, 'Draft article cannot have is_featured = true');

-- Archived article cannot be lead featured
PREPARE archived_is_featured AS
  UPDATE public.articles SET is_featured = true WHERE id = '90000000-0000-0000-0000-000000000004';

SELECT throws_ok('archived_is_featured', '23514', NULL, 'Archived article cannot have is_featured = true');

-- Draft article cannot be portfolio featured
PREPARE draft_portfolio_featured AS
  UPDATE public.articles SET is_portfolio_featured = true WHERE id = '90000000-0000-0000-0000-000000000003';

SELECT throws_ok('draft_portfolio_featured', '23514', NULL, 'Draft article cannot have is_portfolio_featured = true');

-- Archived article cannot be portfolio featured
PREPARE archived_portfolio_featured AS
  UPDATE public.articles SET is_portfolio_featured = true WHERE id = '90000000-0000-0000-0000-000000000004';

SELECT throws_ok('archived_portfolio_featured', '23514', NULL, 'Archived article cannot have is_portfolio_featured = true');

-- Published article may be portfolio featured
PREPARE published_portfolio_featured AS
  UPDATE public.articles SET is_portfolio_featured = true WHERE id = '90000000-0000-0000-0000-000000000001';

SELECT lives_ok('published_portfolio_featured', 'Published article can have is_portfolio_featured = true');

-- Direct update attempting two lead-featured articles must be rejected by partial unique index
PREPARE direct_two_featured AS
  UPDATE public.articles SET is_featured = true WHERE id IN ('90000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000002');

SELECT throws_ok('direct_two_featured', '23505', NULL, 'Unique index idx_articles_single_featured blocks multiple lead featured articles');

-- ----------------------------------------------------------------------------
-- Section D: set_featured_article RPC Security & Execution
-- ----------------------------------------------------------------------------

SELECT has_function('public', 'set_featured_article', ARRAY['uuid'], 'public.set_featured_article RPC exists');

SELECT function_returns('public', 'set_featured_article', ARRAY['uuid'], 'void', 'public.set_featured_article returns void');

-- Verify function is SECURITY INVOKER
SELECT is(
  (SELECT prosecdef FROM pg_proc WHERE proname = 'set_featured_article' AND pronamespace = 'public'::regnamespace),
  false,
  'public.set_featured_article is SECURITY INVOKER'
);

-- Verify search_path is empty
SELECT is(
  (SELECT proconfig FROM pg_proc WHERE proname = 'set_featured_article' AND pronamespace = 'public'::regnamespace),
  ARRAY['search_path=""'],
  'public.set_featured_article has empty search_path'
);

-- Verify public/anon permissions
SELECT ok(
  NOT has_function_privilege('anon', 'public.set_featured_article(uuid)', 'EXECUTE'),
  'anon does not have EXECUTE privilege on public.set_featured_article'
);

SELECT ok(
  has_function_privilege('authenticated', 'public.set_featured_article(uuid)', 'EXECUTE'),
  'authenticated has EXECUTE privilege on public.set_featured_article'
);

-- Test authenticated non-admin is rejected
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002", "role": "authenticated"}';

SELECT throws_ok(
  $$ SELECT public.set_featured_article('90000000-0000-0000-0000-000000000001'::uuid) $$,
  'Unauthorized: only administrators can set featured articles.',
  'Authenticated non-admin call to set_featured_article is rejected'
);

-- Test admin execution
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

SELECT lives_ok(
  $$ SELECT public.set_featured_article('90000000-0000-0000-0000-000000000001'::uuid) $$,
  'Admin can set published article as lead featured'
);

SELECT is(
  (SELECT count(*)::int FROM public.articles WHERE is_featured = true),
  1,
  'Exactly one article is featured after set_featured_article'
);

SELECT is(
  (SELECT id FROM public.articles WHERE is_featured = true),
  '90000000-0000-0000-0000-000000000001'::uuid,
  'Correct article is marked is_featured = true'
);

-- Test selecting another article atomically switches the lead feature
SELECT lives_ok(
  $$ SELECT public.set_featured_article('90000000-0000-0000-0000-000000000002'::uuid) $$,
  'Admin can switch lead feature to another published article'
);

SELECT is(
  (SELECT id FROM public.articles WHERE is_featured = true),
  '90000000-0000-0000-0000-000000000002'::uuid,
  'Second article became lead featured'
);

SELECT is(
  (SELECT is_featured FROM public.articles WHERE id = '90000000-0000-0000-0000-000000000001'),
  false,
  'First article is no longer lead featured'
);

-- Test passing NULL clears lead featured article
SELECT lives_ok(
  $$ SELECT public.set_featured_article(NULL) $$,
  'Admin can clear lead featured article by passing NULL'
);

SELECT is(
  (SELECT count(*)::int FROM public.articles WHERE is_featured = true),
  0,
  'Zero articles are featured after passing NULL to set_featured_article'
);

-- Test draft article is rejected
SELECT throws_ok(
  $$ SELECT public.set_featured_article('90000000-0000-0000-0000-000000000003'::uuid) $$,
  'Invalid article: featured lead article must exist and have published status.',
  'Draft article cannot be set as featured via set_featured_article'
);

RESET ROLE;

-- ----------------------------------------------------------------------------
-- Section E: Private Trigger Function Security Invariants
-- ----------------------------------------------------------------------------

SELECT has_function('private', 'guard_comment_submission', 'private.guard_comment_submission trigger function exists');
SELECT has_function('private', 'guard_contact_submission', 'private.guard_contact_submission trigger function exists');

-- Verify both functions are SECURITY DEFINER
SELECT is(
  (SELECT prosecdef FROM pg_proc WHERE proname = 'guard_comment_submission' AND pronamespace = 'private'::regnamespace),
  true,
  'private.guard_comment_submission is SECURITY DEFINER'
);

SELECT is(
  (SELECT prosecdef FROM pg_proc WHERE proname = 'guard_contact_submission' AND pronamespace = 'private'::regnamespace),
  true,
  'private.guard_contact_submission is SECURITY DEFINER'
);

-- Verify both functions have empty search_path
SELECT is(
  (SELECT proconfig FROM pg_proc WHERE proname = 'guard_comment_submission' AND pronamespace = 'private'::regnamespace),
  ARRAY['search_path=""'],
  'private.guard_comment_submission has empty search_path'
);

SELECT is(
  (SELECT proconfig FROM pg_proc WHERE proname = 'guard_contact_submission' AND pronamespace = 'private'::regnamespace),
  ARRAY['search_path=""'],
  'private.guard_contact_submission has empty search_path'
);

-- Verify privileges revoked from anon and authenticated
SELECT ok(
  NOT has_function_privilege('anon', 'private.guard_comment_submission()', 'EXECUTE'),
  'anon does NOT have EXECUTE on private.guard_comment_submission'
);

SELECT ok(
  NOT has_function_privilege('authenticated', 'private.guard_comment_submission()', 'EXECUTE'),
  'authenticated does NOT have EXECUTE on private.guard_comment_submission'
);

SELECT ok(
  NOT has_function_privilege('anon', 'private.guard_contact_submission()', 'EXECUTE'),
  'anon does NOT have EXECUTE on private.guard_contact_submission'
);

SELECT ok(
  NOT has_function_privilege('authenticated', 'private.guard_contact_submission()', 'EXECUTE'),
  'authenticated does NOT have EXECUTE on private.guard_contact_submission'
);

-- Verify triggers are attached BEFORE INSERT
SELECT is(
  (SELECT action_timing FROM information_schema.triggers WHERE trigger_name = 'trg_guard_comment_submission' AND event_object_table = 'comments'),
  'BEFORE',
  'trg_guard_comment_submission fires BEFORE INSERT'
);

SELECT is(
  (SELECT action_timing FROM information_schema.triggers WHERE trigger_name = 'trg_guard_contact_submission' AND event_object_table = 'contact_messages'),
  'BEFORE',
  'trg_guard_contact_submission fires BEFORE INSERT'
);

-- ----------------------------------------------------------------------------
-- Section F: Direct Anonymous Comment Behavior, Normalization & System Fields
-- ----------------------------------------------------------------------------

SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

-- Anonymous submission on published article succeeds and is normalized
PREPARE anon_insert_comment AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
  VALUES (
    '90000000-0000-0000-0000-000000000001',
    '  Synthetic Commenter  ',
    '  SYNTHETIC-COMMENTER@EXAMPLE.INVALID  ',
    '  Synthetic comment used only to verify normalization.  '
  );

SELECT lives_ok('anon_insert_comment', 'Anonymous comment submission on published article succeeds');

-- Verify inserted comment normalization & forced system fields via Admin session
RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

SELECT is(
  (SELECT commenter_name FROM public.comments WHERE commenter_email = 'synthetic-commenter@example.invalid'),
  'Synthetic Commenter',
  'Commenter name is trimmed by trigger'
);

SELECT is(
  (SELECT commenter_email FROM public.comments WHERE commenter_name = 'Synthetic Commenter'),
  'synthetic-commenter@example.invalid',
  'Commenter email is lowercased and trimmed by trigger'
);

SELECT is(
  (SELECT body FROM public.comments WHERE commenter_email = 'synthetic-commenter@example.invalid'),
  'Synthetic comment used only to verify normalization.',
  'Comment body outer whitespace is trimmed by trigger'
);

SELECT is(
  (SELECT status FROM public.comments WHERE commenter_email = 'synthetic-commenter@example.invalid'),
  'pending',
  'Comment status is forced to pending by trigger'
);

SELECT is(
  (SELECT moderated_at FROM public.comments WHERE commenter_email = 'synthetic-commenter@example.invalid'),
  NULL,
  'Comment moderated_at is forced to NULL by trigger'
);

SELECT isnt(
  (SELECT id FROM public.comments WHERE commenter_email = 'synthetic-commenter@example.invalid'),
  NULL,
  'Comment id is generated by database'
);

SELECT ok(
  (SELECT created_at FROM public.comments WHERE commenter_email = 'synthetic-commenter@example.invalid') >= (now() - INTERVAL '1 minute'),
  'Comment created_at is forced to current timestamp'
);

-- Anonymous comment on draft article must fail via RLS
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

PREPARE anon_insert_draft_comment AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
  VALUES ('90000000-0000-0000-0000-000000000003', 'Synthetic Visitor', 'synthetic-visitor@example.invalid', 'Synthetic draft comment');

SELECT throws_ok('anon_insert_draft_comment', '42501', NULL, 'Anonymous comment on unpublished draft article is rejected by RLS');

-- Anonymous visitor cannot read pending comments (safe columns return empty result)
SELECT is_empty(
  $$ SELECT id, article_id, commenter_name, body, created_at FROM public.comments WHERE body = 'Synthetic comment used only to verify normalization.' $$,
  'Anonymous visitor cannot read pending comments'
);

-- Anonymous visitor is denied selecting sensitive columns
SELECT throws_ok(
  $$ SELECT commenter_email FROM public.comments $$,
  '42501',
  NULL,
  'Anonymous visitor is denied SELECT on commenter_email column'
);

SELECT throws_ok(
  $$ SELECT moderated_at FROM public.comments $$,
  '42501',
  NULL,
  'Anonymous visitor is denied SELECT on moderated_at column'
);

-- ----------------------------------------------------------------------------
-- Section G: Comment Rate Limiting Invariants (3/15m, 10/24h, 100/1h Global)
-- ----------------------------------------------------------------------------

-- G1: 3 per 15-minute per article+email
-- synthetic-commenter@example.invalid has already submitted 1 comment on article 90000000...0001
-- Submit 2nd comment (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic C2', 'synthetic-commenter@example.invalid', 'Second comment') $$,
  'Second comment within 15 minutes is accepted'
);

-- Submit 3rd comment (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic C3', 'synthetic-commenter@example.invalid', 'Third comment') $$,
  'Third comment within 15 minutes is accepted'
);

-- Submit 4th comment (rejected by per-article 15-minute rate limit)
SELECT throws_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic C4', 'synthetic-commenter@example.invalid', 'Fourth comment') $$,
  'Too many comments submitted for this article. Please wait before posting again.',
  '4th comment within 15 minutes on same article is rejected (3/15m rule)'
);

-- Another user with different email can submit on the same article
SELECT lives_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic Peer', 'synthetic-peer@example.invalid', 'Fresh commenter') $$,
  'Different commenter can submit on the same article'
);

-- G2: 10 per 24-hour per email limit
-- Create controlled historical rows for synthetic-comment-daily@example.invalid
RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';

INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, created_at)
VALUES
  ('90000000-0000-0000-0000-000000000001', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 1', 'pending', now() - INTERVAL '1 hour'),
  ('90000000-0000-0000-0000-000000000001', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 2', 'pending', now() - INTERVAL '2 hours'),
  ('90000000-0000-0000-0000-000000000001', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 3', 'pending', now() - INTERVAL '3 hours'),
  ('90000000-0000-0000-0000-000000000002', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 4', 'pending', now() - INTERVAL '4 hours'),
  ('90000000-0000-0000-0000-000000000002', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 5', 'pending', now() - INTERVAL '5 hours'),
  ('90000000-0000-0000-0000-000000000002', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 6', 'pending', now() - INTERVAL '6 hours'),
  ('90000000-0000-0000-0000-000000000005', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 7', 'pending', now() - INTERVAL '7 hours'),
  ('90000000-0000-0000-0000-000000000005', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 8', 'pending', now() - INTERVAL '8 hours'),
  ('90000000-0000-0000-0000-000000000005', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 9', 'pending', now() - INTERVAL '9 hours'),
  ('90000000-0000-0000-0000-000000000005', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Historical comment 10', 'pending', now() - INTERVAL '10 hours');

-- Switch to anon API role and attempt 11th comment
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

SELECT throws_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000001', 'Daily Tester', 'synthetic-comment-daily@example.invalid', 'Eleventh comment') $$,
  'Daily comment submission limit reached. Please try again tomorrow.',
  '11th comment within 24 hours from same email is rejected (10/24h rule)'
);

-- G3: 100 per 1-hour site-wide global limit (Boundary Test: 99 allowed -> 100th succeeds -> 101st rejected)
RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';

-- Remove previous rolling-hour comments so exact count is completely deterministic
DELETE FROM public.comments WHERE created_at >= (now() - INTERVAL '1 hour');

-- Insert exactly 99 distinct comments within the rolling hour with distinct synthetic emails
INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, created_at)
SELECT
  '90000000-0000-0000-0000-000000000001',
  'Global Tester ' || i,
  'synthetic-global-' || i || '@example.invalid',
  'Global filler comment ' || i,
  'pending',
  now() - ((i * 10) || ' seconds')::interval
FROM generate_series(1, 99) AS s(i);

-- A. Assert exactly 99 comments exist in rolling hour before allowed boundary insert
SELECT is(
  (SELECT count(*)::int FROM public.comments WHERE created_at >= (now() - INTERVAL '1 hour')),
  99,
  'Exactly 99 qualifying comments exist in the rolling hour before boundary test'
);

-- Switch to anon API role
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

-- B. 100th comment succeeds
SELECT lives_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000002', 'Boundary Tester 100', 'synthetic-boundary-100@example.invalid', '100th qualifying comment') $$,
  '100th public comment within rolling hour is accepted at boundary'
);

-- C. Confirm rolling-hour count is now exactly 100
RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';

SELECT is(
  (SELECT count(*)::int FROM public.comments WHERE created_at >= (now() - INTERVAL '1 hour')),
  100,
  'Rolling-hour comment count is exactly 100 after boundary insert'
);

-- Switch back to anon API role
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

-- D. 101st comment is rejected by 100/1h global rule
SELECT throws_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000002', 'Boundary Tester 101', 'synthetic-boundary-101@example.invalid', '101st comment attempt') $$,
  'Comment system is currently busy. Please try again later.',
  'Comment submission beyond 100/hour is rejected by global rate limit (100/1h global rule)'
);

-- Clean up global filler fixtures
RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';
DELETE FROM public.comments WHERE commenter_email LIKE 'synthetic-global-%@example.invalid' OR commenter_email LIKE 'synthetic-boundary-%@example.invalid';

-- ----------------------------------------------------------------------------
-- Section H: Direct Anonymous Contact Message Behavior, Normalization & System Fields
-- ----------------------------------------------------------------------------

-- Clean up global comment fixtures so they do not interfere with subsequent tests
RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';

PREPARE anon_insert_contact AS
  INSERT INTO public.contact_messages (name, email, subject, message)
  VALUES (
    '  Synthetic Inquirer  ',
    '  SYNTHETIC-INQUIRER@EXAMPLE.INVALID  ',
    '  Synthetic Collaboration Inquiry  ',
    '  Synthetic contact message used only for local security verification.  '
  );

SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

SELECT lives_ok('anon_insert_contact', 'Anonymous contact submission succeeds');

-- Anonymous caller CANNOT select inserted contact messages (Zero public read)
SELECT throws_ok(
  $$ SELECT * FROM public.contact_messages $$,
  '42501',
  NULL,
  'Anonymous visitor is denied SELECT on contact_messages table'
);

-- Anonymous caller cannot update contact messages
SELECT throws_ok(
  $$ UPDATE public.contact_messages SET status = 'read' $$,
  '42501',
  NULL,
  'Anonymous visitor is denied UPDATE on contact_messages table'
);

-- Anonymous caller cannot delete contact messages
SELECT throws_ok(
  $$ DELETE FROM public.contact_messages $$,
  '42501',
  NULL,
  'Anonymous visitor is denied DELETE on contact_messages table'
);

-- Verify contact message normalization & forced system fields via Admin session
RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

SELECT is(
  (SELECT name FROM public.contact_messages WHERE email = 'synthetic-inquirer@example.invalid' LIMIT 1),
  'Synthetic Inquirer',
  'Contact name is trimmed by trigger'
);

SELECT is(
  (SELECT email FROM public.contact_messages WHERE email = 'synthetic-inquirer@example.invalid' LIMIT 1),
  'synthetic-inquirer@example.invalid',
  'Contact email is lowercased and trimmed by trigger'
);

SELECT is(
  (SELECT subject FROM public.contact_messages WHERE email = 'synthetic-inquirer@example.invalid' LIMIT 1),
  'Synthetic Collaboration Inquiry',
  'Contact subject is trimmed by trigger'
);

SELECT is(
  (SELECT message FROM public.contact_messages WHERE email = 'synthetic-inquirer@example.invalid' LIMIT 1),
  'Synthetic contact message used only for local security verification.',
  'Contact message outer whitespace is trimmed by trigger'
);

SELECT is(
  (SELECT status FROM public.contact_messages WHERE email = 'synthetic-inquirer@example.invalid' LIMIT 1),
  'new',
  'Contact status is forced to new by trigger'
);

SELECT isnt(
  (SELECT id FROM public.contact_messages WHERE email = 'synthetic-inquirer@example.invalid' LIMIT 1),
  NULL,
  'Contact id is generated by database'
);

SELECT ok(
  (SELECT created_at FROM public.contact_messages WHERE email = 'synthetic-inquirer@example.invalid' LIMIT 1) >= (now() - INTERVAL '1 minute'),
  'Contact created_at is forced to current timestamp'
);

-- ----------------------------------------------------------------------------
-- Section I: Contact Message Rate Limiting Invariants (3/1h, 5/24h, 30/1h Global)
-- ----------------------------------------------------------------------------

-- I1: 3 per 1-hour limit
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

-- synthetic-inquirer@example.invalid has submitted 1 message
-- Submit 2nd message (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.contact_messages (name, email, subject, message)
     VALUES ('Synthetic Inquirer', 'synthetic-inquirer@example.invalid', 'Followup 1', 'Second message content') $$,
  'Second contact message within 1 hour is accepted'
);

-- Submit 3rd message (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.contact_messages (name, email, subject, message)
     VALUES ('Synthetic Inquirer', 'synthetic-inquirer@example.invalid', 'Followup 2', 'Third message content') $$,
  'Third contact message within 1 hour is accepted'
);

-- Submit 4th message (rejected by 3/hour rate limit)
SELECT throws_ok(
  $$ INSERT INTO public.contact_messages (name, email, subject, message)
     VALUES ('Synthetic Inquirer', 'synthetic-inquirer@example.invalid', 'Followup 3', 'Fourth message content') $$,
  'Too many messages sent. Please wait before submitting another inquiry.',
  '4th contact message within 1 hour from same email is rejected (3/1h rule)'
);

-- I2: 5 per 24-hour limit
-- Create controlled historical contact messages distributed outside 1-hour threshold
RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';

INSERT INTO public.contact_messages (name, email, subject, message, status, created_at)
VALUES
  ('Daily Inquirer', 'synthetic-contact-daily@example.invalid', 'Daily Msg 1', 'Historical inquiry 1', 'new', now() - INTERVAL '2 hours'),
  ('Daily Inquirer', 'synthetic-contact-daily@example.invalid', 'Daily Msg 2', 'Historical inquiry 2', 'new', now() - INTERVAL '3 hours'),
  ('Daily Inquirer', 'synthetic-contact-daily@example.invalid', 'Daily Msg 3', 'Historical inquiry 3', 'new', now() - INTERVAL '4 hours'),
  ('Daily Inquirer', 'synthetic-contact-daily@example.invalid', 'Daily Msg 4', 'Historical inquiry 4', 'new', now() - INTERVAL '5 hours'),
  ('Daily Inquirer', 'synthetic-contact-daily@example.invalid', 'Daily Msg 5', 'Historical inquiry 5', 'new', now() - INTERVAL '6 hours');

-- Switch to anon API role and attempt 6th message
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

SELECT throws_ok(
  $$ INSERT INTO public.contact_messages (name, email, subject, message)
     VALUES ('Daily Inquirer', 'synthetic-contact-daily@example.invalid', 'Daily Msg 6', 'Sixth message attempt') $$,
  'Daily message limit reached. Please try again tomorrow.',
  '6th contact message within 24 hours from same email is rejected (5/24h rule)'
);

-- I3: 30 per 1-hour site-wide global limit (Boundary Test: 29 allowed -> 30th succeeds -> 31st rejected)
RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';

-- Remove previous rolling-hour contact messages so exact count is completely deterministic
DELETE FROM public.contact_messages WHERE created_at >= (now() - INTERVAL '1 hour');

-- Insert exactly 29 distinct contact messages within the rolling hour with distinct emails
INSERT INTO public.contact_messages (name, email, subject, message, status, created_at)
SELECT
  'Global Inquirer ' || i,
  'synthetic-contact-global-' || i || '@example.invalid',
  'Global Contact Subject ' || i,
  'Global contact filler message ' || i,
  'new',
  now() - ((i * 30) || ' seconds')::interval
FROM generate_series(1, 29) AS s(i);

-- A. Assert exactly 29 contact messages exist in rolling hour before allowed boundary insert
SELECT is(
  (SELECT count(*)::int FROM public.contact_messages WHERE created_at >= (now() - INTERVAL '1 hour')),
  29,
  'Exactly 29 qualifying contact messages exist in the rolling hour before boundary test'
);

-- Switch to anon API role
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

-- B. 30th contact message succeeds
SELECT lives_ok(
  $$ INSERT INTO public.contact_messages (name, email, subject, message)
     VALUES ('Boundary Inquirer 30', 'synthetic-contact-boundary-30@example.invalid', '30th Subject', '30th qualifying message') $$,
  '30th public contact message within rolling hour is accepted at boundary'
);

-- C. Confirm rolling-hour count is now exactly 30
RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';

SELECT is(
  (SELECT count(*)::int FROM public.contact_messages WHERE created_at >= (now() - INTERVAL '1 hour')),
  30,
  'Rolling-hour contact message count is exactly 30 after boundary insert'
);

-- Switch back to anon API role
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

-- D. 31st contact message is rejected by 30/1h global rule
SELECT throws_ok(
  $$ INSERT INTO public.contact_messages (name, email, subject, message)
     VALUES ('Boundary Inquirer 31', 'synthetic-contact-boundary-31@example.invalid', '31st Subject', '31st message attempt') $$,
  'Contact service is currently experiencing high volume. Please try again later.',
  'Contact message beyond 30/hour is rejected by global rate limit (30/1h global rule)'
);

-- Clean up global contact filler fixtures so they do not interfere with subsequent tests
RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';
DELETE FROM public.contact_messages WHERE email LIKE 'synthetic-contact-global-%@example.invalid' OR email LIKE 'synthetic-contact-boundary-%@example.invalid';

-- ----------------------------------------------------------------------------
-- Section J: Authenticated Non-Admin Regression & System-Field Spoof Defense
-- ----------------------------------------------------------------------------

RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002", "role": "authenticated"}';

-- A. Comments: Authenticated non-admin comment INSERT remains rejected by RLS
PREPARE nonadmin_insert_comment AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
  VALUES ('90000000-0000-0000-0000-000000000001', 'NonAdmin User', 'nonadmin@example.invalid', 'Nonadmin direct comment attempt');

SELECT throws_ok('nonadmin_insert_comment', '42501', NULL, 'Authenticated non-admin direct comment INSERT is rejected by RLS');

-- B. Contact: Authenticated non-admin contact INSERT with spoofed ID, created_at, status, whitespace
PREPARE nonadmin_insert_contact AS
  INSERT INTO public.contact_messages (id, created_at, status, name, email, subject, message)
  VALUES (
    '88888888-8888-8888-8888-888888888888'::uuid,
    now() - INTERVAL '30 days',
    'archived',
    '  Authenticated NonAdmin Inquirer  ',
    '  NONADMIN-INQUIRER@EXAMPLE.INVALID  ',
    '  Nonadmin Collaboration Subject  ',
    '  Nonadmin message body content  '
  );

SELECT lives_ok('nonadmin_insert_contact', 'Authenticated non-admin contact submission succeeds');

-- Verify system fields and normalization under admin session
RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

SELECT isnt(
  (SELECT id FROM public.contact_messages WHERE email = 'nonadmin-inquirer@example.invalid' LIMIT 1),
  '88888888-8888-8888-8888-888888888888'::uuid,
  'Client-supplied ID is discarded and replaced by database-generated UUID for non-admin'
);

SELECT ok(
  (SELECT created_at FROM public.contact_messages WHERE email = 'nonadmin-inquirer@example.invalid' LIMIT 1) >= (now() - INTERVAL '1 minute'),
  'Client-supplied historical created_at is discarded and replaced by current timestamp for non-admin'
);

SELECT is(
  (SELECT status FROM public.contact_messages WHERE email = 'nonadmin-inquirer@example.invalid' LIMIT 1),
  'new',
  'Client-supplied status is discarded and forced to new for non-admin'
);

SELECT is(
  (SELECT email FROM public.contact_messages WHERE email = 'nonadmin-inquirer@example.invalid' LIMIT 1),
  'nonadmin-inquirer@example.invalid',
  'Non-admin contact email is lowercased and trimmed'
);

-- Prove rate limiting cannot be bypassed by non-admin repeatedly supplying old created_at
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002", "role": "authenticated"}';

-- Submit 2nd message with old created_at (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.contact_messages (created_at, name, email, subject, message)
     VALUES (now() - INTERVAL '30 days', 'NonAdmin User', 'nonadmin-inquirer@example.invalid', 'Subj 2', 'Body 2') $$,
  'Second non-admin message is accepted'
);

-- Submit 3rd message with old created_at (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.contact_messages (created_at, name, email, subject, message)
     VALUES (now() - INTERVAL '30 days', 'NonAdmin User', 'nonadmin-inquirer@example.invalid', 'Subj 3', 'Body 3') $$,
  'Third non-admin message is accepted'
);

-- Submit 4th message with old created_at (rejected by 3/1h limit despite old created_at)
SELECT throws_ok(
  $$ INSERT INTO public.contact_messages (created_at, name, email, subject, message)
     VALUES (now() - INTERVAL '30 days', 'NonAdmin User', 'nonadmin-inquirer@example.invalid', 'Subj 4', 'Body 4') $$,
  'Too many messages sent. Please wait before submitting another inquiry.',
  '4th non-admin message is rejected by 3/1h rate limit despite supplying historical created_at'
);

-- ----------------------------------------------------------------------------
-- Section K: Admin Compatibility & Moderation Actions
-- ----------------------------------------------------------------------------

RESET ROLE;
SET LOCAL "request.jwt.claims" TO '';

-- Ensure admin has fixtures to moderate and read
INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, created_at)
VALUES ('90000000-0000-0000-0000-000000000001', 'Synthetic Moderatee', 'synthetic-commenter@example.invalid', 'Pending comment for admin testing', 'pending', now() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

INSERT INTO public.contact_messages (name, email, subject, message, status, created_at)
VALUES ('Synthetic Inquirer', 'synthetic-inquirer@example.invalid', 'Admin Moderation Subj', 'Admin Moderation Body', 'new', now() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

-- Admin can read commenter email
SELECT isnt(
  (SELECT commenter_email FROM public.comments WHERE commenter_email = 'synthetic-commenter@example.invalid' LIMIT 1),
  NULL,
  'Admin can read commenter_email'
);

-- Admin can approve pending comment (setting moderated_at)
SELECT lives_ok(
  $$ UPDATE public.comments
     SET status = 'approved', moderated_at = now()
     WHERE commenter_email = 'synthetic-commenter@example.invalid' $$,
  'Admin can approve pending comment with moderated_at set'
);

-- Admin can hide approved comment (setting moderated_at)
SELECT lives_ok(
  $$ UPDATE public.comments
     SET status = 'hidden', moderated_at = now()
     WHERE commenter_email = 'synthetic-commenter@example.invalid' $$,
  'Admin can hide approved comment with moderated_at set'
);

-- Admin can delete comment
SELECT lives_ok(
  $$ DELETE FROM public.comments WHERE commenter_email = 'synthetic-commenter@example.invalid' $$,
  'Admin can delete comment'
);

-- Admin can read and update contact messages
SELECT isnt(
  (SELECT count(*)::int FROM public.contact_messages),
  0,
  'Admin can read contact messages'
);

SELECT lives_ok(
  $$ UPDATE public.contact_messages SET status = 'read' WHERE email = 'synthetic-inquirer@example.invalid' $$,
  'Admin can update contact message status to read'
);

SELECT lives_ok(
  $$ UPDATE public.contact_messages SET status = 'archived' WHERE email = 'synthetic-inquirer@example.invalid' $$,
  'Admin can update contact message status to archived'
);

-- ----------------------------------------------------------------------------
-- Section L: Prior Regression Integrity
-- ----------------------------------------------------------------------------

-- Verify save_article_draft RPC is intact
SELECT has_function('public', 'save_article_draft', 'public.save_article_draft RPC remains intact');

-- Verify publish_article RPC is intact
SELECT has_function('public', 'publish_article', 'public.publish_article RPC remains intact');

-- Verify update_published_article RPC is intact
SELECT has_function('public', 'update_published_article', 'public.update_published_article RPC remains intact');

-- Verify unpublish_article RPC is intact
SELECT has_function('public', 'unpublish_article', 'public.unpublish_article RPC remains intact');

-- Verify archive_article RPC is intact
SELECT has_function('public', 'archive_article', 'public.archive_article RPC remains intact');

-- Verify restore_article RPC is intact
SELECT has_function('public', 'restore_article', 'public.restore_article RPC remains intact');

-- Verify delete_article RPC is intact
SELECT has_function('public', 'delete_article', 'public.delete_article RPC remains intact');

SELECT * FROM finish();
ROLLBACK;
