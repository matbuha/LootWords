import { CATEGORY_META, RARITY_META } from "../data/config.js";

export function formatPoints(points) {
  return new Intl.NumberFormat("en-US").format(points);
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCardShell(card, { locked, compact, spotlight, isNew }) {
  const categoryLabel = CATEGORY_META[card.category]?.label ?? card.category;
  const rarityLabel = RARITY_META[card.rarity]?.label ?? "Common";
  const cardName = locked ? "Mystery Card" : card.word;
  const subtitle = locked ? "Unlock to reveal the word." : `${rarityLabel} loot card`;

  return `
    <article
      class="${spotlight ? "detail-card detail-card--spotlight" : "loot-card"} ${locked ? "is-locked" : ""} ${isNew ? "is-new" : ""}"
      data-rarity="${card.rarity}"
      data-category="${escapeHtml(card.category)}"
      data-pack="${escapeHtml(card.packId ?? "starter-pack")}"
      data-difficulty="${escapeHtml(card.difficultyLevel ?? 1)}"
      data-image-mode="${escapeHtml(card.imageMode ?? "placeholder-icon")}"
    >
      <div class="card-halo" aria-hidden="true">
        <span class="card-halo__ring"></span>
        <span class="card-halo__glow"></span>
        <span class="card-halo__spark card-halo__spark--1"></span>
        <span class="card-halo__spark card-halo__spark--2"></span>
      </div>
      <div class="card-sheen" aria-hidden="true"></div>
      <div class="${spotlight ? "detail-card__header" : "loot-card__header"}">
        <div class="card-chip-row">
          <span class="card-category">${escapeHtml(categoryLabel)}</span>
          ${isNew && !locked ? `<span class="card-fanfare">New</span>` : ""}
        </div>
        ${
          locked
            ? `<span class="card-tag">Locked</span>`
            : `
              <div class="card-score-stack">
                <span class="card-points">${formatPoints(card.points)} pts</span>
                ${compact ? "" : `<span class="rarity-badge">${escapeHtml(rarityLabel)}</span>`}
              </div>
            `
        }
      </div>
      <div class="card-art">
        <div class="card-art__backdrop" aria-hidden="true"></div>
        ${
          locked
            ? `
              <div class="card-art__locked">
                <strong>?</strong>
                <span>Reward mystery</span>
              </div>
            `
            : `
              <div class="card-art__stage">
                <span class="card-art__burst" aria-hidden="true"></span>
                <span class="card-art__icon" aria-hidden="true">${card.icon}</span>
              </div>
            `
        }
      </div>
      <div class="${spotlight ? "detail-card__body" : "loot-card__body"}">
        <div class="card-title-row">
          <h3 class="${spotlight ? "detail-card__word" : "loot-card__word"}">${escapeHtml(cardName)}</h3>
          ${compact || locked ? "" : `<span class="rarity-badge rarity-badge--inline">${escapeHtml(rarityLabel)}</span>`}
        </div>
        <div class="${spotlight ? "detail-card__meta" : "loot-card__meta"}">
          <small>${escapeHtml(subtitle)}</small>
          <span class="card-scoreline">${locked ? "Win to unlock" : `${escapeHtml(rarityLabel)} tier`}</span>
        </div>
      </div>
    </article>
  `;
}

export function renderCard(card, { locked = !card.unlocked, compact = false, isNew = false } = {}) {
  return renderCardShell(card, {
    locked,
    compact,
    spotlight: false,
    isNew,
  });
}

export function renderDetailCard(card, { locked = !card.unlocked, isNew = false } = {}) {
  return renderCardShell(card, {
    locked,
    compact: false,
    spotlight: true,
    isNew,
  });
}

export function renderEmptyState(title, message, extraMarkup = "") {
  return `
    <div class="empty-state">
      <h3 class="section-title">${escapeHtml(title)}</h3>
      <p class="section-copy">${escapeHtml(message)}</p>
      ${extraMarkup}
    </div>
  `;
}
