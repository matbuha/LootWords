import { CATEGORY_META, RARITY_META } from "../../data/config.js";
import { categoryLabel, rarityLabel, t } from "../../core/i18n.js";
import { escapeHtml, formatPoints, renderDetailCard } from "../ui-kit.js";

function getAvailabilityState(card, parentSummary) {
  const categoryActive = parentSummary.parentSettings.categoryStates[card.category];
  const cardDisabled = parentSummary.parentSettings.disabledCardIds.includes(card.id);

  if (!categoryActive) {
    return { id: "category-off", label: t("parent.states.categoryOff") };
  }

  if (cardDisabled) {
    return { id: "card-off", label: t("parent.states.cardOff") };
  }

  return { id: "active", label: t("parent.states.active") };
}

export function renderContentManager(container, { allCards, filteredCards, selectedCard, filters, parentSummary, actions }) {
  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("parent.content.eyebrow")}</span>
          <h2 class="section-title">${t("parent.content.title")}</h2>
        </div>
        <p class="screen-note">${t("parent.content.note")}</p>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>${t("parent.content.allCards")}</span>
          <strong>${allCards.length}</strong>
          <small>${t("parent.content.activeInChildMode", { count: parentSummary.activeCardCount })}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.content.disabledCards")}</span>
          <strong>${parentSummary.disabledCardCount}</strong>
          <small>${t("parent.content.manualSwitches")}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.content.shelvedUnlocks")}</span>
          <strong>${parentSummary.shelvedUnlockedCount}</strong>
          <small>${t("parent.content.hiddenBySettings")}</small>
        </article>
      </div>

      <div class="parent-toolbar">
        <label class="parent-field parent-field--grow">
          <span>${t("parent.content.search")}</span>
          <input class="parent-input" type="search" value="${escapeHtml(filters.search)}" data-parent-filter="search" placeholder="${t("parent.content.searchPlaceholder")}" />
        </label>
        <label class="parent-field">
          <span>${t("common.category")}</span>
          <select class="parent-select" data-parent-filter="category">
            <option value="all">${t("common.allCategories")}</option>
            ${Object.entries(CATEGORY_META)
              .map(
                ([categoryId, meta]) =>
                  `<option value="${categoryId}" ${filters.category === categoryId ? "selected" : ""}>${categoryLabel(categoryId)}</option>`,
              )
              .join("")}
          </select>
        </label>
        <label class="parent-field">
          <span>${t("common.rarity")}</span>
          <select class="parent-select" data-parent-filter="rarity">
            <option value="all">${t("common.allRarities")}</option>
            ${Object.entries(RARITY_META)
              .map(
                ([rarityId, meta]) =>
                  `<option value="${rarityId}" ${filters.rarity === rarityId ? "selected" : ""}>${rarityLabel(rarityId)}</option>`,
              )
              .join("")}
          </select>
        </label>
        <label class="parent-field">
          <span>${t("parent.content.unlockState")}</span>
          <select class="parent-select" data-parent-filter="unlocked">
            <option value="all" ${filters.unlocked === "all" ? "selected" : ""}>${t("parent.content.allStates")}</option>
            <option value="unlocked" ${filters.unlocked === "unlocked" ? "selected" : ""}>${t("parent.states.unlocked")}</option>
            <option value="locked" ${filters.unlocked === "locked" ? "selected" : ""}>${t("parent.states.locked")}</option>
          </select>
        </label>
        <label class="parent-field">
          <span>${t("parent.content.availability")}</span>
          <select class="parent-select" data-parent-filter="availability">
            <option value="all" ${filters.availability === "all" ? "selected" : ""}>${t("parent.content.allAvailability")}</option>
            <option value="active" ${filters.availability === "active" ? "selected" : ""}>${t("parent.states.active")}</option>
            <option value="shelved" ${filters.availability === "shelved" ? "selected" : ""}>${t("parent.content.shelved")}</option>
            <option value="manual-off" ${filters.availability === "manual-off" ? "selected" : ""}>${t("parent.content.manualOff")}</option>
            <option value="category-off" ${filters.availability === "category-off" ? "selected" : ""}>${t("parent.content.categoryOff")}</option>
          </select>
        </label>
      </div>

      <div class="parent-two-column">
        <div class="parent-table-wrap">
          <table class="parent-table">
            <thead>
              <tr>
                <th>${t("parent.content.word")}</th>
                <th>${t("common.category")}</th>
                <th>${t("common.rarity")}</th>
                <th>${t("parent.content.points")}</th>
                <th>${t("parent.content.state")}</th>
                <th>${t("parent.content.childMode")}</th>
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
                            <td>${escapeHtml(categoryLabel(card.category))}</td>
                            <td>${escapeHtml(rarityLabel(card.rarity))}</td>
                            <td>${formatPoints(card.points)}</td>
                            <td>${card.unlocked ? t("parent.states.unlocked") : t("parent.states.locked")}</td>
                            <td>
                              <button
                                class="parent-toggle ${getAvailabilityState(card, parentSummary).id === "active" ? "is-on" : "is-off"}"
                                type="button"
                                data-parent-toggle-card="${card.id}"
                              >
                                ${getAvailabilityState(card, parentSummary).label}
                              </button>
                            </td>
                          </tr>
                        `,
                      )
                      .join("")
                  : `
                    <tr>
                      <td colspan="6">
                    <div class="parent-empty-inline">${t("emptyState.noCardsMatchParent")}</div>
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
              <span class="small-label">${t("parent.content.cardPreview")}</span>
              <h3 class="section-title">${selectedCard ? escapeHtml(selectedCard.word) : t("parent.content.selectCard")}</h3>
            </div>
          </div>
          ${
            selectedCard
              ? `
                ${renderDetailCard(selectedCard, { locked: false })}
                <div class="parent-copy-block">
                  <p><strong>${t("common.category")}:</strong> ${escapeHtml(categoryLabel(selectedCard.category))}</p>
                  <p><strong>${t("common.rarity")}:</strong> ${escapeHtml(rarityLabel(selectedCard.rarity))}</p>
                  <p><strong>${t("parent.content.points")}:</strong> ${formatPoints(selectedCard.points)}</p>
                  <p><strong>${t("parent.content.childModeLabel")}:</strong> ${getAvailabilityState(selectedCard, parentSummary).label}</p>
                  <p><strong>${t("parent.states.unlocked")}:</strong> ${selectedCard.unlocked ? t("parent.content.yes") : t("parent.content.no")}</p>
                  <p><strong>${t("parent.content.imageMode")}:</strong> ${escapeHtml(selectedCard.imageMode)}</p>
                  <p><strong>${t("parent.content.imagePath")}:</strong> ${escapeHtml(selectedCard.image)}</p>
                </div>
              `
              : `<div class="parent-empty-inline">${t("emptyState.selectCardPreview")}</div>`
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
