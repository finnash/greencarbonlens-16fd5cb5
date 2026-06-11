/**
 * Coach chat history server functions. All RLS-scoped to the caller.
 *
 * Both functions defensively call `.inputValidator()` even though neither
 * accepts inbound data — the empty schema makes the "no extra fields"
 * contract explicit for both readers and security audit tooling.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Return the authenticated user's coach chat history, oldest first. */
export const getCoachHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({}).optional().parse(data ?? {}))
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("coach_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return { messages: data ?? [] };
  });

/** Delete every coach message owned by the authenticated user. */
export const clearCoachHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({}).optional().parse(data ?? {}))
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("coach_messages").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
