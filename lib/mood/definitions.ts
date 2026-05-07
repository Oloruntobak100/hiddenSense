import type { MoodDefinition } from "@/lib/mood/types";

export const MOODS: MoodDefinition[] = [
  {
    key: "lets_make_a_scene",
    name: "Let’s Make a Scene",
    pattern: {
      energy: "High",
      emotion: "Positive",
      social: "Social",
      mental: "Clear",
      intent: "Celebrate",
    },
  },
  {
    key: "ready_to_be_kissed",
    name: "Ready to be Kissed",
    pattern: {
      energy: "Medium",
      emotion: "Positive",
      social: "Selective",
      mental: "Clear",
      intent: "Relax",
    },
  },
  {
    key: "handle_with_care",
    name: "Handle with Care",
    pattern: {
      energy: "Low",
      emotion: "Negative",
      social: "Selective",
      mental: "Anxious",
      intent: "Relax",
    },
  },
  {
    key: "nope_not_today",
    name: "Nope, Not Today",
    pattern: {
      energy: "High",
      emotion: "Negative",
      social: "Alone",
      mental: "Anxious",
      intent: "Escape",
    },
  },
  {
    key: "missing_my_boo",
    name: "Missing My Boo",
    pattern: {
      energy: "Low",
      emotion: "Neutral",
      social: "Alone",
      mental: "Clear",
      intent: "Relax",
    },
  },
  {
    key: "they_not_like_us",
    name: "They Not Like Us",
    pattern: {
      energy: "High",
      emotion: "Positive",
      social: "Social",
      mental: "Clear",
      intent: "Celebrate",
    },
  },
  {
    key: "soft_life_loading",
    name: "Soft Life Loading",
    pattern: {
      energy: "Low",
      emotion: "Neutral",
      social: "Alone",
      mental: "Fatigued",
      intent: "Escape",
    },
  },
  {
    key: "good_vibes_only",
    name: "Good Vibes Only",
    pattern: {
      energy: "Medium",
      emotion: "Positive",
      social: "Social",
      mental: "Clear",
      intent: "Relax",
    },
  },
  {
    key: "ready_to_turnup",
    name: "Ready to TurnUp",
    pattern: {
      energy: "High",
      emotion: "Neutral",
      social: "Social",
      mental: "Anxious",
      intent: "Celebrate",
    },
  },
  {
    key: "protecting_my_peace",
    name: "Protecting My Peace",
    pattern: {
      energy: "Low",
      emotion: "Neutral",
      social: "Selective",
      mental: "Clear",
      intent: "Escape",
    },
  },
];
