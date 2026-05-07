import type { AnswerLetter, QuizAnswers } from "@/lib/mood/types";

export interface QuizOption {
  letter: AnswerLetter;
  /** Decorative mood cue; paired with labels for accessibility. */
  emoji: string;
  label: string;
  sublabel: string;
}

export interface QuizQuestion {
  id: keyof QuizAnswers;
  prompt: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "How’s your energy right now?",
    options: [
      { letter: "A", emoji: "😮‍💨", label: "Low", sublabel: "Drained" },
      { letter: "B", emoji: "😌", label: "Calm", sublabel: "Steady" },
      { letter: "C", emoji: "⚡", label: "High", sublabel: "Energized" },
    ],
  },
  {
    id: "q2",
    prompt: "What best describes your mood?",
    options: [
      { letter: "A", emoji: "😊", label: "Light", sublabel: "Happy" },
      { letter: "B", emoji: "🙂", label: "Neutral", sublabel: "Balanced" },
      { letter: "C", emoji: "😣", label: "Heavy", sublabel: "Overwhelmed" },
    ],
  },
  {
    id: "q3",
    prompt: "What are you in the mood for?",
    options: [
      { letter: "A", emoji: "👥", label: "People", sublabel: "Be around people" },
      { letter: "B", emoji: "🤝", label: "Selective", sublabel: "Small circle" },
      { letter: "C", emoji: "🧘", label: "Solo", sublabel: "Be alone" },
    ],
  },
  {
    id: "q4",
    prompt: "Your mind feels…",
    options: [
      { letter: "A", emoji: "🎯", label: "Clear", sublabel: "Focused" },
      { letter: "B", emoji: "💭", label: "Busy", sublabel: "Racing" },
      { letter: "C", emoji: "😶‍🌫️", label: "Foggy", sublabel: "Tired" },
    ],
  },
  {
    id: "q5",
    prompt: "Right now you want to…",
    options: [
      { letter: "A", emoji: "🥳", label: "Go out", sublabel: "Celebrate" },
      { letter: "B", emoji: "🛋️", label: "Relax", sublabel: "Unwind" },
      { letter: "C", emoji: "🌿", label: "Reset", sublabel: "Disconnect" },
    ],
  },
];
