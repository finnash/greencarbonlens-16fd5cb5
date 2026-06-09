/**
 * Activity log server functions.
 *
 * All inputs are re-validated with zod server-side. kg_co2e is computed from
 * the trusted local factor table so the client cannot inflate or deflate
 * a user's footprint by lying about the multiplier.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeKgCo2e } from "@/lib/carbon/calculator";
import { FACTORS, type FactorSlug } from "@/lib/carbon/factors";
import { ACTIVITY_CATEGORIES } from "@/lib/carbon/types";

const factorSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .refine((s): s is FactorSlug => s in FACTORS, "unknown factor slug");

const logInput = z.object({
  factor_slug: factorSlugSchema,
  amount: z.number().finite().min(0).max(100_000),
  occurred_at: z.string().datetime().optional(),
  notes: z.string().trim().max(280).optional(),
});

/** Insert one activity entry for the authenticated user. */
export const logActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => logInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const slug = data.factor_slug as FactorSlug;
    const factor = FACTORS[slug];
    const kg = computeKgCo2e(slug, data.amount);
    const { data: row, error } = await supabase
      .from("activities")
      .insert({
        user_id: userId,
        factor_slug: slug,
        category: factor.category,
        unit: factor.unit,
        amount: data.amount,
        kg_co2e: kg,
        occurred_at: data.occurred_at ?? new Date().toISOString(),
        notes: data.notes ?? null,
      })
      .select("id, factor_slug, category, unit, amount, kg_co2e, occurred_at, notes")
      .single();
    if (error) throw new Error(error.message);
    return { activity: row };
  });

const listInput = z.object({
  /** Inclusive lower bound (ISO date or datetime). */
  since: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

/** List the authenticated user's activities, newest first. */
export const listActivities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listInput.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const since = data.since ?? new Date(Date.now() - 30 * 86_400_000).toISOString();
    const limit = data.limit ?? 200;
    const { data: rows, error } = await supabase
      .from("activities")
      .select("id, factor_slug, category, unit, amount, kg_co2e, occurred_at, notes")
      .eq("user_id", userId)
      .gte("occurred_at", since)
      .order("occurred_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    const valid = new Set<string>(ACTIVITY_CATEGORIES);
    return {
      activities: (rows ?? []).map((r) => ({
        ...r,
        category: valid.has(r.category) ? r.category : "other",
      })),
    };
  });

const deleteInput = z.object({ id: z.string().uuid() });

/** Delete one activity owned by the authenticated user. */
export const deleteActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => deleteInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });