import { getRewardCatalogItem } from "../data/loot.js";

const THEME_TOKEN_KEYS = Object.freeze([
  "--bg-0",
  "--bg-1",
  "--bg-2",
  "--panel",
  "--panel-strong",
  "--line",
  "--line-soft",
  "--gold",
  "--gold-soft",
  "--mint",
  "--rose",
  "--sky",
  "--bg-glow-gold",
  "--bg-glow-mint",
  "--bg-glow-sky",
  "--bg-orb-top",
  "--bg-orb-bottom",
]);

export function getEquippedThemePack(profile) {
  return getRewardCatalogItem("ui-theme-pack", profile?.selectedUiThemePackId ?? "default")
    ?? getRewardCatalogItem("ui-theme-pack", "default");
}

export function applyUiTheme(profile) {
  const root = document.documentElement;
  const body = document.body;
  const themePack = getEquippedThemePack(profile);
  const themeTokens = themePack?.themeTokens ?? {};

  if (!root || !body) {
    return;
  }

  for (const tokenKey of THEME_TOKEN_KEYS) {
    const value = themeTokens[tokenKey];
    if (value) {
      root.style.setProperty(tokenKey, value);
    } else {
      root.style.removeProperty(tokenKey);
    }
  }

  body.dataset.uiThemePack = themePack?.id ?? "default";
}
