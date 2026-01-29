---
name: a11y-review
description: Accessibility review playbook for UI changes (WCAG 2.2 AA mindset): keyboard, semantics, labels, contrast, and testing guidance.
---

# Accessibility Review (a11y)

## IAGAI defaults

Follow `skills/iagai-workflow` (no overclaims; recommend manual verification tools when needed).

## When to use

- Any UI/UX work (web, forms, navigation, interactive components).

## Procedure

1. **Keyboard**
   - Everything interactive is reachable and operable; focus is visible; no focus traps.
2. **Semantics**
   - Prefer native elements; use ARIA only when necessary.
3. **Labels**
   - Inputs have labels; buttons/links have accessible names matching visible labels.
4. **Contrast + non-color cues**
   - Adequate contrast; errors not conveyed by color alone.
5. **Manual verification**
   - Recommend tools (e.g., Accessibility Insights) and basic screen-reader spot checks.

## Note

Don’t claim “fully accessible”; say “built with accessibility in mind” and recommend testing.

