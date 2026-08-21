# Marie Medical Blog — Project Context Pack

This folder is intended to be copied into the project repository root before feature development.

## Read order
1. `AI_CONTEXT.md`
2. `AGENTS.md`
3. `docs/01-SCOPE-FREEZE.md`
4. `docs/02-TECH-STACK.md`
5. the documentation relevant to the active stage
6. `docs/11-DECISION-LOG.md`
7. most recent handoff note

## Agent entry files
- `AGENTS.md` — Codex/general coding agents
- `.github/copilot-instructions.md` — GitHub Copilot
- `CLAUDE.md` — Claude
- `GEMINI.md` — Gemini
- `AI_CONTEXT.md` — universal source of truth

All agent-specific files point back to the same shared context to prevent contradictory instructions.
