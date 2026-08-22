# 20 — ChatGPT Live Context Manifest

**Status:** ACTIVE / FROZEN UNDER D021
**Purpose:** Stable bootstrap manifest for resolving the current repository governance state without manually replacing ChatGPT Project Sources after every accepted merge.

## Canonical repository identity

- Repository: `techwithmpg/Marie-medical-blog`
- Canonical accepted branch: `main`
- Durable project authority: committed repository governance under the source-of-truth order in `AI_CONTEXT.md`
- Live remote freshness surface: synchronized GitHub `main`

This file intentionally does **not** pin a commit SHA. A pinned SHA inside the repository would become stale as soon as a later accepted commit is created. The current SHA must be resolved live at task time.

## Mandatory live-read procedure

Before substantial architecture, UX, data, security, SEO, dependency, implementation, or scope work in ChatGPT or another remote context with GitHub access:

1. resolve the current accepted GitHub `main` SHA;
2. read this manifest from that same `main`;
3. read the required core governance set below from that same `main`;
4. read the domain/stage-specific files required by the task;
5. compare the live SHA with any static Project Source snapshot SHA if one is available;
6. if accepted `main` is newer, use the live repository state automatically;
7. state the source SHA in material governance reviews, stage transitions, or handoffs where freshness matters.

## Core governance set — always read for substantial project work

- `AI_CONTEXT.md`
- `AGENTS.md`
- `docs/11-DECISION-LOG.md`
- `docs/13-PROJECT-STATUS.md`
- `docs/15-CHATGPT-REPO-SYNC.md`
- `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md`

## Conditional governance reads

Read these when relevant:

- scope/features: `docs/01-SCOPE-FREEZE.md`
- routes/information architecture: `docs/03-INFORMATION-ARCHITECTURE.md`
- data/security: relevant database/security documents and migrations once they exist
- UI/UX/components: `docs/06-UI-DESIGN-SYSTEM.md`, `docs/18-UI-IMPLEMENTATION-CONTRACT.md`, `docs/19-UI-VISUAL-REFERENCE-MANIFEST.md`
- development stages/gates: `docs/08-DEVELOPMENT-STAGES.md`, `docs/09-TESTING-QUALITY-GATES.md`
- branching: `docs/14-BRANCH-STRATEGY.md`
- Stage-1 baseline: `docs/16-STAGE-1-TOOLCHAIN-BASELINE.md`
- handoff/transition: `docs/10-HANDOFF-PROTOCOL.md` and current handoff/status files

## Static ChatGPT Project Sources

Static Project Sources are bootstrap/fallback context only. They are useful for non-repository artifacts, deliberate archived snapshots, and periods when GitHub live access is unavailable.

A static Project Source snapshot does **not** need to be re-uploaded merely because accepted `main` advanced. When live access is available, a newer verified accepted `main` supersedes an older repository-derived Project Source automatically.

## Fallback when GitHub live access is unavailable

Use the newest verified snapshot available and explicitly identify:

- its source branch;
- its source commit SHA if known;
- that live freshness could not be verified.

Do not silently claim that a fallback snapshot is current.

## What does not become authority automatically

The following never override accepted `main` merely because they are newer:

- unmerged branches;
- pull requests;
- local experiments;
- generated mockups;
- web research;
- chat recommendations;
- remembered context.

A newer explicit project-owner instruction remains highest authority and must be transferred back into repository governance when material.

## Project-instructions bootstrap

The ChatGPT Project instructions should contain a stable instruction requiring this live-read procedure. That is a one-time Project configuration change; after it is present, routine repository merges do not require Project Source replacement solely for freshness.

## Security boundary

Live repository retrieval does not change the public-repository safety rules. Never place secrets, credentials, confidential client data, unpublished private data, or production environment values in the public repository merely to make them available to ChatGPT.