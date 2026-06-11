/**
 * Pure helpers extracted from `challenges.functions.ts` so the date math
 * can be unit-tested in isolation without spinning up a Supabase mock.
 */
import { MS_PER_DAY } from "@/lib/carbon/constants";

/**
 * Compute the `ends_at` timestamp for a joined challenge.
 *
 * Pure — no clock reads, no side effects, returns a brand-new `Date`
 * so the caller's `startedAt` reference is never mutated.
 */
export function computeEndsAt(startedAt: Date, durationDays: number): Date {
  return new Date(startedAt.getTime() + durationDays * MS_PER_DAY);
}