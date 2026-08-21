# 10 — AI / Developer Handoff Protocol

Every major stage ends with a handoff note.

## Handoff template

### Stage
`Stage X — Name`

### Objective completed
One paragraph describing what was actually delivered.

### Files/areas changed
List only meaningful paths/modules.

### Database changes
- migration names
- tables/columns/policies/storage changes
- none, if none

### Environment changes
- variables added/removed
- none, if none

### Decisions made
Link to entries in `11-DECISION-LOG.md`.

### Verification performed
List commands/tests and results.

### Known limitations
Be explicit. Do not hide partial work.

### Scope not implemented
State any tempting but out-of-scope items intentionally left out.

### Next stage readiness
- READY / BLOCKED
- blockers if any

## Rule for the next agent
The next agent must read the most recent handoff before modifying the stage output.
