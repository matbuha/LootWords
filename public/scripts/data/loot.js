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
    lootEnabled: true,
  },
  "ui-theme-pack": {
    labelKey: "reward.types.uiThemePack",
    inventoryKey: "uiThemePacks",
    ownable: true,
    lootEnabled: true,
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
    {
      id: "glossy-comet",
      type: "cursor-skin",
      name: "Glossy Comet",
      label: "Glossy Comet",
      rarity: "rare",
      icon: "☄️",
      cursorAsset: "generated-arrow",
      cursorAccent: "#77d5ff",
      cursorStroke: "#0f2d4f",
    },
    {
      id: "sun-burst",
      type: "cursor-skin",
      name: "Sun Burst",
      label: "Sun Burst",
      rarity: "epic",
      icon: "☀️",
      cursorAsset: "generated-arrow",
      cursorAccent: "#ffd65f",
      cursorStroke: "#5a2f05",
    },
    {
      id: "ember-tail",
      type: "cursor-skin",
      name: "Ember Tail",
      label: "Ember Tail",
      rarity: "mythic",
      icon: "🔥",
      cursorAsset: "generated-arrow",
      cursorAccent: "#ff6a54",
      cursorStroke: "#5e1321",
    },
    {
      id: "crown-aura",
      type: "cursor-skin",
      name: "Crown Aura",
      label: "Crown Aura",
      rarity: "legend",
      icon: "👑",
      cursorAsset: "generated-arrow",
      cursorAccent: "#bf8dff",
      cursorStroke: "#3f166f",
    },
  ]),
  "ui-theme-pack": Object.freeze([
    {
      id: "default",
      type: "ui-theme-pack",
      name: "Default",
      label: "Default",
      rarity: "common",
      icon: "✨",
      preview: "Glow",
      defaultOwned: true,
      themeTokens: Object.freeze({}),
    },
    {
      id: "jungle",
      type: "ui-theme-pack",
      name: "Jungle",
      label: "Jungle",
      rarity: "epic",
      icon: "🌿",
      preview: "Canopy",
      themeTokens: Object.freeze({
        "--bg-0": "#091611",
        "--bg-1": "#123526",
        "--bg-2": "#1d5a3f",
        "--panel": "rgba(18, 45, 33, 0.9)",
        "--panel-strong": "rgba(23, 57, 41, 0.96)",
        "--line": "rgba(196, 255, 215, 0.18)",
        "--line-soft": "rgba(196, 255, 215, 0.1)",
        "--gold": "#f8da69",
        "--gold-soft": "#fff0ad",
        "--mint": "#8cffab",
        "--rose": "#ffa277",
        "--sky": "#75d7ff",
        "--bg-glow-gold": "rgba(224, 255, 120, 0.14)",
        "--bg-glow-mint": "rgba(112, 255, 180, 0.14)",
        "--bg-glow-sky": "rgba(117, 215, 255, 0.1)",
        "--bg-orb-top": "rgba(121, 255, 133, 0.16)",
        "--bg-orb-bottom": "rgba(123, 219, 255, 0.14)",
      }),
    },
    {
      id: "desert",
      type: "ui-theme-pack",
      name: "Desert",
      label: "Desert",
      rarity: "epic",
      icon: "🏜️",
      preview: "Dunes",
      themeTokens: Object.freeze({
        "--bg-0": "#1b1007",
        "--bg-1": "#3a2210",
        "--bg-2": "#6f3b16",
        "--panel": "rgba(54, 31, 14, 0.9)",
        "--panel-strong": "rgba(75, 43, 19, 0.96)",
        "--line": "rgba(255, 228, 180, 0.18)",
        "--line-soft": "rgba(255, 228, 180, 0.1)",
        "--gold": "#ffc75a",
        "--gold-soft": "#ffe1a4",
        "--mint": "#ffbd73",
        "--rose": "#ff8b63",
        "--sky": "#8bd7ff",
        "--bg-glow-gold": "rgba(255, 207, 101, 0.18)",
        "--bg-glow-mint": "rgba(255, 169, 92, 0.12)",
        "--bg-glow-sky": "rgba(139, 215, 255, 0.1)",
        "--bg-orb-top": "rgba(255, 210, 132, 0.16)",
        "--bg-orb-bottom": "rgba(255, 156, 99, 0.14)",
      }),
    },
    {
      id: "cave",
      type: "ui-theme-pack",
      name: "Cave",
      label: "Cave",
      rarity: "mythic",
      icon: "🪨",
      preview: "Crystal Cave",
      themeTokens: Object.freeze({
        "--bg-0": "#080c18",
        "--bg-1": "#10172d",
        "--bg-2": "#20274d",
        "--panel": "rgba(17, 24, 52, 0.9)",
        "--panel-strong": "rgba(23, 32, 68, 0.96)",
        "--line": "rgba(163, 204, 255, 0.2)",
        "--line-soft": "rgba(163, 204, 255, 0.12)",
        "--gold": "#8df0ff",
        "--gold-soft": "#d4fbff",
        "--mint": "#7cf2de",
        "--rose": "#9aaeff",
        "--sky": "#7cc2ff",
        "--bg-glow-gold": "rgba(141, 240, 255, 0.12)",
        "--bg-glow-mint": "rgba(124, 242, 222, 0.12)",
        "--bg-glow-sky": "rgba(124, 194, 255, 0.16)",
        "--bg-orb-top": "rgba(118, 212, 255, 0.12)",
        "--bg-orb-bottom": "rgba(147, 157, 255, 0.14)",
      }),
    },
    {
      id: "volcano",
      type: "ui-theme-pack",
      name: "Volcano",
      label: "Volcano",
      rarity: "legend",
      icon: "🌋",
      preview: "Lava Glow",
      themeTokens: Object.freeze({
        "--bg-0": "#170808",
        "--bg-1": "#351012",
        "--bg-2": "#66151a",
        "--panel": "rgba(50, 14, 17, 0.9)",
        "--panel-strong": "rgba(73, 18, 23, 0.96)",
        "--line": "rgba(255, 181, 130, 0.2)",
        "--line-soft": "rgba(255, 181, 130, 0.12)",
        "--gold": "#ffb34a",
        "--gold-soft": "#ffd798",
        "--mint": "#ff8f63",
        "--rose": "#ff5d5d",
        "--sky": "#ff9b6b",
        "--bg-glow-gold": "rgba(255, 179, 74, 0.16)",
        "--bg-glow-mint": "rgba(255, 111, 83, 0.14)",
        "--bg-glow-sky": "rgba(255, 155, 107, 0.12)",
        "--bg-orb-top": "rgba(255, 118, 73, 0.18)",
        "--bg-orb-bottom": "rgba(255, 86, 86, 0.14)",
      }),
    },
    {
      id: "dragon",
      type: "ui-theme-pack",
      name: "Dragon",
      label: "Dragon",
      rarity: "legend",
      icon: "🐉",
      preview: "Royal Flame",
      themeTokens: Object.freeze({
        "--bg-0": "#140918",
        "--bg-1": "#2d1040",
        "--bg-2": "#4a1668",
        "--panel": "rgba(37, 15, 56, 0.9)",
        "--panel-strong": "rgba(50, 21, 75, 0.96)",
        "--line": "rgba(255, 214, 110, 0.2)",
        "--line-soft": "rgba(255, 214, 110, 0.12)",
        "--gold": "#ffd75e",
        "--gold-soft": "#fff0b6",
        "--mint": "#d78cff",
        "--rose": "#ff7b8d",
        "--sky": "#a98cff",
        "--bg-glow-gold": "rgba(255, 215, 94, 0.16)",
        "--bg-glow-mint": "rgba(215, 140, 255, 0.14)",
        "--bg-glow-sky": "rgba(169, 140, 255, 0.14)",
        "--bg-orb-top": "rgba(190, 117, 255, 0.16)",
        "--bg-orb-bottom": "rgba(255, 203, 99, 0.12)",
      }),
    },
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

export function isRewardCatalogItemDefaultOwned(type, itemId) {
  return Boolean(getRewardCatalogItem(type, itemId)?.defaultOwned);
}
