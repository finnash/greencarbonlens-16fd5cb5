import { describe, expect, it } from "vitest";
import {
  COACH_MESSAGES_PER_HOUR,
  COMMUTE_DAYS_PER_YEAR,
  DAYS_PER_YEAR,
  GLOBAL_AVG_KG_PER_YEAR,
  LONG_HAUL_RETURN_KM,
  MEALS_PER_DAY,
  PARIS_BUDGET_KG_PER_YEAR,
  ROLLING_WINDOW_DAYS,
} from "./constants";

describe("carbon constants", () => {
  it("are all positive integers in plausible ranges", () => {
    expect(PARIS_BUDGET_KG_PER_YEAR).toBeGreaterThan(0);
    expect(PARIS_BUDGET_KG_PER_YEAR).toBeLessThan(GLOBAL_AVG_KG_PER_YEAR);
    expect(GLOBAL_AVG_KG_PER_YEAR).toBeGreaterThan(1_000);
    expect(COMMUTE_DAYS_PER_YEAR).toBeGreaterThan(0);
    expect(COMMUTE_DAYS_PER_YEAR).toBeLessThan(366);
    expect(LONG_HAUL_RETURN_KM).toBeGreaterThan(5_000);
    expect(MEALS_PER_DAY).toBe(2);
    expect(DAYS_PER_YEAR).toBe(365);
    expect(ROLLING_WINDOW_DAYS).toBe(30);
    expect(COACH_MESSAGES_PER_HOUR).toBeGreaterThan(0);
  });
});
