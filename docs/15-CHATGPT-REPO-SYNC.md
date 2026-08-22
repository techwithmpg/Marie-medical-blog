# 15 — ChatGPT Project ↔ Repository Sync & Research Protocol

## Purpose

Keep ChatGPT planning/research and repository-based coding agents under one governance system without allowing chat memory, web research, or a stale uploaded snapshot to silently drift from the canonical repository.

## Canonical authority

The local Git repository and its committed governance history are the canonical durable source of project truth.

GitHub remote:
`https://github.com/techwithmpg/Marie-medical-blog.git`

GitHub is the synchronized remote mirror and collaboration/backup surface. The ChatGPT Project is a controlled read-oriented mirror for research, planning, review, and coordination.

## Authority order

When instructions conflict, use the project-wide order already defined in `AI_CONTEXT.md`:

1. explicit latest instruction from the project owner;
2. ACTIVE decisions in `docs/11-DECISION-LOG.md`;
3. `AI_CONTEXT.md`;
4. `docs/01-SCOPE-FREEZE.md`;
5. relevant stage-specific documentation, including `docs/13-PROJECT-STATUS.md`;
6. existing implementation.

For current-stage authorization, `docs/13-PROJECT-STATUS.md` is the authoritative stage/status record unless superseded by a newer explicit owner instruction that is then recorded back into the repository.

## Repository → ChatGPT live freshness

D021 replaces routine manual Project Source refreshes with live repository reads when GitHub access is available.

Before substantial architecture, UX, data, security, SEO, dependency, implementation, or scope work in ChatGPT or another remote context:

1. resolve the current accepted `main` SHA from GitHub;
2. read `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md`;
3. read the minimum required live governance set named by that manifest;
4. read the stage/domain-specific documents relevant to the task;
5. compare the live `main` SHA with any static Project Source snapshot SHA if one is present;
6. when accepted `main` is newer, use the live repository state automatically;
7. identify the live source SHA in material handoffs, stage transitions, or governance reviews where freshness matters.

Only accepted merged `main` is the live canonical remote mirror. An unmerged branch, pull request, local experiment, research result, or chat recommendation does not become project authority merely because it is newer.

Static ChatGPT Project Sources are now **bootstrap/fallback context**, not the routine freshness mechanism. They remain useful for:

- non-repository client/research artifacts;
- deliberate immutable/archive snapshots;
- fallback context when GitHub live access is unavailable.

They do not need to be replaced solely because `main` advanced.

If GitHub live access is unavailable, use the newest verified Project snapshot available, state its source branch/SHA and freshness limitation, and avoid claiming it is current.
## ChatGPT → Repository rule

A ChatGPT answer, web search result, recommendation, or remembered project detail is not implementation-authoritative by itself.

ChatGPT may:
- verify current facts;
- compare approaches;
- identify risks;
- recommend a choice;
- draft a proposed decision or documentation change.

A material recommendation becomes implementation-authoritative only after:

1. the project owner approves it;
2. it is written into the appropriate repository governance document;
3. architecture/product/security/scope decisions are recorded in `docs/11-DECISION-LOG.md` where required;
4. the active stage authorizes implementation.

## Research evidence hierarchy

For version-sensitive technical research, prefer:

1. official framework/service documentation;
2. official release notes and security advisories;
3. standards bodies and primary specifications;
4. strong secondary engineering sources only when needed.

For medical-content research, prefer:

1. recognized public-health/government bodies;
2. medical professional associations and guidelines;
3. peer-reviewed journals and systematic reviews;
4. academic/clinical references;
5. reputable secondary sources only as supporting evidence.

## Required research output discipline

Research that could affect implementation must clearly distinguish:

- **VERIFIED FACT** — what current authoritative sources say;
- **PROJECT CONSTRAINT** — what the repository already requires;
- **RECOMMENDATION** — the proposed best fit within those constraints;
- **DECISION IMPACT** — whether repository governance/decision-log changes are required;
- **IMPLEMENTATION STATUS** — not implemented unless the active stage authorizes it.

## Stage freshness protocol

Before a new major stage begins:

1. synchronize local `main` with `origin/main`;
2. confirm the current `main` commit;
3. read `docs/13-PROJECT-STATUS.md`;
4. read the latest ACTIVE decisions and relevant stage documents;
5. resolve the current accepted GitHub `main` SHA and live governance set under D021 / `docs/20-CHATGPT-LIVE-CONTEXT-MANIFEST.md`;
6. if GitHub live access is unavailable, identify the newest verified fallback snapshot and its source SHA;
7. obtain explicit owner authorization for the next stage;
8. create the stage branch from the synchronized `main` branch.

## Newer live-context rule

When GitHub live access is available, the current accepted `main` supersedes an older static Project Source snapshot after the SHA is verified. The older snapshot may remain as bootstrap/fallback context; it must not silently override newer repository governance.

If the owner supplies a newer local or branch snapshot that is not yet merged, inspect it and honor any explicit latest owner instruction, but do not silently treat unmerged repository state as canonical `main`.
## No-drift rule

Project memory is useful for continuity but is never stronger than current repository governance. Web research is evidence, not project authority. A stage branch is not stage authorization. An experiment is not a decision. An unmerged chat recommendation is not a contract.
