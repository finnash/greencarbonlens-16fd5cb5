/**
 * Schema-level tests for profile server functions.
 * Exercises the completeInput zod schema directly — no Supabase needed.
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { quizSchema } from "@/lib/carbon/quiz";

const completeInput = z.object({
  display_name: z.string().trim().min(1).max(60).optional(),
  answers: quizSchema,
});

const VALID_ANSWERS = {
  commute: "transit" as const,
  commute_km_per_day: 10,
  diet: "vegetarian" as const,
  electricity_kwh_month: 250,
  flights_long_per_year: 0,
};

describe("completeInput schema", () => {
  it("accepts valid answers without a display_name", () => {
    expect(completeInput.safeParse({ answers: VALID_ANSWERS }).success).toBe(true);
  });

  it("accepts answers with an optional display_name", () => {
    expect(
      completeInput.safeParse({ display_name: "Ada", answers: VALID_ANSWERS }).success,
    ).toBe(true);
  });

  it("rejects display_name longer than 60 characters", () => {
    expect(
      completeInput.safeParse({ display_name: "x".repeat(61), answers: VALID_ANSWERS }).success,
    ).toBe(false);
  });

  it("rejects empty display_name string", () => {
    expect(
      completeInput.safeParse({ display_name: "", answers: VALID_ANSWERS }).success,
    ).toBe(false);
  });

  it("trims whitespace from display_name", () => {
    const r = completeInput.safeParse({ display_name: "  Ada  ", answers: VALID_ANSWERS });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.display_name).toBe("Ada");
  });

  it("rejects missing answers", () => {
    expect(completeInput.safeParse({ display_name: "Ada" }).success).toBe(false);
  });

  it("rejects invalid commute value in answers", () => {
    expect(
      completeInput.safeParse({
        answers: { ...VALID_ANSWERS, commute: "rocket" },
      }).success,
    ).toBe(false);
  });

  it("rejects flights_long_per_year above 50", () => {
    expect(
      completeInput.safeParse({
        answers: { ...VALID_ANSWERS, flights_long_per_year: 51 },
      }).success,
    ).toBe(false);
  });
});
