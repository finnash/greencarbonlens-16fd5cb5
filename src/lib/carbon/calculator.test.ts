import { describe, expect, it } from "vitest";
import {
  PARIS_BUDGET_KG_PER_YEAR,
  breakdownByCategory,
  budgetUsedPct,
  computeKgCo2e,
  estimateBaselineKgPerYear,
  formatKgCo2e,
  sumEmissions,
} from "./calculator";
import { FACTORS } from "./factors";

describe("computeKgCo2e", () => {
  it("multiplies the factor by the amount", () => {
    expect(computeKgCo2e("car_petrol_medium", 100)).toBeCloseTo(17.81, 4);
    expect(computeKgCo2e("electricity_grid_avg", 250)).toBeCloseTo(108.25, 4);
  });
  it("returns 0 for zero-emission factors", () => {
    expect(computeKgCo2e("cycling", 1_000)).toBe(0);
  });
  it("rejects negative or non-finite amounts", () => {
    expect(() => computeKgCo2e("car_petrol_medium", -1)).toThrow(RangeError);
    expect(() => computeKgCo2e("car_petrol_medium", Number.NaN)).toThrow(RangeError);
    expect(() => computeKgCo2e("car_petrol_medium", Infinity)).toThrow(RangeError);
  });
});

describe("sumEmissions / breakdownByCategory", () => {
  it("sums numeric values and coerces junk to 0", () => {
    expect(
      sumEmissions([
        { kg_co2e: 1.5 },
        { kg_co2e: 2.25 },
        // @ts-expect-error runtime safety
        { kg_co2e: "nope" },
      ]),
    ).toBe(3.75);
  });
  it("groups by category", () => {
    const out = breakdownByCategory([
      { category: "transport", kg_co2e: 5 },
      { category: "transport", kg_co2e: 2.5 },
      { category: "food", kg_co2e: 1 },
    ]);
    expect(out.transport).toBe(7.5);
    expect(out.food).toBe(1);
    expect(out.energy).toBeUndefined();
  });
});

describe("estimateBaselineKgPerYear", () => {
  it("eco profile beats heavy profile", () => {
    const eco = estimateBaselineKgPerYear({
      commute: "bike_walk",
      commute_km_per_day: 5,
      diet: "vegan",
      electricity_kwh_month: 150,
      flights_long_per_year: 0,
    });
    const heavy = estimateBaselineKgPerYear({
      commute: "car_petrol",
      commute_km_per_day: 30,
      diet: "high_meat",
      electricity_kwh_month: 600,
      flights_long_per_year: 2,
    });
    expect(eco.total).toBeLessThan(heavy.total);
    expect(eco.byCategory.transport).toBe(0);
    expect(heavy.byCategory.travel).toBeGreaterThan(0);
  });
  it("produces a finite total", () => {
    const out = estimateBaselineKgPerYear({
      commute: "transit",
      commute_km_per_day: 12,
      diet: "low_meat",
      electricity_kwh_month: 280,
      flights_long_per_year: 1,
    });
    expect(Number.isFinite(out.total)).toBe(true);
    expect(out.total).toBeGreaterThan(0);
  });
});

describe("formatKgCo2e", () => {
  it.each([
    [0.25, "250 g"],
    [12.4, "12.4 kg"],
    [1500, "1.50 t"],
    [12_345, "12.3 t"],
  ])("formats %d as %s", (input, expected) => {
    expect(formatKgCo2e(input)).toBe(expected);
  });
  it("handles non-finite", () => {
    expect(formatKgCo2e(Number.NaN)).toBe("—");
  });
});

describe("budgetUsedPct", () => {
  it("computes percentage of the Paris budget", () => {
    expect(budgetUsedPct(PARIS_BUDGET_KG_PER_YEAR)).toBe(100);
    expect(budgetUsedPct(1_000)).toBe(50);
    expect(budgetUsedPct(0)).toBe(0);
  });
  it("clamps and tolerates a zero budget", () => {
    expect(budgetUsedPct(10_000, 0)).toBe(0);
    expect(budgetUsedPct(1e9)).toBe(999);
  });
});

describe("FACTORS catalogue", () => {
  it("every factor matches its key", () => {
    for (const [key, f] of Object.entries(FACTORS)) {
      expect(f.slug).toBe(key);
      expect(f.kg_co2e_per_unit).toBeGreaterThanOrEqual(0);
    }
  });
});
