/**
 * Pure carbon-footprint math.
 *
 * Every function in this module is deterministic and side-effect-free so it
 * can be exercised with unit tests at very high coverage. The calculator is
 * the single source of truth for kg CO2e values written to the database.
 */
import { getFactor, type FactorSlug } from "./factors";
import type { ActivityCategory, QuizAnswers } from "./types";

/** Per-person 1.5 °C-compatible budget (IPCC AR6 SR1.5, ~2 t CO2e/yr). */
export const PARIS_BUDGET_KG_PER_YEAR = 2_000;

/** Rough global mean per-capita lifestyle footprint, kg CO2e/yr. */
export const GLOBAL_AVG_KG_PER_YEAR = 4_700;

/**
 * Compute kg CO2e for a single activity entry.
 * Rounded to 4 decimals to match the database column precision.
 */
export function computeKgCo2e(slug: FactorSlug, amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new RangeError(`amount must be a finite non-negative number, got ${amount}`);
  }
  const f = getFactor(slug);
  return round(f.kg_co2e_per_unit * amount, 4);
}

/** Sum kg CO2e from a list of activity rows. */
export function sumEmissions(rows: ReadonlyArray<{ kg_co2e: number }>): number {
  let total = 0;
  for (const r of rows) total += Number(r.kg_co2e) || 0;
  return round(total, 4);
}

/** Group kg CO2e by category. Missing categories are omitted. */
export function breakdownByCategory(
  rows: ReadonlyArray<{ category: ActivityCategory; kg_co2e: number }>,
): Record<ActivityCategory, number> {
  const out = {} as Record<ActivityCategory, number>;
  for (const r of rows) {
    out[r.category] = round((out[r.category] ?? 0) + (Number(r.kg_co2e) || 0), 4);
  }
  return out;
}

/**
 * Estimate yearly kg CO2e baseline from the 5-question onboarding quiz.
 * Keep the model simple and explainable — the AI Coach surfaces the
 * intermediate category numbers to the user.
 */
export function estimateBaselineKgPerYear(q: QuizAnswers): {
  total: number;
  byCategory: Record<ActivityCategory, number>;
} {
  const COMMUTE_DAYS = 240; // ~working days per year
  const commuteFactor: FactorSlug =
    q.commute === "car_petrol" ? "car_petrol_medium"
    : q.commute === "car_ev" ? "car_ev_medium"
    : q.commute === "transit" ? "bus_local"
    : "cycling";
  // Round-trip per commuting day.
  const transport = computeKgCo2e(commuteFactor, q.commute_km_per_day * 2 * COMMUTE_DAYS);

  const energy = computeKgCo2e("electricity_grid_avg", q.electricity_kwh_month * 12);

  const dietPerYear: Record<QuizAnswers["diet"], number> = {
    high_meat: computeKgCo2e("meal_beef", 365) + computeKgCo2e("meal_chicken", 365),
    low_meat: computeKgCo2e("meal_chicken", 365) + computeKgCo2e("meal_vegetarian", 365),
    pescetarian: computeKgCo2e("meal_fish", 365) + computeKgCo2e("meal_vegetarian", 365),
    vegetarian: computeKgCo2e("meal_vegetarian", 730),
    vegan: computeKgCo2e("meal_vegan", 730),
  };
  const food = round(dietPerYear[q.diet], 4);

  // Average long-haul return trip ≈ 11,000 km.
  const travel = computeKgCo2e("flight_long_eco", q.flights_long_per_year * 11_000);

  const byCategory = {
    transport,
    energy,
    food,
    travel,
    shopping: 0,
    waste: 0,
    other: 0,
  } satisfies Record<ActivityCategory, number>;

  const total = round(transport + energy + food + travel, 2);
  return { total, byCategory };
}

/** Format kg CO2e in the most human unit. */
export function formatKgCo2e(kg: number): string {
  if (!Number.isFinite(kg)) return "—";
  if (kg >= 1000) return `${(kg / 1000).toFixed(kg >= 10_000 ? 1 : 2)} t`;
  if (kg >= 1) return `${kg.toFixed(1)} kg`;
  return `${(kg * 1000).toFixed(0)} g`;
}

/** Percentage of an annual budget consumed. Clamped to [0, 999]. */
export function budgetUsedPct(annualKg: number, budget = PARIS_BUDGET_KG_PER_YEAR): number {
  if (budget <= 0) return 0;
  return clamp(round((annualKg / budget) * 100, 1), 0, 999);
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}