-- Migration: Stage 8 Publishing Lifecycle Foundation (D030)
-- Date: 2026-08-26
-- Stage 8: Publishing Workflow

-- ============================================================================
-- 1. Lifecycle RPC: public.publish_article
-- ============================================================================

create or replace function public.publish_article(
  p_article_id uuid,
  p_slug text,
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
  status text,
  published_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing_status text;
  v_existing_slug text;
  v_existing_published_at timestamptz;
  v_cleaned_slug text;
  v_candidate_slug text;
  v_suffix text;
  v_max_base_len integer;
  v_collision_count integer := 1;
  v_slug_assigned boolean := false;
  v_final_slug text;
  v_final_published_at timestamptz;
  v_final_updated_at timestamptz;
  v_ref jsonb;
  v_ref_index integer := 0;
  v_ref_title text;
  v_ref_source text;
  v_ref_url text;
  v_ref_details text;
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

  -- Meaningful non-empty content validation for publishing (requires at least one non-whitespace text node)
  if not jsonb_path_exists(p_content_json, '$.** ? (@.type == "text" && @.text like_regex "\\S")') then
    raise exception 'Cannot publish article without meaningful textual content' using errcode = '23514';
  end if;

  if p_references is null or jsonb_typeof(p_references) <> 'array' then
    raise exception 'Invalid references: must be a JSON array' using errcode = '22023';
  end if;

  if p_category_id is not null then
    if not exists (select 1 from public.categories c where c.id = p_category_id) then
      raise exception 'Category not found' using errcode = '23503';
    end if;
  end if;

  -- Featured Image Validation
  if p_featured_image_path is not null and char_length(trim(p_featured_image_path)) > 0 then
    if p_featured_image_alt is null or char_length(trim(p_featured_image_alt)) = 0 then
      raise exception 'Featured image alt text cannot be blank when image path is present' using errcode = '23514';
    end if;

    if not (p_featured_image_path ~ ('^articles/' || p_article_id::text || '/featured/.+$')) then
      raise exception 'Featured image path must belong to this article under articles/%/featured/...', p_article_id using errcode = '22023';
    end if;
  end if;

  -- 3. Lock & Verify Existing Article State
  select a.status, a.slug, a.published_at
  into v_existing_status, v_existing_slug, v_existing_published_at
  from public.articles a
  where a.id = p_article_id
  for update;

  if v_existing_status is null then
    raise exception 'Article not found' using errcode = 'P0002';
  end if;

  -- Enforce Single-Path Lifecycle: Source status must be draft only
  if v_existing_status <> 'draft' then
    raise exception 'Cannot publish article: source status must be draft (current status: %)', v_existing_status using errcode = '22023';
  end if;

  -- 4. Canonical Slug Assignment & Collision Resolution
  if v_existing_published_at is null then
    -- FIRST-EVER PUBLICATION
    if p_slug is null or char_length(trim(p_slug)) = 0 then
      raise exception 'Canonical publication slug cannot be blank' using errcode = '23514';
    end if;

    v_cleaned_slug := trim(lower(p_slug));

    if not (v_cleaned_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$') then
      raise exception 'Canonical slug must be kebab-case' using errcode = '23514';
    end if;

    if char_length(v_cleaned_slug) > 80 then
      raise exception 'Canonical slug cannot exceed 80 characters' using errcode = '23514';
    end if;

    -- Reject System Provisional UUID Slug Pattern
    if v_cleaned_slug ~ '^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Cannot publish with system provisional draft slug' using errcode = '22023';
    end if;

    -- Deterministic Collision Resolution Loop
    while not v_slug_assigned and v_collision_count <= 50 loop
      if v_collision_count = 1 then
        v_candidate_slug := v_cleaned_slug;
      else
        v_suffix := '-' || v_collision_count::text;
        v_max_base_len := 80 - char_length(v_suffix);
        v_candidate_slug := rtrim(substring(v_cleaned_slug from 1 for v_max_base_len), '-') || v_suffix;
      end if;

      -- Check if any other article owns this candidate slug
      if not exists (select 1 from public.articles a where a.slug = v_candidate_slug and a.id <> p_article_id) then
        begin
          update public.articles
          set
            slug = v_candidate_slug,
            title = trim(p_title),
            excerpt = p_excerpt,
            content_json = p_content_json,
            category_id = p_category_id,
            featured_image_path = p_featured_image_path,
            featured_image_alt = p_featured_image_alt,
            seo_title = p_seo_title,
            seo_description = p_seo_description,
            status = 'published',
            published_at = now(),
            updated_at = now()
          where public.articles.id = p_article_id
          returning public.articles.slug, public.articles.published_at, public.articles.updated_at
          into v_final_slug, v_final_published_at, v_final_updated_at;

          v_slug_assigned := true;
        exception when unique_violation then
          -- Caught concurrent race collision; retry with next suffix
          v_slug_assigned := false;
        end;
      end if;

      v_collision_count := v_collision_count + 1;
    end loop;

    if not v_slug_assigned then
      raise exception 'Failed to allocate unique canonical slug after 50 collision resolution attempts' using errcode = '23505';
    end if;

  else
    -- REPUBLISH (Ever-Published Article Returning from Draft)
    -- Slug and original publication date are permanently frozen
    if v_existing_slug ~ '^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Cannot republish article with provisional draft slug' using errcode = '22023';
    end if;

    if p_slug is not null and trim(p_slug) <> '' and trim(p_slug) <> v_existing_slug then
      raise exception 'Cannot change canonical slug on republish (canonical slug: %)', v_existing_slug using errcode = '22023';
    end if;

    v_final_slug := v_existing_slug;
    v_final_published_at := v_existing_published_at;

    update public.articles
    set
      slug = v_final_slug,
      title = trim(p_title),
      excerpt = p_excerpt,
      content_json = p_content_json,
      category_id = p_category_id,
      featured_image_path = p_featured_image_path,
      featured_image_alt = p_featured_image_alt,
      seo_title = p_seo_title,
      seo_description = p_seo_description,
      status = 'published',
      published_at = v_final_published_at,
      updated_at = now()
    where public.articles.id = p_article_id
    returning public.articles.updated_at into v_final_updated_at;
  end if;

  -- 5. Reference Replacement & Validation (Atomic with Article Publication)
  delete from public.article_references ar
  where ar.article_id = p_article_id;

  for v_ref in select * from jsonb_array_elements(p_references)
  loop
    v_ref_title := trim(coalesce(v_ref->>'title', ''));
    v_ref_source := trim(coalesce(v_ref->>'source_name', ''));
    v_ref_url := nullif(trim(coalesce(v_ref->>'url', '')), '');
    v_ref_details := nullif(trim(coalesce(v_ref->>'citation_details', '')), '');

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
  return query select p_article_id, v_final_slug, 'published'::text, v_final_published_at, v_final_updated_at;
end;
$$;

revoke all on function public.publish_article from public, anon;
grant execute on function public.publish_article to authenticated;

comment on function public.publish_article is
  'Transitions a draft article to published status with canonical slug assignment and atomic reference replacement under D030.';

-- ============================================================================
-- 2. Lifecycle RPC: public.update_published_article
-- ============================================================================

create or replace function public.update_published_article(
  p_article_id uuid,
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
  status text,
  published_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing_status text;
  v_existing_slug text;
  v_existing_published_at timestamptz;
  v_final_updated_at timestamptz;
  v_ref jsonb;
  v_ref_index integer := 0;
  v_ref_title text;
  v_ref_source text;
  v_ref_url text;
  v_ref_details text;
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

  -- Meaningful non-empty content validation for published update (requires at least one non-whitespace text node)
  if not jsonb_path_exists(p_content_json, '$.** ? (@.type == "text" && @.text like_regex "\\S")') then
    raise exception 'Cannot update published article without meaningful textual content' using errcode = '23514';
  end if;

  if p_references is null or jsonb_typeof(p_references) <> 'array' then
    raise exception 'Invalid references: must be a JSON array' using errcode = '22023';
  end if;

  if p_category_id is not null then
    if not exists (select 1 from public.categories c where c.id = p_category_id) then
      raise exception 'Category not found' using errcode = '23503';
    end if;
  end if;

  -- Featured Image Validation
  if p_featured_image_path is not null and char_length(trim(p_featured_image_path)) > 0 then
    if p_featured_image_alt is null or char_length(trim(p_featured_image_alt)) = 0 then
      raise exception 'Featured image alt text cannot be blank when image path is present' using errcode = '23514';
    end if;

    if not (p_featured_image_path ~ ('^articles/' || p_article_id::text || '/featured/.+$')) then
      raise exception 'Featured image path must belong to this article under articles/%/featured/...', p_article_id using errcode = '22023';
    end if;
  end if;

  -- 3. Lock & Verify Existing Published State
  select a.status, a.slug, a.published_at
  into v_existing_status, v_existing_slug, v_existing_published_at
  from public.articles a
  where a.id = p_article_id
  for update;

  if v_existing_status is null then
    raise exception 'Article not found' using errcode = 'P0002';
  end if;

  if v_existing_status <> 'published' then
    raise exception 'Cannot update non-published article via update_published_article (current status: %)', v_existing_status using errcode = '22023';
  end if;

  -- 4. Update Article Content (Slug, status, published_at, and feature flags remain strictly preserved)
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
  returning public.articles.updated_at into v_final_updated_at;

  -- 5. Reference Replacement & Validation (Atomic with Article Update)
  delete from public.article_references ar
  where ar.article_id = p_article_id;

  for v_ref in select * from jsonb_array_elements(p_references)
  loop
    v_ref_title := trim(coalesce(v_ref->>'title', ''));
    v_ref_source := trim(coalesce(v_ref->>'source_name', ''));
    v_ref_url := nullif(trim(coalesce(v_ref->>'url', '')), '');
    v_ref_details := nullif(trim(coalesce(v_ref->>'citation_details', '')), '');

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
  return query select p_article_id, v_existing_slug, 'published'::text, v_existing_published_at, v_final_updated_at;
end;
$$;

revoke all on function public.update_published_article from public, anon;
grant execute on function public.update_published_article to authenticated;

comment on function public.update_published_article is
  'Updates content and references for a published article while strictly locking slug, status, and published_at under D030.';

-- ============================================================================
-- 3. Lifecycle RPC: public.unpublish_article
-- ============================================================================

create or replace function public.unpublish_article(
  p_article_id uuid,
  p_private_image_path text default null
)
returns table (
  article_id uuid,
  slug text,
  status text,
  published_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing_status text;
  v_existing_slug text;
  v_existing_published_at timestamptz;
  v_existing_image_path text;
  v_final_image_path text;
  v_final_updated_at timestamptz;
begin
  -- 1. Security Authorization Gate
  if not coalesce(private.is_admin(), false) then
    raise exception 'Unauthorized: administrative privileges required' using errcode = '42501';
  end if;

  -- 2. Input Validation
  if p_article_id is null then
    raise exception 'Article ID cannot be null' using errcode = '23502';
  end if;

  -- 3. Lock & Verify Existing Published State
  select a.status, a.slug, a.published_at, a.featured_image_path
  into v_existing_status, v_existing_slug, v_existing_published_at, v_existing_image_path
  from public.articles a
  where a.id = p_article_id
  for update;

  if v_existing_status is null then
    raise exception 'Article not found' using errcode = 'P0002';
  end if;

  if v_existing_status <> 'published' then
    raise exception 'Cannot unpublish non-published article (current status: %)', v_existing_status using errcode = '22023';
  end if;

  -- 4. Featured Image Demotion Contract
  if v_existing_image_path is not null and char_length(trim(v_existing_image_path)) > 0 then
    if p_private_image_path is null or char_length(trim(p_private_image_path)) = 0 then
      raise exception 'Private image destination path is required when unpublishing an article with a featured image' using errcode = '23514';
    end if;

    if not (p_private_image_path ~ ('^articles/' || p_article_id::text || '/featured/.+$')) then
      raise exception 'Private image destination path must belong to this article under articles/%/featured/...', p_article_id using errcode = '22023';
    end if;

    v_final_image_path := trim(p_private_image_path);
  else
    if p_private_image_path is not null and char_length(trim(p_private_image_path)) > 0 then
      raise exception 'Cannot supply private image path when article has no featured image' using errcode = '22023';
    end if;

    v_final_image_path := null;
  end if;

  -- 5. Transition Status to Draft (Preserving slug and published_at)
  update public.articles
  set
    status = 'draft',
    is_featured = false,
    is_portfolio_featured = false,
    featured_image_path = v_final_image_path,
    updated_at = now()
  where public.articles.id = p_article_id
  returning public.articles.updated_at into v_final_updated_at;

  -- 6. Return Result
  return query select p_article_id, v_existing_slug, 'draft'::text, v_existing_published_at, v_final_updated_at;
end;
$$;

revoke all on function public.unpublish_article from public, anon;
grant execute on function public.unpublish_article to authenticated;

comment on function public.unpublish_article is
  'Transitions a published article back to draft, clearing public featured flags and demoting featured image path to draft-assets under D030.';

-- ============================================================================
-- 4. Lifecycle RPC: public.archive_article
-- ============================================================================

create or replace function public.archive_article(
  p_article_id uuid,
  p_private_image_path text default null
)
returns table (
  article_id uuid,
  slug text,
  status text,
  published_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing_status text;
  v_existing_slug text;
  v_existing_published_at timestamptz;
  v_existing_image_path text;
  v_final_image_path text;
  v_final_updated_at timestamptz;
begin
  -- 1. Security Authorization Gate
  if not coalesce(private.is_admin(), false) then
    raise exception 'Unauthorized: administrative privileges required' using errcode = '42501';
  end if;

  -- 2. Input Validation
  if p_article_id is null then
    raise exception 'Article ID cannot be null' using errcode = '23502';
  end if;

  -- 3. Lock & Verify Existing State
  select a.status, a.slug, a.published_at, a.featured_image_path
  into v_existing_status, v_existing_slug, v_existing_published_at, v_existing_image_path
  from public.articles a
  where a.id = p_article_id
  for update;

  if v_existing_status is null then
    raise exception 'Article not found' using errcode = 'P0002';
  end if;

  if v_existing_status not in ('published', 'draft') then
    raise exception 'Cannot archive article with status % (must be published or draft)', v_existing_status using errcode = '22023';
  end if;

  -- 4. Featured Image Handling for Archive
  if v_existing_status = 'published' then
    if v_existing_image_path is not null and char_length(trim(v_existing_image_path)) > 0 then
      if p_private_image_path is null or char_length(trim(p_private_image_path)) = 0 then
        raise exception 'Private image destination path is required when archiving a published article with a featured image' using errcode = '23514';
      end if;

      if not (p_private_image_path ~ ('^articles/' || p_article_id::text || '/featured/.+$')) then
        raise exception 'Private image destination path must belong to this article under articles/%/featured/...', p_article_id using errcode = '22023';
      end if;

      v_final_image_path := trim(p_private_image_path);
    else
      if p_private_image_path is not null and char_length(trim(p_private_image_path)) > 0 then
        raise exception 'Cannot supply private image path when archiving a published article with no featured image' using errcode = '22023';
      end if;

      v_final_image_path := null;
    end if;
  else
    -- Draft archive: preserve existing draft image path and reject attempts to supply private destination path
    if p_private_image_path is not null and char_length(trim(p_private_image_path)) > 0 then
      raise exception 'Cannot supply private image destination path when archiving a draft article' using errcode = '22023';
    end if;

    v_final_image_path := v_existing_image_path;
  end if;

  -- 5. Transition Status to Archived
  update public.articles
  set
    status = 'archived',
    is_featured = false,
    is_portfolio_featured = false,
    featured_image_path = v_final_image_path,
    updated_at = now()
  where public.articles.id = p_article_id
  returning public.articles.updated_at into v_final_updated_at;

  -- 6. Return Result
  return query select p_article_id, v_existing_slug, 'archived'::text, v_existing_published_at, v_final_updated_at;
end;
$$;

revoke all on function public.archive_article from public, anon;
grant execute on function public.archive_article to authenticated;

comment on function public.archive_article is
  'Transitions a draft or published article to archived status under D030, retiring it from public view while preserving historical data.';

-- ============================================================================
-- 5. Lifecycle RPC: public.restore_article
-- ============================================================================

create or replace function public.restore_article(
  p_article_id uuid
)
returns table (
  article_id uuid,
  slug text,
  status text,
  published_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing_status text;
  v_existing_slug text;
  v_existing_published_at timestamptz;
  v_final_updated_at timestamptz;
begin
  -- 1. Security Authorization Gate
  if not coalesce(private.is_admin(), false) then
    raise exception 'Unauthorized: administrative privileges required' using errcode = '42501';
  end if;

  -- 2. Input Validation
  if p_article_id is null then
    raise exception 'Article ID cannot be null' using errcode = '23502';
  end if;

  -- 3. Lock & Verify Existing State
  select a.status, a.slug, a.published_at
  into v_existing_status, v_existing_slug, v_existing_published_at
  from public.articles a
  where a.id = p_article_id
  for update;

  if v_existing_status is null then
    raise exception 'Article not found' using errcode = 'P0002';
  end if;

  if v_existing_status <> 'archived' then
    raise exception 'Cannot restore non-archived article (current status: %)', v_existing_status using errcode = '22023';
  end if;

  -- 4. Transition Status to Draft
  update public.articles
  set
    status = 'draft',
    updated_at = now()
  where public.articles.id = p_article_id
  returning public.articles.updated_at into v_final_updated_at;

  -- 5. Return Result
  return query select p_article_id, v_existing_slug, 'draft'::text, v_existing_published_at, v_final_updated_at;
end;
$$;

revoke all on function public.restore_article from public, anon;
grant execute on function public.restore_article to authenticated;

comment on function public.restore_article is
  'Restores an archived article back to draft workspace status under D030.';

-- ============================================================================
-- 6. Lifecycle RPC: public.delete_article
-- ============================================================================

create or replace function public.delete_article(
  p_article_id uuid
)
returns table (
  article_id uuid,
  slug text,
  deleted boolean
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing_status text;
  v_existing_slug text;
  v_existing_published_at timestamptz;
begin
  -- 1. Security Authorization Gate
  if not coalesce(private.is_admin(), false) then
    raise exception 'Unauthorized: administrative privileges required' using errcode = '42501';
  end if;

  -- 2. Input Validation
  if p_article_id is null then
    raise exception 'Article ID cannot be null' using errcode = '23502';
  end if;

  -- 3. Lock & Verify Existing State
  select a.status, a.slug, a.published_at
  into v_existing_status, v_existing_slug, v_existing_published_at
  from public.articles a
  where a.id = p_article_id
  for update;

  if v_existing_status is null then
    raise exception 'Article not found' using errcode = 'P0002';
  end if;

  -- 4. Permalink & Deletion Safety Rule: Only never-published draft/archived articles may be deleted
  if v_existing_status not in ('draft', 'archived') then
    raise exception 'Cannot delete article with status % (must be draft or archived)', v_existing_status using errcode = '22023';
  end if;

  if v_existing_published_at is not null then
    raise exception 'Cannot delete ever-published article (published_at is non-null). Archive instead.' using errcode = '22023';
  end if;

  -- 5. Delete Article (article_references cascades via foreign key)
  delete from public.articles
  where public.articles.id = p_article_id;

  -- 6. Return Result
  return query select p_article_id, v_existing_slug, true;
end;
$$;

revoke all on function public.delete_article from public, anon;
grant execute on function public.delete_article to authenticated;

comment on function public.delete_article is
  'Permanently deletes a never-published draft or archived article under D030; rejects deletion of ever-published records to safeguard canonical URL ownership.';
