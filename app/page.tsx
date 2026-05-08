import { HomeLanding } from "@/components/home/HomeLanding";
import { FixedAmbientBackground } from "@/components/visual/FixedAmbientBackground";
import { isTesterUiEnabled } from "@/lib/features/tester-access";
import { AMBIENT_IMAGES } from "@/lib/media/ambient";

export default function Home() {
  const showTesterLogin = isTesterUiEnabled();

  return (
    <>
      <FixedAmbientBackground
        src={AMBIENT_IMAGES.homeHero}
        preset="hero"
        priority
        objectPosition="center 42%"
      />
      <HomeLanding showTesterLogin={showTesterLogin} />
    </>
  );
}
