import "server-only";

import { isAdminEmail } from "@/lib/auth/admin";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { getServerAuthUser } from "@/lib/auth/server-user";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PostLoginIntroProps = {
  displayName: string;
  isAdmin: boolean;
};

export async function getPostLoginIntroProps(): Promise<PostLoginIntroProps> {
  let displayName = "there";

  const user = await getServerAuthUser();
  const isAdmin = isAdminEmail(user?.email);

  const profileId = await getCurrentProfileId();
  if (profileId) {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("profiles")
      .select("first_name, email")
      .eq("id", profileId)
      .maybeSingle();

    const firstName = data?.first_name?.trim();
    if (firstName) {
      displayName = firstName;
    } else if (data?.email) {
      displayName = data.email.split("@")[0] ?? "there";
    }
  }

  return { displayName, isAdmin };
}
