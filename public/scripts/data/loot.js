export const REWARD_TYPE_META = Object.freeze({
  card: {
    labelKey: "reward.types.card",
    inventoryKey: null,
    ownable: false,
    lootEnabled: true,
  },
  coins: {
    labelKey: "reward.types.coins",
    inventoryKey: null,
    ownable: false,
    lootEnabled: true,
  },
  sticker: {
    labelKey: "reward.types.sticker",
    inventoryKey: "stickers",
    ownable: true,
    lootEnabled: true,
  },
  "cursor-skin": {
    labelKey: "reward.types.cursorSkin",
    inventoryKey: "cursorSkins",
    ownable: true,
    lootEnabled: false,
  },
  "ui-theme-pack": {
    labelKey: "reward.types.uiThemePack",
    inventoryKey: "uiThemePacks",
    ownable: true,
    lootEnabled: false,
  },
  "profile-background": {
    labelKey: "reward.types.profileBackground",
    inventoryKey: "profileBackgrounds",
    ownable: true,
    lootEnabled: true,
  },
  "profile-avatar": {
    labelKey: "reward.types.profileAvatar",
    inventoryKey: "profileAvatars",
    ownable: true,
    lootEnabled: true,
  },
});

export const LOOT_RARITY_WEIGHTS = Object.freeze({
  common: 7200,
  uncommon: 1800,
  rare: 700,
  mythic: 120,
  epic: 150,
  legend: 30,
});

export const LOOT_BOX_BASE_RARITY_WEIGHTS = Object.freeze({
  common: 7800,
  uncommon: 1700,
  rare: 420,
  mythic: 60,
  epic: 18,
  legend: 2,
});

export const LOOT_BOX_UPGRADE_CHANCES = Object.freeze({
  common: 1500,
  uncommon: 550,
  rare: 110,
  mythic: 24,
  epic: 4,
  legend: 0,
});

export const LOOT_TYPE_WEIGHTS_BY_RARITY = Object.freeze({
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
    card: 70,
    coins: 12,
    sticker: 8,
    "profile-avatar": 6,
    "cursor-skin": 4,
  }),
  mythic: Object.freeze({
    card: 38,
    coins: 10,
    sticker: 8,
    "profile-avatar": 12,
    "cursor-skin": 12,
    "profile-background": 10,
    "ui-theme-pack": 10,
  }),
  epic: Object.freeze({
    card: 50,
    coins: 12,
    sticker: 10,
    "profile-avatar": 8,
    "cursor-skin": 8,
    "profile-background": 6,
    "ui-theme-pack": 6,
  }),
  legend: Object.freeze({
    card: 24,
    coins: 8,
    sticker: 8,
    "profile-avatar": 16,
    "cursor-skin": 16,
    "profile-background": 14,
    "ui-theme-pack": 14,
  }),
});

export const COIN_REWARD_AMOUNTS = Object.freeze({
  common: 25,
  uncommon: 50,
  rare: 90,
  mythic: 160,
  epic: 260,
  legend: 500,
});

export const STICKER_DUPLICATE_COIN_AMOUNTS = Object.freeze({
  common: 15,
  uncommon: 28,
  rare: 55,
  mythic: 95,
  epic: 150,
  legend: 260,
});

export const PROFILE_COSMETIC_DUPLICATE_COIN_AMOUNTS = Object.freeze({
  common: 20,
  uncommon: 35,
  rare: 80,
  mythic: 140,
  epic: 220,
  legend: 380,
});

const RAW_REWARD_ITEM_LIBRARY = Object.freeze({
  sticker: Object.freeze([
    {
      id: "sunny-star",
      name: "Sunny Star",
      label: "Sunny Star",
      rarity: "common",
      icon: "⭐",
    },
    {
      id: "happy-rainbow",
      name: "Happy Rainbow",
      label: "Happy Rainbow",
      rarity: "uncommon",
      icon: "🌈",
    },
    {
      id: "rocket-buddy",
      name: "Rocket Buddy",
      label: "Rocket Buddy",
      rarity: "rare",
      icon: "🚀",
    },
    {
      id: "treasure-crown",
      name: "Treasure Crown",
      label: "Treasure Crown",
      rarity: "mythic",
      icon: "👑",
    },
    {
      id: "sun-spark",
      name: "Sun Spark",
      label: "Sun Spark",
      rarity: "epic",
      icon: "🌞",
    },
    {
      id: "legend-dragon",
      name: "Legend Dragon",
      label: "Legend Dragon",
      rarity: "legend",
      icon: "🐉",
    },
  ]),
  "cursor-skin": Object.freeze([
    { id: "glossy-comet", label: "Glossy Comet", rarity: "rare" },
    { id: "sun-burst", label: "Sun Burst", rarity: "epic" },
    { id: "ember-tail", label: "Ember Tail", rarity: "mythic" },
    { id: "crown-aura", label: "Crown Aura", rarity: "legend" },
  ]),
  "ui-theme-pack": Object.freeze([
    { id: "sunny-starter", label: "Sunny Starter", rarity: "epic" },
    { id: "midnight-arcade", label: "Midnight Arcade", rarity: "mythic" },
    { id: "royal-nebula", label: "Royal Nebula", rarity: "legend" },
  ]),
  "profile-background": Object.freeze([
    {
      id: "jungle-morning",
      type: "profile-background",
      name: "Jungle Morning",
      label: "Jungle Morning",
      rarity: "rare",
      icon: "🌿",
    },
    {
      id: "sky-lanterns",
      type: "profile-background",
      name: "Sky Lanterns",
      label: "Sky Lanterns",
      rarity: "epic",
      icon: "🏮",
    },
    {
      id: "crimson-comets",
      type: "profile-background",
      name: "Crimson Comets",
      label: "Crimson Comets",
      rarity: "mythic",
      icon: "☄️",
    },
    {
      id: "violet-vault",
      type: "profile-background",
      name: "Violet Vault",
      label: "Violet Vault",
      rarity: "legend",
      icon: "💜",
    },
  ]),
  "profile-avatar": Object.freeze([
    {
      id: "lion-badge",
      type: "profile-avatar",
      name: "Lion Badge",
      label: "Lion Badge",
      rarity: "rare",
      icon: "🦁",
    },
    {
      id: "rocket-badge",
      type: "profile-avatar",
      name: "Rocket Badge",
      label: "Rocket Badge",
      rarity: "epic",
      icon: "🚀",
    },
    {
      id: "phoenix-badge",
      type: "profile-avatar",
      name: "Phoenix Badge",
      label: "Phoenix Badge",
      rarity: "mythic",
      icon: "🔥",
    },
    {
      id: "crown-badge",
      type: "profile-avatar",
      name: "Crown Badge",
      label: "Crown Badge",
      rarity: "legend",
      icon: "👑",
    },
  ]),
});

export function createEmptyLootInventory() {
  return {
    stickers: [],
    cursorSkins: [],
    uiThemePacks: [],
    profileBackgrounds: [],
    profileAvatars: [],
  };
}

export function getRewardTypeMeta(type) {
  return REWARD_TYPE_META[type] ?? null;
}

export function getRewardInventoryKey(type) {
  return REWARD_TYPE_META[type]?.inventoryKey ?? null;
}

export function getRewardCatalog(type) {
  return RAW_REWARD_ITEM_LIBRARY[type] ?? [];
}

export function getRewardCatalogItem(type, itemId) {
  return getRewardCatalog(type).find((entry) => entry.id === itemId) ?? null;
}

export function getKnownInventoryIds(type) {
  return new Set(getRewardCatalog(type).map((entry) => entry.id));
}
