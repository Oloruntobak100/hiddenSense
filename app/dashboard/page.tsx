import { PostLoginIntro } from "@/components/intro/PostLoginIntro";
import { listMyResults } from "@/lib/data/my-results";
import { getPostLoginIntroProps } from "@/lib/intro/post-login-props";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [props, myResults] = await Promise.all([getPostLoginIntroProps(), listMyResults()]);
  return <PostLoginIntro {...props} myResults={myResults} />;
}
