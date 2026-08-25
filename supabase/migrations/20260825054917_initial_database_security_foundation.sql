-- Migration: initial_database_security_foundation
-- Description: Stage 3 database schema, RLS policies, privilege model, and storage configuration.
-- Authoritative Design: docs/23-STAGE-3-DATABASE-SECURITY-DESIGN.md & D022

-- ============================================================================
-- 1. Private Schema & Single-Admin Authorization
-- ============================================================================

create schema if not exists private;

create table if not exists private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table private.admin_users enable row level security;

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

revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

revoke all on table private.admin_users from public, anon, authenticated;
grant select, insert, update, delete on table private.admin_users to service_role;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;

-- ============================================================================
-- 2. Timestamp Trigger Utility
-- ============================================================================

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

revoke execute on function public.set_updated_at() from public, anon;
grant execute on function public.set_updated_at() to authenticated, service_role;

-- ============================================================================
-- 3. Public Schema Tables & Triggers
-- ============================================================================

-- 3.1 Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  professional_tagline text,
  short_bio text,
  long_bio text,
  education_summary text,
  interests text[] not null default '{}'::text[],
  social_links jsonb not null default '[]'::jsonb,
  cv_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- 3.2 Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_categories_name_not_empty check (char_length(trim(name)) > 0),
  constraint chk_categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint uq_categories_slug unique (slug)
);

create trigger trg_categories_updated_at
  before update on public.categories
  for each row
  execute function public.set_updated_at();

-- 3.3 Articles
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text,
  content_json jsonb not null default '{"type": "doc", "content": []}'::jsonb,
  featured_image_path text,
  featured_image_alt text,
  category_id uuid references public.categories(id) on delete restrict,
  status text not null default 'draft',
  is_featured boolean not null default false,
  is_portfolio_featured boolean not null default false,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_articles_title_not_empty check (char_length(trim(title)) > 0),
  constraint chk_articles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint uq_articles_slug unique (slug),
  constraint chk_articles_status check (status in ('draft', 'published', 'archived'))
);

create index if not exists idx_articles_category_id on public.articles (category_id);
create index if not exists idx_articles_status_published_at on public.articles (status, published_at desc);
create index if not exists idx_articles_is_featured on public.articles (is_featured) where is_featured = true;
create index if not exists idx_articles_is_portfolio_featured on public.articles (is_portfolio_featured) where is_portfolio_featured = true;

create trigger trg_articles_updated_at
  before update on public.articles
  for each row
  execute function public.set_updated_at();

-- 3.4 Article References
create table if not exists public.article_references (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  title text not null,
  source_name text not null,
  url text,
  citation_details text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint chk_article_references_title_not_empty check (char_length(trim(title)) > 0),
  constraint chk_article_references_source_name_not_empty check (char_length(trim(source_name)) > 0),
  constraint chk_article_references_sort_order check (sort_order >= 0)
);

create index if not exists idx_article_references_article_sort on public.article_references (article_id, sort_order asc);

-- 3.5 Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  commenter_name text not null,
  commenter_email text not null,
  body text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  constraint chk_comments_commenter_name check (char_length(trim(commenter_name)) > 0 and char_length(commenter_name) <= 100),
  constraint chk_comments_commenter_email check (commenter_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' and char_length(commenter_email) <= 255),
  constraint chk_comments_body check (char_length(trim(body)) > 0 and char_length(body) <= 2000),
  constraint chk_comments_status check (status in ('pending', 'approved', 'hidden'))
);

create index if not exists idx_comments_article_status on public.comments (article_id, status);

-- 3.6 Contact Messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint chk_contact_messages_name check (char_length(trim(name)) > 0 and char_length(name) <= 100),
  constraint chk_contact_messages_email check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' and char_length(email) <= 255),
  constraint chk_contact_messages_subject check (char_length(trim(subject)) > 0 and char_length(subject) <= 200),
  constraint chk_contact_messages_message check (char_length(trim(message)) > 0 and char_length(message) <= 5000),
  constraint chk_contact_messages_status check (status in ('new', 'read', 'archived'))
);

create index if not exists idx_contact_messages_status on public.contact_messages (status, created_at desc);

-- 3.7 Site Settings
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  site_title text not null,
  tagline text,
  default_seo_description text,
  social_links jsonb not null default '[]'::jsonb,
  disclaimer_text text,
  homepage_intro text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- 4. Grants & Revokes (Defense in Depth)
-- ============================================================================

-- 4.1 Profiles Grants
revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant insert, update, delete on table public.profiles to authenticated, service_role;

-- 4.2 Categories Grants
revoke all on table public.categories from public, anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant insert, update, delete on table public.categories to authenticated, service_role;

-- 4.3 Articles Grants
revoke all on table public.articles from public, anon, authenticated;
grant select on table public.articles to anon, authenticated;
grant insert, update, delete on table public.articles to authenticated, service_role;

-- 4.4 Article References Grants
revoke all on table public.article_references from public, anon, authenticated;
grant select on table public.article_references to anon, authenticated;
grant insert, update, delete on table public.article_references to authenticated, service_role;

-- 4.5 Comments Grants (Column-Level Privacy)
revoke all on table public.comments from public, anon, authenticated;
grant select, insert, update, delete on table public.comments to authenticated, service_role;
grant select (id, article_id, commenter_name, body, status, created_at) on table public.comments to anon;
grant insert (article_id, commenter_name, commenter_email, body) on table public.comments to anon;

-- 4.6 Contact Messages Grants (Write-Only for Anon)
revoke all on table public.contact_messages from public, anon, authenticated;
grant select, insert, update, delete on table public.contact_messages to authenticated, service_role;
grant insert (name, email, subject, message) on table public.contact_messages to anon;

-- 4.7 Site Settings Grants
revoke all on table public.site_settings from public, anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant insert, update, delete on table public.site_settings to authenticated, service_role;

-- ============================================================================
-- 5. Row Level Security (RLS) Enablement & Policies
-- ============================================================================

-- 5.1 Profiles RLS
alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Admins can insert profile"
  on public.profiles for insert
  to authenticated
  with check (private.is_admin());

create policy "Admins can update profile"
  on public.profiles for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete profile"
  on public.profiles for delete
  to authenticated
  using (private.is_admin());

-- 5.2 Categories RLS
alter table public.categories enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  to authenticated
  with check (private.is_admin());

create policy "Admins can update categories"
  on public.categories for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete categories"
  on public.categories for delete
  to authenticated
  using (private.is_admin());

-- 5.3 Articles RLS
alter table public.articles enable row level security;

create policy "Published articles are readable by anon"
  on public.articles for select
  to anon
  using (status = 'published');

create policy "Articles are readable by authenticated"
  on public.articles for select
  to authenticated
  using (status = 'published' or private.is_admin());

create policy "Admins can insert articles"
  on public.articles for insert
  to authenticated
  with check (private.is_admin());

create policy "Admins can update articles"
  on public.articles for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete articles"
  on public.articles for delete
  to authenticated
  using (private.is_admin());

-- 5.4 Article References RLS
alter table public.article_references enable row level security;

create policy "References for published articles are readable by anon"
  on public.article_references for select
  to anon
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_references.article_id
      and a.status = 'published'
    )
  );

create policy "References are readable by authenticated"
  on public.article_references for select
  to authenticated
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_references.article_id
      and a.status = 'published'
    )
    or private.is_admin()
  );

create policy "Admins can insert article references"
  on public.article_references for insert
  to authenticated
  with check (private.is_admin());

create policy "Admins can update article references"
  on public.article_references for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete article references"
  on public.article_references for delete
  to authenticated
  using (private.is_admin());

-- 5.5 Comments RLS
alter table public.comments enable row level security;

create policy "Approved comments on published articles are readable by anon"
  on public.comments for select
  to anon
  using (
    status = 'approved'
    and exists (
      select 1 from public.articles a
      where a.id = comments.article_id
      and a.status = 'published'
    )
  );

create policy "Admins can view comments"
  on public.comments for select
  to authenticated
  using (private.is_admin());

create policy "Public can submit pending comments on published articles"
  on public.comments for insert
  to anon
  with check (
    status = 'pending'
    and moderated_at is null
    and exists (
      select 1 from public.articles a
      where a.id = comments.article_id
      and a.status = 'published'
    )
  );

create policy "Admins can insert comments"
  on public.comments for insert
  to authenticated
  with check (private.is_admin());

create policy "Admins can update comments"
  on public.comments for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete comments"
  on public.comments for delete
  to authenticated
  using (private.is_admin());

-- 5.6 Contact Messages RLS
alter table public.contact_messages enable row level security;

create policy "Admins can view contact messages"
  on public.contact_messages for select
  to authenticated
  using (private.is_admin());

create policy "Public can submit contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (status = 'new');

create policy "Admins can update contact messages"
  on public.contact_messages for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (private.is_admin());

-- 5.7 Site Settings RLS
alter table public.site_settings enable row level security;

create policy "Site settings are publicly readable"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (private.is_admin());

create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admins can delete site settings"
  on public.site_settings for delete
  to authenticated
  using (private.is_admin());

-- ============================================================================
-- 6. Storage Bucket & Storage Object RLS
-- ============================================================================

-- 6.1 Create or Update public-assets Bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-assets',
  'public-assets',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 6.2 Storage Policies on storage.objects
create policy "Public assets are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'public-assets');

create policy "Admins can upload public assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'public-assets' and private.is_admin());

create policy "Admins can update public assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'public-assets' and private.is_admin())
  with check (bucket_id = 'public-assets' and private.is_admin());

create policy "Admins can delete public assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'public-assets' and private.is_admin());
