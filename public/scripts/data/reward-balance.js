import { RARITY_ORDER } from "./config.js";

const REWARD_TYPE_WEIGHTS = Object.freeze({
  common: Object.freeze({
    card: 94,
    coins: 6,
  }),
  uncommon: Object.freeze({
    card: 84,
    coins: 10,
    sticker: 6,
  }),
  rare: Object.freeze({
    card: 72,
    coins: 12,
    sticker: 7,
    "profile-avatar": 5,
    "cursor-skin": 4,
  }),
  mythic: Object.freeze({
    card: 42,
    coins: 10,
    sticker: 8,
    "profile-avatar": 10,
    "cursor-skin": 10,
    "profile-background": 10,
    "ui-theme-pack": 10,
  }),
  epic: Object.freeze({
    card: 48,
    coins: 12,
    sticker: 8,
    "profile-avatar": 8,
    "cursor-skin": 8,
    "profile-background": 8,
    "ui-theme-pack": 8,
  }),
  legend: Object.freeze({
    card: 32,
    coins: 8,
    sticker: 8,
    "profile-avatar": 14,
    "cursor-skin": 14,
    "profile-background": 12,
    "ui-theme-pack": 12,
  }),
});

const REWARD_BALANCE = Object.freeze({
  rarityWeights: Object.freeze({
    common: 9000,
    uncommon: 850,
    rare: 125,
    mythic: 18,
    epic: 6,
    legend: 1,
  }),
  boxBaseRarityWeights: Object.freeze({
    common: 9000,
    uncommon: 850,
    rare: 125,
    mythic: 18,
    epic: 6,
    legend: 1,
  }),
  boxUpgradeChances: Object.freeze({
    common: 620,
    uncommon: 140,
    rare: 28,
    mythic: 6,
    epic: 1,
    legend: 0,
  }),
  coinRewardAmounts: Object.freeze({
    common: 20,
    uncommon: 40,
    rare: 75,
    mythic: 130,
    epic: 200,
    legend: 360,
  }),
  stickerDuplicateCoinAmounts: Object.freeze({
    common: 8,
    uncommon: 16,
    rare: 32,
    mythic: 55,
    epic: 90,
    legend: 150,
  }),
  profileCosmeticDuplicateCoinAmounts: Object.freeze({
    common: 10,
    uncommon: 20,
    rare: 45,
    mythic: 80,
    epic: 125,
    legend: 220,
  }),
  rewardTypeWeights: REWARD_TYPE_WEIGHTS,
});

function cloneFrozenObject(source) {
  return Object.freeze({ ...source });
}

export function getRewardBalance() {
  return REWARD_BALANCE;
}

export function getCoinRewardAmount(rarity) {
  return REWARD_BALANCE.coinRewardAmounts[rarity] ?? REWARD_BALANCE.coinRewardAmounts.common;
}

export function getDuplicateConversionAmount(rewardType, rarity) {
  if (rewardType === "sticker") {
    return REWARD_BALANCE.stickerDuplicateCoinAmounts[rarity] ?? REWARD_BALANCE.stickerDuplicateCoinAmounts.common;
  }

  if (rewardType === "profile-avatar" || rewardType === "profile-background" || rewardType === "cursor-skin" || rewardType === "ui-theme-pack") {
    return REWARD_BALANCE.profileCosmeticDuplicateCoinAmounts[rarity] ?? REWARD_BALANCE.profileCosmeticDuplicateCoinAmounts.common;
  }

  return null;
}

export function getRewardTypeWeights(rarity) {
  return cloneFrozenObject(REWARD_BALANCE.rewardTypeWeights[rarity] ?? {});
}

function applyEarlyGameGuard(weights, context = {}) {
  const opened = Math.max(0, Number.parseInt(context.rewardBoxesOpened, 10) || 0);
  const nextWeights = { ...weights };

  if (opened < 5) {
    delete nextWeights.legend;
    delete nextWeights.epic;
    nextWeights.mythic = Math.max(1, Math.floor((nextWeights.mythic ?? 0) * 0.2));
  } else if (opened < 12) {
    delete nextWeights.legend;
  } else if (opened < 25) {
    delete nextWeights.legend;
  }

  return nextWeights;
}

export function getBoxBaseRarityWeights(context = {}) {
  return applyEarlyGameGuard(REWARD_BALANCE.boxBaseRarityWeights, context);
}

export function getBoxUpgradeChance(fromRarity, context = {}) {
  const opened = Math.max(0, Number.parseInt(context.rewardBoxesOpened, 10) || 0);
  const baseChance = REWARD_BALANCE.boxUpgradeChances[fromRarity] ?? 0;

  if (opened < 5 && (fromRarity === "rare" || fromRarity === "mythic" || fromRarity === "epic" || fromRarity === "legend")) {
    return 0;
  }

  if (opened < 12 && fromRarity === "epic") {
    return 0;
  }

  return baseChance;
}

export { RARITY_ORDER as REWARD_RARITY_ORDER };
