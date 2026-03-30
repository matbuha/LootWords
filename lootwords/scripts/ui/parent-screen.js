import { CATEGORY_META } from "../data/config.js";
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
          <span class="small-label">Parent settings</span>
          <h2 class="section-title">Keep Parent Mode separate from child mode</h2>
        </div>
        <p class="screen-note">This is a local browser-only admin layer. It is not full security, but it keeps adult controls out of the normal child flow.</p>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>Parent entry</span>
          <strong>${PARENT_SECRET_CLICK_TARGET} logo taps</strong>
          <small>Then type ${PARENT_GATE_PHRASE}</small>
        </article>
        <article class="parent-stat-card">
          <span>Active categories</span>
          <strong>${activeCategories.length}</strong>
          <small>${activeCategories.map((entry) => CATEGORY_META[entry.id]?.label ?? entry.id).slice(0, 3).join(", ") || "None"}</small>
        </article>
        <article class="parent-stat-card">
          <span>Active cards</span>
          <strong>${parentSummary.activeCardCount}</strong>
          <small>${parentSummary.shelvedUnlockedCount} unlocked cards are currently shelved</small>
        </article>
      </div>

      <div class="parent-copy-block">
        <p><strong>Reward pool:</strong> Child rewards only pull from active categories and cards. Shelved cards stay saved in storage and come back if re-enabled later.</p>
        <p><strong>Import safety:</strong> Imported JSON is validated before anything is applied. Unknown fields are ignored, and malformed card ids or counters are rejected.</p>
        <p><strong>Next expansion path:</strong> The current structure is ready for themed packs, seasonal sets, parent-selected age pools, and a fuller card editor later.</p>
      </div>

      <div class="cta-stack cta-stack--parent">
        <button class="secondary-button" type="button" data-parent-section="content">Manage content</button>
        <button class="ghost-button" type="button" data-parent-exit="true">Exit Parent Mode</button>
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
            <div class="parent-gate">
              <div class="screen-header">
                <div>
                  <span class="small-label">Parent check</span>
                  <h2 class="section-title">Enter Parent Mode</h2>
                </div>
                <p class="screen-note">This keeps admin controls out of the normal child flow. Type the parent phrase to continue.</p>
              </div>
              <label class="parent-field">
                <span>Parent phrase</span>
                <input class="parent-input" type="password" value="${parentUi.gateInput}" data-parent-gate-input="true" placeholder="Type the parent phrase" />
              </label>
              ${
                parentUi.gateError
                  ? `<div class="parent-status is-error"><strong>Parent check failed</strong><p>${parentUi.gateError}</p></div>`
                  : ""
              }
              <div class="cta-stack cta-stack--parent">
                <button class="primary-button" type="button" data-parent-gate-submit="true">Unlock Parent Mode</button>
                <button class="ghost-button" type="button" data-parent-gate-cancel="true">Back to child mode</button>
              </div>
            </div>
          `
          : `
            <div class="parent-layout">
              <aside class="parent-nav">
                <div class="screen-header">
                  <div>
                    <span class="small-label">Parent dashboard</span>
                    <h2 class="section-title">Manage LootWords safely</h2>
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
                          ${section.label}
                        </button>
                      `,
                    )
                    .join("")}
                </div>
                <div class="parent-nav__footer">
                  <button class="ghost-button" type="button" data-parent-exit="true">Exit Parent Mode</button>
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

    container.querySelector("[data-parent-gate-submit]")?.addEventListener("click", () => {
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
