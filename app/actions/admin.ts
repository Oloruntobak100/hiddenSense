"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const COCKTAIL_IMAGE_BUCKET = "cocktail-images";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

function extFromMime(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "jpg";
}

async function uploadRecommendationImage(file: File): Promise<string | null> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    console.error("Invalid image type:", file.type);
    return null;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    console.error("Image too large:", file.size);
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${extFromMime(file.type)}`;
  const path = `recommendations/${filename}`;
  const sb = getSupabaseAdmin();

  const { data, error } = await sb.storage.from(COCKTAIL_IMAGE_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Storage upload failed:", error.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = sb.storage.from(COCKTAIL_IMAGE_BUCKET).getPublicUrl(data.path);
  return publicUrl;
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

  const uploaded = formData.get("image_file");
  let imageUrl: string | null = parsed.data.image_url.trim() !== "" ? parsed.data.image_url : null;

  if (uploaded instanceof File && uploaded.size > 0) {
    const publicUrl = await uploadRecommendationImage(uploaded);
    if (!publicUrl) return;
    imageUrl = publicUrl;
  }

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
    image_url: imageUrl,
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
