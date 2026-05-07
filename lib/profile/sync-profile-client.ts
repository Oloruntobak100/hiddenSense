/** Calls `/api/profile/ensure` with the Supabase access token (cookie-independent). */
export async function syncProfileWithAccessToken(
  accessToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/profile/ensure", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string };

  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? "Could not save your profile.",
    };
  }

  return { ok: true };
}
