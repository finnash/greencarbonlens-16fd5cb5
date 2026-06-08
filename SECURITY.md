# Security Model

## Threat model (summary)

| Asset | Threat | Mitigation |
|---|---|---|
| User activity logs | Cross-user read/write | RLS policies scope every query to `auth.uid()`. |
| Auth roles | Privilege escalation via client-tampered profile | Roles live in a separate `user_roles` table; `has_role()` is `SECURITY DEFINER`. |
| AI coach endpoint | Abuse / cost explosion | Per-user `rate_limits` table enforced server-side. |
| Service-role key | Leak via client bundle | Only ever read inside `createServerFn` / server routes. The `client.server.ts` module is excluded from client bundles. |
| Webhook endpoints | Forged calls | Every `/api/public/*` handler verifies a signature before any write. |

## Row-level security

Every public-schema table has RLS enabled and explicit `GRANT`s:

- `profiles`, `activities`, `user_challenges`, `coach_messages` — owner-only
  (`auth.uid() = user_id` for all CRUD operations).
- `activity_factors`, `challenges` — public read (intentional; reference data).
- `user_roles` — read-own for authenticated, full access for `service_role`.
- `rate_limits` — RLS enabled, **no policy** (intentional: only the service
  role and SECURITY DEFINER functions touch this table). Linter reports this
  as an INFO; it's by design.

## SECURITY DEFINER functions

- `handle_new_user()` — auto-creates a `profiles` row on signup. EXECUTE
  revoked from `PUBLIC`, `anon`, `authenticated`; only runs from the
  `auth.users` insert trigger.
- `set_updated_at()` — generic trigger helper. EXECUTE revoked from clients.
- `has_role(_user_id, _role)` — used inside RLS policies. EXECUTE granted to
  `authenticated` (required so RLS policies can call it). Function is
  `STABLE`, reads only the indexed `user_roles` table, and cannot be used to
  escalate privileges. The linter WARN on this function is the documented
  trade-off of the standard Supabase user-roles pattern.

## Input validation

- Every `createServerFn` validates input with Zod, including min/max lengths
  and character allow-lists.
- Client forms validate the same schema before submission.
- External URL parameters always go through `encodeURIComponent`.

## Secrets

- `LOVABLE_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only and never
  reach the browser bundle.
- `.env` is git-ignored; `.env.example` lists only public variable names.

## Dependencies

Dependency scans run in CI (`bun audit` + `npm audit --omit=dev`). High and
critical findings block merges.

## Reporting

Open an issue or email the repository owner with the subject
`[security]` before public disclosure.
