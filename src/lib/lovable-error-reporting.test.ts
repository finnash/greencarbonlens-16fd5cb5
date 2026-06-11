/**
 * Tests for src/lib/lovable-error-reporting.ts — reportLovableError().
 *
 * The function delegates to window.__lovableEvents?.captureException which
 * makes it IO-adjacent (browser-global side effect). Tests verify the call
 * signature and guard conditions without triggering real network traffic.
 *
 * Testability note: reportLovableError() already has a `typeof window`
 * guard, so it is safe to call in a happy-dom environment.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reportLovableError } from "./lovable-error-reporting";

describe("reportLovableError()", () => {
  const captureException = vi.fn();

  beforeEach(() => {
    captureException.mockClear();
    // Install the Lovable events hook onto the happy-dom window
    (window as Window & { __lovableEvents?: object }).__lovableEvents = { captureException };
  });

  afterEach(() => {
    delete (window as Window & { __lovableEvents?: object }).__lovableEvents;
  });

  it("calls captureException with the supplied error", () => {
    const err = new Error("oops");
    reportLovableError(err);
    expect(captureException).toHaveBeenCalledOnce();
    expect(captureException.mock.calls[0]![0]).toBe(err);
  });

  it("includes the current pathname in context", () => {
    reportLovableError(new Error("ctx"));
    const ctx = captureException.mock.calls[0]![1] as Record<string, unknown>;
    expect(ctx).toHaveProperty("route");
  });

  it("tags source as react_error_boundary", () => {
    reportLovableError(new Error("src"));
    const ctx = captureException.mock.calls[0]![1] as Record<string, unknown>;
    expect(ctx.source).toBe("react_error_boundary");
  });

  it("merges extra context keys into the call", () => {
    reportLovableError(new Error("extra"), { componentStack: "App > Foo" });
    const ctx = captureException.mock.calls[0]![1] as Record<string, unknown>;
    expect(ctx.componentStack).toBe("App > Foo");
  });

  it("passes severity=error and handled=false in options", () => {
    reportLovableError(new Error("opts"));
    const opts = captureException.mock.calls[0]![2] as Record<string, unknown>;
    expect(opts.severity).toBe("error");
    expect(opts.handled).toBe(false);
  });

  it("does not throw if __lovableEvents is not installed", () => {
    delete (window as Window & { __lovableEvents?: object }).__lovableEvents;
    expect(() => reportLovableError(new Error("silent"))).not.toThrow();
  });

  it("does not throw if captureException is missing from the events object", () => {
    (window as Window & { __lovableEvents?: object }).__lovableEvents = {};
    expect(() => reportLovableError(new Error("partial"))).not.toThrow();
  });
});
