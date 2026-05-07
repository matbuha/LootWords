import { getRewardCatalog, getRewardCatalogItem, getRewardTypeMeta, isRewardCatalogItemDefaultOwned } from "../data/loot.js";

const REWARD_CENTER_CATEGORIES = [
  "card",
  "coins",
  "sticker",
  "cursor-skin",
  "ui-theme-pack",
  "profile-background",
  "profile-avatar",
];

function uniqueItems(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

function buildItemEntry(type, itemId, { equipped = false, included = false } = {}) {
  const item = getRewardCatalogItem(type, itemId);
  if (!item) {
    return null;
  }

  return {
    id: item.id,
    type,
    label: item.label ?? item.name ?? item.id,
    icon: item.icon ?? "✨",
    rarity: item.rarity ?? "common",
    equipped,
    included,
  };
}

function buildCategoryEntries(type, ownedIds, equippedId) {
  const catalog = getRewardCatalog(type);
  const entries = [];
  const seen = new Set();

  catalog.forEach((item) => {
    const owned = ownedIds.has(item.id) || isRewardCatalogItemDefaultOwned(type, item.id);
    if (!owned || seen.has(item.id)) {
      return;
    }

    seen.add(item.id);
    entries.push(
      buildItemEntry(type, item.id, {
        equipped: equippedId === item.id,
        included: Boolean(item.defaultOwned),
      }),
    );
  });

  return entries.filter(Boolean);
}

export function buildRewardCenterViewModel({ profile, cards, authState }) {
  const isAuthenticated = authState?.mode === "authenticated" && Boolean(authState.user?.uid);
  const inventory = profile?.inventory ?? {};
  const cardsOwned = isAuthenticated ? cards.filter((card) => card.unlocked) : [];
  const viewModel = {
    isLocked: !isAuthenticated,
    isLoading: false,
    coins: isAuthenticated ? profile?.coins ?? 0 : 0,
    cards: cardsOwned,
    counts: {},
    categories: REWARD_CENTER_CATEGORIES,
    itemsByCategory: {},
    equippedByType: {
      "ui-theme-pack": isAuthenticated ? profile?.selectedUiThemePackId ?? "default" : null,
      "cursor-skin": isAuthenticated ? profile?.selectedCursorSkinId ?? null : null,
      "profile-avatar": isAuthenticated ? profile?.selectedProfileAvatarId ?? null : null,
      "profile-background": isAuthenticated ? profile?.selectedProfileBackgroundId ?? null : null,
    },
  };

  if (!isAuthenticated) {
    return viewModel;
  }

  REWARD_CENTER_CATEGORIES.forEach((type) => {
    if (type === "card") {
      viewModel.itemsByCategory[type] = cardsOwned;
      viewModel.counts[type] = cardsOwned.length;
      return;
    }

    if (type === "coins") {
      viewModel.itemsByCategory[type] = [];
      viewModel.counts[type] = profile?.coins ?? 0;
      return;
    }

    const inventoryKey = getRewardTypeMeta(type)?.inventoryKey;
    const ownedIds = new Set(uniqueItems(Array.isArray(inventory?.[inventoryKey]) ? inventory[inventoryKey] : []));
    const equippedId = viewModel.equippedByType[type];
    const items = buildCategoryEntries(type, ownedIds, equippedId);
    viewModel.itemsByCategory[type] = items;
    viewModel.counts[type] = items.length;
  });

  return viewModel;
}

function buildDefaultCustomizationItem(type) {
  const defaults = {
    "ui-theme-pack": {
      id: "default",
      type: "ui-theme-pack",
      label: "Default",
      icon: "✨",
      rarity: "common",
      defaultOwned: true,
      defaultSelection: true,
    },
    "cursor-skin": {
      id: "default",
      type: "cursor-skin",
      label: "Default",
      icon: "🖱️",
      rarity: "common",
      defaultOwned: true,
      defaultSelection: true,
    },
    "profile-avatar": {
      id: "default",
      type: "profile-avatar",
      label: "Default",
      icon: "🙂",
      rarity: "common",
      defaultOwned: true,
      defaultSelection: true,
    },
    "profile-background": {
      id: "default",
      type: "profile-background",
      label: "Default",
      icon: "🖼️",
      rarity: "common",
      defaultOwned: true,
      defaultSelection: true,
    },
  };

  return defaults[type] ?? null;
}

function buildOwnedCustomizationItems(type, ownedIds, equippedId) {
  return getRewardCatalog(type)
    .filter((item) => !item.defaultOwned && ownedIds.has(item.id))
    .map((item) => ({
      id: item.id,
      type,
      label: item.label ?? item.name ?? item.id,
      icon: item.icon ?? "✨",
      rarity: item.rarity ?? "common",
      equipped: equippedId === item.id,
      defaultOwned: Boolean(item.defaultOwned),
    }));
}

export function buildCustomizationViewModel({ profile, authState }) {
  const isAuthenticated = authState?.mode === "authenticated" && Boolean(authState.user?.uid);
  const inventory = profile?.inventory ?? {};

  const categories = [
    "ui-theme-pack",
    "cursor-skin",
    "profile-avatar",
    "profile-background",
  ];

  const equippedByType = {
    "ui-theme-pack": isAuthenticated ? profile?.selectedUiThemePackId ?? "default" : "default",
    "cursor-skin": isAuthenticated ? profile?.selectedCursorSkinId ?? null : null,
    "profile-avatar": isAuthenticated ? profile?.selectedProfileAvatarId ?? null : null,
    "profile-background": isAuthenticated ? profile?.selectedProfileBackgroundId ?? null : null,
  };

  const itemsByCategory = {};
  const preview = {
    uiThemePack: buildDefaultCustomizationItem("ui-theme-pack"),
    cursorSkin: buildDefaultCustomizationItem("cursor-skin"),
    profileAvatar: buildDefaultCustomizationItem("profile-avatar"),
    profileBackground: buildDefaultCustomizationItem("profile-background"),
  };

  if (!isAuthenticated) {
    return {
      isLocked: true,
      isLoading: false,
      categories,
      equippedByType,
      itemsByCategory,
      preview,
    };
  }

  categories.forEach((type) => {
    const inventoryKey = getRewardTypeMeta(type)?.inventoryKey;
    const ownedIds = new Set(Array.isArray(inventory?.[inventoryKey]) ? inventory[inventoryKey] : []);
    const defaultItem = buildDefaultCustomizationItem(type);
    const ownedItems = buildOwnedCustomizationItems(type, ownedIds, equippedByType[type]);
    itemsByCategory[type] = defaultItem ? [defaultItem, ...ownedItems] : ownedItems;
  });

  return {
    isLocked: false,
    isLoading: false,
    categories,
    equippedByType,
    itemsByCategory,
    preview,
  };
}
