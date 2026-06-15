import { NextResponse } from "next/server";
import { z } from "zod";
import { getQuizContentConfig, saveQuizContentConfig } from "@/lib/quiz/quiz-content";
import { getAdminUser } from "@/lib/auth/admin";
import type { QuizContentConfig } from "@/lib/quiz/quiz-content-types";

export const runtime = "nodejs";

const OptionSchema = z.object({
  key: z.enum(["A", "B", "C"]),
  text: z.string().min(1).max(500),
});

const MoodSchema = z.object({
  id: z.string().min(1).max(20),
  section: z.enum(["energy", "social", "flavor", "taste"]),
  role: z.enum(["energy", "emotion", "mental", "social", "intent"]),
  prompt: z.string().min(1).max(500),
  left: z.string().min(1).max(200),
  right: z.string().min(1).max(200),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
});

const TasteSchema = z.object({
  id: z.string().min(1).max(20),
  section: z.literal("taste"),
  prompt: z.string().min(1).max(500),
  options: z.array(OptionSchema).length(3),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
});

const SaveSchema = z.object({
  sections: z.object({
    energy: z.object({ title: z.string(), subtitle: z.string() }),
    social: z.object({ title: z.string(), subtitle: z.string() }),
    flavor: z.object({ title: z.string(), subtitle: z.string() }),
    taste: z.object({ title: z.string(), subtitle: z.string() }),
  }),
  moodQuestions: z.array(MoodSchema),
  tasteQuestions: z.array(TasteSchema),
});

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const content = await getQuizContentConfig();
  return NextResponse.json({ content });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid quiz content" }, { status: 400 });
  }

  const result = await saveQuizContentConfig(parsed.data as QuizContentConfig);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
