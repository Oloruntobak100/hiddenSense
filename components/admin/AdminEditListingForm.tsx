"use client";

import Link from "next/link";
import { useState } from "react";
import { InlineMediaPicker, type MediaAssetItem } from "@/components/admin/ImagePicker";
import {
  AdminDetails,
  AdminField,
  AdminPanel,
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/admin-ui";
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
    <AdminPanel title="Edit listing" description="Update details and attach images from the media library.">
      {error ? (
        <p className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <form action={`/api/admin/recommendations/${listing.id}`} method="POST" className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Drink name">
            <input
              name="cocktail_name"
              defaultValue={listing.cocktail_name}
              className={adminInputClass}
            />
          </AdminField>

          <AdminField label="Category">
            <select name="alcohol_category" defaultValue={listing.alcohol_category} className={adminSelectClass}>
              {ALCOHOL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField label="Food name">
            <input name="food_name" defaultValue={listing.food_name ?? ""} className={adminInputClass} />
          </AdminField>

          <AdminField label="Priority">
            <input
              name="priority_score"
              type="number"
              min={0}
              max={100}
              defaultValue={listing.priority_score}
              className={adminInputClass}
            />
          </AdminField>
        </div>

        <AdminField label="Description">
          <textarea
            name="description"
            defaultValue={listing.description}
            rows={3}
            className={adminInputClass}
          />
        </AdminField>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <AdminField label="Square checkout URL">
            <input name="square_checkout_url" defaultValue={listing.square_checkout_url} className={adminInputClass} />
          </AdminField>
          <AdminField label="Status">
            <select name="active" defaultValue={listing.active ? "true" : "false"} className={adminSelectClass}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </AdminField>
        </div>

        <AdminDetails summary="Drink image" defaultOpen>
          <div className="mb-3 flex items-center gap-3">
            {drinkPreview && !clearDrink ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={drinkPreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <span className="text-sm text-white/40">No drink image selected</span>
            )}
            <button
              type="button"
              onClick={() => {
                setClearDrink(true);
                setDrinkSlug("");
                setDrinkPreview(null);
              }}
              className="rounded-md bg-red-500/12 px-2.5 py-1 text-xs text-red-200"
            >
              Remove
            </button>
          </div>
          <InlineMediaPicker slot="drink" onSelect={handleDrinkPick} selectedSlug={drinkSlug || undefined} />
          <input type="hidden" name="drink_media_slug" value={drinkSlug} />
          <input type="hidden" name="clear_drink_image" value={clearDrink ? "true" : "false"} />
        </AdminDetails>

        <AdminDetails summary="Food image" defaultOpen>
          <div className="mb-3 flex items-center gap-3">
            {foodPreview && !clearFood ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foodPreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <span className="text-sm text-white/40">No food image selected</span>
            )}
            <button
              type="button"
              onClick={() => {
                setClearFood(true);
                setFoodSlug("");
                setFoodPreview(null);
              }}
              className="rounded-md bg-red-500/12 px-2.5 py-1 text-xs text-red-200"
            >
              Remove
            </button>
          </div>
          <InlineMediaPicker slot="food" onSelect={handleFoodPick} selectedSlug={foodSlug || undefined} />
          <input type="hidden" name="food_media_slug" value={foodSlug} />
          <input type="hidden" name="clear_food_image" value={clearFood ? "true" : "false"} />
        </AdminDetails>

        <div className="flex flex-wrap gap-3 pt-2">
          <PrimaryButton
            type="submit"
            className="justify-center bg-[var(--hs-accent)] px-6 py-2.5 text-sm font-semibold hover:brightness-110"
          >
            Save changes
          </PrimaryButton>
          <Link
            href="/admin?tab=catalog"
            className="inline-flex min-h-10 items-center rounded-lg border border-white/15 px-4 py-2 text-sm text-white/75 hover:bg-white/[0.05]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </AdminPanel>
  );
}
