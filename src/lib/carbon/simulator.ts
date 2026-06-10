/**
 * Pure What-If simulator for the Insights page.
 *
 * Given the user's quiz answers (their lifestyle baseline) and a set of
 * scenario levers, recompute the annual kg CO2e by category and total.
 *
 * Deterministic + side-effect free. Unit-tested.
 */
import { computeKgCo2e } from "./calculator";
import type { FactorSlug } from "./factors";
import type { ActivityCategory, QuizAnswers } from "./types";

const COMMUTE_DAYS = 240;
const LONG_HAUL_KM = 11_000;

export interface ScenarioLevers {
  /** 0..1: fraction of commute km removed (e.g. WFH days). */
  reduceCommutePct: number;
  /** Switch commute mode entirely (overrides quiz commute). */
  switchCommuteTo: QuizAnswers["commute"] | "keep";
  /** 0..1: fraction of grid electricity moved to renewables. */
  renewableSharePct: number;
  /** Replace diet with a different category. */
  switchDietTo: QuizAnswers["diet"] | "keep";
  /** Absolute long-haul flights / year (overrides quiz value). */
  flightsLongPerYear: number;
}

export const DEFAULT_LEVERS: ScenarioLevers = {
  reduceCommutePct: 0,
  switchCommuteTo: "keep",
  renewableSharePct: 0,
  switchDietTo: "keep",
  flightsLongPerYear: -1, // -1 sentinel → use quiz value
};

function commuteFactor(c: QuizAnswers["commute"]): FactorSlug {
  return c === "car_petrol"
    ? "car_petrol_medium"
    : c === "car_ev"
      ? "car_ev_medium"
      : c === "transit"
        ? "bus_local"
        : "cycling";
}

function dietPerYearKg(d: QuizAnswers["diet"]): number {
  switch (d) {
    case "high_meat":
      return computeKgCo2e("meal_beef", 365) + computeKgCo2e("meal_chicken", 365);
    case "low_meat":
      return computeKgCo2e("meal_chicken", 365) + computeKgCo2e("meal_vegetarian", 365);
    case "pescetarian":
      return computeKgCo2e("meal_fish", 365) + computeKgCo2e("meal_vegetarian", 365);
    case "vegetarian":
      return computeKgCo2e("meal_vegetarian", 730);
    case "vegan":
      return computeKgCo2e("meal_vegan", 730);
  }
}

export interface ScenarioResult {
  total: number;
  byCategory: Record<ActivityCategory, number>;
}

/** Recompute annual kg CO2e using the supplied scenario levers. */
export function simulate(answers: QuizAnswers, levers: ScenarioLevers): ScenarioResult {
  const commute = levers.switchCommuteTo === "keep" ? answers.commute : levers.switchCommuteTo;
  const kmPerDay = answers.commute_km_per_day * 2 * (1 - clamp01(levers.reduceCommutePct));
  const transport = computeKgCo2e(commuteFactor(commute), kmPerDay * COMMUTE_DAYS);

  const kwhYear = answers.electricity_kwh_month * 12;
  const renewShare = clamp01(levers.renewableSharePct);
  const energy =
    computeKgCo2e("electricity_grid_avg", kwhYear * (1 - renewShare)) +
    computeKgCo2e("electricity_renewable", kwhYear * renewShare);

  const diet = levers.switchDietTo === "keep" ? answers.diet : levers.switchDietTo;
  const food = dietPerYearKg(diet);

  const flights =
    levers.flightsLongPerYear < 0 ? answers.flights_long_per_year : levers.flightsLongPerYear;
  const travel = computeKgCo2e("flight_long_eco", Math.max(0, flights) * LONG_HAUL_KM);

  const byCategory: Record<ActivityCategory, number> = {
    transport: round(transport, 2),
    energy: round(energy, 2),
    food: round(food, 2),
    travel: round(travel, 2),
    shopping: 0,
    waste: 0,
    other: 0,
  };
  const total = round(transport + energy + food + travel, 2);
  return { total, byCategory };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
function round(n: number, d: number): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
