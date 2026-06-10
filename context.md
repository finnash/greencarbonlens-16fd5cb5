# CarbonLens — Project Context

> This file is the single source of truth for what we're building, why, and
> how every decision ladders up to winning PromptWars Virtual Challenge 3.
> Update it whenever scope, stack, or scoring rationale changes.

## 1. The Challenge

- **Event:** Google PromptWars — Virtual Challenge 3 (June 8 – June 21, 2026 IST)
- **Brief (verbatim):** *"Design a solution that helps individuals understand,
  track, and reduce their carbon footprint through simple actions and
  personalized insights."*
- **Submission rules:** public GitHub repo < 10 MB, single branch, max 3
  attempts, time-decay multiplier on score (earlier ⇒ higher).
- **AI evaluation parameters:** Code Quality, Security, Efficiency, Testing,
  Accessibility.
- **Author goal:** rank in the top 400 (PromptCredits + Google swag).

## 2. The Product — CarbonLens

A personal carbon footprint awareness and coaching platform. Mobile-first PWA
with a clean cold-grey dark UI.

### Core surfaces
1. **Landing** — public marketing page (SSR + SEO).
2. **Auth** — email/password + Google (managed Lovable OAuth broker).
3. **Onboarding quiz** *(Session 2)* — 5 questions → baseline kg CO₂e/year.
4. **Dashboard** — current-month emissions, vs. national average, vs. personal
   1.5 °C budget, streak counter.
5. **Quick Log** — one-tap activity entries (drive, eat, electricity, flight).
   Each row stores `kg_co2e` computed from `activity_factors`.
6. **AI Coach** — chat backed by Lovable AI Gateway (Gemini Flash) reading the
   user's last 30 days of activities for personalized tips.
7. **Insights** — category breakdown, trend chart, what-if simulator.
8. **Challenges** — predefined 7-day reduction challenges; track CO₂e saved.
9. **Leaderboard** — anonymous handles, weekly resets.

### Out of scope (and why)
- **Computer-vision food scanning / barcode lookup.** Inflates bundle past 10
  MB, fails accessibility, hallucinates results, kills the Code Quality and
  Testing scores. The quiz + log path is more defensible.
- **Payments, multi-tenant orgs, mobile-native apps.** Not in the brief.

## 3. Why this scores high on the 5 AI parameters

| Parameter | Engineering choice |
|---|---|
| **Code Quality** | Strict TS, ESLint + Prettier, feature folders, zod at every boundary, no `any`, conventional commits, JSDoc on public APIs. |
| **Security** | RLS on every public-schema table, `user_roles` table separate from `profiles`, `has_role()` SECURITY DEFINER, zod input validation on every serverFn, server-side rate-limit table, no secrets in client bundles. |
| **Efficiency** | TanStack Query caching, route-level code splitting, O(1) factor lookups, memoized selectors, lazy charts, target bundle < 300 KB gzip. |
| **Testing** | Vitest unit tests on `src/lib/carbon/` (target ≥ 80 % coverage), React Testing Library on key flows, Playwright smoke on auth + log. GitHub Actions runs lint + typecheck + tests on every push. |
| **Accessibility** | Semantic HTML, single `<main>` per route, shadcn/Radix primitives, all icon buttons `aria-label`-ed, skip-link, `h-dvh`, `prefers-reduced-motion`, color-contrast AA, full keyboard nav. |

## 4. Stack

- **Framework:** TanStack Start v1 (React 19 + Vite 7), file-based routing
- **Styling:** Tailwind v4 + shadcn/ui, cold-grey dark theme by default
- **Backend:** Lovable Cloud (Supabase under the hood) — Postgres, Auth, RLS
- **AI:** Lovable AI Gateway → `google/gemini-3-flash-preview` (no API key)
- **State:** TanStack Query
- **Validation:** Zod everywhere
- **Charts:** Recharts (lazy-loaded)
- **Testing:** Vitest, React Testing Library, Playwright (CI)
- **CI:** GitHub Actions (lint, typecheck, test, build)

## 5. Database schema (Session 1 — done)

- `profiles` — 1:1 with `auth.users`, auto-created via `handle_new_user` trigger
- `user_roles` — separate roles table + `has_role()` security-definer helper
- `activity_factors` — emission-factor catalogue (public read)
- `activities` — per-user activity log with computed `kg_co2e`
- `challenges` — public reduction-challenge templates
- `user_challenges` — join state per user
- `coach_messages` — AI chat history (per user, RLS-scoped)
- `rate_limits` — server-only throttling (no RLS policy by design)

Every table has explicit `GRANT`s and RLS policies scoped to `auth.uid()`.
See `SECURITY.md` for the threat model.

## 6. Build phases (status)

- [x] **Session 1 — Foundation:** Cloud, schema, RLS, auth (email + Google),
      cold-grey theme, landing, protected dashboard skeleton, docs, CI.
- [x] **Session 2 — Calculator + onboarding quiz:** seeded factors, pure
      `src/lib/carbon/` (calc + quiz + zod), Vitest (19 tests, 80% threshold),
      `/onboarding` flow, dashboard baseline stats, blue accent theme.
- [x] **Session 3 — Dashboard charts + quick-log sheet:** logo + hero banner
      (Gemini 3 image), Recharts 30-day trend, category breakdown bars,
      recent-activity list with delete, `QuickLogSheet` with live preview,
      `activity.functions.ts` (zod-validated log/list/delete + tests),
      README upgraded to a fully decorated submission cover.
- [x] **Session 4 — AI Coach (streaming):** Lovable AI Gateway provider
      (`ai-gateway.server.ts`), `/api/chat` streaming route with Supabase
      Bearer auth, 30 msg/hr rate limit via `rate_limits`, grounding prompt
      from last 30 days of activities + profile baseline, message persistence
      to `coach_messages` via `onFinish`. `/coach` page using `useChat` +
      `DefaultChatTransport`, markdown rendering, suggested prompts, clear
      history, history restore. Coach button added to dashboard header.
- [ ] **Session 5 — Insights + what-if simulator**
- [ ] **Session 6 — Challenges + leaderboard**
- [ ] **Session 7 — Polish, a11y audit, perf, README final**

## 7. Submission deliverables

- `README.md` (vertical, approach, screenshots, run/test/deploy)
- `context.md` (this file)
- `ARCHITECTURE.md`, `SECURITY.md`, `TESTING.md`, `ACCESSIBILITY.md`
- `CHANGELOG.md`, `LICENSE` (MIT)
- `.github/workflows/ci.yml` — green badge in README
- LinkedIn post link (added to README after launch)
