import { CATEGORY_META, COLLECTION_SORTS, RARITY_ORDER } from "../data/config.js";

export function summarizeProgress(cards, profile) {
  const unlockedCards = cards.filter((card) => card.unlocked);
  const totalPoints = unlockedCards.reduce((sum, card) => sum + card.points, 0);

  const categoryCounts = Object.entries(CATEGORY_META).map(([categoryId, meta]) => {
    const categoryCards = cards.filter((card) => card.category === categoryId);
    const unlocked = categoryCards.filter((card) => card.unlocked).length;
    return {
      id: categoryId,
      label: meta.label,
      accent: meta.accent,
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

  const newestCard = [...unlockedCards]
    .filter((card) => card.discoveredAt)
    .sort((left, right) => new Date(right.discoveredAt) - new Date(left.discoveredAt))[0] ?? null;

  return {
    totalUnlocked: unlockedCards.length,
    totalCards: cards.length,
    totalPoints,
    rewardBoxes: profile.rewardBoxes,
    totalWins: profile.totalWins,
    bonusStars: profile.bonusStars,
    categoryCounts,
    rarityCounts,
    newestCard,
  };
}

export function filterCards(cards, filters) {
  const filtered = cards.filter((card) => {
    const matchesCategory = filters.category === "all" || card.category === filters.category;
    const matchesRarity = filters.rarity === "all" || card.rarity === filters.rarity;
    return matchesCategory && matchesRarity;
  });

  const sorted = [...filtered];

  switch (filters.sort) {
    case "points-asc":
      sorted.sort((left, right) => left.points - right.points);
      break;
    case "alphabetical":
      sorted.sort((left, right) => left.word.localeCompare(right.word));
      break;
    case "newest":
      sorted.sort((left, right) => {
        const leftTime = left.discoveredAt ? new Date(left.discoveredAt).getTime() : 0;
        const rightTime = right.discoveredAt ? new Date(right.discoveredAt).getTime() : 0;
        return rightTime - leftTime;
      });
      break;
    case "points-desc":
    default:
      sorted.sort((left, right) => right.points - left.points);
      break;
  }

  return sorted;
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
