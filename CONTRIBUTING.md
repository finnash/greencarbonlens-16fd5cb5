# Contributing to CarbonLens

Thanks for your interest in improving CarbonLens. We aim to keep the bar
high on **code quality, security, accessibility, and testing** — every PR
should leave the project in a better state on all four axes.

## Getting started

```bash
bun install
bun run dev      # local preview at http://localhost:8080
bun run test     # vitest unit tests
bun run lint     # ESLint + Prettier
```

Node 20+ (see `.nvmrc`). Bun is the supported package manager.

## Branching & commits

- Branch from `main`: `feat/<scope>`, `fix/<scope>`, `docs/<scope>`, `chore/<scope>`.
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(coach): stream gemini responses`
  - `fix(quiz): clamp commute_km_per_day to 0..500`
  - `test(simulator): cover renewable lever edge cases`
- Keep commits focused. One logical change per commit.

## Pull request checklist

Before requesting review, make sure:

- [ ] `bun run lint` is clean.
- [ ] `bun run test` is green and coverage thresholds hold.
- [ ] New user-facing components have `aria-label`s on icon buttons.
- [ ] New server functions validate input with **zod** and never trust
      client-supplied `kg_co2e`.
- [ ] New tables have explicit `GRANT` statements and `ENABLE RLS` plus
      policies in the same migration.
- [ ] `CHANGELOG.md` has an entry under `## [Unreleased]`.
- [ ] Public functions in `src/lib/**` carry a JSDoc block.

## Architecture decisions

Non-trivial decisions are recorded as ADRs in [`docs/DECISIONS.md`](./docs/DECISIONS.md).
If your change picks a different tradeoff, add or update an ADR in the same PR.

## Security

Report vulnerabilities privately. Do **not** open public issues for them.
See [`SECURITY.md`](./SECURITY.md).

## License

By contributing you agree your code is released under the project's
[MIT license](./LICENSE).