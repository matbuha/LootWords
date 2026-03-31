import { CATEGORY_META, RARITY_META } from "../../data/config.js";
import { escapeHtml, formatPoints, renderDetailCard } from "../ui-kit.js";

function renderAvailability(card, profile, parentSummary) {
  const categoryActive = parentSummary.parentSettings.categoryStates[card.category];
  const cardDisabled = parentSummary.parentSettings.disabledCardIds.includes(card.id);

  if (!categoryActive) {
    return "Category off";
  }

  if (cardDisabled) {
    return "Card off";
  }

  return "Active";
}

export function renderContentManager(container, { allCards, filteredCards, selectedCard, filters, parentSummary, actions }) {
  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">Content manager</span>
          <h2 class="section-title">Inspect the full card library</h2>
        </div>
        <p class="screen-note">Search, filter, and turn individual cards on or off without touching the core dataset files.</p>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>All cards</span>
          <strong>${allCards.length}</strong>
          <small>${parentSummary.activeCardCount} active in child mode</small>
        </article>
        <article class="parent-stat-card">
          <span>Disabled cards</span>
          <strong>${parentSummary.disabledCardCount}</strong>
          <small>Manual per-card switches</small>
        </article>
        <article class="parent-stat-card">
          <span>Shelved unlocks</span>
          <strong>${parentSummary.shelvedUnlockedCount}</strong>
          <small>Unlocked but hidden by settings</small>
        </article>
      </div>

      <div class="parent-toolbar">
        <label class="parent-field parent-field--grow">
          <span>Search</span>
          <input class="parent-input" type="search" value="${escapeHtml(filters.search)}" data-parent-filter="search" placeholder="word, id, or tag" />
        </label>
        <label class="parent-field">
          <span>Category</span>
          <select class="parent-select" data-parent-filter="category">
            <option value="all">All categories</option>
            ${Object.entries(CATEGORY_META)
              .map(
                ([categoryId, meta]) =>
                  `<option value="${categoryId}" ${filters.category === categoryId ? "selected" : ""}>${meta.label}</option>`,
              )
              .join("")}
          </select>
        </label>
        <label class="parent-field">
          <span>Rarity</span>
          <select class="parent-select" data-parent-filter="rarity">
            <option value="all">All rarities</option>
            ${Object.entries(RARITY_META)
              .map(
                ([rarityId, meta]) =>
                  `<option value="${rarityId}" ${filters.rarity === rarityId ? "selected" : ""}>${meta.label}</option>`,
              )
              .join("")}
          </select>
        </label>
        <label class="parent-field">
          <span>Unlock state</span>
          <select class="parent-select" data-parent-filter="unlocked">
            <option value="all" ${filters.unlocked === "all" ? "selected" : ""}>All</option>
            <option value="unlocked" ${filters.unlocked === "unlocked" ? "selected" : ""}>Unlocked</option>
            <option value="locked" ${filters.unlocked === "locked" ? "selected" : ""}>Locked</option>
          </select>
        </label>
        <label class="parent-field">
          <span>Availability</span>
          <select class="parent-select" data-parent-filter="availability">
            <option value="all" ${filters.availability === "all" ? "selected" : ""}>All</option>
            <option value="active" ${filters.availability === "active" ? "selected" : ""}>Active</option>
            <option value="shelved" ${filters.availability === "shelved" ? "selected" : ""}>Shelved</option>
            <option value="manual-off" ${filters.availability === "manual-off" ? "selected" : ""}>Card off</option>
            <option value="category-off" ${filters.availability === "category-off" ? "selected" : ""}>Category off</option>
          </select>
        </label>
      </div>

      <div class="parent-two-column">
        <div class="parent-table-wrap">
          <table class="parent-table">
            <thead>
              <tr>
                <th>Word</th>
                <th>Category</th>
                <th>Rarity</th>
                <th>Points</th>
                <th>State</th>
                <th>Child mode</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredCards.length
                  ? filteredCards
                      .map(
                        (card) => `
                          <tr class="${selectedCard?.id === card.id ? "is-selected" : ""}">
                            <td>
                              <button class="parent-link-button" type="button" data-parent-card="${card.id}">
                                <span class="parent-word">${card.icon} ${escapeHtml(card.word)}</span>
                              </button>
                            </td>
                            <td>${escapeHtml(CATEGORY_META[card.category]?.label ?? card.category)}</td>
                            <td>${escapeHtml(RARITY_META[card.rarity]?.label ?? card.rarity)}</td>
                            <td>${formatPoints(card.points)}</td>
                            <td>${card.unlocked ? "Unlocked" : "Locked"}</td>
                            <td>
                              <button
                                class="parent-toggle ${renderAvailability(card, null, parentSummary) === "Active" ? "is-on" : "is-off"}"
                                type="button"
                                data-parent-toggle-card="${card.id}"
                              >
                                ${renderAvailability(card, null, parentSummary)}
                              </button>
                            </td>
                          </tr>
                        `,
                      )
                      .join("")
                  : `
                    <tr>
                      <td colspan="6">
                        <div class="parent-empty-inline">No cards match these parent filters.</div>
                      </td>
                    </tr>
                  `
              }
            </tbody>
          </table>
        </div>

        <aside class="parent-side-panel">
          <div class="screen-header">
            <div>
              <span class="small-label">Card preview</span>
              <h3 class="section-title">${selectedCard ? escapeHtml(selectedCard.word) : "Select a card"}</h3>
            </div>
          </div>
          ${
            selectedCard
              ? `
                ${renderDetailCard(selectedCard, { locked: false })}
                <div class="parent-copy-block">
                  <p><strong>Category:</strong> ${escapeHtml(CATEGORY_META[selectedCard.category]?.label ?? selectedCard.category)}</p>
                  <p><strong>Rarity:</strong> ${escapeHtml(RARITY_META[selectedCard.rarity]?.label ?? selectedCard.rarity)}</p>
                  <p><strong>Points:</strong> ${formatPoints(selectedCard.points)}</p>
                  <p><strong>Child mode:</strong> ${renderAvailability(selectedCard, null, parentSummary)}</p>
                  <p><strong>Unlocked:</strong> ${selectedCard.unlocked ? "Yes" : "No"}</p>
                  <p><strong>Image mode:</strong> ${escapeHtml(selectedCard.imageMode)}</p>
                  <p><strong>Image path:</strong> ${escapeHtml(selectedCard.image)}</p>
                </div>
              `
              : `<div class="parent-empty-inline">Choose a row to preview its collectible card details.</div>`
          }
        </aside>
      </div>
    </section>
  `;

  container.querySelectorAll("[data-parent-filter]").forEach((element) => {
    element.addEventListener("input", () => {
      actions.updateParentContentFilters({
        [element.dataset.parentFilter]: element.value,
      });
    });

    element.addEventListener("change", () => {
      actions.updateParentContentFilters({
        [element.dataset.parentFilter]: element.value,
      });
    });
  });

  container.querySelectorAll("[data-parent-card]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.selectParentCard(button.dataset.parentCard);
    });
  });

  container.querySelectorAll("[data-parent-toggle-card]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.toggleParentCard(button.dataset.parentToggleCard);
    });
  });
}
