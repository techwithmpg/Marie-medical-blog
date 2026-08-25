-- Test Suite: 08_public_is_admin_rpc.test.sql
-- Description: Verifies public.is_admin() RPC function existence, security invoker behavior, zero-argument signature, anon execution denial, authenticated non-admin vs allowlisted admin responses, and continued protection of private.admin_users.
-- Stage 4: Authentication & Admin Access (D026)

begin;
select plan(10);

-- 1. Verify public.is_admin() function exists
select has_function(
  'public',
  'is_admin',
  array[]::text[],
  'public.is_admin() function exists with zero arguments'
);

-- 2. Verify function returns boolean
select function_returns(
  'public',
  'is_admin',
  array[]::text[],
  'boolean',
  'public.is_admin() returns boolean'
);

-- 3. Anonymous caller: EXECUTE on public.is_admin() must be denied (throws 42501)
set local role anon;
set local "request.jwt.claims" = '{}';

select throws_ok(
  'select public.is_admin()',
  '42501',
  null,
  'Anonymous role cannot execute public.is_admin()'
);

-- 4. Anonymous caller: direct SELECT on private.admin_users is denied (throws 42501)
select throws_ok(
  'select * from private.admin_users',
  '42501',
  null,
  'Anonymous role cannot select from private.admin_users'
);

-- 5. Authenticated non-admin caller: receives false from public.is_admin()
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000002", "email": "synthetic-reader@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000002';

select is(
  public.is_admin(),
  false,
  'Authenticated non-admin caller receives false from public.is_admin()'
);

-- 6. Authenticated non-admin caller: direct SELECT on private.admin_users is denied (throws 42501)
select throws_ok(
  'select * from private.admin_users',
  '42501',
  null,
  'Authenticated non-admin cannot select from private.admin_users'
);

-- 7. Authenticated allowlisted admin caller: receives true from public.is_admin()
set local role authenticated;
set local "request.jwt.claims" = '{"role": "authenticated", "sub": "00000000-0000-0000-0000-000000000001", "email": "synthetic-admin@example.invalid"}';
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000001';

select is(
  public.is_admin(),
  true,
  'Authenticated allowlisted admin caller receives true from public.is_admin()'
);

-- 8. Authenticated admin caller: direct SELECT on private.admin_users remains revoked (throws 42501)
select throws_ok(
  'select * from private.admin_users',
  '42501',
  null,
  'Authenticated role cannot directly select from private.admin_users table'
);

-- 9. Passing arbitrary argument to public.is_admin() fails (cannot probe other user IDs)
select throws_ok(
  $$select public.is_admin('00000000-0000-0000-0000-000000000001'::uuid)$$,
  '42883',
  null,
  'public.is_admin does not accept arguments to probe arbitrary user IDs'
);

-- 10. Verify private.is_admin() direct call parity for authenticated admin
select is(
  private.is_admin(),
  true,
  'private.is_admin() behavior remains intact for allowlisted admin'
);

select * from finish();
rollback;
