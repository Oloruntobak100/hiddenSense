import { isUsableUploadedImageUrl } from "@/lib/images/uploaded-url";

export type ListingFilter = "all" | "missing-drink" | "missing-food" | "missing-any" | "inactive";

export type CatalogListing = {
  id: string;
  cocktail_name: string;
  alcohol_category: string;
  food_name: string | null;
  square_checkout_url: string;
  priority_score: number;
  active: boolean;
  image_url: string | null;
  food_image_url: string | null;
};

export function listingMissingDrinkImage(imageUrl: string | null | undefined) {
  return !isUsableUploadedImageUrl(imageUrl);
}

export function listingMissingFoodImage(
  foodName: string | null | undefined,
  foodImageUrl: string | null | undefined,
) {
  if (!foodName?.trim()) return false;
  return !isUsableUploadedImageUrl(foodImageUrl);
}

export function filterCatalogListings(recs: CatalogListing[], filter: ListingFilter): CatalogListing[] {
  if (filter === "all") return recs;
  if (filter === "inactive") return recs.filter((rec) => !rec.active);
  if (filter === "missing-drink") return recs.filter((rec) => listingMissingDrinkImage(rec.image_url));
  if (filter === "missing-food") {
    return recs.filter((rec) => listingMissingFoodImage(rec.food_name, rec.food_image_url));
  }
  return recs.filter(
    (rec) =>
      listingMissingDrinkImage(rec.image_url) ||
      listingMissingFoodImage(rec.food_name, rec.food_image_url),
  );
}

export const LISTING_FILTER_OPTIONS: { value: ListingFilter; label: string }[] = [
  { value: "all", label: "All listings" },
  { value: "missing-drink", label: "Missing drink image" },
  { value: "missing-food", label: "Missing food image" },
  { value: "missing-any", label: "Missing any image" },
  { value: "inactive", label: "Inactive only" },
];

export type AdminTab = "overview" | "catalog" | "media" | "import" | "add";

export const ADMIN_TABS: { id: AdminTab; label: string; description: string }[] = [
  { id: "overview", label: "Overview", description: "Summary and shortcuts" },
  { id: "catalog", label: "Catalog", description: "Manage checkout listings" },
  { id: "media", label: "Media", description: "Image library" },
  { id: "import", label: "Import", description: "Bulk CSV upload" },
  { id: "add", label: "Add one", description: "Single listing form" },
];

export function parseAdminTab(raw: string | undefined): AdminTab {
  if (raw === "overview" || raw === "catalog" || raw === "media" || raw === "import" || raw === "add") {
    return raw;
  }
  return "catalog";
}

export function parseListingFilter(raw: string | undefined): ListingFilter {
  if (
    raw === "missing-drink" ||
    raw === "missing-food" ||
    raw === "missing-any" ||
    raw === "inactive"
  ) {
    return raw;
  }
  return "all";
}
