import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatKgCo2e } from "@/lib/carbon";

interface Activity {
  readonly occurred_at: string;
  readonly kg_co2e: number;
}

/** Sum kg CO2e per day for the trailing N days, oldest → newest. */
function bucketByDay(activities: ReadonlyArray<Activity>, days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: { date: string; label: string; kg: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      kg: 0,
    });
  }
  const idx = new Map(buckets.map((b, i) => [b.date, i] as const));
  for (const a of activities) {
    const key = a.occurred_at.slice(0, 10);
    const i = idx.get(key);
    if (i !== undefined) buckets[i].kg += Number(a.kg_co2e) || 0;
  }
  return buckets;
}

export function TrendChart({
  activities,
  days = 30,
}: {
  activities: ReadonlyArray<Activity>;
  days?: number;
}) {
  const data = useMemo(() => bucketByDay(activities, days), [activities, days]);
  const total = data.reduce((s, d) => s + d.kg, 0);

  return (
    <div
      className="rounded-xl border border-border/70 bg-card p-5"
      role="region"
      aria-label={`${days}-day emissions trend`}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Last {days} days</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {formatKgCo2e(total)}{" "}
            <span className="text-sm font-normal text-muted-foreground">CO₂e</span>
          </p>
        </div>
      </div>
      <div className="mt-4 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="cl-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.4}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => (typeof v === "number" ? formatKgCo2e(v) : String(v))}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(v: number) => [formatKgCo2e(v), "CO₂e"]}
            />
            <Area
              type="monotone"
              dataKey="kg"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#cl-trend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
