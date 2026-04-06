import { createCardDefinition, assertValidCardLibrary } from "../core/card-utils.js";

function entry(word, icon, difficultyLevel, tags, extras = {}) {
  return {
    word,
    icon,
    difficultyLevel,
    tags,
    ...extras,
  };
}

function buildCategoryCards(category, entries) {
  return entries.map((definition, index) =>
    createCardDefinition(
      {
        ...definition,
        tags: [category, ...definition.tags],
      },
      category,
      index,
    ),
  );
}

const CARD_CONTENT = {
  animals: buildCategoryCards("animals", [
    entry("dog", "🐶", 1, ["pet", "starter"]),
    entry("cat", "🐱", 1, ["pet", "starter"]),
    entry("lion", "🦁", 1, ["wild", "big-cat"]),
    entry("rabbit", "🐰", 1, ["pet", "soft"]),
    entry("monkey", "🐵", 2, ["wild", "jungle"]),
    entry("elephant", "🐘", 2, ["wild", "giant"]),
    entry("turtle", "🐢", 2, ["shell", "slow"]),
    entry("panda", "🐼", 2, ["wild", "bear"]),
    entry("tiger", "🐯", 2, ["wild", "big-cat"]),
    entry("dolphin", "🐬", 2, ["ocean", "smart"]),
  ]),
  food: buildCategoryCards("food", [
    entry("banana", "🍌", 1, ["fruit", "starter"]),
    entry("pizza", "🍕", 1, ["meal", "favorite"]),
    entry("apple", "🍎", 1, ["fruit", "starter"]),
    entry("burger", "🍔", 1, ["meal", "fast-food"]),
    entry("carrot", "🥕", 1, ["vegetable", "orange"]),
    entry("donut", "🍩", 1, ["sweet", "snack"]),
    entry("cake", "🎂", 1, ["sweet", "party"]),
    entry("sandwich", "🥪", 1, ["meal", "lunch"]),
    entry("watermelon", "🍉", 2, ["fruit", "summer"]),
    entry("cookie", "🍪", 1, ["sweet", "snack"]),
  ]),
  vehicles: buildCategoryCards("vehicles", [
    entry("car", "🚗", 1, ["road", "starter"]),
    entry("bus", "🚌", 1, ["road", "big"]),
    entry("train", "🚆", 1, ["tracks", "travel"]),
    entry("rocket", "🚀", 3, ["space", "exciting"]),
    entry("bicycle", "🚲", 1, ["road", "ride"]),
    entry("airplane", "✈️", 2, ["sky", "travel"]),
    entry("boat", "🚤", 1, ["water", "travel"]),
    entry("submarine", "🚢", 3, ["water", "deep"]),
    entry("tractor", "🚜", 2, ["farm", "machine"]),
    entry("helicopter", "🚁", 2, ["sky", "rotor"]),
  ]),
  home: buildCategoryCards("home", [
    entry("chair", "🪑", 1, ["furniture", "starter"]),
    entry("lamp", "💡", 1, ["light", "starter"]),
    entry("bed", "🛏️", 1, ["furniture", "sleep"]),
    entry("clock", "⏰", 1, ["time", "room"]),
    entry("sofa", "🛋️", 1, ["furniture", "living-room"]),
    entry("mirror", "🪞", 1, ["glass", "room"]),
    entry("door", "🚪", 1, ["entry", "room"]),
    entry("window", "🪟", 1, ["glass", "room"]),
    entry("pillow", "🛏️", 1, ["sleep", "soft"]),
    entry("television", "📺", 2, ["screen", "living-room"]),
  ]),
  clothes: buildCategoryCards("clothes", [
    entry("hat", "👒", 1, ["wear", "starter"]),
    entry("shirt", "👕", 1, ["wear", "starter"]),
    entry("pants", "👖", 1, ["wear", "starter"]),
    entry("shoe", "👟", 1, ["wear", "starter"]),
    entry("dress", "👗", 1, ["wear", "party"]),
    entry("sock", "🧦", 1, ["wear", "small"]),
    entry("scarf", "🧣", 2, ["wear", "warm"]),
    entry("jacket", "🧥", 2, ["wear", "warm"]),
    entry("gloves", "🧤", 2, ["wear", "warm"]),
    entry("boots", "🥾", 2, ["wear", "outdoor"]),
  ]),
  nature: buildCategoryCards("nature", [
    entry("tree", "🌳", 1, ["outdoor", "starter"]),
    entry("flower", "🌸", 1, ["plant", "colorful"]),
    entry("cloud", "☁️", 1, ["sky", "weather"]),
    entry("sun", "☀️", 1, ["sky", "weather"]),
    entry("moon", "🌙", 1, ["sky", "night"]),
    entry("star", "⭐", 1, ["sky", "night"]),
    entry("rainbow", "🌈", 1, ["sky", "colorful"]),
    entry("leaf", "🍃", 1, ["plant", "green"]),
    entry("mountain", "⛰️", 2, ["land", "big"]),
    entry("shell", "🐚", 2, ["beach", "ocean"]),
  ]),
  toys: buildCategoryCards("toys", [
    entry("robot", "🤖", 1, ["toy", "cool"]),
    entry("teddy", "🧸", 1, ["toy", "soft"]),
    entry("ball", "⚽", 1, ["toy", "round"]),
    entry("kite", "🪁", 1, ["toy", "outdoor"]),
    entry("puzzle", "🧩", 2, ["toy", "thinking"]),
    entry("yo-yo", "🪀", 2, ["toy", "spin"]),
    entry("drum", "🥁", 2, ["toy", "music"]),
    entry("doll", "🪆", 1, ["toy", "play"]),
    entry("block", "🧱", 1, ["toy", "build"]),
    entry("puppet", "🎭", 2, ["toy", "show"]),
  ]),
  school: buildCategoryCards("school", [
    entry("book", "📘", 1, ["school", "starter"]),
    entry("pencil", "✏️", 1, ["school", "starter"]),
    entry("crayon", "🖍️", 1, ["school", "color"]),
    entry("ruler", "📏", 1, ["school", "measure"]),
    entry("backpack", "🎒", 1, ["school", "carry"]),
    entry("notebook", "📒", 1, ["school", "write"]),
    entry("scissors", "✂️", 2, ["school", "tool"]),
    entry("calculator", "🧮", 2, ["school", "numbers"]),
    entry("folder", "📁", 1, ["school", "paper"]),
    entry("marker", "🖊️", 1, ["school", "write"]),
  ]),
  kitchen: buildCategoryCards("kitchen", [
    entry("spoon", "🥄", 1, ["kitchen", "tool"]),
    entry("cup", "🥤", 1, ["kitchen", "drink"]),
    entry("plate", "🍽️", 1, ["kitchen", "eat"]),
    entry("pan", "🍳", 1, ["kitchen", "cook"]),
    entry("kettle", "🫖", 2, ["kitchen", "hot-drink"]),
    entry("bowl", "🥣", 1, ["kitchen", "eat"]),
    entry("bottle", "🍼", 1, ["kitchen", "drink"]),
    entry("fork", "🍴", 1, ["kitchen", "tool"]),
    entry("toaster", "🍞", 2, ["kitchen", "machine"]),
    entry("knife", "🔪", 2, ["kitchen", "tool"]),
  ]),
  fantasy: buildCategoryCards("fantasy", [
    entry("dragon", "🐉", 3, ["fantasy", "exciting"]),
    entry("castle", "🏰", 2, ["fantasy", "place"]),
    entry("wand", "🪄", 2, ["fantasy", "magic"]),
    entry("shield", "🛡️", 2, ["fantasy", "gear"]),
    entry("gem", "💎", 2, ["fantasy", "treasure"]),
    entry("potion", "🧪", 3, ["fantasy", "magic"]),
    entry("map", "🗺️", 1, ["fantasy", "quest"]),
    entry("monster", "👾", 3, ["fantasy", "creature"]),
    entry("treasure", "💰", 3, ["fantasy", "reward"]),
    entry("crown", "👑", 1, ["fantasy", "royal"]),
  ]),
  city: buildCategoryCards("city", [
    entry("bridge", "🌉", 2, ["city", "place"]),
    entry("tower", "🗼", 2, ["city", "place"]),
    entry("taxi", "🚕", 1, ["city", "vehicle"]),
    entry("mailbox", "📮", 1, ["city", "object"]),
    entry("fountain", "⛲", 2, ["city", "water"]),
    entry("statue", "🗽", 2, ["city", "landmark"]),
    entry("tunnel", "🚇", 2, ["city", "travel"]),
    entry("crosswalk", "🚸", 2, ["city", "road"]),
    entry("tram", "🚊", 2, ["city", "vehicle"]),
    entry("traffic light", "🚦", 2, ["city", "road"]),
  ]),
  bathroom: buildCategoryCards("bathroom", [
    entry("toothbrush", "🪥", 1, ["bathroom", "clean"]),
    entry("soap", "🧼", 1, ["bathroom", "clean"]),
    entry("towel", "🧺", 1, ["bathroom", "dry"]),
    entry("bathtub", "🛁", 1, ["bathroom", "wash"]),
    entry("shower", "🚿", 1, ["bathroom", "wash"]),
    entry("toilet", "🚽", 1, ["bathroom", "room"]),
    entry("sink", "🚰", 1, ["bathroom", "wash"]),
    entry("shampoo", "🧴", 2, ["bathroom", "hair"]),
    entry("comb", "🪮", 1, ["bathroom", "hair"]),
    entry("sponge", "🧽", 1, ["bathroom", "clean"]),
  ]),
  "people-jobs": buildCategoryCards("people-jobs", [
    entry("doctor", "🩺", 1, ["job", "helper"]),
    entry("firefighter", "🧑‍🚒", 2, ["job", "hero"]),
    entry("chef", "🧑‍🍳", 1, ["job", "food"]),
    entry("farmer", "🧑‍🌾", 1, ["job", "farm"]),
    entry("pilot", "🧑‍✈️", 2, ["job", "travel"]),
    entry("builder", "👷", 1, ["job", "tools"]),
    entry("artist", "🧑‍🎨", 1, ["job", "creative"]),
    entry("teacher", "🧑‍🏫", 1, ["job", "school"]),
    entry("astronaut", "🧑‍🚀", 3, ["job", "space"]),
    entry("detective", "🕵️", 2, ["job", "mystery"]),
  ]),
  sports: buildCategoryCards("sports", [
    entry("helmet", "⛑️", 1, ["sports", "gear"]),
    entry("bat", "🏏", 1, ["sports", "gear"]),
    entry("racket", "🎾", 1, ["sports", "gear"]),
    entry("trophy", "🏆", 1, ["sports", "reward"]),
    entry("medal", "🏅", 1, ["sports", "reward"]),
    entry("skateboard", "🛹", 2, ["sports", "ride"]),
    entry("surfboard", "🏄", 3, ["sports", "water"]),
    entry("goal", "🥅", 1, ["sports", "score"]),
    entry("jersey", "🎽", 1, ["sports", "wear"]),
    entry("sled", "🛷", 2, ["sports", "winter"]),
  ]),
};

export const CARD_LIBRARY = Object.values(CARD_CONTENT).flat();

assertValidCardLibrary(CARD_LIBRARY);

export function hydrateCards(profile) {
  const unlockedSet = new Set(profile.unlockedCardIds);

  return CARD_LIBRARY.map((card) => {
    const points = profile.pointsByCardId[card.id];

    return {
      ...card,
      points,
      rarity: card.baseRarity,
      unlocked: unlockedSet.has(card.id),
      discoveredAt: profile.discoveredAtByCardId[card.id] ?? null,
    };
  });
}

export function getCardById(cards, cardId) {
  return cards.find((card) => card.id === cardId) ?? null;
}
