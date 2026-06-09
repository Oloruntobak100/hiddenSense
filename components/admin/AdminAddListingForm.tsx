"use client";

import { ALCOHOL_CATEGORIES } from "@/lib/admin/alcohol-categories";
import { AdminDetails, AdminField, AdminPanel, adminInputClass, adminSelectClass } from "@/components/admin/admin-ui";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type AdminAddListingFormProps = {
  saved?: boolean;
  error?: string | null;
};

export function AdminAddListingForm({ saved = false, error = null }: AdminAddListingFormProps) {
  return (
    <AdminPanel title="Add one listing" description="Quick single entry. For many items, use Import instead.">
      {saved ? (
        <p
          className="mb-4 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"
          role="status"
        >
          Listing saved successfully.
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
          {error}
        </p>
      ) : null}

      <form
        key={saved ? "after-save" : error ? "after-error" : "default"}
        action="/api/admin/recommendations"
        method="POST"
        encType="multipart/form-data"
        className="grid max-w-xl gap-4"
      >
        <AdminDetails summary="Drink details">
          <div className="grid gap-4">
            <AdminField label="Drink name">
              <input
                name="cocktail_name"
                placeholder="Hidden Spirits Evening Spritz"
                className={adminInputClass}
              />
            </AdminField>

            <AdminField label="Category" hint="Under-21 guests only see Non-alcoholic listings.">
              <select name="alcohol_category" defaultValue="" className={adminSelectClass}>
                <option value="">Other (default)</option>
                {ALCOHOL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label="Square checkout URL">
              <input
                name="square_checkout_url"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder="https://..."
                className={adminInputClass}
              />
            </AdminField>

            <AdminField label="Drink image">
              <input
                type="file"
                name="image_file"
                accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white"
              />
            </AdminField>
          </div>
        </AdminDetails>

        <AdminDetails summary="Food pairing (optional)">
          <div className="grid gap-4">
            <AdminField label="Food name">
              <input name="food_name" placeholder="Citrus tuna crudo" className={adminInputClass} />
            </AdminField>

            <AdminField label="Food image">
              <input
                type="file"
                name="food_image_file"
                accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white"
              />
            </AdminField>
          </div>
        </AdminDetails>

        <PrimaryButton
          type="submit"
          className="w-full max-w-xs justify-center bg-[var(--hs-accent)] py-2.5 text-sm font-semibold hover:brightness-110 sm:w-auto"
        >
          Save listing
        </PrimaryButton>
      </form>
    </AdminPanel>
  );
}
