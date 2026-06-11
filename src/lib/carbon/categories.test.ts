/**
 * Contract test: ACTIVITY_CATEGORIES must stay in sync with the Postgres
 * `activity_category` enum and with every factor entry's category field.
 *
 * If this test fails after a schema migration you need to update
 * src/lib/carbon/types.ts to match the new DB enum values.
 */
import { describe, expect, it } from "vitest";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "./types";
import { FACTOR_LIST } from "./factors";

describe("ACTIVITY_CATEGORIES contract", () => {
  it("contains the expected 7 canonical values", () => {
    const expected = ["transport", "energy", "food", "shopping", "travel", "waste", "other"];
    expect([...ACTIVITY_CATEGORIES].sort()).toEqual(expected.sort());
  });

  it("has no duplicate entries", () => {
    const set = new Set<string>(ACTIVITY_CATEGORIES);
    expect(set.size).toBe(ACTIVITY_CATEGORIES.length);
  });

  it("every emission factor's category belongs to ACTIVITY_CATEGORIES", () => {
    const valid = new Set<string>(ACTIVITY_CATEGORIES);
    for (const f of FACTOR_LIST) {
      expect(valid.has(f.category), `factor ${f.slug} has unknown category: ${f.category}`).toBe(
        true,
      );
    }
  });

  it("includes 'other' as a catch-all category", () => {
    expect((ACTIVITY_CATEGORIES as readonly string[]).includes("other")).toBe(true);
  });

  it("is a readonly tuple (runtime check: array is frozen or const)", () => {
    // The TypeScript `as const` means mutations would be type errors.
    // At runtime we verify the array cannot be mutated.
    expect(() => {
      (ACTIVITY_CATEGORIES as ActivityCategory[]).push("illegal" as ActivityCategory);
    }).toThrow();
  });
});
