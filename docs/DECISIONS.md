# Architecture Decision Records

Lightweight ADRs in the [MADR](https://adr.github.io/madr/) style. Each
record states the context, the decision, the alternatives we considered,
and the consequences we accept.

---

## ADR 0001 — TanStack Start over Next.js

- **Status:** Accepted (Session 1)
- **Context:** The submission must be a single, fast, accessible PWA with
  server-rendered marketing pages and tight client-side navigation. Bundle
  budget < 300 KB gzip. Strict deadline.
- **Decision:** TanStack Start v1 (React 19 + Vite 7) with file-based
  routing.
- **Alternatives:** Next.js App Router (heavier bundles, more accidental
  complexity for our needs); plain Vite + React Router (no SSR / SEO).
- **Consequences:** Excellent SSR + typed routing. We accept a smaller
  ecosystem of third-party recipes vs. Next.js.

## ADR 0002 — Lovable Cloud (managed Supabase) for backend

- **Status:** Accepted (Session 1)
- **Context:** Need Postgres + Auth + RLS + AI Gateway with zero ops.
- **Decision:** Lovable Cloud. RLS enforced on every public-schema table;
  user roles live in a separate `user_roles` table consulted by a
  `SECURITY DEFINER has_role()` function.
- **Alternatives:** Firebase (no SQL / RLS story), self-hosted Postgres
  (operational burden), PlanetScale (no Auth).
- **Consequences:** We lean hard on RLS for security boundaries. Tests
  must mock the supabase client; integration tests against a live DB are
  out of scope for this submission.

## ADR 0003 — Trust the server, never the client, for `kg_co2e`

- **Status:** Accepted (Session 3)
- **Context:** Client-supplied emission values could be inflated to game
  the leaderboard, or deflated to hide impact.
- **Decision:** Server functions accept only `factor_slug` + `amount`;
  `kg_co2e` is recomputed in `src/lib/carbon/calculator.ts` against the
  hard-coded factor table on every insert.
- **Alternatives:** Trust the client and re-check on read; sign the
  payload client-side.
- **Consequences:** A single source of truth for emissions math. Tests
  cover the factor table and computation; tampered inserts cannot affect
  the leaderboard.

## ADR 0004 — Streaming chat via a TanStack Start server route

- **Status:** Accepted (Session 4)
- **Context:** The AI Coach needs token-by-token streaming and Bearer-auth
  with Supabase tokens from `useChat`.
- **Decision:** Raw server route at `src/routes/api/chat.ts` instead of a
  `createServerFn`, because the AI SDK UI transport expects an HTTP POST
  returning a streaming `Response`.
- **Alternatives:** Server function returning a string (no streaming);
  Supabase Edge Function (extra network hop, less type safety).
- **Consequences:** Rate limiting and auth verification are implemented in
  the route handler. Tests cover the rate-limit table; the LLM is mocked
  for unit tests.

## ADR 0005 — Pure What-If simulator

- **Status:** Accepted (Session 5)
- **Context:** The Insights page needs an interactive lever panel that
  projects annual emissions in real time. Must be fast and predictable.
- **Decision:** `src/lib/carbon/simulator.ts` is a pure function over
  `(QuizAnswers, ScenarioLevers) → ScenarioResult`. No I/O, no React.
- **Consequences:** Trivially testable; reusable from the AI Coach
  grounding payload in the future.

## ADR 0006 — Anonymized leaderboard via SECURITY INVOKER view

- **Status:** Accepted (Session 6)
- **Context:** Leaderboard must show progress without leaking PII.
- **Decision:** `public.leaderboard_view` aggregates
  `user_challenges.kg_co2e_saved` joined to `profiles.display_name`,
  defined with `security_invoker = true` so RLS still applies to the
  underlying tables.
- **Alternatives:** Materialized view (stale data, no RLS), RPC function
  (more boilerplate).
- **Consequences:** Only display_name leaves the database, and only for
  rows the caller can already see via RLS. No new PII surface.