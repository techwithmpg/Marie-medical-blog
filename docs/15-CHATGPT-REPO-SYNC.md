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

## Repository → ChatGPT refresh triggers

Refresh the ChatGPT Project context snapshot whenever a committed change materially affects:

- `AI_CONTEXT.md`;
- `AGENTS.md` or agent-specific instruction files;
- scope, stack, routes, data model, security, UI/UX, SEO/content standards;
- development stages or testing gates;
- handoff rules;
- ACTIVE decisions in `docs/11-DECISION-LOG.md`;
- `docs/13-PROJECT-STATUS.md`;
- `docs/14-BRANCH-STRATEGY.md`;
- this synchronization protocol.

Each refreshed snapshot should identify the source branch and commit used to produce it.

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
5. refresh the ChatGPT Project snapshot when governance changed;
6. record the source commit in the refreshed snapshot;
7. obtain explicit owner authorization for the next stage;
8. create the stage branch from the synchronized `main` branch.

## Newer snapshot rule

If the owner supplies a newer repository snapshot in a Project chat, inspect it before using it. Once verified as newer, it supersedes an older Project mirror for that conversation. The newer repository state must not be silently overwritten by stale Project memory.

## No-drift rule

Project memory is useful for continuity but is never stronger than current repository governance. Web research is evidence, not project authority. A stage branch is not stage authorization. An experiment is not a decision. An unmerged chat recommendation is not a contract.
