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
import { normalizeGameStatsMap, createEmptyGameStatsMap } from "./core/game-session-manager.js";
import { createDefaultParentSettings, normalizeParentSettings } from "./core/parent-mode.js";
import { createDefaultSettings, normalizeSettings } from "./core/settings-manager.js";

const STORAGE_BACKUP_KEY = `${STORAGE_KEY}:backup`;

function clampPoints(value) {
  const normalized = Number.parseInt(value, 10);
  if (Number.isNaN(normalized)) {
    return Math.floor(Math.random() * 1000) + 1;
  }
  return Math.max(1, Math.min(1000, normalized));
}

function isValidTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function createCompletedRounds() {
  return Object.keys(GAME_CONFIG).reduce((accumulator, gameId) => {
    accumulator[gameId] = 0;
    return accumulator;
  }, {});
}

function createFirstWinGameIds(gameStats = {}, rawFirstWins = []) {
  const derivedWins = Object.keys(gameStats).filter((gameId) => gameStats[gameId].wins > 0);
  const allowed = new Set(Object.keys(GAME_CONFIG));

  return Array.from(new Set([...(Array.isArray(rawFirstWins) ? rawFirstWins : []), ...derivedWins])).filter(
    (gameId) => allowed.has(gameId),
  );
}

function normalizeGameId(value, fallback = "memory-match") {
  return value && Object.hasOwn(GAME_CONFIG, value) ? value : fallback;
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
    rewardBoxesEarned: 0,
    rewardBoxesOpened: 0,
    totalWins: 0,
    bonusStars: 0,
    currentStreak: 0,
    bestStreak: 0,
    firstWinGameIds: [],
    completedRounds: createCompletedRounds(),
    gameStats: createEmptyGameStatsMap(),
    lastPlayedGameId: "memory-match",
    parentMode: createDefaultParentSettings(),
    collectionFilters: { ...DEFAULT_COLLECTION_FILTERS },
    learnFilters: { ...DEFAULT_LEARN_FILTERS },
    settings: createDefaultSettings(),
  };
}

export function normalizeProfile(rawProfile) {
  const fallback = createInitialProfile();
  const raw = rawProfile && typeof rawProfile === "object" ? rawProfile : {};
  const normalizedGameStats = normalizeGameStatsMap(raw.gameStats, raw.completedRounds);
  const firstWinGameIds = createFirstWinGameIds(normalizedGameStats, raw.firstWinGameIds);

  const unlockedIds = Array.isArray(raw.unlockedCardIds)
    ? raw.unlockedCardIds.filter((cardId) => CARD_LIBRARY.some((card) => card.id === cardId))
    : [];

  const discoveredAtByCardId = CARD_LIBRARY.reduce((accumulator, card) => {
    if (isValidTimestamp(raw.discoveredAtByCardId?.[card.id])) {
      accumulator[card.id] = raw.discoveredAtByCardId[card.id];
    }
    return accumulator;
  }, {});

  const collectionFilters = {
    ...DEFAULT_COLLECTION_FILTERS,
    ...(raw.collectionFilters ?? {}),
  };
  const learnFilters = {
    ...DEFAULT_LEARN_FILTERS,
    ...(raw.learnFilters ?? {}),
  };

  return {
    version: STORAGE_VERSION,
    initializedAt:
      typeof raw.initializedAt === "string" && !Number.isNaN(Date.parse(raw.initializedAt))
        ? raw.initializedAt
        : fallback.initializedAt,
    pointsByCardId: createInitialPoints(raw.pointsByCardId),
    unlockedCardIds: Array.from(new Set(unlockedIds)),
    discoveredAtByCardId,
    rewardBoxes: Math.max(0, Number.parseInt(raw.rewardBoxes, 10) || 0),
    rewardBoxesEarned: Math.max(
      0,
      Number.parseInt(raw.rewardBoxesEarned, 10) || Number.parseInt(raw.totalWins, 10) || 0,
    ),
    rewardBoxesOpened: Math.max(0, Number.parseInt(raw.rewardBoxesOpened, 10) || 0),
    totalWins: Math.max(0, Number.parseInt(raw.totalWins, 10) || 0),
    bonusStars: Math.max(0, Number.parseInt(raw.bonusStars, 10) || 0),
    currentStreak: Math.max(0, Number.parseInt(raw.currentStreak, 10) || 0),
    bestStreak: Math.max(
      0,
      Number.parseInt(raw.bestStreak, 10) || 0,
      Number.parseInt(raw.currentStreak, 10) || 0,
    ),
    firstWinGameIds,
    completedRounds: Object.keys(createCompletedRounds()).reduce((accumulator, gameId) => {
      accumulator[gameId] = normalizedGameStats[gameId].wins;
      return accumulator;
    }, {}),
    gameStats: normalizedGameStats,
    lastPlayedGameId: normalizeGameId(raw.lastPlayedGameId),
    parentMode: normalizeParentSettings(raw.parentMode),
    collectionFilters: {
      category: normalizeCategoryFilter(collectionFilters.category),
      rarity: normalizeRarityFilter(collectionFilters.rarity),
      sort: normalizeSortFilter(collectionFilters.sort, COLLECTION_SORTS, DEFAULT_COLLECTION_FILTERS.sort),
    },
    learnFilters: {
      category: normalizeCategoryFilter(learnFilters.category),
      sort: normalizeSortFilter(learnFilters.sort, LEARN_SORTS, DEFAULT_LEARN_FILTERS.sort),
    },
    settings: normalizeSettings(raw.settings),
  };
}

function readProfileRecord(key) {
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return { status: "missing", profile: null };
    }
    return {
      status: "ok",
      profile: normalizeProfile(JSON.parse(rawValue)),
    };
  } catch (error) {
    console.warn(`LootWords profile read failed for ${key}.`, error);
    return { status: "error", profile: null };
  }
}

function persistSerializedProfile(serializedProfile) {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializedProfile);
  } catch (error) {
    console.warn("LootWords profile could not be saved to primary storage.", error);
  }

  try {
    window.localStorage.setItem(STORAGE_BACKUP_KEY, serializedProfile);
  } catch (error) {
    console.warn("LootWords profile backup could not be saved.", error);
  }
}

export function loadProfile() {
  const primary = readProfileRecord(STORAGE_KEY);
  if (primary.status === "ok") {
    return primary.profile;
  }

  const backup = readProfileRecord(STORAGE_BACKUP_KEY);
  if (backup.status === "ok") {
    const serializedBackup = JSON.stringify(backup.profile);
    persistSerializedProfile(serializedBackup);
    console.warn("LootWords profile recovered from backup storage.");
    return backup.profile;
  }

  if (primary.status === "error" || backup.status === "error") {
    console.warn("LootWords profile reset after storage recovery failed.");
  }

  return createInitialProfile();
}

export function saveProfile(profile) {
  try {
    persistSerializedProfile(JSON.stringify(normalizeProfile(profile)));
  } catch (error) {
    console.warn("LootWords profile could not be saved.", error);
  }
}
