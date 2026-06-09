"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type UploadResult = {
  ok: boolean;
  uploaded: number;
  failed: number;
  results: Array<{ filename: string; ok: boolean; error?: string }>;
};

export function MediaLibraryPanel() {
  const router = useRouter();
  const [kind, setKind] = useState<"general" | "drink" | "food">("general");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        setMessage(`Uploaded ${data.uploaded} image${data.uploaded === 1 ? "" : "s"} to media library.`);
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
    <div>
      <h2 className="mb-2 text-lg font-semibold">Media library</h2>
      <p className="mb-4 text-xs leading-relaxed text-white/48">
        Upload drink and food images here first. Link them to listings when editing, or reference slugs in CSV bulk
        import (<code className="text-white/70">drink_image_slug</code>,{" "}
        <code className="text-white/70">food_image_slug</code>). JPEG / PNG / WebP / GIF, max 5 MB each.
      </p>

      {message ? (
        <p className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleUpload} className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Asset kind</span>
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none"
          >
            <option value="general">General</option>
            <option value="drink">Drink</option>
            <option value="food">Food</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
            Images (multi-select)
          </span>
          <input
            type="file"
            name="files"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            multiple
            required
            className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white file:hover:bg-white/15"
          />
        </label>

        <PrimaryButton
          type="submit"
          disabled={uploading}
          className="w-full justify-center bg-[var(--hs-accent)] py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Upload to library"}
        </PrimaryButton>
      </form>
    </div>
  );
}
