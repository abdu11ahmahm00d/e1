---
type: template
title: Design Template
description: Design decisions document — approach, trade-offs, UI/UX specs
tags: [ui-ux, design]
---

# Design

## Purpose
Defines the UI/UX design patterns, component architecture, and visual language for GUI or TUI projects.

## Rules
- Created before implementation
- Updated when design decisions change
- References actual components and their states

## Format

```markdown
# Design

## Design System
- Colors: {primary, secondary, accent, background, text}
- Typography: {font family, sizes, weights}
- Spacing: {scale}
- Dark mode: {yes/no and strategy}

## Component Tree
```
{ascii tree of component hierarchy}
```

## Page / Screen Layouts
### {Screen name}
- Purpose: {what user does here}
- States: {loading, empty, error, success, edge cases}
- Components used: {list}

## User Flows
1. {step 1} → {step 2} → {step 3}

## Accessibility
- {a11y requirements}
```
