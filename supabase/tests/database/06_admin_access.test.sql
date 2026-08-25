-- Test Suite: 06_admin_access.test.sql
-- Description: Verifies full administrative access for allowlisted admin users.

begin;
select plan(12);

-- Switch to authenticated admin role
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000001", "email": "synthetic-admin@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000001';

-- 1. private.is_admin() returns true
select is(
  private.is_admin(),
  true,
  'Allowlisted user is recognized as admin'
);

-- 2. Admin can see all articles (published, draft, archived)
select results_eq(
  'select count(*)::integer from public.articles',
  array[10],
  'Admin can view all articles across statuses'
);

-- 3. Admin can insert an article
select lives_ok(
  $$insert into public.articles (title, slug, status, category_id)
    values ('Admin Test Article', 'admin-test-article', 'draft', '10000000-0000-0000-0000-000000000001')$$,
  'Admin can insert articles'
);

-- 4. Admin can update articles
select lives_ok(
  $$update public.articles set title = 'Updated Title' where slug = 'admin-test-article'$$,
  'Admin can update articles'
);

-- 5. Admin can delete articles
select lives_ok(
  $$delete from public.articles where slug = 'admin-test-article'$$,
  'Admin can delete articles'
);

-- 6. Admin can see all comments including pending
select results_eq(
  'select count(*)::integer from public.comments',
  array[2],
  'Admin can view all comments across statuses'
);

-- 7. Admin can select commenter_email
select isnt_empty(
  'select commenter_email from public.comments',
  'Admin can read commenter emails'
);

-- 8. Admin can select moderated_at
select isnt_empty(
  'select moderated_at from public.comments where status = ''approved''',
  'Admin can read moderated_at timestamp'
);

-- 9. Admin can insert comments directly
select lives_ok(
  $$insert into public.comments (article_id, commenter_name, commenter_email, body, status, moderated_at)
    values ('20000000-0000-0000-0000-000000000001', 'Admin Note', 'admin@example.invalid', 'Author response', 'approved', now())$$,
  'Admin can insert comments'
);

-- 10. Admin can moderate comments
select lives_ok(
  $$update public.comments set status = 'approved', moderated_at = now() where id = '40000000-0000-0000-0000-000000000002'$$,
  'Admin can approve pending comments'
);

-- 11. Admin can see contact messages
select results_eq(
  'select count(*)::integer from public.contact_messages',
  array[1],
  'Admin can view contact messages'
);

-- 12. Admin can update contact message status
select lives_ok(
  $$update public.contact_messages set status = 'read' where id = '50000000-0000-0000-0000-000000000001'$$,
  'Admin can update contact message status'
);

select * from finish();
rollback;
