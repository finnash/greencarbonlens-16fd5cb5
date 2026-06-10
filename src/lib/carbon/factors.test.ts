import { describe, expect, it } from "vitest";
import { FACTOR_LIST, FACTORS, getFactor, type FactorSlug } from "./factors";
import { ACTIVITY_CATEGORIES } from "./types";

describe("emission factors table", () => {
  it("exposes every slug with positive (or zero) factors and a known category", () => {
    const cats = new Set<string>(ACTIVITY_CATEGORIES);
    for (const f of FACTOR_LIST) {
      expect(typeof f.slug).toBe("string");
      expect(f.kg_co2e_per_unit).toBeGreaterThanOrEqual(0);
      expect(cats.has(f.category)).toBe(true);
      expect(f.source.length).toBeGreaterThan(0);
      expect(f.unit.length).toBeGreaterThan(0);
    }
  });

  it("returns the same row from getFactor and the table map", () => {
    const slugs = Object.keys(FACTORS) as FactorSlug[];
    for (const slug of slugs) {
      expect(getFactor(slug)).toBe(FACTORS[slug]);
    }
  });

  it("throws on an unknown slug", () => {
    expect(() => getFactor("not_a_real_slug" as FactorSlug)).toThrow(/Unknown emission factor/);
  });

  it("declares walking and cycling as zero-emission", () => {
    expect(FACTORS.walking.kg_co2e_per_unit).toBe(0);
    expect(FACTORS.cycling.kg_co2e_per_unit).toBe(0);
  });
});