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
import { FIREBASE_MODULE_URLS, loadFirebaseRuntimeConfig } from "./data/firebase-config.js";
import {
  createEmptyLootInventory,
  getKnownInventoryIds,
  isRewardCatalogItemDefaultOwned,
  getRewardInventoryKey,
  REWARD_TYPE_META,
} from "./data/loot.js";
import { CARD_LIBRARY } from "./data/cards.js";
import { normalizeGameStatsMap, createEmptyGameStatsMap } from "./core/game-session-manager.js";
import { createDefaultParentSettings, normalizeParentSettings } from "./core/parent-mode.js";
import { createEmptyCardEvolutionState, normalizeCardEvolution } from "./core/card-evolution-manager.js";
import { createRarityBoundPoints, getCardBaseRarity, getRarityPointRange } from "./core/rarity.js";
import { createDefaultSettings, normalizeSettings } from "./core/settings-manager.js";

const STORAGE_BACKUP_KEY = `${STORAGE_KEY}:backup`;
const LEGACY_ARCHIVE_KEY = `${STORAGE_KEY}:legacy-archive`;
const LEGACY_ARCHIVE_BACKUP_KEY = `${STORAGE_KEY}:legacy-archive-backup`;
const GUEST_SESSION_KEY = `${STORAGE_KEY}:guest-session`;
const USER_LOCAL_KEY_PREFIX = `${STORAGE_KEY}:user:`;
const USER_PROGRESS_COLLECTION = "progress";
const USER_PROFILE_DOCUMENT = "main";

let firestoreApiPromise = null;
let pendingUserSave = Promise.resolve();
const userStorageModes = new Map();

function clampPoints(value, card) {
  const normalized = Number.parseInt(value, 10);
  const rarity = getCardBaseRarity(card);
  const { min, max } = getRarityPointRange(rarity);
  if (Number.isNaN(normalized)) {
    return createRarityBoundPoints(card);
  }
  return Math.max(min, Math.min(max, normalized));
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
    accumulator[card.id] = clampPoints(existing[card.id], card);
    return accumulator;
  }, {});
}

function normalizeLootInventory(rawInventory) {
  const defaults = createEmptyLootInventory();
  const source = rawInventory && typeof rawInventory === "object" ? rawInventory : {};

  return Object.keys(defaults).reduce((inventory, key) => {
    const rewardType = Object.keys(REWARD_TYPE_META).find(
      (type) => getRewardInventoryKey(type) === key,
    );
    const knownIds = rewardType ? getKnownInventoryIds(rewardType) : new Set();
    const nextItems = Array.isArray(source[key]) ? source[key].filter((itemId) => knownIds.has(itemId)) : [];

    inventory[key] = Array.from(new Set(nextItems));
    return inventory;
  }, createEmptyLootInventory());
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
    coins: 0,
    totalWins: 0,
    bonusStars: 0,
    inventory: createEmptyLootInventory(),
    selectedUiThemePackId: "default",
    selectedCursorSkinId: null,
    selectedProfileAvatarId: null,
    selectedProfileBackgroundId: null,
    cardEvolutionByCardId: createEmptyCardEvolutionState(),
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
  const normalizedInventory = normalizeLootInventory(raw.inventory);

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
    coins: Math.max(0, Number.parseInt(raw.coins, 10) || 0),
    totalWins: Math.max(0, Number.parseInt(raw.totalWins, 10) || 0),
    bonusStars: Math.max(0, Number.parseInt(raw.bonusStars, 10) || 0),
    inventory: normalizedInventory,
    selectedUiThemePackId:
      raw.selectedUiThemePackId === "default" || isRewardCatalogItemDefaultOwned("ui-theme-pack", raw.selectedUiThemePackId)
        ? "default"
        : normalizedInventory.uiThemePacks.includes(raw.selectedUiThemePackId)
          ? raw.selectedUiThemePackId
          : fallback.selectedUiThemePackId,
    selectedCursorSkinId: normalizedInventory.cursorSkins.includes(raw.selectedCursorSkinId)
      ? raw.selectedCursorSkinId
      : null,
    selectedProfileAvatarId: normalizedInventory.profileAvatars.includes(raw.selectedProfileAvatarId)
      ? raw.selectedProfileAvatarId
      : null,
    selectedProfileBackgroundId: normalizedInventory.profileBackgrounds.includes(raw.selectedProfileBackgroundId)
      ? raw.selectedProfileBackgroundId
      : null,
    cardEvolutionByCardId: normalizeCardEvolution(raw.cardEvolutionByCardId, Array.from(new Set(unlockedIds))),
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

function readLocalProfileRecord(storage, key) {
  try {
    const rawValue = storage.getItem(key);
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

function getUserLocalStorageKey(uid) {
  return `${USER_LOCAL_KEY_PREFIX}${uid}`;
}

function setUserStorageMode(uid, storage) {
  if (!uid) {
    return;
  }

  userStorageModes.set(uid, storage);
}

function loadLocalUserProfile(uid) {
  if (!uid) {
    return { status: "missing", profile: null };
  }

  return readLocalProfileRecord(window.localStorage, getUserLocalStorageKey(uid));
}

function saveLocalUserProfile(uid, profile) {
  if (!uid) {
    return;
  }

  try {
    window.localStorage.setItem(getUserLocalStorageKey(uid), JSON.stringify(normalizeProfile(profile)));
  } catch (error) {
    console.warn(`LootWords user cache could not be saved for ${uid}.`, error);
  }
}

function archiveLegacySharedStorage() {
  const primary = window.localStorage.getItem(STORAGE_KEY);
  const backup = window.localStorage.getItem(STORAGE_BACKUP_KEY);

  if (primary && !window.localStorage.getItem(LEGACY_ARCHIVE_KEY)) {
    window.localStorage.setItem(LEGACY_ARCHIVE_KEY, primary);
  }

  if (backup && !window.localStorage.getItem(LEGACY_ARCHIVE_BACKUP_KEY)) {
    window.localStorage.setItem(LEGACY_ARCHIVE_BACKUP_KEY, backup);
  }

  if (primary || backup) {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(STORAGE_BACKUP_KEY);
  }
}

function loadGuestProfile() {
  archiveLegacySharedStorage();

  const guestRecord = readLocalProfileRecord(window.sessionStorage, GUEST_SESSION_KEY);
  if (guestRecord.status === "ok") {
    return guestRecord.profile;
  }

  if (guestRecord.status === "error") {
    console.warn("LootWords guest profile reset after session storage recovery failed.");
  }

  return createInitialProfile();
}

function saveGuestProfile(profile) {
  try {
    window.sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(normalizeProfile(profile)));
  } catch (error) {
    console.warn("LootWords guest profile could not be saved to session storage.", error);
  }
}

async function getFirestoreApi() {
  if (firestoreApiPromise) {
    return firestoreApiPromise;
  }

  firestoreApiPromise = (async () => {
    const firebaseConfig = await loadFirebaseRuntimeConfig();
    if (!firebaseConfig) {
      return null;
    }

    const [appModule, firestoreModule] = await Promise.all([
      import(FIREBASE_MODULE_URLS.app),
      import(FIREBASE_MODULE_URLS.firestore),
    ]);
    const { getApps, initializeApp } = appModule;
    const { doc, getDoc, getFirestore, setDoc } = firestoreModule;

    const app = getApps().find((entry) => entry.name === "lootwords") ?? initializeApp(firebaseConfig, "lootwords");
    const db = getFirestore(app);

    return { db, doc, getDoc, setDoc };
  })();

  return firestoreApiPromise;
}

function buildUserProfileReference(firestoreApi, uid) {
  return firestoreApi.doc(firestoreApi.db, "users", uid, USER_PROGRESS_COLLECTION, USER_PROFILE_DOCUMENT);
}

async function loadUserProfile(uid) {
  archiveLegacySharedStorage();

  if (!uid) {
    return createInitialProfile();
  }

  const localFallback = loadLocalUserProfile(uid);

  try {
    const firestoreApi = await getFirestoreApi();
    if (!firestoreApi) {
      const fallbackProfile = localFallback.status === "ok" ? localFallback.profile : createInitialProfile();
      setUserStorageMode(uid, "localStorage");
      return fallbackProfile;
    }

    const snapshot = await firestoreApi.getDoc(buildUserProfileReference(firestoreApi, uid));
    if (!snapshot.exists()) {
      setUserStorageMode(uid, "firestore");
      return createInitialProfile();
    }

    const raw = snapshot.data();
    const normalized = normalizeProfile(raw?.profile ?? raw);
    saveLocalUserProfile(uid, normalized);
    setUserStorageMode(uid, "firestore");
    return normalized;
  } catch (error) {
    console.warn(`LootWords user profile read failed for ${uid}.`, error);
    const fallbackProfile = localFallback.status === "ok" ? localFallback.profile : createInitialProfile();
    setUserStorageMode(uid, "localStorage");
    return fallbackProfile;
  }
}

function saveUserProfile(uid, profile) {
  if (!uid) {
    return Promise.resolve();
  }

  const normalized = normalizeProfile(profile);
  saveLocalUserProfile(uid, normalized);

  pendingUserSave = pendingUserSave
    .catch(() => {})
    .then(async () => {
      const firestoreApi = await getFirestoreApi();
      if (!firestoreApi) {
        setUserStorageMode(uid, "localStorage");
        return;
      }

      await firestoreApi.setDoc(
        buildUserProfileReference(firestoreApi, uid),
        {
          profile: normalized,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setUserStorageMode(uid, "firestore");
    })
    .catch((error) => {
      console.warn(`LootWords user profile save failed for ${uid}.`, error);
      setUserStorageMode(uid, "localStorage");
    });

  return pendingUserSave;
}

export function createPersistenceDescriptor(authState) {
  if (authState?.mode === "authenticated" && authState.user?.uid) {
    return {
      kind: "user",
      ownerId: authState.user.uid,
      storage: userStorageModes.get(authState.user.uid) ?? "firestore",
    };
  }

  return {
    kind: "guest",
    ownerId: "guest-session",
    storage: "sessionStorage",
  };
}

export async function loadScopedProfile(authState) {
  const descriptor = createPersistenceDescriptor(authState);
  return descriptor.kind === "user" ? loadUserProfile(descriptor.ownerId) : loadGuestProfile();
}

export function saveScopedProfile(profile, authState) {
  const descriptor = createPersistenceDescriptor(authState);
  if (descriptor.kind === "user") {
    return saveUserProfile(descriptor.ownerId, profile);
  }

  saveGuestProfile(profile);
  return Promise.resolve();
}

export function clearGuestProfile() {
  try {
    window.sessionStorage.removeItem(GUEST_SESSION_KEY);
  } catch (error) {
    console.warn("LootWords guest profile could not be cleared.", error);
  }
}

export function getLegacyArchiveInfo() {
  return {
    primaryArchived: Boolean(window.localStorage.getItem(LEGACY_ARCHIVE_KEY)),
    backupArchived: Boolean(window.localStorage.getItem(LEGACY_ARCHIVE_BACKUP_KEY)),
  };
}

// Legacy exports kept temporarily for compatibility with older imports.
export function loadProfile() {
  return loadGuestProfile();
}

export function saveProfile(profile) {
  saveGuestProfile(profile);
}
