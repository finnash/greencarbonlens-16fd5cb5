import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { MyChallenges } from "@/components/challenges/MyChallenges";
import { listChallenges, listMyChallenges } from "@/lib/challenges.functions";

export const Route = createFileRoute("/_authenticated/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges · CarbonLens" },
      {
        name: "description",
        content: "Join short, science-backed challenges and cut real kg CO₂e from your footprint.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChallengesPage,
});

function ChallengesPage() {
  const { user } = Route.useRouteContext();
  const list = useServerFn(listChallenges);
  const listMine = useServerFn(listMyChallenges);
  const cat = useQuery({ queryKey: ["challenges"], queryFn: () => list() });
  const mine = useQuery({ queryKey: ["my-challenges", user.id], queryFn: () => listMine() });

  const catalog = cat.data?.challenges ?? [];
  const joinedIds = new Set((mine.data?.entries ?? []).filter((e) => e.status === "active").map((e) => e.challenge_id));

  return (
    <main id="main-content" className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard" aria-label="Back to dashboard">
              <ArrowLeft className="size-4" aria-hidden />
              <span>Dashboard</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/leaderboard">Leaderboard</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Challenges</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Pick a challenge, finish it, watch your annual budget breathe.
        </p>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Active
        </h2>
        <div className="mt-3">
          {mine.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <MyChallenges entries={mine.data?.entries ?? []} catalog={catalog} />
          )}
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Available
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cat.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            catalog.map((c) => (
              <ChallengeCard key={c.id} challenge={c} joined={joinedIds.has(c.id)} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}