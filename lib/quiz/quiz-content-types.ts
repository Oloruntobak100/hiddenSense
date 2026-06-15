export type QuizSectionId = "energy" | "social" | "flavor" | "taste";

export type MoodQuestionRole = "energy" | "emotion" | "mental" | "social" | "intent";

export type MoodQuestionConfig = {
  id: string;
  section: QuizSectionId;
  role: MoodQuestionRole;
  prompt: string;
  left: string;
  right: string;
  active: boolean;
  sortOrder: number;
};

export type TasteQuestionConfig = {
  id: string;
  section: "taste";
  prompt: string;
  options: Array<{ key: "A" | "B" | "C"; text: string }>;
  active: boolean;
  sortOrder: number;
};

export type QuizSectionMeta = {
  title: string;
  subtitle: string;
};

export type QuizContentConfig = {
  sections: Record<QuizSectionId, QuizSectionMeta>;
  moodQuestions: MoodQuestionConfig[];
  tasteQuestions: TasteQuestionConfig[];
};

export type MoodQuestionView = MoodQuestionConfig & { kind: "mood" };
export type TasteQuestionView = TasteQuestionConfig & { kind: "taste" };
export type QuizQuestionView = MoodQuestionView | TasteQuestionView;

export function buildQuestionList(config: QuizContentConfig): QuizQuestionView[] {
  const mood = config.moodQuestions
    .filter((q) => q.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((q) => ({ ...q, kind: "mood" as const }));
  const taste = config.tasteQuestions
    .filter((q) => q.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((q) => ({ ...q, kind: "taste" as const }));
  return [...mood, ...taste];
}
