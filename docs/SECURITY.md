# Security Policy

## Reporting a vulnerability

Please report security issues privately to **security@carbonlens.app**.
Do **not** open a public GitHub issue for suspected vulnerabilities.
We aim to acknowledge reports within 2 business days and ship a fix or
mitigation within 30 days for high-severity findings.

## Threat model

CarbonLens is a personal carbon-footprint tracker. The data we hold is
lifestyle-adjacent (commute habits, diet category, electricity usage,
flights per year). It is not regulated PHI/PII but is treated as private.

| Asset                         | Owner    | Exposure                                    |
| ----------------------------- | -------- | ------------------------------------------- |
| User profile + quiz answers   | user     | Row-Level Security (RLS) per `auth.uid()`   |
| Activity log (`activities`)   | user     | RLS per `auth.uid()`                        |
| Coach chat history            | user     | RLS per `auth.uid()`                        |
| Challenge progress            | user     | RLS per `auth.uid()`                        |
| Leaderboard view              | public-ish | SECURITY INVOKER view, handle-only, no email |
| `LOVABLE_API_KEY`             | platform | Server-only secret, never sent to client    |

## Controls

- **AuthN**: Supabase Auth (email/password + Google OAuth). No anonymous writes.
- **AuthZ**: Postgres RLS on every user-owned table. `service_role` is only
  used inside `*.server.ts` helpers and never from a `*.functions.ts`
  top-level import.
- **Input validation**: every `createServerFn` uses a `.inputValidator(...)`
  Zod schema. Server-side compute (e.g. `kg_co2e`) is recomputed from a
  trusted local factor table — clients cannot inflate or deflate metrics.
- **Transport**: HTTPS-only via the Lovable edge.
- **Headers**: a `Content-Security-Policy` meta tag scopes scripts/styles
  to self and the Supabase host. Toaster + chat surfaces use `aria-live`.
- **Secrets**: `LOVABLE_API_KEY`, Supabase service-role and DB URL live in
  the platform secret store. None are exposed to the client bundle.
- **Dependencies**: Dependabot weekly + `bun audit` in CI gating PRs.

## What is intentionally public

- The marketing landing page (`/`).
- The leaderboard handle + saved kg of opted-in users. Handles are
  user-chosen and contain no email or location.

## What must never happen

- A user reads another user's `activities`, `coach_messages`, or
  `user_challenges` rows.
- A client sends a custom `kg_co2e` value and has it stored verbatim.
- An unauthenticated request mutates any `user_*` row.
- A privileged server function executes without verifying `requireSupabaseAuth`
  and the appropriate role check.