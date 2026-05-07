import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  DEMO_MODE_COOKIE,
  DEMO_RESULT_COOKIE,
  PROFILE_COOKIE,
} from "@/lib/session/constants";

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  const jar = await cookies();
  jar.delete(PROFILE_COOKIE);
  jar.delete(DEMO_MODE_COOKIE);
  jar.delete(DEMO_RESULT_COOKIE);

  return NextResponse.redirect(new URL("/", request.url));
}
