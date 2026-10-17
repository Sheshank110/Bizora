# UI & Styling Guidelines for Bizora

## Core Rule: Colored Containers & Boxes (Badges, Tags, Pills, Cards)
- **NEVER color text to match a colored container/box.**
- When a box, badge, tag, pill, or card has a background color (e.g. `bg-blue-500/10`, `bg-emerald-500/10`, `bg-amber-500/10`, `bg-purple-500/10`):
  - **The text inside MUST remain standard neutral theme text:** use `text-[var(--text-primary)]`, `text-[var(--text-secondary)]`, or standard neutral text.
  - **DO NOT** use colored text such as `text-blue-500`, `text-emerald-500`, `text-amber-500`, or `text-purple-500` inside tinted/colored boxes.
  - Status indicators or metric percentages (e.g., "85% done", "Due in 3d") must use muted mono styling (`text-[var(--text-muted)] font-mono`), not colored accent text.

Reference component: `client/src/components/ui/Badge.jsx` (tinted background + neutral primary text).
