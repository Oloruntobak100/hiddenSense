"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ALCOHOL_CATEGORIES } from "@/lib/admin/alcohol-categories";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function AdminAddListingForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const saved = searchParams.get("saved") === "1";

  const formKey = useMemo(
    () => (saved ? `saved-${Date.now()}` : error ? `err-${error.slice(0, 24)}` : "default"),
    [saved, error],
  );

  return (
    <div>
      {saved ? (
        <p
          className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
          role="status"
        >
          Listing saved successfully.
        </p>
      ) : null}
      {error ? (
        <p
          className="mb-4 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <form
        key={formKey}
        action="/api/admin/recommendations"
        method="POST"
        encType="multipart/form-data"
        className="grid gap-4"
      >
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-white/55">
          Drink section (optional if you are only adding food)
        </p>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            Drink name <span className="font-normal normal-case text-white/40">(optional)</span>
          </span>
          <input
            name="cocktail_name"
            placeholder="Hidden Spirits Evening Spritz"
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-white/35"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            Category <span className="font-normal normal-case text-white/40">(optional)</span>
          </span>
          <p className="text-[10px] leading-snug text-white/40">
            Under-21 guests only see listings saved as <strong className="text-white/70">Non-alcoholic</strong>.
          </p>
          <select
            name="alcohol_category"
            defaultValue=""
            className="appearance-none rounded-xl border border-white/15 bg-black/20 bg-[length:14px_10px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2.5 text-sm outline-none [&>option]:bg-[#151024]"
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"%3E%3Cpath stroke="%23ffffff" stroke-opacity=".45" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 8 4 4 4-4"/%3E%3C/svg%3E\')',
              paddingRight: "2.25rem",
            }}
          >
            <option value="">— Select category (optional) —</option>
            {ALCOHOL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            Square checkout URL <span className="font-normal normal-case text-white/40">(optional)</span>
          </span>
          <input
            name="square_checkout_url"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="https://..."
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-white/35"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            Drink image <span className="font-normal normal-case text-white/40">(optional)</span>
          </span>
          <input
            type="file"
            name="image_file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white file:hover:bg-white/15"
          />
        </label>

        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-white/55">
          Food section (optional if you are only adding a drink)
        </p>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            Food name <span className="font-normal normal-case text-white/40">(optional)</span>
          </span>
          <input
            name="food_name"
            placeholder="Citrus tuna crudo"
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-white/35"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            Food image <span className="font-normal normal-case text-white/40">(optional)</span>
          </span>
          <input
            type="file"
            name="food_image_file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white file:hover:bg-white/15"
          />
        </label>

        <PrimaryButton
          type="submit"
          className="mt-2 w-full justify-center bg-[var(--hs-accent)] py-2.5 text-sm font-semibold hover:brightness-110"
        >
          Save listing
        </PrimaryButton>
      </form>
    </div>
  );
}
