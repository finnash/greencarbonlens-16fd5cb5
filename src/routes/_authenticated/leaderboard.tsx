import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardTable } from "@/components/challenges/LeaderboardTable";
import { getLeaderboard } from "@/lib/challenges.functions";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard · CarbonLens" },
      {
        name: "description",
        content:
          "Anonymous CarbonLens community leaderboard — kg CO₂e saved this week and all-time.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { user } = Route.useRouteContext();
  const fetchLb = useServerFn(getLeaderboard);
  const [metric, setMetric] = useState<"week" | "all">("week");
  const lb = useQuery({ queryKey: ["leaderboard"], queryFn: () => fetchLb() });
  const rows = lb.data?.rows ?? [];

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
            <Link to="/challenges">Challenges</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Anonymized by display name. Ranked by kg CO₂e saved from completed challenges.
        </p>

        <Tabs value={metric} onValueChange={(v) => setMetric(v as "week" | "all")} className="mt-6">
          <TabsList>
            <TabsTrigger value="week">This week</TabsTrigger>
            <TabsTrigger value="all">All time</TabsTrigger>
          </TabsList>
          <TabsContent value="week" className="mt-4">
            <LeaderboardTable rows={rows} metric="week" currentUserId={user.id} />
          </TabsContent>
          <TabsContent value="all" className="mt-4">
            <LeaderboardTable rows={rows} metric="all" currentUserId={user.id} />
          </TabsContent>
        </Tabs>

        {lb.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading leaderboard…</p>
        ) : null}
      </section>
    </main>
  );
}
