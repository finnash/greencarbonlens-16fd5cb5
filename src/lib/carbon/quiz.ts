/**
 * Onboarding quiz definition.
 *
 * Pure data + zod schema so the UI can render generically and so the server
 * can re-validate any answers it receives before persisting them.
 */
import { z } from "zod";
import type { QuizAnswers } from "./types";

export const quizSchema = z.object({
  commute: z.enum(["car_petrol", "car_ev", "transit", "bike_walk"]),
  commute_km_per_day: z.number().min(0).max(500),
  diet: z.enum(["high_meat", "low_meat", "pescetarian", "vegetarian", "vegan"]),
  electricity_kwh_month: z.number().min(0).max(10_000),
  flights_long_per_year: z.number().min(0).max(50),
}) satisfies z.ZodType<QuizAnswers>;

export type QuizQuestion =
  | {
      key: "commute" | "diet";
      kind: "single";
      title: string;
      help: string;
      options: ReadonlyArray<{ value: string; label: string; hint?: string }>;
    }
  | {
      key: "commute_km_per_day" | "electricity_kwh_month" | "flights_long_per_year";
      kind: "number";
      title: string;
      help: string;
      min: number;
      max: number;
      step: number;
      suffix: string;
      default: number;
    };

export const QUIZ: readonly QuizQuestion[] = [
  {
    key: "commute",
    kind: "single",
    title: "How do you usually commute?",
    help: "Pick the mode you use most often on a typical week.",
    options: [
      { value: "car_petrol", label: "Petrol or diesel car", hint: "Highest footprint" },
      { value: "car_ev", label: "Electric car", hint: "Depends on grid" },
      { value: "transit", label: "Bus, train or metro" },
      { value: "bike_walk", label: "Cycling or walking", hint: "Zero emissions" },
    ],
  },
  {
    key: "commute_km_per_day",
    kind: "number",
    title: "How far do you commute one-way?",
    help: "Distance in kilometres per working day.",
    min: 0,
    max: 200,
    step: 1,
    suffix: "km",
    default: 10,
  },
  {
    key: "diet",
    kind: "single",
    title: "Which best describes your diet?",
    help: "We use this to estimate food emissions across a year.",
    options: [
      { value: "high_meat", label: "Meat every day" },
      { value: "low_meat", label: "Meat a few times a week" },
      { value: "pescetarian", label: "Pescetarian", hint: "Fish, no meat" },
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan", hint: "Lowest footprint" },
    ],
  },
  {
    key: "electricity_kwh_month",
    kind: "number",
    title: "Monthly household electricity use?",
    help: "Check your latest bill. Typical: 200–400 kWh.",
    min: 0,
    max: 2_000,
    step: 10,
    suffix: "kWh",
    default: 250,
  },
  {
    key: "flights_long_per_year",
    kind: "number",
    title: "Long-haul return flights per year?",
    help: "Trips over ~3,000 km one way. Aviation is huge — even one counts.",
    min: 0,
    max: 12,
    step: 1,
    suffix: "flights",
    default: 0,
  },
] as const;