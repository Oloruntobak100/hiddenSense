export interface Recommendation {
  moodKey: string;
  cocktailName: string;
  foodName: string;
  pairingLine: string;
  cocktailImage: string;
  foodImage: string;
  recipe: {
    title: string;
    ingredients: string[];
    steps: string[];
  };
}

const img = (seed: string, kind: "c" | "f") =>
  `https://picsum.photos/seed/hiddensense-${kind}-${seed}/900/900`;

export const RECOMMENDATIONS: Record<string, Recommendation> = {
  lets_make_a_scene: {
    moodKey: "lets_make_a_scene",
    cocktailName: "Hidden Spirits Electric Margarita",
    foodName: "Citrus tuna crudo",
    pairingLine: "Bright, sharp, celebratory.",
    cocktailImage: img("scene", "c"),
    foodImage: img("scene", "f"),
    recipe: {
      title: "Electric Margarita (demo)",
      ingredients: [
        "2 oz Hidden Spirits citrus-forward base",
        "1 oz lime",
        "½ oz agave",
        "Salt rim",
      ],
      steps: ["Shake with ice.", "Strain over fresh ice.", "Garnish with lime wheel."],
    },
  },
  ready_to_be_kissed: {
    moodKey: "ready_to_be_kissed",
    cocktailName: "Hidden Spirits Berry Kiss Spritz",
    foodName: "Strawberry burrata with basil",
    pairingLine: "Soft, flirtatious, and lush.",
    cocktailImage: img("kiss", "c"),
    foodImage: img("kiss", "f"),
    recipe: {
      title: "Berry Kiss Spritz (demo)",
      ingredients: ["2 oz berry spirit base", "2 oz bubbly", "Lemon peel"],
      steps: ["Build in wine glass.", "Stir gently.", "Express lemon oil."],
    },
  },
  handle_with_care: {
    moodKey: "handle_with_care",
    cocktailName: "Hidden Spirits Herbal Calm Toddy",
    foodName: "Roasted veggie grain bowl",
    pairingLine: "Warm, grounding, easy on the nerves.",
    cocktailImage: img("care", "c"),
    foodImage: img("care", "f"),
    recipe: {
      title: "Herbal Calm Toddy (demo)",
      ingredients: ["2 oz slow botanical spirit", "Hot water", "Honey", "Lemon"],
      steps: ["Heat vessel.", "Combine ingredients.", "Sip slowly."],
    },
  },
  nope_not_today: {
    moodKey: "nope_not_today",
    cocktailName: "Hidden Spirits Smoky Bitter Edge",
    foodName: "Charred poblano sliders",
    pairingLine: "Bold, bittersweet catharsis.",
    cocktailImage: img("nope", "c"),
    foodImage: img("nope", "f"),
    recipe: {
      title: "Smoky Bitter Edge (demo)",
      ingredients: ["2 oz smoky base", "Amaro rinse", "Orange twist"],
      steps: ["Stir with ice.", "Strain up.", "Garnish."],
    },
  },
  missing_my_boo: {
    moodKey: "missing_my_boo",
    cocktailName: "Hidden Spirits Velvet Old Fashioned",
    foodName: "Truffle parmesan fries",
    pairingLine: "Comforting nostalgia, slow sipping.",
    cocktailImage: img("boo", "c"),
    foodImage: img("boo", "f"),
    recipe: {
      title: "Velvet Old Fashioned (demo)",
      ingredients: ["2 oz bourbon-style base", "Sugar cube", "Bitters"],
      steps: ["Muddle bitters and sugar.", "Add spirit and ice.", "Stir."],
    },
  },
  they_not_like_us: {
    moodKey: "they_not_like_us",
    cocktailName: "Hidden Spirits Crown Citrus Punch",
    foodName: "Spicy lobster roll",
    pairingLine: "Confidence in a glass—loud citrus, clean finish.",
    cocktailImage: img("they", "c"),
    foodImage: img("they", "f"),
    recipe: {
      title: "Crown Citrus Punch (demo)",
      ingredients: ["2 oz citrus reserve", "Fizz topper", "Grapefruit wheel"],
      steps: ["Build over ice.", "Top with bubbles.", "Serve tall."],
    },
  },
  soft_life_loading: {
    moodKey: "soft_life_loading",
    cocktailName: "Hidden Spirits Lavender Fog",
    foodName: "Buttery miso ramen",
    pairingLine: "Low effort, restorative comfort.",
    cocktailImage: img("soft", "c"),
    foodImage: img("soft", "f"),
    recipe: {
      title: "Lavender Fog (demo)",
      ingredients: ["2 oz mellow base", "Oat foam", "Lavender tincture (light)"],
      steps: ["Dry shake softly.", "Wet shake.", "Strain wide."],
    },
  },
  good_vibes_only: {
    moodKey: "good_vibes_only",
    cocktailName: "Hidden Spirits Sunshine Spritz",
    foodName: "Mango quinoa salad",
    pairingLine: "Easy brightness—no drama.",
    cocktailImage: img("good", "c"),
    foodImage: img("good", "f"),
    recipe: {
      title: "Sunshine Spritz (demo)",
      ingredients: ["2 oz tropical botanical", "Soda", "Mint"],
      steps: ["Build.", "Stir once.", "Garnish with mint."],
    },
  },
  ready_to_turnup: {
    moodKey: "ready_to_turnup",
    cocktailName: "Hidden Spirits Neon Mojito Remix",
    foodName: "Jalapeño watermelon skewers",
    pairingLine: "High tempo, tangy, restless fun.",
    cocktailImage: img("turnup", "c"),
    foodImage: img("turnup", "f"),
    recipe: {
      title: "Neon Mojito Remix (demo)",
      ingredients: ["2 oz cane spirit blend", "Mint", "Lime", "Soda"],
      steps: ["Muddle lightly.", "Build over crushed ice.", "Top with bubbles."],
    },
  },
  protecting_my_peace: {
    moodKey: "protecting_my_peace",
    cocktailName: "Hidden Spirits Ritual Jasmine Cooler",
    foodName: "Chilled cucumber soup",
    pairingLine: "Clean boundaries, serene finish.",
    cocktailImage: img("peace", "c"),
    foodImage: img("peace", "f"),
    recipe: {
      title: "Ritual Jasmine Cooler (demo)",
      ingredients: ["2 oz floral low-proof base", "Cucumber", "Elderflower (touch)"],
      steps: ["Roll ingredients gently.", "Strain neat over ice sphere."],
    },
  },
};

export function getRecommendation(moodKey: string): Recommendation {
  return (
    RECOMMENDATIONS[moodKey] ??
    RECOMMENDATIONS.protecting_my_peace
  );
}
