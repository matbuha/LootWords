import { categoryLabel, t } from "../core/i18n.js";
import {
  DEFAULT_PARENT_SECTION,
  filterParentContentCards,
  normalizeParentSection,
  PARENT_GATE_PHRASE,
  PARENT_SECRET_CLICK_TARGET,
  PARENT_SECTIONS,
} from "../core/parent-mode.js";
import { renderCategoryManager } from "./parent-sections/category-manager.js";
import { renderContentManager } from "./parent-sections/content-manager.js";
import { renderImportExportTools } from "./parent-sections/import-export-tools.js";
import { renderProgressionManager } from "./parent-sections/progression-manager.js";
import { renderProgressTools } from "./parent-sections/progress-tools.js";
import { renderResetTools } from "./parent-sections/reset-tools.js";

const SECTION_RENDERERS = {
  [PARENT_SECTIONS.content.id]: renderContentManager,
  [PARENT_SECTIONS.categories.id]: renderCategoryManager,
  [PARENT_SECTIONS.progression.id]: renderProgressionManager,
  [PARENT_SECTIONS.progress.id]: renderProgressTools,
  [PARENT_SECTIONS.transfer.id]: renderImportExportTools,
  [PARENT_SECTIONS.reset.id]: renderResetTools,
};

function renderSettingsSection(container, { parentSummary, actions }) {
  const activeCategories = parentSummary.categoryStats.filter((entry) => entry.active);

  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("parent.settings.eyebrow")}</span>
          <h2 class="section-title">${t("parent.settings.title")}</h2>
        </div>
        <p class="screen-note">${t("parent.settings.note")}</p>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>${t("parent.settings.parentEntry")}</span>
          <strong>${t("parent.settings.logoTaps", { count: PARENT_SECRET_CLICK_TARGET })}</strong>
          <small>${t("parent.settings.thenType", { phrase: PARENT_GATE_PHRASE })}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.settings.activeCategories")}</span>
          <strong>${activeCategories.length}</strong>
          <small>${activeCategories.map((entry) => categoryLabel(entry.id)).slice(0, 3).join(", ") || t("parent.settings.none")}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.settings.activeCards")}</span>
          <strong>${parentSummary.activeCardCount}</strong>
          <small>${t("parent.settings.shelvedUnlocked", { count: parentSummary.shelvedUnlockedCount })}</small>
        </article>
      </div>

      <div class="parent-copy-block">
        <p><strong>${t("parent.settings.rewardPoolTitle")}:</strong> ${t("parent.settings.rewardPoolBody")}</p>
        <p><strong>${t("parent.settings.importSafetyTitle")}:</strong> ${t("parent.settings.importSafetyBody")}</p>
        <p><strong>${t("parent.settings.expansionTitle")}:</strong> ${t("parent.settings.expansionBody")}</p>
      </div>

      <div class="cta-stack cta-stack--parent">
        <button class="secondary-button" type="button" data-parent-section="content">${t("parent.settings.manageContent")}</button>
        <button class="ghost-button" type="button" data-parent-exit="true">${t("parent.settings.exit")}</button>
      </div>
    </section>
  `;

  container.querySelectorAll("[data-parent-section]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigateParentSection(button.dataset.parentSection);
    });
  });

  container.querySelector("[data-parent-exit]")?.addEventListener("click", () => {
    actions.exitParentMode();
  });
}

export function renderParentScreen(
  container,
  { route, allCards, parentSummary, progress, profile, parentUi, actions, isUnlocked },
) {
  const activeSection = normalizeParentSection(route.section ?? parentUi.section ?? DEFAULT_PARENT_SECTION);

  container.innerHTML = `
    <section class="parent-panel">
      ${
        !isUnlocked
          ? `
            <form class="parent-gate" data-parent-gate-form="true">
              <div class="screen-header">
                <div>
                  <span class="small-label">${t("parent.gate.eyebrow")}</span>
                  <h2 class="section-title">${t("parent.gate.title")}</h2>
                </div>
                <p class="screen-note">${t("parent.gate.note")}</p>
              </div>
              <label class="parent-field">
                <span>${t("parent.gate.phrase")}</span>
                <input class="parent-input" type="text" value="${parentUi.gateInput}" data-parent-gate-input="true" placeholder="${t("parent.gate.placeholder")}" autocomplete="off" autocapitalize="characters" spellcheck="false" />
              </label>
              ${
                parentUi.gateError
                  ? `<div class="parent-status is-error"><strong>${t("parent.gate.failedTitle")}</strong><p>${t(parentUi.gateError)}</p></div>`
                  : ""
              }
              <div class="cta-stack cta-stack--parent">
                <button class="primary-button" type="submit" data-parent-gate-submit="true">${t("parent.gate.unlock")}</button>
                <button class="ghost-button" type="button" data-parent-gate-cancel="true">${t("parent.gate.back")}</button>
              </div>
            </form>
          `
          : `
            <div class="parent-layout">
              <aside class="parent-nav">
                <div class="screen-header">
                  <div>
                    <span class="small-label">${t("parent.dashboard.eyebrow")}</span>
                    <h2 class="section-title">${t("parent.dashboard.title")}</h2>
                  </div>
                </div>
                <div class="parent-nav__tabs">
                  ${Object.values(PARENT_SECTIONS)
                    .map(
                      (section) => `
                        <button
                          class="parent-nav__button ${section.id === activeSection ? "is-active" : ""}"
                          type="button"
                          data-parent-section="${section.id}"
                        >
                          ${t(`parent.sections.${section.id}`)}
                        </button>
                      `,
                    )
                    .join("")}
                </div>
                <div class="parent-nav__footer">
                  <button class="ghost-button" type="button" data-parent-exit="true">${t("parent.settings.exit")}</button>
                </div>
              </aside>
              <div id="parent-section-host"></div>
            </div>
          `
      }
    </section>
  `;

  if (!isUnlocked) {
    container.querySelector("[data-parent-gate-input]")?.addEventListener("input", (event) => {
      actions.updateParentGateInput(event.target.value);
    });

    container.querySelector("[data-parent-gate-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      actions.submitParentGate();
    });

    container.querySelector("[data-parent-gate-cancel]")?.addEventListener("click", () => {
      actions.exitParentMode();
    });

    return {
      destroy() {},
      getDebugState() {
        return {
          screen: "parent-gate",
          unlocked: false,
        };
      },
    };
  }

  container.querySelectorAll("[data-parent-section]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigateParentSection(button.dataset.parentSection);
    });
  });

  container.querySelector("[data-parent-exit]")?.addEventListener("click", () => {
    actions.exitParentMode();
  });

  const sectionHost = container.querySelector("#parent-section-host");
  const filteredCards = filterParentContentCards(allCards, profile, parentUi.contentFilters);
  const selectedCard =
    allCards.find((card) => card.id === parentUi.selectedCardId) ?? filteredCards[0] ?? null;
  const sectionRenderer = SECTION_RENDERERS[activeSection];

  if (sectionRenderer) {
    sectionRenderer(sectionHost, {
      allCards,
      filteredCards,
      selectedCard,
      filters: parentUi.contentFilters,
      parentSummary,
      parentSettings: parentSummary.parentSettings,
      progress,
      profile,
      transferState: parentUi.transfer,
      pendingReset: parentUi.pendingReset,
      actions,
    });
  } else {
    renderSettingsSection(sectionHost, { parentSummary, actions });
  }

  return {
    destroy() {},
    getDebugState() {
      return {
        screen: "parent",
        section: activeSection,
        unlocked: true,
        filteredCards: filteredCards.length,
      };
    },
  };
}
