import { createDefaultParentSettings } from "./parent-mode.js";
import { createDefaultSettings } from "./settings-manager.js";
import { createInitialProfile } from "../storage.js";

function createProgressResetState(profile) {
  const defaults = createInitialProfile();

  return {
    ...profile,
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
    completedRounds: defaults.completedRounds,
    gameStats: defaults.gameStats,
    lastPlayedGameId: defaults.lastPlayedGameId,
  };
}

export function resetAllChildProgress(profile) {
  return createProgressResetState(profile);
}

export function resetCollectionProgress(profile) {
  return {
    ...profile,
    unlockedCardIds: [],
    discoveredAtByCardId: {},
  };
}

export function resetRewardState(profile) {
  return {
    ...profile,
    rewardBoxes: 0,
    bonusStars: 0,
  };
}

export function resetSettingsState(profile) {
  return {
    ...profile,
    collectionFilters: createInitialProfile().collectionFilters,
    learnFilters: createInitialProfile().learnFilters,
    settings: createDefaultSettings(),
    parentMode: createDefaultParentSettings(),
  };
}
