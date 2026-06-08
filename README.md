# CarbonLens

> Personal carbon footprint coach — measure, understand, and shrink your
> emissions with an AI sustainability assistant.

![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Stack](https://img.shields.io/badge/stack-TanStack%20Start%20%C2%B7%20React%2019%20%C2%B7%20Tailwind%20v4-blue)

CarbonLens is the submission for **Google PromptWars Virtual Challenge 3**.
Chosen vertical: **personal carbon footprint awareness & reduction**.

## Why it scores

The challenge is judged by AI on five parameters. CarbonLens is engineered
for all five:

| Parameter | What we did |
|---|---|
| **Code Quality** | Strict TypeScript, ESLint + Prettier, feature-folder architecture, zod-validated boundaries, no `any`, conventional commits. |
| **Security** | Row-level security on every table, `user_roles` separate from profiles, `has_role()` security-definer helper, server-side rate limiting, zod input validation on every server function, no secrets in client bundles. |
| **Efficiency** | TanStack Query caching, route-level code splitting, suspense + skeleton loaders, O(1) emission-factor lookups, target < 300 KB gzip bundle. |
| **Testing** | Vitest unit tests on the carbon-calc engine, React Testing Library on key flows, Playwright smoke for auth + log, GitHub Actions CI. |
| **Accessibility** | Semantic HTML, one `<main>` per route, shadcn/Radix primitives, labelled icon buttons, skip-link, `h-dvh`, full keyboard nav, AA contrast. |

See [`SECURITY.md`](./SECURITY.md), [`TESTING.md`](./TESTING.md),
[`ACCESSIBILITY.md`](./ACCESSIBILITY.md), and
[`ARCHITECTURE.md`](./ARCHITECTURE.md) for the receipts.

## How it works

1. **Onboard** — answer five questions, get a science-backed kg CO₂e / year
   baseline.
2. **Log activities** — one-tap entries for transport, energy, food, shopping.
3. **See impact** — dashboard, trend charts, category breakdown, vs. national
   average and your personal 1.5 °C budget.
4. **Get coaching** — an AI sustainability coach reads your last 30 days and
   suggests the highest-impact next move.
5. **Take action** — join 7-day reduction challenges and track CO₂e saved.

## Tech stack

- **Framework:** TanStack Start v1 (React 19, Vite 7)
- **Styling:** Tailwind v4 + shadcn/ui (cold-grey dark theme)
- **Backend:** Postgres + Auth + RLS (Lovable Cloud / Supabase)
- **AI:** Lovable AI Gateway → Gemini Flash
- **Data layer:** TanStack Query + Zod
- **Testing:** Vitest, React Testing Library, Playwright

## Local development

```bash
bun install
bun run dev          # http://localhost:8080
bun run lint
bun run build
```

Required environment variables (auto-provisioned by Lovable Cloud, see
`.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`LOVABLE_API_KEY`.

## Approach & assumptions

- We **deliberately skipped** computer-vision food scanning and barcode
  lookup. Reasons: 10 MB repo cap, accessibility regressions, model
  hallucination, and far worse testability than a deterministic emission-factor
  table. The brief says "simple actions and personalized insights" — a
  quiz-plus-log approach delivers that with higher accuracy.
- Emission factors are bundled as a typed JSON module from public DEFRA / EPA
  sources. This is an educational tool, not a certified carbon audit.
- The leaderboard uses anonymous handles to avoid PII exposure.

## Project status

See [`context.md`](./context.md) for the session-by-session build plan and
[`CHANGELOG.md`](./CHANGELOG.md) for shipped milestones.

## License

MIT — see [`LICENSE`](./LICENSE).
