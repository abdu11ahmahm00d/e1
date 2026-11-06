---
type: template
title: Project Context Template
description: Shared domain language, architecture decisions, and project conventions document
tags: [all, workflow]
---

# {Project Name} Context

## Purpose
Shared domain language that all agents use when discussing the project. Prevents drift between TPM, developers, QA, and designers.

Invoke `grill-with-docs` to evolve this document interactively.

## Language

**{Term}**:
{Definition — one or two sentences}
_Avoid_: {synonyms not to use}

## Rules

1. **Be opinionated** — When multiple words exist, pick the best one, list the rest under `_Avoid_`
2. **Keep definitions tight** — One or two sentences max. Define what it IS, not what it does
3. **Only project-specific terms** — General programming concepts don't belong here
4. **Group under subheadings** when natural clusters emerge
5. **Single file** at repo root for most projects; use CONTEXT-MAP.md for multi-context repos
