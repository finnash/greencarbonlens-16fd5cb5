/**
 * Local mirror of the seeded `activity_factors` table.
 *
 * Kept as a typed module so the calculator and onboarding quiz can run
 * client-side without a network round-trip, and so unit tests stay hermetic.
 * If you change values here, update the database seed migration too.
 */
import type { EmissionFactor } from "./types";

export const FACTORS = {
  car_petrol_small: {
    slug: "car_petrol_small",
    category: "transport",
    name: "Petrol car (small)",
    unit: "km",
    kg_co2e_per_unit: 0.141,
    source: "UK DEFRA 2024",
  },
  car_petrol_medium: {
    slug: "car_petrol_medium",
    category: "transport",
    name: "Petrol car (medium)",
    unit: "km",
    kg_co2e_per_unit: 0.1781,
    source: "UK DEFRA 2024",
  },
  car_diesel_medium: {
    slug: "car_diesel_medium",
    category: "transport",
    name: "Diesel car (medium)",
    unit: "km",
    kg_co2e_per_unit: 0.1683,
    source: "UK DEFRA 2024",
  },
  car_hybrid_medium: {
    slug: "car_hybrid_medium",
    category: "transport",
    name: "Hybrid car (medium)",
    unit: "km",
    kg_co2e_per_unit: 0.1093,
    source: "UK DEFRA 2024",
  },
  car_ev_medium: {
    slug: "car_ev_medium",
    category: "transport",
    name: "Electric car (grid avg)",
    unit: "km",
    kg_co2e_per_unit: 0.047,
    source: "IEA 2024",
  },
  bus_local: {
    slug: "bus_local",
    category: "transport",
    name: "Local bus",
    unit: "km",
    kg_co2e_per_unit: 0.1023,
    source: "UK DEFRA 2024",
  },
  train_commuter: {
    slug: "train_commuter",
    category: "transport",
    name: "Commuter train",
    unit: "km",
    kg_co2e_per_unit: 0.0354,
    source: "UK DEFRA 2024",
  },
  metro_subway: {
    slug: "metro_subway",
    category: "transport",
    name: "Metro / subway",
    unit: "km",
    kg_co2e_per_unit: 0.0275,
    source: "UK DEFRA 2024",
  },
  motorbike_medium: {
    slug: "motorbike_medium",
    category: "transport",
    name: "Motorbike (medium)",
    unit: "km",
    kg_co2e_per_unit: 0.1135,
    source: "UK DEFRA 2024",
  },
  rideshare_solo: {
    slug: "rideshare_solo",
    category: "transport",
    name: "Rideshare (solo)",
    unit: "km",
    kg_co2e_per_unit: 0.21,
    source: "EPA 2024",
  },
  cycling: {
    slug: "cycling",
    category: "transport",
    name: "Bicycle",
    unit: "km",
    kg_co2e_per_unit: 0.0,
    source: "Zero emissions",
  },
  walking: {
    slug: "walking",
    category: "transport",
    name: "Walking",
    unit: "km",
    kg_co2e_per_unit: 0.0,
    source: "Zero emissions",
  },
  flight_short_eco: {
    slug: "flight_short_eco",
    category: "travel",
    name: "Short-haul flight (eco)",
    unit: "km",
    kg_co2e_per_unit: 0.1535,
    source: "UK DEFRA 2024",
  },
  flight_long_eco: {
    slug: "flight_long_eco",
    category: "travel",
    name: "Long-haul flight (eco)",
    unit: "km",
    kg_co2e_per_unit: 0.1481,
    source: "UK DEFRA 2024",
  },
  flight_long_business: {
    slug: "flight_long_business",
    category: "travel",
    name: "Long-haul flight (biz)",
    unit: "km",
    kg_co2e_per_unit: 0.4296,
    source: "UK DEFRA 2024",
  },
  electricity_grid_avg: {
    slug: "electricity_grid_avg",
    category: "energy",
    name: "Grid electricity (avg)",
    unit: "kWh",
    kg_co2e_per_unit: 0.433,
    source: "IEA 2024",
  },
  electricity_renewable: {
    slug: "electricity_renewable",
    category: "energy",
    name: "Renewable electricity",
    unit: "kWh",
    kg_co2e_per_unit: 0.041,
    source: "IEA 2024",
  },
  natural_gas: {
    slug: "natural_gas",
    category: "energy",
    name: "Natural gas (heating)",
    unit: "kWh",
    kg_co2e_per_unit: 0.202,
    source: "UK DEFRA 2024",
  },
  meal_beef: {
    slug: "meal_beef",
    category: "food",
    name: "Beef meal",
    unit: "meal",
    kg_co2e_per_unit: 7.26,
    source: "Our World in Data",
  },
  meal_lamb: {
    slug: "meal_lamb",
    category: "food",
    name: "Lamb meal",
    unit: "meal",
    kg_co2e_per_unit: 6.45,
    source: "Our World in Data",
  },
  meal_pork: {
    slug: "meal_pork",
    category: "food",
    name: "Pork meal",
    unit: "meal",
    kg_co2e_per_unit: 2.54,
    source: "Our World in Data",
  },
  meal_chicken: {
    slug: "meal_chicken",
    category: "food",
    name: "Chicken meal",
    unit: "meal",
    kg_co2e_per_unit: 1.78,
    source: "Our World in Data",
  },
  meal_fish: {
    slug: "meal_fish",
    category: "food",
    name: "Fish meal",
    unit: "meal",
    kg_co2e_per_unit: 1.62,
    source: "Our World in Data",
  },
  meal_vegetarian: {
    slug: "meal_vegetarian",
    category: "food",
    name: "Vegetarian meal",
    unit: "meal",
    kg_co2e_per_unit: 0.78,
    source: "Our World in Data",
  },
  meal_vegan: {
    slug: "meal_vegan",
    category: "food",
    name: "Vegan meal",
    unit: "meal",
    kg_co2e_per_unit: 0.48,
    source: "Our World in Data",
  },
  coffee_cup: {
    slug: "coffee_cup",
    category: "food",
    name: "Coffee (cup w/ dairy)",
    unit: "cup",
    kg_co2e_per_unit: 0.28,
    source: "Our World in Data",
  },
  clothing_new_item: {
    slug: "clothing_new_item",
    category: "shopping",
    name: "New clothing item",
    unit: "item",
    kg_co2e_per_unit: 10.0,
    source: "Carbon Trust",
  },
  electronics_phone: {
    slug: "electronics_phone",
    category: "shopping",
    name: "New smartphone",
    unit: "item",
    kg_co2e_per_unit: 70.0,
    source: "Apple LCA 2024",
  },
  waste_general_kg: {
    slug: "waste_general_kg",
    category: "waste",
    name: "General waste",
    unit: "kg",
    kg_co2e_per_unit: 0.467,
    source: "UK DEFRA 2024",
  },
  waste_recycled_kg: {
    slug: "waste_recycled_kg",
    category: "waste",
    name: "Recycled waste",
    unit: "kg",
    kg_co2e_per_unit: 0.021,
    source: "UK DEFRA 2024",
  },
} as const satisfies Record<string, EmissionFactor>;

export type FactorSlug = keyof typeof FACTORS;

/** O(1) factor lookup. Throws on unknown slug to surface bugs early. */
export function getFactor(slug: FactorSlug): EmissionFactor {
  const f = FACTORS[slug];
  if (!f) throw new Error(`Unknown emission factor: ${slug}`);
  return f;
}

export const FACTOR_LIST: readonly EmissionFactor[] = Object.values(FACTORS);
