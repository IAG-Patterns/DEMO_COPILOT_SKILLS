---
name: debug-triage
description: Debug loop: reproduce, minimize, hypothesize, instrument, fix, verify; includes flaky-test triage.
---

# Debug Triage

## IAGAI defaults

Follow `skills/iagai-workflow` (evidence-first, minimal repros, CI-aligned verification).

## When to use

- Any bug report, failing test, runtime error, or flaky behavior.

## Procedure

1. **Reproduce**
   - Write down exact steps/inputs/environment.
2. **Minimize**
   - Reduce to smallest failing case.
3. **Hypothesize**
   - 2–3 plausible causes + what evidence confirms each.
4. **Instrument**
   - Add temporary logs/asserts near the failing boundary (remove after).
5. **Fix**
   - Smallest change that addresses the root cause.
6. **Verify**
   - Add/adjust tests; re-run relevant suite(s).

## Flaky cases

- Capture seed, timeouts, environment dependencies.
- Prefer deterministic waits and stable selectors in UI tests.

