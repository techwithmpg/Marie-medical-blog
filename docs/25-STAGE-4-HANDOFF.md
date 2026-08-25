# Stage 4 — Authentication & Admin Access Handoff

## Objective completed

Delivered the complete V1 single-admin authentication foundation and administrative route protection system for Marie Medical Blog under D026 and D027:

- **Supabase SSR Auth Integration:** Request-scoped `@supabase/ssr` server and browser client helpers using cookie-based token handling.
- **Dedicated Admin Login (`/admin/login`):** Evidence Folio branded editorial login form using email/password authentication (`signInWithPassword`) with strict generic error messaging.
- **Next.js 16 Proxy Session Refresh (`src/proxy.ts`):** Lightweight session token refresh via `supabase.auth.getClaims()` and baseline unauthenticated redirection.
- **Server Authorization Gate (`requireAdmin()`):** Dedicated server-side authorization barrier verifying cryptographic JWT claims and allowlist membership via `public.is_admin()`.
- **Authorization RPC (`public.is_admin()`):** Canonical `SECURITY INVOKER` database function delegating to `private.is_admin()` without exposing private admin data.
- **Admin Allowlist (`private.admin_users`):** Strict, RLS-protected private schema allowlist mapping authorized administrator `user_id`.
- **Public Signup Disabled:** Enforced at both local (`supabase/config.toml`) and hosted Supabase Auth levels (`Allow new users to sign up = OFF`, `Anonymous sign-ins = OFF`).
- **Protected Editorial Workspace (`/admin`):** Editorial dashboard wrapped in `AdminShell` rendered exclusively for authorized administrator sessions.
- **Logout Action:** Cookie-clearing Server Action wired to editorial shell navigation controls with immediate redirect to `/admin/login`.
- **Hosted Database Migration:** Single reviewed migration `20260825081012_add_public_is_admin_rpc.sql` deployed and verified on hosted Supabase project `eoexnnhqzrkurbqgbtnx`.
- **Production Admin Provisioning:** Exactly one administrator identity created in Supabase Auth and associated with `private.admin_users`.
- **Real Production Verification:** Project-owner verified end-to-end authentication, session persistence, logout, and post-logout access denial.

## Files / areas changed

### Application & Client Architecture
- `src/lib/supabase/client.ts` — browser-side Supabase client using publishable credentials
- `src/lib/supabase/server.ts` — request-scoped server Supabase client using Next.js `cookies()`
- `src/lib/supabase/proxy.ts` — proxy session refresh helper using `getClaims()` and cookie propagation
- `src/proxy.ts` — Next.js 16 proxy interceptor
- `src/lib/auth/admin.ts` — server authorization gate (`requireAdmin()`)
- `src/app/admin/login/actions.ts` — `loginAction` and `logoutAction` server actions
- `src/app/admin/login/page.tsx` & `src/app/admin/login/login-form.tsx` — Evidence Folio login interface
- `src/app/admin/layout.tsx` — protected editorial layout enforcing `requireAdmin()`
- `src/app/admin/page.tsx` — authenticated editorial dashboard overview
- `src/components/admin/admin-shell.tsx` & `src/components/admin/admin-mobile-nav.tsx` — logout integration

### Database & Security
- `supabase/migrations/20260825081012_add_public_is_admin_rpc.sql` — `public.is_admin()` RPC
- `supabase/tests/database/08_public_is_admin_rpc.test.sql` — pgTAP security test suite
- `supabase/config.toml` — local Auth configuration hardening (`enable_signup = false`)

### Governance & Status Documentation
- `docs/11-DECISION-LOG.md` — D026 and D027 architecture decisions
- `docs/13-PROJECT-STATUS.md` — Stage 4 progress, hosted verification, and final gate records
- `docs/24-STAGE-4-AUTH-ADMIN-DESIGN.md` — Stage 4 technical design document
- `docs/25-STAGE-4-HANDOFF.md` — Stage 4 completion handoff

## Database changes

- **Migration Version:** `20260825081012_add_public_is_admin_rpc.sql`
- **Function:** `public.is_admin()`
  - Language: `sql`
  - Security: `SECURITY INVOKER` (`is_security_definer = false`)
  - Volatility: `STABLE`
  - Parameters: 0 arguments
  - Search Path: `set search_path = ''` (locked to empty)
  - Permissions: revoked from `public, anon`; granted to `authenticated`
  - Logic: `select private.is_admin();`

## Environment changes

- **Zero Secret Credentials:** No service-role key or private secret introduced into application runtime or repository.
- **Contract Maintained:** Application continues to rely strictly on:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Environment variables remain documented in `.env.example` and untracked in `.env.local`.

## Decisions

- **D026:** Stage-4 single-admin authentication & route protection architecture (`ACTIVE / FROZEN FOR STAGE 4`)
- **D027:** Stage-4 controlled MCP migration deployment and version reconciliation (`ACTIVE / FROZEN FOR STAGE 4`)

## Verification

- **pgTAP Test Suite:** 8 files, 95 tests, 100% PASS (including `08_public_is_admin_rpc.test.sql`)
- **Database Lint:** PASS (`supabase db lint --level warning --local` returned 0 errors, 0 warnings)
- **TypeScript Typecheck:** PASS (`tsc --noEmit` returned 0 errors)
- **ESLint:** PASS (`eslint .` returned 0 errors, 0 warnings)
- **Prettier Format Check:** PASS (`prettier . --check` verified)
- **Production Build:** PASS (`next build` compiled routes `/`, `/_not-found`, `/admin`, `/admin/login`)
- **Git Diff Cleanliness:** PASS (`git diff --check` clean)
- **Anonymous Route Protection:** `GET /admin` redirects (307) to `/admin/login`
- **Non-Admin Authorization Gate:** `public.is_admin()` evaluates to `false`; session revoked with generic error
- **Real Production Admin Verification (Owner Confirmed):**
  - Production login: PASS
  - Protected `/admin` access: PASS
  - Session refresh persistence: PASS
  - Logout Server Action: PASS
  - Post-logout `/admin` access denial: PASS
- **Hosted Identity Counts:**
  - `auth.users count` = 1
  - `private.admin_users count` = 1
  - Valid matching relationship count = 1
  - Orphan admin allowlist rows = 0

## Known limitations

- **Single-Admin Architecture:** System is intentionally tailored for single-administrator operation (Marie). Multi-user administration and RBAC are excluded from V1 scope by design.
- **Administrative Password Management:** Self-service password recovery is omitted in V1; password resets are handled out-of-band via Supabase Dashboard.
- **Public Content Pages:** Public static and identity pages are not implemented in Stage 4 (scheduled for subsequent stages).

## Scope not implemented

Explicitly out of scope for Stage 4:

- Reader authentication / public user accounts
- Multi-author role-based access control (RBAC)
- OAuth / Social login providers
- Phone / SMS authentication
- Magic link login flows
- Public signup endpoints
- Stage 5 public static & identity pages

## Next-stage readiness

- **Stage 4 Status:** COMPLETE / GATE PASS
- **Merge Status:** READY FOR OWNER MERGE REVIEW
- **Next Stage:** Stage 5 — Public Static / Identity Pages — **NOT AUTHORIZED** (Requires owner-approved merge of `stage/04-auth-admin` into `main` and explicit Stage 5 authorization)

## Security / privacy

- **No Credentials Committed:** No emails, passwords, API secrets, service-role keys, or identifying Auth UUIDs are stored in repository files, commit logs, or documentation.
