-- Seed File: supabase/seed.sql
-- Purpose: Synthetic local development data for Stage-3 testing and development.
-- STRICT POLICY: Synthetic fixtures ONLY. Never deploy to production or hosted database.

-- ============================================================================
-- 1. Synthetic Auth Users (auth.users)
-- ============================================================================

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'synthetic-admin@example.invalid',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- 'password'
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Synthetic Admin"}'::jsonb,
  now(),
  now()
), (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'synthetic-reader@example.invalid',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- 'password'
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"Synthetic Reader"}'::jsonb,
  now(),
  now()
) on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"synthetic-admin@example.invalid"}'::jsonb,
  'email',
  'synthetic-admin@example.invalid',
  now(),
  now(),
  now()
), (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '{"sub":"00000000-0000-0000-0000-000000000002","email":"synthetic-reader@example.invalid"}'::jsonb,
  'email',
  'synthetic-reader@example.invalid',
  now(),
  now(),
  now()
) on conflict (id) do nothing;

-- ============================================================================
-- 2. Local Admin Allowlist Entry (private.admin_users)
-- ============================================================================

insert into private.admin_users (user_id, created_at)
values ('00000000-0000-0000-0000-000000000001', now())
on conflict (user_id) do nothing;

-- ============================================================================
-- 3. Synthetic Profile (public.profiles)
-- ============================================================================

insert into public.profiles (
  id,
  display_name,
  professional_tagline,
  short_bio,
  long_bio,
  education_summary,
  interests,
  social_links,
  cv_storage_path,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000001',
  'Synthetic Medical Writer',
  'Medical Communications & Scientific Writing Placeholder',
  'Synthetic short biography for local development and UI testing.',
  'Synthetic extended biography providing sample text for testing layout rendering and typography without making real professional or medical claims.',
  'M.Sc. Biomedical Communications (Synthetic Example)',
  array['Medical Writing', 'Clinical Trial Documentation', 'Health Literacy', 'Continuing Medical Education'],
  '[{"platform": "LinkedIn", "url": "https://example.invalid/profile"}, {"platform": "ORCID", "url": "https://orcid.example.invalid/0000-0000-0000-0000"}]'::jsonb,
  'sample-cv.pdf',
  now(),
  now()
) on conflict (id) do nothing;

-- ============================================================================
-- 4. Synthetic Categories (public.categories)
-- ============================================================================

insert into public.categories (
  id,
  name,
  slug,
  description,
  created_at,
  updated_at
) values (
  '10000000-0000-0000-0000-000000000001',
  'Clinical Communications',
  'clinical-communications',
  'Synthetic category for articles covering medical documentation and healthcare communication standards.',
  now(),
  now()
), (
  '10000000-0000-0000-0000-000000000002',
  'Health Literacy & Education',
  'health-literacy-education',
  'Synthetic category for plain-language medical translations and patient education methods.',
  now(),
  now()
) on conflict (id) do nothing;

-- ============================================================================
-- 5. Synthetic Articles (public.articles)
-- ============================================================================

insert into public.articles (
  id,
  title,
  slug,
  excerpt,
  content_json,
  featured_image_path,
  featured_image_alt,
  category_id,
  status,
  is_featured,
  is_portfolio_featured,
  seo_title,
  seo_description,
  published_at,
  created_at,
  updated_at
) values (
  '20000000-0000-0000-0000-000000000001',
  'Evaluating Plain Language Standards in Clinical Protocol Summaries',
  'plain-language-clinical-protocol-summaries',
  'A synthetic sample article analyzing structured methodologies for drafting accessible clinical study summaries for multidisciplinary audiences.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "This is a synthetic sample article body designed to test content rendering, typography, and database constraints without making authoritative medical claims."}]}]}'::jsonb,
  'sample-featured-image-1.webp',
  'Synthetic placeholder illustration of clinical document review ledger',
  '10000000-0000-0000-0000-000000000001',
  'published',
  true,
  true,
  'Plain Language Standards in Clinical Summaries | Portfolio Sample',
  'A synthetic sample examining plain language methodologies for clinical protocol summaries.',
  now() - interval '2 days',
  now() - interval '2 days',
  now() - interval '2 days'
), (
  '20000000-0000-0000-0000-000000000002',
  'Draft: Best Practices for Regulatory Document Structuring',
  'draft-regulatory-document-structuring',
  'A synthetic draft article testing private access restrictions and author draft persistence workflows.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Draft content that must remain hidden from anonymous visitors and non-admin authenticated users."}]}]}'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000001',
  'draft',
  false,
  false,
  'Draft Regulatory Structuring',
  'Synthetic draft meta description.',
  null,
  now() - interval '1 day',
  now() - interval '1 day'
), (
  '20000000-0000-0000-0000-000000000003',
  'Archived: Historical Overview of 2024 Editorial Guidelines',
  'archived-historical-editorial-guidelines',
  'A synthetic archived article verifying that archived content is inaccessible to the public and accessible to admins.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Archived content preserved for administrative records."}]}]}'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000002',
  'archived',
  false,
  false,
  'Archived Guidelines',
  'Synthetic archived meta description.',
  now() - interval '30 days',
  now() - interval '30 days',
  now() - interval '10 days'
) on conflict (id) do nothing;

-- ============================================================================
-- 6. Synthetic Article References (public.article_references)
-- ============================================================================

insert into public.article_references (
  id,
  article_id,
  title,
  source_name,
  url,
  citation_details,
  sort_order,
  created_at
) values (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Guidelines for Clear and Concise Medical Writing in Scientific Publications',
  'Synthetic Journal of Medical Communications',
  'https://example.invalid/citations/guidelines-2025',
  'Vol. 14, No. 2, pp. 112–128 (Synthetic Citation)',
  0,
  now() - interval '2 days'
), (
  '30000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'Standards for Plain Language Communication in Healthcare Documentation',
  'Health Communication Working Group (Synthetic)',
  'https://example.invalid/citations/standards-health-comms',
  'Section 4.1: Readability Metrics and Terminology Glossaries',
  1,
  now() - interval '2 days'
), (
  '30000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000002',
  'Draft Reference for Regulatory Guidelines',
  'Regulatory Science Review (Synthetic)',
  'https://example.invalid/citations/regulatory-draft-ref',
  'Unpublished Reference for Draft Article',
  0,
  now() - interval '1 day'
) on conflict (id) do nothing;

-- ============================================================================
-- 7. Synthetic Comments (public.comments)
-- ============================================================================

insert into public.comments (
  id,
  article_id,
  commenter_name,
  commenter_email,
  body,
  status,
  created_at,
  moderated_at
) values (
  '40000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Dr. Alex Morgan (Synthetic Reader)',
  'reader-alex@example.invalid',
  'Thank you for this clear breakdown of summary methodology. The section on glossary formatting was especially helpful.',
  'approved',
  now() - interval '1 day',
  now() - interval '12 hours'
), (
  '40000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'Jordan Lee (Synthetic Reader)',
  'reader-jordan@example.invalid',
  'This is a pending comment submitted for moderation review testing.',
  'pending',
  now() - interval '3 hours',
  null
) on conflict (id) do nothing;

-- ============================================================================
-- 8. Synthetic Contact Messages (public.contact_messages)
-- ============================================================================

insert into public.contact_messages (
  id,
  name,
  email,
  subject,
  message,
  status,
  created_at
) values (
  '50000000-0000-0000-0000-000000000001',
  'Sam Taylor (Synthetic Inquirer)',
  'inquirer-sam@example.invalid',
  'Inquiry Regarding Medical Writing Collaboration',
  'Hello, I am reaching out to discuss potential medical writing and editorial support for an upcoming continuing education publication series. This is a synthetic message for local inbox testing.',
  'new',
  now() - interval '4 hours'
) on conflict (id) do nothing;

-- ============================================================================
-- 9. Site Settings (public.site_settings)
-- ============================================================================

insert into public.site_settings (
  id,
  site_title,
  tagline,
  default_seo_description,
  social_links,
  disclaimer_text,
  homepage_intro,
  created_at,
  updated_at
) values (
  1,
  'Marie Medere',
  'Medical Writing Portfolio & Educational Blog',
  'Professional medical writing portfolio and educational blog featuring clear, evidence-based medical communications and clinical writing samples.',
  '[{"platform": "LinkedIn", "url": "https://example.invalid/profile"}, {"platform": "ORCID", "url": "https://orcid.example.invalid/0000-0000-0000-0000"}]'::jsonb,
  'The content published on this website is for educational and informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding medical conditions.',
  'Welcome to my medical writing portfolio and educational blog. Here you will find peer-referenced articles, clinical writing samples, and resources on medical communications.',
  now(),
  now()
) on conflict (id) do update set
  site_title = excluded.site_title,
  tagline = excluded.tagline,
  default_seo_description = excluded.default_seo_description,
  social_links = excluded.social_links,
  disclaimer_text = excluded.disclaimer_text,
  homepage_intro = excluded.homepage_intro;
