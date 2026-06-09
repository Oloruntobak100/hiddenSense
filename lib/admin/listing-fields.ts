import { z } from "zod";
import { ALCOHOL_CATEGORIES, type AlcoholCategory } from "@/lib/admin/alcohol-categories";
import { MOOD_ARCHETYPES } from "@/lib/intelligence/mood-archetypes";

export const ALL_MOOD_KEYS = MOOD_ARCHETYPES.map((m) => m.key);
export const PLACEHOLDER_CHECKOUT_URL = "https://example.com/checkout";

export function flavorSlugFromCategory(category: string) {
  return (
    category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "curated-house"
  );
}

export function parseMoodTags(raw: string | undefined): string[] {
  if (!raw?.trim()) return [...ALL_MOOD_KEYS];
  const tags = raw
    .split("|")
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : [...ALL_MOOD_KEYS];
}

export function parseActive(raw: string | undefined, defaultValue = true): boolean {
  if (!raw?.trim()) return defaultValue;
  const v = raw.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(v)) return true;
  if (["false", "0", "no", "n"].includes(v)) return false;
  return defaultValue;
}

export function parsePriority(raw: string | undefined, defaultValue = 85): number {
  if (!raw?.trim()) return defaultValue;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return defaultValue;
  return Math.min(100, Math.max(0, n));
}

const alcoholCategorySchema = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s && s.length > 0 ? s : "Other"))
  .refine((s): s is AlcoholCategory => (ALCOHOL_CATEGORIES as readonly string[]).includes(s), {
    message: "Invalid alcohol category",
  });

const optionalName = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s && s.length >= 2 ? s : undefined));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((s) => {
    if (!s) return undefined;
    const parsed = z.string().url().safeParse(s);
    return parsed.success ? parsed.data : undefined;
  });

export const ListingFieldsSchema = z.object({
  cocktail_name: optionalName,
  alcohol_category: alcoholCategorySchema,
  square_checkout_url: optionalUrl,
  food_name: optionalName,
  description: z
    .string()
    .trim()
    .optional()
    .transform((s) => (s && s.length > 0 ? s : undefined)),
  priority_score: z.number().int().min(0).max(100).optional(),
  active: z.boolean().optional(),
  mood_tags: z.array(z.string()).optional(),
  flavor_profile: z
    .string()
    .trim()
    .optional()
    .transform((s) => (s && s.length > 0 ? s : undefined)),
});

export type ListingFields = z.infer<typeof ListingFieldsSchema>;

export function buildListingDescription({
  cocktailName,
  foodName,
  alcoholCategory,
  description,
}: {
  cocktailName: string;
  foodName: string | null;
  alcoholCategory: string;
  description?: string;
}) {
  if (description) return description;

  const descriptionParts: string[] = [];
  if (cocktailName) descriptionParts.push(cocktailName);
  if (foodName) descriptionParts.push(foodName);
  return descriptionParts.length > 0
    ? `${descriptionParts.join(" · ")} · ${alcoholCategory} listing for Hidden Spirits checkout.`
    : `${alcoholCategory} listing for Hidden Spirits checkout.`;
}
