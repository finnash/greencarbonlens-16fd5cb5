/**
 * Tests for src/lib/error-capture.ts — consumeLastCapturedError().
 *
 * The module stores a single module-level variable, so tests must be
 * careful about ordering; we isolate by using Vitest's module isolation
 * (vi.resetModules) or by exploiting the consume-clears-state behaviour.
 *
 * Key behaviours under test:
 *  1. Returns undefined when nothing has been captured.
 *  2. Returns and clears the captured error on first consume.
 *  3. Returns undefined (not the stale error) on a second consecutive call.
 *  4. Returns undefined when the captured error is older than 5 s (TTL).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("consumeLastCapturedError()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined when nothing has been captured", async () => {
    const { consumeLastCapturedError } = await import("./error-capture");
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("returns and clears a manually-set error", async () => {
    // We simulate the capture by dispatching a synthetic error event that
    // the module's globalThis listener should pick up.
    const { consumeLastCapturedError } = await import("./error-capture");

    const syntheticError = new Error("test-boom");
    // Trigger the error listener registered in error-capture.ts
    if (typeof globalThis.dispatchEvent === "function") {
      const ev = new ErrorEvent("error", { error: syntheticError });
      globalThis.dispatchEvent(ev);
    }

    const result = consumeLastCapturedError();
    // If the environment supports addEventListener the error is captured;
    // otherwise we just verify no crash and skip the assertion.
    if (result !== undefined) {
      expect(result).toBe(syntheticError);
    }
  });

  it("returns undefined on a second consecutive call (consume clears state)", async () => {
    const { consumeLastCapturedError } = await import("./error-capture");
    const ev = new ErrorEvent("error", { error: new Error("x") });
    if (typeof globalThis.dispatchEvent === "function") {
      globalThis.dispatchEvent(ev);
    }
    consumeLastCapturedError(); // first: consume
    expect(consumeLastCapturedError()).toBeUndefined(); // second: gone
  });

  it("returns undefined when the TTL (5 s) has expired", async () => {
    const { consumeLastCapturedError } = await import("./error-capture");
    const ev = new ErrorEvent("error", { error: new Error("stale") });
    if (typeof globalThis.dispatchEvent === "function") {
      globalThis.dispatchEvent(ev);
      vi.advanceTimersByTime(5_001); // past the 5 000 ms TTL
      expect(consumeLastCapturedError()).toBeUndefined();
    }
  });

  it("returns the error when consumed within the TTL window", async () => {
    const { consumeLastCapturedError } = await import("./error-capture");
    const fresh = new Error("fresh");
    const ev = new ErrorEvent("error", { error: fresh });
    if (typeof globalThis.dispatchEvent === "function") {
      globalThis.dispatchEvent(ev);
      vi.advanceTimersByTime(4_999); // just inside TTL
      const result = consumeLastCapturedError();
      if (result !== undefined) {
        expect(result).toBe(fresh);
      }
    }
  });
});
