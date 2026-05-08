import { HomeLanding } from "@/components/home/HomeLanding";
import { isTesterUiEnabled } from "@/lib/features/tester-access";

export default function Home() {
  const showTesterLogin = isTesterUiEnabled();

  return <HomeLanding showTesterLogin={showTesterLogin} />;
}
