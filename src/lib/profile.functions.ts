/**
 * Profile-related server functions.
 *
 * These run in the Worker runtime through TanStack Start, are protected by
 * `requireSupabaseAuth`, and re-validate inputs server-side via zod so the
 * client can never write unchecked data into Postgres.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { estimateBaselineKgPerYear } from "@/lib/carbon/calculator";
import { quizSchema } from "@/lib/carbon/quiz";

/** Read the authenticated user's profile (creates implicitly via DB trigger). */
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, handle, country_code, baseline_kg_co2e_year, onboarding_completed")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

/** Read profile + quiz answers (used by the What-If simulator). */
export const getMyProfileFull = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, baseline_kg_co2e_year, onboarding_completed, quiz_answers")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

const completeInput = z.object({
  display_name: z.string().trim().min(1).max(60).optional(),
  answers: quizSchema,
});

/** Persist quiz answers + computed baseline + mark onboarding done. */
export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => completeInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const baseline = estimateBaselineKgPerYear(data.answers);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: data.display_name ?? null,
        baseline_kg_co2e_year: baseline.total,
        onboarding_completed: true,
        quiz_answers: data.answers,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { baseline };
  });
