import { NextResponse } from "next/server";
import { processBulkImportCsv } from "@/lib/admin/bulk-import";
import { getAdminUser } from "@/lib/auth/admin";

export const runtime = "nodejs";

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

  const csvFile = formData.get("csv_file");
  const dryRun = formData.get("dry_run") === "true";

  if (!(csvFile instanceof File) || csvFile.size === 0) {
    return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
  }

  const csvText = await csvFile.text();
  const result = await processBulkImportCsv(csvText, { dryRun });

  return NextResponse.json(result);
}
