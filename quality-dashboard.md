---
type: template
title: Quality Dashboard Template
description: Quality dashboard generated every 10 reloop cycles — convergence, plateau, divergence tracking
tags: [tpm, quality]
---

# Quality Dashboard

Generated every 10 reloop cycles. See `TPM/25-quality-driven-development.md` for the manual halt protocol.

## Task: [Task ID]

| Metric | Value |
|--------|-------|
| **Task** | [WBS-NNN] |
| **Agent** | [agent role] |
| **Total Cycles** | [N] |
| **Gates Passing** | [count/total] |
| **Gates Failing** | [count/total] |

### Failing Gates Detail

| Gate | Consecutive Failures | Last Passed | Trend |
|------|---------------------|-------------|-------|
| [gate name] | [N] | [cycle #] | [converging/plateau/diverging] |
| [gate name] | [N] | [cycle #] | [converging/plateau/diverging] |

### Trend

```
[Cycle-by-cycle gate pass/fail history, e.g.: 5→3→1→0→2→0→1→0→0→0→0→0]
```

### Convergence Assessment

- **Converging** (gates reducing) → let it keep looping
- **Plateau** (same gate fails 10+ consecutive) → architecture review needed
- **Diverging** (previously passing gates now failing) → halt and guide

### Recommendation

[Let loop continue / Escalate to Architect / Human halt needed]
