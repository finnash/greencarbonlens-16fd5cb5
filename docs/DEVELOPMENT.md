# Development guide

This guide covers day-to-day work on CarbonLens. For why the architecture
looks the way it does, see [`DECISIONS.md`](./DECISIONS.md).

## Prerequisites

- **Node 20+** (see `.nvmrc`).
- **Bun** (the supported package manager).
- A Lovable Cloud project (provides Postgres, Auth, and the AI Gateway).
  Credentials are pre-injected as environment variables — no manual setup.

## Common commands

```bash
bun install
bun run dev             # start Vite dev server
bun run lint            # ESLint + Prettier
bun run test            # Vitest (single run)
bun run test:watch      # Vitest watch mode
bun run test:coverage   # generate coverage report
bun run format          # apply Prettier to all files
bun run build           # production build
bun run build:dev       # development-mode build (used in CI)
```

## Project layout

```text
src/
├── assets/              static images (logo, banner)
├── components/          UI building blocks
│   ├── dashboard/       dashboard widgets (Trend, Breakdown, Recent)
│   ├── insights/        Insights page widgets (Simulator, TopFactors)
│   ├── challenges/      Session 6 widgets
│   └── ui/              shadcn primitives — do not edit by hand
├── hooks/               shared React hooks
├── integrations/        third-party glue (Supabase, Lovable Cloud)
├── lib/
│   ├── carbon/          pure math: factors, calculator, quiz, simulator
│   ├── *.functions.ts   createServerFn entry points
│   ├── *.server.ts      server-only helpers
│   ├── logger.ts        structured logger
│   └── result.ts        Result<T,E> helper
├── routes/              file-based router tree
│   ├── _authenticated/  routes behind the auth gate
│   └── api/             raw HTTP endpoints (e.g. streaming chat)
├── router.tsx
└── styles.css           Tailwind v4 entry
```

## Adding a server function

1. Create or pick a `src/lib/<feature>.functions.ts` file.
2. Define a **zod** schema for inputs. Server-side validate *every* field —
   never trust the client (re-compute `kg_co2e` from the trusted factor table).
3. Use the `requireSupabaseAuth` middleware so the call runs scoped to the
   user's RLS context.
4. Add a unit test exercising the happy path and at least one validation
   failure.

## Adding a database table

Always in one migration, in this exact order:

1. `CREATE TABLE public.<name>(...)`
2. `GRANT ...` (omit `anon` when every policy scopes to `auth.uid()`).
3. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
4. `CREATE POLICY ...`.

Missing `GRANT`s = the Data API returns a permission error and the table
is unreachable from the app.

## Testing strategy

- **Pure logic (`src/lib/carbon/**`)** — exhaustive Vitest tests; this is the
  hot path for emission calculations.
- **Server fns** — exercise zod validation paths against fake input.
- **UI components** — React Testing Library; assert ARIA roles, not styling.

CI runs lint, typecheck, and tests on every push (`.github/workflows/ci.yml`).

## Accessibility

- Single `<main>` per route.
- Every icon-only button has an `aria-label`.
- Color contrast checked against the dark theme tokens in `src/styles.css`.
- Use `h-dvh`, never `h-screen`, for full-height layouts on mobile.

See [`ACCESSIBILITY.md`](../ACCESSIBILITY.md).