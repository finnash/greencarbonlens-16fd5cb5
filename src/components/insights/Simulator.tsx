import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatKgCo2e } from "@/lib/carbon/calculator";
import { DEFAULT_LEVERS, simulate, type ScenarioLevers } from "@/lib/carbon/simulator";
import type { QuizAnswers } from "@/lib/carbon/types";

interface Props {
  answers: QuizAnswers;
  baseline: number;
}

export function Simulator({ answers, baseline }: Props) {
  const initial: ScenarioLevers = {
    ...DEFAULT_LEVERS,
    flightsLongPerYear: answers.flights_long_per_year,
  };
  const [levers, setLevers] = useState<ScenarioLevers>(initial);

  const result = useMemo(() => simulate(answers, levers), [answers, levers]);
  const delta = result.total - baseline;
  const pct = baseline > 0 ? Math.round((delta / baseline) * 100) : 0;

  function update<K extends keyof ScenarioLevers>(k: K, v: ScenarioLevers[K]) {
    setLevers((p) => ({ ...p, [k]: v }));
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">What-if simulator</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Drag levers to see your projected annual footprint.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLevers(initial)}
          aria-label="Reset simulator"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>

      <div
        className="mt-4 rounded-lg border border-border/60 bg-background/60 p-4"
        aria-live="polite"
      >
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Projected annual</p>
          <p
            className={
              "flex items-center gap-1 text-xs font-medium " +
              (delta < 0
                ? "text-primary"
                : delta > 0
                  ? "text-destructive"
                  : "text-muted-foreground")
            }
          >
            {delta < 0 ? (
              <ArrowDown className="size-3" />
            ) : delta > 0 ? (
              <ArrowUp className="size-3" />
            ) : null}
            {pct > 0 ? "+" : ""}
            {pct}% ({formatKgCo2e(Math.abs(delta))})
          </p>
        </div>
        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
          {formatKgCo2e(result.total)}
        </p>
        <p className="text-[11px] text-muted-foreground">vs. baseline {formatKgCo2e(baseline)}</p>
      </div>

      <div className="mt-6 space-y-6">
        <LeverBlock>
          <Label htmlFor="lever-commute-mode">Commute mode</Label>
          <Select
            value={levers.switchCommuteTo}
            onValueChange={(v) => update("switchCommuteTo", v as ScenarioLevers["switchCommuteTo"])}
          >
            <SelectTrigger id="lever-commute-mode" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keep">Keep current ({labelCommute(answers.commute)})</SelectItem>
              <SelectItem value="bike_walk">Bike / walk</SelectItem>
              <SelectItem value="transit">Public transit</SelectItem>
              <SelectItem value="car_ev">Electric car</SelectItem>
              <SelectItem value="car_petrol">Petrol car</SelectItem>
            </SelectContent>
          </Select>
        </LeverBlock>

        <LeverBlock>
          <SliderRow
            label="Reduce commute distance"
            value={Math.round(levers.reduceCommutePct * 100)}
            suffix="%"
            onChange={(n) => update("reduceCommutePct", n / 100)}
            max={100}
          />
        </LeverBlock>

        <LeverBlock>
          <SliderRow
            label="Renewable electricity share"
            value={Math.round(levers.renewableSharePct * 100)}
            suffix="%"
            onChange={(n) => update("renewableSharePct", n / 100)}
            max={100}
          />
        </LeverBlock>

        <LeverBlock>
          <Label htmlFor="lever-diet">Diet</Label>
          <Select
            value={levers.switchDietTo}
            onValueChange={(v) => update("switchDietTo", v as ScenarioLevers["switchDietTo"])}
          >
            <SelectTrigger id="lever-diet" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keep">Keep current ({labelDiet(answers.diet)})</SelectItem>
              <SelectItem value="high_meat">High meat</SelectItem>
              <SelectItem value="low_meat">Low meat</SelectItem>
              <SelectItem value="pescetarian">Pescetarian</SelectItem>
              <SelectItem value="vegetarian">Vegetarian</SelectItem>
              <SelectItem value="vegan">Vegan</SelectItem>
            </SelectContent>
          </Select>
        </LeverBlock>

        <LeverBlock>
          <SliderRow
            label="Long-haul flights / year"
            value={Math.max(0, levers.flightsLongPerYear)}
            suffix=""
            onChange={(n) => update("flightsLongPerYear", n)}
            max={10}
          />
        </LeverBlock>
      </div>
    </div>
  );
}

function LeverBlock({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function SliderRow({
  label,
  value,
  suffix,
  onChange,
  max,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (n: number) => void;
  max: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        className="mt-2"
        value={[value]}
        min={0}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
    </div>
  );
}

function labelCommute(c: QuizAnswers["commute"]) {
  return c === "car_petrol"
    ? "petrol car"
    : c === "car_ev"
      ? "EV"
      : c === "transit"
        ? "transit"
        : "bike/walk";
}
function labelDiet(d: QuizAnswers["diet"]) {
  return d.replace("_", " ");
}
