---
type: template
title: Clean UI Design System — Steal This Blueprint
description: Minimal, reusable design system spec for consistent polished interfaces
tags: [ui-ux, design-system, tokens, frontend]
---

# Clean UI Design System

> Simple systems make polished products.

## Typography

| Role | Font | Weight | Size | Letter Spacing |
|---|---|---|---|---|
| UI Text | SF Pro | Regular | 12px | -0.15px |
| UI Text | SF Pro | Regular | 13px | -0.15px |
| UI Text | SF Pro | Medium | 14px | -0.15px |
| Heading | SF Pro | Medium | 24px | -0.15px |

**Rule**: Only these 4 sizes. No 11px, no 16px, no 18px, no 20px.

## Color Hierarchy

| Role | Hex | Usage |
|---|---|---|
| Primary | #292929 | Headlines, primary actions, high-emphasis text |
| Secondary | #5D5D5D | Body text, descriptions, medium emphasis |
| Tertiary | #9E9E9E | Captions, placeholders, disabled, low emphasis |

**Rule**: No other grays. No blue text unless it's a link. No colored type for hierarchy.

## Icon Sizing

| Context | Size | Notes |
|---|---|---|
| Navigation | 14px | Tab bar, toolbar, breadcrumb |
| Cards | 20px | Feature cards, list items with icons |
| Inline | 14px | Match adjacent 13-14px text |

**Rule**: Icons are UI, not decoration. Size them to their container's text.

## Spacing & Radius

| Element | Value |
|---|---|
| Navigation padding | 8px |
| Card padding | 16px |
| CTA radius | Pill (9999px / `rounded-full`) |
| Card radius | 12px (default) |
| Button radius | Pill (match CTA) |

## Quick Reference Card

```
Font: SF Pro (-0.15px tracking)
Sizes: 12 / 13 / 14 / 24px
Colors: #292929 / #5D5D5D / #9E9E9E
Icons: 14px nav / 20px cards
Space: 8px nav / 16px cards
Radius: pill CTA, 12px cards
```

## Usage in Stack

Reference this in Phase 6 (UI/UX Design) when producing `DESIGN.md` tokens:

```json
{
  "fontFamily": "SF Pro",
  "tracking": "-0.15px",
  "typeScale": { "caption": 12, "body": 13, "bodyLarge": 14, "heading": 24 },
  "colors": { "primary": "#292929", "secondary": "#5D5D5D", "tertiary": "#9E9E9E" },
  "iconSizes": { "nav": 14, "card": 20 },
  "spacing": { "nav": 8, "card": 16 },
  "radius": { "cta": "9999px", "card": 12 }
}
```

## Anti-Patterns (What Breaks This System)

- ❌ Adding a 5th font size
- ❌ Using #333, #666, #999 instead of the exact 3 hexes
- ❌ 16px icons in nav, 24px icons in cards
- ❌ 12px nav padding, 24px card padding
- ❌ Rounded (8px) CTA buttons
- ❌ Mixing font weights beyond Regular/Medium
- ❌ Colored text for hierarchy (only links get color)