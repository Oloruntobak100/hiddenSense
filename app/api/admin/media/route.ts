import { NextResponse } from "next/server";
import { createMediaAssetFromFile, deleteMediaAsset, listMediaAssets, listMediaAssetsForPicker, type MediaKind } from "@/lib/admin/media-assets";
import { filesFromFormData } from "@/lib/admin/upload-image";
import { getAdminUser } from "@/lib/auth/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const slotParam = url.searchParams.get("slot");
  const kindParam = url.searchParams.get("kind");

  let assets;
  if (slotParam === "drink" || slotParam === "food") {
    assets = await listMediaAssetsForPicker(slotParam);
  } else {
    const kind =
      kindParam === "drink" || kindParam === "food" || kindParam === "general"
        ? (kindParam as MediaKind)
        : undefined;
    assets = await listMediaAssets(kind);
  }

  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read upload." }, { status: 400 });
  }

  const kindRaw = String(formData.get("kind") ?? "general");
  const kind: MediaKind =
    kindRaw === "drink" || kindRaw === "food" || kindRaw === "general" ? kindRaw : "general";

  const files = filesFromFormData(formData, "files");
  if (files.length === 0) {
    const single = filesFromFormData(formData, "file");
    files.push(...single);
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "No image files provided." }, { status: 400 });
  }

  const results: Array<{ filename: string; ok: boolean; asset?: unknown; error?: string }> = [];

  for (const file of files) {
    const labelOverride = String(formData.get(`label_${file.name}`) ?? "").trim();
    const result = await createMediaAssetFromFile(file, {
      kind,
      label: labelOverride || undefined,
    });

    if ("error" in result) {
      results.push({ filename: file.name, ok: false, error: result.error });
    } else {
      results.push({ filename: file.name, ok: true, asset: result.asset });
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  return NextResponse.json({
    ok: failed === 0,
    uploaded: results.filter((r) => r.ok).length,
    failed,
    results,
  });
}

export async function DELETE(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const result = await deleteMediaAsset(id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
