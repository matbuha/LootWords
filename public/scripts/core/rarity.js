import { RARITY_META, RARITY_ORDER } from "../data/config.js";

const CARD_RARITY_DISTRIBUTION = Object.freeze({
  1: Object.freeze({
    common: 52,
    uncommon: 31,
    rare: 13,
    epic: 3,
    mythic: 1,
  }),
  2: Object.freeze({
    common: 14,
    uncommon: 36,
    rare: 32,
    epic: 12,
    mythic: 5,
    legend: 1,
  }),
  3: Object.freeze({
    uncommon: 16,
    rare: 38,
    epic: 26,
    mythic: 14,
    legend: 6,
  }),
});

function hashString(value) {
  return [...String(value)].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 17);
}

export function normalizeRarity(rarity) {
  return RARITY_META[rarity] ? rarity : "common";
}

export function getRarityLabel(rarity) {
  return RARITY_META[normalizeRarity(rarity)]?.label ?? "Common";
}

export function getRarityIndex(rarity) {
  const index = RARITY_ORDER.indexOf(normalizeRarity(rarity));
  return index === -1 ? 0 : index;
}

export function compareRarities(left, right) {
  return getRarityIndex(left) - getRarityIndex(right);
}

function pickFromDistribution(distribution, seedValue) {
  const entries = Object.entries(distribution).filter(([, weight]) => weight > 0);
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  const roll = seedValue % totalWeight;

  let cursor = 0;
  for (const [rarity, weight] of entries) {
    cursor += weight;
    if (roll < cursor) {
      return rarity;
    }
  }

  return entries[0]?.[0] ?? "common";
}

export function getCardBaseRarity(card) {
  if (card?.baseRarity && RARITY_META[card.baseRarity]) {
    return card.baseRarity;
  }

  const difficultyLevel = Math.max(1, Math.min(3, Number.parseInt(card?.difficultyLevel, 10) || 1));
  const distribution = CARD_RARITY_DISTRIBUTION[difficultyLevel] ?? CARD_RARITY_DISTRIBUTION[1];
  const seed = hashString(`${card?.id ?? card?.word ?? "card"}:${difficultyLevel}`);
  return pickFromDistribution(distribution, seed);
}

export function getRarityPointRange(rarity) {
  const points = RARITY_META[normalizeRarity(rarity)]?.points ?? RARITY_META.common.points;
  return {
    min: points.min,
    max: points.max,
  };
}

export function createRarityBoundPoints(card, seedValue = null) {
  const rarity = getCardBaseRarity(card);
  const { min, max } = getRarityPointRange(rarity);
  const span = Math.max(0, max - min);
  const seed = seedValue ?? hashString(`${card?.id ?? card?.word ?? "card"}:points`);

  return min + (span === 0 ? 0 : seed % (span + 1));
}

export function pickWeightedRarity(weightMap, randomValue = Math.random()) {
  const entries = RARITY_ORDER.map((rarity) => [rarity, Math.max(0, weightMap?.[rarity] ?? 0)]).filter(
    ([, weight]) => weight > 0,
  );
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);

  if (!totalWeight) {
    return "common";
  }

  let cursor = randomValue * totalWeight;
  for (const [rarity, weight] of entries) {
    cursor -= weight;
    if (cursor < 0) {
      return rarity;
    }
  }

  return entries[entries.length - 1]?.[0] ?? "common";
}
