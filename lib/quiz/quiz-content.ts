import "server-only";

import { DEFAULT_QUIZ_CONTENT } from "@/lib/quiz/default-quiz-content";
import type { QuizContentConfig } from "@/lib/quiz/quiz-content-types";
import { validateQuizContentConfig } from "@/lib/quiz/build-quiz-payload";
import type { Json } from "@/lib/supabase/database.types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function mergeWithDefaults(raw: unknown): QuizContentConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_QUIZ_CONTENT;

  const input = raw as Partial<QuizContentConfig>;
  const moodById = new Map(DEFAULT_QUIZ_CONTENT.moodQuestions.map((q) => [q.id, q]));
  const tasteById = new Map(DEFAULT_QUIZ_CONTENT.tasteQuestions.map((q) => [q.id, q]));

  for (const q of input.moodQuestions ?? []) {
    const base = moodById.get(q.id);
    if (!base) continue;
    moodById.set(q.id, {
      ...base,
      prompt: typeof q.prompt === "string" ? q.prompt : base.prompt,
      left: typeof q.left === "string" ? q.left : base.left,
      right: typeof q.right === "string" ? q.right : base.right,
      active: typeof q.active === "boolean" ? q.active : base.active,
      sortOrder: typeof q.sortOrder === "number" ? q.sortOrder : base.sortOrder,
    });
  }

  for (const q of input.tasteQuestions ?? []) {
    const base = tasteById.get(q.id);
    if (!base) continue;
    const options = base.options.map((opt) => {
      const next = q.options?.find((o) => o.key === opt.key);
      return next ? { ...opt, text: next.text } : opt;
    });
    tasteById.set(q.id, { ...base, ...q, id: base.id, section: "taste", options });
  }

  const sections = { ...DEFAULT_QUIZ_CONTENT.sections };
  for (const key of Object.keys(sections) as Array<keyof typeof sections>) {
    if (input.sections?.[key]) {
      sections[key] = { ...sections[key], ...input.sections[key] };
    }
  }

  return {
    sections,
    moodQuestions: [...moodById.values()].sort((a, b) => a.sortOrder - b.sortOrder),
    tasteQuestions: [...tasteById.values()].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export async function getQuizContentConfig(): Promise<QuizContentConfig> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("quiz_content_config").select("content").eq("id", 1).maybeSingle();

  if (error || !data?.content) return DEFAULT_QUIZ_CONTENT;
  return mergeWithDefaults(data.content);
}

export async function saveQuizContentConfig(
  config: QuizContentConfig,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const merged = mergeWithDefaults(config);
  const validationError = validateQuizContentConfig(merged);
  if (validationError) return { ok: false, error: validationError };

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("quiz_content_config").upsert(
    {
      id: 1,
      content: merged as unknown as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
