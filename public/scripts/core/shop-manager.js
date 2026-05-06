import { createEmptyLootInventory, getRewardCatalogItem, getRewardInventoryKey, REWARD_TYPE_META } from "../data/loot.js";
import { getShopCatalog, getShopCatalogItem } from "../data/shop.js";

const AUTO_EQUIP_FIELD_BY_TYPE = Object.freeze({
  "cursor-skin": "selectedCursorSkinId",
  "ui-theme-pack": "selectedUiThemePackId",
  "profile-avatar": "selectedProfileAvatarId",
  "profile-background": "selectedProfileBackgroundId",
});

function uniqueList(items) {
  return Array.from(new Set(items));
}

function isAuthenticated(authState) {
  return authState?.mode === "authenticated" && Boolean(authState?.user?.uid);
}

function getSafeInventory(profile) {
  return profile?.inventory ?? createEmptyLootInventory();
}

function isOwnableRewardType(rewardType) {
  return Boolean(REWARD_TYPE_META[rewardType]?.ownable && getRewardInventoryKey(rewardType));
}

function isRewardOwned(profile, rewardType, rewardItemId) {
  const inventoryKey = getRewardInventoryKey(rewardType);
  if (!inventoryKey) {
    return false;
  }

  return (getSafeInventory(profile)[inventoryKey] ?? []).includes(rewardItemId);
}

function getAutoEquipField(rewardType) {
  return AUTO_EQUIP_FIELD_BY_TYPE[rewardType] ?? null;
}

function shouldAutoEquip(profile, field) {
  if (!field) {
    return false;
  }

  return !profile[field] || profile[field] === "default";
}

export function buildShopViewModel(profile, authState) {
  const coins = Math.max(0, Number.parseInt(profile?.coins, 10) || 0);
  const authenticated = isAuthenticated(authState);

  return getShopCatalog()
    .map((entry) => {
      const rewardItem = getRewardCatalogItem(entry.rewardType, entry.rewardItemId);
      if (!rewardItem || !isOwnableRewardType(entry.rewardType)) {
        return null;
      }

      const owned = isRewardOwned(profile, entry.rewardType, entry.rewardItemId);
      const available = entry.availability === "available";
      const canPurchase = authenticated && available && !owned && coins >= entry.price;
      const state = !authenticated
        ? "locked"
        : owned
          ? "owned"
          : !available
            ? "unavailable"
            : coins >= entry.price
              ? "purchasable"
              : "insufficient";

      return {
        ...entry,
        rewardItem,
        owned,
        canPurchase,
        state,
      };
    })
    .filter(Boolean);
}

export function purchaseShopItem(profile, authState, shopItemId) {
  if (!isAuthenticated(authState)) {
    return {
      ok: false,
      reason: "auth-required",
      profile,
      shopItem: null,
    };
  }

  const shopItem = getShopCatalogItem(shopItemId);
  if (!shopItem) {
    return {
      ok: false,
      reason: "missing-item",
      profile,
      shopItem: null,
    };
  }

  if (shopItem.availability !== "available") {
    return {
      ok: false,
      reason: "unavailable",
      profile,
      shopItem,
    };
  }

  if (!isOwnableRewardType(shopItem.rewardType)) {
    return {
      ok: false,
      reason: "invalid-reward-type",
      profile,
      shopItem,
    };
  }

  const rewardItem = getRewardCatalogItem(shopItem.rewardType, shopItem.rewardItemId);
  if (!rewardItem) {
    return {
      ok: false,
      reason: "missing-reward-item",
      profile,
      shopItem,
    };
  }

  if (isRewardOwned(profile, shopItem.rewardType, shopItem.rewardItemId)) {
    return {
      ok: false,
      reason: "owned",
      profile,
      shopItem,
      rewardItem,
    };
  }

  const currentCoins = Math.max(0, Number.parseInt(profile?.coins, 10) || 0);
  if (currentCoins < shopItem.price) {
    return {
      ok: false,
      reason: "insufficient-coins",
      profile,
      shopItem,
      rewardItem,
    };
  }

  const inventoryKey = getRewardInventoryKey(shopItem.rewardType);
  const inventory = getSafeInventory(profile);
  const nextInventoryItems = uniqueList([...(inventory[inventoryKey] ?? []), shopItem.rewardItemId]);
  const autoEquipField = getAutoEquipField(shopItem.rewardType);

  const nextProfile = {
    ...profile,
    coins: Math.max(0, currentCoins - shopItem.price),
    inventory: {
      ...inventory,
      [inventoryKey]: nextInventoryItems,
    },
    ...(shouldAutoEquip(profile, autoEquipField) ? { [autoEquipField]: shopItem.rewardItemId } : {}),
  };

  return {
    ok: true,
    reason: "purchased",
    profile: nextProfile,
    shopItem,
    rewardItem,
  };
}
