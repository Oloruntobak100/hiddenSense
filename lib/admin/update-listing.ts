import "server-only";

import { z } from "zod";
import {
  buildListingDescription,
  flavorSlugFromCategory,
  ListingFieldsSchema,
  PLACEHOLDER_CHECKOUT_URL,
} from "@/lib/admin/listing-fields";
import { getMediaAssetBySlug } from "@/lib/admin/media-assets";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const UpdateListingSchema = z.object({
  id: z.string().uuid(),
  cocktail_name: z.string().trim().min(2).optional(),
  alcohol_category: ListingFieldsSchema.shape.alcohol_category.optional(),
  food_name: z
    .string()
    .trim()
    .optional()
    .transform((s) => (s && s.length >= 2 ? s : null)),
  description: z
    .string()
    .trim()
    .optional()
    .transform((s) => (s && s.length > 0 ? s : undefined)),
  square_checkout_url: ListingFieldsSchema.shape.square_checkout_url.optional(),
  priority_score: z.coerce.number().int().min(0).max(100).optional(),
  active: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  drink_media_slug: z.string().trim().optional(),
  food_media_slug: z.string().trim().optional(),
  clear_drink_image: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  clear_food_image: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export type UpdateListingResult = { ok: true } | { ok: false; error: string };

export async function processUpdateListing(formData: FormData): Promise<UpdateListingResult> {
  const parsed = UpdateListingSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    cocktail_name: String(formData.get("cocktail_name") ?? "") || undefined,
    alcohol_category: String(formData.get("alcohol_category") ?? "") || undefined,
    food_name: String(formData.get("food_name") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    square_checkout_url: String(formData.get("square_checkout_url") ?? "") || undefined,
    priority_score: String(formData.get("priority_score") ?? "") || undefined,
    active: String(formData.get("active") ?? "") || undefined,
    drink_media_slug: String(formData.get("drink_media_slug") ?? "") || undefined,
    food_media_slug: String(formData.get("food_media_slug") ?? "") || undefined,
    clear_drink_image: String(formData.get("clear_drink_image") ?? "") || undefined,
    clear_food_image: String(formData.get("clear_food_image") ?? "") || undefined,
  });

  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid listing data.";
    return { ok: false, error: msg };
  }

  const input = parsed.data;
  const sb = getSupabaseAdmin();

  const { data: existing, error: fetchError } = await sb
    .from("cocktail_recommendations")
    .select("*")
    .eq("id", input.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, error: "Listing not found." };
  }

  const cocktailName = input.cocktail_name ?? existing.cocktail_name;
  const foodName = input.food_name === undefined ? existing.food_name : input.food_name;
  const alcoholCategory = input.alcohol_category ?? existing.alcohol_category;
  const squareCheckoutUrl = input.square_checkout_url ?? existing.square_checkout_url ?? PLACEHOLDER_CHECKOUT_URL;
  const priorityScore = input.priority_score ?? existing.priority_score;
  const active = input.active ?? existing.active;

  let imageUrl = existing.image_url as string | null;
  let foodImageUrl = existing.food_image_url as string | null;

  if (input.clear_drink_image) imageUrl = null;
  if (input.clear_food_image) foodImageUrl = null;

  if (input.drink_media_slug) {
    const asset = await getMediaAssetBySlug(input.drink_media_slug);
    if (!asset) return { ok: false, error: `Drink image not found: ${input.drink_media_slug}` };
    imageUrl = asset.public_url;
  }

  if (input.food_media_slug) {
    const asset = await getMediaAssetBySlug(input.food_media_slug);
    if (!asset) return { ok: false, error: `Food image not found: ${input.food_media_slug}` };
    foodImageUrl = asset.public_url;
  }

  const description =
    input.description ??
    buildListingDescription({
      cocktailName: cocktailName,
      foodName: foodName,
      alcoholCategory: String(alcoholCategory),
    });

  const { error } = await sb
    .from("cocktail_recommendations")
    .update({
      cocktail_name: cocktailName,
      alcohol_category: alcoholCategory,
      food_name: foodName,
      food_pairings: foodName ? [foodName] : [],
      description,
      square_checkout_url: squareCheckoutUrl,
      priority_score: priorityScore,
      active,
      image_url: imageUrl,
      food_image_url: foodImageUrl,
      flavor_profile:
        existing.flavor_profile || flavorSlugFromCategory(String(alcoholCategory)),
    })
    .eq("id", input.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function getListingById(id: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("cocktail_recommendations").select("*").eq("id", id).maybeSingle();
  return data;
}
