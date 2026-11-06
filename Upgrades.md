---
type: template
title: Upgrades Template
description: Upgrade planning document — migration steps, breaking changes, rollback plan
tags: [tpm, planning]
---

# Upgrades

## Purpose
Captures optimizations, decision changes, and scope modifications identified during grilling that WILL be implemented during the MVP build. These are changes to the original requirements that improve the outcome.

## Rules
- Populated during Phase 1 grilling
- Implemented during MVP build (not deferred)
- Each entry must be traceable to a grilling question/answer

## Format

```markdown
## {Upgrade Name}

### Change
{what changed from original requirements}

### Reason
{why — efficiency, better UX, technical necessity}

### Impact
{what files/architecture this affects}
```
