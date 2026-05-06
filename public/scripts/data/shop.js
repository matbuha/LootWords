export const SHOP_CATALOG = Object.freeze([
  {
    id: "shop-sticker-happy-rainbow",
    rewardType: "sticker",
    rewardItemId: "happy-rainbow",
    price: 40,
    availability: "available",
  },
  {
    id: "shop-sticker-rocket-buddy",
    rewardType: "sticker",
    rewardItemId: "rocket-buddy",
    price: 90,
    availability: "available",
  },
  {
    id: "shop-cursor-glossy-comet",
    rewardType: "cursor-skin",
    rewardItemId: "glossy-comet",
    price: 180,
    availability: "available",
  },
  {
    id: "shop-avatar-lion-badge",
    rewardType: "profile-avatar",
    rewardItemId: "lion-badge",
    price: 160,
    availability: "available",
  },
  {
    id: "shop-background-jungle-morning",
    rewardType: "profile-background",
    rewardItemId: "jungle-morning",
    price: 170,
    availability: "available",
  },
  {
    id: "shop-theme-jungle",
    rewardType: "ui-theme-pack",
    rewardItemId: "jungle",
    price: 260,
    availability: "available",
  },
  {
    id: "shop-theme-desert",
    rewardType: "ui-theme-pack",
    rewardItemId: "desert",
    price: 260,
    availability: "available",
  },
]);

export function getShopCatalog() {
  return SHOP_CATALOG;
}

export function getShopCatalogItem(shopItemId) {
  return SHOP_CATALOG.find((entry) => entry.id === shopItemId) ?? null;
}
