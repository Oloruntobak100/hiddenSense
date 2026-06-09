"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  deleteRecommendationForm,
  toggleRecommendationActiveForm,
} from "@/app/actions/admin";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminField,
  AdminPanel,
  AdminToolbar,
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/admin-ui";
import {
  filterCatalogListings,
  LISTING_FILTER_OPTIONS,
  listingMissingDrinkImage,
  listingMissingFoodImage,
  type CatalogListing,
  type ListingFilter,
} from "@/lib/admin/listing-filters";

function ImageCell({
  url,
  missingLabel,
}: {
  url: string | null;
  missingLabel: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="h-10 w-10 rounded-lg border border-white/10 object-cover" />
    );
  }
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-amber-400/30 bg-amber-500/10 text-[9px] leading-tight text-amber-100/70">
      {missingLabel}
    </span>
  );
}

function RowActionsMenu({ listing }: { listing: CatalogListing }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Actions ▾
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 min-w-[9rem] overflow-hidden rounded-lg border border-white/12 bg-[#151024] py-1 shadow-xl">
            <Link
              href={`/admin/listings/${listing.id}/edit`}
              className="block px-3 py-2 text-xs text-white/85 hover:bg-white/[0.06]"
              onClick={() => setOpen(false)}
            >
              Edit listing
            </Link>
            <form action={toggleRecommendationActiveForm} className="block">
              <input type="hidden" name="id" value={listing.id} />
              <input type="hidden" name="active" value={listing.active ? "false" : "true"} />
              <button
                type="submit"
                className="w-full px-3 py-2 text-left text-xs text-white/85 hover:bg-white/[0.06]"
              >
                Mark {listing.active ? "inactive" : "active"}
              </button>
            </form>
            <form
              action={deleteRecommendationForm}
              className="block border-t border-white/8"
              onSubmit={(e) => {
                if (!window.confirm(`Delete "${listing.cocktail_name}"?`)) {
                  e.preventDefault();
                  return;
                }
                setOpen(false);
              }}
            >
              <input type="hidden" name="id" value={listing.id} />
              <button
                type="submit"
                className="w-full px-3 py-2 text-left text-xs text-red-200 hover:bg-red-500/10"
              >
                Delete
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function AdminCatalogTable({
  listings,
  initialFilter = "all",
}: {
  listings: CatalogListing[];
  initialFilter?: ListingFilter;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ListingFilter>(initialFilter);

  const visible = useMemo(() => {
    const filtered = filterCatalogListings(listings, filter);
    const q = query.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((row) => {
      const haystack = `${row.cocktail_name} ${row.food_name ?? ""} ${row.alcohol_category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [listings, filter, query]);

  return (
    <AdminPanel
      title="Checkout catalog"
      description={`${listings.length} listing${listings.length === 1 ? "" : "s"} · search and filter without leaving this view`}
    >
      <AdminToolbar>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-[12rem] flex-1">
            <AdminField label="Search">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Drink, food, or category…"
                className={adminInputClass}
              />
            </AdminField>
          </div>
          <div className="w-full sm:w-52">
            <AdminField label="Filter">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ListingFilter)}
                className={adminSelectClass}
              >
                {LISTING_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
        </div>
        <p className="text-xs text-white/40">{visible.length} shown</p>
      </AdminToolbar>

      {visible.length === 0 ? (
        <AdminEmptyState
          title="No listings match"
          description="Try another filter or import listings from the Import tab."
        />
      ) : (
        <AdminDataTable>
          <thead>
            <tr className="border-b border-white/10 bg-black/30 text-[11px] uppercase tracking-[0.12em] text-white/45">
              <th className="px-4 py-3 font-medium">Drink</th>
              <th className="px-4 py-3 font-medium">Food</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Images</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const missingDrink = listingMissingDrinkImage(row.image_url);
              const missingFood = listingMissingFoodImage(row.food_name, row.food_image_url);
              const hasCheckout =
                row.square_checkout_url && row.square_checkout_url !== "https://example.com/checkout";

              return (
                <tr key={row.id} className="border-b border-white/6 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{row.cocktail_name}</p>
                    {hasCheckout ? (
                      <p className="mt-0.5 text-[11px] text-[var(--hs-accent)]">Square linked</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-white/70">{row.food_name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/65">{row.alcohol_category}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <ImageCell url={row.image_url} missingLabel="Drink" />
                      {row.food_name ? (
                        <ImageCell url={row.food_image_url} missingLabel="Food" />
                      ) : null}
                    </div>
                    {missingDrink || missingFood ? (
                      <p className="mt-1 text-[10px] text-amber-200/80">
                        {[missingDrink ? "drink" : null, missingFood ? "food" : null]
                          .filter(Boolean)
                          .join(" & ")}{" "}
                        missing
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-white/70">{row.priority_score}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.active
                          ? "bg-emerald-500/15 text-emerald-200"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {row.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActionsMenu listing={row} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminDataTable>
      )}
    </AdminPanel>
  );
}
