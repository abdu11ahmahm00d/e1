---
type: template
title: Devlogs Template
description: Dev log entry template — per-subphase learning journal with tech decisions
tags: [tpm, quality]
---

# Devlogs

## Purpose
Running log of every prompt, every change, every roadblock, every decision. Updated after EACH interaction. The source of truth for what happened and why.

## Rules
- **Updated after every prompt** — no exceptions
- Every instruction from user is logged
- Every requirement: fulfilled / modified / rejected / postponed → logged
- Roadblocks and how they were solved
- What changed (files, architecture, config)
- References to source files

## Format

```markdown
## {YYYY-MM-DD HH:MM} — {Session Title}

### Instruction
{what the user asked}

### Changes Made
- {file}: {what changed}

### Requirements Log
- {REQ-001}: Fulfilled / Modified / Rejected / Postponed to Improvements.md

### Roadblocks
- {issue} → {how it was solved}

### Next Steps
{what comes next}
```
