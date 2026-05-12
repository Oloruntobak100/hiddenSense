/**
 * Admin listings in this category are eligible for under-21 recommendations.
 * All spirit / wine / beer / RTD / blend categories are excluded for minors.
 */
export function isAlcoholCategoryAllowedForMinor(category: string | null | undefined): boolean {
  return String(category ?? "")
    .trim()
    .toLowerCase() === "non-alcoholic";
}

/** Dropdown options for curated Square listings (display value = stored alcohol_category string). */
export const ALCOHOL_CATEGORIES = [
  "Whiskey",
  "Bourbon",
  "Rye",
  "Scotch",
  "Vodka",
  "Gin",
  "Rum",
  "Tequila",
  "Mezcal",
  "Brandy",
  "Cognac",
  "Liqueur",
  "Wine",
  "Champagne",
  "Beer",
  "RTD Cocktail",
  "Non-alcoholic",
  "Spirit blend",
  "Other",
] as const;

export type AlcoholCategory = (typeof ALCOHOL_CATEGORIES)[number];
