import { PostLoginIntro } from "@/components/intro/PostLoginIntro";
import { getPostLoginIntroProps } from "@/lib/intro/post-login-props";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const props = await getPostLoginIntroProps();
  return <PostLoginIntro {...props} />;
}
