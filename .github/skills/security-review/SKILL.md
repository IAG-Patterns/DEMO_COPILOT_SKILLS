---
name: security-review
description: Security review checklist for changes: secrets, authz/authn, validation, dependency hygiene, and safe defaults.
---

# Security Review

## IAGAI defaults

Follow `skills/iagai-workflow` (no secrets, safe defaults, avoid pipe-to-shell, confirm destructive operations).

## When to use

- Anything user-facing, auth-related, data-handling, or network/FS access.

## Procedure

1. **Secrets**
   - No hardcoded tokens/keys; ensure logs don’t leak sensitive values.
2. **Auth**
   - Verify authentication and authorization boundaries; least privilege.
3. **Input validation**
   - Validate at system boundaries; avoid injection primitives.
4. **Dependencies**
   - Avoid unnecessary deps; prefer maintained, pinned versions.
5. **Safe operations**
   - Confirm/guard destructive actions; provide dry-run where possible.

