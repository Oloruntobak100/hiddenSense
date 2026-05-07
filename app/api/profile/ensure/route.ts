import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { upsertProfileFromAuthUser } from "@/lib/profile/sync-from-user";

/**
 * Syncs `profiles` using the caller's access token (Authorization: Bearer …).
 * Avoids relying on cookies being visible to Server Actions immediately after OTP sign-in.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const jwt =
    authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;

  if (!jwt) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  try {
    const env = getServerEnv();
    const authClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    const {
      data: { user },
      error,
    } = await authClient.auth.getUser(jwt);

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 },
      );
    }

    const result = await upsertProfileFromAuthUser(user);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/profile/ensure]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
