-- Test Suite: 01_schema_structure.test.sql
-- Description: Verifies schema existence, table structures, PKs, constraints, indexes, and RLS enablement.

begin;
select plan(28);

-- 1. Schema Existence
select has_schema('public', 'Schema public exists');
select has_schema('private', 'Schema private exists');

-- 2. Table Existence
select has_table('private', 'admin_users', 'Table private.admin_users exists');
select has_table('public', 'profiles', 'Table public.profiles exists');
select has_table('public', 'categories', 'Table public.categories exists');
select has_table('public', 'articles', 'Table public.articles exists');
select has_table('public', 'article_references', 'Table public.article_references exists');
select has_table('public', 'comments', 'Table public.comments exists');
select has_table('public', 'contact_messages', 'Table public.contact_messages exists');
select has_table('public', 'site_settings', 'Table public.site_settings exists');

-- 3. Functions Existence
select has_function('private', 'is_admin', 'Function private.is_admin() exists');
select has_function('public', 'set_updated_at', 'Function public.set_updated_at() exists');

-- 4. RLS Enablement Verification
select ok(
  (select relrowsecurity from pg_class where relname = 'admin_users' and relnamespace = 'private'::regnamespace),
  'RLS is enabled on private.admin_users'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'profiles' and relnamespace = 'public'::regnamespace),
  'RLS is enabled on public.profiles'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'categories' and relnamespace = 'public'::regnamespace),
  'RLS is enabled on public.categories'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'articles' and relnamespace = 'public'::regnamespace),
  'RLS is enabled on public.articles'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'article_references' and relnamespace = 'public'::regnamespace),
  'RLS is enabled on public.article_references'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'comments' and relnamespace = 'public'::regnamespace),
  'RLS is enabled on public.comments'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'contact_messages' and relnamespace = 'public'::regnamespace),
  'RLS is enabled on public.contact_messages'
);
select ok(
  (select relrowsecurity from pg_class where relname = 'site_settings' and relnamespace = 'public'::regnamespace),
  'RLS is enabled on public.site_settings'
);

-- 5. Primary Key & Unique Constraints
select col_is_pk('public', 'profiles', 'id', 'public.profiles id is primary key');
select col_is_pk('public', 'categories', 'id', 'public.categories id is primary key');
select col_is_pk('public', 'articles', 'id', 'public.articles id is primary key');
select col_is_pk('public', 'article_references', 'id', 'public.article_references id is primary key');
select col_is_pk('public', 'comments', 'id', 'public.comments id is primary key');
select col_is_pk('public', 'contact_messages', 'id', 'public.contact_messages id is primary key');
select col_is_pk('public', 'site_settings', 'id', 'public.site_settings id is primary key');
select col_is_pk('private', 'admin_users', 'user_id', 'private.admin_users user_id is primary key');

select * from finish();
rollback;
