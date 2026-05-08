import { QuizFlow } from "@/components/quiz/QuizFlow";

export const dynamic = "force-dynamic";

export default function QuizPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[linear-gradient(162deg,#09080f_6%,#161022_42%,#1a1217_72%,#0c0a13_100%)] pb-[env(safe-area-inset-bottom)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_10%_8%,rgba(124,58,237,0.26),transparent_52%),radial-gradient(90%_90%_at_92%_30%,rgba(217,119,6,0.15),transparent_50%),radial-gradient(90%_90%_at_50%_100%,rgba(37,99,235,0.14),transparent_48%)]"
      />
      <QuizFlow />
    </div>
  );
}
