"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AdminDetails,
  AdminField,
  AdminPanel,
  adminInputClass,
} from "@/components/admin/admin-ui";
import { ALCOHOL_CATEGORIES } from "@/lib/admin/alcohol-categories";
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

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path
        fillRule="evenodd"
        d="M15.988 3.012A2.25 2.25 0 0 0 13.738 1.5h-6.476a2.25 2.25 0 0 0-2.25 2.25v6.476a2.25 2.25 0 0 0 2.25 2.25h6.476a2.25 2.25 0 0 0 2.25-2.25V3.012ZM8.012 3a.75.75 0 0 1 .75-.75h6.476a.75.75 0 0 1 .75.75v6.476a.75.75 0 0 1-.75.75H8.762a.75.75 0 0 1-.75-.75V3Z"
        clipRule="evenodd"
      />
      <path d="M4.25 6.25A2.25 2.25 0 0 0 2 8.5v6.75A2.25 2.25 0 0 0 4.25 17.5h6.75a2.25 2.25 0 0 0 2.25-2.25v-.75a.75.75 0 0 0-1.5 0v.75c0 .414-.336.75-.75.75H4.25a.75.75 0 0 1-.75-.75V8.5c0-.414.336-.75.75-.75h.75a.75.75 0 0 0 0-1.5h-.75Z" />
    </svg>
  );
}

export function AdminBulkImportPanel() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<BulkImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);

  async function copyCategory(name: string) {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedCategory(name);
      window.setTimeout(() => setCopiedCategory((current) => (current === name ? null : current)), 1500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

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
    <AdminPanel
      title="Bulk CSV import"
      description="Import listing metadata. Upload images separately in Media, then attach on Catalog → Edit."
    >
      <div className="mb-5 flex flex-wrap gap-4 text-sm">
        <a href="/api/admin/bulk-import/template" className="text-[var(--hs-accent)] hover:underline">
          Download CSV template
        </a>
      </div>

      <AdminDetails summary="Alcohol categories reference">
        <p className="mb-3 text-xs text-white/45">
          Copy exact values into the <code className="text-white/70">alcohol_category</code> column. Blank defaults
          to Other.
        </p>
        <div className="max-h-40 overflow-y-auto rounded-lg border border-white/8">
          <table className="w-full text-left text-sm">
            <tbody>
              {ALCOHOL_CATEGORIES.map((category) => (
                <tr key={category} className="border-b border-white/6 last:border-0">
                  <td className="px-3 py-2 text-white/85">{category}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => void copyCategory(category)}
                      className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2 py-1 text-[11px] text-white/75 hover:bg-white/12"
                    >
                      <CopyIcon />
                      {copiedCategory === category ? "Copied" : "Copy"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminDetails>

      {error ? (
        <p className="my-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleImport} className="mt-5 grid max-w-xl gap-4">
        <AdminField label="CSV file">
          <input
            type="file"
            name="csv_file"
            accept=".csv,text/csv"
            required
            className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white"
          />
        </AdminField>

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="rounded border-white/20"
          />
          Dry run only (validate, no database writes)
        </label>

        <PrimaryButton
          type="submit"
          disabled={importing}
          className="w-full max-w-xs justify-center bg-[var(--hs-accent)] py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-60 sm:w-auto"
        >
          {importing ? "Processing…" : dryRun ? "Validate CSV" : "Import listings"}
        </PrimaryButton>
      </form>

      {result ? (
        <AdminDetails summary={`${result.dryRun ? "Validation" : "Import"} results — ${result.failed} failed`} defaultOpen>
          <p className="mb-3 text-sm text-white/70">
            {result.created} created · {result.updated} updated · {result.failed} failed
          </p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-white/8">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/8 text-white/40">
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={`${row.row}-${row.message}`} className="border-b border-white/6 last:border-0">
                    <td className="px-3 py-2 tabular-nums text-white/60">{row.row}</td>
                    <td className="px-3 py-2 text-white/80">{row.status}</td>
                    <td className="px-3 py-2 text-white/55">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminDetails>
      ) : null}
    </AdminPanel>
  );
}
