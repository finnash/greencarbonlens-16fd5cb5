/**
 * Compact KPI tile for the dashboard hero grid.
 * Tabular numerals + uppercase eyebrow label for at-a-glance scanning.
 */
export function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{suffix}</p>
    </div>
  );
}