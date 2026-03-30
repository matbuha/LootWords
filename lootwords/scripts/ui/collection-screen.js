import { CATEGORY_META, COLLECTION_SORTS, DIFFICULTY_META, PACK_META, RARITY_META } from "../data/config.js";
import { getCollectionSections } from "../core/progression.js";
import { renderCard, renderDetailCard, renderEmptyState, escapeHtml, formatPoints } from "./ui-kit.js";

export function renderCollectionScreen(container, { cards, filters, progress, actions, modalCard }) {
  const collectionSections = getCollectionSections(cards, filters);
  const recentCardIds = new Set(progress.recentCardIds);
  const categoryCountById = new Map(progress.categoryCounts.map((entry) => [entry.id, entry]));

  container.innerHTML = `
    <section class="collection-panel">
      <div class="screen-header">
        <div>
          <span class="small-label">Collection album</span>
          <h2 class="section-title">Your word-card inventory</h2>
        </div>
        <p class="screen-note">Browse by category, chase themed packs, and keep recent finds easy to revisit.</p>
      </div>

      <div class="collection-dashboard">
        <article class="stat-card stat-card--glow">
          <span>Unlocked cards</span>
          <strong>${progress.totalUnlocked}/${progress.totalCards}</strong>
          <small>${progress.completionPercent}% album complete</small>
        </article>
        <article class="stat-card">
          <span>Fresh finds</span>
          <strong>${progress.recentCardIds.length}</strong>
          <small>Newest cards marked with a ribbon</small>
        </article>
        <article class="stat-card">
          <span>Total points</span>
          <strong>${formatPoints(progress.totalPoints)}</strong>
          <small>Memory-value collection score</small>
        </article>
        <article class="stat-card">
          <span>Top card</span>
          <strong>${progress.strongestCard ? escapeHtml(progress.strongestCard.word) : "--"}</strong>
          <small>${progress.strongestCard ? `${formatPoints(progress.strongestCard.points)} pts` : "Win to reveal more cards"}</small>
        </article>
      </div>

      <div class="pack-rack">
        ${progress.packCounts
          .map(
            (entry) => `
              <article class="pack-chip">
                <strong>${PACK_META[entry.id].icon} ${PACK_META[entry.id].label}</strong>
                <span>${entry.unlocked}/${entry.total} unlocked</span>
                <div class="progress-bar">
                  <div class="progress-bar__fill" style="width:${entry.percent}%"></div>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>

      <div class="rarity-breakdown">
        ${progress.rarityCounts
          .map(
            (entry) => `
              <article class="rarity-chip" data-rarity="${entry.id}">
                <strong>${RARITY_META[entry.id].label}</strong>
                <span>${entry.unlocked}/${entry.total} collected</span>
              </article>
            `,
          )
          .join("")}
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
        collectionSections.length
          ? `
            <div class="collection-sections">
              ${collectionSections
                .map((section) => {
                  const sectionProgress = categoryCountById.get(section.id);
                  const packMeta = PACK_META[section.meta.packId];

                  return `
                    <section class="collection-section">
                      <div class="collection-section__header">
                        <div>
                          <span class="small-label">${section.meta.icon} ${packMeta.label}</span>
                          <h3 class="section-title">${section.meta.label}</h3>
                        </div>
                        <div class="collection-section__meta">
                          <span class="card-category">${sectionProgress.unlocked}/${sectionProgress.total} unlocked</span>
                          <span class="card-scoreline">${section.cards.length} cards in view</span>
                        </div>
                      </div>
                      <div class="collection-grid">
                        ${section.cards
                          .map(
                            (card) => `
                              <button class="collection-card-button" type="button" data-card-id="${card.id}">
                                ${renderCard(card, {
                                  compact: true,
                                  isNew: recentCardIds.has(card.id),
                                })}
                              </button>
                            `,
                          )
                          .join("")}
                      </div>
                    </section>
                  `;
                })
                .join("")}
            </div>
          `
          : renderEmptyState(
              "No cards match this filter",
              "Try another category or rarity to see more of the collection.",
            )
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
                ${renderDetailCard(modalCard, { isNew: recentCardIds.has(modalCard.id) })}
                <div class="detail-copy detail-copy--album">
                  <p class="section-copy">
                    ${
                      modalCard.unlocked
                        ? `This card belongs to the ${CATEGORY_META[modalCard.category]?.label ?? modalCard.category} collection in the ${PACK_META[modalCard.packId]?.label ?? "starter"} pack.`
                        : "This silhouette is waiting in the reward pool until you crack it open from a loot box."
                    }
                  </p>
                  <ul>
                    <li>${modalCard.unlocked ? `Rarity: ${RARITY_META[modalCard.rarity]?.label}` : "Rarity stays hidden until unlocked."}</li>
                    <li>${modalCard.unlocked ? `Points: ${formatPoints(modalCard.points)}` : "Points were generated on first run and will be revealed on unlock."}</li>
                    <li>${modalCard.unlocked ? `Difficulty: ${DIFFICULTY_META[modalCard.difficultyLevel]?.label}` : "Difficulty stays hidden until unlocked."}</li>
                    <li>${modalCard.unlocked && modalCard.discoveredAt ? `Discovered: ${new Date(modalCard.discoveredAt).toLocaleString("en-US")}` : "Play mini-games to earn more reward boxes."}</li>
                  </ul>
                  ${
                    modalCard.unlocked
                      ? `
                        <div class="pill-row">
                          ${modalCard.tags.slice(0, 4).map((tag) => `<span class="card-category">${escapeHtml(tag.replace(/-/g, " "))}</span>`).join("")}
                        </div>
                      `
                      : ""
                  }
                  <div class="cta-stack">
                    <button class="primary-button" type="button" data-route="play" data-game="memory-match">Play for more loot</button>
                    <button class="ghost-button" type="button" data-route="reward">Open reward room</button>
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
        visibleCards: collectionSections.reduce((sum, section) => sum + section.cards.length, 0),
        sectionCount: collectionSections.length,
        filters,
      };
    },
  };
}
