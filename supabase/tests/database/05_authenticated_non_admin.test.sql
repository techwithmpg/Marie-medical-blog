-- Test Suite: 05_authenticated_non_admin.test.sql
-- Description: Verifies that authenticated non-admin users cannot perform admin mutations or access private data.

begin;
select plan(12);

-- Switch to authenticated non-admin role
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000002", "email": "synthetic-reader@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000002';

-- 1. private.is_admin() returns false
select is(
  private.is_admin(),
  false,
  'Non-admin user is not recognized as admin'
);

-- 2. Non-admin cannot see draft articles
select is_empty(
  'select id from public.articles where status = ''draft''',
  'Non-admin cannot see draft articles'
);

-- 3. Non-admin cannot see archived articles
select is_empty(
  'select id from public.articles where status = ''archived''',
  'Non-admin cannot see archived articles'
);

-- 4. Non-admin cannot insert articles (fails WITH CHECK)
select throws_ok(
  'insert into public.articles (title, slug, status) values (''NonAdmin Article'', ''nonadmin-article'', ''draft'')',
  '42501',
  null,
  'Non-admin cannot insert articles'
);

-- 5. Non-admin cannot update articles (affects 0 rows due to RLS USING)
select results_eq(
  $$with updated as (update public.articles set title = 'Hacked' where status = 'published' returning id) select count(*)::integer from updated$$,
  array[0],
  'Non-admin cannot update articles'
);

-- 6. Non-admin cannot see contact messages
select is_empty(
  'select id from public.contact_messages',
  'Non-admin cannot view contact messages'
);

-- 7. Non-admin cannot mutate categories (fails WITH CHECK)
select throws_ok(
  'insert into public.categories (name, slug) values (''Test Cat'', ''test-cat'')',
  '42501',
  null,
  'Non-admin cannot insert categories'
);

-- 8. Non-admin cannot update site settings (affects 0 rows due to RLS USING)
select results_eq(
  $$with updated as (update public.site_settings set site_title = 'Defaced' where id = 1 returning id) select count(*)::integer from updated$$,
  array[0],
  'Non-admin cannot update site settings'
);

-- 9. Non-admin cannot select any comments (RLS denies SELECT for non-admin)
select is_empty(
  'select id from public.comments',
  'Non-admin cannot select comments'
);

-- 10. Non-admin cannot select commenter_email (RLS denies SELECT for non-admin)
select is_empty(
  'select commenter_email from public.comments',
  'Non-admin cannot select commenter_email'
);

-- 11. Non-admin cannot insert comments (fails WITH CHECK)
select throws_ok(
  $$insert into public.comments (article_id, commenter_name, commenter_email, body)
    values ('20000000-0000-0000-0000-000000000001', 'Reader', 'reader@example.invalid', 'Comment')$$,
  '42501',
  null,
  'Non-admin cannot insert comments'
);

-- 12. Non-admin cannot approve comments (affects 0 rows due to RLS USING)
select results_eq(
  $$with updated as (update public.comments set status = 'approved' where status = 'pending' returning id) select count(*)::integer from updated$$,
  array[0],
  'Non-admin cannot approve comments'
);

select * from finish();
rollback;
