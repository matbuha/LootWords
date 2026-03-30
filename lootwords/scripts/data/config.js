export const APP_NAME = "LootWords";
export const STORAGE_KEY = "lootwords-profile";
export const STORAGE_VERSION = 1;

export const ROUTES = {
  home: "home",
  play: "play",
  reward: "reward",
  collection: "collection",
  learn: "learn",
};

export const DEFAULT_ROUTE = {
  path: ROUTES.home,
  game: "memory-match",
};

export const CATEGORY_META = {
  animals: { label: "Animals", accent: "#ff9f6e" },
  food: { label: "Food", accent: "#ffcf66" },
  vehicles: { label: "Vehicles", accent: "#56d2ff" },
  "home-objects": { label: "Home Objects", accent: "#90f2c8" },
  clothes: { label: "Clothes", accent: "#ff92c7" },
  nature: { label: "Nature", accent: "#6fe68e" },
  toys: { label: "Toys", accent: "#ff8f5e" },
  "school-objects": { label: "School Objects", accent: "#9bb3ff" },
  "kitchen-objects": { label: "Kitchen Objects", accent: "#ffd07e" },
  fantasy: { label: "Fantasy", accent: "#f5a4ff" },
};

export const RARITY_ORDER = [
  "common",
  "rare",
  "super-rare",
  "epic",
  "legendary",
];

export const RARITY_META = {
  common: { label: "Common", range: "1-200" },
  rare: { label: "Rare", range: "201-400" },
  "super-rare": { label: "Super Rare", range: "401-600" },
  epic: { label: "Epic", range: "601-800" },
  legendary: { label: "Legendary", range: "801-1000" },
};

export const COLLECTION_SORTS = {
  "points-desc": "Points high to low",
  "points-asc": "Points low to high",
  alphabetical: "Alphabetical",
  newest: "Newest first",
};

export const DEFAULT_COLLECTION_FILTERS = {
  category: "all",
  rarity: "all",
  sort: "points-desc",
};

export const BOX_TAP_COUNT = 3;
export const FALLBACK_STARS = 50;

export const GAME_CONFIG = {
  "memory-match": {
    id: "memory-match",
    label: "Memory Match",
    shortLabel: "Memory",
    description: "Flip treasure tiles and find every matching pair before the timer runs out.",
    rewardText: "Win one reward box",
  },
  "picture-match": {
    id: "picture-match",
    label: "Treasure Match",
    shortLabel: "Match",
    description: "Spot the target card from the choices before you run out of hearts.",
    rewardText: "Win one reward box",
  },
};

export const AUDIO_CUES = {
  click: "click",
  boxTap: "boxTap",
  boxOpen: "boxOpen",
  rewardReveal: "rewardReveal",
  victory: "victory",
};
