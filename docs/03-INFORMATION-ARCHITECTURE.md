# 03 — Information Architecture & Routes

## Public route contract

- `/` — homepage
- `/about` — professional profile
- `/blog` — published article listing/search entry
- `/blog/[slug]` — article
- `/topics/[slug]` — category/topic listing
- `/portfolio` — featured writing samples
- `/contact` — contact form
- `/disclaimer` — full medical disclaimer

## Admin route contract

- `/admin` — overview
- `/admin/articles` — all articles
- `/admin/articles/new` — create
- `/admin/articles/[id]` — edit
- `/admin/categories`
- `/admin/comments`
- `/admin/portfolio`
- `/admin/messages`
- `/admin/media`
- `/admin/settings`

Auth implementation may use a dedicated login route such as `/login` or `/admin/login`; record the final choice in the decision log.

## Public navigation
Prefer a compact primary navigation such as:
- Home
- Articles
- Portfolio
- About
- Contact

Topics may live in the blog interface rather than crowd the top navigation.

## Homepage hierarchy
1. professional positioning / hero
2. latest or featured writing
3. topic discovery
4. portfolio credibility section
5. concise author introduction
6. employer/client CTA
7. footer/disclaimer/navigation

## Article page hierarchy
1. breadcrumb/topic context
2. title/excerpt
3. publication metadata and reading time
4. featured image if present
5. article body
6. references
7. author context
8. medical disclaimer
9. related articles
10. comments where enabled

## Admin navigation principle
Keep the dashboard utilitarian and simple. Do not make administrative UI visually compete with the public publication.
