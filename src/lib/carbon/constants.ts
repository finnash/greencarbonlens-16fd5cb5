/**
 * Shared numeric constants for the carbon engine.
 *
 * Centralized so the calculator, simulator, AI Coach prompt, and tests
 * never drift from each other.
 */

/** Per-person 1.5 °C-compatible budget (IPCC AR6 SR1.5, ~2 t CO₂e/yr). */
export const PARIS_BUDGET_KG_PER_YEAR = 2_000;

/** Rough global mean per-capita lifestyle footprint, kg CO₂e/yr. */
export const GLOBAL_AVG_KG_PER_YEAR = 4_700;

/** Approximate working / commuting days per year. */
export const COMMUTE_DAYS_PER_YEAR = 240;

/** Reference round-trip distance for a long-haul flight, km. */
export const LONG_HAUL_RETURN_KM = 11_000;

/** Meals per day baseline used in dietary estimates. */
export const MEALS_PER_DAY = 2;

/** Days per year used in dietary estimates. */
export const DAYS_PER_YEAR = 365;

/** Default 30-day rolling window for dashboards / coach grounding. */
export const ROLLING_WINDOW_DAYS = 30;

/** Max coach messages per user per hour (defense-in-depth + cost guard). */
export const COACH_MESSAGES_PER_HOUR = 30;

/** Milliseconds in one day. Centralized to avoid `n * 86_400_000` magic numbers. */
export const MS_PER_DAY = 86_400_000;
