"use client";

import Link from "next/link";
import { useState } from "react";
import { InlineMediaPicker, type MediaAssetItem } from "@/components/admin/ImagePicker";
import { ALCOHOL_CATEGORIES } from "@/lib/admin/alcohol-categories";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type ListingRecord = {
  id: string;
  cocktail_name: string;
  alcohol_category: string;
  food_name: string | null;
  description: string;
  square_checkout_url: string;
  priority_score: number;
  active: boolean;
  image_url: string | null;
  food_image_url: string | null;
};

type AdminEditListingFormProps = {
  listing: ListingRecord;
  error?: string | null;
};

export function AdminEditListingForm({ listing, error = null }: AdminEditListingFormProps) {
  const [drinkSlug, setDrinkSlug] = useState("");
  const [foodSlug, setFoodSlug] = useState("");
  const [drinkPreview, setDrinkPreview] = useState(listing.image_url);
  const [foodPreview, setFoodPreview] = useState(listing.food_image_url);
  const [clearDrink, setClearDrink] = useState(false);
  const [clearFood, setClearFood] = useState(false);

  function handleDrinkPick(asset: MediaAssetItem) {
    setDrinkSlug(asset.slug);
    setDrinkPreview(asset.public_url);
    setClearDrink(false);
  }

  function handleFoodPick(asset: MediaAssetItem) {
    setFoodSlug(asset.slug);
    setFoodPreview(asset.public_url);
    setClearFood(false);
  }

  return (
    <>
      {error ? (
        <p className="mb-4 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <form
        action={`/api/admin/recommendations/${listing.id}`}
        method="POST"
        className="grid gap-4"
      >
        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Drink name</span>
          <input
            name="cocktail_name"
            defaultValue={listing.cocktail_name}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Category</span>
          <select
            name="alcohol_category"
            defaultValue={listing.alcohol_category}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none"
          >
            {ALCOHOL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Food name</span>
          <input
            name="food_name"
            defaultValue={listing.food_name ?? ""}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Description</span>
          <textarea
            name="description"
            defaultValue={listing.description}
            rows={3}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            Square checkout URL
          </span>
          <input
            name="square_checkout_url"
            defaultValue={listing.square_checkout_url}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Priority</span>
            <input
              name="priority_score"
              type="number"
              min={0}
              max={100}
              defaultValue={listing.priority_score}
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Active</span>
            <select
              name="active"
              defaultValue={listing.active ? "true" : "false"}
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/20 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Drink image</p>
            <button
              type="button"
              onClick={() => {
                setClearDrink(true);
                setDrinkSlug("");
                setDrinkPreview(null);
              }}
              className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-200"
            >
              Remove
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {drinkPreview && !clearDrink ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={drinkPreview} alt="" className="h-20 w-20 rounded-xl object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-white/20 text-[10px] text-white/40">
                None selected
              </div>
            )}
          </div>
          <InlineMediaPicker slot="drink" onSelect={handleDrinkPick} selectedSlug={drinkSlug || undefined} />
          <input type="hidden" name="drink_media_slug" value={drinkSlug} />
          <input type="hidden" name="clear_drink_image" value={clearDrink ? "true" : "false"} />
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/20 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Food image</p>
            <button
              type="button"
              onClick={() => {
                setClearFood(true);
                setFoodSlug("");
                setFoodPreview(null);
              }}
              className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-200"
            >
              Remove
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {foodPreview && !clearFood ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foodPreview} alt="" className="h-20 w-20 rounded-xl object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-white/20 text-[10px] text-white/40">
                None selected
              </div>
            )}
          </div>
          <InlineMediaPicker slot="food" onSelect={handleFoodPick} selectedSlug={foodSlug || undefined} />
          <input type="hidden" name="food_media_slug" value={foodSlug} />
          <input type="hidden" name="clear_food_image" value={clearFood ? "true" : "false"} />
        </div>

        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            type="submit"
            className="justify-center bg-[var(--hs-accent)] px-6 py-2.5 text-sm font-semibold hover:brightness-110"
          >
            Save listing
          </PrimaryButton>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-2.5 text-sm hover:bg-white/[0.06]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
