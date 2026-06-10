import { Crown } from "lucide-react";

import { formatKgCo2e } from "@/lib/carbon";

export interface LeaderboardRow {
  user_id: string;
  handle: string;
  week_kg_saved: number;
  total_kg_saved: number;
  completed_count: number;
}

/**
 * Accessible leaderboard table. Uses semantic <table> + <caption> with a
 * visually-hidden description so screen readers announce purpose first.
 */
export function LeaderboardTable({
  rows,
  metric,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  metric: "week" | "all";
  currentUserId?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        No completed challenges yet — be the first on the board.
      </p>
    );
  }
  const sorted = [...rows].sort((a, b) =>
    metric === "week" ? b.week_kg_saved - a.week_kg_saved : b.total_kg_saved - a.total_kg_saved,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <table className="w-full text-sm" aria-describedby="lb-caption">
        <caption id="lb-caption" className="sr-only">
          CarbonLens community leaderboard ranked by{" "}
          {metric === "week" ? "kg CO₂e saved in the last 7 days" : "total kg CO₂e saved all-time"}.
        </caption>
        <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3">Rank</th>
            <th scope="col" className="px-4 py-3">Member</th>
            <th scope="col" className="px-4 py-3 text-right">Saved</th>
            <th scope="col" className="hidden px-4 py-3 text-right sm:table-cell">Completed</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, idx) => {
            const value = metric === "week" ? r.week_kg_saved : r.total_kg_saved;
            const isMe = currentUserId && r.user_id === currentUserId;
            return (
              <tr
                key={r.user_id}
                className={
                  isMe ? "border-t border-border/60 bg-primary/10" : "border-t border-border/60"
                }
              >
                <td className="px-4 py-3 tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    {idx === 0 ? <Crown className="size-4 text-amber-400" aria-hidden /> : null}
                    #{idx + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.handle}
                  {isMe ? <span className="ml-2 text-xs text-primary">(you)</span> : null}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatKgCo2e(value)}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">
                  {r.completed_count}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}