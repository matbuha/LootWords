import { categoryLabel, t } from "../../core/i18n.js";

export function renderCategoryManager(container, { parentSummary, actions }) {
  const activeCategoryCount = parentSummary.categoryStats.filter((entry) => entry.active).length;

  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("parent.categories.eyebrow")}</span>
          <h2 class="section-title">${t("parent.categories.title")}</h2>
        </div>
        <p class="screen-note">${t("parent.categories.note")}</p>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>${t("parent.categories.activeCategories")}</span>
          <strong>${activeCategoryCount}/${parentSummary.categoryStats.length}</strong>
          <small>${t("parent.categories.activeCardsRemain", { count: parentSummary.activeCardCount })}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.categories.shelvedUnlocks")}</span>
          <strong>${parentSummary.shelvedUnlockedCount}</strong>
          <small>${t("parent.categories.hiddenByCurrentSettings")}</small>
        </article>
      </div>

      ${
        activeCategoryCount === 0
          ? `<div class="parent-warning">${t("parent.categories.allOffWarning")}</div>`
          : ""
      }

      <div class="parent-list">
        ${parentSummary.categoryStats
          .map(
            (entry) => `
              <article class="parent-row-card">
                <div class="parent-row-card__copy">
                  <strong>${entry.icon} ${categoryLabel(entry.id)}</strong>
                  <span>${t("parent.categories.activeInChildMode", { count: entry.activeCards, total: entry.totalCards })}</span>
                  <small>${t("parent.categories.unlockedTotal", { count: entry.unlockedCount })}${entry.shelvedUnlocked > 0 ? ` • ${t("parent.categories.shelvedCount", { count: entry.shelvedUnlocked })}` : ""}</small>
                </div>
                <button
                  class="parent-toggle ${entry.active ? "is-on" : "is-off"}"
                  type="button"
                  data-parent-toggle-category="${entry.id}"
                >
                  ${entry.active ? t("parent.states.on") : t("parent.states.off")}
                </button>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;

  container.querySelectorAll("[data-parent-toggle-category]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.toggleParentCategory(button.dataset.parentToggleCategory);
    });
  });
}
