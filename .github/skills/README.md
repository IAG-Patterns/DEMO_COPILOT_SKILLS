## Agent Skills Catalog

This repository includes a root-level `skills/` catalog: **portable, task-focused playbooks** meant to be loaded *only when needed*.

### How agents should use this folder

- **Before starting work**, quickly scan `skills/` and pick the best matching playbook(s).
- Load the selected playbook(s) (`skills/<skill-name>/SKILL.md`) and follow their steps.
- Compose multiple skills when useful (e.g., `repo-orientation` + `change-planning` + `test-authoring`).
- Default baseline for IAGAI org work: `skills/iagai-workflow`

### Role-based top-10 sets (IAGAI)

- `skills/iagai-skillset-genericdev`
- `skills/iagai-skillset-juniordev`
- `skills/iagai-skillset-seniormultilangdev`

### Skill format

Each skill is a folder containing at minimum:
- `SKILL.md` (with YAML frontmatter: `name`, `description`, optional `license`)
- optional bundled assets (scripts, templates, helpers) referenced from the skill

This structure is inspired by:
- `https://github.com/github/awesome-copilot` (skills folder model)
- `https://github.com/anthropics/skills` (procedural skill SOPs)
- `https://github.com/agentskills/agentskills` and `https://agentskills.io/specification` (skill conventions)

### Attributions

See `AGENT_SKILLS_SOURCES.md` at repo root for what was copied vs authored here.

