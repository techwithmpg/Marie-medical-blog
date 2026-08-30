-- Test Suite: 06_admin_access.test.sql
-- Description: Verifies full administrative access for allowlisted admin users.

begin;
select plan(12);

-- Restore the canonical synthetic comment fixtures inside this transaction.
-- Previous browser verification may legitimately mutate/delete local rows.
-- The final rollback keeps this setup non-persistent.
insert into public.comments (
  id,
  article_id,
  commenter_name,
  commenter_email,
  body,
  status,
  moderated_at
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Synthetic Approved Comment',
    'synthetic-approved@example.invalid',
    'Synthetic approved comment fixture for local administrative access testing.',
    'approved',
    now()
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Synthetic Pending Comment',
    'synthetic-pending@example.invalid',
    'Synthetic pending comment fixture for local administrative access testing.',
    'pending',
    null
  )
on conflict (id) do update
set
  article_id = excluded.article_id,
  commenter_name = excluded.commenter_name,
  commenter_email = excluded.commenter_email,
  body = excluded.body,
  status = excluded.status,
  moderated_at = excluded.moderated_at;

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
  'select count(*)::integer
     from public.articles
    where id in (
      ''20000000-0000-0000-0000-000000000001'',
      ''20000000-0000-0000-0000-000000000002'',
      ''20000000-0000-0000-0000-000000000003'',
      ''20000000-0000-0000-0000-000000000004'',
      ''20000000-0000-0000-0000-000000000005'',
      ''20000000-0000-0000-0000-000000000006'',
      ''20000000-0000-0000-0000-000000000007'',
      ''20000000-0000-0000-0000-000000000008'',
      ''20000000-0000-0000-0000-000000000009'',
      ''20000000-0000-0000-0000-000000000010''
    )',
  array[10],
  'Admin can view all synthetic seed articles across statuses'
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

-- 6. Admin can see all synthetic seed comments including pending
select results_eq(
  'select count(*)::integer
     from public.comments
    where id in (
      ''40000000-0000-0000-0000-000000000001'',
      ''40000000-0000-0000-0000-000000000002''
    )',
  array[2],
  'Admin can view all synthetic seed comments across statuses'
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

-- 11. Admin can see the synthetic seed contact message
select results_eq(
  'select count(*)::integer
     from public.contact_messages
    where id = ''50000000-0000-0000-0000-000000000001''',
  array[1],
  'Admin can view the synthetic seed contact message'
);

-- 12. Admin can update contact message status
select lives_ok(
  $$update public.contact_messages set status = 'read' where id = '50000000-0000-0000-0000-000000000001'$$,
  'Admin can update contact message status'
);

select * from finish();
rollback;
