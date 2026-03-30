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

export function renderCard(card, { locked = !card.unlocked, compact = false } = {}) {
  const categoryLabel = CATEGORY_META[card.category]?.label ?? card.category;
  const rarityLabel = RARITY_META[card.rarity]?.label ?? "Common";

  return `
    <article class="loot-card ${locked ? "is-locked" : ""}" data-rarity="${card.rarity}">
      <div class="loot-card__header">
        <span class="card-category">${escapeHtml(categoryLabel)}</span>
        ${locked ? `<span class="card-tag">Locked</span>` : `<span class="card-points">${formatPoints(card.points)} pts</span>`}
      </div>
      <div class="card-art">
        ${
          locked
            ? `
              <div class="card-art__locked">
                <strong>?</strong>
                <span>Open a loot box</span>
              </div>
            `
            : `<span class="card-art__icon" aria-hidden="true">${card.icon}</span>`
        }
      </div>
      <div>
        <h3 class="loot-card__word">${escapeHtml(locked ? "Mystery Card" : card.word)}</h3>
        <div class="loot-card__meta">
          <small>${locked ? "Unlock to reveal the word." : escapeHtml(rarityLabel)}</small>
          ${compact ? "" : `<span class="rarity-badge">${escapeHtml(rarityLabel)}</span>`}
        </div>
      </div>
    </article>
  `;
}

export function renderDetailCard(card, { locked = !card.unlocked } = {}) {
  const categoryLabel = CATEGORY_META[card.category]?.label ?? card.category;
  const rarityLabel = RARITY_META[card.rarity]?.label ?? "Common";

  return `
    <article class="detail-card ${locked ? "is-locked" : ""}" data-rarity="${card.rarity}">
      <div class="detail-card__header">
        <span class="card-category">${escapeHtml(categoryLabel)}</span>
        ${locked ? `<span class="card-tag">Locked</span>` : `<span class="card-points">${formatPoints(card.points)} pts</span>`}
      </div>
      <div class="card-art">
        ${
          locked
            ? `
              <div class="card-art__locked">
                <strong>?</strong>
                <span>Reward box only</span>
              </div>
            `
            : `<span class="card-art__icon" aria-hidden="true">${card.icon}</span>`
        }
      </div>
      <div>
        <h3 class="detail-card__word">${escapeHtml(locked ? "Mystery Card" : card.word)}</h3>
        <div class="detail-card__meta">
          <small>${locked ? "Open reward boxes to reveal this card." : escapeHtml(rarityLabel)}</small>
          <span class="rarity-badge">${escapeHtml(rarityLabel)}</span>
        </div>
      </div>
    </article>
  `;
}

export function renderEmptyState(title, message) {
  return `
    <div class="empty-state">
      <h3 class="section-title">${escapeHtml(title)}</h3>
      <p class="section-copy">${escapeHtml(message)}</p>
    </div>
  `;
}
