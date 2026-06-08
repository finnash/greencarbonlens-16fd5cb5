import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Leaf, LogOut } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main id="main-content" className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary"
            >
              <Leaf className="size-4" />
            </span>
            <span>CarbonLens</span>
          </div>
          <div className="flex items-center gap-3">
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
        <h1 className="text-2xl font-semibold tracking-tight">Your dashboard</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Onboarding, activity logging, and AI coach arrive in the next sessions.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/70 bg-card p-5"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-8 w-32" />
              <Skeleton className="mt-4 h-2 w-full" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
