import { RARITY_META } from "../data/config.js";

export function getRarityFromPoints(points) {
  if (points <= 200) {
    return "common";
  }

  if (points <= 400) {
    return "rare";
  }

  if (points <= 600) {
    return "super-rare";
  }

  if (points <= 800) {
    return "epic";
  }

  return "legendary";
}

export function getRarityLabel(rarity) {
  return RARITY_META[rarity]?.label ?? "Common";
}
