# CarbonLens — Plan to Top PromptWars Challenge 3

## 1. What we're building (the concept)

A **personal carbon footprint awareness & coaching platform** called **CarbonLens**. The challenge brief is intentionally vague ("help individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights") — so we go *wide and useful*, not gimmicky. No barcode scanner or vision needed. The differentiator is an **AI Sustainability Coach** + a clean, fast, accessible PWA.

### Core user flow

1. **Onboarding quiz** (5 questions: home energy, commute, diet, shopping, flights) → instant baseline footprint in kg CO₂e/year using published emission factors (DEFRA/EPA tables — bundled as JSON, no API needed).
2. **Dashboard** — current month CO₂e, vs. national avg, vs. 1.5°C personal budget, streak.
3. **Quick Log** — one-tap activity logging (drove X km, ate beef, ran AC X hrs, flew to Y). Each entry computes CO₂e locally from the factor table.
4. **AI Coach** (Lovable AI Gateway, Gemini Flash) — chat that reads your logs and gives *personalized* reduction tips, weekly plans, and answers "what if I switch to EV?" style questions.
5. **Insights** — charts (category breakdown, trend, top emitters), what-if simulator (sliders → projected savings).
6. **Challenges & Habits** — pick a 7-day challenge ("meatless week", "transit only"), track completion, see CO₂ saved.
7. **Community leaderboard** (anonymous handles) — friendly competition, weekly resets.

This gives us depth without scope creep: ~15–20k LOC across well-factored modules, fully testable, no exotic deps.

## 2. Why this wins on the 5 AI parameters


| Parameter         | How we engineer for it                                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Code Quality**  | Strict TS, ESLint + Prettier configs committed, feature-folder architecture, zod-validated boundaries, JSDoc on public APIs, no `any`, conventional commits, CHANGELOG.                                                                                 |
| **Security**      | Lovable Cloud + RLS on every table, `user_roles` table (never on profile), zod input validation on every serverFn, rate-limit middleware, no secrets in client, CSP-friendly code, dependency scan clean, security headers, audit-logged admin actions. |
| **Efficiency**    | TanStack Query caching, route-level code splitting, suspense + skeletons, memoized selectors, emission-factor lookups O(1), debounced inputs, image lazy-loading, bundle <300KB gzip.                                                                   |
| **Testing**       | Vitest unit tests for all calculators + utils (target 80%+ coverage on `/lib`), React Testing Library for key components, Playwright smoke test for auth + log flow, GitHub Actions CI running lint+typecheck+tests on push.                            |
| **Accessibility** | Semantic HTML, single `<main>`, shadcn/Radix primitives, all icon buttons labeled, focus-visible rings, `prefers-reduced-motion`, `prefers-color-scheme`, color-contrast AA verified, keyboard nav for all flows, skip-link, `lang="en"`, axe clean.    |


## 3. Stack

- **TanStack Start** (already scaffolded) + React 19 + Vite 7
- **Tailwind v4** + **shadcn/ui** — cold grey theme with skeleton loaders everywhere
- **Lovable Cloud** (Supabase) — auth, Postgres, RLS
- **Lovable AI Gateway** — Gemini 2.5 Flash for the Coach (free during preview, no key setup)
- **TanStack Query** for data, **Zod** for validation, **Recharts** for charts
- **Vitest + Testing Library + Playwright** for tests
- **GitHub Actions** — lint, typecheck, test, build on PR

## 4. Design direction

Cold-grey, minimal, data-dense but breathable. Inspired by Linear / Vercel dashboards. Subtle green accent for "good" deltas, amber for warnings. Heavy use of **skeleton loaders** on every async surface. Mobile-first PWA (installable, offline-capable for logging).

## 5. Build phases (session by session)

**Session 1 — Foundation** (this session, after approval)

- Cold-grey design tokens in `styles.css`
- Cloud enabled, schema migration: `profiles`, `user_roles`, `activities`, `activity_factors`, `challenges`, `user_challenges`, `coach_messages` — all with RLS + GRANTs
- Seed `activity_factors` from DEFRA JSON
- Auth (email + Google), `_authenticated` layout
- Root layout, skeleton system, dark cold-grey theme
- `context.md` at repo root documenting everything
- README v1 + CI workflow

**Session 2 — Onboarding + Calculator engine**

- Pure-TS `lib/carbon/` engine with full unit tests
- Onboarding quiz route, baseline persisted

**Session 3 — Dashboard + Quick Log**

- Dashboard with charts, monthly aggregate serverFn
- Quick log sheet, optimistic updates

**Session 4 — AI Coach**

- `coach.functions.ts` streaming serverFn → Gemini Flash with user context
- Chat UI with markdown, message persistence

**Session 5 — Insights + What-If simulator**

- Category breakdown, trend, sliders → projected savings

**Session 6 — Challenges + Habits + Leaderboard**

- Predefined challenge templates, join/track, anonymous leaderboard view

**Session 7 — Polish, a11y audit, perf pass, test coverage push, README finalization, OG images**

## 6. Documentation deliverables (committed in repo)

- `README.md` — chosen vertical, approach, architecture diagram, run/test/deploy, screenshots
- `context.md` — full product spec, scoring rationale (created Session 1)
- `ARCHITECTURE.md` — module map, data flow
- `SECURITY.md` — threat model, RLS policy summary
- `TESTING.md` — what's covered + how to run
- `ACCESSIBILITY.md` — WCAG checklist with pass evidence
- `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE` (MIT)

## 7. Repo hygiene (matches challenge rules)

- Single `main` branch, public repo, <10 MB (no large binaries; AI-generated hero images compressed)
- Conventional commits, clean history
- GitHub Actions badge in README

## 8. Technical notes

- Emission factors stored as a typed JSON module (`src/lib/carbon/factors.ts`) — fast, no runtime fetch, easy to test.
- Coach uses `createServerFn` with `requireSupabaseAuth` middleware; user activities of last 30 days passed as context to the LLM.
- Rate limiter: 20 coach messages/hour/user enforced server-side via a `rate_limits` table.
- PWA manifest + service worker for offline log queue (sync on reconnect).
- No vision/barcode — keeps scope tight, bundle small, evaluator-friendly.

---

**Approve this plan and I'll start Session 1**: cold-grey theme + Cloud schema + auth + `context.md` + README + CI. Each subsequent session is a single approved chunk so we ship fast and stay within the leaderboard's time-decay multiplier.

Some doubts I have before proceeding 

Should we add anything from this

Carbon Footprint Awareness AI App

An app that uses vision processing and artificial intelligence to predict the carbon footprint of various food items that a user presents to the programWhere can I see it?

You can watch our video.

Inspiration

Climate change is one of the largest issues facing our generation and we want to help in any way we can.

What it does

Our application detects food that you eat using the Tensorflow object detection API and displays statistics about how much effect what you're eating has on the planet in order to spread awareness about the effects of producing food. Additionally, we have a backup system in which instead of scanning food, you put in the barcode of the

How we built it

We built this using the Tensorflow object detection API, web scraping in python with beautiful soup, data analysis in R, and a website with HTML, CSS, and Javascript.

Challenges we ran into

There were many times when we had version control issues such as committing from git.

Accomplishments that we're proud of

Training the AI, analyzing data, web scraping, and making the website.

What we learned

VS Code Live Share and Live Server is very good for working on the same code at the same time and watching live changes on localhost for web dev.

What's next for Carbon Footprint Awareness AI App

The big picture is to expand our project to assess the carbon emissions in all places around the globe. Once people can understand the extent of the environmental damage they are doing, they can take action to aid it. To expand our project, we could streamline it for companies and add more data to make our neural network even better. A big portion of the money we receive will go towards social marketing and getting our product maximum outreach in our community and beyond.

&nbsp;

I found this description on devposthttps://devpost.com/software/carbon-footprint-awareness-ai-app

&nbsp;

Url is it the same problem hes solved or built for please check. Also Food scanner or anything is those things needed

&nbsp;

&nbsp;

&nbsp;