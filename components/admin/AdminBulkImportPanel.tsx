"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
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
  const [showCategories, setShowCategories] = useState(false);
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
    <div>
      <h2 className="mb-2 text-lg font-semibold">Bulk CSV import</h2>
      <p className="mb-4 text-xs leading-relaxed text-white/48">
        Import drink and food listing metadata from CSV. Upload images to the media library first, then attach them
        when editing each listing. Blank <code className="text-white/70">alcohol_category</code> defaults to{" "}
        <code className="text-white/70">Other</code>.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <a
          href="/api/admin/bulk-import/template"
          className="inline-flex text-sm text-[var(--hs-accent)] underline-offset-2 hover:underline"
        >
          Download CSV template
        </a>
        <button
          type="button"
          onClick={() => setShowCategories((open) => !open)}
          className="inline-flex text-sm text-[var(--hs-accent)] underline-offset-2 hover:underline"
        >
          {showCategories ? "Hide available categories" : "Show available categories"}
        </button>
      </div>

      {showCategories ? (
        <div className="mb-4 rounded-2xl border border-white/12 bg-black/20 p-4">
          <p className="mb-3 text-xs text-white/50">
            Copy a category into the <code className="text-white/70">alcohol_category</code> column. Spelling must
            match exactly.
          </p>
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {ALCOHOL_CATEGORIES.map((category) => (
              <li
                key={category}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[0.04]"
              >
                <span className="text-sm text-white/85">{category}</span>
                <button
                  type="button"
                  onClick={() => void copyCategory(category)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/15"
                  aria-label={`Copy ${category}`}
                  title={`Copy ${category}`}
                >
                  <CopyIcon />
                  {copiedCategory === category ? "Copied" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
