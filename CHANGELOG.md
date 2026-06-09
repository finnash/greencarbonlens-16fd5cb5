# Changelog

All notable changes to CarbonLens are tracked here. The format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added — Session 3 (Dashboard + Quick Log)
- `src/assets/carbonlens-logo.png` & `carbonlens-banner.png` (Gemini 3 image
  generation) — wired into landing, dashboard, and README cover.
- `src/lib/activity.functions.ts` — `logActivity`, `listActivities`,
  `deleteActivity` server functions. Zod-validated, slug-checked against the
  trusted local factor table, kg CO₂e recomputed server-side.
- `src/components/QuickLogSheet.tsx` — right-side sheet with category-grouped
  factor picker, amount input, optional notes, live kg CO₂e preview, optimistic
  invalidation, toast feedback.
- `src/components/dashboard/TrendChart.tsx` — Recharts 30-day area chart with
  oklch theme colors and AA-readable tooltip.
- `src/components/dashboard/CategoryBreakdown.tsx` — accessible progress-bar
  category split (ARIA progressbar semantics).
- `src/components/dashboard/RecentActivity.tsx` — last 10 entries with
  delete + toast.
- Dashboard route now reads activities via TanStack Query (`["activities",
  user.id]`) and surfaces "last 30 days logged" stat card.
- README rewritten as a fully decorated submission cover: hero banner,
  badge row, scoring table, architecture diagram, schema table, layout tree.
- `src/lib/activity.functions.test.ts` — 6 new Vitest input-schema tests.

### Added — Session 1 (Foundation)
- Lovable Cloud enabled with auth (email + Google via managed OAuth broker).
- Database schema: `profiles`, `user_roles`, `activity_factors`, `activities`,
  `challenges`, `user_challenges`, `coach_messages`, `rate_limits`.
- RLS policies + explicit GRANTs on every public-schema table.
- `has_role()` security-definer helper for safe role checks inside RLS.
- Auto-provision `profiles` row on signup via trigger.
- Cold-grey dark design system (oklch tokens in `src/styles.css`).
- Public landing page (`/`) with SEO meta + OpenGraph.
- Auth page (`/auth`) — email/password + Continue with Google.
- Protected `_authenticated/` layout (managed `ssr: false` gate).
- Dashboard skeleton (`/dashboard`).
- Documentation: `context.md`, `README.md`, `ARCHITECTURE.md`, `SECURITY.md`,
  `TESTING.md`, `ACCESSIBILITY.md`, `LICENSE` (MIT).
- GitHub Actions CI: lint, typecheck, build on every push.
