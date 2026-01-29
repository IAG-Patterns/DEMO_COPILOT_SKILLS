---
name: iagai-workflow
description: IAGAI GitHub org workflow defaults: how we plan, execute, validate, and ship changes (tools, safety, CI, MCP, PR hygiene).
---

# IAGAI Workflow Defaults

This skill defines the **default way of working in the IAGAI GitHub org**. Other skills should reference and follow this unless a repo explicitly overrides it.

## Principles

- **Small, reviewable changes**: prefer incremental PRs over big rewrites.
- **Evidence over assertions**: prove correctness with tests, diagnostics, and minimal repros.
- **Safety-first**: avoid destructive operations unless explicitly required and scoped.
- **Consistency**: match existing code style, patterns, and repository conventions.
- **Automation-friendly**: prefer deterministic commands and machine-readable outputs.

## GitHub workflow (IAGAI)

- **When asked to apply review suggestions (CodeRabbit/Copilot)**:
  - first fetch and enumerate all suggestions/comments from the PR using GitHub tooling
  - then apply selected suggestions systematically
- **PR hygiene**:
  - clear title + summary + test plan
  - keep diffs small; avoid unrelated formatting churn
  - ensure documentation is updated when behavior changes

## Tooling defaults

- **Use `gh` for GitHub operations** (PRs, issues, comments, checks).
- **Prefer repo-native build/test tooling**:
  - Python: `python3 -m pytest` (or `tox` if configured)
  - Node: lockfile-aware installs (`pnpm`/`yarn`/`npm ci`) and `npm test`
- **CI alignment**:
  - run the narrowest local check that matches CI (tests, formatting, type checks)

## Safety defaults

- Never hardcode secrets/tokens.
- Avoid pipe-to-shell patterns (`curl ... | sh`).
- Confirm anything destructive (deletions, infra apply/destroy, data migrations).

## MCP defaults (when present)

- Prefer existing `.cursor/mcp.json` configuration and wrapper scripts.
- Treat MCP servers as **capability providers**: read the tool surface, then design workflows that minimize token-heavy outputs.

## Output expectations

- Always include a **test/verification plan** (even if minimal).
- For changes that affect users, include a short **release note** style summary.

