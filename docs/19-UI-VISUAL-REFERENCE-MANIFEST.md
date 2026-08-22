# 19 — UI Visual Reference Manifest

**Status:** OWNER-ACCEPTED VISUAL REFERENCE SET / VISUAL-ONLY AUTHORITY
**Accepted:** 2026-08-23
**Canonical behavior/design contract:** `docs/18-UI-IMPLEMENTATION-CONTRACT.md`

## 1. Purpose

This manifest records the accepted visual prototype set used to define the Evidence Folio composition across desktop, tablet and mobile.

The original owner-supplied archive was:

- filename: `Marie'medical UI.zip`
- size: approximately 49 MB
- SHA-256: `4be7ba1d5edca3e1baf5a4a74098d597f307100fc3774edad919f78f74590b5d`
- contained PNGs: 34

The large source archive is intentionally **not committed to Git** to avoid public-repository binary bloat and accidental canonization of synthetic placeholder content.

The repository retains optimized visual contact sheets under `docs/ui-reference/`.

## 2. Canonical visual references

### `01-public-desktop-reference.jpg`

Accepted desktop public compositions:

- Homepage
- Articles
- Article
- Portfolio / Selected Writing
- About
- Contact

### `02-admin-desktop-reference.jpg`

Accepted admin compositions:

- Dashboard
- Article editor
- Drafts
- Categories
- Media library
- Portfolio manager
- Comments
- Messages
- Settings

### `03-public-responsive-tablet-reference.jpg`

Accepted tablet/responsive public compositions:

- Homepage
- Articles
- Article
- About
- Portfolio
- Contact

### `04-public-mobile-reference.jpg`

Accepted mobile-only public compositions:

- Homepage
- Articles
- Article
- About
- Portfolio
- Contact

## 3. Authority boundary

These visual references define:

- composition;
- hierarchy;
- density;
- responsive transformation;
- typographic character;
- color mood;
- component proportion;
- Evidence Folio signature language.

They do **not** define factual content, medical claims, product scope, database fields, business rules or credentials.

## 4. Synthetic-placeholder warning

The generated prototypes contain synthetic visual copy and sample data.

Do not treat any mockup text as client-approved truth unless separately verified.

Examples that must not be inferred from images:

- medical claims or treatment recommendations;
- Marie's credentials/title;
- addresses/email/social profiles;
- published article counts or reader counts;
- client/publication claims;
- response-time promises;
- exact categories/topics;
- article dates/read times;
- portfolio audience/purpose fields;
- review workflows;
- scheduling;
- article PDF export;
- category export.

Frozen scope and repository governance override visual placeholders.

## 5. Conflict rule

When sources conflict:

1. explicit latest owner instruction;
2. ACTIVE decision log;
3. `AI_CONTEXT.md`;
4. scope/security/data documentation;
5. `docs/18-UI-IMPLEMENTATION-CONTRACT.md`;
6. these visual reference contact sheets;
7. individual synthetic wording visible inside a mockup.

If two mockups differ, use the implementation contract and the newer accepted responsive pattern rather than guessing.

## 6. Full-resolution archive handling

The owner should keep the original 49 MB ZIP as a design archive outside normal Git history.

If a later visual-fidelity review requires a full-resolution individual PNG, compare it against this manifest/checksum and treat it as a visual reference only.

Do not add Git LFS or another binary-management system solely for these prototypes unless separately approved.
