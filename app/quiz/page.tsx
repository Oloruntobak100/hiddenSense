import Link from "next/link";
import { QuizFlow } from "@/components/quiz/QuizFlow";
import { FixedAmbientBackground } from "@/components/visual/FixedAmbientBackground";
import { AMBIENT_IMAGES } from "@/lib/media/ambient";

export const dynamic = "force-dynamic";

export default function QuizPage() {
  return (
    <>
      <FixedAmbientBackground
        src={AMBIENT_IMAGES.quizFresh}
        preset="quiz"
        objectPosition="center 45%"
        imageClassName="motion-safe:blur-[0.5px] motion-reduce:blur-none brightness-[0.92]"
      />
      <div className="relative z-10 min-h-[100dvh]">
        <div className="absolute left-0 right-0 top-0 z-10 flex justify-between px-5 py-6 text-xs text-[var(--hs-muted)] sm:px-8">
          <Link href="/" className="font-medium text-white/70 hover:text-white">
            HiddenSense™
          </Link>
        </div>
        <QuizFlow />
      </div>
    </>
  );
}
