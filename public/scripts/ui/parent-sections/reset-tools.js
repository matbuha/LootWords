import { t } from "../../core/i18n.js";

export function renderResetTools(container, { pendingReset, actions }) {
  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("parent.reset.eyebrow")}</span>
          <h2 class="section-title">${t("parent.reset.title")}</h2>
        </div>
        <p class="screen-note">${t("parent.reset.note")}</p>
      </div>

      ${
        pendingReset
          ? `
            <div class="parent-status is-warning">
              <strong>${t(pendingReset.titleKey)}</strong>
              <p>${t(pendingReset.detailKey)}</p>
              <div class="cta-stack cta-stack--parent">
                <button class="primary-button" type="button" data-parent-reset-confirm="${pendingReset.id}">${t("parent.reset.confirm")}</button>
                <button class="ghost-button" type="button" data-parent-reset-cancel="true">${t("parent.reset.cancel")}</button>
              </div>
            </div>
          `
          : ""
      }

      <div class="parent-list">
        <article class="parent-row-card">
          <div class="parent-row-card__copy">
            <strong>${t("parent.reset.resetAllTitle")}</strong>
            <span>${t("parent.reset.resetAllBody")}</span>
          </div>
          <button class="parent-danger-button" type="button" data-parent-reset="all-progress">${t("parent.reset.armReset")}</button>
        </article>
        <article class="parent-row-card">
          <div class="parent-row-card__copy">
            <strong>${t("parent.reset.resetCollectionTitle")}</strong>
            <span>${t("parent.reset.resetCollectionBody")}</span>
          </div>
          <button class="parent-danger-button" type="button" data-parent-reset="collection">${t("parent.reset.armReset")}</button>
        </article>
        <article class="parent-row-card">
          <div class="parent-row-card__copy">
            <strong>${t("parent.reset.resetRewardsTitle")}</strong>
            <span>${t("parent.reset.resetRewardsBody")}</span>
          </div>
          <button class="parent-danger-button" type="button" data-parent-reset="rewards">${t("parent.reset.armReset")}</button>
        </article>
        <article class="parent-row-card">
          <div class="parent-row-card__copy">
            <strong>${t("parent.reset.resetSettingsTitle")}</strong>
            <span>${t("parent.reset.resetSettingsBody")}</span>
          </div>
          <button class="parent-danger-button" type="button" data-parent-reset="settings">${t("parent.reset.armReset")}</button>
        </article>
      </div>
    </section>
  `;

  container.querySelectorAll("[data-parent-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.requestParentReset(button.dataset.parentReset);
    });
  });

  container.querySelector("[data-parent-reset-confirm]")?.addEventListener("click", (event) => {
    actions.confirmParentReset(event.target.dataset.parentResetConfirm);
  });

  container.querySelector("[data-parent-reset-cancel]")?.addEventListener("click", () => {
    actions.cancelParentReset();
  });
}
