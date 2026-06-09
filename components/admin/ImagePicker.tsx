"use client";

import { useEffect, useState } from "react";

export type MediaAssetItem = {
  id: string;
  label: string;
  slug: string;
  public_url: string;
  kind: "drink" | "food" | "general";
};

function kindLabel(kind: MediaAssetItem["kind"]) {
  if (kind === "general") return "General";
  if (kind === "drink") return "Drink";
  return "Food";
}

function useMediaAssets(slot?: "drink" | "food") {
  const [assets, setAssets] = useState<MediaAssetItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = slot ? `?slot=${slot}` : "";

    fetch(`/api/admin/media${params}`)
      .then((res) => res.json())
      .then((data: { assets?: MediaAssetItem[]; error?: string }) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setAssets([]);
          return;
        }
        setAssets(data.assets ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load media library.");
          setAssets([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slot]);

  return { assets, error, loading: assets === null };
}

type MediaAssetGridProps = {
  assets: MediaAssetItem[];
  onSelect: (asset: MediaAssetItem) => void;
  selectedSlug?: string;
};

function MediaAssetGrid({ assets, onSelect, selectedSlug }: MediaAssetGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
      {assets.map((asset) => {
        const selected = selectedSlug === asset.slug;
        return (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelect(asset)}
            className={`overflow-hidden rounded-xl border text-left transition ${
              selected
                ? "border-[var(--hs-accent)] bg-[var(--hs-accent)]/10"
                : "border-white/12 bg-black/20 hover:border-[var(--hs-accent)]/50 hover:bg-white/[0.04]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.public_url} alt={asset.label} className="aspect-square w-full object-cover" />
            <div className="p-1.5">
              <p className="truncate text-[10px] font-medium text-white/90">{asset.label}</p>
              <p className="text-[9px] uppercase tracking-wide text-white/35">{kindLabel(asset.kind)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

type InlineMediaPickerProps = {
  slot: "drink" | "food";
  onSelect: (asset: MediaAssetItem) => void;
  selectedSlug?: string;
};

export function InlineMediaPicker({ slot, onSelect, selectedSlug }: InlineMediaPickerProps) {
  const { assets, error, loading } = useMediaAssets(slot);

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-3">
      <p className="mb-2 text-[10px] text-white/45">
        Media library · showing {slot} and general uploads
      </p>
      {loading ? <p className="text-xs text-white/50">Loading media…</p> : null}
      {error ? <p className="text-xs text-red-200">{error}</p> : null}
      {!loading && assets && assets.length === 0 ? (
        <p className="text-xs text-white/50">No images yet. Upload with Asset kind General, Drink, or Food.</p>
      ) : null}
      {assets && assets.length > 0 ? (
        <MediaAssetGrid assets={assets} onSelect={onSelect} selectedSlug={selectedSlug} />
      ) : null}
    </div>
  );
}

type ImagePickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAssetItem) => void;
  slot?: "drink" | "food";
  title?: string;
};

export function ImagePicker({ open, onClose, onSelect, slot, title = "Choose image" }: ImagePickerProps) {
  const { assets, error, loading } = useMediaAssets(slot);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex max-h-[85dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#12101c] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {slot ? (
              <p className="mt-1 text-xs text-white/45">
                Showing {slot} and general images from your media library.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {loading ? <p className="text-sm text-white/60">Loading media…</p> : null}
          {error ? <p className="text-sm text-red-200">{error}</p> : null}
          {!loading && assets && assets.length === 0 ? (
            <p className="text-sm text-white/55">
              No images in the library yet. Upload assets in the Media library section first.
            </p>
          ) : null}
          {assets && assets.length > 0 ? (
            <MediaAssetGrid assets={assets} onSelect={(asset) => { onSelect(asset); onClose(); }} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
