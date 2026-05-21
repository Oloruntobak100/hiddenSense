import { NextResponse } from "next/server";
import { processCreateListing } from "@/lib/admin/create-listing";
import { getAdminUser } from "@/lib/auth/admin";

export const runtime = "nodejs";

/** Multipart POST avoids Server Action body limits that reject image uploads (400). */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const site = new URL(request.url).origin;
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.redirect(
      new URL("/admin?error=Could+not+read+upload.+Try+a+smaller+image.", site),
    );
  }

  const result = await processCreateListing(formData);

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/admin?error=${encodeURIComponent(result.error)}`, site),
    );
  }

  const redirect = NextResponse.redirect(new URL("/admin?saved=1", site), 303);
  redirect.headers.set("Cache-Control", "no-store");
  return redirect;
}
