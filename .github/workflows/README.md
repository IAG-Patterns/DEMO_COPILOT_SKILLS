# Claude Code Automation Workflows

This directory contains GitHub Actions workflows that use Claude Code to automate code review fixes and security vulnerability remediation.

## Workflows

### 1. `claude-pr-refactor.yml` - PR Comment Autofix

Automatically applies code changes based on PR review comments.

**Trigger**: Manual (`workflow_dispatch`)

**Usage**:
1. Go to Actions → "Claude Code PR Refactor"
2. Click "Run workflow"
3. Enter the PR URL (e.g., `https://github.com/owner/repo/pull/123`)
4. Click "Run workflow"

**What it does**:
1. Fetches all PR comments (conversation + inline review comments)
2. Creates `refactor_tasks.json` with actionable tasks
3. Runs Claude Code agent to apply the requested changes
4. Creates a follow-up PR with the fixes

**Required Secrets**:
- `CLAUDE_CODE_OAUTH_TOKEN` - Claude Code authentication
- `PERSONAL_ACCESS_TOKEN` - GitHub PAT with repo/PR permissions (optional, uses `github.token` if not set)

---

### 2. `claude-vulnerability-fix.yml` - Security Autofix

Automatically fixes security vulnerabilities detected by various scanners.

**Trigger**: Manual (`workflow_dispatch`) or after security scan workflows

**Usage**:
1. Go to Actions → "Claude Code Vulnerability Fix"
2. Click "Run workflow"
3. Configure options:
   - `target_repo`: Repository to scan (default: current repo)
   - `target_branch`: Branch to scan (default: main)
   - `scan_tool`: npm-audit, snyk, trivy, or all
   - `fix_severity`: Minimum severity to fix (critical, high, medium, low)
4. Click "Run workflow"

**What it does**:
1. Runs security scans using selected tools
2. Merges results into `vulnerability_report.json`
3. Runs Claude Code agent to fix vulnerabilities
4. Creates a PR with security fixes

**Required Secrets**:
- `CLAUDE_CODE_OAUTH_TOKEN` - Claude Code authentication
- `PERSONAL_ACCESS_TOKEN` - GitHub PAT (optional)
- `SNYK_TOKEN` - Snyk API token (optional, for Snyk scans)

---

### 3. `claude-on-mention.yml` - Interactive @claude

Allows developers to invoke Claude directly from issue/PR comments.

**Trigger**: Automatic when `@claude` is mentioned in:
- Issue comments
- PR review comments
- PR reviews
- New issues

**Usage**:
Just mention `@claude` in a comment with your request:

```
@claude Please review this function for potential performance issues.
```

```
@claude Can you suggest a better way to handle error handling here?
```

**Required Secrets**:
- `CLAUDE_CODE_OAUTH_TOKEN` - Claude Code authentication

---

## Setup

### 1. Create Required Secrets

Go to Settings → Secrets and variables → Actions → New repository secret

| Secret | Required | Description |
|--------|----------|-------------|
| `CLAUDE_CODE_OAUTH_TOKEN` | Yes | Get from [Claude Code](https://console.anthropic.com/) |
| `PERSONAL_ACCESS_TOKEN` | Recommended | GitHub PAT with `repo`, `pull_request` scopes |
| `SNYK_TOKEN` | Optional | For Snyk vulnerability scanning |
| `ANTHROPIC_API_KEY` | Optional | Alternative to OAuth token |

### 2. Enable Workflows

Workflows are enabled by default. If disabled:
1. Go to Actions tab
2. Click "I understand my workflows, go ahead and enable them"

### 3. Verify Permissions

Ensure the repository has:
- Actions enabled
- Write access for workflows (Settings → Actions → General → Workflow permissions)

---

## Configuration Files

### `.github/CLAUDE.md`
Main agent guidelines that apply to all Claude Code workflows.

### `.github/claude-config/`
- `settings.json` - Claude runtime settings
- `refactor-agent.md` - Instructions for PR refactor agent
- `security-agent.md` - Instructions for security fix agent

---

## Helper Scripts

Located in `scripts/`:

### `export_pr_comments.sh`
Exports PR comments to JSON files for processing.

```bash
./scripts/export_pr_comments.sh <owner> <repo> <pr_number>
# Creates: PR_conversations.json, refactor_tasks.json
```

### `parse_vulnerabilities.sh`
Parses security scanner output to standard format.

```bash
./scripts/parse_vulnerabilities.sh <scan_tool> <input_file> [output_file]
# Supported: npm-audit, snyk, trivy, pip-audit, codeql
```

### `merge_vulnerabilities.sh`
Merges multiple vulnerability reports and filters by severity.

```bash
./scripts/merge_vulnerabilities.sh <min_severity> <output_file> <input_files...>
# Example: ./merge_vulnerabilities.sh high merged.json npm.json snyk.json
```

---

## Output Artifacts

Each workflow run creates artifacts:

### PR Refactor
- `pr-data-{number}` - Exported PR comments and tasks
- `claude-refactor-summary-{number}` - Agent output and summary

### Vulnerability Fix
- `vulnerability-scan-results` - Raw scan outputs
- `claude-security-fix-summary` - Agent output and summary

---

## Troubleshooting

### "Claude Code action failed"
- Verify `CLAUDE_CODE_OAUTH_TOKEN` is set correctly
- Check if Claude Code service is available

### "Permission denied" errors
- Ensure `PERSONAL_ACCESS_TOKEN` has required scopes
- Check repository workflow permissions

### "No vulnerabilities found"
- Try lowering the `fix_severity` threshold
- Verify the scan tool is appropriate for your project

### Agent doesn't make expected changes
- Review the agent instructions in `.github/claude-config/`
- Check the `refactor_tasks.json` or `vulnerability_report.json` for correct data
- Review agent output in the workflow logs

---

## Security Considerations

- Claude Code runs with restricted permissions by default
- Workflows use `--dangerously-skip-permissions` for autonomous operation
- Review generated PRs before merging
- Keep secrets secure and rotate regularly
- Consider using environment protection rules for sensitive repos
