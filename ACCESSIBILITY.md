# Accessibility

CarbonLens targets WCAG 2.2 AA. The following checks are enforced or
verified by hand on every release.

## Structural

- `<html lang="en">` set in the root shell.
- Exactly one `<main id="main-content">` per route.
- Heading hierarchy starts at `h1`; no skipped levels.
- Skip-link as the first focusable element on every page.

## Keyboard

- All interactive elements are reachable in DOM order.
- Visible `focus-visible` rings (Tailwind defaults + ring tokens).
- Modals (Radix Dialog) trap focus and restore on close.
- Esc closes overlays.

## Color & contrast

- Cold-grey palette in `src/styles.css` — primary text on background measures
  ≥ 12:1; muted text ≥ 4.5:1. Re-verify after any token change.
- Status colors never rely on hue alone — paired with icons or text.

## Reduced motion

- `@media (prefers-reduced-motion: reduce)` shrinks animations to ~0ms.

## Forms

- Every `<Input>` has an associated `<Label htmlFor>`.
- Zod errors surface via `sonner` toast + inline aria-live region.
- `autoComplete` set on email/password fields.

## Icons

- Decorative icons get `aria-hidden`.
- Icon-only buttons get `aria-label` (sign-out, close, etc.).

## Viewport

- `min-h-dvh` (not `min-h-screen`) on full-height surfaces.
- Mobile tap targets ≥ 44×44 px via Button defaults.

## Tools

- Browser axe scan run before each release.
- Lighthouse a11y score target: 100.
