"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type BulkImportResponse = {
  ok: boolean;
  dryRun: boolean;
  total: number;
  created: number;
  updated: number;
  failed: number;
  rows: Array<{ row: number; status: string; message: string }>;
  error?: string;
};

export function AdminBulkImportPanel() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<BulkImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setImporting(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    formData.set("dry_run", dryRun ? "true" : "false");

    try {
      const res = await fetch("/api/admin/bulk-import", { method: "POST", body: formData });
      const data = (await res.json()) as BulkImportResponse;

      if (!res.ok) {
        setError(data.error ?? "Import failed.");
        return;
      }

      setResult(data);
      if (!dryRun && data.failed === 0) {
        router.refresh();
      }
    } catch {
      setError("Import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Bulk CSV import</h2>
      <p className="mb-4 text-xs leading-relaxed text-white/48">
        Import drink and food listing metadata from CSV. Images are linked separately via media library slugs (
        <code className="text-white/70">drink_image_slug</code>,{" "}
        <code className="text-white/70">food_image_slug</code>). Upload images to the media library first.
      </p>

      <a
        href="/api/admin/bulk-import/template"
        className="mb-4 inline-flex text-sm text-[var(--hs-accent)] underline-offset-2 hover:underline"
      >
        Download CSV template
      </a>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleImport} className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">CSV file</span>
          <input
            type="file"
            name="csv_file"
            accept=".csv,text/csv"
            required
            className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white file:hover:bg-white/15"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="rounded border-white/20"
          />
          Dry run (validate only, no database writes)
        </label>

        <PrimaryButton
          type="submit"
          disabled={importing}
          className="w-full justify-center bg-[var(--hs-accent)] py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-60"
        >
          {importing ? "Processing…" : dryRun ? "Validate CSV" : "Import listings"}
        </PrimaryButton>
      </form>

      {result ? (
        <div className="mt-5 rounded-2xl border border-white/12 bg-black/20 p-4">
          <p className="text-sm font-semibold">
            {result.dryRun ? "Validation" : "Import"} complete · {result.created} created · {result.updated}{" "}
            updated · {result.failed} failed
          </p>
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-xs text-white/65">
            {result.rows.map((row) => (
              <li key={`${row.row}-${row.message}`}>
                Row {row.row}: <span className="text-white/85">{row.status}</span> — {row.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
