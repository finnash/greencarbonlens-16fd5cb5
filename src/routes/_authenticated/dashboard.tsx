import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, LogOut, MessageSquareText, Sparkles, Trophy, Award } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GLOBAL_AVG_KG_PER_YEAR,
  PARIS_BUDGET_KG_PER_YEAR,
  budgetUsedPct,
  formatKgCo2e,
  sumEmissions,
} from "@/lib/carbon";
import { getMyProfile } from "@/lib/profile.functions";
import { listActivities } from "@/lib/activity.functions";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import logoUrl from "@/assets/carbonlens-logo.png";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · CarbonLens" },
      { name: "description", content: "Your monthly carbon footprint at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const fetchProfile = useServerFn(getMyProfile);
  const fetchActivities = useServerFn(listActivities);
  const { data, isLoading } = useQuery({
    queryKey: ["my-profile", user.id],
    queryFn: () => fetchProfile(),
  });
  const { data: actData } = useQuery({
    queryKey: ["activities", user.id],
    queryFn: () => fetchActivities({ data: {} }),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const profile = data?.profile;
  const baseline = Number(profile?.baseline_kg_co2e_year ?? 0);
  const pct = budgetUsedPct(baseline);
  const activities = actData?.activities ?? [];
  const last30Total = sumEmissions(activities);

  return (
    <main id="main-content" className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <img
              src={logoUrl}
              alt=""
              aria-hidden
              width={32}
              height={32}
              className="size-8 rounded-md"
            />
            <span>CarbonLens</span>
          </div>
          <div className="flex items-center gap-2">
            {profile?.onboarding_completed ? <QuickLogSheet userId={user.id} /> : null}
            {profile?.onboarding_completed ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/coach" aria-label="Open AI Coach">
                  <MessageSquareText className="size-4" />
                  <span className="hidden sm:inline">Coach</span>
                </Link>
              </Button>
            ) : null}
            {profile?.onboarding_completed ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/insights" aria-label="Open insights">
                  <BarChart3 className="size-4" />
                  <span className="hidden sm:inline">Insights</span>
                </Link>
              </Button>
            ) : null}
            {profile?.onboarding_completed ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/challenges" aria-label="Open challenges">
                  <Award className="size-4" />
                  <span className="hidden sm:inline">Challenges</span>
                </Link>
              </Button>
            ) : null}
            {profile?.onboarding_completed ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/leaderboard" aria-label="Open leaderboard">
                  <Trophy className="size-4" />
                  <span className="hidden sm:inline">Leaderboard</span>
                </Link>
              </Button>
            ) : null}
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile?.display_name ? `Hi, ${profile.display_name}` : "Your dashboard"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your annual carbon footprint at a glance.
        </p>

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border/70 bg-card p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-8 w-32" />
                <Skeleton className="mt-4 h-2 w-full" />
              </div>
            ))}
          </div>
        ) : !profile?.onboarding_completed ? (
          <div className="mt-8 rounded-xl border border-border/70 bg-card p-6">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-md bg-primary/15 text-primary"
              >
                <Sparkles className="size-4" />
              </span>
              <div className="flex-1">
                <h2 className="text-base font-semibold tracking-tight">
                  Finish onboarding to see your baseline
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Five quick questions — under a minute — to estimate your yearly footprint.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link to="/onboarding">Start onboarding</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Annual baseline" value={formatKgCo2e(baseline)} suffix="CO₂e / yr" />
              <StatCard
                label="vs. Paris 1.5 °C budget"
                value={`${pct}%`}
                suffix={`of ${formatKgCo2e(PARIS_BUDGET_KG_PER_YEAR)}`}
              />
              <StatCard
                label="vs. global average"
                value={`${Math.round((baseline / GLOBAL_AVG_KG_PER_YEAR) * 100)}%`}
                suffix={`of ${formatKgCo2e(GLOBAL_AVG_KG_PER_YEAR)}`}
              />
              <StatCard
                label="Last 30 days logged"
                value={formatKgCo2e(last30Total)}
                suffix={`${activities.length} entr${activities.length === 1 ? "y" : "ies"}`}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TrendChart activities={activities} days={30} />
              </div>
              <CategoryBreakdown activities={activities} />
            </div>

            <div className="mt-6">
              <RecentActivity userId={user.id} activities={activities} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{suffix}</p>
    </div>
  );
}
