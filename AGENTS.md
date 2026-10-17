# Workspace Guidelines

## UI & Styling Rules
- **Colored Boxes & Badges:** When giving background tint/color to a container, box, badge, pill, or tag (e.g. `bg-blue-500/10`, `bg-emerald-500/10`, `bg-amber-500/10`, `bg-purple-500/10`), **NEVER color the text with accent colors**.
- Always use standard neutral theme text colors (`text-[var(--text-primary)]`, `text-[var(--text-secondary)]`, or neutral black/white).
- Secondary metrics and statuses (e.g. `85% done`, `Due in 3d`) should use muted neutral mono styling (`text-[var(--text-muted)] font-mono`), not colored accent text.
- Follow the canonical pattern in [`Badge.jsx`](file:///d:/Sheshank-projects/Web%20dev/Projects/Bizora/client/src/components/ui/Badge.jsx).
