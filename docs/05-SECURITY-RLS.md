# 05 — Security & RLS Contract

## Access model

### Anonymous/public visitor may
- read published articles;
- read public categories and public profile/site settings needed for rendering;
- read approved comments if comments are displayed;
- submit a comment subject to validation/moderation;
- submit a contact message subject to validation/rate controls.

### Anonymous/public visitor may NOT
- read draft/archived articles;
- read private commenter emails;
- read contact messages;
- update/delete any content;
- access private profile/settings data;
- upload arbitrary media.

### Authenticated Marie/admin may
- manage all V1 content and moderation functions required by the dashboard.

## Supabase rules
- Enable RLS on every table exposed through the Data API.
- Treat table/API grants and RLS as separate concerns.
- Do not use client-editable metadata for authorization decisions.
- Never ship service-role/secret credentials to the client.
- Write explicit policies for actual access behavior.
- For update policies, ensure both visibility and allowed resulting state are constrained.
- Be cautious with views and privileged database functions.
- Storage policies must protect uploads and private assets appropriately.

## Public submission design
Comment and contact submission should be narrow operations with:
- server-side schema validation;
- length limits;
- normalized input;
- spam/rate protection appropriate to launch scale;
- no ability to set moderation/status fields from public input;
- no ability to select arbitrary ownership/admin IDs.

## Rich text
- Treat stored rich content as untrusted when rendering.
- Render only supported Tiptap node/mark types.
- Sanitize or safely render external HTML; do not blindly inject user-controlled HTML.
- Validate URLs for links/media.

## Admin route protection
Protect dashboard routes server-side. Client-side hiding alone is not authorization.

## Security verification gate
Before launch verify at minimum:
1. anonymous published article read succeeds;
2. anonymous draft read fails;
3. anonymous contact-message listing fails;
4. anonymous comment submission succeeds only with allowed fields;
5. anonymous comment approval/update fails;
6. authenticated Marie can perform required admin actions;
7. private storage paths cannot be read publicly unless intentionally signed/served;
8. no secret/service key appears in client bundles or public environment variables.
