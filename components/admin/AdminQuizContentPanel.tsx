"use client";

import { useMemo, useState } from "react";
import { AdminDetails, AdminPanel } from "@/components/admin/admin-ui";
import type {
  MoodQuestionConfig,
  QuizContentConfig,
  QuizSectionId,
  TasteQuestionConfig,
} from "@/lib/quiz/quiz-content-types";

const SECTION_ORDER: QuizSectionId[] = ["energy", "social", "flavor", "taste"];

const ROLE_LABELS: Record<MoodQuestionConfig["role"], string> = {
  energy: "Energy (maps to quiz scoring)",
  emotion: "Emotion",
  mental: "Mental clarity",
  social: "Social vibe",
  intent: "Intent (averaged with other intent questions)",
};

export function AdminQuizContentPanel({ initial }: { initial: QuizContentConfig }) {
  const [content, setContent] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const moodBySection = useMemo(() => {
    const map = new Map<QuizSectionId, MoodQuestionConfig[]>();
    for (const section of SECTION_ORDER) map.set(section, []);
    for (const q of content.moodQuestions) {
      if (q.section === "taste") continue;
      map.get(q.section)?.push(q);
    }
    for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [content.moodQuestions]);

  function updateMood(id: string, patch: Partial<MoodQuestionConfig>) {
    setContent((c) => ({
      ...c,
      moodQuestions: c.moodQuestions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    }));
  }

  function updateTaste(id: string, patch: Partial<TasteQuestionConfig>) {
    setContent((c) => ({
      ...c,
      tasteQuestions: c.tasteQuestions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    }));
  }

  function updateTasteOption(id: string, key: "A" | "B" | "C", text: string) {
    setContent((c) => ({
      ...c,
      tasteQuestions: c.tasteQuestions.map((q) =>
        q.id === id
          ? {
              ...q,
              options: q.options.map((o) => (o.key === key ? { ...o, text } : o)),
            }
          : q,
      ),
    }));
  }

  function updateSection(section: QuizSectionId, patch: Partial<{ title: string; subtitle: string }>) {
    setContent((c) => ({
      ...c,
      sections: { ...c.sections, [section]: { ...c.sections[section], ...patch } },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/quiz-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save quiz content.");
        return;
      }
      setMessage("Quiz content saved. Changes apply on the next /quiz visit.");
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <AdminPanel
        title="Quiz questions & responses"
        description="Edit prompts, scale labels, and taste options. Saved changes go live immediately for new quiz sessions."
      >
        <form onSubmit={(e) => void handleSave(e)} className="space-y-8">
          {SECTION_ORDER.filter((s) => s !== "taste").map((sectionId) => (
            <section key={sectionId} className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-white/45">
                    {sectionId} section title
                  </span>
                  <input
                    value={content.sections[sectionId].title}
                    onChange={(e) => updateSection(sectionId, { title: e.target.value })}
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-white/45">Subtitle</span>
                  <input
                    value={content.sections[sectionId].subtitle}
                    onChange={(e) => updateSection(sectionId, { subtitle: e.target.value })}
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                </label>
              </div>

              {(moodBySection.get(sectionId) ?? []).map((q) => (
                <div key={q.id} className="space-y-3 rounded-lg border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">
                      {q.id.toUpperCase()} · {ROLE_LABELS[q.role]}
                    </p>
                    <label className="flex items-center gap-2 text-xs text-white/70">
                      <input
                        type="checkbox"
                        checked={q.active}
                        onChange={(e) => updateMood(q.id, { active: e.target.checked })}
                        className="size-4 rounded border-white/20 bg-black/40"
                      />
                      Active
                    </label>
                  </div>
                  <label className="grid gap-1.5">
                    <span className="text-xs text-white/45">Question prompt</span>
                    <textarea
                      value={q.prompt}
                      onChange={(e) => updateMood(q.id, { prompt: e.target.value })}
                      rows={2}
                      className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5">
                      <span className="text-xs text-white/45">Left label (low end)</span>
                      <input
                        value={q.left}
                        onChange={(e) => updateMood(q.id, { left: e.target.value })}
                        className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                      />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-xs text-white/45">Right label (high end)</span>
                      <input
                        value={q.right}
                        onChange={(e) => updateMood(q.id, { right: e.target.value })}
                        className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </section>
          ))}

          <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-white/45">Taste section title</span>
                <input
                  value={content.sections.taste.title}
                  onChange={(e) => updateSection("taste", { title: e.target.value })}
                  className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-white/45">Subtitle</span>
                <input
                  value={content.sections.taste.subtitle}
                  onChange={(e) => updateSection("taste", { subtitle: e.target.value })}
                  className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </label>
            </div>

            {content.tasteQuestions
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((q) => (
                <div key={q.id} className="space-y-3 rounded-lg border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">{q.id.toUpperCase()} · Taste choice</p>
                    <label className="flex items-center gap-2 text-xs text-white/70">
                      <input
                        type="checkbox"
                        checked={q.active}
                        onChange={(e) => updateTaste(q.id, { active: e.target.checked })}
                        className="size-4 rounded border-white/20 bg-black/40"
                      />
                      Active
                    </label>
                  </div>
                  <label className="grid gap-1.5">
                    <span className="text-xs text-white/45">Question prompt</span>
                    <textarea
                      value={q.prompt}
                      onChange={(e) => updateTaste(q.id, { prompt: e.target.value })}
                      rows={2}
                      className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <div className="grid gap-2">
                    {q.options.map((opt) => (
                      <label key={opt.key} className="grid gap-1.5">
                        <span className="text-xs text-white/45">Option {opt.key}</span>
                        <input
                          value={opt.text}
                          onChange={(e) => updateTasteOption(q.id, opt.key, e.target.value)}
                          className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
          </section>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-200">{message}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--hs-accent)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save quiz content"}
          </button>
        </form>
      </AdminPanel>

      <AdminDetails summary="Scoring roles (do not disable required roles)">
        <ul className="list-disc space-y-2 pl-5 text-sm text-white/65">
          <li>Mood scale questions feed the recommendation engine via fixed roles (energy, emotion, mental, social, intent).</li>
          <li>Keep exactly one active question per role except intent — you may use multiple intent questions (m5–m7).</li>
          <li>Taste options A / B / C map to lemon, strawberry, and apple lanes for pairing.</li>
        </ul>
      </AdminDetails>
    </div>
  );
}
