---
name: change-planning
description: Plan changes safely: define goals/constraints, risk, touchpoints, and a verification plan before editing.
---

# Change Planning

## IAGAI defaults

Follow `skills/iagai-workflow` for PR hygiene and safety gates (small PRs, explicit test plan, avoid destructive operations).

## When to use

- Any non-trivial task (new feature, bugfix with unknown cause, refactor).

## Procedure

1. **Restate goal** (one sentence).
2. **List constraints**
   - Compatibility, security, performance, timelines, “don’t change X”.
3. **Risk score**
   - High: auth, secrets, data deletion, infra, migrations
   - Medium: public APIs, cross-module refactors
   - Low: internal helpers/docs
4. **Change map**
   - Touchpoints: files, functions, configs, tests.
5. **Test plan**
   - Which tests to run (unit/integration/e2e), plus a quick manual checklist.

## Output template

- Goal:
- Constraints:
- Risk:
- Files to change:
- Verification:

