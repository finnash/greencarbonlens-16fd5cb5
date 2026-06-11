/**
 * Tests for pure date-math helpers extracted from challenges.functions.ts.
 *
 * IO-split note: the ends_at computation is currently inlined in joinChallenge.
 * Extract it as:
 *   export function computeEndsAt(startedAt: Date, durationDays: number): Date {
 *     return new Date(startedAt.getTime() + durationDays * 86_400_000);
 *   }
 * then replace the import here.
 */
import { describe, expect, it } from "vitest";

function computeEndsAt(startedAt: Date, durationDays: number): Date {
  return new Date(startedAt.getTime() + durationDays * 86_400_000);
}

describe("computeEndsAt()", () => {
  it("adds the correct number of milliseconds", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const end = computeEndsAt(start, 30);
    expect(end.toISOString()).toBe("2025-01-31T00:00:00.000Z");
  });

  it("handles a 1-day challenge", () => {
    const start = new Date("2025-03-10T08:00:00.000Z");
    const end = computeEndsAt(start, 1);
    expect(end.getTime() - start.getTime()).toBe(86_400_000);
  });

  it("handles a 0-day challenge (ends immediately)", () => {
    const start = new Date("2025-03-10T08:00:00.000Z");
    expect(computeEndsAt(start, 0).toISOString()).toBe(start.toISOString());
  });

  it("does not mutate the input date", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const orig = start.getTime();
    computeEndsAt(start, 7);
    expect(start.getTime()).toBe(orig);
  });

  it("endsAt is always after startedAt for positive durations", () => {
    const start = new Date();
    expect(computeEndsAt(start, 14).getTime()).toBeGreaterThan(start.getTime());
  });
});
