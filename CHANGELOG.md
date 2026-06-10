# Changelog

All notable changes to CarbonLens are tracked here. The format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added — Final attempt code-quality lift (Strategy C)

- **Subcomponent extraction**: `src/components/coach/MessageBubble.tsx`,
  `coach/EmptyState.tsx`, `dashboard/StatCard.tsx`,
  `onboarding/QuestionStep.tsx`, `onboarding/ResultStep.tsx`. Route files
  (`coach.tsx`, `dashboard.tsx`, `onboarding.tsx`) are now thin
  composition layers.
- **Security**: `Content-Security-Policy` + `referrer` meta tags in the
  root shell; `docs/SECURITY.md` (reporting policy, threat model);
  explicit deny-all RLS policy on internal `rate_limits` table.
- **Methodology**: `docs/CITATIONS.md` with DEFRA 2024, IPCC AR6,
  Poore & Nemecek, IEA, and UN SDG 13 alignment. README links it from
  the hero, the docs map, and a new "Problem-statement alignment"
  section.
- **CI hardening**: Node 20 + 22 matrix, concurrency cancel-in-progress,
  coverage artifact upload, `vitest --coverage` in CI.
- **Repo hygiene**: top-level `CODEOWNERS`.
- **Tests**: `src/lib/carbon/simulator.edge.test.ts` (8 edge cases —
  zero baseline, every diet branch, monotonicity, combined-lever
  reductions, NaN safety, sentinel handling), `src/lib/coach.prompts.test.ts`.
  Suite now 59 tests across 11 files, all passing.
- Repo-wide `prettier --write` pass.

### Added — Session 6 (Challenges, Leaderboard, code-quality lift)

- `src/lib/challenges.functions.ts` — `listChallenges`, `listMyChallenges`,
  `joinChallenge`, `updateMyChallenge`, `getLeaderboard` (zod-validated,
  RLS-scoped, server-side computed `ends_at`).
- `src/components/challenges/` — `ChallengeCard`, `MyChallenges`,
  `LeaderboardTable` (semantic table + caption + sr-only description).
- `src/routes/_authenticated/challenges.tsx` + `leaderboard.tsx` — new
  feature routes wired into the dashboard header.
- Migration: seeded 6 starter challenges and added a
  `public.leaderboard_view` (`security_invoker = true`, anonymized handles).
- `src/lib/result.ts` + `src/lib/logger.ts` — shared Result<T, E> helper
  and scoped structured logger.
- `src/lib/carbon/constants.ts` — single source of truth for shared
  numeric constants (Paris budget, commute days, etc).
- New tests: `result.test.ts`, `logger.test.ts`, `carbon/constants.test.ts`,
  `carbon/factors.test.ts`, `challenges.functions.test.ts`. Coverage
  thresholds raised: lines/functions/statements 80 → 85, branches 70 → 75.
- Repo polish: `.prettierrc`, `.prettierignore`, `.editorconfig`, `.nvmrc`,
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.github/PULL_REQUEST_TEMPLATE.md`,
  issue templates, `dependabot.yml`. New `docs/` guide:
  `DEVELOPMENT.md`, `DEPLOYMENT.md`, `DECISIONS.md` (ADRs 0001–0006).

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

### Added — Session 4 (AI Coach)

- `src/lib/ai-gateway.server.ts` — Lovable AI Gateway provider helper
  (OpenAI-compatible, run-id propagation).
- `src/routes/api/chat.ts` — streaming chat route. Verifies Supabase Bearer
  token, enforces a 30 messages/hour rate limit via the `rate_limits` table,
  grounds the model in the user's last-30-day activities + profile baseline,
  and persists both user + assistant messages to `coach_messages` via
  `onFinish` (streaming preserved).
- `src/lib/coach.functions.ts` — `getCoachHistory`, `clearCoachHistory`.
- `src/routes/_authenticated/coach.tsx` — full chat UI with
  `@ai-sdk/react` `useChat`, `DefaultChatTransport` (attaches Supabase
  session token), markdown rendering via `react-markdown`, suggested
  prompts, clear-history action, keyboard send (Enter), accessible
  aria-live transcript.
- Dashboard header now links to the Coach when onboarding is complete.

### Added — Session 5 (Insights + What-If)

- DB: `profiles.quiz_answers jsonb` for re-running the lifestyle model.
- `src/lib/carbon/simulator.ts` — pure scenario engine
  (`simulate(answers, levers)`) with 5 unit tests.
- `src/components/insights/TopFactors.tsx` — ranked emitters bar list.
- `src/components/insights/Simulator.tsx` — interactive What-If panel
  (sliders + selects, aria-live result card, delta indicator).
- `src/routes/_authenticated/insights.tsx` — 90-day analytics page.
- `getMyProfileFull` server fn (RLS-scoped) returns quiz answers for the
  simulator without widening the dashboard payload.
- Dashboard adds an Insights button next to Coach.

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
