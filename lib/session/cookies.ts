import "server-only";
import { cookies } from "next/headers";
import { PROFILE_COOKIE } from "@/lib/session/constants";
import { isUuid } from "@/lib/session/uuid";

export async function getProfileIdFromCookies(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(PROFILE_COOKIE)?.value;
  if (!raw || !isUuid(raw)) return null;
  return raw;
}

const cookieOpts = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function clearProfileCookie() {
  const jar = await cookies();
  jar.delete(PROFILE_COOKIE);
}

export async function setProfileCookie(profileId: string) {
  const jar = await cookies();
  jar.set(PROFILE_COOKIE, profileId, {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 30,
  });
}
