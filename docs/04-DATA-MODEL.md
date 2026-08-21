# 04 — Data Model Contract

This is the design contract, not a migration file. Final SQL is created during the database stage and recorded through migrations.

## `profiles`
Purpose: private/public professional profile information associated with the authenticated admin.

Candidate fields:
- id (uuid, linked to auth user)
- display_name
- professional_tagline
- short_bio
- long_bio/content
- public_email or contact routing settings
- education summary
- interests
- social links (structured)
- cv_storage_path
- created_at
- updated_at

Avoid turning this into a generic multi-user role system.

## `categories`
- id
- name
- slug (unique)
- description
- created_at
- updated_at

V1 default: one primary category per article.

## `articles`
- id
- title
- slug (unique)
- excerpt
- content_json (canonical Tiptap document)
- featured_image_path / asset reference
- featured_image_alt
- category_id
- status: draft | published | archived
- is_featured
- is_portfolio_featured
- seo_title
- seo_description
- published_at
- created_at
- updated_at

Reading time may be calculated rather than stored unless a clear product need favors persistence.

## `article_references`
- id
- article_id
- label/title
- source_name
- url
- optional citation details
- sort_order
- created_at

References should be structured rather than buried only inside free-form body content.

## `comments`
- id
- article_id
- commenter_name
- commenter_email (private if collected)
- body
- status: pending | approved | hidden
- created_at
- moderated_at

Deletion may be hard delete or policy-driven; record final choice in decision log.

## `contact_messages`
- id
- name
- email
- subject
- message
- status: new | read | archived
- created_at

## `media`
Optional metadata table if useful. Supabase Storage remains the file store.
Possible fields:
- id
- storage_path
- filename
- mime_type
- alt_text
- caption
- size
- created_at

Do not add this table merely for symmetry if Storage metadata and application needs do not justify it.

## `site_settings`
Keep intentionally small. Possible fields:
- site_title
- tagline
- default_seo_description
- public contact configuration
- social links
- disclaimer text/version
- homepage intro

Prefer one validated settings record or another simple approach; avoid an untyped arbitrary key/value dumping ground unless justified.

## Portfolio
V1 should primarily feature selected articles rather than duplicate them into a second content system. Use `is_portfolio_featured` or a small ordering table if manual ordering is needed.

## Schema rule
Any deviation from this contract must be documented before implementation if it changes product behavior or architecture.
