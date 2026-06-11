/**
 * Tests for src/lib/utils.ts — the cn() className helper.
 *
 * cn() composes clsx + tailwind-merge, so the interesting cases are:
 *   - conditional classes (clsx behaviour)
 *   - conflicting Tailwind utilities that must be de-duped (twMerge behaviour)
 *   - edge inputs (falsy, arrays, objects)
 */
import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn()", () => {
  it("joins plain string arguments", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("handles conditional object syntax from clsx", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500");
  });

  it("de-duplicates conflicting Tailwind utilities (last wins)", () => {
    // twMerge must resolve p-2 vs p-4 to p-4
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("de-duplicates text colour utilities", () => {
    expect(cn("text-sm text-red-500", "text-blue-600")).toBe("text-sm text-blue-600");
  });

  it("returns empty string when called with no truthy arguments", () => {
    expect(cn()).toBe("");
    expect(cn(false, undefined)).toBe("");
  });

  it("accepts array syntax from clsx", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("is idempotent — calling twice with same input yields same output", () => {
    const a = cn("flex items-center gap-2");
    const b = cn("flex items-center gap-2");
    expect(a).toBe(b);
  });
});
