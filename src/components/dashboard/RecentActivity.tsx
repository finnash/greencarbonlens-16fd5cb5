import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteActivity } from "@/lib/activity.functions";
import { formatKgCo2e, type ActivityCategory } from "@/lib/carbon";
import { FACTORS, type FactorSlug } from "@/lib/carbon/factors";

interface Activity {
  readonly id: string;
  readonly factor_slug: string;
  readonly category: ActivityCategory;
  readonly unit: string;
  readonly amount: number;
  readonly kg_co2e: number;
  readonly occurred_at: string;
  readonly notes: string | null;
}

function labelFor(slug: string): string {
  return FACTORS[slug as FactorSlug]?.name ?? slug;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentActivity({
  userId,
  activities,
}: {
  userId: string;
  activities: ReadonlyArray<Activity>;
}) {
  const queryClient = useQueryClient();
  const del = useServerFn(deleteActivity);
  const mutation = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", userId] });
      toast.success("Entry removed");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not delete entry");
    },
  });

  return (
    <div
      className="rounded-xl border border-border/70 bg-card"
      role="region"
      aria-label="Recent activities"
    >
      <div className="border-b border-border/60 px-5 py-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent activity</p>
      </div>
      {activities.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">
          Nothing logged yet. Use “Log activity” to add your first entry.
        </p>
      ) : (
        <ul role="list" className="divide-y divide-border/60">
          {activities.slice(0, 10).map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{labelFor(a.factor_slug)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.amount} {a.unit} · {formatWhen(a.occurred_at)}
                  {a.notes ? ` · ${a.notes}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {formatKgCo2e(Number(a.kg_co2e))}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${labelFor(a.factor_slug)} entry`}
                onClick={() => mutation.mutate(a.id)}
                disabled={mutation.isPending}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
