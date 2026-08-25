-- Seed File: supabase/seed.sql
-- Purpose: Synthetic local development data for Stage-3 and Stage-6 testing.
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
  'Synthetic Stage 6 Author',
  'Synthetic local development profile',
  'Synthetic profile text used only for local Stage 6 layout testing.',
  'Synthetic extended profile text used exclusively for local Stage 6 development verification and typography rendering without making real medical or professional claims.',
  null,
  array['Synthetic Testing', 'Editorial Typography', 'Layout Verification'],
  '[]'::jsonb,
  null,
  now(),
  now()
) on conflict (id) do update set
  display_name = excluded.display_name,
  professional_tagline = excluded.professional_tagline,
  short_bio = excluded.short_bio,
  long_bio = excluded.long_bio,
  education_summary = excluded.education_summary,
  interests = excluded.interests,
  social_links = excluded.social_links,
  cv_storage_path = excluded.cv_storage_path;

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
  'Synthetic — Clinical Communications',
  'clinical-communications',
  'Synthetic local category fixture for testing clinical communications layouts and article filtering.',
  now(),
  now()
), (
  '10000000-0000-0000-0000-000000000002',
  'Synthetic — Health Literacy & Education',
  'health-literacy-education',
  'Synthetic local category fixture for testing health literacy layouts and article filtering.',
  now(),
  now()
) on conflict (id) do update set
  name = excluded.name,
  description = excluded.description;

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
  'Synthetic — Evaluating Plain Language Standards in Protocol Summaries',
  'plain-language-clinical-protocol-summaries',
  'Synthetic local test excerpt examining layout structures and formatting for protocol summary documents.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "This synthetic development paragraph exists only to test long-form article typography, spacing, lists, and reference rendering without making clinical claims."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Synthetic Structural Typography Test Heading" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "The following list verifies unordered list rendering inside the Evidence Folio reading environment:"
          }
        ]
      },
      {
        "type": "bulletList",
        "content": [
          {
            "type": "listItem",
            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Synthetic list item 01: testing bullet point alignment." }] }]
          },
          {
            "type": "listItem",
            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Synthetic list item 02: testing typography line-height." }] }]
          },
          {
            "type": "listItem",
            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Synthetic list item 03: testing nested paragraph wrapping." }] }]
          }
        ]
      },
      {
        "type": "blockquote",
        "content": [
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "This synthetic blockquote verifies callout styling, border-left accent color, and muted typography measures."
              }
            ]
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 3 },
        "content": [{ "type": "text", "text": "Synthetic Subheading for Hierarchical Verification" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Concluding synthetic paragraph ensuring proper baseline spacing before the Reference Ledger section."
          }
        ]
      }
    ]
  }'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000001',
  'published',
  true,
  true,
  'Plain Language Standards in Protocol Summaries (Synthetic Fixture)',
  'Synthetic sample examining layout structures for clinical protocol summaries.',
  now() - interval '8 days',
  now() - interval '8 days',
  now() - interval '8 days'
), (
  '20000000-0000-0000-0000-000000000002',
  'Synthetic Draft — Best Practices for Regulatory Document Structuring',
  'draft-regulatory-document-structuring',
  'Synthetic draft article testing private access restrictions and author draft persistence workflows.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Draft content that must remain hidden from anonymous visitors and non-admin authenticated users."}]}]}'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000001',
  'draft',
  false,
  false,
  'Draft Regulatory Structuring (Synthetic Fixture)',
  'Synthetic draft meta description.',
  null,
  now() - interval '1 day',
  now() - interval '1 day'
), (
  '20000000-0000-0000-0000-000000000003',
  'Synthetic Archived — Historical Overview of 2024 Editorial Guidelines',
  'archived-historical-editorial-guidelines',
  'Synthetic archived article verifying that archived content is inaccessible to the public and accessible to admins.',
  '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Archived content preserved for administrative records."}]}]}'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000002',
  'archived',
  false,
  false,
  'Archived Guidelines (Synthetic Fixture)',
  'Synthetic archived meta description.',
  now() - interval '30 days',
  now() - interval '30 days',
  now() - interval '10 days'
), (
  '20000000-0000-0000-0000-000000000004',
  'Synthetic — Structured Methods for Patient Education Materials',
  'patient-education-materials-chronic-care',
  'Synthetic test article evaluating formatting and layout strategies for patient education guides.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "This synthetic fixture tests layout rendering for health literacy articles without making substantive clinical claims."
          }
        ]
      }
    ]
  }'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000002',
  'published',
  false,
  true,
  'Patient Education Materials (Synthetic Fixture)',
  'Synthetic fixture examining patient education layout.',
  now() - interval '7 days',
  now() - interval '7 days',
  now() - interval '7 days'
), (
  '20000000-0000-0000-0000-000000000005',
  'Synthetic — Comparative Analysis of Editorial Consistency in Trial Reports',
  'editorial-consistency-multi-center-reports',
  'Synthetic test fixture examining multi-center editorial formatting guidelines.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Synthetic test content for multi-center documentation consistency."
          }
        ]
      }
    ]
  }'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000001',
  'published',
  false,
  false,
  'Editorial Consistency (Synthetic Fixture)',
  'Synthetic test fixture for trial reporting consistency.',
  now() - interval '6 days',
  now() - interval '6 days',
  now() - interval '6 days'
), (
  '20000000-0000-0000-0000-000000000006',
  'Synthetic — Visual Hierarchy and Readability in Public Health Notices',
  'visual-hierarchy-readability-public-health',
  'Synthetic test fixture analyzing typographic hierarchy in public notices.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Synthetic fixture paragraph evaluating visual hierarchy in public communication."
          }
        ]
      }
    ]
  }'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000002',
  'published',
  false,
  false,
  'Visual Hierarchy (Synthetic Fixture)',
  'Synthetic fixture on visual hierarchy.',
  now() - interval '5 days',
  now() - interval '5 days',
  now() - interval '5 days'
), (
  '20000000-0000-0000-0000-000000000007',
  'Synthetic — Syntax and Terminology Standardization in Documentation',
  'syntax-standardization-investigator-documents',
  'Synthetic fixture evaluating terminology control methodologies in documentation packages.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Synthetic content evaluating terminology standardization."
          }
        ]
      }
    ]
  }'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000001',
  'published',
  false,
  false,
  'Syntax Standardization (Synthetic Fixture)',
  'Synthetic fixture on syntax standardization.',
  now() - interval '4 days',
  now() - interval '4 days',
  now() - interval '4 days'
), (
  '20000000-0000-0000-0000-000000000008',
  'Synthetic — Designing Contextual Glossaries in Clinical Documentation',
  'accessible-informed-consent-glossaries',
  'Synthetic fixture analyzing glossary structuring in clinical trial documentation.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Synthetic fixture testing glossary formatting."
          }
        ]
      }
    ]
  }'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000002',
  'published',
  false,
  false,
  'Consent Glossaries (Synthetic Fixture)',
  'Synthetic fixture on consent glossaries.',
  now() - interval '3 days',
  now() - interval '3 days',
  now() - interval '3 days'
), (
  '20000000-0000-0000-0000-000000000009',
  'Synthetic — Structuring Executive Summaries in Technical Healthcare Writing',
  'executive-summaries-healthcare-technical-writing',
  'Synthetic fixture exploring summary structures for technical healthcare writing.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Synthetic fixture text for executive summary structure."
          }
        ]
      }
    ]
  }'::jsonb,
  null,
  null,
  '10000000-0000-0000-0000-000000000001',
  'published',
  false,
  false,
  'Executive Summaries (Synthetic Fixture)',
  'Synthetic fixture on executive summaries.',
  now() - interval '2 days',
  now() - interval '2 days',
  now() - interval '2 days'
), (
  '20000000-0000-0000-0000-000000000010',
  'Synthetic — Methodologies for Scientific Typography in Editorial Layouts',
  'scientific-typography-medical-publication-layouts',
  'Synthetic fixture exploring typographic measures and citation scannability.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Synthetic fixture text evaluating scientific typography in editorial layouts."
          }
        ]
      }
    ]
  }'::jsonb,
  null,
  null,
  null,
  'published',
  false,
  false,
  'Scientific Typography (Synthetic Fixture)',
  'Synthetic fixture on typography in editorial layouts.',
  now() - interval '1 day',
  now() - interval '1 day',
  now() - interval '1 day'
) on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content_json = excluded.content_json,
  featured_image_path = excluded.featured_image_path,
  featured_image_alt = excluded.featured_image_alt,
  category_id = excluded.category_id,
  status = excluded.status,
  is_featured = excluded.is_featured,
  is_portfolio_featured = excluded.is_portfolio_featured,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  published_at = excluded.published_at;

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
  'Synthetic Reference: Guidelines for Clear Protocol Summaries',
  'Synthetic Journal of Medical Communications',
  'https://example.invalid/citations/synthetic-guidelines-2025',
  'Vol. 14, No. 2, pp. 112–128 (Synthetic Citation)',
  0,
  now() - interval '8 days'
), (
  '30000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'Synthetic Reference: Standards for Plain Language Formatting',
  'Synthetic Health Communication Working Group',
  'https://example.invalid/citations/synthetic-standards-health-comms',
  'Section 4.1: Readability Metrics and Terminology (Synthetic)',
  1,
  now() - interval '8 days'
), (
  '30000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000002',
  'Synthetic Draft Reference for Regulatory Guidelines',
  'Synthetic Regulatory Science Review',
  'https://example.invalid/citations/synthetic-regulatory-draft-ref',
  'Unpublished Reference for Draft Article (Synthetic)',
  0,
  now() - interval '1 day'
), (
  '30000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000004',
  'Synthetic Reference: Patient Education Formatting Framework',
  'Synthetic Educational Communications Review',
  'https://example.invalid/citations/synthetic-patient-health-literacy',
  'Vol. 9, Issue 3, pp. 45–59 (Synthetic Citation)',
  0,
  now() - interval '7 days'
) on conflict (id) do update set
  title = excluded.title,
  source_name = excluded.source_name,
  url = excluded.url,
  citation_details = excluded.citation_details,
  sort_order = excluded.sort_order;

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
  'Synthetic Reviewer',
  'reader-alex@example.invalid',
  'Synthetic approved comment for local typography testing.',
  'approved',
  now() - interval '1 day',
  now() - interval '12 hours'
), (
  '40000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'Synthetic Pending Commenter',
  'reader-jordan@example.invalid',
  'Synthetic pending comment submitted for moderation review testing.',
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
  'Synthetic Inquirer',
  'inquirer-sam@example.invalid',
  'Synthetic Inquiry Regarding Medical Writing Collaboration',
  'Synthetic contact message for local inbox testing.',
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
  '[]'::jsonb,
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
