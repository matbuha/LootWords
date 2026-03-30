import {
  CATEGORY_META,
  COLLECTION_SORTS,
  DEFAULT_COLLECTION_FILTERS,
  DEFAULT_LEARN_FILTERS,
  GAME_CONFIG,
  LEARN_SORTS,
  LEGACY_CATEGORY_ALIASES,
  RARITY_META,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "./data/config.js";
import { CARD_LIBRARY } from "./data/cards.js";

function clampPoints(value) {
  const normalized = Number.parseInt(value, 10);
  if (Number.isNaN(normalized)) {
    return Math.floor(Math.random() * 1000) + 1;
  }
  return Math.max(1, Math.min(1000, normalized));
}

function createCompletedRounds() {
  return Object.keys(GAME_CONFIG).reduce((accumulator, gameId) => {
    accumulator[gameId] = 0;
    return accumulator;
  }, {});
}

function createInitialPoints(existing = {}) {
  return CARD_LIBRARY.reduce((accumulator, card) => {
    accumulator[card.id] = clampPoints(existing[card.id]);
    return accumulator;
  }, {});
}

function normalizeCategoryFilter(value) {
  const normalized = LEGACY_CATEGORY_ALIASES[value] ?? value;
  return normalized === "all" || CATEGORY_META[normalized] ? normalized : "all";
}

function normalizeSortFilter(value, allowedSorts, fallback) {
  return value && Object.hasOwn(allowedSorts, value) ? value : fallback;
}

function normalizeRarityFilter(value) {
  return value === "all" || RARITY_META[value] ? value : "all";
}

export function createInitialProfile() {
  return {
    version: STORAGE_VERSION,
    initializedAt: new Date().toISOString(),
    pointsByCardId: createInitialPoints(),
    unlockedCardIds: [],
    discoveredAtByCardId: {},
    rewardBoxes: 0,
    totalWins: 0,
    bonusStars: 0,
    completedRounds: createCompletedRounds(),
    collectionFilters: { ...DEFAULT_COLLECTION_FILTERS },
    learnFilters: { ...DEFAULT_LEARN_FILTERS },
    settings: {
      audioMuted: false,
    },
  };
}

export function normalizeProfile(rawProfile) {
  const fallback = createInitialProfile();
  const raw = rawProfile && typeof rawProfile === "object" ? rawProfile : {};

  const unlockedIds = Array.isArray(raw.unlockedCardIds)
    ? raw.unlockedCardIds.filter((cardId) => CARD_LIBRARY.some((card) => card.id === cardId))
    : [];

  const discoveredAtByCardId = CARD_LIBRARY.reduce((accumulator, card) => {
    if (raw.discoveredAtByCardId?.[card.id]) {
      accumulator[card.id] = raw.discoveredAtByCardId[card.id];
    }
    return accumulator;
  }, {});

  const completedRounds = { ...createCompletedRounds(), ...(raw.completedRounds ?? {}) };
  const collectionFilters = {
    ...DEFAULT_COLLECTION_FILTERS,
    ...(raw.collectionFilters ?? {}),
  };
  const learnFilters = {
    ...DEFAULT_LEARN_FILTERS,
    ...(raw.learnFilters ?? {}),
  };

  return {
    ...fallback,
    ...raw,
    version: STORAGE_VERSION,
    pointsByCardId: createInitialPoints(raw.pointsByCardId),
    unlockedCardIds: Array.from(new Set(unlockedIds)),
    discoveredAtByCardId,
    rewardBoxes: Math.max(0, Number.parseInt(raw.rewardBoxes, 10) || 0),
    totalWins: Math.max(0, Number.parseInt(raw.totalWins, 10) || 0),
    bonusStars: Math.max(0, Number.parseInt(raw.bonusStars, 10) || 0),
    completedRounds: Object.keys(createCompletedRounds()).reduce((accumulator, gameId) => {
      accumulator[gameId] = Math.max(0, Number.parseInt(completedRounds[gameId], 10) || 0);
      return accumulator;
    }, {}),
    collectionFilters: {
      category: normalizeCategoryFilter(collectionFilters.category),
      rarity: normalizeRarityFilter(collectionFilters.rarity),
      sort: normalizeSortFilter(collectionFilters.sort, COLLECTION_SORTS, DEFAULT_COLLECTION_FILTERS.sort),
    },
    learnFilters: {
      category: normalizeCategoryFilter(learnFilters.category),
      sort: normalizeSortFilter(learnFilters.sort, LEARN_SORTS, DEFAULT_LEARN_FILTERS.sort),
    },
    settings: {
      audioMuted: Boolean(raw.settings?.audioMuted),
    },
  };
}

export function loadProfile() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return createInitialProfile();
    }
    return normalizeProfile(JSON.parse(rawValue));
  } catch (error) {
    console.warn("LootWords profile reset after storage read failure.", error);
    return createInitialProfile();
  }
}

export function saveProfile(profile) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProfile(profile)));
  } catch (error) {
    console.warn("LootWords profile could not be saved.", error);
  }
}
