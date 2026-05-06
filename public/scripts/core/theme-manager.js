import { getRewardCatalogItem } from "../data/loot.js";

const THEME_TOKEN_KEYS = Object.freeze([
  "--bg-0",
  "--bg-1",
  "--bg-2",
  "--panel",
  "--panel-strong",
  "--surface-0",
  "--surface-1",
  "--surface-2",
  "--surface-3",
  "--surface-glass",
  "--line",
  "--line-soft",
  "--outline-soft",
  "--outline-strong",
  "--gold",
  "--gold-soft",
  "--mint",
  "--rose",
  "--sky",
  "--accent-cyan",
  "--accent-teal",
  "--accent-gold",
  "--accent-pink",
  "--accent-orange",
  "--accent-violet",
  "--bg-glow-gold",
  "--bg-glow-mint",
  "--bg-glow-sky",
  "--bg-orb-top",
  "--bg-orb-bottom",
  "--button-primary-a",
  "--button-primary-b",
  "--button-primary-text",
  "--button-secondary-a",
  "--button-secondary-b",
  "--button-secondary-text",
  "--ghost-button-a",
  "--ghost-button-b",
  "--card-accent-a",
  "--card-accent-b",
  "--reward-accent-a",
  "--reward-accent-b",
  "--shadow-glow",
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
