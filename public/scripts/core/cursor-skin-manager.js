import { getRewardCatalogItem } from "../data/loot.js";

function supportsCustomCursor() {
  return typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
}

function createCursorSvg(accent, stroke) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M7 4 L26 21 L18 22 L23 35 L17 37 L12 24 L6 30 Z"
        fill="${accent}"
        stroke="${stroke}"
        stroke-width="2"
        stroke-linejoin="round"
        filter="url(#glow)"
      />
    </svg>
  `.trim();
}

function buildCursorCss(item) {
  const accent = item?.cursorAccent ?? "#77d5ff";
  const stroke = item?.cursorStroke ?? "#0f2d4f";
  const encodedSvg = encodeURIComponent(createCursorSvg(accent, stroke))
    .replace(/%0A/g, "")
    .replace(/%20/g, " ");
  return `url("data:image/svg+xml,${encodedSvg}") 6 4, pointer`;
}

export function getEquippedCursorSkin(profile) {
  const cursorId = profile?.selectedCursorSkinId;
  return cursorId ? getRewardCatalogItem("cursor-skin", cursorId) : null;
}

export function applyCursorSkin(profile) {
  const enabled = supportsCustomCursor();
  const equippedSkin = enabled ? getEquippedCursorSkin(profile) : null;
  const body = document.body;

  if (!body) {
    return;
  }

  if (!equippedSkin) {
    body.classList.remove("has-custom-cursor");
    body.removeAttribute("data-cursor-skin");
    body.style.removeProperty("--lootwords-cursor-default");
    body.style.removeProperty("--lootwords-cursor-pointer");
    return;
  }

  const cursorCss = buildCursorCss(equippedSkin);
  body.classList.add("has-custom-cursor");
  body.dataset.cursorSkin = equippedSkin.id;
  body.style.setProperty("--lootwords-cursor-default", cursorCss);
  body.style.setProperty("--lootwords-cursor-pointer", cursorCss);
}
