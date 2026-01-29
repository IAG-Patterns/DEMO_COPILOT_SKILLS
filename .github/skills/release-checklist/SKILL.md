---
name: release-checklist
description: Release readiness checklist: docs, compatibility notes, CI green, and risk-aware rollout plan.
---

# Release Checklist

## IAGAI defaults

Follow `skills/iagai-workflow` (small diffs, explicit verification, clear user impact).

## When to use

- Shipping a change that affects users/consumers.
- Cutting a release/tag or preparing deployment notes.

## Procedure

1. **Behavior changes**
   - Backwards compatibility, migrations, feature flags.
2. **Docs**
   - README/runbooks/usage examples updated.
3. **Verification**
   - CI green, tests run locally where feasible.
4. **Risk & rollback**
   - What could go wrong; how to rollback; how to detect issues.
5. **Release notes**
   - 3–7 bullets: what changed, who it affects, how to migrate.

