# Deployment

CarbonLens is deployed continuously via Lovable. Every published version is a
full TanStack Start build running on the Cloudflare Workers edge runtime, with
Postgres + Auth + AI Gateway provided by Lovable Cloud.

## Environments

| Environment | URL pattern | Triggered by |
|-------------|-------------|--------------|
| Preview     | `https://id-preview--<id>.lovable.app` | Every save in the editor |
| Production  | `https://<slug>.lovable.app` | Manual publish |

The custom domain is not yet configured. Public URL: `https://greencarbonlens.lovable.app`.

## Build pipeline

1. `bun install`
2. `bun run lint` (CI gate)
3. `bun run test` (CI gate)
4. `bun run build` (Vite + TanStack Start router plugin → Workers bundle)
5. Lovable publish step uploads the bundle and rotates the running version.

## Database migrations

SQL files in `supabase/migrations/` are applied in order against the project's
Postgres instance. Every migration is **forward-only** — never edit a
previously committed file; add a new one instead.

## Secrets

All runtime secrets are provided by Lovable Cloud and surfaced as server-side
`process.env.*` variables. Nothing sensitive is exposed to the browser.

| Key | Where it's used |
|-----|-----------------|
| `LOVABLE_API_KEY` | Server-only AI Gateway client (`src/lib/ai-gateway.server.ts`) |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | Server-side Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client (server-only, never imported by route files at module scope) |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser client (publishable, RLS enforced) |

## Rollback

Use the Lovable history view to roll back to any previous published version.
Database migrations are not automatically rolled back; if a schema change
needs to be reversed, ship a new migration that undoes it.