-- Test Suite: 03_comments_security.test.sql
-- Description: Verifies comment moderation, submission restrictions, and column-level privacy.

begin;
select plan(9);

-- Switch to anonymous role
set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';
set local "request.jwt.claim.sub" = '';

-- 1. Anon can select approved comments on published articles (allowed columns)
select results_eq(
  'select count(*)::integer from public.comments where status = ''approved''',
  array[1],
  'Anon can view approved comments on published articles'
);

-- 2. Anon cannot view pending comments
select is_empty(
  'select id from public.comments where status = ''pending''',
  'Anon cannot view pending comments'
);

-- 3. Anon cannot select commenter_email (privilege denied at Postgres level)
select throws_ok(
  'select commenter_email from public.comments',
  '42501', -- permission denied
  null,
  'Anon is denied SELECT on commenter_email'
);

-- 4. Anon cannot select moderated_at (privilege denied at Postgres level)
select throws_ok(
  'select moderated_at from public.comments',
  '42501', -- permission denied
  null,
  'Anon is denied SELECT on moderated_at'
);

-- 5. Anon can insert a valid pending comment on a published article
select lives_ok(
  $$insert into public.comments (article_id, commenter_name, commenter_email, body)
    values ('20000000-0000-0000-0000-000000000001', 'Reader Test', 'reader-test@example.invalid', 'Test comment text')$$,
  'Anon can insert a pending comment on a published article'
);

-- 6. Anon cannot insert an approved comment (denied by column grant or RLS check)
select throws_ok(
  $$insert into public.comments (article_id, commenter_name, commenter_email, body, status)
    values ('20000000-0000-0000-0000-000000000001', 'Attacker', 'attacker@example.invalid', 'Sneaky comment', 'approved')$$,
  '42501', -- permission denied
  null,
  'Anon cannot insert approved comments'
);

-- 7. Anon cannot insert comments on draft articles (RLS check violation)
select throws_ok(
  $$insert into public.comments (article_id, commenter_name, commenter_email, body)
    values ('20000000-0000-0000-0000-000000000002', 'Draft Commenter', 'draft-commenter@example.invalid', 'Comment on draft')$$,
  '42501', -- RLS check violation throws 42501
  null,
  'Anon cannot insert comments on draft articles'
);

-- 8. Anon cannot update comments
select throws_ok(
  'update public.comments set body = ''Changed''',
  '42501',
  null,
  'Anon cannot update comments'
);

-- 9. Anon cannot delete comments
select throws_ok(
  'delete from public.comments',
  '42501',
  null,
  'Anon cannot delete comments'
);

select * from finish();
rollback;
