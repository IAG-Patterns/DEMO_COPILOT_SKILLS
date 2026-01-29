---
name: pr-review-and-suggestions
description: Apply PR review suggestions (including CodeRabbit/Copilot) safely and systematically using gh-first workflow.
---

# PR Review & Suggestions

## IAGAI defaults

Follow `skills/iagai-workflow` (gh-first, small diffs, PR hygiene, safety gates).

## When to use

- You are asked to “apply review suggestions” from CodeRabbit, Copilot, or reviewers.
- You need to respond to review comments with minimal churn.

## Procedure

1. **Collect feedback (gh-first)**
   - Fetch all PR comments/suggestions and list them **numbered**.
2. **Select scope**
   - Decide which suggestions are:
     - must-fix now
     - optional
     - out-of-scope
3. **Apply systematically**
   - One category at a time (e.g., correctness → tests → readability).
   - Avoid style-only churn unless it resolves a real issue.
4. **Verify**
   - Run the smallest CI-aligned checks for affected areas.
5. **Summarize**
   - Map: suggestion # → action taken.

