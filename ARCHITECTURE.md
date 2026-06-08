# Architecture

## High-level

```text
┌─────────────┐      ┌────────────────────┐      ┌──────────────────┐
│  Browser    │ ───▶ │  TanStack Start    │ ───▶ │  Lovable Cloud   │
│  (React 19) │      │  SSR + serverFns   │      │  Postgres + Auth │
└─────────────┘      └─────────┬──────────┘      └──────────────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │  Lovable AI Gateway│
                     │   (Gemini Flash)   │
                     └────────────────────┘
```

## Folder layout

```text
src/
├── components/        # shadcn/ui primitives + feature components
├── hooks/             # cross-feature React hooks
├── integrations/
│   ├── lovable/       # managed OAuth broker
│   └── supabase/      # auto-generated DB client + auth middleware
├── lib/
│   ├── carbon/        # pure-TS emission-factor engine (unit-tested)
│   └── *.functions.ts # createServerFn RPCs (client-safe imports)
├── routes/
│   ├── __root.tsx     # shell + meta
│   ├── index.tsx      # public landing
│   ├── auth.tsx       # email + Google sign-in
│   └── _authenticated/
│       └── *.tsx      # protected routes (dashboard, log, coach, ...)
├── styles.css         # Tailwind v4 + cold-grey design tokens
└── start.ts           # server-side middleware registration
```

## Data flow

1. **Client → serverFn:** components call `useServerFn(fn)` or query loaders
   call `fn()`. `attachSupabaseAuth` middleware adds the user's bearer token.
2. **serverFn → DB:** `requireSupabaseAuth` middleware validates the token,
   injects an authenticated Supabase client, and RLS applies as the user.
3. **serverFn → AI:** the coach serverFn assembles `last_30d_activities` +
   profile baseline → sends to Gemini Flash via Lovable AI Gateway.
4. **DB → client:** TanStack Query caches results; suspense + skeletons cover
   loading states.

## Routing

- Public, SSR-on, SEO-friendly: `/`, `/auth`
- Protected (managed `ssr: false` layout, redirects to `/auth` if not signed
  in): everything under `_authenticated/`

## Error & not-found boundaries

- `__root.tsx` registers `notFoundComponent`, `errorComponent`, and reports
  uncaught errors via `reportLovableError`.
- Every loader-bearing route inherits these defaults; per-route boundaries
  added as we scale.
