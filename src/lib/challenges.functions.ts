/**
 * Sustainability challenges + leaderboard server functions.
 *
 * All inputs validated with zod. Mutations are scoped to the caller via
 * RLS (Supabase client uses the user's JWT). The leaderboard reads from
 * `leaderboard_view`, a SECURITY INVOKER view that re-applies RLS.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLogger } from "@/lib/logger";

const log = createLogger("challenges");

/** Public challenge row exposed to the UI. */
export interface ChallengeRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  duration_days: number;
  expected_kg_co2e_saved: number;
  difficulty: number;
}

/** A user's join-state for a challenge. */
export interface UserChallengeRow {
  id: string;
  challenge_id: string;
  status: "active" | "completed" | "abandoned";
  started_at: string;
  ends_at: string;
  completed_at: string | null;
  kg_co2e_saved: number;
}

const joinInput = z.object({ challenge_id: z.string().uuid() });
const updateInput = z.object({
  user_challenge_id: z.string().uuid(),
  status: z.enum(["active", "completed", "abandoned"]),
  kg_co2e_saved: z.number().finite().min(0).max(10_000).optional(),
});

/** List every active challenge in the catalogue. Public-safe (no PII). */
export const listChallenges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("challenges")
      .select("id, slug, title, description, category, duration_days, expected_kg_co2e_saved, difficulty")
      .eq("is_active", true)
      .order("difficulty", { ascending: true });
    if (error) {
      log.error("listChallenges failed", { code: error.code });
      throw new Error(error.message);
    }
    return { challenges: (data ?? []) as ChallengeRow[] };
  });

/** List the caller's joined challenges. */
export const listMyChallenges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_challenges")
      .select("id, challenge_id, status, started_at, ends_at, completed_at, kg_co2e_saved")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });
    if (error) {
      log.error("listMyChallenges failed", { code: error.code });
      throw new Error(error.message);
    }
    return { entries: (data ?? []) as UserChallengeRow[] };
  });

/**
 * Join a challenge. Computes `ends_at` server-side from the catalogue
 * duration so the client cannot extend the window artificially.
 */
export const joinChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => joinInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: ch, error: chErr } = await supabase
      .from("challenges")
      .select("id, duration_days, is_active")
      .eq("id", data.challenge_id)
      .maybeSingle();
    if (chErr) throw new Error(chErr.message);
    if (!ch || !ch.is_active) throw new Error("Challenge not found");

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + ch.duration_days * 86_400_000);
    const { data: row, error } = await supabase
      .from("user_challenges")
      .insert({
        user_id: userId,
        challenge_id: ch.id,
        status: "active",
        started_at: startedAt.toISOString(),
        ends_at: endsAt.toISOString(),
        kg_co2e_saved: 0,
      })
      .select("id, challenge_id, status, started_at, ends_at, completed_at, kg_co2e_saved")
      .single();
    if (error) throw new Error(error.message);
    return { entry: row as UserChallengeRow };
  });

/** Mark a user's challenge entry as completed/abandoned and record savings. */
export const updateMyChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: {
      status: typeof data.status;
      completed_at?: string | null;
      kg_co2e_saved?: number;
    } = { status: data.status };
    if (data.status === "completed") patch.completed_at = new Date().toISOString();
    if (typeof data.kg_co2e_saved === "number") patch.kg_co2e_saved = data.kg_co2e_saved;
    const { error } = await supabase
      .from("user_challenges")
      .update(patch)
      .eq("id", data.user_challenge_id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Anonymized leaderboard (week + all-time). Top 50 only. */
export const getLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("leaderboard_view")
      .select("user_id, handle, week_kg_saved, total_kg_saved, completed_count")
      .order("total_kg_saved", { ascending: false })
      .limit(50);
    if (error) {
      log.error("getLeaderboard failed", { code: error.code });
      throw new Error(error.message);
    }
    return {
      rows: (data ?? []).map((r) => ({
        user_id: r.user_id as string,
        handle: (r.handle as string | null) ?? "Anonymous",
        week_kg_saved: Number(r.week_kg_saved ?? 0),
        total_kg_saved: Number(r.total_kg_saved ?? 0),
        completed_count: Number(r.completed_count ?? 0),
      })),
    };
  });