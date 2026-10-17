# Bizora — Design System: Dark Aurora Glass

## Philosophy

Bizora uses **Dark Aurora Glass** as a cohesive premium B2B SaaS design system.

The interface feels:
- **Premium & Trustworthy** — serious business software with executive clarity
- **Selective Glass** — glass is used selectively (modals, dropdowns, command palette, floating cards), never as a gimmick
- **High Readability** — tables, forms, settings, and financial data use mostly-solid surfaces
- **Subtle Aurora Ambience** — a very subtle blurred indigo/blue ambient glow in the background, avoiding obvious neon gradients or animated rainbow effects
- **Moderate Corner Radii** — 8–18px corner radii, avoiding excessive pill-shaped UI

---

## Color System

Dark mode is the default theme.

### Palette Tokens

```text
Background:      #080B12
Secondary:       #0B0F17
Surface:         #101622

Primary:         #6366F1 (Indigo)
Secondary:       #38BDF8 (Sky Blue)

Success:         #34D399 (Emerald)
Warning:         #F59E0B (Amber)
Danger:          #F87171 (Rose)

Primary text:    #F8FAFC
Secondary text:  #CBD5E1
Muted text:      #94A3B8
```

### Light Theme

```text
Background:      #F5F7FB
Surface:         #FFFFFF / rgba(255,255,255,0.7)
Text:            #0F172A
Muted:           #475569
Primary:         #6366F1
```

### Glass Surface Tokens

- **Standard Glass**: `background: rgba(255,255,255,0.04–0.07)`, `border: rgba(255,255,255,0.08–0.12)`, `backdrop-blur: 18–24px`
- **Stronger Glass**: Modals, Dropdowns, Command palette, Floating cards
- **Mostly-Solid Surfaces**: Tables, Forms, Financial data, Settings (`#101622` in dark, `#FFFFFF` in light)

---

## Typography

**Fonts:** Inter, Plus Jakarta Sans

| Scale | Use |
|---|---|
| Page title | 28–32px |
| Section header | 20–24px |
| Body | 14–15px |
| Metadata & Captions | 12–13px |

---

## Navigation & Command System

- **Grouped Sidebar:**
  - Dashboard
  - Business (Customers, Employees)
  - Operations (Projects, Tasks, Services)
  - Finance (Invoices, Payments, Expenses)
  - Resources (Inventory, Reports)
  - System (Activity, Settings)
  - Active State: Indigo (`#6366F1`)
- **Compact Topbar:**
  - Workspace Switcher
  - Search / Command trigger (`Ctrl/Cmd + K`)
  - Notifications
  - Theme switcher
  - User profile menu
- **Command Palette:** Keyboard-driven navigation across all modules and actions.
