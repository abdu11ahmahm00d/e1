---
type: template
title: Requirements Template
description: Project requirements document — scope, constraints, acceptance criteria, frontmatter with tier, type, and allowed languages
tags: [tpm, planning]
---

# Requirements

## Purpose
User provides initial nebulous description. Agent runs a grilling session (Phase 1 orchestration) to surface all edge cases, constraints, and scope boundaries. After grilling, this file is structured into concrete requirements.

## Process
1. User writes free-form description
2. If file doesn't exist or is under 1000 lines → **run Phase 1 grilling**
3. Grill #1: Feature increment (what cool stuff can be added)
4. Grill #2: Efficiency/optimization (language, codebase, vram/ram/cpu)
5. During grilling, populate `upgrades.md` (do now) and `improvements.md` (do later)
6. **Regression questioning**: continue grilling until 3 consecutive rounds produce no new insights. If the user keeps surfacing new edge cases, the grilling isn't exhaustive yet.
7. After grilling, structure into formal requirements

## Format

```markdown
# Project: {name}

## Overview
{1-2 paragraph summary}

## Core Features
- {feature} — {description}

## Technical Constraints
- {constraint}

## User Stories
- As a {role}, I want to {action} so that {benefit}

## Acceptance Criteria
- [ ] {criterion}

## Out of Scope
- {explicitly excluded items}
```
