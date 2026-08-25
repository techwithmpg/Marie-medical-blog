-- Migration: Stage 7 Draft Authoring Persistence Foundation (D028)
-- Date: 2026-08-25
-- Stage 7: Writer Dashboard & Tiptap Editor

-- ============================================================================
-- 1. Create Private draft-assets Storage Bucket
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'draft-assets',
  'draft-assets',
  false,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================================
-- 2. Storage RLS Policies for draft-assets on storage.objects
-- ============================================================================

create policy "Admins can select draft assets"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'draft-assets' and private.is_admin());

create policy "Admins can upload draft assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'draft-assets' and private.is_admin());

create policy "Admins can update draft assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'draft-assets' and private.is_admin())
  with check (bucket_id = 'draft-assets' and private.is_admin());

create policy "Admins can delete draft assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'draft-assets' and private.is_admin());

-- ============================================================================
-- 3. Atomic Draft Persistence RPC: public.save_article_draft
-- ============================================================================

create or replace function public.save_article_draft(
  p_article_id uuid,
  p_provisional_slug text,
  p_title text,
  p_excerpt text default null,
  p_content_json jsonb default '{"type": "doc", "content": []}'::jsonb,
  p_category_id uuid default null,
  p_featured_image_path text default null,
  p_featured_image_alt text default null,
  p_seo_title text default null,
  p_seo_description text default null,
  p_references jsonb default '[]'::jsonb
)
returns table (
  article_id uuid,
  slug text,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing_status text;
  v_ref jsonb;
  v_ref_index integer := 0;
  v_ref_title text;
  v_ref_source text;
  v_ref_url text;
  v_ref_details text;
  v_final_updated_at timestamptz;
  v_final_slug text;
begin
  -- 1. Security Authorization Gate
  if not coalesce(private.is_admin(), false) then
    raise exception 'Unauthorized: administrative privileges required' using errcode = '42501';
  end if;

  -- 2. Input Validation
  if p_article_id is null then
    raise exception 'Article ID cannot be null' using errcode = '23502';
  end if;

  if p_title is null or char_length(trim(p_title)) = 0 then
    raise exception 'Article title cannot be blank' using errcode = '23514';
  end if;

  if p_content_json is null or jsonb_typeof(p_content_json) <> 'object' or coalesce(p_content_json->>'type', '') <> 'doc' then
    raise exception 'Invalid content_json: must be a JSON object with type "doc"' using errcode = '22023';
  end if;

  if p_references is null or jsonb_typeof(p_references) <> 'array' then
    raise exception 'Invalid references: must be a JSON array' using errcode = '22023';
  end if;

  -- 3. Featured Image Validation
  if p_featured_image_path is not null and char_length(trim(p_featured_image_path)) > 0 then
    if p_featured_image_alt is null or char_length(trim(p_featured_image_alt)) = 0 then
      raise exception 'Featured image alt text cannot be blank when image path is present' using errcode = '23514';
    end if;

    if not (p_featured_image_path ~ ('^articles/' || p_article_id::text || '/featured/.+$')) then
      raise exception 'Featured image path must belong to this article under articles/%/featured/...', p_article_id using errcode = '22023';
    end if;
  end if;

  -- 4. Check Existing Article State
  select a.status into v_existing_status
  from public.articles a
  where a.id = p_article_id
  for update;

  if v_existing_status is null then
    -- CREATE CONTRACT: New Article Draft
    if p_provisional_slug is null or p_provisional_slug <> ('draft-' || p_article_id::text) then
      raise exception 'Provisional slug must equal draft-%', p_article_id::text using errcode = '22023';
    end if;

    insert into public.articles (
      id,
      slug,
      title,
      excerpt,
      content_json,
      category_id,
      featured_image_path,
      featured_image_alt,
      seo_title,
      seo_description,
      status,
      published_at,
      is_featured,
      is_portfolio_featured
    )
    values (
      p_article_id,
      p_provisional_slug,
      trim(p_title),
      p_excerpt,
      p_content_json,
      p_category_id,
      p_featured_image_path,
      p_featured_image_alt,
      p_seo_title,
      p_seo_description,
      'draft',
      null,
      false,
      false
    )
    returning public.articles.updated_at, public.articles.slug
    into v_final_updated_at, v_final_slug;

  else
    -- UPDATE CONTRACT: Existing Article Draft
    if v_existing_status <> 'draft' then
      raise exception 'Cannot mutate non-draft article (current status: %)', v_existing_status using errcode = '22023';
    end if;

    update public.articles
    set
      title = trim(p_title),
      excerpt = p_excerpt,
      content_json = p_content_json,
      category_id = p_category_id,
      featured_image_path = p_featured_image_path,
      featured_image_alt = p_featured_image_alt,
      seo_title = p_seo_title,
      seo_description = p_seo_description,
      updated_at = now()
    where public.articles.id = p_article_id
    returning public.articles.updated_at, public.articles.slug
    into v_final_updated_at, v_final_slug;
  end if;

  -- 5. Reference Replacement & Validation (Atomic with Article Save)
  delete from public.article_references ar
  where ar.article_id = p_article_id;

  for v_ref in select * from jsonb_array_elements(p_references)
  loop
    v_ref_title := trim(coalesce(v_ref->>'title', ''));
    v_ref_source := trim(coalesce(v_ref->>'source_name', v_ref->>'sourceName', ''));
    v_ref_url := nullif(trim(coalesce(v_ref->>'url', '')), '');
    v_ref_details := nullif(trim(coalesce(v_ref->>'citation_details', v_ref->>'citationDetails', '')), '');

    if char_length(v_ref_title) = 0 then
      raise exception 'Reference title cannot be blank' using errcode = '23514';
    end if;

    if char_length(v_ref_source) = 0 then
      raise exception 'Reference source name cannot be blank' using errcode = '23514';
    end if;

    if v_ref_url is not null and not (v_ref_url ~* '^https?://') then
      raise exception 'Reference URL must begin with http:// or https://' using errcode = '23514';
    end if;

    insert into public.article_references (
      article_id,
      title,
      source_name,
      url,
      citation_details,
      sort_order
    )
    values (
      p_article_id,
      v_ref_title,
      v_ref_source,
      v_ref_url,
      v_ref_details,
      v_ref_index
    );

    v_ref_index := v_ref_index + 1;
  end loop;

  -- 6. Return Result
  return query select p_article_id, v_final_slug, v_final_updated_at;
end;
$$;

-- Revoke public execution, grant to authenticated only
revoke all on function public.save_article_draft from public, anon;
grant execute on function public.save_article_draft to authenticated;

comment on function public.save_article_draft is
  'Persists an article draft and replaces its structured references atomically in a single transaction for authenticated administrators under D028.';
