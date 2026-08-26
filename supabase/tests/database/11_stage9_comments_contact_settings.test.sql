BEGIN;
SELECT plan(90);

-- ============================================================================
-- Test Suite 11: Stage 9 Comments, Contact Inbox & Settings Security
-- Architecture: Approved Decision D032
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Setup Synthetic Test Fixtures
-- ----------------------------------------------------------------------------

INSERT INTO public.categories (id, name, slug)
VALUES ('99999999-9999-9999-9999-999999999999', 'Cardiology Test', 'cardiology-test')
ON CONFLICT (id) DO NOTHING;

-- Published article 1
INSERT INTO public.articles (id, title, slug, excerpt, content_json, status, published_at, category_id)
VALUES (
  '90000000-0000-0000-0000-000000000001',
  'Published Article 1',
  'published-article-1',
  'Excerpt 1',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Clinical content 1"}]}]}'::jsonb,
  'published',
  now(),
  '99999999-9999-9999-9999-999999999999'
);

-- Published article 2
INSERT INTO public.articles (id, title, slug, excerpt, content_json, status, published_at, category_id)
VALUES (
  '90000000-0000-0000-0000-000000000002',
  'Published Article 2',
  'published-article-2',
  'Excerpt 2',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Clinical content 2"}]}]}'::jsonb,
  'published',
  now(),
  '99999999-9999-9999-9999-999999999999'
);

-- Draft article
INSERT INTO public.articles (id, title, slug, excerpt, content_json, status, published_at, category_id)
VALUES (
  '90000000-0000-0000-0000-000000000003',
  'Draft Article 1',
  'draft-90000000-0000-0000-0000-000000000003',
  'Draft Excerpt',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Draft content"}]}]}'::jsonb,
  'draft',
  NULL,
  '99999999-9999-9999-9999-999999999999'
);

-- Archived article
INSERT INTO public.articles (id, title, slug, excerpt, content_json, status, published_at, category_id)
VALUES (
  '90000000-0000-0000-0000-000000000004',
  'Archived Article 1',
  'archived-article-1',
  'Archived Excerpt',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Archived content"}]}]}'::jsonb,
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
  VALUES ('90000000-0000-0000-0000-000000000001', 'Dr. Tester', 'test1@example.com', 'Valid pending body', 'pending', NULL);

SELECT lives_ok('insert_valid_pending', 'Valid pending comment with null moderated_at is accepted');

-- 2. Pending with non-null moderated_at is rejected
PREPARE insert_invalid_pending AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Dr. Tester', 'test2@example.com', 'Invalid pending body', 'pending', now());

SELECT throws_ok('insert_invalid_pending', '23514', NULL, 'Pending comment with non-null moderated_at is rejected by check constraint');

-- 3. Approved with null moderated_at is rejected
PREPARE insert_invalid_approved AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Dr. Tester', 'test3@example.com', 'Invalid approved body', 'approved', NULL);

SELECT throws_ok('insert_invalid_approved', '23514', NULL, 'Approved comment with null moderated_at is rejected by check constraint');

-- 4. Hidden with null moderated_at is rejected
PREPARE insert_invalid_hidden AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Dr. Tester', 'test4@example.com', 'Invalid hidden body', 'hidden', NULL);

SELECT throws_ok('insert_invalid_hidden', '23514', NULL, 'Hidden comment with null moderated_at is rejected by check constraint');

-- 5. Valid approved with non-null moderated_at is accepted
PREPARE insert_valid_approved AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Dr. Tester', 'test5@example.com', 'Valid approved body', 'approved', now());

SELECT lives_ok('insert_valid_approved', 'Approved comment with non-null moderated_at is accepted');

-- 6. Valid hidden with non-null moderated_at is accepted
PREPARE insert_valid_hidden AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
  VALUES ('90000000-0000-0000-0000-000000000001', 'Dr. Tester', 'test6@example.com', 'Valid hidden body', 'hidden', now());

SELECT lives_ok('insert_valid_hidden', 'Hidden comment with non-null moderated_at is accepted');

-- ----------------------------------------------------------------------------
-- Section B: Site Settings Constraints
-- ----------------------------------------------------------------------------

SELECT has_table('public', 'site_settings', 'public.site_settings table exists');

-- Verify singleton ID check (id <> 1 is rejected)
PREPARE insert_invalid_settings_id AS
  INSERT INTO public.site_settings (id, site_title, tagline)
  VALUES (2, 'Invalid ID Blog', 'Tagline');

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
  UPDATE public.site_settings SET social_links = '{"url": "https://example.com"}'::jsonb WHERE id = 1;

SELECT throws_ok('update_invalid_social_links', '23514', NULL, 'Non-array social_links JSON is rejected');

-- Verify valid update is accepted
PREPARE update_valid_settings AS
  UPDATE public.site_settings SET
    site_title = 'Marie E. LeBlanc, MD',
    tagline = 'Cardiology & Clinical Evidence Portfolio',
    homepage_intro = 'Welcome to the clinical portfolio of Dr. Marie E. LeBlanc.',
    disclaimer_text = 'For informational and educational purposes only.',
    default_seo_description = 'Cardiology essays and medical writing portfolio.',
    social_links = '[{"platform": "orcid", "url": "https://orcid.org/0000-0002-1825-0097"}]'::jsonb
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
-- Section F: Direct Anonymous Comment Behavior & Normalization
-- ----------------------------------------------------------------------------

SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

-- Anonymous submission on published article succeeds and is normalized
PREPARE anon_insert_comment AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
  VALUES (
    '90000000-0000-0000-0000-000000000001',
    '  Dr. Sarah Jenkins, MD  ',
    '  SARAH.JENKINS@Hospital.org  ',
    '  Insightful analysis of the clinical trial endpoints.  '
  );

SELECT lives_ok('anon_insert_comment', 'Anonymous comment submission on published article succeeds');

-- Verify inserted comment normalization (queried by admin to inspect normalized fields)
RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

SELECT is(
  (SELECT commenter_name FROM public.comments WHERE commenter_email = 'sarah.jenkins@hospital.org'),
  'Dr. Sarah Jenkins, MD',
  'Commenter name is trimmed by trigger'
);

SELECT is(
  (SELECT commenter_email FROM public.comments WHERE commenter_name = 'Dr. Sarah Jenkins, MD'),
  'sarah.jenkins@hospital.org',
  'Commenter email is lowercased and trimmed by trigger'
);

SELECT is(
  (SELECT body FROM public.comments WHERE commenter_email = 'sarah.jenkins@hospital.org'),
  'Insightful analysis of the clinical trial endpoints.',
  'Comment body outer whitespace is trimmed by trigger'
);

SELECT is(
  (SELECT status FROM public.comments WHERE commenter_email = 'sarah.jenkins@hospital.org'),
  'pending',
  'Comment status is forced to pending by trigger'
);

SELECT is(
  (SELECT moderated_at FROM public.comments WHERE commenter_email = 'sarah.jenkins@hospital.org'),
  NULL,
  'Comment moderated_at is forced to NULL by trigger'
);

-- Anonymous comment on draft article must fail via RLS
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

PREPARE anon_insert_draft_comment AS
  INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
  VALUES ('90000000-0000-0000-0000-000000000003', 'Visitor', 'visitor@test.com', 'Draft comment');

SELECT throws_ok('anon_insert_draft_comment', '42501', NULL, 'Anonymous comment on unpublished draft article is rejected by RLS');

-- Anonymous visitor cannot read pending comments (safe columns return empty result)
SELECT is_empty(
  $$ SELECT id, article_id, commenter_name, body, created_at FROM public.comments WHERE body = 'Insightful analysis of the clinical trial endpoints.' $$,
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
-- Section G: Comment Rate Limiting Invariants
-- ----------------------------------------------------------------------------

-- Sarah Jenkins has already submitted 1 comment on article 90000000...0001
-- Submit 2nd comment (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000001', 'Sarah J', 'sarah.jenkins@hospital.org', 'Second comment') $$,
  'Second comment within 15 minutes is accepted'
);

-- Submit 3rd comment (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000001', 'Sarah J', 'sarah.jenkins@hospital.org', 'Third comment') $$,
  'Third comment within 15 minutes is accepted'
);

-- Submit 4th comment (rejected by per-article 15-minute rate limit)
SELECT throws_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000001', 'Sarah J', 'sarah.jenkins@hospital.org', 'Fourth comment') $$,
  'Too many comments submitted for this article. Please wait before posting again.',
  '4th comment within 15 minutes on same article is rejected'
);

-- Another user with different email can submit on the same article
SELECT lives_ok(
  $$ INSERT INTO public.comments (article_id, commenter_name, commenter_email, body)
     VALUES ('90000000-0000-0000-0000-000000000001', 'Dr. Alex Reed', 'alex.reed@clinic.org', 'Fresh commenter') $$,
  'Different commenter can submit on the same article'
);

-- ----------------------------------------------------------------------------
-- Section H: Direct Anonymous Contact Message Behavior & Normalization
-- ----------------------------------------------------------------------------

PREPARE anon_insert_contact AS
  INSERT INTO public.contact_messages (name, email, subject, message)
  VALUES (
    '  Dr. Robert Chen  ',
    '  RCHEN@CardioResearch.org  ',
    '  Collaboration Inquiry  ',
    '  Interested in discussing your evidence synthesis methodology.  '
  );

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

-- Verify contact message normalization via Admin session
RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

SELECT is(
  (SELECT name FROM public.contact_messages WHERE email = 'rchen@cardioresearch.org'),
  'Dr. Robert Chen',
  'Contact name is trimmed by trigger'
);

SELECT is(
  (SELECT email FROM public.contact_messages WHERE name = 'Dr. Robert Chen'),
  'rchen@cardioresearch.org',
  'Contact email is lowercased and trimmed by trigger'
);

SELECT is(
  (SELECT subject FROM public.contact_messages WHERE email = 'rchen@cardioresearch.org'),
  'Collaboration Inquiry',
  'Contact subject is trimmed by trigger'
);

SELECT is(
  (SELECT message FROM public.contact_messages WHERE email = 'rchen@cardioresearch.org'),
  'Interested in discussing your evidence synthesis methodology.',
  'Contact message outer whitespace is trimmed by trigger'
);

SELECT is(
  (SELECT status FROM public.contact_messages WHERE email = 'rchen@cardioresearch.org'),
  'new',
  'Contact status is forced to new by trigger'
);

-- ----------------------------------------------------------------------------
-- Section I: Contact Message Rate Limiting Invariants
-- ----------------------------------------------------------------------------

SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" TO '{"role": "anon"}';

-- Robert Chen has submitted 1 message
-- Submit 2nd message (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.contact_messages (name, email, subject, message)
     VALUES ('Robert Chen', 'rchen@cardioresearch.org', 'Followup 1', 'Second message content') $$,
  'Second contact message within 1 hour is accepted'
);

-- Submit 3rd message (allowed)
SELECT lives_ok(
  $$ INSERT INTO public.contact_messages (name, email, subject, message)
     VALUES ('Robert Chen', 'rchen@cardioresearch.org', 'Followup 2', 'Third message content') $$,
  'Third contact message within 1 hour is accepted'
);

-- Submit 4th message (rejected by 3/hour rate limit)
SELECT throws_ok(
  $$ INSERT INTO public.contact_messages (name, email, subject, message)
     VALUES ('Robert Chen', 'rchen@cardioresearch.org', 'Followup 3', 'Fourth message content') $$,
  'Too many messages sent. Please wait before submitting another inquiry.',
  '4th contact message within 1 hour from same email is rejected'
);

-- ----------------------------------------------------------------------------
-- Section J: Admin Compatibility & Moderation Actions
-- ----------------------------------------------------------------------------

RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated"}';

-- Admin can read commenter email
SELECT isnt(
  (SELECT commenter_email FROM public.comments WHERE commenter_email = 'sarah.jenkins@hospital.org' LIMIT 1),
  NULL,
  'Admin can read commenter_email'
);

-- Admin can approve pending comment (setting moderated_at)
SELECT lives_ok(
  $$ UPDATE public.comments
     SET status = 'approved', moderated_at = now()
     WHERE commenter_email = 'sarah.jenkins@hospital.org' $$,
  'Admin can approve pending comment with moderated_at set'
);

-- Admin can hide approved comment (setting moderated_at)
SELECT lives_ok(
  $$ UPDATE public.comments
     SET status = 'hidden', moderated_at = now()
     WHERE commenter_email = 'sarah.jenkins@hospital.org' $$,
  'Admin can hide approved comment with moderated_at set'
);

-- Admin can delete comment
SELECT lives_ok(
  $$ DELETE FROM public.comments WHERE commenter_email = 'sarah.jenkins@hospital.org' $$,
  'Admin can delete comment'
);

-- Admin can read and update contact messages
SELECT isnt(
  (SELECT count(*)::int FROM public.contact_messages),
  0,
  'Admin can read contact messages'
);

SELECT lives_ok(
  $$ UPDATE public.contact_messages SET status = 'read' WHERE email = 'rchen@cardioresearch.org' $$,
  'Admin can update contact message status to read'
);

SELECT lives_ok(
  $$ UPDATE public.contact_messages SET status = 'archived' WHERE email = 'rchen@cardioresearch.org' $$,
  'Admin can update contact message status to archived'
);

-- ----------------------------------------------------------------------------
-- Section K: Prior Regression Integrity
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
