/**
 * Visual smoke test for the dashboard KPI tile. Asserts that the label,
 * value, and suffix are all rendered as accessible text.
 */
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { StatCard } from "./StatCard";

afterEach(() => cleanup());

describe("StatCard", () => {
  it("renders label / value / suffix", () => {
    render(<StatCard label="Annual baseline" value="2.40 t" suffix="CO2e / yr" />);
    expect(screen.getByText("Annual baseline")).toBeTruthy();
    expect(screen.getByText("2.40 t")).toBeTruthy();
    expect(screen.getByText("CO2e / yr")).toBeTruthy();
  });
});