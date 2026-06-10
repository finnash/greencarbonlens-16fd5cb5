/**
 * Smoke test for the coach empty-state component. Verifies that suggested
 * prompts render and that picking one fires the supplied handler.
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { CoachEmptyState, SUGGESTED_PROMPTS } from "./EmptyState";

afterEach(() => cleanup());

describe("CoachEmptyState", () => {
  it("renders every suggested prompt", () => {
    render(<CoachEmptyState onPick={() => {}} />);
    for (const prompt of SUGGESTED_PROMPTS) {
      expect(screen.getByText(prompt)).toBeTruthy();
    }
  });

  it("invokes onPick with the clicked prompt", () => {
    const onPick = vi.fn();
    render(<CoachEmptyState onPick={onPick} />);
    fireEvent.click(screen.getByText(SUGGESTED_PROMPTS[0]));
    expect(onPick).toHaveBeenCalledWith(SUGGESTED_PROMPTS[0]);
  });
});