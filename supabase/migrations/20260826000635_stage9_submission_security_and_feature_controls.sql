-- ============================================================================
-- Migration: 20260826000635_stage9_submission_security_and_feature_controls.sql
-- Stage 9: Comments, Contact Inbox & Settings Foundation (Phase 9A)
-- Architecture: Approved Decision D032 (Single-Admin + Abuse Defense)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Comment Moderation Invariant Constraints
-- ----------------------------------------------------------------------------

ALTER TABLE public.comments
  ADD CONSTRAINT comments_moderation_consistency_check
  CHECK (
    (status = 'pending' AND moderated_at IS NULL) OR
    (status IN ('approved', 'hidden') AND moderated_at IS NOT NULL)
  );

-- ----------------------------------------------------------------------------
-- 2. Article Feature Flag Publication Constraints & Lead Uniqueness
-- ----------------------------------------------------------------------------

ALTER TABLE public.articles
  ADD CONSTRAINT articles_is_featured_published_check
  CHECK (is_featured = false OR status = 'published');

ALTER TABLE public.articles
  ADD CONSTRAINT articles_is_portfolio_featured_published_check
  CHECK (is_portfolio_featured = false OR status = 'published');

-- Enforce at most one lead featured article globally
CREATE UNIQUE INDEX idx_articles_single_featured
  ON public.articles (is_featured)
  WHERE is_featured = true;

-- ----------------------------------------------------------------------------
-- 3. Site Settings Singleton Integrity Constraints
-- ----------------------------------------------------------------------------

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_singleton_id_check
  CHECK (id = 1);

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_title_check
  CHECK (pg_catalog.length(pg_catalog.btrim(site_title)) > 0 AND pg_catalog.length(site_title) <= 120);

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_tagline_check
  CHECK (tagline IS NULL OR pg_catalog.length(tagline) <= 200);

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_homepage_intro_check
  CHECK (homepage_intro IS NULL OR pg_catalog.length(homepage_intro) <= 1200);

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_disclaimer_check
  CHECK (disclaimer_text IS NULL OR pg_catalog.length(disclaimer_text) <= 1500);

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_seo_desc_check
  CHECK (default_seo_description IS NULL OR pg_catalog.length(default_seo_description) <= 320);

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_social_links_array_check
  CHECK (jsonb_typeof(social_links) = 'array');

-- ----------------------------------------------------------------------------
-- 4. Rate-Limit Supporting Indexes
-- ----------------------------------------------------------------------------

CREATE INDEX idx_comments_rate_email_created
  ON public.comments (commenter_email, created_at DESC);

CREATE INDEX idx_comments_rate_created
  ON public.comments (created_at DESC);

CREATE INDEX idx_contact_messages_rate_email_created
  ON public.contact_messages (email, created_at DESC);

CREATE INDEX idx_contact_messages_rate_created
  ON public.contact_messages (created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. Private Comment Submission Guard (Normalization & Rate Limiting)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.guard_comment_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_jwt_claims text;
  v_is_api_request boolean;
  v_is_admin boolean;
BEGIN
  -- Detect request context defensively without using deprecated auth.role()
  v_jwt_claims := pg_catalog.current_setting('request.jwt.claims', true);
  v_is_api_request := (v_jwt_claims IS NOT NULL AND v_jwt_claims <> '');
  v_is_admin := coalesce(private.is_admin(), false);

  -- Apply public abuse guards only for API requests from non-admin callers
  IF v_is_api_request AND NOT v_is_admin THEN
    -- Transaction-level advisory lock (Key: 74839201) to eliminate race conditions in rolling counts
    PERFORM pg_catalog.pg_advisory_xact_lock(74839201);

    -- 1. Input Normalization
    NEW.commenter_name := pg_catalog.btrim(NEW.commenter_name);
    NEW.commenter_email := pg_catalog.lower(pg_catalog.btrim(NEW.commenter_email));
    NEW.body := pg_catalog.btrim(NEW.body);
    NEW.status := 'pending';
    NEW.moderated_at := NULL;

    -- 2. Non-empty validation
    IF pg_catalog.length(NEW.commenter_name) = 0 OR
       pg_catalog.length(NEW.commenter_email) = 0 OR
       pg_catalog.length(NEW.body) = 0 THEN
      RAISE EXCEPTION 'Comment fields (name, email, body) cannot be empty or whitespace.';
    END IF;

    -- 3. Rate Limit: Max 3 per normalized email + article in rolling 15 minutes
    IF (
      SELECT pg_catalog.count(*)
      FROM public.comments c
      WHERE c.commenter_email = NEW.commenter_email
        AND c.article_id = NEW.article_id
        AND c.created_at >= (pg_catalog.now() - INTERVAL '15 minutes')
    ) >= 3 THEN
      RAISE EXCEPTION 'Too many comments submitted for this article. Please wait before posting again.';
    END IF;

    -- 4. Rate Limit: Max 10 per normalized email site-wide in rolling 24 hours
    IF (
      SELECT pg_catalog.count(*)
      FROM public.comments c
      WHERE c.commenter_email = NEW.commenter_email
        AND c.created_at >= (pg_catalog.now() - INTERVAL '24 hours')
    ) >= 10 THEN
      RAISE EXCEPTION 'Daily comment submission limit reached. Please try again tomorrow.';
    END IF;

    -- 5. Rate Limit: Max 100 site-wide public comments in rolling 1 hour
    IF (
      SELECT pg_catalog.count(*)
      FROM public.comments c
      WHERE c.created_at >= (pg_catalog.now() - INTERVAL '1 hour')
    ) >= 100 THEN
      RAISE EXCEPTION 'Comment system is currently busy. Please try again later.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.guard_comment_submission() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_guard_comment_submission
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_comment_submission();

-- ----------------------------------------------------------------------------
-- 6. Private Contact Submission Guard (Normalization & Rate Limiting)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.guard_contact_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_jwt_claims text;
  v_is_api_request boolean;
  v_is_admin boolean;
BEGIN
  -- Detect request context defensively without using deprecated auth.role()
  v_jwt_claims := pg_catalog.current_setting('request.jwt.claims', true);
  v_is_api_request := (v_jwt_claims IS NOT NULL AND v_jwt_claims <> '');
  v_is_admin := coalesce(private.is_admin(), false);

  -- Apply public abuse guards only for API requests from non-admin callers
  IF v_is_api_request AND NOT v_is_admin THEN
    -- Transaction-level advisory lock (Key: 74839202) to eliminate race conditions in rolling counts
    PERFORM pg_catalog.pg_advisory_xact_lock(74839202);

    -- 1. Input Normalization
    NEW.name := pg_catalog.btrim(NEW.name);
    NEW.email := pg_catalog.lower(pg_catalog.btrim(NEW.email));
    NEW.subject := pg_catalog.btrim(NEW.subject);
    NEW.message := pg_catalog.btrim(NEW.message);
    NEW.status := 'new';

    -- 2. Non-empty validation
    IF pg_catalog.length(NEW.name) = 0 OR
       pg_catalog.length(NEW.email) = 0 OR
       pg_catalog.length(NEW.subject) = 0 OR
       pg_catalog.length(NEW.message) = 0 THEN
      RAISE EXCEPTION 'Contact fields (name, email, subject, message) cannot be empty or whitespace.';
    END IF;

    -- 3. Rate Limit: Max 3 per normalized email in rolling 1 hour
    IF (
      SELECT pg_catalog.count(*)
      FROM public.contact_messages m
      WHERE m.email = NEW.email
        AND m.created_at >= (pg_catalog.now() - INTERVAL '1 hour')
    ) >= 3 THEN
      RAISE EXCEPTION 'Too many messages sent. Please wait before submitting another inquiry.';
    END IF;

    -- 4. Rate Limit: Max 5 per normalized email in rolling 24 hours
    IF (
      SELECT pg_catalog.count(*)
      FROM public.contact_messages m
      WHERE m.email = NEW.email
        AND m.created_at >= (pg_catalog.now() - INTERVAL '24 hours')
    ) >= 5 THEN
      RAISE EXCEPTION 'Daily message limit reached. Please try again tomorrow.';
    END IF;

    -- 5. Rate Limit: Max 30 site-wide contact submissions in rolling 1 hour
    IF (
      SELECT pg_catalog.count(*)
      FROM public.contact_messages m
      WHERE m.created_at >= (pg_catalog.now() - INTERVAL '1 hour')
    ) >= 30 THEN
      RAISE EXCEPTION 'Contact service is currently experiencing high volume. Please try again later.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.guard_contact_submission() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_guard_contact_submission
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_contact_submission();

-- ----------------------------------------------------------------------------
-- 7. Admin Lead-Feature Control RPC
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_featured_article(p_article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT coalesce(private.is_admin(), false) THEN
    RAISE EXCEPTION 'Unauthorized: only administrators can set featured articles.';
  END IF;

  IF p_article_id IS NULL THEN
    UPDATE public.articles
    SET is_featured = false
    WHERE is_featured = true;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.articles
    WHERE id = p_article_id
      AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'Invalid article: featured lead article must exist and have published status.';
  END IF;

  -- Atomically clear previous featured and set new featured article
  UPDATE public.articles
  SET is_featured = false
  WHERE is_featured = true
    AND id <> p_article_id;

  UPDATE public.articles
  SET is_featured = true
  WHERE id = p_article_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_featured_article(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_featured_article(uuid) TO authenticated;
