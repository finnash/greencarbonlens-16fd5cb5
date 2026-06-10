import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, LineChart, Sparkles, Trophy, ShieldCheck, Gauge } from "lucide-react";
import logoUrl from "@/assets/carbonlens-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CarbonLens — Personal carbon footprint coach" },
      {
        name: "description",
        content:
          "Understand, track, and reduce your carbon footprint with an AI sustainability coach, smart activity logging, and reduction challenges.",
      },
      { property: "og:title", content: "CarbonLens — Personal carbon footprint coach" },
      {
        property: "og:description",
        content:
          "Understand, track, and reduce your carbon footprint with an AI sustainability coach and reduction challenges.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main id="main-content" className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <img
              src={logoUrl}
              alt=""
              aria-hidden
              width={32}
              height={32}
              className="size-8 rounded-md"
            />
            <span>CarbonLens</span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-2 text-sm">
            <Link
              to="/auth"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-primary" />
          Built for PromptWars Virtual Challenge 3
        </div>
        <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          See your carbon footprint. <span className="text-primary">Shrink it on autopilot.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          CarbonLens turns everyday actions — driving, eating, heating, shopping — into clear,
          science-backed CO₂e numbers. An AI sustainability coach reads your patterns and gives you
          the next best move to cut emissions.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start tracking — it's free
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            How it works
          </a>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="features-heading"
        className="border-t border-border/60 bg-card/30"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 id="features-heading" className="text-2xl font-semibold tracking-tight">
            A complete carbon-awareness platform
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Five connected surfaces, one goal: measurable reductions.
          </p>
          <ul role="list" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-border"
              >
                <div
                  aria-hidden
                  className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary"
                >
                  <f.icon className="size-4" />
                </div>
                <h3 className="mt-4 text-sm font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CarbonLens. Open-source MIT.</p>
          <p>Emission factors: DEFRA / EPA / IPCC AR6. Educational tool, not a certified audit.</p>
        </div>
      </footer>
    </main>
  );
}

const FEATURES = [
  {
    icon: Gauge,
    title: "Instant footprint baseline",
    body: "Answer five questions and get a science-backed kg CO₂e/year baseline you can compare against your country and the 1.5 °C personal budget.",
  },
  {
    icon: Sparkles,
    title: "AI sustainability coach",
    body: "A private, context-aware assistant that reads your activity history and suggests the highest-impact next step.",
  },
  {
    icon: LineChart,
    title: "Quick activity log",
    body: "One-tap entries for transport, energy, food, and shopping — each scored locally against published emission factors.",
  },
  {
    icon: Trophy,
    title: "Reduction challenges",
    body: "Join 7-day challenges like meatless week or transit-only commute. Track CO₂e saved with measurable proof.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by default",
    body: "Your data is yours. Strict row-level security, no third-party trackers, and an anonymous public leaderboard.",
  },
  {
    icon: Leaf,
    title: "What-if simulator",
    body: "Tweak sliders — switch to EV, cut flights in half — and see projected annual savings before you commit.",
  },
] as const;
