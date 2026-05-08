"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const RecommendationSchema = z.object({
  cocktail_name: z.string().min(2),
  alcohol_category: z.string().min(2),
  mood_tags: z.string().default(""),
  flavor_profile: z.string().min(2),
  emotional_tags: z.string().default(""),
  atmosphere_tags: z.string().default(""),
  description: z.string().min(5),
  square_checkout_url: z.string().url().or(z.literal("")),
  image_url: z.string().url().or(z.literal("")),
  food_pairings: z.string().default(""),
  priority_score: z.coerce.number().int().min(0).max(100).default(50),
  active: z.enum(["on", "off"]).optional(),
});

function parseCsv(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function createRecommendation(formData: FormData) {
  await requireAdminUser();
  const parsed = RecommendationSchema.safeParse({
    cocktail_name: formData.get("cocktail_name"),
    alcohol_category: formData.get("alcohol_category"),
    mood_tags: formData.get("mood_tags"),
    flavor_profile: formData.get("flavor_profile"),
    emotional_tags: formData.get("emotional_tags"),
    atmosphere_tags: formData.get("atmosphere_tags"),
    description: formData.get("description"),
    square_checkout_url: formData.get("square_checkout_url"),
    image_url: formData.get("image_url"),
    food_pairings: formData.get("food_pairings"),
    priority_score: formData.get("priority_score"),
    active: formData.get("active") ? "on" : "off",
  });
  if (!parsed.success) return;

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("cocktail_recommendations").insert({
    cocktail_name: parsed.data.cocktail_name,
    alcohol_category: parsed.data.alcohol_category,
    mood_tags: parseCsv(parsed.data.mood_tags),
    flavor_profile: parsed.data.flavor_profile,
    emotional_tags: parseCsv(parsed.data.emotional_tags),
    atmosphere_tags: parseCsv(parsed.data.atmosphere_tags),
    description: parsed.data.description,
    square_checkout_url: parsed.data.square_checkout_url || "https://example.com/checkout",
    image_url: parsed.data.image_url || null,
    food_pairings: parseCsv(parsed.data.food_pairings),
    priority_score: parsed.data.priority_score,
    active: parsed.data.active === "on",
  });

  if (error) return;
  revalidatePath("/admin");
}

export async function toggleRecommendationActive(id: string, nextActive: boolean) {
  await requireAdminUser();
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("cocktail_recommendations").update({ active: nextActive }).eq("id", id);
  if (error) return;
  revalidatePath("/admin");
}

export async function deleteRecommendation(id: string) {
  await requireAdminUser();
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("cocktail_recommendations").delete().eq("id", id);
  if (error) return;
  revalidatePath("/admin");
}
