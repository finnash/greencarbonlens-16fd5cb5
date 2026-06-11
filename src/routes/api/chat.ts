/**
 * Streaming AI Coach endpoint.
 *
 * - Auth: verifies the Supabase access token sent in `Authorization: Bearer`.
 * - Rate limit: 30 messages / user / hour (server-enforced, atomic upsert).
 * - Grounding: fetches the user's last-30-day activities + profile baseline
 *   so the model gives advice tailored to the user's real footprint.
 * - Persistence: both user prompt and assistant reply are saved to
 *   `coach_messages` (RLS-scoped). Streaming is preserved via `onFinish`.
 */
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";
import { sumEmissions } from "@/lib/carbon/calculator";
import {
  COACH_MESSAGES_PER_HOUR,
  MS_PER_DAY,
  ROLLING_WINDOW_DAYS,
} from "@/lib/carbon/constants";
import { buildGroundingPrompt, extractText, rateLimitWindowStart } from "./chat.helpers";

/** Hard caps on conversation history sent in one POST. */
const MAX_MESSAGES = 50;
const MAX_USER_TEXT_CHARS = 4_000;

/** Zod schema for the inbound chat body — defense-in-depth, never trust the client. */
const chatBodySchema = z.object({
  messages: z
    .array(z.object({ id: z.string().optional(), role: z.string() }).passthrough())
    .min(1)
    .max(MAX_MESSAGES),
});

const SYSTEM_PROMPT = `You are CarbonLens Coach, an evidence-based sustainability assistant.

Style: warm, concrete, never preachy. Use the user's data when present.
Always reference numbers in kg CO₂e. Suggest concrete next actions ranked by impact.
If the user asks something off-topic, gently steer back to climate / footprint.
Keep responses under 220 words unless the user asks for detail.
Render with markdown (lists, **bold**). Never invent factors — only cite the user's logged data or well-known IPCC/IEA averages.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Backend not configured", { status: 500 });
        }
        if (!LOVABLE_API_KEY) {
          return new Response("AI gateway not configured", { status: 500 });
        }

        const authHeader = request.headers.get("authorization") ?? "";
        if (!authHeader.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claimRes, error: claimErr } = await supabase.auth.getClaims(token);
        const userId = claimRes?.claims?.sub;
        if (claimErr || !userId) {
          return new Response("Unauthorized", { status: 401 });
        }

        // ---- Rate limit (hour bucket) ----
        const winIso = rateLimitWindowStart(new Date()).toISOString();
        const { data: existing } = await supabase
          .from("rate_limits")
          .select("count")
          .eq("user_id", userId)
          .eq("bucket", "coach_chat")
          .eq("window_start", winIso)
          .maybeSingle();
        const current = existing?.count ?? 0;
        if (current >= COACH_MESSAGES_PER_HOUR) {
          return new Response("Rate limit reached. Try again next hour.", { status: 429 });
        }
        await supabase.from("rate_limits").upsert(
          {
            user_id: userId,
            bucket: "coach_chat",
            window_start: winIso,
            count: current + 1,
          },
          { onConflict: "user_id,bucket,window_start" },
        );

        // ---- Parse body ----
        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = chatBodySchema.safeParse(rawBody);
        if (!parsed.success) {
          return new Response("Invalid request body", { status: 400 });
        }
        const messages = parsed.data.messages as unknown as UIMessage[];

        // ---- Ground the model in the user's real data ----
        const since = new Date(Date.now() - ROLLING_WINDOW_DAYS * MS_PER_DAY).toISOString();
        const [{ data: acts }, { data: profile }] = await Promise.all([
          supabase
            .from("activities")
            .select("factor_slug, category, amount, unit, kg_co2e, occurred_at")
            .eq("user_id", userId)
            .gte("occurred_at", since)
            .order("occurred_at", { ascending: false })
            .limit(100),
          supabase
            .from("profiles")
            .select("display_name, baseline_kg_co2e_year, country_code")
            .eq("id", userId)
            .maybeSingle(),
        ]);

        const activityList = acts ?? [];
        const last30 = sumEmissions(activityList as { kg_co2e: number }[]);
        const groundingPrompt = buildGroundingPrompt(profile ?? null, activityList, last30);

        // ---- Persist user message (last UI message text) ----
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const userText = extractText(lastUser).slice(0, MAX_USER_TEXT_CHARS);
        if (userText) {
          await supabase.from("coach_messages").insert({
            user_id: userId,
            role: "user",
            content: userText,
          });
        }

        // ---- Stream from Lovable AI Gateway ----
        const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
        const gateway = createLovableAiGatewayProvider(LOVABLE_API_KEY);
        const model = gateway("google/gemini-3-flash-preview");

        try {
          const result = streamText({
            model,
            system: SYSTEM_PROMPT,
            messages: [
              { role: "system", content: groundingPrompt },
              ...(await convertToModelMessages(messages)),
            ],
            onFinish: async ({ text }) => {
              if (text?.trim()) {
                await supabase.from("coach_messages").insert({
                  user_id: userId,
                  role: "assistant",
                  content: text,
                });
              }
            },
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages });
        } catch (err) {
          // Log only the message — full error objects can echo upstream
          // provider response bodies and accidentally surface user prompts.
          const safeMsg = err instanceof Error ? err.message : "unknown";
          console.error("[chat] streamText error", { message: safeMsg });
          return new Response("AI request failed", { status: 502 });
        }
      },
    },
  },
});
