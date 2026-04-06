import { CATEGORY_META, CATEGORY_ORDER, PACK_META } from "../data/categories.js";
import { getCardBaseRarity, getRarityIndex } from "./rarity.js";

const DISALLOWED_WORDS = new Set([
  "freedom",
  "idea",
  "happiness",
  "noun",
  "justice",
  "quickly",
  "beautiful",
  "under",
  "because",
]);

function getDiscoveredTime(card) {
  return card.discoveredAt ? new Date(card.discoveredAt).getTime() : 0;
}

function rarityIndex(rarity) {
  return getRarityIndex(rarity);
}

export function slugifyWord(word) {
  return String(word)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createCardDefinition(definition, category, index) {
  const id = definition.id ?? slugifyWord(definition.word);

  return {
    id,
    word: definition.word,
    category,
    packId: definition.packId ?? CATEGORY_META[category]?.packId ?? "starter-world",
    icon: definition.icon,
    image: definition.image ?? `assets/images/cards/${id}.png`,
    imageMode: definition.imageMode ?? "placeholder-icon",
    difficultyLevel: definition.difficultyLevel ?? 1,
    tags: Array.from(new Set(definition.tags ?? [])),
    sortOrder: definition.sortOrder ?? index + 1,
    baseRarity: getCardBaseRarity({
      id,
      word: definition.word,
      difficultyLevel: definition.difficultyLevel ?? 1,
      baseRarity: definition.baseRarity,
    }),
  };
}

export function sortCards(cards, sortId = "points-desc") {
  const sorted = [...cards];

  switch (sortId) {
    case "points-asc":
      sorted.sort((left, right) => left.points - right.points || left.word.localeCompare(right.word));
      break;
    case "alphabetical":
      sorted.sort((left, right) => left.word.localeCompare(right.word));
      break;
    case "newest":
      sorted.sort((left, right) => getDiscoveredTime(right) - getDiscoveredTime(left) || right.points - left.points);
      break;
    case "rarity":
      sorted.sort(
        (left, right) =>
          rarityIndex(right.rarity) - rarityIndex(left.rarity) ||
          right.points - left.points ||
          left.word.localeCompare(right.word),
      );
      break;
    case "category":
      sorted.sort(
        (left, right) =>
          CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category) ||
          left.sortOrder - right.sortOrder ||
          left.word.localeCompare(right.word),
      );
      break;
    case "difficulty":
      sorted.sort(
        (left, right) =>
          left.difficultyLevel - right.difficultyLevel ||
          left.sortOrder - right.sortOrder ||
          left.word.localeCompare(right.word),
      );
      break;
    case "points-desc":
    default:
      sorted.sort((left, right) => right.points - left.points || left.word.localeCompare(right.word));
      break;
  }

  return sorted;
}

export function buildCategorySections(cards, sortId = "points-desc") {
  const sorted = sortCards(cards, sortId);

  return CATEGORY_ORDER.map((categoryId) => {
    const sectionCards = sorted.filter((card) => card.category === categoryId);

    return {
      id: categoryId,
      meta: CATEGORY_META[categoryId],
      cards: sectionCards,
    };
  }).filter((section) => section.cards.length > 0);
}

export function validateCardLibrary(cards) {
  const errors = [];
  const idSet = new Set();

  for (const card of cards) {
    if (!card.id || idSet.has(card.id)) {
      errors.push(`Duplicate or missing card id: ${card.id || "(missing id)"}`);
    } else {
      idSet.add(card.id);
    }

    if (!card.word || typeof card.word !== "string") {
      errors.push(`Invalid word for card id ${card.id}`);
    }

    if (DISALLOWED_WORDS.has(card.word)) {
      errors.push(`Disallowed non-visual word detected: ${card.word}`);
    }

    if (!CATEGORY_META[card.category]) {
      errors.push(`Unknown category "${card.category}" on card ${card.id}`);
    }

    if (!PACK_META[card.packId]) {
      errors.push(`Unknown pack "${card.packId}" on card ${card.id}`);
    }

    if (!card.image || typeof card.image !== "string") {
      errors.push(`Missing image path on card ${card.id}`);
    }

    if (!card.icon || typeof card.icon !== "string") {
      errors.push(`Missing placeholder icon on card ${card.id}`);
    }

    if (!Number.isInteger(card.difficultyLevel) || card.difficultyLevel < 1 || card.difficultyLevel > 3) {
      errors.push(`Invalid difficulty level on card ${card.id}`);
    }

    if (!Array.isArray(card.tags) || card.tags.length === 0) {
      errors.push(`Missing tags on card ${card.id}`);
    }

    if (!Number.isInteger(card.sortOrder) || card.sortOrder <= 0) {
      errors.push(`Invalid sort order on card ${card.id}`);
    }

    if (!card.baseRarity) {
      errors.push(`Missing base rarity on card ${card.id}`);
    }
  }

  return errors;
}

export function assertValidCardLibrary(cards) {
  const errors = validateCardLibrary(cards);

  if (errors.length > 0) {
    throw new Error(`LootWords card library validation failed:\n- ${errors.join("\n- ")}`);
  }
}
