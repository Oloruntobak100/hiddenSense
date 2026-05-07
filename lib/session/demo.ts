import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { DEMO_MODE_COOKIE, DEMO_RESULT_COOKIE } from "@/lib/session/constants";

const cookieBase = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

const DemoResultSchema = z.object({
  mood_key: z.string(),
  mood_name: z.string(),
  confidence_score: z.number(),
});

export type DemoResultPayload = z.infer<typeof DemoResultSchema>;

export async function isDemoSession(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(DEMO_MODE_COOKIE)?.value === "1";
}

export async function setDemoSessionFlag() {
  const jar = await cookies();
  jar.set(DEMO_MODE_COOKIE, "1", {
    ...cookieBase,
    maxAge: 60 * 60 * 24,
  });
}

export async function clearDemoSession() {
  const jar = await cookies();
  jar.delete(DEMO_MODE_COOKIE);
  jar.delete(DEMO_RESULT_COOKIE);
}

export async function setDemoResultPayload(payload: DemoResultPayload) {
  const jar = await cookies();
  jar.set(DEMO_RESULT_COOKIE, JSON.stringify(payload), {
    ...cookieBase,
    maxAge: 60 * 60 * 2,
  });
}

export async function getDemoResultPayload(): Promise<DemoResultPayload | null> {
  const jar = await cookies();
  const raw = jar.get(DEMO_RESULT_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = DemoResultSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
