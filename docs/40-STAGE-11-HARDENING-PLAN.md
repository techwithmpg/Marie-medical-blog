# 40 — Stage 11 Quality, Security & Production Hardening Plan

**Status:** ACTIVE / OWNER AUTHORIZED
**Decision authority:** D037
**Canonical starting main:** `ecd813394a09259d489c352edc46ca95d1a0ae65`
**Stage branch:** `stage/11-quality-hardening`

## 2026-09-07 execution checkpoint

The separately owner-authorized bounded Admin Quality Hardening pass is
complete on the Stage 11 branch and has passed its local verification gate.
This checkpoint completes the admin-focused 11A/11B/11C work described in
`docs/41-STAGE-11-ADMIN-QUALITY-HANDOFF.md`; it does not claim completion of any
future non-admin Stage 11 work and does not authorize a merge.

## Objective

Harden the completed V1 application without expanding product scope or replacing
the frozen architecture.

## Execution phases

### Stage 11A — Baseline inventory and risk audit

- establish clean test/build baseline;
- inventory routes, client-component boundaries and dependencies;
- inspect current error/loading/empty states;
- record confirmed findings before broad edits;
- carry forward the approved footer visual-conformance correction.

### Stage 11B — Security and data-boundary hardening

- exercise the full RLS/security matrix;
- verify anonymous, authenticated non-admin and admin boundaries;
- review public submission abuse protections;
- review Storage access and private/public asset boundaries;
- verify drafts, messages and private metadata remain inaccessible publicly.

### Stage 11C — Accessibility, responsive and visual conformance

- keyboard and focus review;
- semantic heading/form/dialog review;
- WCAG 2.2 AA checks;
- desktop/tablet/mobile responsive verification;
- cross-browser Playwright verification where practical;
- visual comparison with the Evidence Folio contract and references.

### Stage 11D — Performance, dependencies and configuration

- public client-JS review;
- image/font/loading behavior;
- avoidable data-waterfall review;
- dependency/configuration audit against frozen D020 policy;
- current official documentation verification before version-sensitive changes.

### Stage 11E — Resilience and final regression

- error, loading, not-found and empty states;
- full Node regression;
- full pgTAP;
- full Playwright;
- TypeScript;
- ESLint;
- Prettier;
- production build;
- Git integrity.

### Stage 11F — Closeout

- document actual findings and fixes;
- update decision/status/handoff records;
- owner review;
- normal merge only after the Stage 11 gate passes and the owner approves it.

## Stage gate

Stage 11 is complete only when no known critical security, publishing,
accessibility, visual-contract, performance or mobile-usability issue remains.

## Explicit exclusions

- Stage 12 real-content population;
- production launch;
- domain cutover;
- client training;
- speculative features;
- stack replacement;
- hosted migrations/deployment unless separately authorized.
