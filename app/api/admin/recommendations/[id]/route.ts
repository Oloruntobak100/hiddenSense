import { NextResponse } from "next/server";
import { processUpdateListing } from "@/lib/admin/update-listing";
import { getAdminUser } from "@/lib/auth/admin";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const { id } = await context.params;
  const site = new URL(request.url).origin;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.redirect(
      new URL(`/admin/listings/${id}/edit?error=Could+not+read+form.`, site),
    );
  }

  formData.set("id", id);
  const result = await processUpdateListing(formData);

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/admin/listings/${id}/edit?error=${encodeURIComponent(result.error)}`, site),
    );
  }

  return NextResponse.redirect(new URL("/admin?tab=catalog&saved=1", site), 303);
}
