---
type: template
title: Architecture Template
description: Living architecture document — system design, key decisions, data model
tags: [architect, design]
---

# Architecture

## Purpose
Living document that reflects the ACTUAL codebase structure. Updated every time new code is added or structure changes. Never stale — always matches the repo.

## Rules
- Updated after every significant code change
- Must match the actual filesystem and data flow
- If architecture diverges from code, fix the doc first

## Format

```markdown
# Architecture

## Tech Stack
- Frontend: {framework + version}
- Backend: {framework + version}
- Database: {type + version}
- Build: {toolchain}

## Directory Structure
```
{ascii tree of src/}
```

## Data Flow
{description of how data moves through the system}

## Key Patterns
- {pattern 1}
- {pattern 2}

## Decisions
- {decision} — {rationale}
```
