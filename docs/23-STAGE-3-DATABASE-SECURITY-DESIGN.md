# 23 — Stage 3 Database & Security Design

## 1. Overview & Architectural Scope

This document specifies the frozen database schema, Row Level Security (RLS) architecture, privilege model, storage access controls, and testing strategy for Stage 3 of the Marie Medere Medical Writing Portfolio & Educational Blog.

The design implements a secure, single-writer publication architecture for Supabase PostgreSQL (Postgres 17) adhering to the frozen V1 scope in `AI_CONTEXT.md` and `docs/01-SCOPE-FREEZE.md`.

## 2. Core Principles & Access Boundaries

1. **Single-Admin Model:** Marie is the sole authenticated writer and administrator. Reader accounts, subscriptions, memberships, and multi-author editorial role systems are strictly excluded in V1.
2. **Defense in Depth (Grants + RLS):** Table-level and column-level PostgreSQL `GRANT`/`REVOKE` statements work in tandem with Row Level Security policies. Grants determine if an operation or column is accessible at all; RLS determines which specific rows are accessible.
3. **Public vs. Private Isolation:**
   - **Public Read Access:** Published articles, categories, public profile fields, site settings, and approved comments on published articles.
   - **Strictly Private Access:** Draft/archived articles, commenter email addresses, contact messages, private admin tables, and administrative settings.
4. **Narrow Public Mutations:** Anonymous users may only insert comments (status forced to `pending`) on published articles and submit contact messages (status forced to `new`).
5. **No Secret Keys in Client Code:** The client application uses only the public/publishable client configuration. Privileged administrative operations are authenticated via Supabase Auth and evaluated in PostgreSQL against the private admin allowlist.

---

## 3. Single-Admin Authorization Architecture

To avoid complex, speculative RBAC/roles tables while ensuring secure authorization without relying on client-editable JWT metadata:

### `private` Schema & Allowlist Table
A dedicated non-API schema `private` holds the admin user allowlist:

```sql
create schema if not exists private;

create table if not exists private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
```

### Authorization Function `private.is_admin()`
```sql
create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from private.admin_users
    where user_id = (select auth.uid())
  );
$$;
```

### Security Controls on `private` Schema
- `private` is not included in `config.toml` `api.schemas`, preventing PostgREST Data API exposure.
- `revoke all on schema private from public, anon;`
- `grant usage on schema private to authenticated, service_role;`
- `revoke all on table private.admin_users from public, anon, authenticated;`
- `revoke execute on function private.is_admin() from public, anon;`
- `grant execute on function private.is_admin() to authenticated, service_role;`
- Production allowlist starts empty; synthetic users are used in local tests and Stage 4 provisions the production admin user.

---

## 4. Public Schema Table Specifications

### 4.1 `public.profiles`
- **Purpose:** Publicly rendered author profile, professional credentials, and biography.
- **Columns:**
  - `id` (uuid, PK, references `auth.users(id)` on delete cascade)
  - `display_name` (text, not null)
  - `professional_tagline` (text)
  - `short_bio` (text)
  - `long_bio` (text)
  - `education_summary` (text)
  - `interests` (text[] not null default '{}'::text[])
  - `social_links` (jsonb not null default '[]'::jsonb)
  - `cv_storage_path` (text)
  - `created_at` (timestamptz, not null default now())
  - `updated_at` (timestamptz, not null default now())
- **Security:**
  - SELECT: Granted to `anon`, `authenticated`. RLS allows public read (`true`).
  - INSERT/UPDATE/DELETE: Granted to `authenticated`. RLS restricted to `private.is_admin()`.

### 4.2 `public.categories`
- **Purpose:** Primary article categories and taxonomy.
- **Columns:**
  - `id` (uuid, PK, default `gen_random_uuid()`)
  - `name` (text, not null, check `char_length(trim(name)) > 0`)
  - `slug` (text, not null, unique, check `slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`)
  - `description` (text)
  - `created_at` (timestamptz, not null default now())
  - `updated_at` (timestamptz, not null default now())
- **Security:**
  - SELECT: Granted to `anon`, `authenticated`. RLS allows public read (`true`).
  - INSERT/UPDATE/DELETE: Granted to `authenticated`. RLS restricted to `private.is_admin()`.

### 4.3 `public.articles`
- **Purpose:** Core publication content, SEO metadata, and portfolio feature flags.
- **Columns:**
  - `id` (uuid, PK, default `gen_random_uuid()`)
  - `title` (text, not null, check `char_length(trim(title)) > 0`)
  - `slug` (text, not null, unique, check `slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`)
  - `excerpt` (text)
  - `content_json` (jsonb, not null default '{"type": "doc", "content": []}'::jsonb)
  - `featured_image_path` (text)
  - `featured_image_alt` (text)
  - `category_id` (uuid, references `public.categories(id)` on delete restrict)
  - `status` (text, not null default 'draft', check `status in ('draft', 'published', 'archived')`)
  - `is_featured` (boolean, not null default false)
  - `is_portfolio_featured` (boolean, not null default false)
  - `seo_title` (text)
  - `seo_description` (text)
  - `published_at` (timestamptz)
  - `created_at` (timestamptz, not null default now())
  - `updated_at` (timestamptz, not null default now())
- **Indexes:**
  - `idx_articles_category_id` on `category_id`
  - `idx_articles_status_published_at` on `(status, published_at desc)`
  - `idx_articles_is_featured` on `(is_featured) where is_featured = true`
  - `idx_articles_is_portfolio_featured` on `(is_portfolio_featured) where is_portfolio_featured = true`
- **Security:**
  - SELECT: Granted to `anon`, `authenticated`. RLS policy: `(status = 'published') or private.is_admin()`.
  - INSERT/UPDATE/DELETE: Granted to `authenticated`. RLS restricted to `private.is_admin()`.

### 4.4 `public.article_references`
- **Purpose:** Structured academic/clinical citations linked to articles.
- **Columns:**
  - `id` (uuid, PK, default `gen_random_uuid()`)
  - `article_id` (uuid, not null, references `public.articles(id)` on delete cascade)
  - `title` (text, not null, check `char_length(trim(title)) > 0`)
  - `source_name` (text, not null, check `char_length(trim(source_name)) > 0`)
  - `url` (text)
  - `citation_details` (text)
  - `sort_order` (integer, not null default 0, check `sort_order >= 0`)
  - `created_at` (timestamptz, not null default now())
- **Indexes:**
  - `idx_article_references_article_sort` on `(article_id, sort_order asc)`
- **Security:**
  - SELECT: Granted to `anon`, `authenticated`. RLS policy: `exists (select 1 from public.articles a where a.id = article_references.article_id and a.status = 'published') or private.is_admin()`.
  - INSERT/UPDATE/DELETE: Granted to `authenticated`. RLS restricted to `private.is_admin()`.

### 4.5 `public.comments`
- **Purpose:** Reader responses subject to mandatory moderation.
- **Columns:**
  - `id` (uuid, PK, default `gen_random_uuid()`)
  - `article_id` (uuid, not null, references `public.articles(id)` on delete cascade)
  - `commenter_name` (text, not null, check `char_length(trim(commenter_name)) > 0 and char_length(commenter_name) <= 100`)
  - `commenter_email` (text, not null, check `commenter_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' and char_length(commenter_email) <= 255`)
  - `body` (text, not null, check `char_length(trim(body)) > 0 and char_length(body) <= 2000`)
  - `status` (text, not null default 'pending', check `status in ('pending', 'approved', 'hidden')`)
  - `created_at` (timestamptz, not null default now())
  - `moderated_at` (timestamptz)
- **Indexes:**
  - `idx_comments_article_status` on `(article_id, status)`
- **Security & Privacy Defense in Depth:**
  - **Column Grants:**
    - `anon` is granted SELECT ONLY on `(id, article_id, commenter_name, body, status, created_at)`.
    - `anon` is explicitly NOT granted SELECT on `commenter_email` or `moderated_at`.
    - `anon` is granted INSERT ONLY on `(article_id, commenter_name, commenter_email, body)`.
    - `authenticated` is granted full column SELECT, INSERT, UPDATE, DELETE.
  - **RLS Policies:**
    - SELECT (`anon`): `using (status = 'approved' and exists (select 1 from public.articles a where a.id = comments.article_id and a.status = 'published'))`
    - SELECT (`authenticated`): Restricted to `private.is_admin()`. (Authenticated non-admins receive zero comment rows).
    - INSERT: `with check (status = 'pending' and moderated_at is null and exists (select 1 from public.articles a where a.id = comments.article_id and a.status = 'published'))`
    - UPDATE / DELETE: Restricted to `private.is_admin()`.

### 4.6 `public.contact_messages`
- **Purpose:** Public contact inquiries routed to admin inbox.
- **Columns:**
  - `id` (uuid, PK, default `gen_random_uuid()`)
  - `name` (text, not null, check `char_length(trim(name)) > 0 and char_length(name) <= 100`)
  - `email` (text, not null, check `email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' and char_length(email) <= 255`)
  - `subject` (text, not null, check `char_length(trim(subject)) > 0 and char_length(subject) <= 200`)
  - `message` (text, not null, check `char_length(trim(message)) > 0 and char_length(message) <= 5000`)
  - `status` (text, not null default 'new', check `status in ('new', 'read', 'archived')`)
  - `created_at` (timestamptz, not null default now())
- **Indexes:**
  - `idx_contact_messages_status` on `(status, created_at desc)`
- **Security:**
  - **Grants:** `anon` is granted INSERT ONLY on `(name, email, subject, message)`. `anon` has NO SELECT, UPDATE, or DELETE privileges. `authenticated` is granted INSERT, SELECT, UPDATE, DELETE.
  - **RLS Policies:**
    - SELECT: Restricted to `private.is_admin()`.
    - INSERT: Allowed for `anon` and `authenticated` `with check (status = 'new')`.
    - UPDATE / DELETE: Restricted to `private.is_admin()`.

### 4.7 `public.site_settings`
- **Purpose:** Singleton record for public site identity, disclaimer version, and homepage presentation.
- **Columns:**
  - `id` (integer, PK default 1, check `id = 1`)
  - `site_title` (text, not null)
  - `tagline` (text)
  - `default_seo_description` (text)
  - `social_links` (jsonb, not null default '[]'::jsonb)
  - `disclaimer_text` (text)
  - `homepage_intro` (text)
  - `created_at` (timestamptz, not null default now())
  - `updated_at` (timestamptz, not null default now())
- **Security:**
  - SELECT: Granted to `anon`, `authenticated`. RLS allows public read (`true`).
  - INSERT / UPDATE / DELETE: Granted to `authenticated`. RLS restricted to `private.is_admin()`.

---

## 5. Storage Architecture

- **Bucket:** `public-assets` (public bucket for published article images, portfolio assets, and approved CV download).
- **File Constraints:** Maximum file size: `10MB` (`10485760` bytes).
- **MIME Type Allowlist:** `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `application/pdf`. (Arbitrary SVG uploads are disallowed for security).
- **Storage RLS Policies on `storage.objects`:**
  - SELECT: Allowed for `bucket_id = 'public-assets'` (public read).
  - INSERT: Restricted to `bucket_id = 'public-assets' and private.is_admin()`.
  - UPDATE: Restricted to `bucket_id = 'public-assets' and private.is_admin()`.
  - DELETE: Restricted to `bucket_id = 'public-assets' and private.is_admin()`.

---

## 6. Timestamp Trigger Utility

A safe `updated_at` trigger function in `public`:
```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;
```
Triggers attached to: `public.profiles`, `public.categories`, `public.articles`, `public.site_settings`.

---

## 7. Public vs. Private Access Matrix

| Table / Object | Anon SELECT | Anon INSERT | Anon UPDATE/DELETE | Auth Non-Admin SELECT | Admin Full Access |
|---|---|---|---|---|---|
| `private.admin_users` | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Full |
| `public.profiles` | ✅ Allowed | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Full |
| `public.categories` | ✅ Allowed | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Full |
| `public.articles` | ✅ Published Only | ❌ Denied | ❌ Denied | ✅ Published Only | ✅ Full |
| `public.article_references` | ✅ Published Only | ❌ Denied | ❌ Denied | ✅ Published Only | ✅ Full |
| `public.comments` | ✅ Approved Only (No Email) | ✅ Insert (Pending Only) | ❌ Denied | ❌ Denied | ✅ Full |
| `public.contact_messages` | ❌ Denied | ✅ Insert (New Only) | ❌ Denied | ❌ Denied | ✅ Full |
| `public.site_settings` | ✅ Allowed | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Full |
| Storage `public-assets` | ✅ Public Read | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Full |

---

## 8. Synthetic Seed & Testing Strategy

- **Seed Data (`supabase/seed.sql`):** Purely synthetic local development fixtures (synthetic admin UUID `00000000-0000-0000-0000-000000000001`, non-admin UUID `00000000-0000-0000-0000-000000000002`, neutral placeholder articles, categories, comments, messages).
- **Remote Environment Safety:** `supabase/seed.sql` is strictly excluded from remote deployment. Remote database starts clean.
- **Automated Verification:** Comprehensive pgTAP test suites in `supabase/tests/database/` executed via `npx supabase test db` to verify all schema structures, column privileges, anonymous security boundaries, non-admin isolation, and admin operations.
