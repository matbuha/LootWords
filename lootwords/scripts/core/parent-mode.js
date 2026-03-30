import { CARD_LIBRARY } from "../data/cards.js";
import { CATEGORY_META, CATEGORY_ORDER, FALLBACK_STARS, RARITY_META, RARITY_ORDER } from "../data/config.js";

export const PARENT_SECRET_CLICK_TARGET = 5;
export const PARENT_SECRET_CLICK_WINDOW_MS = 4500;
export const PARENT_GATE_PHRASE = "LOOT";

export const PARENT_SECTIONS = {
  content: { id: "content", label: "Content" },
  categories: { id: "categories", label: "Categories" },
  progression: { id: "progression", label: "Rewards & Progression" },
  progress: { id: "progress", label: "Child Progress" },
  transfer: { id: "transfer", label: "Import / Export" },
  reset: { id: "reset", label: "Reset Tools" },
  settings: { id: "settings", label: "Settings" },
};

export const DEFAULT_PARENT_SECTION = PARENT_SECTIONS.content.id;

export function normalizeParentSection(section) {
  return Object.hasOwn(PARENT_SECTIONS, section) ? section : DEFAULT_PARENT_SECTION;
}

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsed));
}

function createCategoryStates(rawStates = {}) {
  return CATEGORY_ORDER.reduce((accumulator, categoryId) => {
    accumulator[categoryId] =
      typeof rawStates?.[categoryId] === "boolean" ? rawStates[categoryId] : true;
    return accumulator;
  }, {});
}

function normalizeDisabledCardIds(rawIds = []) {
  const allowed = new Set(CARD_LIBRARY.map((card) => card.id));
  return Array.from(new Set(Array.isArray(rawIds) ? rawIds : [])).filter((cardId) => allowed.has(cardId));
}

export function createDefaultParentSettings() {
  return {
    categoryStates: createCategoryStates(),
    disabledCardIds: [],
    rewards: {
      rewardBoxesPerWin: 1,
      duplicateRewardsEnabled: false,
      duplicateRewardStars: 10,
      fallbackRewardType: "stars",
      fallbackStars: FALLBACK_STARS,
      firstWinBonusEnabled: true,
      milestoneRewardsEnabled: true,
      cardsPerRewardReveal: 1,
    },
  };
}

export function normalizeParentSettings(rawSettings = {}) {
  const defaults = createDefaultParentSettings();
  const rewards = rawSettings?.rewards && typeof rawSettings.rewards === "object" ? rawSettings.rewards : {};
  const fallbackRewardType = rewards.fallbackRewardType === "message" ? "message" : "stars";

  return {
    categoryStates: createCategoryStates(rawSettings?.categoryStates),
    disabledCardIds: normalizeDisabledCardIds(rawSettings?.disabledCardIds),
    rewards: {
      rewardBoxesPerWin: clampInteger(
        rewards.rewardBoxesPerWin,
        defaults.rewards.rewardBoxesPerWin,
        1,
        3,
      ),
      duplicateRewardsEnabled:
        typeof rewards.duplicateRewardsEnabled === "boolean"
          ? rewards.duplicateRewardsEnabled
          : defaults.rewards.duplicateRewardsEnabled,
      duplicateRewardStars: clampInteger(
        rewards.duplicateRewardStars,
        defaults.rewards.duplicateRewardStars,
        0,
        200,
      ),
      fallbackRewardType,
      fallbackStars: clampInteger(
        rewards.fallbackStars,
        defaults.rewards.fallbackStars,
        0,
        500,
      ),
      firstWinBonusEnabled:
        typeof rewards.firstWinBonusEnabled === "boolean"
          ? rewards.firstWinBonusEnabled
          : defaults.rewards.firstWinBonusEnabled,
      milestoneRewardsEnabled:
        typeof rewards.milestoneRewardsEnabled === "boolean"
          ? rewards.milestoneRewardsEnabled
          : defaults.rewards.milestoneRewardsEnabled,
      cardsPerRewardReveal: 1,
    },
  };
}

export function getParentSettings(profile) {
  return normalizeParentSettings(profile?.parentMode);
}

export function isCategoryEnabled(profile, categoryId) {
  return Boolean(getParentSettings(profile).categoryStates[categoryId]);
}

export function isCardDisabled(profile, cardId) {
  return getParentSettings(profile).disabledCardIds.includes(cardId);
}

export function isCardActiveInChildMode(profile, card) {
  return isCategoryEnabled(profile, card.category) && !isCardDisabled(profile, card.id);
}

export function getChildModeCards(cards, profile) {
  return cards.filter((card) => isCardActiveInChildMode(profile, card));
}

export function getActiveCategoryIds(profile) {
  return CATEGORY_ORDER.filter((categoryId) => isCategoryEnabled(profile, categoryId));
}

export function summarizeParentMode(allCards, profile) {
  const parentSettings = getParentSettings(profile);
  const activeCards = getChildModeCards(allCards, profile);
  const activeCardIds = new Set(activeCards.map((card) => card.id));
  const unlockedAll = allCards.filter((card) => card.unlocked);
  const unlockedActive = activeCards.filter((card) => card.unlocked);
  const shelvedUnlockedCards = unlockedAll.filter((card) => !activeCardIds.has(card.id));
  const recentUnlocks = [...unlockedAll]
    .filter((card) => card.discoveredAt)
    .sort((left, right) => new Date(right.discoveredAt).getTime() - new Date(left.discoveredAt).getTime())
    .slice(0, 8);

  const categoryStats = CATEGORY_ORDER.map((categoryId) => {
    const cards = allCards.filter((card) => card.category === categoryId);
    const activeCardsInCategory = cards.filter((card) => isCardActiveInChildMode(profile, card));
    const unlockedCount = cards.filter((card) => card.unlocked).length;
    const activeUnlocked = activeCardsInCategory.filter((card) => card.unlocked).length;

    return {
      id: categoryId,
      label: CATEGORY_META[categoryId].label,
      icon: CATEGORY_META[categoryId].icon,
      active: parentSettings.categoryStates[categoryId],
      totalCards: cards.length,
      activeCards: activeCardsInCategory.length,
      unlockedCount,
      activeUnlocked,
      shelvedUnlocked: unlockedCount - activeUnlocked,
    };
  });

  const rarityStats = RARITY_ORDER.map((rarityId) => {
    const cards = allCards.filter((card) => card.rarity === rarityId);
    return {
      id: rarityId,
      label: RARITY_META[rarityId].label,
      total: cards.length,
      unlocked: cards.filter((card) => card.unlocked).length,
      active: cards.filter((card) => isCardActiveInChildMode(profile, card)).length,
    };
  });

  return {
    parentSettings,
    activeCards,
    activeCardCount: activeCards.length,
    disabledCardCount: parentSettings.disabledCardIds.length,
    unlockedAllCount: unlockedAll.length,
    unlockedActiveCount: unlockedActive.length,
    shelvedUnlockedCount: shelvedUnlockedCards.length,
    recentUnlocks,
    categoryStats,
    rarityStats,
  };
}

export function filterParentContentCards(allCards, profile, filters = {}) {
  const search = String(filters.search ?? "").trim().toLowerCase();

  return allCards.filter((card) => {
    const matchesSearch =
      !search ||
      card.word.toLowerCase().includes(search) ||
      card.id.toLowerCase().includes(search) ||
      card.tags.some((tag) => tag.toLowerCase().includes(search));
    const matchesCategory = filters.category === "all" || !filters.category || card.category === filters.category;
    const matchesRarity = filters.rarity === "all" || !filters.rarity || card.rarity === filters.rarity;
    const matchesUnlocked =
      filters.unlocked === "all" ||
      !filters.unlocked ||
      (filters.unlocked === "unlocked" ? card.unlocked : !card.unlocked);
    const isActive = isCardActiveInChildMode(profile, card);
    const matchesAvailability =
      filters.availability === "all" ||
      !filters.availability ||
      (filters.availability === "active" && isActive) ||
      (filters.availability === "shelved" && !isActive) ||
      (filters.availability === "manual-off" && isCardDisabled(profile, card.id)) ||
      (filters.availability === "category-off" && !isCategoryEnabled(profile, card.category));

    return matchesSearch && matchesCategory && matchesRarity && matchesUnlocked && matchesAvailability;
  });
}
