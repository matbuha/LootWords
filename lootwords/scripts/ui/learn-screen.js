import { CATEGORY_META, DIFFICULTY_META, LEARN_SORTS, PACK_META, RARITY_META } from "../data/config.js";
import { renderCard, renderDetailCard, renderEmptyState, escapeHtml, formatPoints } from "./ui-kit.js";

export function renderLearnScreen(container, { unlockedCards, selectedCard, progress, learnFilters, actions }) {
  const currentIndex = selectedCard
    ? unlockedCards.findIndex((card) => card.id === selectedCard.id)
    : -1;
  const recentCardIds = new Set(progress.recentCardIds);

  let contentMarkup = renderEmptyState(
    "No cards to review yet",
    "Win a mini-game, open a reward box, and your first learning card will appear here.",
  );

  if (!unlockedCards.length && progress.totalUnlocked > 0) {
    contentMarkup = renderEmptyState(
      "No cards in this review deck",
      "Try another category or review mode to bring cards back into the learn lounge.",
    );
  } else if (unlockedCards.length && selectedCard) {
    contentMarkup = `
      <div class="learn-layout">
        <div class="learn-spotlight">
          <div class="learn-spotlight__top">
            <span class="card-fanfare">${recentCardIds.has(selectedCard.id) ? "Fresh pull" : "Review card"}</span>
            <span class="card-scoreline">Card ${currentIndex + 1} of ${unlockedCards.length}</span>
          </div>
          ${renderDetailCard(selectedCard, {
            locked: false,
            isNew: recentCardIds.has(selectedCard.id),
          })}
          <div class="learn-guide">
            <p class="section-copy">Say the word, name the picture, then remember the points like a game score. That score becomes the memory hook.</p>
            <div class="pill-row">
              <span class="card-category">${CATEGORY_META[selectedCard.category]?.label ?? selectedCard.category}</span>
              <span class="card-points">${formatPoints(selectedCard.points)} pts</span>
              <span class="rarity-badge rarity-badge--inline">${RARITY_META[selectedCard.rarity]?.label ?? selectedCard.rarity}</span>
              <span class="card-scoreline">${DIFFICULTY_META[selectedCard.difficultyLevel]?.label ?? "Starter"}</span>
            </div>
            <div class="pill-row">
              <span class="card-category">${PACK_META[selectedCard.packId]?.label ?? "Starter pack"}</span>
              ${selectedCard.tags.slice(0, 3).map((tag) => `<span class="card-category">${escapeHtml(tag.replace(/-/g, " "))}</span>`).join("")}
            </div>
            <div class="cta-stack">
              <button class="secondary-button" type="button" data-learn-step="-1">Previous</button>
              <button class="primary-button" type="button" data-learn-step="1">Next card</button>
            </div>
          </div>
        </div>
        <div>
          <div class="screen-header">
            <div>
              <span class="small-label">Review deck</span>
              <h3 class="section-title">Tap any card to spotlight it</h3>
            </div>
            <p class="screen-note">${CATEGORY_META[learnFilters.category]?.label ?? "All categories"} • ${LEARN_SORTS[learnFilters.sort]}</p>
          </div>
          <div class="learn-list">
            ${unlockedCards
              .map(
                (card) => `
                  <button type="button" data-learn-card="${card.id}">
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
          <span class="small-label">Learn lounge</span>
          <h2 class="learn-title">Review your unlocked cards in a calm loop</h2>
        </div>
        <p class="screen-note">Use recent, strongest, or category review to keep the card collection useful for later quiz modes.</p>
      </div>

      <div class="collection-dashboard">
        <article class="stat-card stat-card--glow">
          <span>Review deck</span>
          <strong>${unlockedCards.length}</strong>
          <small>${learnFilters.category === "all" ? "All unlocked cards" : CATEGORY_META[learnFilters.category]?.label}</small>
        </article>
        <article class="stat-card">
          <span>Fresh pull</span>
          <strong>${progress.newestCard ? escapeHtml(progress.newestCard.word) : "--"}</strong>
          <small>${progress.newestCard ? `${formatPoints(progress.newestCard.points)} pts` : "Win a new card to fill this slot"}</small>
        </article>
        <article class="stat-card">
          <span>Highest points</span>
          <strong>${progress.strongestCard ? escapeHtml(progress.strongestCard.word) : "--"}</strong>
          <small>${progress.strongestCard ? `${formatPoints(progress.strongestCard.points)} pts` : "Unlock cards to compare them"}</small>
        </article>
      </div>

      <div class="collection-toolbar">
        <label>
          <span class="small-label">Category</span>
          <select class="filter-select" data-learn-filter="category">
            <option value="all">All categories</option>
            ${Object.entries(CATEGORY_META)
              .map(
                ([categoryId, meta]) => `
                  <option value="${categoryId}" ${learnFilters.category === categoryId ? "selected" : ""}>${meta.label}</option>
                `,
              )
              .join("")}
          </select>
        </label>
        <label>
          <span class="small-label">Review mode</span>
          <select class="filter-select" data-learn-filter="sort">
            ${Object.entries(LEARN_SORTS)
              .map(
                ([sortId, label]) => `
                  <option value="${sortId}" ${learnFilters.sort === sortId ? "selected" : ""}>${label}</option>
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
