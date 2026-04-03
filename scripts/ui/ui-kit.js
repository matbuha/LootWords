import { formatNumber, t } from "../core/i18n.js";

export function formatPoints(points) {
  return formatNumber(points);
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCardShell(card, { locked, compact, spotlight, isNew }) {
  const cardName = locked ? t("common.mysteryCard") : card.word;
  const speakAttributes = !locked && card.word
    ? ` data-speak-word="${escapeHtml(card.word)}" lang="en" `
    : "";
  const pointsLabel = locked
    ? "?"
    : t("common.pointsValue", { value: formatPoints(card.points) });

  return `
    <article
      class="${spotlight ? "detail-card detail-card--spotlight" : "loot-card"} ${locked ? "is-locked" : ""} ${isNew ? "is-new" : ""}"
      data-rarity="${card.rarity}"
      data-category="${escapeHtml(card.category)}"
      data-pack="${escapeHtml(card.packId ?? "starter-pack")}"
      data-difficulty="${escapeHtml(card.difficultyLevel ?? 1)}"
      data-image-mode="${escapeHtml(card.imageMode ?? "placeholder-icon")}"
      ${speakAttributes}
    >
      <div class="card-halo" aria-hidden="true">
        <span class="card-halo__ring"></span>
        <span class="card-halo__glow"></span>
        <span class="card-halo__spark card-halo__spark--1"></span>
        <span class="card-halo__spark card-halo__spark--2"></span>
      </div>
      <div class="card-sheen" aria-hidden="true"></div>
      ${isNew && !locked ? `<span class="card-fanfare card-fanfare--corner">${t("common.new")}</span>` : ""}
      <div class="card-art card-art--hero">
        <div class="card-art__backdrop" aria-hidden="true"></div>
        ${
          locked
            ? `
              <div class="card-art__locked">
                <strong>?</strong>
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
      <div class="card-info-row">
        <h3 class="${spotlight ? "detail-card__word" : "loot-card__word"}">${escapeHtml(cardName)}</h3>
        <span class="card-points card-points--compact">${pointsLabel}</span>
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
