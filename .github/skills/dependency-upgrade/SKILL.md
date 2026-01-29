---
name: dependency-upgrade
description: Upgrade dependencies safely: scope changes, validate compatibility, and align with CI/security requirements.
---

# Dependency Upgrade

## IAGAI defaults

Follow `skills/iagai-workflow` (avoid unnecessary deps, CI-aligned verification, no secret leakage).

## When to use

- Dependabot PRs or manual upgrades.
- Security advisories.

## Procedure

1. **Identify why**
   - Security fix, bugfix, new feature, deprecation, compatibility.
2. **Constrain blast radius**
   - Upgrade minimal set of packages needed.
3. **Check breaking changes**
   - Read release notes/changelog for major bumps.
4. **Run verification**
   - Tests + lint/type checks relevant to the dependency.
5. **Document**
   - Note behavior changes and migration steps (if any).

