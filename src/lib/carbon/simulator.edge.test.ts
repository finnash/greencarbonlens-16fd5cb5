/**
 * Edge-case coverage for the What-If simulator. The primary spec lives in
 * `simulator.test.ts`; this file pins behaviour around zero inputs, every
 * diet branch, and combined-lever interactions.
 */
import { describe, expect, it } from "vitest";

import { DEFAULT_LEVERS, simulate } from "./simulator";
import type { QuizAnswers } from "./types";

const BASE: QuizAnswers = {
  commute: "transit",
  commute_km_per_day: 10,
  diet: "low_meat",
  electricity_kwh_month: 250,
  flights_long_per_year: 1,
};

describe("simulator — edge cases", () => {
  it("zero baseline activity returns finite zeros, not NaN", () => {
    const empty: QuizAnswers = {
      commute: "cycling",
      commute_km_per_day: 0,
      diet: "vegan",
      electricity_kwh_month: 0,
      flights_long_per_year: 0,
    };
    const result = simulate(empty, DEFAULT_LEVERS);
    for (const v of Object.values(result.byCategory)) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
    // Vegan baseline still has food emissions
    expect(result.byCategory.transport).toBe(0);
    expect(result.byCategory.energy).toBe(0);
    expect(result.byCategory.travel).toBe(0);
  });

  it("each diet branch returns a positive food value", () => {
    const diets: QuizAnswers["diet"][] = [
      "high_meat",
      "low_meat",
      "pescetarian",
      "vegetarian",
      "vegan",
    ];
    for (const diet of diets) {
      const r = simulate({ ...BASE, diet }, DEFAULT_LEVERS);
      expect(r.byCategory.food).toBeGreaterThan(0);
    }
  });

  it("vegan ≤ vegetarian ≤ low_meat ≤ high_meat for food", () => {
    const food = (d: QuizAnswers["diet"]) =>
      simulate({ ...BASE, diet: d }, DEFAULT_LEVERS).byCategory.food;
    expect(food("vegan")).toBeLessThanOrEqual(food("vegetarian"));
    expect(food("vegetarian")).toBeLessThanOrEqual(food("low_meat"));
    expect(food("low_meat")).toBeLessThanOrEqual(food("high_meat"));
  });

  it("switching commute to cycling zeroes commute emissions even when km > 0", () => {
    const r = simulate(
      { ...BASE, commute: "car_petrol", commute_km_per_day: 20 },
      { ...DEFAULT_LEVERS, switchCommuteTo: "cycling" },
    );
    expect(r.byCategory.transport).toBe(0);
  });

  it("renewable share NaN is treated as 0 (no crash)", () => {
    const r = simulate(BASE, {
      ...DEFAULT_LEVERS,
      renewableSharePct: Number.NaN,
    });
    expect(Number.isFinite(r.byCategory.energy)).toBe(true);
    expect(r.byCategory.energy).toBeGreaterThan(0);
  });

  it("combined max-reduction levers produce a strictly lower total than baseline", () => {
    const baseline = simulate(BASE, DEFAULT_LEVERS).total;
    const lowest = simulate(BASE, {
      reduceCommutePct: 1,
      switchCommuteTo: "cycling",
      renewableSharePct: 1,
      switchDietTo: "vegan",
      flightsLongPerYear: 0,
    }).total;
    expect(lowest).toBeLessThan(baseline);
  });

  it("totals equal the sum of category values", () => {
    const r = simulate(BASE, DEFAULT_LEVERS);
    const sum =
      r.byCategory.transport +
      r.byCategory.energy +
      r.byCategory.food +
      r.byCategory.travel;
    expect(Math.abs(r.total - sum)).toBeLessThan(0.05);
  });

  it("default sentinel flightsLongPerYear (-1) uses quiz value", () => {
    const withFlights = simulate({ ...BASE, flights_long_per_year: 3 }, DEFAULT_LEVERS);
    const explicit = simulate(BASE, { ...DEFAULT_LEVERS, flightsLongPerYear: 3 });
    expect(withFlights.byCategory.travel).toBeCloseTo(explicit.byCategory.travel, 1);
  });
});