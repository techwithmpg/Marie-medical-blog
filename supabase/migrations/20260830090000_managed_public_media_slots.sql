create table if not exists public.site_media_slots (
  slot text primary key,
  storage_path text not null,
  alt_text text,
  is_decorative boolean not null default false,
  desktop_focal_x smallint not null default 50,
  desktop_focal_y smallint not null default 50,
  mobile_focal_x smallint not null default 50,
  mobile_focal_y smallint not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chk_site_media_slot_allowlist check (
    slot in (
      'home_hero',
      'about_hero',
      'portfolio_hero',
      'contact_hero',
      'author_portrait',
      'default_social'
    )
  ),

  constraint chk_site_media_storage_path check (
    char_length(trim(storage_path)) > 0
  ),

  constraint chk_site_media_alt check (
    is_decorative
    or (
      alt_text is not null
      and char_length(trim(alt_text)) > 0
    )
  ),

  constraint chk_author_portrait_meaningful check (
    slot <> 'author_portrait'
    or is_decorative = false
  ),

  constraint chk_desktop_focal_x check (desktop_focal_x between 0 and 100),
  constraint chk_desktop_focal_y check (desktop_focal_y between 0 and 100),
  constraint chk_mobile_focal_x check (mobile_focal_x between 0 and 100),
  constraint chk_mobile_focal_y check (mobile_focal_y between 0 and 100)
);

drop trigger if exists trg_site_media_slots_updated_at
on public.site_media_slots;

create trigger trg_site_media_slots_updated_at
before update on public.site_media_slots
for each row
execute function public.set_updated_at();

revoke all
on table public.site_media_slots
from public, anon, authenticated;

grant select
on table public.site_media_slots
to anon, authenticated;

grant insert, update, delete
on table public.site_media_slots
to authenticated, service_role;

alter table public.site_media_slots enable row level security;

drop policy if exists
"Site media slots are publicly readable"
on public.site_media_slots;

create policy
"Site media slots are publicly readable"
on public.site_media_slots
for select
to anon, authenticated
using (true);

drop policy if exists
"Admins can insert site media slots"
on public.site_media_slots;

create policy
"Admins can insert site media slots"
on public.site_media_slots
for insert
to authenticated
with check ((select private.is_admin()));

drop policy if exists
"Admins can update site media slots"
on public.site_media_slots;

create policy
"Admins can update site media slots"
on public.site_media_slots
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists
"Admins can delete site media slots"
on public.site_media_slots;

create policy
"Admins can delete site media slots"
on public.site_media_slots
for delete
to authenticated
using ((select private.is_admin()));
