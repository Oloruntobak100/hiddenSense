import { NextResponse } from "next/server";
import { z } from "zod";
import { getAiAgentConfig, saveAiAgentConfig } from "@/lib/intelligence/ai-agent-config";
import { getAdminUser } from "@/lib/auth/admin";

export const runtime = "nodejs";

const SaveSchema = z.object({
  enabled: z.boolean(),
  systemPrompt: z.string().min(40).max(12000),
  model: z.string().min(1).max(80),
  temperature: z.number().min(0).max(2),
  maxCandidates: z.number().int().min(5).max(50),
  historyLimit: z.number().int().min(3).max(30),
});

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await getAiAgentConfig();
  return NextResponse.json({ config });
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
    return NextResponse.json({ ok: false, error: "Invalid settings" }, { status: 400 });
  }

  const result = await saveAiAgentConfig({
    enabled: parsed.data.enabled,
    systemPrompt: parsed.data.systemPrompt,
    model: parsed.data.model,
    temperature: parsed.data.temperature,
    maxCandidates: parsed.data.maxCandidates,
    historyLimit: parsed.data.historyLimit,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
