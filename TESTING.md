# Testing

## What we test (target by milestone)

| Layer | Tool | Target coverage |
|---|---|---|
| Pure-TS carbon engine (`src/lib/carbon/`) | Vitest | ≥ 80 % lines |
| Server functions (`*.functions.ts`) | Vitest + mocked Supabase | All happy paths + auth-failure path |
| Critical UI flows (auth, log, coach) | React Testing Library | Render + key interactions |
| End-to-end smoke (auth → log → dashboard) | Playwright | 1 happy-path per release |

## Running tests

```bash
bun run test         # vitest watch (added in Session 2)
bun run test:run     # CI mode
bun run test:e2e     # Playwright (CI only)
```

## CI

`.github/workflows/ci.yml` runs on every push and PR:

1. `bun install --frozen-lockfile`
2. `bun run lint`
3. `bunx tsc --noEmit`
4. `bun run test:run` (added in Session 2)
5. `bun run build`

Any failure blocks the PR.

## Conventions

- One `*.test.ts` file per source module, colocated.
- No snapshot tests for components — they rot fast and tell us little.
- Mock Supabase via factory helpers in `src/test/mocks/`.
