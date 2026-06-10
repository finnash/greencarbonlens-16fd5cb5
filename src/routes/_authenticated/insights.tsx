import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { TopFactors } from "@/components/insights/TopFactors";
import { Simulator } from "@/components/insights/Simulator";
import { getMyProfileFull } from "@/lib/profile.functions";
import { listActivities } from "@/lib/activity.functions";
import { formatKgCo2e, sumEmissions, PARIS_BUDGET_KG_PER_YEAR } from "@/lib/carbon";
import type { QuizAnswers } from "@/lib/carbon/types";
import logoUrl from "@/assets/carbonlens-logo.png";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights · CarbonLens" },
      {
        name: "description",
        content:
          "Explore your top emission sources and simulate cuts with the What-If carbon simulator.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const fetchProfile = useServerFn(getMyProfileFull);
  const fetchActivities = useServerFn(listActivities);

  const { data: profileData, isLoading: pLoading } = useQuery({
    queryKey: ["my-profile-full", user.id],
    queryFn: () => fetchProfile(),
  });
  const { data: actData, isLoading: aLoading } = useQuery({
    queryKey: ["activities-90", user.id],
    queryFn: () =>
      fetchActivities({
        data: { since: new Date(Date.now() - 90 * 86_400_000).toISOString(), limit: 500 },
      }),
  });

  const profile = profileData?.profile;
  const activities = actData?.activities ?? [];
  const total90 = sumEmissions(activities);
  const projectedAnnual = (total90 / 90) * 365;
  const baseline = Number(profile?.baseline_kg_co2e_year ?? 0);
  const answers = profile?.quiz_answers as QuizAnswers | undefined;

  return (
    <main id="main-content" className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back to dashboard"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <img
              src={logoUrl}
              alt=""
              aria-hidden
              width={28}
              height={28}
              className="size-7 rounded"
            />
            <span>Insights</span>
          </div>
          <Link
            to="/coach"
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Ask the Coach →
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" aria-hidden />
          <h1 className="text-2xl font-semibold tracking-tight">Your insights</h1>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          90-day trend, top emitters, and a live simulator to explore changes.
        </p>

        {pLoading || aLoading ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat label="Annual baseline" value={formatKgCo2e(baseline)} hint="from your quiz" />
              <Stat
                label="Last 90 days logged"
                value={formatKgCo2e(total90)}
                hint={`${activities.length} activities`}
              />
              <Stat
                label="Projected annual"
                value={formatKgCo2e(projectedAnnual)}
                hint={`vs. Paris ${formatKgCo2e(PARIS_BUDGET_KG_PER_YEAR)} budget`}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TrendChart activities={activities} days={90} />
              </div>
              <CategoryBreakdown activities={activities} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <TopFactors activities={activities} />
              {answers ? (
                <Simulator answers={answers} baseline={baseline} />
              ) : (
                <div className="rounded-xl border border-border/70 bg-card p-5">
                  <h3 className="text-sm font-semibold tracking-tight">What-if simulator</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Finish the onboarding quiz to unlock personalized scenarios.
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link to="/onboarding">Start quiz</Link>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
