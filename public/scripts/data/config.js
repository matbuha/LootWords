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
export const STORAGE_VERSION = 6;

export { CATEGORY_META, CATEGORY_ORDER, DIFFICULTY_META, LEGACY_CATEGORY_ALIASES, PACK_META, PACK_ORDER };

export const ROUTES = {
  home: "home",
  play: "play",
  reward: "reward",
  collection: "collection",
  learn: "learn",
  parent: "parent",
};

export const ROUTE_SEQUENCE = [
  ROUTES.home,
  ROUTES.play,
  ROUTES.reward,
  ROUTES.collection,
  ROUTES.learn,
  ROUTES.parent,
];

export const DEFAULT_ROUTE = {
  path: ROUTES.home,
  game: null,
  challenge: null,
};

export const DAILY_CHALLENGE_TIME_ZONE = "UTC";
export const DAILY_CHALLENGE_REWARD_BOXES = 1;
export const DAILY_CHALLENGE_GAME_IDS = [
  "memory-match",
  "picture-match",
  "flash-find",
  "tap-the-word",
  "repeat-after-me",
  "sequence-memory",
  "image-reveal",
];

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
export const REWARD_REVEAL_DELAY_MS = 1000;
export const RECENT_CARD_LIMIT = 4;

export const GAME_CONFIG = {
  "memory-match": {
    id: "memory-match",
    label: "Memory Match",
    shortLabel: "Memory",
    icon: "🧠",
    lengthLabel: "45 sec",
    energyLabel: "Calm focus",
    minimumCardPool: 6,
    usesCardPool: true,
    supportsLearningModes: ["pair-match", "visual-memory"],
    description: "Flip treasure tiles and find every matching pair before the timer runs out.",
    rewardText: "Win one reward box",
  },
  "picture-match": {
    id: "picture-match",
    label: "Treasure Match",
    shortLabel: "Match",
    icon: "🎯",
    lengthLabel: "35 sec",
    energyLabel: "Fast picks",
    minimumCardPool: 4,
    usesCardPool: true,
    supportsLearningModes: ["target-match", "image-recognition"],
    description: "Spot the target card from the choices before you run out of hearts.",
    rewardText: "Win one reward box",
  },
  "flash-find": {
    id: "flash-find",
    label: "Flash Find",
    shortLabel: "Flash",
    icon: "⚡",
    lengthLabel: "30 sec",
    energyLabel: "Quick memory",
    minimumCardPool: 6,
    usesCardPool: true,
    supportsLearningModes: ["flash-memory", "word-recall", "future-point-memory"],
    description: "Watch the target card, then tap the same loot card before the preview fades from memory.",
    rewardText: "Win one reward box",
  },
  "tap-the-word": {
    id: "tap-the-word",
    label: "Tap the Word",
    shortLabel: "Tap",
    icon: "🔊",
    lengthLabel: "40 sec",
    energyLabel: "Sound + image",
    minimumCardPool: 6,
    usesCardPool: true,
    supportsLearningModes: ["audio-match", "image-recognition", "word-listening"],
    description: "Hear the English word, then tap the matching card before the round moves on.",
    rewardText: "Win one reward box",
  },
  "repeat-after-me": {
    id: "repeat-after-me",
    label: "Repeat After Me",
    shortLabel: "Repeat",
    icon: "🗣️",
    lengthLabel: "Calm 5 rounds",
    energyLabel: "Listen + speak",
    minimumCardPool: 5,
    usesCardPool: true,
    supportsLearningModes: ["listen-repeat", "pronunciation-habit", "image-recognition"],
    description: "Hear the English word, look at the card, repeat it aloud, then move to the next word.",
    rewardText: "Finish the run for one reward box",
  },
  "sequence-memory": {
    id: "sequence-memory",
    label: "Sequence Memory",
    shortLabel: "Sequence",
    icon: "🔁",
    lengthLabel: "3 rounds",
    energyLabel: "Memory order",
    minimumCardPool: 4,
    usesCardPool: true,
    supportsLearningModes: ["sequence-memory", "visual-order", "audio-sequence"],
    description: "Watch the order, then tap the same cards in the same sequence from memory.",
    rewardText: "Clear all rounds for one reward box",
  },
  "image-reveal": {
    id: "image-reveal",
    label: "Image Reveal",
    shortLabel: "Reveal",
    icon: "🖼️",
    lengthLabel: "5 rounds",
    energyLabel: "Visual clues",
    minimumCardPool: 6,
    usesCardPool: true,
    supportsLearningModes: ["image-reveal", "visual-recognition", "partial-clue"],
    description: "Watch the hidden picture appear step by step, then pick the right card as early as you can.",
    rewardText: "Win the run for one reward box",
  },
  "loot-pop": {
    id: "loot-pop",
    label: "Loot Pop",
    shortLabel: "Pop",
    icon: "💥",
    lengthLabel: "16 sec",
    energyLabel: "Fast taps",
    minimumCardPool: 0,
    usesCardPool: false,
    supportsLearningModes: ["reaction-training", "future-rarity-burst"],
    description: "Tap the glowing loot sparks fast and keep the combo going before the timer runs out.",
    rewardText: "Win one reward box",
  },
};

export const FIRST_WIN_BONUS_BOXES = 1;
export const WIN_MILESTONE_STEP = 5;
export const WIN_MILESTONE_BONUS_STARS = 20;

export const AUDIO_SFX = {
  click: "click",
  hover: "hover",
  menuOpen: "menuOpen",
  screenTransition: "screenTransition",
  success: "success",
  failure: "failure",
  rewardTap1: "rewardTap1",
  rewardTap2: "rewardTap2",
  rewardTap3: "rewardTap3",
  rewardOpen: "rewardOpen",
  cardReveal: "cardReveal",
  epicRevealAccent: "epicRevealAccent",
  legendaryReveal: "legendaryReveal",
  cardSelect: "cardSelect",
  filterShift: "filterShift",
  milestone: "milestone",
  newCardUnlocked: "newCardUnlocked",
};

export const FEEDBACK_EVENTS = {
  buttonClick: "buttonClick",
  menuOpen: "menuOpen",
  screenTransition: "screenTransition",
  gameWin: "gameWin",
  gameLose: "gameLose",
  rewardTap1: "rewardTap1",
  rewardTap2: "rewardTap2",
  rewardTap3: "rewardTap3",
  rewardOpen: "rewardOpen",
  cardReveal: "cardReveal",
  collectionCardSelect: "collectionCardSelect",
  filterChange: "filterChange",
  progressMilestone: "progressMilestone",
  newCardUnlocked: "newCardUnlocked",
};

export const AUDIO_EVENT_SFX = {
  [FEEDBACK_EVENTS.buttonClick]: AUDIO_SFX.click,
  [FEEDBACK_EVENTS.menuOpen]: AUDIO_SFX.menuOpen,
  [FEEDBACK_EVENTS.screenTransition]: AUDIO_SFX.screenTransition,
  [FEEDBACK_EVENTS.gameWin]: AUDIO_SFX.success,
  [FEEDBACK_EVENTS.gameLose]: AUDIO_SFX.failure,
  [FEEDBACK_EVENTS.rewardTap1]: AUDIO_SFX.rewardTap1,
  [FEEDBACK_EVENTS.rewardTap2]: AUDIO_SFX.rewardTap2,
  [FEEDBACK_EVENTS.rewardTap3]: AUDIO_SFX.rewardTap3,
  [FEEDBACK_EVENTS.rewardOpen]: AUDIO_SFX.rewardOpen,
  [FEEDBACK_EVENTS.cardReveal]: AUDIO_SFX.cardReveal,
  [FEEDBACK_EVENTS.collectionCardSelect]: AUDIO_SFX.cardSelect,
  [FEEDBACK_EVENTS.filterChange]: AUDIO_SFX.filterShift,
  [FEEDBACK_EVENTS.progressMilestone]: AUDIO_SFX.milestone,
  [FEEDBACK_EVENTS.newCardUnlocked]: AUDIO_SFX.newCardUnlocked,
};

export const AUDIO_RARITY_ACCENTS = {
  epic: AUDIO_SFX.epicRevealAccent,
  legendary: AUDIO_SFX.legendaryReveal,
};

export const AUDIO_TRACKS = {
  menu: "menuTrack",
  gameplay: "gameplayTrack",
  reward: "rewardTrack",
};

export const AUDIO_ROUTE_TRACKS = {
  [ROUTES.home]: AUDIO_TRACKS.menu,
  [ROUTES.collection]: AUDIO_TRACKS.menu,
  [ROUTES.learn]: AUDIO_TRACKS.menu,
  [ROUTES.play]: AUDIO_TRACKS.gameplay,
  [ROUTES.reward]: AUDIO_TRACKS.reward,
  [ROUTES.parent]: AUDIO_TRACKS.menu,
};

export const AUDIO_DEFAULT_SETTINGS = {
  muted: false,
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.34,
  sfxVolume: 0.82,
};

export const AUDIO_ASSET_MANIFEST = {
  [AUDIO_TRACKS.menu]: "assets/audio/music/menu-loop.mp3",
  [AUDIO_TRACKS.gameplay]: "assets/audio/music/gameplay-loop.mp3",
  [AUDIO_TRACKS.reward]: "assets/audio/music/reward-loop.mp3",
  [AUDIO_SFX.click]: "assets/audio/sfx/button-click.mp3",
  [AUDIO_SFX.hover]: "assets/audio/sfx/button-hover.mp3",
  [AUDIO_SFX.menuOpen]: "assets/audio/sfx/menu-open.mp3",
  [AUDIO_SFX.screenTransition]: "assets/audio/sfx/screen-transition.mp3",
  [AUDIO_SFX.success]: "assets/audio/sfx/victory.mp3",
  [AUDIO_SFX.failure]: "assets/audio/sfx/failure.mp3",
  [AUDIO_SFX.rewardTap1]: "assets/audio/sfx/reward-tap-1.mp3",
  [AUDIO_SFX.rewardTap2]: "assets/audio/sfx/reward-tap-2.mp3",
  [AUDIO_SFX.rewardTap3]: "assets/audio/sfx/reward-tap-3.mp3",
  [AUDIO_SFX.rewardOpen]: "assets/audio/sfx/reward-open.mp3",
  [AUDIO_SFX.cardReveal]: "assets/audio/sfx/card-reveal.mp3",
  [AUDIO_SFX.epicRevealAccent]: "assets/audio/sfx/epic-reveal.mp3",
  [AUDIO_SFX.legendaryReveal]: "assets/audio/sfx/legendary-reveal.mp3",
  [AUDIO_SFX.cardSelect]: "assets/audio/sfx/card-select.mp3",
  [AUDIO_SFX.filterShift]: "assets/audio/sfx/filter-change.mp3",
  [AUDIO_SFX.milestone]: "assets/audio/sfx/progress-milestone.mp3",
  [AUDIO_SFX.newCardUnlocked]: "assets/audio/sfx/new-card-unlocked.mp3",
};

export const AUDIO_ASSET_PATHS = {
  [AUDIO_TRACKS.menu]: null,
  [AUDIO_TRACKS.gameplay]: null,
  [AUDIO_TRACKS.reward]: null,
  [AUDIO_SFX.click]: null,
  [AUDIO_SFX.hover]: null,
  [AUDIO_SFX.menuOpen]: null,
  [AUDIO_SFX.screenTransition]: null,
  [AUDIO_SFX.success]: null,
  [AUDIO_SFX.failure]: null,
  [AUDIO_SFX.rewardTap1]: null,
  [AUDIO_SFX.rewardTap2]: null,
  [AUDIO_SFX.rewardTap3]: null,
  [AUDIO_SFX.rewardOpen]: null,
  [AUDIO_SFX.cardReveal]: null,
  [AUDIO_SFX.epicRevealAccent]: null,
  [AUDIO_SFX.legendaryReveal]: null,
  [AUDIO_SFX.cardSelect]: null,
  [AUDIO_SFX.filterShift]: null,
  [AUDIO_SFX.milestone]: null,
  [AUDIO_SFX.newCardUnlocked]: null,
};

export const AUDIO_CUES = AUDIO_SFX;
