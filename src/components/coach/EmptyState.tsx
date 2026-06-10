/**
 * Coach empty-state card with suggested starter prompts.
 * Pure presentational; parent owns the send handler.
 */
import { Sparkles } from "lucide-react";

export const SUGGESTED_PROMPTS = [
  "What's my biggest emission source right now?",
  "Give me 3 actions to cut my footprint this week.",
  "How do I compare to the Paris 1.5 °C budget?",
  "Is flying or driving worse per km?",
] as const;

export function CoachEmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-6">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Sparkles className="size-4 text-primary" aria-hidden />
        Start a conversation
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Your coach knows your last 30 days of activity. Try one of these to begin:
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-md border border-border/70 bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}