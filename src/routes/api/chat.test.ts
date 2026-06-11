/**
 * Tests for pure helpers extracted from src/routes/api/chat.ts.
 *
 * IO-split note: `extractText` and `buildGroundingPrompt` are currently
 * inlined in the route handler. These tests cover the logic by reproducing
 * the functions locally — when they are extracted and exported the imports
 * below should switch to the real module.
 */
import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";

// ---------------------------------------------------------------------------
// Inline reproduction of extractText (replace with import once exported)
// ---------------------------------------------------------------------------
function extractText(message: UIMessage | undefined): string {
  if (!message) return "";
  const parts = (message as { parts?: Array<{ type: string; text?: string }> }).parts;
  if (!parts) return "";
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

describe("extractText()", () => {
  it("returns empty string for undefined", () => {
    expect(extractText(undefined)).toBe("");
  });

  it("returns empty string when message has no parts", () => {
    expect(extractText({ role: "user" } as UIMessage)).toBe("");
  });

  it("concatenates all text parts", () => {
    const msg = {
      role: "user",
      parts: [
        { type: "text", text: "hello " },
        { type: "text", text: "world" },
      ],
    } as UIMessage;
    expect(extractText(msg)).toBe("hello world");
  });

  it("ignores non-text parts", () => {
    const msg = {
      role: "user",
      parts: [
        { type: "tool-call", text: "ignored" },
        { type: "text", text: "keep this" },
      ],
    } as UIMessage;
    expect(extractText(msg)).toBe("keep this");
  });

  it("returns empty string when all parts are non-text", () => {
    const msg = {
      role: "user",
      parts: [{ type: "tool-call", text: "nope" }],
    } as UIMessage;
    expect(extractText(msg)).toBe("");
  });

  it("handles a part with undefined text gracefully", () => {
    const msg = {
      role: "user",
      parts: [{ type: "text" }],
    } as UIMessage;
    expect(extractText(msg)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Rate-limit window-start helper (pure date math inlined in handler)
// ---------------------------------------------------------------------------
function rateLimitWindowStart(now: Date): Date {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  return d;
}

describe("rateLimitWindowStart()", () => {
  it("truncates to the current hour", () => {
    const input = new Date("2025-06-15T14:37:22.500Z");
    const w = rateLimitWindowStart(input);
    expect(w.getMinutes()).toBe(0);
    expect(w.getSeconds()).toBe(0);
    expect(w.getMilliseconds()).toBe(0);
    expect(w.getHours()).toBe(input.getHours());
  });

  it("is idempotent when input is already on-the-hour", () => {
    const onHour = new Date("2025-06-15T14:00:00.000Z");
    expect(rateLimitWindowStart(onHour).toISOString()).toBe(onHour.toISOString());
  });
});
