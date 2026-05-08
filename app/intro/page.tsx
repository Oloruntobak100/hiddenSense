import { PostLoginIntro } from "@/components/intro/PostLoginIntro";
import { isAdminEmail } from "@/lib/auth/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function IntroPage() {
  let displayName = "there";
  let admin = false;

  const profileId = await getCurrentProfileId();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  admin = isAdminEmail(user?.email);

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

  return <PostLoginIntro displayName={displayName} isAdmin={admin} />;
}
