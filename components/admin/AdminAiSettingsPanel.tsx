"use client";

import { useState } from "react";
import { AdminDetails, AdminPanel } from "@/components/admin/admin-ui";
import type { AiAgentConfig } from "@/lib/intelligence/ai-agent-config";

export function AdminAiSettingsPanel({
  initial,
  openAiConfigured,
}: {
  initial: AiAgentConfig;
  openAiConfigured: boolean;
}) {
  const [config, setConfig] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: config.enabled,
          systemPrompt: config.systemPrompt,
          model: config.model,
          temperature: config.temperature,
          maxCandidates: config.maxCandidates,
          historyLimit: config.historyLimit,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save settings.");
        return;
      }
      setMessage("AI settings saved.");
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {!openAiConfigured ? (
        <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Set <code className="text-amber-50">OPENAI_API_KEY</code> in Vercel environment variables to enable AI
          recommendations. The rule-based engine remains the fallback.
        </p>
      ) : null}

      <AdminPanel
        title="AI recommendation agent"
        description="OpenAI selects from your catalog using quiz context, recommendation history, and guest feedback."
      >
        <form onSubmit={(e) => void handleSave(e)} className="grid gap-5">
          <label className="flex items-center gap-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig((c) => ({ ...c, enabled: e.target.checked }))}
              className="size-4 rounded border-white/20 bg-black/40"
            />
            Enable AI recommendations (falls back to rule engine if unavailable)
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-white/80">System prompt</span>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig((c) => ({ ...c, systemPrompt: e.target.value }))}
              rows={14}
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-xs leading-relaxed text-white/90"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/80">Model</span>
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig((c) => ({ ...c, model: e.target.value }))}
                className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                placeholder="gpt-4o-mini"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/80">Temperature ({config.temperature.toFixed(2)})</span>
              <input
                type="range"
                min={0}
                max={1.5}
                step={0.05}
                value={config.temperature}
                onChange={(e) => setConfig((c) => ({ ...c, temperature: Number(e.target.value) }))}
                className="w-full"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/80">Catalog candidates sent to AI</span>
              <input
                type="number"
                min={5}
                max={50}
                value={config.maxCandidates}
                onChange={(e) => setConfig((c) => ({ ...c, maxCandidates: Number(e.target.value) }))}
                className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/80">Past sessions in context</span>
              <input
                type="number"
                min={3}
                max={30}
                value={config.historyLimit}
                onChange={(e) => setConfig((c) => ({ ...c, historyLimit: Number(e.target.value) }))}
                className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-200">{message}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-lg bg-[var(--hs-accent)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save AI settings"}
          </button>
        </form>
      </AdminPanel>

      <AdminDetails summary="How the AI learns (no model fine-tuning)">
        <ul className="list-disc space-y-2 pl-5 text-sm text-white/65">
          <li>Each quiz sends mood scores, taste lane, and up to N past recommendations to OpenAI.</li>
          <li>Pairing feedback (absolutely / close enough / not really), mood accuracy, ratings, and checkout clicks are included.</li>
          <li>After feedback, a preference summary is refreshed on the guest profile for future sessions.</li>
          <li>The AI must pick from your active catalog — it cannot invent new drinks.</li>
        </ul>
      </AdminDetails>
    </div>
  );
}
