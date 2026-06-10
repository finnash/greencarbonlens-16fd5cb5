/**
 * Final onboarding step: shows the computed baseline + per-category
 * breakdown and collects an optional display name.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { estimateBaselineKgPerYear, formatKgCo2e } from "@/lib/carbon";

export function ResultStep({
  estimate,
  displayName,
  onDisplayNameChange,
}: {
  estimate: ReturnType<typeof estimateBaselineKgPerYear>;
  displayName: string;
  onDisplayNameChange: (v: string) => void;
}) {
  const cats = Object.entries(estimate.byCategory)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">Your estimated baseline</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We&apos;ll refine this as you log activities. The Paris-aligned target is roughly 2 t/yr.
      </p>

      <div className="mt-6 rounded-xl border border-border/70 bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Annual footprint
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {formatKgCo2e(estimate.total)}
          <span className="ml-1 text-sm font-normal text-muted-foreground">CO₂e / yr</span>
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          {cats.map(([cat, v]) => (
            <li key={cat} className="flex items-center justify-between">
              <span className="capitalize text-muted-foreground">{cat}</span>
              <span className="tabular-nums">{formatKgCo2e(v)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <Label htmlFor="display_name" className="text-sm font-medium">
          Display name <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="display_name"
          value={displayName}
          maxLength={60}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          placeholder="e.g. Adith"
          className="mt-2"
        />
      </div>
    </div>
  );
}