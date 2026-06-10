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

import type { Database } from "@/integrations/supabase/types";
import { FACTORS, type FactorSlug } from "@/lib/carbon/factors";
import { formatKgCo2e, sumEmissions } from "@/lib/carbon/calculator";

const RATE_LIMIT_PER_HOUR = 30;

type ChatBody = { messages?: UIMessage[] };

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
        const windowStart = new Date();
        windowStart.setMinutes(0, 0, 0);
        const winIso = windowStart.toISOString();
        const { data: existing } = await supabase
          .from("rate_limits")
          .select("count")
          .eq("user_id", userId)
          .eq("bucket", "coach_chat")
          .eq("window_start", winIso)
          .maybeSingle();
        const current = existing?.count ?? 0;
        if (current >= RATE_LIMIT_PER_HOUR) {
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
        let body: ChatBody;
        try {
          body = (await request.json()) as ChatBody;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
          return new Response("messages required", { status: 400 });
        }

        // ---- Ground the model in the user's real data ----
        const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
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
        const totals: Record<string, number> = {};
        for (const a of activityList) {
          totals[a.category] = (totals[a.category] ?? 0) + Number(a.kg_co2e);
        }
        const last30 = sumEmissions(activityList as { kg_co2e: number }[]);
        const topFactors = activityList
          .slice(0, 8)
          .map((a) => {
            const meta = FACTORS[a.factor_slug as FactorSlug];
            return `- ${meta?.name ?? a.factor_slug}: ${a.amount} ${a.unit} → ${formatKgCo2e(Number(a.kg_co2e))}`;
          })
          .join("\n");

        const groundingPrompt = `User profile:
- Name: ${profile?.display_name ?? "friend"}
- Country: ${profile?.country_code ?? "unknown"}
- Annual baseline: ${profile?.baseline_kg_co2e_year ? formatKgCo2e(Number(profile.baseline_kg_co2e_year)) + "/yr" : "not estimated yet"}

Last 30 days total: ${formatKgCo2e(last30)} across ${activityList.length} activities.
Per-category totals: ${
          Object.entries(totals)
            .map(([k, v]) => `${k}=${formatKgCo2e(v)}`)
            .join(", ") || "no data yet"
        }

Recent entries:
${topFactors || "(no activities logged yet — encourage the user to log a few)"}`;

        // ---- Persist user message (last UI message text) ----
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const userText = extractText(lastUser);
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
          const msg = err instanceof Error ? err.message : "AI request failed";
          console.error("[chat] streamText error", err);
          return new Response(msg, { status: 502 });
        }
      },
    },
  },
});

function extractText(message: UIMessage | undefined): string {
  if (!message) return "";
  const parts = (message as { parts?: Array<{ type: string; text?: string }> }).parts;
  if (!parts) return "";
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}
