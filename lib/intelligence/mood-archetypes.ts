export type MoodArchetype = {
  key: string;
  name: string;
  emotional_description: string;
  energy_level: "low" | "mid" | "high";
  flavor_profile: string;
  social_tendency: string;
  atmosphere: string;
  cocktail_style: string;
  food_pairing_style: string;
  color_palette: string[];
  target: {
    energy_score: number;
    emotional_weight: number;
    social_score: number;
    mental_clarity: number;
    behavioral_intent: number;
    flavor_preference: number;
    atmosphere_preference: number;
  };
};

export const MOOD_ARCHETYPES: MoodArchetype[] = [
  {
    key: "lets_make_a_scene",
    name: "Let’s Make a Scene",
    emotional_description: "You want the room to feel alive. Tonight rewards bold flavor and social sparkle.",
    energy_level: "high",
    flavor_profile: "citrus-bright",
    social_tendency: "outward",
    atmosphere: "crowded-luxe",
    cocktail_style: "sparkling-citrus",
    food_pairing_style: "spiced seafood",
    color_palette: ["#2563eb", "#7c3aed", "#f59e0b"],
    target: { energy_score: 2, emotional_weight: 1, social_score: 2, mental_clarity: 1, behavioral_intent: 2, flavor_preference: 1, atmosphere_preference: 2 },
  },
  {
    key: "ready_to_be_kissed",
    name: "Ready to be Kissed",
    emotional_description: "Soft confidence with playful curiosity. You want romance without losing your edge.",
    energy_level: "mid",
    flavor_profile: "fruity-floral",
    social_tendency: "selective",
    atmosphere: "intimate-neon",
    cocktail_style: "fragrant-spritz",
    food_pairing_style: "creamy-light",
    color_palette: ["#ec4899", "#8b5cf6", "#fb7185"],
    target: { energy_score: 1, emotional_weight: 2, social_score: 1, mental_clarity: 1, behavioral_intent: 1, flavor_preference: 1, atmosphere_preference: 1 },
  },
  {
    key: "handle_with_care",
    name: "Handle with Care",
    emotional_description: "You are processing quietly. Comfort with composure is the right move tonight.",
    energy_level: "low",
    flavor_profile: "warm-herbal",
    social_tendency: "low",
    atmosphere: "quiet-corner",
    cocktail_style: "velvety-low-heat",
    food_pairing_style: "comfort-umami",
    color_palette: ["#7c3aed", "#475569", "#f97316"],
    target: { energy_score: -1, emotional_weight: -2, social_score: -1, mental_clarity: -1, behavioral_intent: -1, flavor_preference: -1, atmosphere_preference: -2 },
  },
  {
    key: "nope_not_today",
    name: "Nope, Not Today",
    emotional_description: "Boundaries first. You need catharsis, not conversation.",
    energy_level: "mid",
    flavor_profile: "bitter-smoky",
    social_tendency: "alone",
    atmosphere: "dim-private",
    cocktail_style: "stirred-bitter",
    food_pairing_style: "charred-savory",
    color_palette: ["#0f172a", "#7c2d12", "#334155"],
    target: { energy_score: 0, emotional_weight: -2, social_score: -2, mental_clarity: -1, behavioral_intent: -2, flavor_preference: -2, atmosphere_preference: -2 },
  },
  {
    key: "missing_my_boo",
    name: "Missing My Boo",
    emotional_description: "Nostalgia and tenderness are steering tonight. You need warmth with softness.",
    energy_level: "low",
    flavor_profile: "sweet-rounded",
    social_tendency: "low",
    atmosphere: "candlelight",
    cocktail_style: "old-fashioned-velvet",
    food_pairing_style: "buttery-comfort",
    color_palette: ["#9333ea", "#f59e0b", "#6366f1"],
    target: { energy_score: -1, emotional_weight: -1, social_score: -2, mental_clarity: 0, behavioral_intent: -1, flavor_preference: -1, atmosphere_preference: -1 },
  },
  {
    key: "they_not_like_us",
    name: "They Not Like Us",
    emotional_description: "Main-character confidence. You want premium energy and precision.",
    energy_level: "high",
    flavor_profile: "clean-bold",
    social_tendency: "social",
    atmosphere: "vip-velocity",
    cocktail_style: "crisp-signature",
    food_pairing_style: "elevated-spice",
    color_palette: ["#2563eb", "#22d3ee", "#a855f7"],
    target: { energy_score: 2, emotional_weight: 1, social_score: 2, mental_clarity: 2, behavioral_intent: 1, flavor_preference: 1, atmosphere_preference: 2 },
  },
  {
    key: "soft_life_loading",
    name: "Soft Life Loading",
    emotional_description: "You need ease, not intensity. This is the slow exhale era.",
    energy_level: "low",
    flavor_profile: "silky-mellow",
    social_tendency: "alone",
    atmosphere: "plush-quiet",
    cocktail_style: "lavender-creamy",
    food_pairing_style: "brothy-comfort",
    color_palette: ["#7c3aed", "#a78bfa", "#334155"],
    target: { energy_score: -2, emotional_weight: -1, social_score: -2, mental_clarity: -2, behavioral_intent: -2, flavor_preference: -1, atmosphere_preference: -2 },
  },
  {
    key: "good_vibes_only",
    name: "Good Vibes Only",
    emotional_description: "You want bright, clean joy with no emotional clutter.",
    energy_level: "mid",
    flavor_profile: "fresh-fruity",
    social_tendency: "social",
    atmosphere: "sunset-lounge",
    cocktail_style: "spritz-highball",
    food_pairing_style: "light-fresh",
    color_palette: ["#06b6d4", "#22c55e", "#8b5cf6"],
    target: { energy_score: 1, emotional_weight: 2, social_score: 1, mental_clarity: 1, behavioral_intent: 1, flavor_preference: 2, atmosphere_preference: 1 },
  },
  {
    key: "ready_to_turnup",
    name: "Ready to TurnUp",
    emotional_description: "Tonight is momentum. You’re primed for loud joy and high tempo.",
    energy_level: "high",
    flavor_profile: "zesty-electric",
    social_tendency: "social",
    atmosphere: "neon-night",
    cocktail_style: "mint-citrus-fizz",
    food_pairing_style: "spicy-crunch",
    color_palette: ["#22d3ee", "#2563eb", "#f43f5e"],
    target: { energy_score: 2, emotional_weight: 0, social_score: 2, mental_clarity: 0, behavioral_intent: 2, flavor_preference: 2, atmosphere_preference: 2 },
  },
  {
    key: "protecting_my_peace",
    name: "Protecting My Peace",
    emotional_description: "You are intentional and selective. Calm clarity is the flex tonight.",
    energy_level: "low",
    flavor_profile: "botanical-clean",
    social_tendency: "selective",
    atmosphere: "minimal-glow",
    cocktail_style: "floral-cooler",
    food_pairing_style: "clean-crisp",
    color_palette: ["#334155", "#0ea5e9", "#a855f7"],
    target: { energy_score: -1, emotional_weight: 1, social_score: -1, mental_clarity: 2, behavioral_intent: -1, flavor_preference: 1, atmosphere_preference: -1 },
  },
];
