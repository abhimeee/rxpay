# PM Coach — Design Guide
> **Reference:** Valley dashboard (joinvalley.co). Every design decision in this app must follow this guide exactly. When in doubt, refer to this document first.

---

## 1. Design Philosophy

The Valley dashboard is a **clean, minimal, light-mode SaaS UI** with these core principles:

- **White-dominant backgrounds** — content areas are always white or near-white
- **Extreme restraint** — one accent color (red/black), generous whitespace, no gradients
- **Typography-led hierarchy** — size and weight communicates structure, not color
- **Borders over shadows** — elements are defined by thin `1px` borders, not drop shadows
- **Flat, sharp components** — very small or zero border-radius; nothing looks "bubbly"
- **Ink on paper** — feels like a productivity tool, not a marketing site

---

## 2. Color Palette

This is the **exact palette** derived from the Valley screenshots. Use these tokens only.

### Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-accent` | `#E5001B` | Primary CTA buttons (Next, Save, Create), active highlights, danger red |
| `--color-black` | `#111111` | Page titles, nav active state, high-emphasis text |
| `--color-white` | `#FFFFFF` | All card/panel backgrounds, sidebar background |

### Background Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#F5F5F5` | App-level body background (very light grey) |
| `--color-bg-hover` | `#F0F0F0` | Hover state on list items, nav items |
| `--color-bg-selected` | `#F5F5F5` | Selected/active list items in sidebar panels |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#111111` | Headings, nav labels, table cell primary content |
| `--color-text-secondary` | `#555555` | Subtext, descriptions, labels under headings |
| `--color-text-muted` | `#999999` | Placeholder text, timestamps, helper text |
| `--color-text-disabled` | `#CCCCCC` | Disabled inputs, greyed-out controls |

### Border Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-border` | `#E5E5E5` | Standard dividers, card edges, input borders |
| `--color-border-dark` | `#CCCCCC` | Focused inputs, table header bottom borders |

### Semantic / Status Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-green` | `#18A558` | "Selected" badge, success states, checkmarks, `Easy` tags, `Beginner` tags |
| `--color-green-bg` | `#EDF7F1` | Green badge backgrounds |
| `--color-yellow` | `#D97706` | MEDIUM ICP score badges, warnings, `Medium` tags, `Intermediate` tags |
| `--color-yellow-bg` | `#FEF3C7` | Yellow badge backgrounds |
| `--color-red` | `#E5001B` | DONTs, delete icons, error states, accent, `Hard` tags, `Advanced` tags |
| `--color-red-bg` | `#FEF0F0` | Light red badge backgrounds |
| `--color-blue` | `#1A6FDE` | Secondary accent color to break monotony, links, active state tags, or specific badges |
| `--color-blue-bg` | `#EEF4FD` | Blue badge backgrounds |

> ⚠️ **Rule:** While our primary accent color is red/black, we use blue (`--color-blue`) selectively as a secondary color to break the monotony of the black-and-white theme. Use it for secondary active states, specific tags, or subtle highlights.

### Subtle Category Tints (Semantic Cards)
To add non-attention seeking character throughout the app (Practice, Learn, History), we map specific subtle, pastel hexes to content categories. These are used strictly for **small icon containers** (e.g. 40x40px).
- **Product Design:** Light Blue (`bg: #EEF4FD`, `text: #1A6FDE`, `border: #D1E4FF`)
- **Product Metrics:** Light Green (`bg: #EDF7F1`, `text: #18A558`, `border: #C6E6D1`)
- **Product Strategy:** Light Purple (`bg: #F4F0FD`, `text: #6D28D9`, `border: #E9D5FF`)
- **Guesstimates:** Light Yellow/Amber (`bg: #FEF3C7`, `text: #D97706`, `border: #FDE68A`)
- **Behavioral:** Light Red/Rose (`bg: #FEF0F0`, `text: #E5001B`, `border: #FCA5A5`)
- **Product Improvement:** Soft Sky Blue (`bg: #E0F2FE`, `text: #0284C7`, `border: #BAE6FD`)
- **Go-To-Market:** Soft Orange/Peach (`bg: #FFEDD5`, `text: #EA580C`, `border: #FED7AA`)
- **Root Cause Analysis:** Light Slate (`bg: #F8FAFC`, `text: #475569`, `border: #E2E8F0`)

Never color an entire card face with these tints; the Valley aesthetic demands whitespace dominance.

---

## 3. Typography

### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Import from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| Page Title | `1.25rem` (20px) | `600` | `1.3` | `-0.01em` | Main content area heading (e.g. "Research Library 2/2") |
| Section Title | `0.875rem` (14px) | `600` | `1.4` | `0` | Card section headings, panel titles |
| Body / Default | `0.8125rem` (13px) | `400` | `1.55` | `0` | All body copy, descriptions, input values |
| Label / Small | `0.75rem` (12px) | `400` | `1.5` | `0` | Input labels, helper text, form descriptions |
| Micro / Muted | `0.6875rem` (11px) | `400` | `1.4` | `0` | Timestamps, status tags, table secondary text |
| Nav Item | `0.8125rem` (13px) | `500` | `1` | `0` | Sidebar navigation labels |
| Nav Section | `0.6875rem` (11px) | `600` | `1` | `0.06em` | Section headers like "Workspace", "Organization" |
| Stat / Metric | `1.75rem` (28px) | `700` | `1` | `-0.03em` | Big numbers in the campaign stats bar |
| Button | `0.8125rem` (13px) | `500` | `1` | `0` | All button labels |

> **Rule:** There are no `h1` tags in the traditional sense. Page titles are modest — `1.25rem` semi-bold. Valley uses size conservatively.

---

## 4. Spacing System

The Valley dashboard uses an **8px base grid**. All spacing values are multiples of 4px.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Micro gaps between inline items |
| `--space-2` | `8px` | Gap between icon and label, between badge and text |
| `--space-3` | `12px` | Padding inside compact items (nav, table cells) |
| `--space-4` | `16px` | Standard padding inside cards, form sections |
| `--space-5` | `20px` | Gap between major sections |
| `--space-6` | `24px` | Padding in content panels, between cards |
| `--space-8` | `32px` | Page-level section gaps |

### Key Spacing Rules

- **Sidebar padding:** `12px 8px` (nav items), `16px 12px` (logo area)
- **Card padding:** `16px 20px` for content cards
- **Input padding:** `8px 12px` vertical/horizontal
- **Button padding:** `6px 14px` (default), `8px 20px` (primary/large)
- **Table row height:** approximately `44px`
- **Top bar height:** `44px`

---

## 5. Border Radius

Valley is intentionally **sharp and minimal**. Border radius is very small across the board.

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | `3px` | Badges, status pills, small tags |
| `--radius-sm` | `5px` | Buttons, input fields |
| `--radius-md` | `6px` | Cards, panels, dropdowns, modals |
| `--radius-lg` | `8px` | Large cards, tour/tooltip bubbles |
| `--radius-full` | `9999px` | Circle avatars, pill badges only |

> **Rule:** Never use `border-radius > 8px` for layout containers. The Valley aesthetic is angular, not rounded.

---

## 6. Shadows

Valley uses **almost no drop-shadows**. Structure is defined by borders.

| Token | Value | Usage |
|---|---|---|
| `--shadow-none` | `none` | Default for all elements |
| `--shadow-xs` | `0 1px 3px rgba(0,0,0,0.06)` | Input fields on focus, subtle lift |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.08)` | Dropdown menus, tooltips, tour bubbles |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.1)` | Modals, floating panels |

---

## 7. Layout & Structure

### Overall Shell

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (180px)  │         Main Content Area           │
│                   │  ┌─────────────────────────────┐   │
│  Logo + brand     │  │  Top Bar (breadcrumbs +     │   │
│                   │  │  action buttons)             │   │
│  Nav sections     │  ├─────────────────────────────┤   │
│                   │  │                             │   │
│  ─────────────    │  │  Page Content (scrollable)  │   │
│  Org section      │  │                             │   │
│                   │  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Sidebar

- **Width:** `220px` (Valley uses a narrow sidebar)
- **Background:** `#FFFFFF`
- **Right border:** `1px solid #E5E5E5`
- **Position:** Fixed/sticky, full height

**Logo area:**
- Height: `~52px`
- Bottom border: `1px solid #E5E5E5`
- Contains: small snowflake/asterisk icon + brand name in `font-weight: 700`
- A "Create Campaign" type primary action CTA button below the logo (full-width, accent color)

**Nav sections:**
- Section header text: `0.6875rem`, `font-weight: 600`, `letter-spacing: 0.06em`, `color: #999999`, `UPPERCASE`
- Section gap: `24px` between sections
- Nav item height: `~32px`
- Nav item padding: `8px 12px`
- Active item: black text (`#111111`), `font-weight: 600`, background color `#F0F0F0`
- Inactive item: `#555555`, `font-weight: 500`
- Active has a small icon that matches (slightly bolder stroke)
- Badge (notification count): small dark grey `#555` background, white text, `border-radius: 3px`, right-aligned

### Main Content Area

- **Background:** `#F5F5F5`
- **Overflow:** auto/scroll

### Top Bar

- **Height:** `44px`
- **Background:** `#FFFFFF`
- **Border-bottom:** `1px solid #E5E5E5`
- **Padding:** `0 20px`
- Contains: Breadcrumb trail (left) + action buttons (right: Save, Share, kebab menu)

### Content Panels (Two/Three Column Layouts)

Valley frequently uses a **left panel + right detail panel** layout:
- Left panel is a narrow list (`220–280px`)
- Right panel is the main edit/view area
- They are separated by a `1px solid #E5E5E5` vertical border
- Both have `#FFFFFF` background

---

## 8. Components

### Buttons

#### Primary Button (e.g. "Next", "Save", "Create")
```css
background: #111111;        /* Or #E5001B for the red accent variant */
color: #FFFFFF;
font-size: 0.8125rem;
font-weight: 500;
padding: 7px 16px;
border-radius: 5px;
border: none;
cursor: pointer;
transition: opacity 0.15s ease;
```
- Hover: `opacity: 0.88`
- The "Next" button in onboarding tour uses `#111111` black background
- The "Save" button uses `#111111` black background  
- Some CTAs use `#E5001B` red (e.g. "Pause Campaign")

#### Secondary / Outline Button
```css
background: #FFFFFF;
color: #111111;
font-size: 0.8125rem;
font-weight: 500;
padding: 7px 16px;
border-radius: 5px;
border: 1px solid #E5E5E5;
cursor: pointer;
transition: background 0.15s ease;
```
- Hover: `background: #F5F5F5`

#### Ghost Button (e.g. "Back", "Cancel")
```css
background: #FFFFFF;
color: #111111;
font-size: 0.8125rem;
font-weight: 500;
padding: 7px 16px;
border-radius: 5px;
border: 1px solid #E5E5E5;
```

#### Icon-only Button (kebab, +, etc.)
```css
width: 28px;
height: 28px;
background: transparent;
border: none;
border-radius: 4px;
color: #555555;
cursor: pointer;
display: flex; align-items: center; justify-content: center;
```
- Hover: `background: #F0F0F0`

### Inputs & Text Areas

```css
background: #FFFFFF;
border: 1px solid #E5E5E5;
border-radius: 5px;
color: #111111;
font-size: 0.8125rem;
font-family: inherit;
padding: 8px 12px;
width: 100%;
transition: border-color 0.15s;
```

- Focus: `border-color: #999999; outline: none;`
- Placeholder: `color: #AAAAAA`
- Label above input: `font-size: 0.75rem; font-weight: 500; color: #111111; margin-bottom: 4px;`
- Helper text below input: `font-size: 0.75rem; color: #888888; margin-top: 4px;`
- Required asterisk (`*`) after label: `color: #E5001B`

### Badges / Status Pills

```css
/* Base badge */
display: inline-flex;
align-items: center;
padding: 2px 8px;
border-radius: 3px;
font-size: 0.6875rem;
font-weight: 500;
```

| Variant | Background | Text | Usage |
|---|---|---|---|
| `badge-selected` | `#EDF7F1` | `#18A558` | Selected/active research card |
| `badge-research` | `#F5F5F5` | `#555555` | Unselected action buttons ("Research") |
| `badge-high` | `#EDF7F1` | `#18A558` | HIGH ICP score |
| `badge-medium` | `#FEF3C7` | `#D97706` | MEDIUM ICP score |
| `badge-low` | `#FEF0F0` | `#E5001B` | LOW ICP score |
| `badge-linkedin` | `#EEF4FD` | `#1A6FDE` | InMail Sent, LinkedIn status |
| `badge-active` | `#EDF7F1` | `#18A558` | Active campaign badge |
| `badge-stop` | `#FEF0F0` | `#E5001B` | Stop outreach badge |

### Difficulty & User Level Badges
We unify difficulty levels (`Easy/Medium/Hard`) with user progression (`Beginner/Intermediate/Advanced`) for a consistent semantic learning scale. Use inline styles mapping directly to these exact variables.

| Label / Level | Background | Text Color | Notes |
|---|---|---|---|
| `Not Started` | `var(--color-bg)` | `var(--color-text-secondary)` | Includes a `1px` border of `var(--color-border)` |
| `Easy` / `Beginner` | `var(--color-green-bg)` | `var(--color-green)` | For `1-24%` progress |
| `Medium` / `Intermediate` | `var(--color-yellow-bg)` | `var(--color-yellow)` | For `25-74%` progress |
| `Hard` / `Advanced` | `var(--color-red-bg)` | `var(--color-red)` | For `75-100%` progress |

### Navigation Items

```css
/* Inactive */
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #555555;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.1s ease, color 0.1s ease;
}

.nav-item:hover {
  background: #F0F0F0;
  color: #111111;
}

/* Active */
.nav-item.active {
  color: #111111;
  font-weight: 600;
  background: transparent; /* No background on active in Valley */
}
```

> **Key difference from current code:** Valley uses a subtle grey active background `#F0F0F0`. Active nav items are **bold/dark text** with this background fill instead of transparent.

### Cards / List Items

```css
.card-dotted {
  position: relative;
  background-color: var(--color-white);
}

.card-dotted::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: inherit;
  pointer-events: none;
  background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
  background-size: 16px 16px;
  background-position: -8px -8px;
  /* Extremely faded to ensure non-attention seeking visual texture */
  opacity: 0.3;
}



.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #E5E5E5;
  font-size: 0.8125rem;
  color: #111111;
  cursor: pointer;
  transition: background 0.1s;
}

.list-item:hover {
  background: #F5F5F5;
}

.list-item.active {
  background: #F5F5F5;
  font-weight: 500;
}
```

### Data Table

```css
/* Table container */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

/* Header row */
.data-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  color: #555555;
  border-bottom: 1px solid #E5E5E5;
  background: #FFFFFF;
  white-space: nowrap;
}

/* Data rows */
.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #F0F0F0;
  color: #111111;
  vertical-align: middle;
}

/* Row hover */
.data-table tr:hover td {
  background: #F8F8F8;
}

/* Checkbox column */
.data-table td:first-child,
.data-table th:first-child {
  width: 40px;
  padding-left: 16px;
}
```

### Tabs (Page-level & Section-level)

```css
/* Tab container */
.tabs {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid #E5E5E5;
}

/* Individual tab */
.tab {
  padding: 10px 16px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #888888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}

.tab:hover {
  color: #111111;
}

.tab.active {
  color: #111111;
  font-weight: 600;
  border-bottom-color: #111111;
}
```

### Stat Bar (Campaign metrics)

```css
.stat-bar {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 12px 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F5F5F5;
  display: flex; align-items: center; justify-content: center;
  color: #555555;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #111111;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #888888;
  font-weight: 400;
  margin-top: 2px;
}
```

### Filter Chips / Tag Pills

These are the row of filter buttons ("All", "Prospect Insights", "Company Insights" etc.)

```css
.filter-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #E5E5E5;
  background: #FFFFFF;
  color: #555555;
  cursor: pointer;
  transition: all 0.1s;
}

.filter-chip:hover {
  background: #F0F0F0;
}

.filter-chip.active {
  background: #111111;
  color: #FFFFFF;
  border-color: #111111;
}
```

### Modals & Tour Bubbles

The tour/onboarding steppers in Valley are floating card-like overlays:

```css
.tour-bubble {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  padding: 16px 20px;
  max-width: 320px;
  font-size: 0.875rem;
  color: #111111;
  line-height: 1.55;
}

.tour-bubble .tour-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.tour-bubble .tour-progress {
  font-size: 0.75rem;
  color: #888888;
}
```

### Breadcrumb Bar (Top of content)

```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: #888888;
}

.breadcrumb .separator {
  color: #CCCCCC;
}

.breadcrumb .current {
  color: #111111;
  font-weight: 500;
}

/* User avatar in breadcrumb */
.breadcrumb .user-chip {
  display: flex; 
  align-items: center; 
  gap: 6px;
  color: #111111;
  font-weight: 500;
}
```

### Search Input

```css
.search-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 5px;
  font-size: 0.8125rem;
  color: #111111;
  min-width: 200px;
}

.search-input input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.8125rem;
  color: #111111;
}

.search-input .icon {
  color: #AAAAAA;
  flex-shrink: 0;
}
```

### Toggle / Switch

The on/off toggles in Valley ("Admin View" etc.):
```css
.toggle {
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: #E5E5E5;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle.on {
  background: #111111;
}

.toggle::after {
  content: '';
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #FFFFFF;
  position: absolute;
  top: 2px; left: 2px;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.toggle.on::after {
  transform: translateX(14px);
}
```

### Sequence Flow Cards (Campaign Builder)

Cards in the workflow/sequence builder:
```css
.sequence-card {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 0.8125rem;
  min-width: 240px;
  position: relative;
}

.sequence-card .card-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
}

.sequence-card .card-title {
  font-weight: 600;
  color: #111111;
}

.sequence-card .card-meta {
  color: #888888;
  font-size: 0.75rem;
  margin-top: 1px;
}
```

---

## 9. Icons

Valley uses a consistent icon library throughout — visually consistent with **Lucide** or **Heroicons** outline style.

- **Size:** `14px` (small/inline), `16px` (nav), `18px` (action buttons)
- **Stroke width:** `1.5px` (default), `2px` (active/emphasized)
- **Color:** matches text color of its container
- **Style:** always outline, never filled (except checkbox checkmarks)

Recommended library: [Lucide React](https://lucide.dev/) — already used in this project.

---

## 10. Imagery & Avatars

### User Avatars
- **Shape:** Circle (`border-radius: 50%`)
- **Size:** `28px` (table rows), `32px` (sidebar profile), `36px` (breadcrumb)
- Valley uses real profile photos where available; fallback is initials on a colored background
- Fallback background: a solid muted color (not gradient)
- Company logos: `28px` circle, real logo images with object-fit cover

### Company/Brand Icons
- Inside list items: `20px × 20px`, square with `border-radius: 4px`
- Often a logo image or a colored square with initials

---

## 11. Interaction States

### Hover
- Background changes to `#F0F0F0` or `#F5F5F5` (light grey — never blue)
- Text may deepen from `#555555` → `#111111`
- Transition: `150ms ease`

### Micro-Interactions (New)
Valley uses very subtle micro-interactions to add polish without feeling overwhelming:
- **`.card-hover`**: Applied to clickable cards. On hover, the card slides up slightly (`translateY(-2px)`) and gains a soft shadow (`0 4px 12px rgba(0,0,0,0.05)`).
- **`.hover-flip-text`**: Applied to prominent textual CTAs (like "View all" or "Start Practice"). On hover, the text slides up and is immediately replaced by identical text sliding up from below, creating a seamless "flip" effect. To use this, wrap the text tightly in a span with `data-text="Your Text"` and an inner `<span>Your Text</span>`. 
- **`.hover-slide`**: A utility class that applies the same `-3px` lift and shadow as `.card-hover` to any arbitrary element.

### Focus (Keyboard)
- Input: `border-color: #999999`, no glow ring
- Button: `outline: 2px solid #111111; outline-offset: 2px`

### Active/Pressed
- Slight `opacity: 0.85` on buttons

### Disabled
- `opacity: 0.4`, `cursor: not-allowed`
- Do not change background color for disabled — just reduce opacity

### Selected (List Items)
- `background: #F5F5F5` + `font-weight: 500`

---

## 12. Animation & Motion

Valley is **very restrained** with animation. No page transitions, no slide-ins.

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Background/color transitions | `background`, `color` | `150ms` | `ease` |
| Dropdown/menu open | `opacity 0 → 1` | `120ms` | `ease-out` |
| Tour bubble appear | `opacity + translateY(4px → 0)` | `200ms` | `ease-out` |
| Toggle switch | `transform` | `200ms` | `ease` |
| Button press | `opacity` | `100ms` | `ease` |

**Never use:**
- `bounce` or `spring` physics
- Slide-in from sides for page navigation
- Scale transforms on cards
- Parallax or scroll animations

---

## 13. CSS Variables (Complete Token Set)

Paste this into `globals.css` `:root` to replace the existing token set:

```css
:root {
  /* Colors - Core */
  --color-accent: #E5001B;
  --color-black: #111111;
  --color-white: #FFFFFF;

  /* Colors - Backgrounds */
  --color-bg: #F5F5F5;
  --color-bg-hover: #F0F0F0;
  --color-bg-selected: #F5F5F5;

  /* Colors - Text */
  --color-text-primary: #111111;
  --color-text-secondary: #555555;
  --color-text-muted: #999999;
  --color-text-disabled: #CCCCCC;

  /* Colors - Borders */
  --color-border: #E5E5E5;
  --color-border-dark: #CCCCCC;

  /* Colors - Semantic */
  --color-green: #18A558;
  --color-green-bg: #EDF7F1;
  --color-yellow: #D97706;
  --color-yellow-bg: #FEF3C7;
  --color-red: #E5001B;
  --color-red-bg: #FEF0F0;
  --color-blue: #1A6FDE;
  --color-blue-bg: #EEF4FD;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-base: 13px;        /* 0.8125rem */
  --font-size-sm: 12px;          /* 0.75rem */
  --font-size-xs: 11px;          /* 0.6875rem */
  --font-size-md: 14px;          /* 0.875rem */
  --font-size-lg: 16px;          /* 1rem */
  --font-size-xl: 20px;          /* 1.25rem */

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border Radius */
  --radius-xs: 3px;
  --radius-sm: 5px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-none: none;
  --shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.10);

  /* Layout */
  --sidebar-width: 180px;
  --topbar-height: 44px;
}
```

---

## 14. Things to Avoid (Anti-Patterns)

These patterns exist in the **current PMcoach** codebase but **must NOT be used** going forward:

| ❌ Current Pattern | ✅ Valley Pattern |
|---|---|
| Blue active state on nav items (`--bg-active: #EFF6FF`) | No background on active — text becomes black/bold |
| Large border-radius (`--radius-lg: 14px`, `--radius-xl: 18px`) | Max `8px`, usually `5–6px` |
| Blue as primary accent (`#2563EB`) | Black (`#111111`) or red (`#E5001B`) |
| Heavy drop shadows (`shadow-md`, `shadow-lg`) | Thin 1px borders only, no lift shadows |
| Big "stat value" font (`font-size: 1.75rem, weight: 800`) | More modest sizing, weight 700 |
| Gradient backgrounds in profile avatars | Flat solid colors only |
| `font-size: 14px` as base | `13px` base — Valley's default text is slightly smaller |
| Section labels with `letter-spacing: 0.1em` uppercase | Valley uses `0.06em` — more restrained |
| Blue progress fills | Black fills (`#111111`) or green for success |
| Large padding on cards (`1.5rem`) | More compact: `12–16px` |

---

## 15. Accessibility Notes

- Minimum contrast ratio: `4.5:1` for all text
- All interactive elements must have `:focus-visible` outlines
- Icon-only buttons must have `aria-label`
- Use `role="tablist"` and `role="tab"` on tab components
- Status changes should include `aria-live` regions

---

## 16. Quick Reference — The "Valley Test"

Before shipping any UI, check:

1. **Color:** Is the background white or near-white? Is the accent black or red (not blue unless LinkedIn)?
2. **Radius:** Is the border-radius ≤ 8px on all containers?
3. **Shadows:** Am I relying on borders instead of shadows?
4. **Typography:** Is body text 13px? Are headings modest in size?
5. **Spacing:** Does everything feel compact but breathable — not crowded, not spacious?
6. **Interaction:** Does hover just change background to light grey? No complex animations?
7. **Density:** Does the page feel like a productivity tool — dense with information, not a marketing page?

If you answer YES to all of the above, you're building in the Valley style. ✓
