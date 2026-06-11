/**
 * Shared test utilities.
 *
 * Provides typed fixture builders so individual test files stay focused on
 * assertions rather than boilerplate construction. Import from this file
 * instead of copy-pasting object literals across tests.
 *
 * Conventions:
 *  - `make*` builders return fully-typed objects with sensible defaults.
 *  - Partial overrides are accepted so tests read like diffs ("same as
 *    default except commute = car_petrol").
 *  - `makeSupabaseMock` returns the minimal Supabase client surface used
 *    by server functions so handler tests stay hermetic.
 */
import { vi } from "vitest";
import type { QuizAnswers } from "@/lib/carbon/types";
import type { ScenarioLevers } from "@/lib/carbon/simulator";
import type { ChallengeRow, UserChallengeRow } from "@/lib/challenges.functions";

// ---------------------------------------------------------------------------
// Quiz / Simulator fixtures
// ---------------------------------------------------------------------------

/** Low-carbon lifestyle — good baseline for "eco wins" assertions. */
export const ECO_ANSWERS: QuizAnswers = {
  commute: "bike_walk",
  commute_km_per_day: 5,
  diet: "vegan",
  electricity_kwh_month: 150,
  flights_long_per_year: 0,
};

/** High-carbon lifestyle — good baseline for "reduction potential" assertions. */
export const HEAVY_ANSWERS: QuizAnswers = {
  commute: "car_petrol",
  commute_km_per_day: 30,
  diet: "high_meat",
  electricity_kwh_month: 600,
  flights_long_per_year: 4,
};

export function makeQuizAnswers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return {
    commute: "transit",
    commute_km_per_day: 12,
    diet: "low_meat",
    electricity_kwh_month: 280,
    flights_long_per_year: 1,
    ...overrides,
  };
}

export function makeLevers(overrides: Partial<ScenarioLevers> = {}): ScenarioLevers {
  return {
    reduceCommutePct: 0,
    switchCommuteTo: "keep",
    renewableSharePct: 0,
    switchDietTo: "keep",
    flightsLongPerYear: -1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Challenge fixtures
// ---------------------------------------------------------------------------

let _challengeSeq = 0;
export function makeChallenge(overrides: Partial<ChallengeRow> = {}): ChallengeRow {
  const n = ++_challengeSeq;
  return {
    id: `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`,
    slug: `challenge-${n}`,
    title: `Challenge ${n}`,
    description: `Description ${n}`,
    category: "transport",
    duration_days: 30,
    expected_kg_co2e_saved: 50,
    difficulty: 1,
    ...overrides,
  };
}

let _ucSeq = 0;
export function makeUserChallenge(
  overrides: Partial<UserChallengeRow> = {},
): UserChallengeRow {
  const n = ++_ucSeq;
  const started = new Date("2025-01-01T00:00:00.000Z");
  const ends = new Date(started.getTime() + 30 * 86_400_000);
  return {
    id: `00000000-0000-0000-0001-${String(n).padStart(12, "0")}`,
    challenge_id: `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`,
    status: "active",
    started_at: started.toISOString(),
    ends_at: ends.toISOString(),
    completed_at: null,
    kg_co2e_saved: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Supabase mock factory
// ---------------------------------------------------------------------------

/**
 * Returns a chainable Supabase query-builder mock.
 *
 * Usage:
 *   const { supabase, resolveWith } = makeSupabaseMock();
 *   resolveWith({ data: [...], error: null });
 *   await handler({ context: { supabase, userId: "uid" } });
 */
export function makeSupabaseMock() {
  let _resolve: (v: { data: unknown; error: unknown }) => void = () => {};
  const pending = new Promise<{ data: unknown; error: unknown }>((r) => (_resolve = r));

  const chain: Record<string, () => unknown> = {};
  const proxy: unknown = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "then") return undefined; // prevent accidental await on the proxy
        if (prop === "maybeSingle" || prop === "single" || prop === "select") {
          if (prop === "maybeSingle" || prop === "single") return () => pending;
          return () => proxy;
        }
        return () => proxy;
      },
    },
  );

  const supabase = {
    from: vi.fn().mockReturnValue(proxy),
  };

  return {
    supabase: supabase as unknown as Parameters<typeof vi.fn>[0],
    resolveWith: (value: { data: unknown; error: unknown }) => _resolve(value),
    chain,
  };
}

// ---------------------------------------------------------------------------
// Timer helpers
// ---------------------------------------------------------------------------

/** Advance fake timers AND flush microtasks in one call. */
export async function advanceTime(ms: number) {
  const { vi: _vi } = await import("vitest");
  _vi.advanceTimersByTime(ms);
  await Promise.resolve();
}
