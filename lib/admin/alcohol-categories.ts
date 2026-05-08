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
