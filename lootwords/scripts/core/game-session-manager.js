import {
  FIRST_WIN_BONUS_BOXES,
  GAME_CONFIG,
  WIN_MILESTONE_BONUS_STARS,
  WIN_MILESTONE_STEP,
} from "../data/config.js";
import { getGameDefinition, getGameEntries, getGameIds, getRandomGameId } from "../games/game-registry.js";

function createEmptyGameStat() {
  return {
    plays: 0,
    wins: 0,
    losses: 0,
  };
}

export function createEmptyGameStatsMap() {
  return getGameIds().reduce((accumulator, gameId) => {
    accumulator[gameId] = createEmptyGameStat();
    return accumulator;
  }, {});
}

export function normalizeGameStatsMap(rawGameStats = {}, completedRounds = {}) {
  return getGameIds().reduce((accumulator, gameId) => {
    const rawStats = rawGameStats?.[gameId] ?? {};
    const wins = Math.max(
      0,
      Number.parseInt(rawStats.wins, 10) || Number.parseInt(completedRounds?.[gameId], 10) || 0,
    );
    const losses = Math.max(0, Number.parseInt(rawStats.losses, 10) || 0);
    const plays = Math.max(wins + losses, Number.parseInt(rawStats.plays, 10) || 0);

    accumulator[gameId] = {
      plays,
      wins,
      losses,
    };
    return accumulator;
  }, {});
}

export function getGameStatsFor(profile, gameId) {
  return profile.gameStats?.[gameId] ?? createEmptyGameStat();
}

export function getNextWinMilestoneTarget(totalWins) {
  const safeWins = Math.max(0, totalWins);
  return Math.floor(safeWins / WIN_MILESTONE_STEP + 1) * WIN_MILESTONE_STEP;
}

export function buildGameProgressList(profile) {
  return getGameEntries().map((game) => {
    const stats = getGameStatsFor(profile, game.id);
    const isFirstWinAvailable = !profile.firstWinGameIds.includes(game.id);

    return {
      ...game,
      stats,
      isFirstWinAvailable,
      hasPlayed: stats.plays > 0,
      hasWon: stats.wins > 0,
    };
  });
}

export function getRecommendedGameId(profile, currentGameId = null) {
  const progressList = buildGameProgressList(profile);
  const unplayed = progressList.filter((game) => !game.hasPlayed);
  if (unplayed.length) {
    return unplayed[0].id;
  }

  const sorted = [...progressList].sort((left, right) => {
    if (left.stats.plays !== right.stats.plays) {
      return left.stats.plays - right.stats.plays;
    }

    if (left.stats.wins !== right.stats.wins) {
      return left.stats.wins - right.stats.wins;
    }

    return left.label.localeCompare(right.label);
  });

  const preferred = sorted.find((game) => game.id !== currentGameId);
  return preferred?.id ?? currentGameId ?? "memory-match";
}

export function buildGameSessionSummary(profile, currentGameId = null) {
  const gameProgress = buildGameProgressList(profile);
  const totalPlays = gameProgress.reduce((sum, game) => sum + game.stats.plays, 0);
  const gamesTried = gameProgress.filter((game) => game.hasPlayed).length;
  const gamesWon = gameProgress.filter((game) => game.hasWon).length;
  const favoriteGame =
    [...gameProgress]
      .filter((game) => game.stats.plays > 0)
      .sort((left, right) => {
        if (left.stats.plays !== right.stats.plays) {
          return right.stats.plays - left.stats.plays;
        }
        return right.stats.wins - left.stats.wins;
      })[0] ?? null;

  const recommendedGameId = getRecommendedGameId(profile, currentGameId);
  const randomGameId = getRandomGameId({ excludeGameId: currentGameId });
  const nextMilestoneTarget = getNextWinMilestoneTarget(profile.totalWins);

  return {
    totalPlays,
    gamesTried,
    gamesWon,
    favoriteGame,
    gameProgress,
    recommendedGame:
      gameProgress.find((game) => game.id === recommendedGameId) ?? getGameDefinition(recommendedGameId),
    randomGame:
      gameProgress.find((game) => game.id === randomGameId) ?? getGameDefinition(randomGameId),
    nextMilestoneTarget,
    winsUntilMilestone: Math.max(0, nextMilestoneTarget - profile.totalWins),
    firstWinBonusBoxes: FIRST_WIN_BONUS_BOXES,
    milestoneBonusStars: WIN_MILESTONE_BONUS_STARS,
  };
}

export function summarizeWinOutcome(profile, gameId, nextProfile) {
  const wasFirstWin = !profile.firstWinGameIds.includes(gameId);
  const reachedMilestone = nextProfile.totalWins > 0 && nextProfile.totalWins % WIN_MILESTONE_STEP === 0;
  const boxesAwarded = 1 + (wasFirstWin ? FIRST_WIN_BONUS_BOXES : 0);

  return {
    boxesAwarded,
    firstWinBonusBoxes: wasFirstWin ? FIRST_WIN_BONUS_BOXES : 0,
    milestoneBonusStars: reachedMilestone ? WIN_MILESTONE_BONUS_STARS : 0,
    isFirstWin: wasFirstWin,
    reachedMilestone,
    currentStreak: nextProfile.currentStreak,
    bestStreak: nextProfile.bestStreak,
    totalWins: nextProfile.totalWins,
    nextMilestoneTarget: getNextWinMilestoneTarget(nextProfile.totalWins),
    gameLabel: GAME_CONFIG[gameId]?.label ?? gameId,
  };
}
