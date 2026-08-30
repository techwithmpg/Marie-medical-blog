-- Test Suite: 02_anonymous_access.test.sql
-- Description: Verifies access boundaries for anonymous (unauthenticated) users.

begin;
select plan(12);

-- Set role to anonymous
set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';
set local "request.jwt.claim.sub" = '';

-- 1. Anonymous can select published articles
select results_eq(
  'select count(*)::integer
     from public.articles
    where status = ''published''
      and id in (
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
  array[8],
  'Anon can view all published synthetic seed articles'
);

-- 2. Anonymous cannot see draft articles
select is_empty(
  'select id from public.articles where status = ''draft''',
  'Anon cannot view draft articles'
);

-- 3. Anonymous cannot see archived articles
select is_empty(
  'select id from public.articles where status = ''archived''',
  'Anon cannot view archived articles'
);

-- 4. Anonymous cannot insert articles
select throws_ok(
  'insert into public.articles (title, slug, status) values (''Anon Test'', ''anon-test'', ''draft'')',
  '42501', -- permission denied
  null,
  'Anon cannot insert articles'
);

-- 5. Anonymous cannot update articles
select throws_ok(
  'update public.articles set title = ''Hacked'' where status = ''published''',
  '42501', -- permission denied
  null,
  'Anon cannot update articles'
);

-- 6. Anonymous cannot delete articles
select throws_ok(
  'delete from public.articles where status = ''published''',
  '42501', -- permission denied
  null,
  'Anon cannot delete articles'
);

-- 7. Anonymous can view references for published articles
select results_eq(
  'select count(*)::integer from public.article_references where article_id = ''20000000-0000-0000-0000-000000000001''',
  array[2],
  'Anon can view references for published articles'
);

-- 8. Anonymous cannot view references for draft articles
select is_empty(
  'select id from public.article_references where article_id = ''20000000-0000-0000-0000-000000000002''',
  'Anon cannot view references for draft articles'
);

-- 9. Anonymous can view public categories
select isnt_empty(
  'select id from public.categories',
  'Anon can view categories'
);

-- 10. Anonymous can view public profiles
select isnt_empty(
  'select id from public.profiles',
  'Anon can view profiles'
);

-- 11. Anonymous can view public site settings
select isnt_empty(
  'select id from public.site_settings',
  'Anon can view site settings'
);

-- 12. Anonymous cannot mutate categories
select throws_ok(
  'insert into public.categories (name, slug) values (''Anon Cat'', ''anon-cat'')',
  '42501', -- permission denied
  null,
  'Anon cannot insert categories'
);

select * from finish();
rollback;
