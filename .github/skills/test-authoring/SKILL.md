---
name: test-authoring
description: Author tests that lock in behavior: choose correct test level, cover edge/failure cases, and avoid brittleness.
---

# Test Authoring

## IAGAI defaults

Follow `skills/iagai-workflow` (tests as evidence; prefer the narrowest CI-matching command).

## When to use

- Adding new behavior
- Fixing a bug
- Refactoring risky logic

## Procedure

1. **Pick the test level**
   - Unit for pure logic, Integration for module boundaries, E2E for critical flows.
2. **Encode the contract**
   - Happy path + one edge case + one failure case.
3. **Prefer stable assertions**
   - Assert outputs/side effects, not internal implementation details.
4. **Avoid flakiness**
   - Deterministic time, stable selectors (`data-testid`), explicit waits.

