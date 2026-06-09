import type { AdminTab, ListingFilter } from "@/lib/admin/listing-filters";

export function buildAdminHref(tab: AdminTab, filter?: ListingFilter, extra?: Record<string, string>) {
  const params = new URLSearchParams();
  if (tab !== "catalog") params.set("tab", tab);
  if (filter && filter !== "all") params.set("filter", filter);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}
