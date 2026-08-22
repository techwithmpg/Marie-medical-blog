# 14 — Git Branch Strategy

## Purpose

Keep `main` stable and approved while allowing AI agents and developers to work one gated stage at a time without mixing unfinished work into the canonical branch.

## Branch model

### `main`

`main` is the approved stable branch.

Rules:
- it must represent the latest accepted project state;
- no unfinished stage work should live on `main`;
- application development should not be committed directly to `main`;
- merge only after the active stage gate passes and the owner approves the merge/transition;
- after an approved merge, local `main` and `origin/main` must be synchronized.

### Stage branches

Use one short-lived branch for the currently active major stage:

`stage/<two-digit-stage>-<short-name>`

Examples:
- `stage/00-governance-closeout`
- `stage/01-nextjs-foundation`
- `stage/02-design-system`
- `stage/03-supabase-security`

Rules:
- create the branch from an up-to-date `main`;
- only one major development stage is active at a time unless the owner explicitly approves otherwise;
- keep work inside the authorized stage objective;
- commits may be incremental, but each must remain coherent and reviewable;
- do not use a stage branch to hide implementation belonging to a later stage.

### Narrow fix branches

Use `fix/<short-name>` only for a narrowly scoped defect or governance correction that cannot reasonably wait for the active stage.

A fix branch may not be used to bypass a stage gate or introduce new product scope.

## Start-of-stage procedure

Before creating a stage branch:

```bash
git switch main
git pull --ff-only origin main
git status
git switch -c stage/<nn>-<short-name>
```

The working tree must be clean before stage work begins.

## Push and review

Push the stage branch to GitHub for durable backup and review:

```bash
git push -u origin stage/<nn>-<short-name>
```

A pull request is recommended for each major stage because it provides a durable review boundary, but the stage gate and repository governance remain authoritative whether the merge is performed through GitHub or locally.

## Merge gate

A stage branch may merge into `main` only when:

1. the stage deliverables are complete;
2. required verification/tests pass;
3. security checks relevant to the stage pass;
4. `docs/13-PROJECT-STATUS.md` is ready to record the transition;
5. required handoff documentation is complete;
6. material decisions are in `docs/11-DECISION-LOG.md`;
7. the project owner approves the merge/next-stage transition.

Prefer a normal merge that preserves the stage's meaningful commit history and creates a clear stage boundary. Do not force-push shared `main` history.

## After merge

```bash
git switch main
git pull --ff-only origin main
git status
git branch -d stage/<nn>-<short-name>
```

Delete the remote stage branch after confirming `main` is correct:

```bash
git push origin --delete stage/<nn>-<short-name>
```

## Public-repository safety

The owner has approved keeping the GitHub repository public. Therefore:

- never commit `.env`, `.env.local`, tokens, passwords, API secrets, Supabase service-role/secret keys, private Vercel credentials, or similar secrets;
- use `.env.example` with placeholder variable names only;
- use synthetic development fixtures and avoid confidential client data;
- inspect staged changes before every commit;
- immediately rotate any credential that is ever committed, even if the commit is later removed.

## No-drift rule

Branch names do not grant scope or stage authorization. `docs/13-PROJECT-STATUS.md` and explicit owner approval determine what work is authorized.
