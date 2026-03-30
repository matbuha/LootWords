import {
  CATEGORY_META,
  CATEGORY_ORDER,
  COLLECTION_SORTS,
  PACK_META,
  PACK_ORDER,
  RARITY_ORDER,
  RECENT_CARD_LIMIT,
} from "../data/config.js";
import { buildCategorySections, sortCards } from "./card-utils.js";
import { buildGameSessionSummary } from "./game-session-manager.js";

function sortByDiscoveredAt(left, right) {
  const leftTime = left.discoveredAt ? new Date(left.discoveredAt).getTime() : 0;
  const rightTime = right.discoveredAt ? new Date(right.discoveredAt).getTime() : 0;
  return rightTime - leftTime;
}

export function summarizeProgress(cards, profile, currentGameId = null) {
  const unlockedCards = cards.filter((card) => card.unlocked);
  const totalPoints = unlockedCards.reduce((sum, card) => sum + card.points, 0);
  const recentCards = [...unlockedCards]
    .filter((card) => card.discoveredAt)
    .sort(sortByDiscoveredAt)
    .slice(0, RECENT_CARD_LIMIT);
  const playSummary = buildGameSessionSummary(profile, currentGameId);

  const categoryCounts = CATEGORY_ORDER.map((categoryId) => {
    const categoryCards = cards.filter((card) => card.category === categoryId);
    const unlocked = categoryCards.filter((card) => card.unlocked).length;

    return {
      id: categoryId,
      label: CATEGORY_META[categoryId].label,
      accent: CATEGORY_META[categoryId].accent,
      icon: CATEGORY_META[categoryId].icon,
      unlocked,
      total: categoryCards.length,
      percent: categoryCards.length ? Math.round((unlocked / categoryCards.length) * 100) : 0,
    };
  });

  const rarityCounts = RARITY_ORDER.map((rarity) => {
    const total = cards.filter((card) => card.rarity === rarity).length;
    const unlocked = cards.filter((card) => card.rarity === rarity && card.unlocked).length;
    return {
      id: rarity,
      total,
      unlocked,
    };
  });

  const packCounts = PACK_ORDER.map((packId) => {
    const total = cards.filter((card) => card.packId === packId).length;
    const unlocked = cards.filter((card) => card.packId === packId && card.unlocked).length;
    return {
      id: packId,
      label: PACK_META[packId].label,
      icon: PACK_META[packId].icon,
      total,
      unlocked,
      percent: total ? Math.round((unlocked / total) * 100) : 0,
    };
  });

  const strongestCards = sortCards(unlockedCards, "points-desc").slice(0, 3);
  const weakestCards = sortCards(unlockedCards, "points-asc").slice(0, 3);
  const newestCard = recentCards[0] ?? null;

  return {
    totalUnlocked: unlockedCards.length,
    totalCards: cards.length,
    totalPoints,
    completionPercent: cards.length ? Math.round((unlockedCards.length / cards.length) * 100) : 0,
    rewardBoxes: profile.rewardBoxes,
    rewardBoxesEarned: profile.rewardBoxesEarned,
    totalWins: profile.totalWins,
    bonusStars: profile.bonusStars,
    currentStreak: profile.currentStreak,
    bestStreak: profile.bestStreak,
    categoryCounts,
    rarityCounts,
    packCounts,
    newestCard,
    recentCards,
    recentCardIds: recentCards.map((card) => card.id),
    strongestCards,
    weakestCards,
    strongestCard: strongestCards[0] ?? null,
    weakestCard: weakestCards[0] ?? null,
    playSummary,
  };
}

export function filterCards(cards, filters) {
  const filtered = cards.filter((card) => {
    const matchesCategory = filters.category === "all" || card.category === filters.category;
    const matchesRarity = filters.rarity === "all" || card.rarity === filters.rarity;
    return matchesCategory && matchesRarity;
  });

  return sortCards(filtered, filters.sort);
}

export function getCollectionSections(cards, filters) {
  const filtered = filterCards(cards, filters);
  const sections = buildCategorySections(filtered, filters.sort);

  if (filters.category !== "all") {
    return sections.filter((section) => section.id === filters.category);
  }

  return sections;
}

export function getCollectionFilterOptions() {
  return COLLECTION_SORTS;
}

export function getPlayablePool(cards, minimumSize) {
  const unlockedCards = cards.filter((card) => card.unlocked);
  if (unlockedCards.length >= minimumSize) {
    return unlockedCards;
  }
  return cards;
}

export function getReviewDeck(cards, filters) {
  const filtered = cards.filter((card) => {
    if (!card.unlocked) {
      return false;
    }

    return filters.category === "all" || card.category === filters.category;
  });

  return sortCards(filtered, filters.sort);
}
