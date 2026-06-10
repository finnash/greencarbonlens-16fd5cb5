import { useMemo } from "react";
import { FACTORS, type FactorSlug } from "@/lib/carbon/factors";
import { formatKgCo2e } from "@/lib/carbon/calculator";

interface Activity {
  readonly factor_slug: string;
  readonly kg_co2e: number;
}

export function TopFactors({ activities }: { activities: ReadonlyArray<Activity> }) {
  const rows = useMemo(() => {
    const sums = new Map<string, number>();
    for (const a of activities) {
      sums.set(a.factor_slug, (sums.get(a.factor_slug) ?? 0) + Number(a.kg_co2e));
    }
    return [...sums.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([slug, kg]) => ({
        slug,
        kg,
        label: FACTORS[slug as FactorSlug]?.name ?? slug,
        category: FACTORS[slug as FactorSlug]?.category ?? "other",
      }));
  }, [activities]);

  const max = rows[0]?.kg ?? 1;

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-5">
        <h3 className="text-sm font-semibold tracking-tight">Top emitters</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Log a few activities to see your biggest sources.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <h3 className="text-sm font-semibold tracking-tight">Top emitters (last 90 days)</h3>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li key={r.slug}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="truncate font-medium text-foreground">{r.label}</span>
              <span className="tabular-nums text-muted-foreground">{formatKgCo2e(r.kg)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/80"
                style={{ width: `${Math.max(4, (r.kg / max) * 100)}%` }}
                aria-hidden
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}