# 01 — V1 Scope Freeze

## Included

### Public
- Homepage
- About
- Blog index
- Search
- Categories/topics
- Article detail
- Portfolio
- Contact
- CV download
- Medical disclaimer
- Social share actions
- Responsive layouts
- SEO foundations

### Admin/writer
- Secure login
- Dashboard
- Article CRUD
- Draft/preview/publish/update/unpublish/archive/delete
- Category management
- Media management
- Comment moderation
- Portfolio featuring
- Contact message inbox
- Basic site settings

### Article model
- title
- slug
- excerpt
- rich body
- featured image
- alt text
- category
- status
- featured flags
- SEO fields
- references
- timestamps
- reading time

## Not included
- reader accounts
- multi-author CMS
- advanced roles/permissions
- newsletter automation platform
- subscriptions/paywall
- payments
- ecommerce
- courses
- appointments
- telemedicine
- patient records
- AI medical advice
- AI article generation product feature
- forums/chat
- native apps
- multilingual CMS
- visual page builder
- advertising management
- custom analytics system

## Scope-change test
For any new request:
1. Was it explicitly included in V1? If yes, build it.
2. Is it a small enhancement to an existing V1 workflow with no new subsystem? It may be accepted as goodwill.
3. Does it add a new workflow, integration, user type, business model, or subsystem? Treat it as future/paid scope.

## Anti-drift rule
No AI agent may interpret "future-ready" as permission to implement future features now. Architecture may remain extensible; functionality remains frozen.
