import { CATEGORY_META, DIFFICULTY_META, LEARN_SORTS, PACK_META, RARITY_META } from "../data/config.js";
import { categoryLabel, difficultyLabel, learnSortLabel, packLabel, rarityLabel, t } from "../core/i18n.js";
import { renderCard, renderDetailCard, renderEmptyState, escapeHtml, formatPoints } from "./ui-kit.js";

export function renderLearnScreen(container, { unlockedCards, selectedCard, progress, learnFilters, actions }) {
  const currentIndex = selectedCard
    ? unlockedCards.findIndex((card) => card.id === selectedCard.id)
    : -1;
  const recentCardIds = new Set(progress.recentCardIds);
  const categoryOptions = progress.categoryCounts;

  let contentMarkup = renderEmptyState(
    t("emptyState.noCardsToReviewTitle"),
    t("emptyState.noCardsToReviewBody"),
  );

  if (!unlockedCards.length && progress.totalCards === 0) {
    contentMarkup = renderEmptyState(
      t("emptyState.noActiveCardsTitle"),
      t("emptyState.noActiveCardsBody"),
    );
  } else if (!unlockedCards.length && progress.totalUnlocked > 0) {
    contentMarkup = renderEmptyState(
      t("emptyState.noCardsInDeckTitle"),
      t("emptyState.noCardsInDeckBody"),
    );
  } else if (unlockedCards.length && selectedCard) {
    contentMarkup = `
      <div class="learn-layout">
        <div class="learn-spotlight">
          <div class="learn-spotlight__top">
            <span class="card-fanfare">${recentCardIds.has(selectedCard.id) ? t("common.freshPull") : t("common.reviewCard")}</span>
            <span class="card-scoreline">${t("common.cardIndex", { current: currentIndex + 1, total: unlockedCards.length })}</span>
          </div>
          ${renderDetailCard(selectedCard, {
            locked: false,
            isNew: recentCardIds.has(selectedCard.id),
          })}
          <div class="learn-guide">
            <p class="section-copy">${t("learn.sayWordHint")}</p>
            <div class="pill-row">
              <span class="card-category">${categoryLabel(selectedCard.category)}</span>
              <span class="card-points">${t("common.pointsValue", { value: formatPoints(selectedCard.points) })}</span>
              <span class="rarity-badge rarity-badge--inline">${rarityLabel(selectedCard.rarity)}</span>
              <span class="card-scoreline">${difficultyLabel(selectedCard.difficultyLevel)}</span>
            </div>
            <div class="pill-row">
              <span class="card-category">${packLabel(selectedCard.packId ?? "starter-pack")}</span>
              ${selectedCard.tags.slice(0, 3).map((tag) => `<span class="card-category">${escapeHtml(tag.replace(/-/g, " "))}</span>`).join("")}
            </div>
            <div class="cta-stack">
              <button class="secondary-button" type="button" data-learn-step="-1">${t("common.previous")}</button>
              <button class="primary-button" type="button" data-learn-step="1">${t("common.nextCard")}</button>
            </div>
          </div>
        </div>
        <div>
          <div class="screen-header">
            <div>
              <span class="small-label">${t("common.reviewDeck")}</span>
              <h3 class="section-title">${t("learn.spotlightTitle")}</h3>
            </div>
            <p class="screen-note">${learnFilters.category === "all" ? t("common.allCategories") : categoryLabel(learnFilters.category)} ${t("common.localeSeparator")} ${learnSortLabel(learnFilters.sort)}</p>
          </div>
          <div class="learn-list">
            ${unlockedCards
              .map(
                (card) => `
                  <button type="button" data-learn-card="${card.id}" data-speak-word="${escapeHtml(card.word)}" lang="en">
                    ${renderCard(card, {
                      compact: true,
                      locked: false,
                      isNew: recentCardIds.has(card.id),
                    })}
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="learn-panel">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("learn.eyebrow")}</span>
          <h2 class="learn-title">${t("learn.title")}</h2>
        </div>
        <p class="screen-note">${t("learn.note")}</p>
      </div>

      <div class="collection-dashboard">
        <article class="stat-card stat-card--glow">
          <span>${t("common.reviewDeck")}</span>
          <strong data-count-to="${unlockedCards.length}" data-count-key="learn-review-deck">${unlockedCards.length}</strong>
          <small>${learnFilters.category === "all" ? t("learn.allUnlockedCards") : categoryLabel(learnFilters.category)}</small>
        </article>
        <article class="stat-card">
          <span>${t("common.freshPull")}</span>
          <strong>${progress.newestCard ? escapeHtml(progress.newestCard.word) : "--"}</strong>
          <small>${progress.newestCard ? t("common.pointsValue", { value: formatPoints(progress.newestCard.points) }) : t("learn.winNewCard")}</small>
        </article>
        <article class="stat-card">
          <span>${t("learn.highestPoints")}</span>
          <strong>${progress.strongestCard ? escapeHtml(progress.strongestCard.word) : "--"}</strong>
          <small>${progress.strongestCard ? t("common.pointsValue", { value: formatPoints(progress.strongestCard.points) }) : t("learn.unlockToCompare")}</small>
        </article>
      </div>

      <div class="collection-toolbar">
        <label>
          <span class="small-label">${t("common.category")}</span>
          <select class="filter-select" data-learn-filter="category">
            <option value="all">${t("common.allCategories")}</option>
            ${categoryOptions
              .map(
                (entry) => `
                  <option value="${entry.id}" ${learnFilters.category === entry.id ? "selected" : ""}>${entry.label}</option>
                `,
              )
              .join("")}
          </select>
        </label>
        <label>
          <span class="small-label">${t("common.reviewMode")}</span>
          <select class="filter-select" data-learn-filter="sort">
            ${Object.entries(LEARN_SORTS)
              .map(
                ([sortId, label]) => `
                  <option value="${sortId}" ${learnFilters.sort === sortId ? "selected" : ""}>${learnSortLabel(sortId)}</option>
                `,
              )
              .join("")}
          </select>
        </label>
      </div>

      ${contentMarkup}
    </section>
  `;

  container.querySelectorAll("[data-learn-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      actions.updateLearnFilters({
        [select.dataset.learnFilter]: select.value,
      });
    });
  });

  container.querySelectorAll("[data-learn-card]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.selectLearnCard(button.dataset.learnCard);
    });
  });

  container.querySelectorAll("[data-learn-step]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.selectRelativeLearnCard(Number(button.dataset.learnStep));
    });
  });

  return {
    destroy() {},
    getDebugState() {
      return {
        screen: "learn",
        unlockedCards: unlockedCards.length,
        selectedCard: selectedCard?.id ?? null,
        learnFilters,
      };
    },
  };
}
