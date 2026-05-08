export type QuestionCategory =
  | "energy_score"
  | "emotional_weight"
  | "social_score"
  | "mental_clarity"
  | "behavioral_intent"
  | "flavor_preference"
  | "atmosphere_preference";

export type QuestionDefinition = {
  id: string;
  section: "energyEmotion" | "socialIntent" | "sensoryFlavor";
  question: string;
  left_anchor: string;
  right_anchor: string;
  category: QuestionCategory;
  scoring_map: {
    farLeft: -2;
    midLeft: -1;
    center: 0;
    midRight: 1;
    farRight: 2;
  };
};

export const QUESTION_MODEL: QuestionDefinition[] = [
  {
    id: "m1",
    section: "energyEmotion",
    question: "What’s your pace tonight?",
    left_anchor: "Quiet Reset",
    right_anchor: "Full Energy",
    category: "energy_score",
    scoring_map: { farLeft: -2, midLeft: -1, center: 0, midRight: 1, farRight: 2 },
  },
  {
    id: "m2",
    section: "energyEmotion",
    question: "What’s sitting with you right now?",
    left_anchor: "Pressure",
    right_anchor: "Lightness",
    category: "emotional_weight",
    scoring_map: { farLeft: -2, midLeft: -1, center: 0, midRight: 1, farRight: 2 },
  },
  {
    id: "m3",
    section: "energyEmotion",
    question: "How loud is your mind tonight?",
    left_anchor: "Heavy & Foggy",
    right_anchor: "Sharp & Clear",
    category: "mental_clarity",
    scoring_map: { farLeft: -2, midLeft: -1, center: 0, midRight: 1, farRight: 2 },
  },
  {
    id: "m4",
    section: "socialIntent",
    question: "How social does tonight feel?",
    left_anchor: "Keep to Myself",
    right_anchor: "Outside Energy",
    category: "social_score",
    scoring_map: { farLeft: -2, midLeft: -1, center: 0, midRight: 1, farRight: 2 },
  },
  {
    id: "m5",
    section: "socialIntent",
    question: "What do you need most tonight?",
    left_anchor: "Escape",
    right_anchor: "Experience",
    category: "behavioral_intent",
    scoring_map: { farLeft: -2, midLeft: -1, center: 0, midRight: 1, farRight: 2 },
  },
  {
    id: "m6",
    section: "sensoryFlavor",
    question: "What kind of experience sounds best?",
    left_anchor: "Deep & Smooth",
    right_anchor: "Crisp & Refreshing",
    category: "flavor_preference",
    scoring_map: { farLeft: -2, midLeft: -1, center: 0, midRight: 1, farRight: 2 },
  },
  {
    id: "m7",
    section: "sensoryFlavor",
    question: "Pick the atmosphere that feels closest.",
    left_anchor: "Candlelight & Quiet",
    right_anchor: "Neon Night Energy",
    category: "atmosphere_preference",
    scoring_map: { farLeft: -2, midLeft: -1, center: 0, midRight: 1, farRight: 2 },
  },
];
