import { describe, expect, it } from "vitest";
import { QUIZ, quizSchema } from "./quiz";

describe("quizSchema", () => {
  it("accepts a valid answer set", () => {
    expect(
      quizSchema.parse({
        commute: "transit",
        commute_km_per_day: 10,
        diet: "vegetarian",
        electricity_kwh_month: 250,
        flights_long_per_year: 0,
      }),
    ).toBeTruthy();
  });
  it("rejects out-of-range numbers", () => {
    expect(() =>
      quizSchema.parse({
        commute: "transit",
        commute_km_per_day: -5,
        diet: "vegetarian",
        electricity_kwh_month: 250,
        flights_long_per_year: 0,
      }),
    ).toThrow();
  });
  it("rejects unknown enum values", () => {
    expect(() =>
      quizSchema.parse({
        commute: "rocket",
        commute_km_per_day: 10,
        diet: "vegetarian",
        electricity_kwh_month: 250,
        flights_long_per_year: 0,
      }),
    ).toThrow();
  });
});

describe("QUIZ definition", () => {
  it("has one question per schema field", () => {
    const fields = Object.keys(quizSchema.shape).sort();
    const keys = QUIZ.map((q) => q.key).sort();
    expect(keys).toEqual(fields);
  });
});
