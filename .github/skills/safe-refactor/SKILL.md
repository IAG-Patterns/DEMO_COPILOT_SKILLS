---
name: safe-refactor
description: Refactor without regressions: preserve behavior, constrain scope, and verify with tests.
---

# Safe Refactor

## IAGAI defaults

Follow `skills/iagai-workflow` (tight diffs, no unrelated churn, verify continuously).

## When to use

- Cleanup requested, or refactor needed to implement changes safely.

## Procedure

1. **Define “behavior preserved”**
   - What must remain the same (APIs, outputs, side effects).
2. **Choose the refactor**
   - Extract function, rename, split responsibilities, remove duplication.
3. **Keep scope tight**
   - Avoid unrelated formatting churn.
4. **Verify**
   - Run tests after each meaningful step.
5. **Stop rule**
   - If risk increases (touching many callers / public APIs), pause and re-plan.

