import { FALLBACK_STARS } from "../data/config.js";

function uniqueList(items) {
  return Array.from(new Set(items));
}

export function recordGameWin(profile, gameId) {
  return {
    ...profile,
    rewardBoxes: profile.rewardBoxes + 1,
    totalWins: profile.totalWins + 1,
    completedRounds: {
      ...profile.completedRounds,
      [gameId]: (profile.completedRounds[gameId] ?? 0) + 1,
    },
  };
}

export function openRewardBox(profile, cards) {
  if (profile.rewardBoxes <= 0) {
    return {
      profile,
      reward: null,
    };
  }

  const lockedCards = cards.filter((card) => !card.unlocked);
  const baseProfile = {
    ...profile,
    rewardBoxes: profile.rewardBoxes - 1,
  };

  if (!lockedCards.length) {
    return {
      profile: {
        ...baseProfile,
        bonusStars: baseProfile.bonusStars + FALLBACK_STARS,
      },
      reward: {
        type: "stars",
        amount: FALLBACK_STARS,
      },
    };
  }

  const rewardCard = lockedCards[Math.floor(Math.random() * lockedCards.length)];
  const discoveredAt = new Date().toISOString();

  return {
    profile: {
      ...baseProfile,
      unlockedCardIds: uniqueList([...baseProfile.unlockedCardIds, rewardCard.id]),
      discoveredAtByCardId: {
        ...baseProfile.discoveredAtByCardId,
        [rewardCard.id]: discoveredAt,
      },
    },
    reward: {
      type: "card",
      cardId: rewardCard.id,
      discoveredAt,
    },
  };
}
