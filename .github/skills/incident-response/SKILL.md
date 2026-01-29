---
name: incident-response
description: Incident response playbook: triage, mitigate, communicate, root-cause, and follow-up actions with minimal context loss.
---

# Incident Response

## IAGAI defaults

Follow `skills/iagai-workflow` (safety-first, evidence-first, clear comms).

## When to use

- Production/staging incident, outage, major regression, or security event.

## Procedure

1. **Triage**
   - Impact, scope, start time, affected systems, severity.
2. **Stabilize**
   - Stop the bleeding (rollback, disable feature, reduce load).
3. **Collect evidence**
   - Logs, metrics, recent deploys/PRs, reproduction steps.
4. **Root cause**
   - Hypotheses → confirm with evidence.
5. **Fix**
   - Minimal safe fix; verify; deploy carefully.
6. **Comms**
   - Status updates with timestamps and clear next check-in.
7. **Follow-ups**
   - Action items: tests, monitoring, runbook updates, preventative changes.

