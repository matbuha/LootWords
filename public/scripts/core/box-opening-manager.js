import { BOX_TAP_COUNT, RARITY_ORDER } from "../data/config.js";
import { LOOT_BOX_BASE_RARITY_WEIGHTS, LOOT_BOX_UPGRADE_CHANCES } from "../data/loot.js";
import { applyLootReward, generateLootRewardForRarity, getAvailableLootRarityWeights } from "./loot-manager.js";
import { getParentSettings } from "./parent-mode.js";
import { pickWeightedRarity } from "./rarity.js";

function getNextAvailableRarity(currentRarity, availableRarityWeights) {
  const currentIndex = Math.max(0, RARITY_ORDER.indexOf(currentRarity));

  for (let index = currentIndex + 1; index < RARITY_ORDER.length; index += 1) {
    const rarity = RARITY_ORDER[index];
    if ((availableRarityWeights[rarity] ?? 0) > 0) {
      return rarity;
    }
  }

  return null;
}

function createOpeningSession(baseRarity) {
  return {
    baseRarity,
    currentRarity: baseRarity,
    stageClicks: 0,
    totalClicks: 0,
    stageTargetClicks: BOX_TAP_COUNT,
    upgraded: false,
    upgradeHistory: [],
    finalRarity: null,
    finalReward: null,
  };
}

function createBlockedReveal() {
  return {
    type: "blocked",
    titleKey: "emptyState.noActiveCardsTitle",
    detailKey: "reward.contentPausedHint",
  };
}

export function createEmptyBoxOpeningState() {
  return null;
}

export function beginBoxOpeningSession({ profile, cards, random = Math.random }) {
  if (profile.rewardBoxes <= 0) {
    return {
      status: "empty",
      opening: createEmptyBoxOpeningState(),
      reveal: null,
    };
  }

  if (!cards.length) {
    return {
      status: "blocked",
      opening: createEmptyBoxOpeningState(),
      reveal: createBlockedReveal(),
    };
  }

  const parentSettings = getParentSettings(profile);
  const availableRarityWeights = getAvailableLootRarityWeights({
    profile,
    cards,
    parentSettings,
    weightSource: LOOT_BOX_BASE_RARITY_WEIGHTS,
  });
  const baseRarity = pickWeightedRarity(availableRarityWeights, random());

  return {
    status: "started",
    opening: createOpeningSession(baseRarity),
    reveal: null,
  };
}

export function advanceBoxOpeningSession({
  profile,
  cards,
  opening,
  random = Math.random,
}) {
  if (!opening) {
    const started = beginBoxOpeningSession({ profile, cards, random });
    if (started.status !== "started") {
      return started;
    }

    return advanceBoxOpeningSession({
      profile,
      cards,
      opening: started.opening,
      random,
    });
  }

  const parentSettings = getParentSettings(profile);
  const stageClicks = opening.stageClicks + 1;
  const totalClicks = opening.totalClicks + 1;

  if (stageClicks < BOX_TAP_COUNT) {
    return {
      status: "progress",
      opening: {
        ...opening,
        stageClicks,
        totalClicks,
      },
      reveal: null,
    };
  }

  const availableRarityWeights = getAvailableLootRarityWeights({
    profile,
    cards,
    parentSettings,
    weightSource: LOOT_BOX_BASE_RARITY_WEIGHTS,
  });
  const upgradeTarget = getNextAvailableRarity(opening.currentRarity, availableRarityWeights);
  const upgradeChance = LOOT_BOX_UPGRADE_CHANCES[opening.currentRarity] ?? 0;
  const upgradeRolled = upgradeTarget ? random() * 10000 < upgradeChance : false;

  if (upgradeRolled && upgradeTarget) {
    return {
      status: "upgraded",
      opening: {
        ...opening,
        currentRarity: upgradeTarget,
        stageClicks: 0,
        totalClicks,
        upgraded: true,
        upgradeHistory: [
          ...opening.upgradeHistory,
          {
            from: opening.currentRarity,
            to: upgradeTarget,
            atTotalClicks: totalClicks,
          },
        ],
      },
      reveal: null,
    };
  }

  const baseProfile = {
    ...profile,
    rewardBoxes: profile.rewardBoxes - 1,
    rewardBoxesOpened: profile.rewardBoxesOpened + 1,
  };
  const reward = generateLootRewardForRarity({
    profile: baseProfile,
    cards,
    parentSettings,
    rarity: opening.currentRarity,
    random,
  });
  const applied = applyLootReward(baseProfile, reward);

  return {
    status: "resolved",
    opening: {
      ...opening,
      stageClicks: BOX_TAP_COUNT,
      totalClicks,
      finalRarity: opening.currentRarity,
      finalReward: applied.reward,
    },
    reward: applied.reward,
    profile: applied.profile,
    reveal: null,
  };
}
