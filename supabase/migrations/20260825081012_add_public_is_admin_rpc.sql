-- Migration: Add public.is_admin() authorization RPC for single-admin Next.js client
-- Date: 2026-08-25
-- Stage 4: Authentication & Admin Access (D026)

create or replace function public.is_admin()
returns boolean
language sql
security invoker
set search_path = ''
stable
as $$
  select private.is_admin();
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

comment on function public.is_admin() is
  'Returns the current authenticated caller admin allowlist status without exposing private admin data.';
