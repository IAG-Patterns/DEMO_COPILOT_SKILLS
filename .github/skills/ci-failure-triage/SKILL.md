---
name: ci-failure-triage
description: Triage CI failures efficiently in IAGAI repos: reproduce locally, pinpoint root cause, and propose minimal fixes aligned with CI.
---

# CI Failure Triage

## IAGAI defaults

Follow `skills/iagai-workflow` (evidence-first, CI-aligned checks, small diffs).

## When to use

- CI is failing on a PR/branch.
- A local test run passes but CI fails (environment drift).

## Procedure

1. **Identify the failing job**
   - Which workflow, which job, which step.
   - Extract the *first* meaningful error (ignore cascades).
2. **Classify**
   - Lint/format, typecheck, tests, packaging/install, integration/env, infra/secrets.
3. **Reproduce locally (closest possible)**
   - Use the same command CI uses (or `tox` / `pytest` / `npm test` equivalents).
4. **Minimize**
   - Reduce to the smallest failing test/file/command.
5. **Fix**
   - Minimal change that resolves root cause.
6. **Verify**
   - Re-run the narrowest relevant check locally.
   - Add/adjust tests only if behavior changed.

## Output expectations

- Short summary: what failed, why, and what changed.
- Test plan: exact commands to validate.

