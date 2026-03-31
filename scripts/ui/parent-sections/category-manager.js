export function renderCategoryManager(container, { parentSummary, actions }) {
  const activeCategoryCount = parentSummary.categoryStats.filter((entry) => entry.active).length;

  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">Categories</span>
          <h2 class="section-title">Choose which collections stay active</h2>
        </div>
        <p class="screen-note">Disabled categories leave unlocked cards safely stored, but hide them from child rewards, collection browsing, and review mode.</p>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>Active categories</span>
          <strong>${activeCategoryCount}/${parentSummary.categoryStats.length}</strong>
          <small>${parentSummary.activeCardCount} active cards remain</small>
        </article>
        <article class="parent-stat-card">
          <span>Shelved unlocks</span>
          <strong>${parentSummary.shelvedUnlockedCount}</strong>
          <small>Unlocked cards hidden by current settings</small>
        </article>
      </div>

      ${
        activeCategoryCount === 0
          ? `<div class="parent-warning">All categories are currently off. Child Mode will stay playable, but no vocabulary cards can be earned or reviewed until a category is turned back on.</div>`
          : ""
      }

      <div class="parent-list">
        ${parentSummary.categoryStats
          .map(
            (entry) => `
              <article class="parent-row-card">
                <div class="parent-row-card__copy">
                  <strong>${entry.icon} ${entry.label}</strong>
                  <span>${entry.activeCards}/${entry.totalCards} active in child mode</span>
                  <small>${entry.unlockedCount} unlocked total${entry.shelvedUnlocked > 0 ? ` • ${entry.shelvedUnlocked} shelved` : ""}</small>
                </div>
                <button
                  class="parent-toggle ${entry.active ? "is-on" : "is-off"}"
                  type="button"
                  data-parent-toggle-category="${entry.id}"
                >
                  ${entry.active ? "On" : "Off"}
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
