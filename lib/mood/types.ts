export type AnswerLetter = "A" | "B" | "C";

export type EnergyLevel = "High" | "Medium" | "Low";
export type EmotionLevel = "Positive" | "Neutral" | "Negative";
export type SocialLevel = "Social" | "Selective" | "Alone";
export type MentalLevel = "Clear" | "Anxious" | "Fatigued";
export type IntentLevel = "Celebrate" | "Relax" | "Escape";

export interface AttributeProfile {
  energy: EnergyLevel;
  emotion: EmotionLevel;
  social: SocialLevel;
  mental: MentalLevel;
  intent: IntentLevel;
}

export interface QuizAnswers {
  q1: AnswerLetter;
  q2: AnswerLetter;
  q3: AnswerLetter;
  q4: AnswerLetter;
  q5: AnswerLetter;
}

export interface MoodDefinition {
  key: string;
  name: string;
  pattern: AttributeProfile;
}

export interface MoodEngineResult {
  mood_key: string;
  mood_name: string;
  confidence_score: number;
  user_answers: QuizAnswers;
  attribute_profile: AttributeProfile;
}
