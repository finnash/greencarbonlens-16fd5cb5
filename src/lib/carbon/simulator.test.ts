import { describe, expect, it } from "vitest";

import { DEFAULT_LEVERS, simulate, type ScenarioLevers } from "./simulator";
import { estimateBaselineKgPerYear } from "./calculator";
import type { QuizAnswers } from "./types";

const ANSWERS: QuizAnswers = {
  commute: "car_petrol",
  commute_km_per_day: 15,
  diet: "high_meat",
  electricity_kwh_month: 300,
  flights_long_per_year: 2,
};

describe("simulator", () => {
  it("default levers reproduce baseline (within 1%)", () => {
    const baseline = estimateBaselineKgPerYear(ANSWERS).total;
    const result = simulate(ANSWERS, DEFAULT_LEVERS);
    expect(Math.abs(result.total - baseline) / baseline).toBeLessThan(0.01);
  });

  it("100% renewable cuts energy emissions by >80%", () => {
    const base = simulate(ANSWERS, DEFAULT_LEVERS);
    const levers: ScenarioLevers = { ...DEFAULT_LEVERS, renewableSharePct: 1 };
    const after = simulate(ANSWERS, levers);
    expect(after.byCategory.energy).toBeLessThan(base.byCategory.energy * 0.2);
  });

  it("switching to vegan reduces food emissions", () => {
    const base = simulate(ANSWERS, DEFAULT_LEVERS);
    const after = simulate(ANSWERS, { ...DEFAULT_LEVERS, switchDietTo: "vegan" });
    expect(after.byCategory.food).toBeLessThan(base.byCategory.food * 0.5);
    expect(after.total).toBeLessThan(base.total);
  });

  it("zero flights removes all travel emissions", () => {
    const after = simulate(ANSWERS, { ...DEFAULT_LEVERS, flightsLongPerYear: 0 });
    expect(after.byCategory.travel).toBe(0);
  });

  it("clamps invalid lever inputs", () => {
    const after = simulate(ANSWERS, {
      ...DEFAULT_LEVERS,
      reduceCommutePct: 5,
      renewableSharePct: -1,
    });
    expect(after.byCategory.transport).toBe(0);
    expect(after.byCategory.energy).toBeGreaterThan(0);
  });
});
