import {
  FALLBACK_STARS,
  FIRST_WIN_BONUS_BOXES,
  GAME_CONFIG,
  WIN_MILESTONE_BONUS_STARS,
  WIN_MILESTONE_STEP,
} from "../data/config.js";
import { summarizeWinOutcome } from "./game-session-manager.js";
import { getParentSettings } from "./parent-mode.js";

function uniqueList(items) {
  return Array.from(new Set(items));
}

function getGameStats(profile, gameId) {
  return profile.gameStats?.[gameId] ?? {
    plays: 0,
    wins: 0,
    losses: 0,
  };
}

function updateGameStats(profile, gameId, partialStats) {
  return {
    ...(profile.gameStats ?? {}),
    [gameId]: {
      ...getGameStats(profile, gameId),
      ...partialStats,
    },
  };
}

export function recordGameWin(profile, gameId) {
  const parentSettings = getParentSettings(profile);
  const currentStats = getGameStats(profile, gameId);
  const nextStats = {
    plays: currentStats.plays + 1,
    wins: currentStats.wins + 1,
    losses: currentStats.losses,
  };
  const isFirstWin =
    parentSettings.rewards.firstWinBonusEnabled && !profile.firstWinGameIds.includes(gameId);
  const boxesAwarded =
    parentSettings.rewards.rewardBoxesPerWin + (isFirstWin ? FIRST_WIN_BONUS_BOXES : 0);
  const nextTotalWins = profile.totalWins + 1;
  const reachedMilestone =
    parentSettings.rewards.milestoneRewardsEnabled &&
    nextTotalWins > 0 &&
    nextTotalWins % WIN_MILESTONE_STEP === 0;
  const currentStreak = profile.currentStreak + 1;
  const nextProfile = {
    ...profile,
    rewardBoxes: profile.rewardBoxes + boxesAwarded,
    rewardBoxesEarned: profile.rewardBoxesEarned + boxesAwarded,
    totalWins: nextTotalWins,
    bonusStars: profile.bonusStars + (reachedMilestone ? WIN_MILESTONE_BONUS_STARS : 0),
    currentStreak,
    bestStreak: Math.max(profile.bestStreak, currentStreak),
    firstWinGameIds: isFirstWin ? uniqueList([...profile.firstWinGameIds, gameId]) : profile.firstWinGameIds,
    completedRounds: {
      ...profile.completedRounds,
      [gameId]: nextStats.wins,
    },
    gameStats: updateGameStats(profile, gameId, nextStats),
    lastPlayedGameId: gameId,
  };

  return {
    profile: nextProfile,
    summary: summarizeWinOutcome(profile, gameId, nextProfile),
  };
}

export function recordGameLoss(profile, gameId) {
  const currentStats = getGameStats(profile, gameId);
  const nextStats = {
    plays: currentStats.plays + 1,
    wins: currentStats.wins,
    losses: currentStats.losses + 1,
  };
  const streakEnded = profile.currentStreak > 0;
  const nextProfile = {
    ...profile,
    currentStreak: 0,
    completedRounds: {
      ...profile.completedRounds,
      [gameId]: nextStats.wins,
    },
    gameStats: updateGameStats(profile, gameId, nextStats),
    lastPlayedGameId: gameId,
  };

  return {
    profile: nextProfile,
    summary: {
      gameLabel: GAME_CONFIG[gameId]?.label ?? gameId,
      currentStreak: nextProfile.currentStreak,
      bestStreak: nextProfile.bestStreak,
      lossCount: nextStats.losses,
      streakEnded,
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

  const parentSettings = getParentSettings(profile);
  if (!cards.length) {
    return {
      profile,
      reward: {
        type: "blocked",
        titleKey: "emptyState.noActiveCardsTitle",
        detailKey: "reward.contentPausedHint",
      },
    };
  }

  const lockedCards = cards.filter((card) => !card.unlocked);
  const baseProfile = {
    ...profile,
    rewardBoxes: profile.rewardBoxes - 1,
    rewardBoxesOpened: profile.rewardBoxesOpened + 1,
  };

  if (parentSettings.rewards.duplicateRewardsEnabled) {
    const rewardCard = cards[Math.floor(Math.random() * cards.length)];
    const discoveredAt = new Date().toISOString();

    if (!rewardCard.unlocked) {
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

    return {
      profile: {
        ...baseProfile,
        bonusStars: baseProfile.bonusStars + parentSettings.rewards.duplicateRewardStars,
      },
      reward: {
        type: "duplicate",
        cardId: rewardCard.id,
        amount: parentSettings.rewards.duplicateRewardStars,
      },
    };
  }

  if (!lockedCards.length) {
    if (parentSettings.rewards.fallbackRewardType === "message") {
      return {
        profile: baseProfile,
        reward: {
          type: "message",
          titleKey: "reward.allCardsCollected",
          detailKey: "reward.allActiveCollectedDetail",
        },
      };
    }

    return {
      profile: {
        ...baseProfile,
        bonusStars:
          baseProfile.bonusStars + (parentSettings.rewards.fallbackStars ?? FALLBACK_STARS),
      },
      reward: {
        type: "stars",
        amount: parentSettings.rewards.fallbackStars ?? FALLBACK_STARS,
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
