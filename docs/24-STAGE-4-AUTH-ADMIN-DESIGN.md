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
- **Client Architecture:** Next.js cookie-based Supabase client integration using `@supabase/ssr` and `@supabase/supabase-js`.
- **Session Refresh:** Next.js 16 `proxy.ts` request interceptor for automatic token refresh and cookie synchronization.
- **Server Authorization Gate:** `requireAdmin()` server-side helper validating cryptographic session legitimacy via `getUser()` and verifying allowlist membership via `public.is_admin()`.
- **Database Authorization RPC:** Minimal, authenticated-only boolean function `public.is_admin()` in PostgreSQL delegating to `private.is_admin()`.
- **Protected Workspace Shell:** Server-protected layout for `/admin` and sub-routes wrapped in the existing `AdminShell`.
- **Secure Session Termination:** Server-action-based logout invalidating Supabase Auth sessions and clearing cookies.
- **Unauthorized & Non-Admin Defense:** Clean redirects and session invalidation for anonymous or non-allowlisted visitors.
- **Automated Verification:** Comprehensive pgTAP tests for database functions and end-to-end route protection gates.

---

## 2. Official Documentation Findings

Research conducted on **2026-08-25** using current official documentation:

| Domain | Source URL | Key Technical Mandate |
| :--- | :--- | :--- |
| **Supabase SSR for Next.js** | `https://supabase.com/docs/guides/auth/server-side/creating-a-client` | Deprecates `@supabase/auth-helpers-nextjs`. Mandates `@supabase/ssr` with `createBrowserClient` (singleton in browser) and `createServerClient` (per-request in Server Components/Actions/Proxy with `getAll` / `setAll` cookie handlers). |
| **Password Authentication** | `https://supabase.com/docs/guides/auth/passwords` | Use `supabase.auth.signInWithPassword({ email, password })`. PKCE flow is default with SSR. Errors must not distinguish whether account exists to prevent email enumeration. |
| **Server Token Verification** | `https://supabase.com/docs/guides/auth/server-side/creating-a-client` | Never trust `supabase.auth.getSession()` inside server code (Proxy, Server Components, Server Actions) for access control because it reads unverified cookie data. Always call `supabase.auth.getUser()` (or `supabase.auth.getClaims()`) to validate the JWT against Supabase Auth. |
| **Next.js 16 Proxy Convention** | `https://nextjs.org/docs/app/getting-started/proxy` | Next.js 16 supports `proxy.ts` with matcher configuration to intercept requests, refresh auth cookies via `updateSession()`, and pass updated headers/cookies to downstream Server Components and back to the browser. |
| **User Administration** | `https://supabase.com/docs/guides/auth/managing-user-data` | Authorizes out-of-band admin creation via Supabase Dashboard (Auth > Users > Invite / Add User). Prevents committing credentials or exposing service-role keys in application code. |

---

## 3. Package Recommendation

### Required Production Dependencies:
1. `@supabase/supabase-js` (`^2.49.x`): The official Supabase isomorphic client library.
2. `@supabase/ssr` (`^0.5.x`): The official cookie-based SSR adapter for Supabase in Next.js App Router.

### Explicit Exclusions:
- No `@supabase/auth-helpers-nextjs` (deprecated).
- No third-party auth wrappers (NextAuth/Auth.js, Clerk, Lucia, Firebase Auth).
- No new UI component libraries or form wizards.

---

## 4. Supabase Client Architecture

To cleanly separate client and server contexts, two client factories will be created in `src/lib/supabase/`:

### A. Browser Client (`src/lib/supabase/client.ts`)
Creates a client for use in Client Components (e.g. real-time subscriptions, client forms):
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
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

## 5. Next.js Proxy & Session Refresh

In Next.js 16 App Router, the proxy intercepts incoming requests to refresh expired tokens and maintain cookie synchronization:

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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Validates JWT against Supabase Auth servers
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAccessingAdmin = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname.startsWith("/admin/login");

  // Redirect unauthenticated requests to /admin/* to login
  if (!user && isAccessingAdmin && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated requests at /admin/login to dashboard
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

---

## 6. Server-Side `requireAdmin` Design

To provide authoritative defense in depth, all Server Components (`src/app/admin/layout.tsx`) and administrative Server Actions must call `requireAdmin()`:

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

  // 1. Cryptographic token & identity check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  // 2. Allowlist authorization check against private.admin_users
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");

  if (rpcError || !isAdmin) {
    // Authenticated user exists but is not on the admin allowlist
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  return {
    id: user.id,
    email: user.email,
  };
}
```

---

## 7. Admin Allowlist Lookup Mechanism

In Stage 3, `private.admin_users` and `private.is_admin()` were established inside the private schema. Because PostgREST hides non-public schemas, Stage 4 introduces a minimal, authenticated-only SQL proxy function in `public`:

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select private.is_admin();
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

comment on function public.is_admin() is
  'Returns true if the authenticated caller is present in private.admin_users. Denied to anon.';
```

### Security Properties:
1. **Zero Arguments:** Prevents any caller from probing another user's authorization status.
2. **Context-Derived:** Relies exclusively on `auth.uid()`.
3. **Zero Data Leakage:** Returns only a scalar boolean; never exposes email addresses or UUID rows from `private.admin_users`.
4. **Anon Denial:** Direct calls from unauthenticated visitors are rejected with PostgreSQL error `42501 (permission denied)`.

---

## 8. Login Route Choice

**Route:** `/admin/login`

### Rationale:
- This is a single-author publication with no reader accounts.
- Consistently places all administrative workflows under the `/admin` prefix.
- Prevents confusing public readers who have no concept of user accounts on the blog.
- Matches `docs/03-INFORMATION-ARCHITECTURE.md` recommendation.

---

## 9. Login Action

Located in `src/app/admin/login/actions.ts`:
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface LoginActionResult {
  error?: string;
}

export async function loginAction(
  formData: FormData,
): Promise<LoginActionResult | void> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const supabase = await createClient();

  // 1. Authenticate credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  // 2. Authorize allowlist membership
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");

  if (rpcError || !isAdmin) {
    await supabase.auth.signOut();
    return {
      error:
        "Access denied: this account is not authorized for administrative access.",
    };
  }

  redirect("/admin");
}
```

---

## 10. Logout Action

Located in `src/app/admin/login/actions.ts`:
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
```

---

## 11. Redirect Behavior

- **Post-Login:** Automatically redirects allowlisted Marie to `/admin`.
- **Post-Logout:** Terminates session and redirects to `/admin/login`.
- **Open-Redirect Protection:** If dynamic return URLs are supported in future, redirect targets must be validated as relative paths starting with `/admin` and strictly forbidding `//` or external protocols (`http:`, `javascript:`).
- **Authenticated Login Visit:** If Marie is already logged in and navigates to `/admin/login`, proxy automatically routes her to `/admin`.

---

## 12. Authenticated-Non-Admin Behavior

If an authenticated user exists in `auth.users` who is NOT in `private.admin_users`:
1. `public.is_admin()` returns `false`.
2. `requireAdmin()` and `loginAction` catch the authorization failure.
3. The session is immediately revoked via `supabase.auth.signOut()`.
4. The user is redirected to `/admin/login?error=unauthorized` or shown a generic access-denied error without leaking database schema details.
5. Commenter email privacy under D023 remains 100% secure (`using (private.is_admin())` on `public.comments`).

---

## 13. Account Provisioning Plan

Marie Medere's account has not yet been provisioned in hosted `private.admin_users`.

### Safe Out-of-Band Provisioning Flow:
1. **User Creation:** The project owner creates Marie's account via the official Supabase Dashboard (`Authentication > Users > Add User` or `Invite User`).
2. **UUID Capture:** The generated `auth.users.id` UUID is copied.
3. **Allowlist Insertion:** In the Supabase SQL Editor (or secure migration), the owner executes:
   ```sql
   insert into private.admin_users (user_id, email, full_name)
   values ('<marie-auth-uuid>', 'marie@example.com', 'Marie Medere');
   ```
4. **Zero Password Leakage:** No passwords, plaintext secrets, or temporary production credentials are ever written into Git, documentation, or application source code.

---

## 14. Local Testing Strategy

1. **Database Migration & pgTAP Tests:**
   - Execute `npx supabase db reset` to apply the Stage-4 migration.
   - Execute `npx supabase test db` including a new test file `supabase/tests/database/08_public_is_admin_rpc.test.sql`:
     - Test 1: Anonymous user cannot execute `public.is_admin()` (throws 42501).
     - Test 2: Authenticated non-admin user receives `false` from `public.is_admin()`.
     - Test 3: Authenticated admin user receives `true` from `public.is_admin()`.
2. **Next.js Route Protection Verification:**
   - Test unauthenticated requests to `/admin` -> redirects to `/admin/login`.
   - Test login with synthetic admin credentials -> redirects to `/admin`.
   - Test logout -> redirects to `/admin/login`.
3. **Quality Gates:**
   - `npm run typecheck`
   - `npm run lint`
   - `npm run format:check`
   - `npm run build`

---

## 15. Hosted Testing Strategy

1. Deploy the Stage-4 migration `add_public_is_admin_rpc` to hosted project `eoexnnhqzrkurbqgbtnx` via authorized MCP transport.
2. Verify migration version metadata and absence of database lint/security warnings.
3. Verify `private.admin_users` remains protected and empty until Marie is provisioned.
4. Verify hosted public tables and storage buckets retain full RLS protection.

---

## 16. Required Migration

A new version-controlled migration file will be created:
`supabase/migrations/<timestamp>_add_public_is_admin_rpc.sql`

```sql
-- Migration: Add public.is_admin() authorization RPC for single-admin Next.js client
-- Date: 2026-08-25

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select private.is_admin();
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

comment on function public.is_admin() is
  'Exposes private.is_admin() boolean check to authenticated clients without exposing private schema.';
```

---

## 17. RLS & Security Invariants

- **D001–D025 Continuity:** All previous architectural decisions remain active and unchanged.
- **Strict RLS:** All 7 public tables and `private.admin_users` maintain row level security.
- **Zero Service-Role Leakage:** Application code uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
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
- `src/components/admin/admin-shell.tsx` (wire up interactive logout button)
- `docs/13-PROJECT-STATUS.md` (track Stage 4 implementation and gate pass)

---

## 19. Explicit Exclusions

- **No Public Signup:** No registration UI, endpoints, or public sign-up flows.
- **No Reader Accounts:** No reader login, reader profile, or bookmarking system.
- **No Third-Party Auth:** No OAuth, social logins, SMS OTP, or magic links.
- **No Multi-Author RBAC:** No complex permission tables or contributor roles.
- **No Stage-5 Pages:** No public Homepage, About, Contact, or Portfolio implementation.
- **No Tiptap Editor:** No rich-text editor or publishing workflows (Stage 6).

---

## 20. Stage-4 Gate Evidence Required

To pass the Stage-4 quality gate, the implementation must produce verified evidence that:
1. Anonymous requests to `/admin` and `/admin/*` are intercepted and redirected to `/admin/login`.
2. Authenticated non-admin accounts are denied access, logged out, and redirected.
3. Authenticated allowlisted Marie can access the `/admin` overview dashboard.
4. Logout terminates session cookies and prevents back-navigation access.
5. All 8 database test suites (85+ pgTAP tests) pass with 100% success.
6. TypeScript, ESLint, Prettier, and Next.js production build pass cleanly with 0 errors.

---

## Proposed Decision Text (D026)

*The following decision text is PROPOSED for owner approval and is NOT yet active in `docs/11-DECISION-LOG.md`.*

```markdown
## PROPOSED — D026 — Stage-4 single-admin authentication & route protection architecture

**Date:** 2026-08-25  
**Decision:** Implement the V1 single-admin authentication architecture for Marie using `@supabase/supabase-js` and `@supabase/ssr` with cookie-based SSR. House the dedicated admin login at `/admin/login` utilizing Supabase email/password authentication (`signInWithPassword`). Refresh session tokens in Next.js 16 via `proxy.ts`. Enforce server-side route protection across all `/admin` routes using a dedicated `requireAdmin()` helper that verifies cryptographic session validity via `supabase.auth.getUser()` and evaluates admin allowlist membership via a new authenticated SQL function `public.is_admin()`. Public signup, reader authentication, OAuth, phone auth, client-stored roles in `user_metadata`, and browser exposure of service-role keys remain strictly prohibited.  
**Reason:** The publication requires a calm, secure, single-admin workspace for Marie. Utilizing modern `@supabase/ssr` cookies and Next.js 16 proxy ensures seamless session synchronization without stale JWTs, while the two-step `requireAdmin()` gate backed by `private.admin_users` ensures authenticated non-admin accounts cannot access administrative capabilities or private data.  
**Alternatives considered:** Using deprecated `@supabase/auth-helpers-nextjs`; storing admin roles in JWT user metadata; relying solely on cookie existence or client-side redirects; exposing `private.admin_users` directly to PostgREST; adding multi-role RBAC libraries.  
**Impact:** Introduces `@supabase/supabase-js` and `@supabase/ssr`; creates Supabase client helpers in `src/lib/supabase/`; adds Next.js proxy in `src/proxy.ts`; adds `src/lib/auth/admin.ts`; creates `/admin/login` and `/admin` routes; adds a focused migration for `public.is_admin()` with pgTAP security tests.  
**Approved by:** PROPOSED — Awaiting project owner architecture approval.  
**Status:** PROPOSED — PENDING OWNER APPROVAL.
```
