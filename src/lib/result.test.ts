import { describe, expect, it } from "vitest";
import { err, isErr, isOk, map, ok, tryCatch, unwrapOr } from "./result";

describe("Result helper", () => {
  it("constructs ok and err variants", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err("oops")).toEqual({ ok: false, error: "oops" });
  });

  it("isOk / isErr narrow correctly", () => {
    const a = ok(42);
    const b = err(new Error("x"));
    expect(isOk(a)).toBe(true);
    expect(isErr(b)).toBe(true);
    expect(isOk(b)).toBe(false);
    expect(isErr(a)).toBe(false);
  });

  it("map only touches the ok branch", () => {
    expect(map(ok(2), (n) => n * 3)).toEqual({ ok: true, value: 6 });
    expect(map(err("e"), (n: number) => n * 3)).toEqual({ ok: false, error: "e" });
  });

  it("unwrapOr falls back on err", () => {
    expect(unwrapOr(ok(7), 0)).toBe(7);
    expect(unwrapOr(err("e"), 0)).toBe(0);
  });

  it("tryCatch wraps thrown errors as Err<Error>", async () => {
    const good = await tryCatch(async () => 1);
    expect(good).toEqual({ ok: true, value: 1 });
    const bad = await tryCatch(async () => {
      throw new Error("boom");
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error.message).toBe("boom");
  });

  it("tryCatch normalizes non-Error throws", async () => {
    const r = await tryCatch(() => {
      throw "string-throw";
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBeInstanceOf(Error);
  });
});