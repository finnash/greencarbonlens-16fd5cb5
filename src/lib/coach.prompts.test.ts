/**
 * Pin the coach starter-prompt catalogue. These strings are surfaced as
 * suggestion chips on the empty state and used by analytics, so reordering
 * or renaming them is a breaking UX change that must go through review.
 */
import { describe, expect, it } from "vitest";

import { SUGGESTED_PROMPTS } from "@/components/coach/EmptyState";

describe("coach suggested prompts", () => {
  it("exposes between 3 and 6 starter prompts", () => {
    expect(SUGGESTED_PROMPTS.length).toBeGreaterThanOrEqual(3);
    expect(SUGGESTED_PROMPTS.length).toBeLessThanOrEqual(6);
  });

  it("every prompt is a non-empty question", () => {
    for (const p of SUGGESTED_PROMPTS) {
      expect(typeof p).toBe("string");
      expect(p.trim().length).toBeGreaterThan(8);
      expect(p.trim().endsWith("?") || p.trim().endsWith(".")).toBe(true);
    }
  });

  it("prompts are unique", () => {
    const set = new Set(SUGGESTED_PROMPTS);
    expect(set.size).toBe(SUGGESTED_PROMPTS.length);
  });
});
