import { Award, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { joinChallenge, type ChallengeRow } from "@/lib/challenges.functions";
import { toast } from "sonner";

const DIFFICULTY: Record<number, { label: string; tone: string }> = {
  1: { label: "Easy", tone: "bg-emerald-500/15 text-emerald-300" },
  2: { label: "Easy+", tone: "bg-emerald-500/15 text-emerald-300" },
  3: { label: "Medium", tone: "bg-amber-500/15 text-amber-300" },
  4: { label: "Hard", tone: "bg-orange-500/15 text-orange-300" },
  5: { label: "Expert", tone: "bg-rose-500/15 text-rose-300" },
};

/**
 * Card showing a single sustainability challenge with a join action.
 * Renders an accessible region with semantic heading + difficulty badge.
 */
export function ChallengeCard({ challenge, joined }: { challenge: ChallengeRow; joined: boolean }) {
  const qc = useQueryClient();
  const join = useServerFn(joinChallenge);
  const m = useMutation({
    mutationFn: () => join({ data: { challenge_id: challenge.id } }),
    onSuccess: () => {
      toast.success(`Joined "${challenge.title}"`);
      qc.invalidateQueries({ queryKey: ["my-challenges"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not join"),
  });
  const diff = DIFFICULTY[challenge.difficulty] ?? DIFFICULTY[1]!;

  return (
    <article
      aria-labelledby={`ch-${challenge.id}`}
      className="flex flex-col rounded-xl border border-border/70 bg-card p-5"
    >
      <header className="flex items-start justify-between gap-3">
        <h3 id={`ch-${challenge.id}`} className="text-base font-semibold tracking-tight">
          {challenge.title}
        </h3>
        <Badge className={diff.tone} variant="secondary">
          {diff.label}
        </Badge>
      </header>
      <p className="mt-2 text-sm text-muted-foreground">{challenge.description}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <dt className="uppercase tracking-wider">Duration</dt>
          <dd className="text-sm text-foreground">{challenge.duration_days} days</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider">Saves</dt>
          <dd className="text-sm text-foreground">~{challenge.expected_kg_co2e_saved} kg CO₂e</dd>
        </div>
      </dl>
      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          disabled={joined || m.isPending}
          onClick={() => m.mutate()}
          aria-label={joined ? `Already joined ${challenge.title}` : `Join ${challenge.title}`}
        >
          {m.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Award className="size-4" aria-hidden />
          )}
          <span>{joined ? "Joined" : "Join"}</span>
        </Button>
      </div>
    </article>
  );
}
