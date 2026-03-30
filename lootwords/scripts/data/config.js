import {
  CATEGORY_META,
  CATEGORY_ORDER,
  DIFFICULTY_META,
  LEGACY_CATEGORY_ALIASES,
  PACK_META,
  PACK_ORDER,
} from "./categories.js";

export const APP_NAME = "LootWords";
export const STORAGE_KEY = "lootwords-profile";
export const STORAGE_VERSION = 2;

export { CATEGORY_META, CATEGORY_ORDER, DIFFICULTY_META, LEGACY_CATEGORY_ALIASES, PACK_META, PACK_ORDER };

export const ROUTES = {
  home: "home",
  play: "play",
  reward: "reward",
  collection: "collection",
  learn: "learn",
};

export const ROUTE_SEQUENCE = [
  ROUTES.home,
  ROUTES.play,
  ROUTES.reward,
  ROUTES.collection,
  ROUTES.learn,
];

export const DEFAULT_ROUTE = {
  path: ROUTES.home,
  game: "memory-match",
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
  newest: "Newest unlocks",
  "points-desc": "Highest points",
  "points-asc": "Lowest points",
  alphabetical: "A to Z",
  rarity: "Rarity first",
  category: "Category order",
  difficulty: "Easy to hard",
};

export const DEFAULT_COLLECTION_FILTERS = {
  category: "all",
  rarity: "all",
  sort: "newest",
};

export const LEARN_SORTS = {
  newest: "Fresh pulls",
  "points-desc": "Strongest cards",
  "points-asc": "Lower-point cards",
  alphabetical: "A to Z",
  category: "Category walk",
  difficulty: "Easy to hard",
};

export const DEFAULT_LEARN_FILTERS = {
  category: "all",
  sort: "newest",
};

export const BOX_TAP_COUNT = 3;
export const FALLBACK_STARS = 50;
export const REWARD_REVEAL_DELAY_MS = 780;
export const RECENT_CARD_LIMIT = 4;

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

export const AUDIO_TRACKS = {
  home: null,
};

export const AUDIO_ASSET_PATHS = {
  click: null,
  boxTap: null,
  boxOpen: null,
  rewardReveal: null,
  victory: null,
  home: null,
};
