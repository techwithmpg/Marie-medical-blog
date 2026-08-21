# 11 — Architecture & Product Decision Log

Only record decisions that materially affect product behavior, architecture, security, scope, or future agents.

## ACTIVE — D001 — Framework
**Decision:** Next.js App Router + TypeScript.
**Reason:** Strong fit for SEO-heavy public content, server rendering, metadata, and a single integrated application.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D002 — Backend
**Decision:** Supabase PostgreSQL + Auth + Storage.
**Reason:** Integrated managed data/auth/storage with PostgreSQL and explicit RLS model.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D003 — Editor
**Decision:** Tiptap.
**Reason:** Customizable structured rich-text editing suitable for a controlled authoring experience.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D004 — Deployment
**Decision:** Vercel.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D005 — User model
**Decision:** One primary writer/admin in V1. Readers do not have accounts.
**Status:** ACTIVE / FROZEN.

## ACTIVE — D006 — Portfolio model
**Decision:** Portfolio primarily features selected articles rather than duplicating a second independent content type.
**Status:** ACTIVE unless manual-order requirements justify a small relation/order table.

## ACTIVE — D007 — Profile image
**Decision:** Personal photo is optional and not required by the layout.
**Reason:** Client expressed preference for limited personal exposure.

## ACTIVE — D008 — Brand direction
**Decision:** Warm, modern, professional medical editorial aesthetic using restrained soft/nude color families rather than generic hospital blue.

## ACTIVE — D009 — Comment moderation
**Decision:** New comments default to pending. Admin can approve, hide, or delete. Comment email, if collected, remains private.

## ACTIVE — D010 — Article category model
**Decision:** One primary category per article in V1 unless a verified content need emerges before schema freeze.

---

## New decision template

### ACTIVE/REPLACED — DXXX — Title
**Date:** YYYY-MM-DD
**Decision:**
**Reason:**
**Alternatives considered:**
**Impact:**
**Approved by:** project owner / architecture gate
