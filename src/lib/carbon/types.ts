/**
 * Shared carbon domain types.
 *
 * The activity categories mirror the Postgres `activity_category` enum.
 * Keep this union in sync with the database — the `CategorySync` test in
 * `categories.test.ts` will fail if they drift.
 */
export const ACTIVITY_CATEGORIES = [
  "transport",
  "energy",
  "food",
  "shopping",
  "travel",
  "waste",
  "other",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

/** A single emission-factor entry. `kg_co2e_per_unit` is the multiplier. */
export interface EmissionFactor {
  readonly slug: string;
  readonly category: ActivityCategory;
  readonly name: string;
  readonly unit: string;
  readonly kg_co2e_per_unit: number;
  readonly source: string;
}

/** Onboarding quiz answers — see `quiz.ts` for question definitions. */
export interface QuizAnswers {
  /** Primary commute mode. */
  commute: "car_petrol" | "car_ev" | "transit" | "bike_walk";
  /** One-way commute distance, km/day. */
  commute_km_per_day: number;
  /** Diet pattern. */
  diet: "high_meat" | "low_meat" | "pescetarian" | "vegetarian" | "vegan";
  /** Monthly household electricity, kWh. */
  electricity_kwh_month: number;
  /** Long-haul return flights per year. */
  flights_long_per_year: number;
}
