import "server-only";

import { ALCOHOL_CATEGORIES, DEFAULT_MINOR_ALLOWED_CATEGORIES, isAlcoholCategoryAllowedForMinorList } from "@/lib/admin/alcohol-categories";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CatalogPolicyConfig = {
  minorAllowedCategories: string[];
};

export { isAlcoholCategoryAllowedForMinorList };

function normalizeCategory(category: string) {
  return category.trim().toLowerCase();
}

export async function getCatalogPolicyConfig(): Promise<CatalogPolicyConfig> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("catalog_policy_config")
    .select("minor_allowed_categories")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data?.minor_allowed_categories?.length) {
    return { minorAllowedCategories: [...DEFAULT_MINOR_ALLOWED_CATEGORIES] };
  }

  const cleaned = data.minor_allowed_categories
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  return {
    minorAllowedCategories: cleaned.length ? cleaned : [...DEFAULT_MINOR_ALLOWED_CATEGORIES],
  };
}

export async function saveCatalogPolicyConfig(
  input: CatalogPolicyConfig,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const valid = new Set(ALCOHOL_CATEGORIES.map((c) => normalizeCategory(c)));
  const selected = input.minorAllowedCategories
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && valid.has(normalizeCategory(c)));

  if (!selected.length) {
    return { ok: false, error: "Select at least one category for minor guests." };
  }

  const canonical = ALCOHOL_CATEGORIES.filter((c) =>
    selected.some((s) => normalizeCategory(s) === normalizeCategory(c)),
  );

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("catalog_policy_config").upsert(
    {
      id: 1,
      minor_allowed_categories: [...canonical],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
