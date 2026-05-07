import { FALLBACK_STARS, RARITY_ORDER } from "../data/config.js";
import {
  createEmptyLootInventory,
  getRewardCatalog,
  getRewardCatalogItem,
  getRewardInventoryKey,
  LOOT_TYPE_WEIGHTS_BY_RARITY,
  REWARD_TYPE_META,
} from "../data/loot.js";
import {
  getCoinRewardAmount,
  getDuplicateConversionAmount,
  getRewardTypeWeights,
  getBoxBaseRarityWeights,
} from "../data/reward-balance.js";
import { pickWeightedRarity } from "./rarity.js";

function uniqueList(items) {
  return Array.from(new Set(items));
}

function weightedPick(weightMap, random = Math.random) {
  const entries = Object.entries(weightMap).filter(([, weight]) => weight > 0);
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);

  if (!totalWeight) {
    return null;
  }

  let cursor = random() * totalWeight;
  for (const [id, weight] of entries) {
    cursor -= weight;
    if (cursor < 0) {
      return id;
    }
  }

  return entries[entries.length - 1]?.[0] ?? null;
}

function pickRandom(items, random = Math.random) {
  if (!items.length) {
    return null;
  }

  return items[Math.floor(random() * items.length)] ?? null;
}

function buildCardCandidates(cards) {
  return cards
    .filter((card) => !card.unlocked)
    .map((card) => ({
      type: "card",
      rarity: card.rarity,
      itemId: card.id,
      cardId: card.id,
      card,
    }));
}

function buildDuplicateCandidates(cards, parentSettings) {
  if (!parentSettings.rewards.duplicateRewardsEnabled) {
    return [];
  }

  return cards
    .filter((card) => card.unlocked)
    .map((card) => ({
      type: "duplicate",
      rarity: card.rarity,
      itemId: card.id,
      cardId: card.id,
      card,
    }));
}

function buildCoinsCandidates({ allowAccountInventoryRewards = true } = {}) {
  if (!allowAccountInventoryRewards) {
    return [];
  }

  return Object.keys(getBoxBaseRarityWeights()).map((rarity) => ({
    type: "coins",
    rarity,
    itemId: `${rarity}-coins`,
    amount: getCoinRewardAmount(rarity),
  }));
}

function buildInventoryCandidates(profile, { allowAccountInventoryRewards = true } = {}) {
  if (!allowAccountInventoryRewards) {
    return [];
  }

  const inventory = profile.inventory ?? createEmptyLootInventory();

  return Object.keys(REWARD_TYPE_META)
    .filter((type) => REWARD_TYPE_META[type].ownable && REWARD_TYPE_META[type].lootEnabled)
    .flatMap((type) => {
      const inventoryKey = getRewardInventoryKey(type);
      const ownedItems = new Set(inventory[inventoryKey] ?? []);

      return getRewardCatalog(type)
        .filter((item) => !item.defaultOwned && !ownedItems.has(item.id))
        .map((item) => ({
          type,
          rarity: item.rarity,
          itemId: item.id,
          itemName: item.name ?? item.label,
          itemLabel: item.label,
          itemIcon: item.icon ?? null,
        }));
    });
}

function buildCandidates({ profile, cards, parentSettings, allowAccountInventoryRewards = true }) {
  return [
    ...buildCardCandidates(cards),
    ...buildCoinsCandidates({ allowAccountInventoryRewards }),
    ...buildInventoryCandidates(profile, { allowAccountInventoryRewards }),
    ...buildDuplicateCandidates(cards, parentSettings),
  ];
}

function createAvailableRarityWeights(candidates, weightSource = getBoxBaseRarityWeights()) {
  return RARITY_ORDER.reduce((weights, rarity) => {
    if (candidates.some((candidate) => candidate.rarity === rarity)) {
      weights[rarity] = weightSource[rarity] ?? 0;
    }
    return weights;
  }, {});
}

function getTypeWeightsForRarity(rarity, candidates) {
  const availableTypes = new Set(candidates.filter((candidate) => candidate.rarity === rarity).map((candidate) => candidate.type));
  const configuredWeights = getRewardTypeWeights(rarity);

  return Object.entries(configuredWeights).reduce((weights, [type, value]) => {
    if (availableTypes.has(type)) {
      weights[type] = value;
    }
    return weights;
  }, {});
}

function createGenericReward(candidate) {
  const typeMeta = REWARD_TYPE_META[candidate.type];
  return {
    type: candidate.type,
    rewardType: candidate.type,
    rarity: candidate.rarity,
    itemId: candidate.itemId,
    itemName: candidate.itemName,
    itemLabel: candidate.itemLabel,
    itemIcon: candidate.itemIcon ?? null,
    typeLabelKey: typeMeta?.labelKey ?? "reward.rewardNote",
  };
}

function createStickerDuplicateReward(reward, catalogItem) {
  const amount = getDuplicateConversionAmount("sticker", reward.rarity);

  return {
    type: "sticker-duplicate",
    rewardType: "sticker",
    rarity: reward.rarity,
    itemId: reward.itemId,
    itemName: reward.itemName ?? catalogItem?.name ?? catalogItem?.label ?? reward.itemId,
    itemLabel: reward.itemLabel ?? catalogItem?.label ?? reward.itemId,
    itemIcon: reward.itemIcon ?? catalogItem?.icon ?? null,
    amount,
    typeLabelKey: "reward.types.sticker",
  };
}

function createOwnableDuplicateCoinReward(reward, catalogItem, amount) {
  return {
    type: `${reward.type}-duplicate`,
    rewardType: reward.type,
    rarity: reward.rarity,
    itemId: reward.itemId,
    itemName: reward.itemName ?? catalogItem?.name ?? catalogItem?.label ?? reward.itemId,
    itemLabel: reward.itemLabel ?? catalogItem?.label ?? reward.itemId,
    itemIcon: reward.itemIcon ?? catalogItem?.icon ?? null,
    amount,
    typeLabelKey: REWARD_TYPE_META[reward.type]?.labelKey ?? "reward.rewardNote",
  };
}

function getDuplicateCoinAmount(type, rarity) {
  return getDuplicateConversionAmount(type, rarity);
}

function getAutoEquipFieldForType(type) {
  if (type === "profile-avatar") {
    return "selectedProfileAvatarId";
  }

  if (type === "profile-background") {
    return "selectedProfileBackgroundId";
  }

  if (type === "cursor-skin") {
    return "selectedCursorSkinId";
  }

  if (type === "ui-theme-pack") {
    return "selectedUiThemePackId";
  }

  return null;
}

function createFallbackReward(parentSettings) {
  if (parentSettings.rewards.fallbackRewardType === "message") {
    return {
      type: "message",
      titleKey: "reward.allCardsCollected",
      detailKey: "reward.allActiveCollectedDetail",
    };
  }

  return {
    type: "stars",
    amount: parentSettings.rewards.fallbackStars ?? FALLBACK_STARS,
  };
}

export function generateLootReward({
  profile,
  cards,
  parentSettings,
  random = Math.random,
  allowAccountInventoryRewards = true,
}) {
  const candidates = buildCandidates({ profile, cards, parentSettings, allowAccountInventoryRewards });
  if (!candidates.length) {
    return createFallbackReward(parentSettings);
  }

  const rarity = pickWeightedRarity(createAvailableRarityWeights(candidates), random());
  return generateLootRewardForRarity({
    profile,
    cards,
    parentSettings,
    rarity,
    random,
  });
}

export function getAvailableLootRarityWeights({
  profile,
  cards,
  parentSettings,
  weightSource = getBoxBaseRarityWeights(),
  allowAccountInventoryRewards = true,
}) {
  const candidates = buildCandidates({ profile, cards, parentSettings, allowAccountInventoryRewards });
  return createAvailableRarityWeights(candidates, weightSource);
}

export function generateLootRewardForRarity({
  profile,
  cards,
  parentSettings,
  rarity,
  random = Math.random,
  allowAccountInventoryRewards = true,
}) {
  const candidates = buildCandidates({ profile, cards, parentSettings, allowAccountInventoryRewards });
  if (!candidates.length) {
    return createFallbackReward(parentSettings);
  }

  const rarityCandidates = candidates.filter((candidate) => candidate.rarity === rarity);
  if (!rarityCandidates.length) {
    return createFallbackReward(parentSettings);
  }

  const rewardType = weightedPick(getTypeWeightsForRarity(rarity, rarityCandidates), random);
  const pickedCandidate = pickRandom(
    rarityCandidates.filter((candidate) => candidate.type === rewardType),
    random,
  );

  if (!pickedCandidate) {
    return createFallbackReward(parentSettings);
  }

  if (pickedCandidate.type === "card") {
    return {
      type: "card",
      rewardType: "card",
      rarity,
      cardId: pickedCandidate.cardId,
    };
  }

  if (pickedCandidate.type === "duplicate") {
    return {
      type: "duplicate",
      rewardType: "card",
      rarity,
      cardId: pickedCandidate.cardId,
      amount: parentSettings.rewards.duplicateRewardStars,
    };
  }

  if (pickedCandidate.type === "coins") {
    return {
      ...createGenericReward(pickedCandidate),
      amount: pickedCandidate.amount,
    };
  }

  return createGenericReward(pickedCandidate);
}

export function applyLootReward(profile, reward) {
  const nextProfile = {
    ...profile,
    inventory: profile.inventory ?? createEmptyLootInventory(),
  };

  if (reward.type === "card") {
    const discoveredAt = new Date().toISOString();
    return {
      profile: {
        ...nextProfile,
        unlockedCardIds: uniqueList([...nextProfile.unlockedCardIds, reward.cardId]),
        discoveredAtByCardId: {
          ...nextProfile.discoveredAtByCardId,
          [reward.cardId]: discoveredAt,
        },
      },
      reward: {
        ...reward,
        discoveredAt,
      },
    };
  }

  if (reward.type === "duplicate") {
    return {
      profile: {
        ...nextProfile,
        bonusStars: nextProfile.bonusStars + reward.amount,
      },
      reward,
    };
  }

  if (reward.type === "stars") {
    return {
      profile: {
        ...nextProfile,
        bonusStars: nextProfile.bonusStars + reward.amount,
      },
      reward,
    };
  }

  if (reward.type === "coins") {
    return {
      profile: {
        ...nextProfile,
        coins: nextProfile.coins + reward.amount,
      },
      reward,
    };
  }

  const inventoryKey = getRewardInventoryKey(reward.type);
  if (!inventoryKey) {
    return {
      profile: nextProfile,
      reward,
    };
  }

  const item = getRewardCatalogItem(reward.type, reward.itemId);
  const existingItems = nextProfile.inventory[inventoryKey] ?? [];
  const alreadyOwned = existingItems.includes(reward.itemId);

  if (alreadyOwned) {
    const duplicateAmount = getDuplicateCoinAmount(reward.type, reward.rarity);
    if (duplicateAmount !== null) {
      const duplicateReward =
        reward.type === "sticker"
          ? createStickerDuplicateReward(reward, item)
          : createOwnableDuplicateCoinReward(reward, item, duplicateAmount);

      return {
        profile: {
          ...nextProfile,
          coins: nextProfile.coins + duplicateReward.amount,
        },
        reward: duplicateReward,
      };
    }
  }

  const nextItems = uniqueList([...existingItems, reward.itemId]);
  const autoEquipField = getAutoEquipFieldForType(reward.type);
  const nextEquippedValue =
    autoEquipField && (!nextProfile[autoEquipField] || nextProfile[autoEquipField] === "default")
      ? reward.itemId
      : nextProfile[autoEquipField];
  const profileUpdates = autoEquipField
    ? { [autoEquipField]: nextEquippedValue }
    : {};

  return {
    profile: {
      ...nextProfile,
      ...profileUpdates,
      inventory: {
        ...nextProfile.inventory,
        [inventoryKey]: nextItems,
      },
    },
    reward: {
      ...reward,
      itemName: reward.itemName ?? item?.name ?? item?.label ?? reward.itemId,
      itemLabel: reward.itemLabel ?? item?.label ?? reward.itemId,
      itemIcon: reward.itemIcon ?? item?.icon ?? null,
    },
  };
}
