import { useMemo } from "react";

import { breakdownByCategory, formatKgCo2e, type ActivityCategory } from "@/lib/carbon";

const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  transport: "Transport",
  energy: "Energy",
  food: "Food",
  shopping: "Shopping",
  travel: "Travel",
  waste: "Waste",
  other: "Other",
};

interface Activity {
  readonly category: ActivityCategory;
  readonly kg_co2e: number;
}

export function CategoryBreakdown({ activities }: { activities: ReadonlyArray<Activity> }) {
  const rows = useMemo(() => {
    const map = breakdownByCategory(activities);
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .map(([cat, kg]) => ({
        category: cat as ActivityCategory,
        kg,
        pct: total > 0 ? Math.round((kg / total) * 100) : 0,
      }))
      .sort((a, b) => b.kg - a.kg);
  }, [activities]);

  return (
    <div
      className="rounded-xl border border-border/70 bg-card p-5"
      role="region"
      aria-label="Emissions by category"
    >
      <p className="text-xs uppercase tracking-wider text-muted-foreground">By category</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Log activities to see your category breakdown.
        </p>
      ) : (
        <ul role="list" className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.category} className="space-y-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{CATEGORY_LABEL[r.category]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatKgCo2e(r.kg)} · {r.pct}%
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={r.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${CATEGORY_LABEL[r.category]} share`}
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${r.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
