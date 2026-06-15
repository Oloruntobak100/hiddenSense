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

export const DEFAULT_MINOR_ALLOWED_CATEGORIES = ["Non-alcoholic"] as const;

function normalizeCategory(category: string) {
  return category.trim().toLowerCase();
}

export function isAlcoholCategoryAllowedForMinorList(
  category: string | null | undefined,
  allowedCategories: readonly string[],
): boolean {
  const normalized = normalizeCategory(String(category ?? ""));
  if (!normalized) return false;
  return allowedCategories.some((c) => normalizeCategory(c) === normalized);
}

/** @deprecated Use isAlcoholCategoryAllowedForMinorList with policy from getCatalogPolicyConfig */
export function isAlcoholCategoryAllowedForMinor(category: string | null | undefined): boolean {
  return isAlcoholCategoryAllowedForMinorList(category, DEFAULT_MINOR_ALLOWED_CATEGORIES);
}
