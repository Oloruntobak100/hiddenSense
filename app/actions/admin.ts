"use server";

import { revalidatePath } from "next/cache";
import { processCreateListing } from "@/lib/admin/create-listing";
import { requireAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminListingActionState = { error?: string; saved?: boolean };

/** Prefer POST /api/admin/recommendations for multipart (images). Kept for programmatic use. */
export async function createRecommendation(
  formData: FormData,
): Promise<AdminListingActionState> {
  await requireAdminUser();
  const result = await processCreateListing(formData);
  if (!result.ok) {
    return { error: result.error };
  }
  revalidatePath("/admin");
  return { saved: true };
}

export async function toggleRecommendationActiveForm(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nextActive = formData.get("active") === "true";
  if (!id) return;
  await toggleRecommendationActive(id, nextActive);
}

export async function deleteRecommendationForm(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteRecommendation(id);
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
