"use client";

import { useEffect, useState } from "react";

export type MediaAssetItem = {
  id: string;
  label: string;
  slug: string;
  public_url: string;
  kind: "drink" | "food" | "general";
};

type ImagePickerGridProps = {
  kind?: "drink" | "food" | "general";
  onSelect: (asset: MediaAssetItem) => void;
  onClose: () => void;
  title: string;
};

function ImagePickerGrid({ kind, onSelect, onClose, title }: ImagePickerGridProps) {
  const [assets, setAssets] = useState<MediaAssetItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = kind ? `?kind=${kind}` : "";

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
  }, [kind]);

  const loading = assets === null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex max-h-[85dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#12101c] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
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

          {!loading && assets.length === 0 ? (
            <p className="text-sm text-white/55">
              No images in the library yet. Upload assets in the Media library section first.
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {(assets ?? []).map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onSelect(asset);
                  onClose();
                }}
                className="group overflow-hidden rounded-2xl border border-white/12 bg-black/20 text-left transition hover:border-[var(--hs-accent)]/60 hover:bg-white/[0.04]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.public_url}
                  alt={asset.label}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-white/90">{asset.label}</p>
                  <p className="truncate text-[10px] text-white/45">{asset.slug}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type ImagePickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAssetItem) => void;
  kind?: "drink" | "food" | "general";
  title?: string;
};

export function ImagePicker({ open, onClose, onSelect, kind, title = "Choose image" }: ImagePickerProps) {
  if (!open) return null;

  return (
    <ImagePickerGrid
      key={kind ?? "all"}
      kind={kind}
      onSelect={onSelect}
      onClose={onClose}
      title={title}
    />
  );
}
