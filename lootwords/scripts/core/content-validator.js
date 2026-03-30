import { CARD_LIBRARY } from "../data/cards.js";
import { CATEGORY_META, GAME_CONFIG } from "../data/config.js";
import { validateCardLibrary } from "./card-utils.js";
import { normalizeParentSettings } from "./parent-mode.js";

const KNOWN_CARD_IDS = new Set(CARD_LIBRARY.map((card) => card.id));
const KNOWN_GAME_IDS = new Set(Object.keys(GAME_CONFIG));
const KNOWN_CATEGORY_IDS = new Set(Object.keys(CATEGORY_META));
const KNOWN_PROFILE_FIELDS = new Set([
  "version",
  "initializedAt",
  "pointsByCardId",
  "unlockedCardIds",
  "discoveredAtByCardId",
  "rewardBoxes",
  "rewardBoxesEarned",
  "rewardBoxesOpened",
  "totalWins",
  "bonusStars",
  "currentStreak",
  "bestStreak",
  "firstWinGameIds",
  "completedRounds",
  "gameStats",
  "lastPlayedGameId",
  "parentMode",
  "collectionFilters",
  "learnFilters",
  "settings",
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function looksLikeProfileObject(value) {
  if (!isPlainObject(value)) {
    return false;
  }

  return Object.keys(value).some((key) => KNOWN_PROFILE_FIELDS.has(key));
}

function validateIntegerRecord(record, knownKeys, label, errors) {
  if (!isPlainObject(record)) {
    errors.push(`${label} must be an object.`);
    return;
  }

  Object.entries(record).forEach(([key, value]) => {
    if (knownKeys && !knownKeys.has(key)) {
      errors.push(`${label} has an unknown key: ${key}`);
      return;
    }

    if (!Number.isFinite(Number(value)) || Number(value) < 0) {
      errors.push(`${label} has an invalid value for ${key}.`);
    }
  });
}

export function validateCurrentContentLibrary() {
  return validateCardLibrary(CARD_LIBRARY);
}

export function validateImportPayload(payload) {
  const errors = [];
  const warnings = [];
  const root = isPlainObject(payload) ? payload : null;

  if (!root) {
    return {
      errors: ["Import must be a JSON object."],
      warnings,
      profile: null,
    };
  }

  const profile = isPlainObject(root.profile) ? root.profile : looksLikeProfileObject(root) ? root : null;

  if (!profile) {
    errors.push("Import payload is missing a valid profile object.");
    return { errors, warnings, profile: null };
  }

  if (profile.unlockedCardIds !== undefined) {
    if (!Array.isArray(profile.unlockedCardIds)) {
      errors.push("unlockedCardIds must be an array.");
    } else {
      profile.unlockedCardIds.forEach((cardId) => {
        if (!KNOWN_CARD_IDS.has(cardId)) {
          errors.push(`Unknown unlocked card id: ${cardId}`);
        }
      });
    }
  }

  if (profile.pointsByCardId !== undefined) {
    validateIntegerRecord(profile.pointsByCardId, KNOWN_CARD_IDS, "pointsByCardId", errors);
  }

  if (profile.discoveredAtByCardId !== undefined) {
    if (!isPlainObject(profile.discoveredAtByCardId)) {
      errors.push("discoveredAtByCardId must be an object.");
    } else {
      Object.entries(profile.discoveredAtByCardId).forEach(([cardId, value]) => {
        if (!KNOWN_CARD_IDS.has(cardId)) {
          errors.push(`Unknown discoveredAt card id: ${cardId}`);
          return;
        }

        if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
          errors.push(`Invalid discoveredAt timestamp for ${cardId}.`);
        }
      });
    }
  }

  [
    "rewardBoxes",
    "rewardBoxesEarned",
    "rewardBoxesOpened",
    "totalWins",
    "bonusStars",
    "currentStreak",
    "bestStreak",
  ].forEach((field) => {
    if (profile[field] !== undefined && (!Number.isFinite(Number(profile[field])) || Number(profile[field]) < 0)) {
      errors.push(`${field} must be a non-negative number.`);
    }
  });

  if (profile.completedRounds !== undefined) {
    validateIntegerRecord(profile.completedRounds, KNOWN_GAME_IDS, "completedRounds", errors);
  }

  if (profile.gameStats !== undefined) {
    if (!isPlainObject(profile.gameStats)) {
      errors.push("gameStats must be an object.");
    } else {
      Object.entries(profile.gameStats).forEach(([gameId, stats]) => {
        if (!KNOWN_GAME_IDS.has(gameId)) {
          errors.push(`Unknown gameStats id: ${gameId}`);
          return;
        }

        if (!isPlainObject(stats)) {
          errors.push(`gameStats.${gameId} must be an object.`);
          return;
        }

        ["plays", "wins", "losses"].forEach((field) => {
          if (stats[field] !== undefined && (!Number.isFinite(Number(stats[field])) || Number(stats[field]) < 0)) {
            errors.push(`gameStats.${gameId}.${field} must be a non-negative number.`);
          }
        });
      });
    }
  }

  if (profile.parentMode !== undefined) {
    if (!isPlainObject(profile.parentMode)) {
      errors.push("parentMode must be an object.");
    } else {
      if (profile.parentMode.categoryStates !== undefined) {
        if (!isPlainObject(profile.parentMode.categoryStates)) {
          errors.push("parentMode.categoryStates must be an object.");
        } else {
          Object.entries(profile.parentMode.categoryStates).forEach(([categoryId, enabled]) => {
            if (!KNOWN_CATEGORY_IDS.has(categoryId)) {
              errors.push(`parentMode.categoryStates has an unknown category: ${categoryId}`);
              return;
            }

            if (typeof enabled !== "boolean") {
              errors.push(`parentMode.categoryStates.${categoryId} must be true or false.`);
            }
          });
        }
      }

      if (profile.parentMode.disabledCardIds !== undefined) {
        if (!Array.isArray(profile.parentMode.disabledCardIds)) {
          errors.push("parentMode.disabledCardIds must be an array.");
        } else {
          profile.parentMode.disabledCardIds.forEach((cardId) => {
            if (!KNOWN_CARD_IDS.has(cardId)) {
              errors.push(`parentMode.disabledCardIds has an unknown card id: ${cardId}`);
            }
          });
        }
      }

      const normalized = normalizeParentSettings(profile.parentMode);
      if (!Array.isArray(normalized.disabledCardIds)) {
        errors.push("parentMode.disabledCardIds must be a valid card-id list.");
      }

      if (profile.parentMode.rewards !== undefined && !isPlainObject(profile.parentMode.rewards)) {
        errors.push("parentMode.rewards must be an object.");
      }
    }
  }

  if (root.profile && root.app && root.app !== "LootWords") {
    warnings.push("Import app label does not match LootWords. Unknown fields will be ignored.");
  }

  return {
    errors,
    warnings,
    profile,
  };
}
