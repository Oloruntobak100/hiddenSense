import { NextResponse } from "next/server";
import { BULK_IMPORT_CSV_TEMPLATE } from "@/lib/admin/bulk-import";
import { getAdminUser } from "@/lib/auth/admin";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return new NextResponse(BULK_IMPORT_CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="hiddensense-catalog-template.csv"',
    },
  });
}
