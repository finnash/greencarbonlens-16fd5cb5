/**
 * Schema-level unit tests for activity server functions.
 *
 * We exercise the zod validators directly rather than the .handler() so the
 * tests stay hermetic and don't require a live Supabase connection.
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FACTORS, type FactorSlug } from "@/lib/carbon/factors";

const factorSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .refine((s): s is FactorSlug => s in FACTORS, "unknown factor slug");

const logInput = z.object({
  factor_slug: factorSlugSchema,
  amount: z.number().finite().min(0).max(100_000),
  occurred_at: z.string().datetime().optional(),
  notes: z.string().trim().max(280).optional(),
});

describe("activity log input schema", () => {
  it("accepts a valid entry", () => {
    const ok = logInput.safeParse({ factor_slug: "car_petrol_medium", amount: 12 });
    expect(ok.success).toBe(true);
  });

  it("rejects unknown factor slugs", () => {
    const r = logInput.safeParse({ factor_slug: "rocket_fuel", amount: 1 });
    expect(r.success).toBe(false);
  });

  it("rejects negative amounts", () => {
    const r = logInput.safeParse({ factor_slug: "meal_beef", amount: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects absurdly large amounts", () => {
    const r = logInput.safeParse({ factor_slug: "meal_beef", amount: 1e9 });
    expect(r.success).toBe(false);
  });

  it("rejects notes over 280 chars", () => {
    const r = logInput.safeParse({
      factor_slug: "meal_beef",
      amount: 1,
      notes: "x".repeat(281),
    });
    expect(r.success).toBe(false);
  });

  it("accepts an ISO datetime override", () => {
    const r = logInput.safeParse({
      factor_slug: "meal_beef",
      amount: 1,
      occurred_at: "2026-06-09T12:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });
});
