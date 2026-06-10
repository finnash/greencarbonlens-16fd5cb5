# Methodology & citations

CarbonLens estimates are intentionally transparent. Every emission factor
used by the app is checked into source control in
`src/lib/carbon/factors.ts` with a human-readable `source` field, and the
aggregate math lives in `src/lib/carbon/calculator.ts`.

## Primary sources

| Source                                                             | What we use it for                                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **UK DEFRA — Greenhouse gas reporting: conversion factors (2024)** | Default factors for car (petrol/diesel/EV), bus, rail, domestic & international flights, electricity, natural gas, waste. |
| **IPCC AR6 WGIII (2022)**                                          | Sector-level sanity bounds and the Paris-aligned 1.5 °C personal budget (~2 t CO₂e/yr by 2030).                           |
| **Poore & Nemecek, Science (2018)**                                | Per-meal food factors for beef, chicken, fish, vegetarian, vegan.                                                         |
| **IEA — Electricity Mix & Renewables (2023)**                      | Renewable-vs-grid sensitivity used by the What-If simulator.                                                              |
| **UN Sustainable Development Goal 13 — Climate Action**            | Product North Star; challenges and coach guidance are framed against SDG 13 targets.                                      |

## Assumptions

- **Commute days/year**: 240 (5-day work week × ~48 weeks).
- **Long-haul flight distance**: 11,000 km round trip (industry typical
  for long-haul economy class).
- **Global average per-capita footprint**: ~4.7 t CO₂e/yr (IEA 2022).
- **Paris 1.5 °C personal budget**: 2.0 t CO₂e/yr (IPCC AR6 Ch.5).

## What we explicitly do **not** do

- We do not claim offset credits. Reductions shown in challenges are
  modelled, not certified.
- We do not collect location data finer than a country code at
  onboarding time.
- We do not adjust factors based on user country yet; this is a
  documented limitation tracked in `docs/DECISIONS.md`.

## Reproducing a result

Every figure rendered by the dashboard or simulator can be reproduced by
running the relevant function with the user's quiz answers:

```ts
import { estimateBaselineKgPerYear } from "@/lib/carbon/calculator";
import { simulate, DEFAULT_LEVERS } from "@/lib/carbon/simulator";

estimateBaselineKgPerYear(answers); // annual baseline (kg CO2e)
simulate(answers, DEFAULT_LEVERS); // what-if scenario
```

Unit tests in `src/lib/carbon/*.test.ts` lock these outputs against
published source values within ±1%.
