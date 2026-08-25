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
  'Marie Medere',
  'Medical Writing Portfolio & Educational Blog',
  'Author and medical writer presenting clear, referenced clinical communications and healthcare educational analyses.',
  'Marie Medere focuses on evidence-based medical communications, clinical writing, and healthcare literacy. This portfolio highlights selected writing samples and referenced educational articles.',
  'M.Sc. Biomedical Communications (Synthetic Example)',
  array['Medical Writing', 'Clinical Communications', 'Health Literacy', 'Educational Publications'],
  '[{"platform": "LinkedIn", "url": "https://example.invalid/profile"}, {"platform": "ORCID", "url": "https://orcid.example.invalid/0000-0000-0000-0000"}]'::jsonb,
  'sample-cv.pdf',
  now(),
  now()
) on conflict (id) do update set
  display_name = excluded.display_name,
  professional_tagline = excluded.professional_tagline,
  short_bio = excluded.short_bio,
  long_bio = excluded.long_bio,
  interests = excluded.interests;

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
  'Articles and analyses covering clinical study documentation, medical protocols, and structured healthcare reporting standards.',
  now(),
  now()
), (
  '10000000-0000-0000-0000-000000000002',
  'Health Literacy & Education',
  'health-literacy-education',
  'Plain-language medical writing, patient educational materials, and health communication accessibility analyses.',
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
  'Evaluating Plain Language Standards in Clinical Protocol Summaries',
  'plain-language-clinical-protocol-summaries',
  'A synthetic sample analyzing structured methodologies for drafting accessible clinical study summaries for multidisciplinary audiences.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Clear medical writing bridges complex clinical methodologies and stakeholder comprehension. When clinical study protocols are synthesized into summaries, authors must balance precision with readability."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Core Principles of Plain-Language Synthesis" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Plain language in medical documentation does not simplify scientific meaning; rather, it structures information to reduce cognitive burden. Key objectives include:"
          }
        ]
      },
      {
        "type": "bulletList",
        "content": [
          {
            "type": "listItem",
            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Standardized terminology definitions presented alongside first usage." }] }]
          },
          {
            "type": "listItem",
            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Consistent active-voice construction for procedural descriptions." }] }]
          },
          {
            "type": "listItem",
            "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Visual separation of primary and secondary study endpoints." }] }]
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
                "text": "Effective clinical summaries ensure that all readers—from regulatory reviewers to patient advocates—reach an aligned understanding of study intent."
              }
            ]
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 3 },
        "content": [{ "type": "text", "text": "Structured Section Organization" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "A disciplined layout organizes trial rationale, eligibility criteria, and statistical endpoints into sequential, scannable units."
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
  'Plain Language Standards in Clinical Summaries | Marie Medere',
  'A synthetic sample examining plain language methodologies for clinical protocol summaries.',
  now() - interval '8 days',
  now() - interval '8 days',
  now() - interval '8 days'
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
), (
  '20000000-0000-0000-0000-000000000004',
  'Structured Methods for Patient Education Materials in Chronic Care',
  'patient-education-materials-chronic-care',
  'An editorial overview of formatting and linguistic strategies for patient-facing disease management guides.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Patient education materials require careful structural design to support adherence and self-management. Readability scores alone cannot measure comprehension."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Design Considerations for Accessibility" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Chunking information into short sections with descriptive subheadings enhances comprehension and recall across varied literacy levels."
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
  'Patient Education in Chronic Care | Marie Medere',
  'Strategies for drafting accessible patient education materials.',
  now() - interval '7 days',
  now() - interval '7 days',
  now() - interval '7 days'
), (
  '20000000-0000-0000-0000-000000000005',
  'Comparative Analysis of Editorial Consistency in Multi-Center Reports',
  'editorial-consistency-multi-center-reports',
  'Examining style guides and editorial concordance across distributed clinical investigation summaries.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Multi-center clinical reports frequently suffer from fragmented tone and disparate formatting when multiple authors contribute sections independently."
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
  'Editorial Consistency in Trial Reports | Marie Medere',
  'Analysis of style guides for distributed medical reporting.',
  now() - interval '6 days',
  now() - interval '6 days',
  now() - interval '6 days'
), (
  '20000000-0000-0000-0000-000000000006',
  'Visual Hierarchy and Readability Metrics in Public Health Communications',
  'visual-hierarchy-readability-public-health',
  'How typographic hierarchy, white space, and plain language synergize to improve health notice clarity.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Information hierarchy dictates whether critical health alerts are noticed or overlooked. Typographic scale and disciplined contrast guide user attention."
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
  'Visual Hierarchy in Health Communications | Marie Medere',
  'Analysis of typography and readability in public health publications.',
  now() - interval '5 days',
  now() - interval '5 days',
  now() - interval '5 days'
), (
  '20000000-0000-0000-0000-000000000007',
  'Syntax and Terminology Standardization in Investigator Documents',
  'syntax-standardization-investigator-documents',
  'Methodological approaches to maintaining uniform nomenclature across clinical documentation packages.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Standardized nomenclature prevents ambiguity across multidisciplinary review teams during document preparation."
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
  'Syntax Standardization in Clinical Documents | Marie Medere',
  'Approaches to terminology control in medical documentation.',
  now() - interval '4 days',
  now() - interval '4 days',
  now() - interval '4 days'
), (
  '20000000-0000-0000-0000-000000000008',
  'Designing Accessible Informed Consent Glossaries for Diverse Audiences',
  'accessible-informed-consent-glossaries',
  'Best practices for developing contextual glossaries in clinical trial consent packages.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Informed consent documents rely on plain-language glossaries to explain scientific concepts clearly to prospective participants."
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
  'Accessible Informed Consent Glossaries | Marie Medere',
  'Guidelines for designing patient-centered consent glossaries.',
  now() - interval '3 days',
  now() - interval '3 days',
  now() - interval '3 days'
), (
  '20000000-0000-0000-0000-000000000009',
  'Structuring Executive Summaries for Healthcare Technical Writing',
  'executive-summaries-healthcare-technical-writing',
  'Frameworks for distilling extensive medical literature into concise executive-level briefing documents.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Executive summaries must distill complex findings into high-level insights without sacrificing scientific rigor."
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
  'Executive Summaries in Medical Writing | Marie Medere',
  'Methods for drafting high-level healthcare briefing summaries.',
  now() - interval '2 days',
  now() - interval '2 days',
  now() - interval '2 days'
), (
  '20000000-0000-0000-0000-000000000010',
  'Methodologies for Scientific Typography in Medical Publication Layouts',
  'scientific-typography-medical-publication-layouts',
  'Examining typographic principles that enhance reading speed and source citation scannability.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Publication typography should support deep, distraction-free reading through optimal line lengths, proportional headings, and legible body measures."
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
  'Scientific Typography in Medical Layouts | Marie Medere',
  'Principles of publication typography for medical communication.',
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
  'Guidelines for Clear and Concise Medical Writing in Scientific Publications',
  'Synthetic Journal of Medical Communications',
  'https://example.invalid/citations/guidelines-2025',
  'Vol. 14, No. 2, pp. 112–128 (Synthetic Citation)',
  0,
  now() - interval '8 days'
), (
  '30000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'Standards for Plain Language Communication in Healthcare Documentation',
  'Health Communication Working Group (Synthetic)',
  'https://example.invalid/citations/standards-health-comms',
  'Section 4.1: Readability Metrics and Terminology Glossaries',
  1,
  now() - interval '8 days'
), (
  '30000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000002',
  'Draft Reference for Regulatory Guidelines',
  'Regulatory Science Review (Synthetic)',
  'https://example.invalid/citations/regulatory-draft-ref',
  'Unpublished Reference for Draft Article',
  0,
  now() - interval '1 day'
), (
  '30000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000004',
  'Patient Health Literacy and Chronic Disease Management Guidelines',
  'Educational Health Communications Review (Synthetic)',
  'https://example.invalid/citations/patient-health-literacy',
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
