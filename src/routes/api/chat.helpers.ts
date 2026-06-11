/**
 * Pure helpers extracted from the streaming `/api/chat` handler so the
 * branching, prompt-building and date-math logic can be unit-tested
 * without spinning up the AI gateway or Supabase.
 */
import type { UIMessage } from "ai";

import { formatKgCo2e } from "@/lib/carbon/calculator";
import { FACTORS, type FactorSlug } from "@/lib/carbon/factors";

/** Extract the concatenated text content from a single AI-SDK UI message. */
export function extractText(message: UIMessage | undefined): string {
  if (!message) return "";
  const parts = (message as { parts?: Array<{ type: string; text?: string }> }).parts;
  if (!parts) return "";
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

/** Truncate `now` to the start of the current hour — the rate-limit bucket. */
export function rateLimitWindowStart(now: Date): Date {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  return d;
}

/** Shape of a single activity row used to ground the model. */
export interface GroundingActivity {
  factor_slug: string;
  category: string;
  amount: number;
  unit: string;
  kg_co2e: number;
}

/** Shape of the profile fields the prompt references. */
export interface GroundingProfile {
  display_name: string | null;
  baseline_kg_co2e_year: number | null;
  country_code: string | null;
}

/**
 * Build the system-level grounding prompt that anchors the model in the
 * caller's real activity log. Pure — given the same inputs it always
 * returns the same string, which makes snapshot/contract testing easy.
 */
export function buildGroundingPrompt(
  profile: GroundingProfile | null,
  activities: ReadonlyArray<GroundingActivity>,
  last30TotalKg: number,
): string {
  const totals: Record<string, number> = {};
  for (const a of activities) {
    totals[a.category] = (totals[a.category] ?? 0) + Number(a.kg_co2e);
  }
  const top = activities
    .slice(0, 8)
    .map((a) => {
      const meta = FACTORS[a.factor_slug as FactorSlug];
      return `- ${meta?.name ?? a.factor_slug}: ${a.amount} ${a.unit} → ${formatKgCo2e(Number(a.kg_co2e))}`;
    })
    .join("\n");
  const categoryLine =
    Object.entries(totals)
      .map(([k, v]) => `${k}=${formatKgCo2e(v)}`)
      .join(", ") || "no data yet";
  const baselineLine = profile?.baseline_kg_co2e_year
    ? formatKgCo2e(Number(profile.baseline_kg_co2e_year)) + "/yr"
    : "not estimated yet";

  return `User profile:
- Name: ${profile?.display_name ?? "friend"}
- Country: ${profile?.country_code ?? "unknown"}
- Annual baseline: ${baselineLine}

Last 30 days total: ${formatKgCo2e(last30TotalKg)} across ${activities.length} activities.
Per-category totals: ${categoryLine}

Recent entries:
${top || "(no activities logged yet — encourage the user to log a few)"}`;
}