import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth/current-profile";
import { HomeLanding } from "@/components/home/HomeLanding";
import { isTesterUiEnabled } from "@/lib/features/tester-access";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (await getAuthUserId()) {
    redirect("/dashboard");
  }

  const showTesterLogin = isTesterUiEnabled();
  return <HomeLanding showTesterLogin={showTesterLogin} />;
}
