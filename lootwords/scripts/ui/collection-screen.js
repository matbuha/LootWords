import { CATEGORY_META, COLLECTION_SORTS, RARITY_META } from "../data/config.js";
import { filterCards } from "../core/progression.js";
import { renderCard, renderDetailCard, renderEmptyState, escapeHtml } from "./ui-kit.js";

export function renderCollectionScreen(container, { cards, filters, actions, modalCard }) {
  const visibleCards = filterCards(cards, filters);

  container.innerHTML = `
    <section class="collection-panel">
      <div class="screen-header">
        <div>
          <span class="small-label">Collection</span>
          <h2 class="section-title">Unlocked loot cards</h2>
        </div>
        <p class="screen-note">Filter by category, rarity, and point order.</p>
      </div>

      <div class="collection-toolbar">
        <label>
          <span class="small-label">Category</span>
          <select class="filter-select" data-filter-key="category">
            <option value="all">All categories</option>
            ${Object.entries(CATEGORY_META)
              .map(
                ([categoryId, meta]) => `
                  <option value="${categoryId}" ${filters.category === categoryId ? "selected" : ""}>${meta.label}</option>
                `,
              )
              .join("")}
          </select>
        </label>
        <label>
          <span class="small-label">Rarity</span>
          <select class="filter-select" data-filter-key="rarity">
            <option value="all">All rarities</option>
            ${Object.entries(RARITY_META)
              .map(
                ([rarityId, meta]) => `
                  <option value="${rarityId}" ${filters.rarity === rarityId ? "selected" : ""}>${meta.label}</option>
                `,
              )
              .join("")}
          </select>
        </label>
        <label>
          <span class="small-label">Sort</span>
          <select class="filter-select" data-filter-key="sort">
            ${Object.entries(COLLECTION_SORTS)
              .map(
                ([sortId, label]) => `
                  <option value="${sortId}" ${filters.sort === sortId ? "selected" : ""}>${label}</option>
                `,
              )
              .join("")}
          </select>
        </label>
      </div>

      ${
        visibleCards.length
          ? `
            <div class="collection-grid">
              ${visibleCards
                .map(
                  (card) => `
                    <button class="collection-card-button" type="button" data-card-id="${card.id}">
                      ${renderCard(card, { compact: true })}
                    </button>
                  `,
                )
                .join("")}
            </div>
          `
          : renderEmptyState("No cards match this filter", "Try another category or rarity to see more of the collection.")
      }
    </section>

    ${
      modalCard
        ? `
          <div class="detail-modal" data-close-modal="overlay">
            <div class="detail-modal__dialog" role="dialog" aria-modal="true" aria-label="Card details">
              <div class="detail-modal__top">
                <div>
                  <span class="small-label">Card detail</span>
                  <h3 class="section-title">${escapeHtml(modalCard.unlocked ? modalCard.word : "Mystery Card")}</h3>
                </div>
                <button class="secondary-button" type="button" data-close-modal="button">Close</button>
              </div>
              <div class="detail-grid">
                ${renderDetailCard(modalCard)}
                <div class="detail-copy">
                  <p class="section-copy">
                    ${
                      modalCard.unlocked
                        ? `This card is part of the ${CATEGORY_META[modalCard.category]?.label ?? modalCard.category} set.`
                        : "This silhouette will turn into a real card when it drops from a reward box."
                    }
                  </p>
                  <ul>
                    <li>${modalCard.unlocked ? `Rarity: ${RARITY_META[modalCard.rarity]?.label}` : "Rarity stays hidden until unlocked."}</li>
                    <li>${modalCard.unlocked ? `Points: ${modalCard.points}` : "Points are assigned on first run and revealed on unlock."}</li>
                    <li>${modalCard.unlocked && modalCard.discoveredAt ? `Discovered: ${new Date(modalCard.discoveredAt).toLocaleString("en-US")}` : "Play mini-games to earn more reward boxes."}</li>
                  </ul>
                  <div class="cta-stack">
                    <button class="primary-button" type="button" data-route="play" data-game="memory-match">Play for more loot</button>
                    <button class="ghost-button" type="button" data-route="reward">Open reward box</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
        : ""
    }
  `;

  container.querySelectorAll("[data-filter-key]").forEach((select) => {
    select.addEventListener("change", () => {
      actions.updateCollectionFilters({
        [select.dataset.filterKey]: select.value,
      });
    });
  });

  container.querySelectorAll("[data-card-id]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.openCardModal(button.dataset.cardId);
    });
  });

  container.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (element.dataset.closeModal === "button" || event.target === element) {
        actions.closeCardModal();
      }
    });
  });

  container.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigate(button.dataset.route, { game: button.dataset.game });
    });
  });

  return {
    destroy() {},
    getDebugState() {
      return {
        screen: "collection",
        visibleCards: visibleCards.length,
        filters,
      };
    },
  };
}
