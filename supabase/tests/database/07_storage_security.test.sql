-- Test Suite: 07_storage_security.test.sql
-- Description: Verifies Storage bucket configuration and object RLS access policies.

begin;
select plan(7);

-- 1. Verify public-assets bucket configuration
select results_eq(
  'select public from storage.buckets where id = ''public-assets''',
  array[true],
  'Bucket public-assets is configured as public'
);

-- 2. Verify file size limit (10MB)
select results_eq(
  'select file_size_limit from storage.buckets where id = ''public-assets''',
  array[10485760::bigint],
  'Bucket public-assets enforces 10MB limit'
);

-- Switch to anonymous role
set local role anon;
set local "request.jwt.claims" = '{"role": "anon"}';
set local "request.jwt.claim.sub" = '';

-- 3. Anon cannot insert storage objects
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner) values ('public-assets', 'anon-file.jpg', null)$$,
  '42501',
  null,
  'Anon cannot insert storage objects'
);

-- Switch to authenticated non-admin
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000002", "email": "synthetic-reader@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000002';

-- 4. Non-admin authenticated user cannot insert storage objects
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner) values ('public-assets', 'reader-file.jpg', '00000000-0000-0000-0000-000000000002')$$,
  '42501',
  null,
  'Non-admin cannot insert storage objects'
);

-- Switch to authenticated admin
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000001", "email": "synthetic-admin@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000001';

-- 5. Admin can insert storage objects
select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner) values ('public-assets', 'admin-file.jpg', '00000000-0000-0000-0000-000000000001')$$,
  'Admin can insert storage objects into public-assets'
);

-- 6. Admin can update storage objects
select lives_ok(
  $$update storage.objects set metadata = '{"updated": true}'::jsonb where name = 'admin-file.jpg'$$,
  'Admin can update storage objects in public-assets'
);

-- 7. Admin delete policy exists on storage.objects
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can delete public assets'
      and cmd = 'DELETE'
  ),
  'Admin delete policy exists on storage.objects'
);

select * from finish();
rollback;
