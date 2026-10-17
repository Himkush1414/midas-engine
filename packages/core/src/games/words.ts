/**
 * Language-independent word content for the Language games. Trials refer to
 * concept ids; each app language supplies the words, so every player sees the
 * same puzzles (in their own language) and the server verifies runs without
 * knowing the language.
 *
 * Every concept belongs to exactly one category, and concepts were chosen to
 * stay unambiguous in every supported language: no words that also name
 * something in another category in any of them (palm, kiwi, bass, orange;
 * Spanish mono, German Strauß and Käfer, Italian vespa and cedro, Brazilian tênis…).
 */
export const WORD_CATEGORIES = {
  mammals: ['dog', 'cat', 'horse', 'cow', 'lion', 'tiger', 'elephant', 'rabbit', 'bear', 'wolf', 'gorilla', 'giraffe', 'zebra', 'sheep'],
  birds: ['eagle', 'owl', 'parrot', 'pigeon', 'swan', 'duck', 'sparrow', 'crow', 'penguin', 'flamingo', 'stork', 'peacock'],
  fish: ['shark', 'salmon', 'trout', 'tuna', 'cod', 'carp', 'herring', 'sardine', 'pike', 'goldfish'],
  insects: ['bee', 'ant', 'butterfly', 'mosquito', 'cockroach', 'flea', 'grasshopper', 'ladybug', 'dragonfly', 'moth'],
  fruit: ['apple', 'banana', 'pear', 'cherry', 'grape', 'strawberry', 'lemon', 'peach', 'plum', 'pineapple', 'watermelon'],
  vegetables: ['carrot', 'potato', 'onion', 'cabbage', 'lettuce', 'cucumber', 'spinach', 'broccoli', 'leek', 'cauliflower', 'radish'],
  drinks: ['coffee', 'tea', 'milk', 'juice', 'water', 'lemonade', 'hot-chocolate', 'milkshake'],
  furniture: ['chair', 'table', 'sofa', 'bed', 'wardrobe', 'bookshelf', 'desk', 'armchair', 'stool'],
  kitchenware: ['spoon', 'fork', 'plate', 'cup', 'bowl', 'frying-pan', 'saucepan', 'kettle', 'ladle'],
  tools: ['hammer', 'saw', 'screwdriver', 'drill', 'wrench', 'pliers', 'shovel', 'axe', 'rake'],
  clothing: ['shirt', 'trousers', 'skirt', 'dress', 'jacket', 'coat', 'sock', 'scarf', 'glove', 'sweater'],
  weather: ['rain', 'snow', 'wind', 'fog', 'storm', 'hail', 'thunder', 'frost'],
  flowers: ['rose', 'tulip', 'hyacinth', 'sunflower', 'lily', 'orchid', 'poppy', 'dandelion'],
  trees: ['oak', 'birch', 'maple', 'willow', 'beech', 'fir', 'elm', 'poplar'],
  sports: ['football', 'handball', 'basketball', 'swimming', 'hockey', 'volleyball', 'boxing', 'skiing', 'rugby', 'judo'],
  instruments: ['piano', 'guitar', 'violin', 'drum', 'flute', 'trumpet', 'harp', 'cello', 'saxophone', 'clarinet'],
  vehicles: ['car', 'bus', 'train', 'bicycle', 'truck', 'motorcycle', 'tram', 'tractor', 'helicopter', 'airplane'],
  body: ['arm', 'leg', 'hand', 'foot', 'head', 'nose', 'ear', 'eye', 'knee', 'elbow', 'shoulder', 'finger'],
} as const;

export type WordCategory = keyof typeof WORD_CATEGORIES;
export type WordId = (typeof WORD_CATEGORIES)[WordCategory][number];

export const WORD_CATEGORY_IDS = Object.keys(WORD_CATEGORIES) as WordCategory[];

/** Related categories: a word from a sibling is the hardest lure. */
export const WORD_GROUPS: Record<string, readonly WordCategory[]> = {
  animals: ['mammals', 'birds', 'fish', 'insects'],
  food: ['fruit', 'vegetables', 'drinks'],
  home: ['furniture', 'kitchenware', 'tools', 'clothing'],
  nature: ['weather', 'flowers', 'trees'],
  leisure: ['sports', 'instruments'],
  transport: ['vehicles'],
  body: ['body'],
};

const GROUP_OF = new Map<WordCategory, string>(
  Object.entries(WORD_GROUPS).flatMap(([group, cats]) => cats.map((c) => [c, group] as const)),
);

export function groupOf(category: WordCategory): string {
  return GROUP_OF.get(category) as string;
}

export function siblingsOf(category: WordCategory): WordCategory[] {
  return (WORD_GROUPS[groupOf(category)] ?? []).filter((c) => c !== category);
}

export function distantCategories(category: WordCategory): WordCategory[] {
  const group = groupOf(category);
  return WORD_CATEGORY_IDS.filter((c) => groupOf(c) !== group);
}

const CATEGORY_OF = new Map<WordId, WordCategory>(
  WORD_CATEGORY_IDS.flatMap((c) => (WORD_CATEGORIES[c] as readonly WordId[]).map((w) => [w, c] as const)),
);

export function categoryOf(word: WordId): WordCategory {
  return CATEGORY_OF.get(word) as WordCategory;
}

export const ALL_WORD_IDS = [...CATEGORY_OF.keys()];
