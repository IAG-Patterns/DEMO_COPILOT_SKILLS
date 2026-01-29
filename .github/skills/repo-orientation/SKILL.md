---
name: repo-orientation
description: Rapidly understand an unfamiliar repository: entrypoints, architecture, conventions, and the smallest safe set of files to touch.
---

# Repo Orientation (Rapid)

## IAGAI defaults

Follow `skills/iagai-workflow` for baseline expectations (small diffs, gh-first, CI-aligned verification).

## When to use

- You don’t know where to make a change yet.
- The task is multi-file or cross-cutting (behavior, config, tests).

## Procedure

1. **Identify the build/test stack**
   - Look for: `README.md`, `package.json`, `pyproject.toml`, `requirements.txt`, `tox.ini`, CI workflows.
2. **Find entry points**
   - Web: `src/main.*`, `src/app.*`, server `main.py`, `index.ts`, etc.
3. **Find the “golden path”**
   - One representative feature flow (controller/route → service → data).
4. **Match conventions**
   - Naming, error handling style, logging style, test patterns.
5. **Produce the minimal change map**
   - “I will likely change files A, B, and add/adjust tests in C.”

## Success criteria

- You can name **1–3 files** that are the correct starting points and explain why.

