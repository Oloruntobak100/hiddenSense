"use client";

import { useState } from "react";
import { ALCOHOL_CATEGORIES } from "@/lib/admin/alcohol-categories";
import { AdminPanel } from "@/components/admin/admin-ui";

function normalize(category: string) {
  return category.trim().toLowerCase();
}

export function AdminCatalogPolicyPanel({
  initial,
}: {
  initial: { minorAllowedCategories: string[] };
}) {
  const [selected, setSelected] = useState<string[]>(initial.minorAllowedCategories);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(category: string) {
    setSelected((current) => {
      const exists = current.some((c) => normalize(c) === normalize(category));
      if (exists) return current.filter((c) => normalize(c) !== normalize(category));
      return [...current, category];
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/catalog-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minorAllowedCategories: selected }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save policy.");
        return;
      }
      setMessage("Catalog policy saved.");
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPanel
      title="Minor guest catalog policy"
      description="Choose which alcohol categories under-21 guests may receive in recommendations. Adults see the full active catalog."
    >
      <form onSubmit={(e) => void handleSave(e)} className="grid gap-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {ALCOHOL_CATEGORIES.map((category) => {
            const checked = selected.some((c) => normalize(c) === normalize(category));
            return (
              <label
                key={category}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                  checked
                    ? "border-[var(--hs-accent)]/50 bg-[var(--hs-accent)]/10 text-white"
                    : "border-white/10 bg-black/20 text-white/70 hover:border-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(category)}
                  className="size-4 rounded border-white/20 bg-black/40"
                />
                {category}
              </label>
            );
          })}
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-200">{message}</p> : null}

        <button
          type="submit"
          disabled={saving || selected.length === 0}
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-lg bg-[var(--hs-accent)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save catalog policy"}
        </button>
      </form>
    </AdminPanel>
  );
}
