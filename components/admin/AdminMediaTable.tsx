"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AdminDataTable,
  AdminDetails,
  AdminEmptyState,
  AdminField,
  AdminPanel,
  AdminToolbar,
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/admin-ui";
import { DeleteMediaButton } from "@/components/admin/DeleteMediaButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export type MediaAssetRow = {
  id: string;
  label: string;
  slug: string;
  public_url: string;
  kind: "drink" | "food" | "general";
  created_at: string;
};

type UploadResult = {
  ok: boolean;
  uploaded: number;
  failed: number;
  results: Array<{ filename: string; ok: boolean; error?: string }>;
};

const KIND_OPTIONS = [
  { value: "general", label: "General" },
  { value: "drink", label: "Drink" },
  { value: "food", label: "Food" },
] as const;

export function AdminMediaTable({ assets }: { assets: MediaAssetRow[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof KIND_OPTIONS)[number]["value"]>("general");
  const [kindFilter, setKindFilter] = useState<"all" | "drink" | "food" | "general">("all");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (kindFilter !== "all" && asset.kind !== kindFilter) return false;
      if (!q) return true;
      return `${asset.label} ${asset.slug}`.toLowerCase().includes(q);
    });
  }, [assets, kindFilter, query]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setMessage(null);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = (await res.json()) as UploadResult & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      const failedNames = data.results?.filter((r) => !r.ok).map((r) => r.filename) ?? [];
      if (data.failed > 0) {
        setError(`Uploaded ${data.uploaded}, failed ${data.failed}: ${failedNames.join(", ")}`);
      } else {
        setMessage(`Uploaded ${data.uploaded} image${data.uploaded === 1 ? "" : "s"}.`);
      }

      form.reset();
      router.refresh();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <AdminDetails summary="Upload new images">
        <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
          <AdminField label="Asset kind">
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
              className={adminSelectClass}
            >
              {KIND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField label="Files" hint="JPEG, PNG, WebP, GIF · max 5 MB each">
            <input
              type="file"
              name="files"
              accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              multiple
              required
              className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white"
            />
          </AdminField>

          <PrimaryButton
            type="submit"
            disabled={uploading}
            className="h-[42px] justify-center bg-[var(--hs-accent)] px-5 text-sm font-semibold hover:brightness-110 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload"}
          </PrimaryButton>
        </form>

        {message ? (
          <p className="mt-3 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}
      </AdminDetails>

      <AdminPanel title="Media library" description="Attach images when editing catalog listings.">
        <AdminToolbar>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-[12rem] flex-1">
              <AdminField label="Search">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Label or slug…"
                  className={adminInputClass}
                />
              </AdminField>
            </div>
            <div className="w-full sm:w-40">
              <AdminField label="Kind">
                <select
                  value={kindFilter}
                  onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}
                  className={adminSelectClass}
                >
                  <option value="all">All kinds</option>
                  <option value="general">General</option>
                  <option value="drink">Drink</option>
                  <option value="food">Food</option>
                </select>
              </AdminField>
            </div>
          </div>
          <p className="text-xs text-white/40">{visible.length} of {assets.length}</p>
        </AdminToolbar>

        {visible.length === 0 ? (
          <AdminEmptyState
            title={assets.length === 0 ? "No images yet" : "No matches"}
            description="Upload images above, then attach them on the Catalog tab when editing a listing."
          />
        ) : (
          <AdminDataTable>
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-[11px] uppercase tracking-[0.12em] text-white/45">
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Kind</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((asset) => (
                <tr key={asset.id} className="border-b border-white/6 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.public_url}
                      alt={asset.label}
                      className="h-12 w-12 rounded-lg border border-white/10 object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{asset.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/55">{asset.slug}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/55">
                      {asset.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteMediaButton id={asset.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminDataTable>
        )}
      </AdminPanel>
    </div>
  );
}
