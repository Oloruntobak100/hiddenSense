import "server-only";

import {
  buildListingDescription,
  flavorSlugFromCategory,
  ListingFieldsSchema,
  parseActive,
  parseMoodTags,
  parsePriority,
  PLACEHOLDER_CHECKOUT_URL,
} from "@/lib/admin/listing-fields";
import { resolveMediaUrlBySlug } from "@/lib/admin/media-assets";
import { csvRowsToObjects, parseCsv } from "@/lib/admin/parse-csv";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type BulkImportRowResult = {
  row: number;
  status: "created" | "updated" | "skipped" | "failed";
  message: string;
  listingId?: string;
};

export type BulkImportResult = {
  ok: boolean;
  dryRun: boolean;
  total: number;
  created: number;
  updated: number;
  failed: number;
  rows: BulkImportRowResult[];
};

function pickField(record: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value?.trim()) return value.trim();
  }
  return "";
}

export async function processBulkImportCsv(
  csvText: string,
  options?: { dryRun?: boolean },
): Promise<BulkImportResult> {
  const dryRun = options?.dryRun ?? false;
  const parsed = csvRowsToObjects(parseCsv(csvText));
  const rows: BulkImportRowResult[] = [];
  let created = 0;
  let updated = 0;
  let failed = 0;

  if (parsed.records.length === 0) {
    return {
      ok: false,
      dryRun,
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      rows: [{ row: 0, status: "failed", message: "CSV is empty or has no data rows." }],
    };
  }

  const sb = getSupabaseAdmin();

  for (let index = 0; index < parsed.records.length; index += 1) {
    const record = parsed.records[index];
    const rowNumber = index + 2;

    const listingId = pickField(record, "listing_id", "id");
    const drinkName = pickField(record, "drink_name", "cocktail_name");
    const foodName = pickField(record, "food_name");
    const drinkImageSlug = pickField(record, "drink_image_slug", "drink_image");
    const foodImageSlug = pickField(record, "food_image_slug", "food_image");

    if (!drinkName && !foodName) {
      failed += 1;
      rows.push({
        row: rowNumber,
        status: "failed",
        message: "Provide at least drink_name or food_name.",
      });
      continue;
    }

    const fieldParse = ListingFieldsSchema.safeParse({
      cocktail_name: drinkName || undefined,
      alcohol_category: pickField(record, "alcohol_category", "category") || undefined,
      square_checkout_url: pickField(record, "square_checkout_url", "checkout_url") || undefined,
      food_name: foodName || undefined,
      description: pickField(record, "description") || undefined,
      priority_score: parsePriority(pickField(record, "priority_score", "priority")),
      active: parseActive(pickField(record, "active")),
      mood_tags: parseMoodTags(pickField(record, "mood_tags")),
      flavor_profile: pickField(record, "flavor_profile", "flavor") || undefined,
    });

    if (!fieldParse.success) {
      failed += 1;
      const msg =
        Object.values(fieldParse.error.flatten().fieldErrors).flat()[0] ?? "Invalid row data.";
      rows.push({ row: rowNumber, status: "failed", message: msg });
      continue;
    }

    const fields = fieldParse.data;
    const resolvedCocktailName =
      fields.cocktail_name ?? fields.food_name ?? (drinkName ? "House cocktail" : "Food pairing");
    const resolvedFoodName = fields.food_name ?? null;
    const alcoholCategory = fields.alcohol_category;
    const squareCheckoutUrl = fields.square_checkout_url ?? PLACEHOLDER_CHECKOUT_URL;
    const flavorProfile = fields.flavor_profile ?? flavorSlugFromCategory(alcoholCategory);
    const description = buildListingDescription({
      cocktailName: resolvedCocktailName,
      foodName: resolvedFoodName,
      alcoholCategory,
      description: fields.description,
    });

    const drinkImageUrl = await resolveMediaUrlBySlug(drinkImageSlug);
    const foodImageUrl = await resolveMediaUrlBySlug(foodImageSlug);

    if (drinkImageSlug && !drinkImageUrl) {
      failed += 1;
      rows.push({
        row: rowNumber,
        status: "failed",
        message: `Drink image slug not found in media library: "${drinkImageSlug}"`,
      });
      continue;
    }

    if (foodImageSlug && !foodImageUrl) {
      failed += 1;
      rows.push({
        row: rowNumber,
        status: "failed",
        message: `Food image slug not found in media library: "${foodImageSlug}"`,
      });
      continue;
    }

    const payload = {
      cocktail_name: resolvedCocktailName,
      alcohol_category: alcoholCategory,
      mood_tags: fields.mood_tags ?? parseMoodTags(undefined),
      flavor_profile: flavorProfile,
      emotional_tags: [] as string[],
      atmosphere_tags: [] as string[],
      description,
      square_checkout_url: squareCheckoutUrl,
      food_pairings: resolvedFoodName ? [resolvedFoodName] : [],
      food_name: resolvedFoodName,
      priority_score: fields.priority_score ?? 85,
      active: fields.active ?? true,
      ...(drinkImageUrl ? { image_url: drinkImageUrl } : {}),
      ...(foodImageUrl ? { food_image_url: foodImageUrl } : {}),
    };

    if (dryRun) {
      rows.push({
        row: rowNumber,
        status: listingId ? "updated" : "created",
        message: listingId ? "Valid update (dry run)" : "Valid create (dry run)",
      });
      if (listingId) updated += 1;
      else created += 1;
      continue;
    }

    if (listingId) {
      const { data: existing, error: fetchError } = await sb
        .from("cocktail_recommendations")
        .select("id, image_url, food_image_url")
        .eq("id", listingId)
        .maybeSingle();

      if (fetchError || !existing) {
        failed += 1;
        rows.push({ row: rowNumber, status: "failed", message: `Listing not found: ${listingId}` });
        continue;
      }

      const updatePayload = {
        ...payload,
        image_url: drinkImageUrl ?? existing.image_url,
        food_image_url: foodImageUrl ?? existing.food_image_url,
      };

      const { error } = await sb.from("cocktail_recommendations").update(updatePayload).eq("id", listingId);
      if (error) {
        failed += 1;
        rows.push({ row: rowNumber, status: "failed", message: error.message });
        continue;
      }

      updated += 1;
      rows.push({
        row: rowNumber,
        status: "updated",
        message: "Listing updated.",
        listingId,
      });
      continue;
    }

    const { data, error } = await sb
      .from("cocktail_recommendations")
      .insert({
        ...payload,
        image_url: drinkImageUrl,
        food_image_url: foodImageUrl,
      })
      .select("id")
      .single();

    if (error) {
      failed += 1;
      rows.push({ row: rowNumber, status: "failed", message: error.message });
      continue;
    }

    created += 1;
    rows.push({
      row: rowNumber,
      status: "created",
      message: "Listing created.",
      listingId: data.id,
    });
  }

  return {
    ok: failed === 0,
    dryRun,
    total: parsed.records.length,
    created,
    updated,
    failed,
    rows,
  };
}

export const BULK_IMPORT_CSV_TEMPLATE = `drink_name,food_name,alcohol_category,description,square_checkout_url,priority_score,active
Evening Spritz,Citrus crudo,RTD Cocktail,,https://example.com/checkout,85,true
`;
