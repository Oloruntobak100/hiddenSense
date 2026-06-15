import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalogPolicyConfig, saveCatalogPolicyConfig } from "@/lib/admin/catalog-policy";
import { getAdminUser } from "@/lib/auth/admin";

export const runtime = "nodejs";

const SaveSchema = z.object({
  minorAllowedCategories: z.array(z.string().min(1).max(80)).min(1).max(32),
});

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const policy = await getCatalogPolicyConfig();
  return NextResponse.json({ policy });
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
    return NextResponse.json({ ok: false, error: "Invalid policy" }, { status: 400 });
  }

  const result = await saveCatalogPolicyConfig({
    minorAllowedCategories: parsed.data.minorAllowedCategories,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
