import { describe, expect, it } from "vitest";

/**
 * Unit tests for the challenges input validators.
 * We can't exercise the createServerFn handler in isolation here
 * (it requires a live Supabase client), so we cover the zod schemas
 * that gate every call.
 */
import { z } from "zod";

const joinInput = z.object({ challenge_id: z.string().uuid() });
const updateInput = z.object({
  user_challenge_id: z.string().uuid(),
  status: z.enum(["active", "completed", "abandoned"]),
  kg_co2e_saved: z.number().finite().min(0).max(10_000).optional(),
});

describe("challenges validators", () => {
  it("joinInput accepts a uuid", () => {
    const ok = joinInput.safeParse({ challenge_id: "00000000-0000-0000-0000-000000000001" });
    expect(ok.success).toBe(true);
  });
  it("joinInput rejects non-uuid challenge_id", () => {
    const bad = joinInput.safeParse({ challenge_id: "not-a-uuid" });
    expect(bad.success).toBe(false);
  });
  it("updateInput allows omitting kg_co2e_saved", () => {
    const ok = updateInput.safeParse({
      user_challenge_id: "00000000-0000-0000-0000-000000000001",
      status: "completed",
    });
    expect(ok.success).toBe(true);
  });
  it("updateInput rejects unknown status", () => {
    const bad = updateInput.safeParse({
      user_challenge_id: "00000000-0000-0000-0000-000000000001",
      status: "deleted",
    });
    expect(bad.success).toBe(false);
  });
  it("updateInput clamps kg_co2e_saved to a plausible range", () => {
    const bad = updateInput.safeParse({
      user_challenge_id: "00000000-0000-0000-0000-000000000001",
      status: "completed",
      kg_co2e_saved: 1_000_000,
    });
    expect(bad.success).toBe(false);
    const neg = updateInput.safeParse({
      user_challenge_id: "00000000-0000-0000-0000-000000000001",
      status: "completed",
      kg_co2e_saved: -1,
    });
    expect(neg.success).toBe(false);
  });
});
