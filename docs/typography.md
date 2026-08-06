# Typography System & Explicit Scale Documentation

## Overview

This codebase follows a single, unified, named type scale defined in `tailwind.config.ts`. Ad-hoc font size utility classes (`text-xl`, `text-2xl`, `text-3xl`, etc.) are replaced with named semantic scale levels to establish visual consistency, strict hierarchy, and predictable typography across all pages and components.

---

## Font Family Usage Rules

- **Serif (`Source Serif 4` / `font-serif`)**:
  - Reserved exclusively for **page titles (`h1`)** and **major section headings (`h2`)**.
  - Adds editorial polish and clear visual separation for top-level document structure.

- **Sans (`Outfit` / `font-sans` / default `body`)**:
  - Used for **all other elements**, including `display` numbers (e.g. current temperature), `h3` card titles, `body` text, `body-sm` metadata/labels, and `caption` micro-text.

---

## Named Type Scale Reference

| Level | Class | Size | Line Height | Letter Spacing | Font Weight | Target Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **display** | `text-display` | `4.00rem` (64px) | `1` | `-0.02em` | 700 (Bold) | Current temperature readout and homepage hero stats only. |
| **h1** | `text-h1` | `2.25rem` (36px) | `1.2` | `-0.015em` | 700 (Bold) | Main page titles (city titles, article titles, catalog headers, 404 header). |
| **h2** | `text-h2` | `1.375rem` (22px) | `1.35` | `-0.01em` | 600 (SemiBold) | Section headings within a page (card section headers, grid section titles). |
| **h3** | `text-h3` | `1.125rem` (18px) | `1.4` | `0` | 600 (SemiBold) | Sub-sections, card titles, accordions. |
| **body** | `text-body` | `0.9375rem` (15px) | `1.5` | `0` | 400 (Regular) | Default paragraph text and primary body copy. |
| **body-sm** | `text-body-sm` | `0.8125rem` (13px) | `1.4` | `0` | 400 (Regular) | Secondary metadata, labels, and supporting copy. |
| **caption** | `text-caption` | `0.6875rem` (11px) | `1.3` | `0` | 400 (Regular) | Timestamps, micro fine print, badge text. |

---

## Usage Examples

```tsx
// Page Title (h1)
<h1 className="font-serif text-h1 text-sky-950">
  Погода в Москве
</h1>

// Section Title (h2)
<h2 className="font-serif text-h2 text-sky-950">
  Почасовой прогноз
</h2>

// Sub-section Title / Card Header (h3)
<h3 className="text-h3 font-semibold text-cloud-900">
  Состояние дорог
</h3>

// Primary Hero Number (display)
<p className="text-display font-semibold tabular-nums text-sky-950">
  +18°
</p>
```
