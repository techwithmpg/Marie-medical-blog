# 24 — Stage 4 Authentication & Admin Access Design

**Status:** PROPOSED — AWAITING OWNER ARCHITECTURE APPROVAL  
**Stage:** Stage 4 — Authentication & Admin Access  
**Date:** 2026-08-25  
**Author:** AI Development Agent  
**Governing Documents:** `AI_CONTEXT.md`, `AGENTS.md`, `docs/01-SCOPE-FREEZE.md`, `docs/03-INFORMATION-ARCHITECTURE.md`, `docs/05-SECURITY-RLS.md`, `docs/08-DEVELOPMENT-STAGES.md`, `docs/11-DECISION-LOG.md`, `docs/13-PROJECT-STATUS.md`, `docs/18-UI-IMPLEMENTATION-CONTRACT.md`, `docs/23-STAGE-3-DATABASE-SECURITY-DESIGN.md`

---

## 1. Stage-4 Scope

Stage 4 establishes the minimum secure, single-admin authentication and route authorization boundary for Marie Medere.

### Deliverables:
- **Dedicated Admin Login:** Calm, restrained login interface at `/admin/login` matching the Evidence Folio design contract.
- **Client Architecture:** Next.js cookie-based Supabase client integration using `@supabase/ssr` and `@supabase/supabase-js` adhering to the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` environment contract.
- **Session Refresh:** Next.js 16 `proxy.ts` request interceptor for automatic token refresh, cookie synchronization, and anonymous-request redirection.
- **Server Authorization Gate:** `requireAdmin()` server-side helper validating cryptographic identity legitimacy via `supabase.auth.getClaims()` and verifying allowlist membership via `public.is_admin()`, acting strictly as an access gate without attempting invalid cookie mutations in Server Components.
- **Database Authorization RPC:** Minimal, authenticated-only SQL function `public.is_admin()` defined with `security invoker` in PostgreSQL delegating directly to `private.is_admin()`.
- **Protected Workspace Shell:** Server-protected layout for `/admin` and sub-routes wrapped in the existing `AdminShell`.
- **Secure Session Termination:** Explicit logout and failed non-admin sign-in termination handled in cookie-writing server contexts (Server Actions).
- **Unauthorized & Non-Admin Defense:** Generic error messages, immediate access denial, and session revocation in Server Actions for non-allowlisted visitors.
- **Service-Level Signup Prevention:** Disablement of arbitrary public signups at the Supabase Auth service level via native hosted configuration.
- **Automated Verification:** Comprehensive pgTAP tests for database functions and end-to-end route protection quality gates.

---

## 2. Official Documentation Findings

Research conducted on **2026-08-25** using current official documentation:

| Domain | Source URL | Key Technical Mandate |
| :--- | :--- | :--- |
| **Supabase SSR for Next.js** | `https://supabase.com/docs/guides/auth/server-side/creating-a-client` | Deprecates `@supabase/auth-helpers-nextjs`. Mandates `@supabase/ssr` with `createBrowserClient` (singleton in browser) and `createServerClient` (per-request in Server Components/Actions/Proxy with `getAll` / `setAll(cookiesToSet, headers)` handlers). Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. |
| **Server Identity Validation** | `https://supabase.com/docs/guides/auth/server-side/creating-a-client` | `supabase.auth.getClaims()` is the primary method for validating identity when protecting pages and user data because it verifies the cryptographic JWT signature against project keys without relying on unvalidated local cookie state. `getUser()` may be used only when a fresh Auth user record is genuinely required. `getSession()` must never be trusted for authorization decisions. Never insert arbitrary code between `createServerClient()` and `getClaims()`. |
| **Password Authentication** | `https://supabase.com/docs/guides/auth/passwords` | Use `supabase.auth.signInWithPassword({ email, password })`. PKCE flow is default with SSR. Login errors must be generic to prevent email enumeration or disclosure of allowlist status. |
| **Next.js 16 Proxy Convention** | `https://nextjs.org/docs/app/getting-started/proxy` | Next.js 16 supports `proxy.ts` with matcher configuration to intercept requests, refresh auth cookies via `updateSession()`, and pass updated headers/cookies to downstream Server Components and back to the browser. |
| **User Administration & Signup Disablement** | `https://supabase.com/docs/guides/auth/managing-user-data` | The official setting is **"Allow new users to sign up"**. When disabled, only existing users can sign in. Disabling this setting in Supabase Auth (`Allow new users to sign up = OFF`) prevents arbitrary account creation via the public publishable key. Marie is provisioned directly out-of-band. |

---

## 3. Package Recommendation & Version Policy

### Required Production Dependencies:
- `@supabase/supabase-js`
- `@supabase/ssr`

### Package Version Policy:
At implementation time, the agent must inspect current official package releases, verify version compatibility with Next.js 16 and React 19, install the current appropriate compatible releases, and allow `package-lock.json` to freeze the exact resolved versions.

### Explicit Exclusions:
- No `@supabase/auth-helpers-nextjs` (deprecated).
- No third-party auth libraries (NextAuth/Auth.js, Clerk, Lucia, Firebase Auth).
- No new UI component libraries or form frameworks.

---

## 4. Supabase Client Architecture

Two client factories will be created in `src/lib/supabase/` using the repository's authoritative environment contract (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`):

### A. Browser Client (`src/lib/supabase/client.ts`)
Creates a client for use in Client Components:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
```

### B. Server Client (`src/lib/supabase/server.ts`)
Creates a request-scoped client for Server Components, Server Actions, and Route Handlers:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // Ignored because Next.js 16 proxy refreshes tokens and sets cookies.
          }
        },
      },
    },
  );
}
```

---

## 5. Next.js Proxy & Session Refresh Responsibilities

In Next.js 16 App Router, `proxy.ts` handles cookie refreshing and baseline routing checks.

### Proxy Responsibilities:
1. Refresh Supabase auth session tokens by calling `supabase.auth.getClaims()` immediately after `createServerClient()`.
2. Apply refreshed cookies and response headers (cache-control headers) from `@supabase/ssr` to the response.
3. Redirect unauthenticated (anonymous) visitors attempting to access `/admin/*` (other than `/admin/login`) to `/admin/login`.

### What the Proxy Must NOT Do:
1. **The Proxy must NOT equate "authenticated" with "admin".** Authenticated non-admin users must not be permitted into `/admin` by the proxy.
2. **The Proxy must NOT redirect authenticated visitors from `/admin/login` to `/admin`.** If an authenticated non-admin user visits `/admin/login`, automatically bouncing them to `/admin` would cause an open redirect loop or premature routing error.
3. **The Proxy must NOT replace `requireAdmin()`.** The server-side `requireAdmin()` helper remains the sole authoritative gate for verifying `private.admin_users` allowlist membership.

### A. Proxy Entrypoint (`src/proxy.ts`)
```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### B. Session Updater (`src/lib/supabase/proxy.ts`)
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value),
            );
          }
        },
      },
    },
  );

  // IMPORTANT: Do not insert code between createServerClient and getClaims().
  // getClaims() cryptographically validates the JWT against project keys.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const isAccessingAdmin = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname.startsWith("/admin/login");

  // Redirect unauthenticated requests to /admin/* to login
  if (!claims && isAccessingAdmin && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

---

## 6. Server-Side `requireAdmin` Design

`requireAdmin()` in `src/lib/auth/admin.ts` provides authoritative server-side defense in depth for Server Components (`src/app/admin/layout.tsx`) and administrative Server Actions:

```typescript
// src/lib/auth/admin.ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface AuthenticatedAdmin {
  id: string;
  email?: string;
}

export async function requireAdmin(): Promise<AuthenticatedAdmin> {
  const supabase = await createClient();

  // 1. Cryptographic token & claims verification
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (claimsError || !claims?.sub) {
    redirect("/admin/login");
  }

  // 2. Authorize allowlist membership against private.admin_users
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");

  if (rpcError || isAdmin !== true) {
    // Deny access immediately without attempting invalid cookie mutations
    redirect("/admin/login");
  }

  return {
    id: claims.sub as string,
    email: claims.email as string | undefined,
  };
}
```

### Authorization Rules:
1. **Authorization Gate Only:** `requireAdmin()` functions strictly as an access gate. It does NOT call `supabase.auth.signOut()` or attempt to mutate response cookies from within a Server Component, as Next.js Server Components cannot reliably write response headers or cookies.
2. **Authoritative Access Denial:** Access to `/admin` is completely blocked whenever `claims?.sub` is missing or `public.is_admin()` does not return `true`.
3. **No Authorization by Email:** Identity and authorization rely strictly on `auth.uid()` / `claims.sub` evaluated in PostgreSQL. Email strings are never used for access control decisions.
4. **Display-Only Email:** If email is needed for the admin UI header, it is read from verified claims (`claims.email`) or retrieved via `getUser()` only when a fresh Auth user record is genuinely needed.
5. **Generic Unauthorized Behavior:** If authentication or allowlist checks fail, the user is redirected to `/admin/login` without disclosing internal database details.

---

## 7. Admin Allowlist Lookup Mechanism (`public.is_admin()`)

In Stage 3, `private.admin_users` and `private.is_admin()` were established. Stage 3 already granted the `authenticated` role `USAGE` on schema `private` and `EXECUTE` on `private.is_admin()`, with `private.is_admin()` hardened as `SECURITY DEFINER` with `set search_path = ''`.

Because PostgREST exposes the `public` schema, Stage 4 introduces a minimal, authenticated-only proxy function defined as **`SECURITY INVOKER`**:

```sql
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
  'Exposes private.is_admin() boolean check to authenticated callers without exposing private schema.';
```

### Security Properties:
1. **Security Invoker:** Runs with caller permissions, cleanly delegating to the underlying `private.is_admin()` which enforces `SECURITY DEFINER`.
2. **Zero Arguments:** Takes 0 arguments; strictly derives caller identity from `auth.uid()`.
3. **Zero Probing:** Callers cannot supply arbitrary user IDs to probe another user's authorization status.
4. **Zero Data Exposure:** Returns a scalar boolean; never exposes UUIDs, emails, or table rows from `private.admin_users`.
5. **Anon Denial:** Direct execution by anonymous callers is rejected with PostgreSQL error `42501 (permission denied)`.

---

## 8. Login Route & Service-Level Signup Disablement

**Route:** `/admin/login`

### Architectural Requirements:
1. **No Application Signup:** The application codebase contains zero signup forms, zero signup Server Actions, and zero calls to `supabase.auth.signUp()`.
2. **Service-Level Signup Disablement:** Because the Supabase publishable key is public, arbitrary user creation must be disabled at the Supabase Auth service level.
   - **Hosted Setting:** In the Supabase Dashboard under `Authentication > Sign In / Providers`, set **Allow new users to sign up** to **OFF** (`Allow new users to sign up = OFF`).
   - **Local CLI Setting:** In `supabase/config.toml`, ensure `[auth.email] enable_signup = false`.
   - **Official Semantics:** As stated in official Supabase documentation, "If disabled, only existing users can sign in." This ensures that direct POST requests to `/auth/v1/signup` using the publishable key are rejected at the API gateway.
3. **Provider Verification:** Implementation verification must confirm:
   - `Allow new users to sign up` = OFF;
   - `Allow anonymous sign-ins` = OFF;
   - Unused OAuth and phone providers remain disabled for this V1 admin flow.
   - Marie is provisioned directly out-of-band.

---

## 9. Login Action & Generic Error Policy

Located in `src/app/admin/login/actions.ts`:
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface LoginActionResult {
  error?: string;
}

const GENERIC_AUTH_ERROR = "Unable to sign in with those credentials.";

export async function loginAction(
  formData: FormData,
): Promise<LoginActionResult | void> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const supabase = await createClient();

  // 1. Authenticate credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: GENERIC_AUTH_ERROR };
  }

  // 2. Authorize allowlist membership
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");

  if (rpcError || isAdmin !== true) {
    // Valid password authentication, but account is not allowlisted
    // In a Server Action context, signOut() successfully clears response cookies
    await supabase.auth.signOut();
    return { error: GENERIC_AUTH_ERROR };
  }

  redirect("/admin");
}
```

### Generic Error Policy:
- The system returns the exact same generic error message (`"Unable to sign in with those credentials."`) whether:
  - The email does not exist;
  - The password is incorrect;
  - The user authenticated successfully but is not in `private.admin_users`.
- Prevents user enumeration and conceals the existence or structure of the administrative allowlist.

---

## 10. Logout Action

Located in `src/app/admin/login/actions.ts`:
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  // Runs in a cookie-writing server mutation context (Server Action)
  await supabase.auth.signOut();
  redirect("/admin/login");
}
```

Explicit administrator logout runs through a Server Action (or POST Route Handler), ensuring cookies are reliably removed in a valid mutation context.

---

## 11. Redirect Behavior

- **Post-Login:** Validated, allowlisted Marie is redirected to `/admin`.
- **Post-Logout:** Session is invalidated via Server Action and client is redirected to `/admin/login`.
- **Open-Redirect Protection:** Redirect destinations are hardcoded or strictly validated as relative paths within `/admin`, prohibiting `//` and external URI schemes (`http:`, `javascript:`).

---

## 12. Authenticated-Non-Admin Behavior

If an authenticated user exists in `auth.users` who is NOT present in `private.admin_users`:
1. `public.is_admin()` returns `false`.
2. **In `loginAction()`:** The Server Action detects the failed allowlist check, invokes `await supabase.auth.signOut()` to clear session cookies, and returns the generic failure (`"Unable to sign in with those credentials."`).
3. **In `requireAdmin()`:** If an already-authenticated non-admin reaches `/admin` through any other session state, `requireAdmin()` immediately denies access and redirects to `/admin/login` without attempting invalid cookie mutations from the Server Component.
4. **Authoritative Invariant:** Administrative authorization is never granted merely because a valid Auth session exists.
5. **Data Protection:** Commenter email privacy under D023 remains 100% intact (`using (private.is_admin())` on `public.comments`).

---

## 13. Account Provisioning Plan

Marie Medere's account has not yet been provisioned in hosted `private.admin_users`.

The authoritative schema for `private.admin_users` is:
```sql
create table private.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now()
);
```

### Safe Out-of-Band Provisioning Flow:
1. **User Creation:** The project owner creates Marie's account via the official Supabase Dashboard (`Authentication > Users > Add User` or `Invite User`).
2. **UUID Capture:** The owner captures the generated `auth.users.id` UUID.
3. **Allowlist Insertion:** In the Supabase SQL Editor, the owner executes the one-time data insertion:
   ```sql
   insert into private.admin_users (user_id)
   values ('<marie-auth-uuid>');
   ```
4. **Data Provisioning Boundary:**
   - This is DATA provisioning, not a schema migration.
   - Marie's real UUID, email, and password must never be committed to Git or written into repository files.
   - Production provisioning requires a separate explicit owner-controlled execution gate after Marie's Auth user exists.

---

## 14. Local Testing Strategy

1. **Database Migration & pgTAP Tests (`supabase/tests/database/08_public_is_admin_rpc.test.sql`):**
   - Test 1: Anonymous caller cannot execute `public.is_admin()` (throws `42501 permission denied`).
   - Test 2: Authenticated non-admin caller receives `false` from `public.is_admin()`.
   - Test 3: Authenticated allowlisted admin caller receives `true` from `public.is_admin()`.
   - Test 4: Function takes 0 parameters (cannot pass arbitrary user ID).
   - Test 5: Direct `SELECT` on `private.admin_users` remains denied to `anon` and `authenticated`.
2. **Route Protection & Flow Verification:**
   - Unauthenticated access to `/admin` -> redirected to `/admin/login`.
   - Authenticated non-admin access -> denied access by `requireAdmin()` and redirected to `/admin/login`.
   - Non-admin login -> signed out in Server Action and returns generic error.
   - Allowlisted admin access -> renders admin workspace.
   - Logout Server Action -> terminates session and redirects to `/admin/login`.
3. **Quality Gates:**
   - `npm run typecheck`
   - `npm run lint`
   - `npm run format:check`
   - `npm run build`

---

## 15. Hosted Testing Strategy

1. Deploy the Stage-4 migration `add_public_is_admin_rpc` to hosted project `eoexnnhqzrkurbqgbtnx` via authorized MCP transport.
2. Verify migration version metadata and absence of database lint/security warnings.
3. Verify hosted Auth configuration:
   - `Allow new users to sign up` = OFF;
   - `Allow anonymous sign-ins` = OFF;
   - Unused OAuth and phone providers = disabled.
4. Verify `private.admin_users` remains protected and empty until Marie is provisioned.
5. Verify hosted public tables and storage buckets retain full RLS protection.

---

## 16. Required Migration

`supabase/migrations/<timestamp>_add_public_is_admin_rpc.sql`:

```sql
-- Migration: Add public.is_admin() authorization RPC for single-admin Next.js client
-- Date: 2026-08-25

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
  'Exposes private.is_admin() boolean check to authenticated callers without exposing private schema.';
```

---

## 17. RLS & Security Invariants

- **D001–D025 Continuity:** All previous architectural decisions remain active and unchanged.
- **Strict RLS:** All 7 public tables and `private.admin_users` maintain row level security.
- **Zero Service-Role Leakage:** Application code uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **D023 Commenter Privacy:** Authenticated non-admins cannot query comment rows or view emails.
- **Explicit Schema Boundary:** Private schema remains completely unexposed in PostgREST.

---

## 18. Files Expected to be Created/Modified

### Files to Create:
- `supabase/migrations/<timestamp>_add_public_is_admin_rpc.sql`
- `supabase/tests/database/08_public_is_admin_rpc.test.sql`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/proxy.ts`
- `src/proxy.ts`
- `src/lib/auth/admin.ts`
- `src/app/admin/login/page.tsx`
- `src/app/admin/login/actions.ts`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`

### Files to Modify:
- `package.json` / `package-lock.json` (add `@supabase/supabase-js` and `@supabase/ssr`)
- `src/components/admin/admin-shell.tsx` (wire up interactive logout button calling `logoutAction`)
- `docs/13-PROJECT-STATUS.md` (track Stage 4 implementation and gate pass)

---

## 19. Explicit Exclusions

- **No Public Signup:** No registration UI, endpoints, or public sign-up flows; disabled at Auth service level via `Allow new users to sign up = OFF`.
- **No Reader Accounts:** No reader login, reader profile, or bookmarking system.
- **No Third-Party Auth:** No OAuth, social logins, SMS OTP, or magic links.
- **No Multi-Author RBAC:** No complex permission tables or contributor roles.
- **No Stage-5 Pages:** No public Homepage, About, Contact, or Portfolio implementation.
- **No Tiptap Editor:** No rich-text editor or publishing workflows (Stage 7 — Writer Dashboard & Tiptap Editor).

---

## 20. Stage-4 Gate Evidence Required

To pass the Stage-4 quality gate, the implementation must produce verified evidence that:
1. Anonymous requests to `/admin` and `/admin/*` are intercepted and redirected to `/admin/login`.
2. Authenticated non-admin accounts are denied access by `requireAdmin()` and redirected to `/admin/login`.
3. Non-admin login attempts are signed out in `loginAction()` and return the generic error.
4. Authenticated allowlisted Marie can access the `/admin` overview dashboard.
5. Explicit logout terminates session cookies in a valid server mutation context and prevents back-navigation access.
6. All database test suites (including `08_public_is_admin_rpc.test.sql`) pass with 100% success.
7. TypeScript, ESLint, Prettier, and Next.js production build pass cleanly with 0 errors.

---

## Proposed Decision Text (D026)

*The following decision text is PROPOSED for owner approval and is NOT yet active in `docs/11-DECISION-LOG.md`.*

```markdown
## PROPOSED — D026 — Stage-4 single-admin authentication & route protection architecture

**Date:** 2026-08-25  
**Decision:** Implement the V1 single-admin authentication architecture for Marie using `@supabase/supabase-js` and `@supabase/ssr` with cookie-based SSR. House the dedicated admin login at `/admin/login` utilizing Supabase email/password authentication (`signInWithPassword`). Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` as the application environment contract. Refresh session tokens in Next.js 16 via `proxy.ts` utilizing `supabase.auth.getClaims()`. Restrict Proxy responsibilities to token refresh and baseline anonymous redirection without equating authentication with administrative privilege or replacing server authorization. Enforce server-side route protection across all `/admin` routes using a dedicated `requireAdmin()` helper that cryptographically verifies identity via `getClaims()` and evaluates allowlist membership via a new authenticated SQL proxy function `public.is_admin()` defined as `SECURITY INVOKER` delegating to `private.is_admin()`, acting strictly as an access gate without attempting cookie mutations from Server Components. Execute session revocation for failed non-admin attempts inside `loginAction()` and execute explicit logout through a cookie-writing Server Action. Apply a strict generic error policy ("Unable to sign in with those credentials.") for all authentication and allowlist failures. Disable arbitrary public signup at the Supabase Auth service level via "Allow new users to sign up = OFF" and provision Marie's single administrator account out-of-band via Supabase Dashboard directly into `private.admin_users (user_id)`. Public signup, reader authentication, OAuth, phone/magic-link auth, client-stored roles in `user_metadata`, and browser exposure of service-role keys remain strictly prohibited.  
**Reason:** The publication requires a calm, secure, single-admin workspace for Marie. Utilizing modern `@supabase/ssr` cookies and Next.js 16 proxy with `getClaims()` ensures trustworthy session validation without stale or unverified JWTs. The two-step `requireAdmin()` gate backed by `private.admin_users` ensures authenticated non-admin accounts cannot access administrative capabilities or private data. Disabling public signups at the service level prevents unauthorized account creation via the public publishable key, while restricting session cookie mutation to valid server mutation contexts prevents Server Component runtime errors.  
**Alternatives considered:** Using deprecated `@supabase/auth-helpers-nextjs`; relying on `getSession()` on the server; attempting `signOut()` inside Server Components; storing admin roles in JWT user metadata; relying solely on proxy redirects for admin security; exposing `private.admin_users` directly to PostgREST; defining `public.is_admin()` as `SECURITY DEFINER`; adding multi-role RBAC libraries.  
**Impact:** Introduces `@supabase/supabase-js` and `@supabase/ssr`; creates Supabase client helpers in `src/lib/supabase/`; adds Next.js proxy in `src/proxy.ts`; adds `src/lib/auth/admin.ts`; creates `/admin/login` and `/admin` routes; adds a focused migration for `public.is_admin()` as `SECURITY INVOKER` with pgTAP security tests; enforces out-of-band provisioning of Marie's `user_id`.  
**Approved by:** PROPOSED — Awaiting project owner architecture approval.  
**Status:** PROPOSED — PENDING OWNER APPROVAL.
```
