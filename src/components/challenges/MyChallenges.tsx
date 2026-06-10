import { CheckCircle2, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { updateMyChallenge, type UserChallengeRow, type ChallengeRow } from "@/lib/challenges.functions";
import { toast } from "sonner";
import { formatKgCo2e } from "@/lib/carbon";

/**
 * Lists the user's joined challenges with complete / abandon controls.
 */
export function MyChallenges({
  entries,
  catalog,
}: {
  entries: UserChallengeRow[];
  catalog: ChallengeRow[];
}) {
  const qc = useQueryClient();
  const upd = useServerFn(updateMyChallenge);
  const m = useMutation({
    mutationFn: (args: Parameters<typeof updateMyChallenge>[0]["data"]) => upd({ data: args }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-challenges"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const active = entries.filter((e) => e.status === "active");
  if (active.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        You haven't joined any challenges yet. Pick one above to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {active.map((e) => {
        const ch = catalog.find((c) => c.id === e.challenge_id);
        if (!ch) return null;
        const ends = new Date(e.ends_at);
        const remaining = Math.max(0, Math.ceil((ends.getTime() - Date.now()) / 86_400_000));
        return (
          <li
            key={e.id}
            className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">{ch.title}</p>
              <p className="text-xs text-muted-foreground">
                {remaining} day{remaining === 1 ? "" : "s"} left · {formatKgCo2e(Number(e.kg_co2e_saved))} saved
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={m.isPending}
                onClick={() =>
                  m.mutate({
                    user_challenge_id: e.id,
                    status: "completed",
                    kg_co2e_saved: Number(ch.expected_kg_co2e_saved),
                  })
                }
                aria-label={`Mark ${ch.title} complete`}
              >
                <CheckCircle2 className="size-4" aria-hidden />
                <span>Complete</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={m.isPending}
                onClick={() => m.mutate({ user_challenge_id: e.id, status: "abandoned" })}
                aria-label={`Abandon ${ch.title}`}
              >
                <XCircle className="size-4" aria-hidden />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}