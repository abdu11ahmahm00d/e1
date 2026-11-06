---
type: template
title: Task Template
description: Individual task definition — vertical slice, acceptance criteria, layers, dependencies
tags: [tpm, planning]
---

# T-{NNN}: {Task Title}

## Phase
{Phase name}

## Description
{What needs to be done. One paragraph.}

## Acceptance Criteria
- [ ] {Criterion 1 — machine-checkable where possible}
- [ ] {Criterion 2}
- [ ] {Criterion 3}

## Scope
**In scope** (files you should modify):
- {path/to/file.ts — what it does}
- {path/to/new-file.ts (create)}

**Out of scope** (do NOT touch, even if they look related):
- {path/to/legacy.ts — reason}

## STOP Conditions
Stop and report back (do not improvise) if:
- The real code at the locations described doesn't match the task's assumptions.
- A step's verification fails twice after a reasonable fix attempt.
- The fix requires touching an out-of-scope file.
- You discover a key assumption made during planning is false.

## Verification Gates
Every step must end with a command and expected result:
| Step | Command | Expected |
|------|---------|----------|
| 1 | pnpm typecheck | exit 0 |
| 2 | pnpm test -- --filter ... | all pass |
| 3 | g "{old pattern}" src/ | no matches |

## Drift Check
Before starting: git diff --stat <planned-at SHA>..HEAD -- <in-scope paths>
If any in-scope file changed since this plan was written, compare the assumptions against live code before proceeding. On mismatch, treat as a STOP condition.

## Technical Notes
{Any architecture decisions, constraints, or implementation guidance. Omit if none.}

## Dependencies
- **Blocked by**: T-{000}
- **Blocks**: T-{000}
- **Depends on plans**: {plan numbers or "none"}

## Assigned To
{agent name}

## Estimate
{story points or hours}

## Status
Scheduled | Ongoing | In Review | Done | Closed

## Maintenance Notes
For the next agent who touches this code:
- What future changes will interact with this
- What a reviewer should scrutinize

---
## Rejection Notes
{populated by QA or TPM on rejection}

## Closure Notes
{populated by TPM when moving Done → Closed}
