import { t } from "../../core/i18n.js";

export function renderProgressionManager(container, { parentSettings, progress, actions }) {
  const rewardSettings = parentSettings.rewards;

  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("parent.progression.eyebrow")}</span>
          <h2 class="section-title">${t("parent.progression.title")}</h2>
        </div>
        <p class="screen-note">${t("parent.progression.note")}</p>
      </div>

      <div class="parent-form-grid">
        <label class="parent-field">
          <span>${t("parent.progression.rewardBoxesPerWin")}</span>
          <select class="parent-select" data-parent-reward="rewardBoxesPerWin">
            ${[1, 2, 3]
              .map(
                (value) => `<option value="${value}" ${rewardSettings.rewardBoxesPerWin === value ? "selected" : ""}>${value}</option>`,
              )
              .join("")}
          </select>
        </label>

        <label class="parent-field">
          <span>${t("parent.progression.fallbackBehavior")}</span>
          <select class="parent-select" data-parent-reward="fallbackRewardType">
            <option value="stars" ${rewardSettings.fallbackRewardType === "stars" ? "selected" : ""}>${t("parent.progression.bonusStars")}</option>
            <option value="message" ${rewardSettings.fallbackRewardType === "message" ? "selected" : ""}>${t("parent.progression.messageOnly")}</option>
          </select>
        </label>

        <label class="parent-field">
          <span>${t("parent.progression.fallbackStars")}</span>
          <input class="parent-input" type="number" min="0" max="500" value="${rewardSettings.fallbackStars}" data-parent-reward="fallbackStars" />
        </label>

        <label class="parent-field">
          <span>${t("parent.progression.cardsPerReveal")}</span>
          <input class="parent-input" type="number" value="${rewardSettings.cardsPerRewardReveal}" disabled />
          <small class="parent-help">${t("parent.progression.cardsPerRevealHelp")}</small>
        </label>
      </div>

      <div class="parent-checkbox-list">
        <label class="parent-checkbox">
          <input type="checkbox" data-parent-reward="duplicateRewardsEnabled" ${rewardSettings.duplicateRewardsEnabled ? "checked" : ""} />
          <span>${t("parent.progression.allowDuplicates")}</span>
        </label>
        <label class="parent-checkbox">
          <input type="checkbox" data-parent-reward="firstWinBonusEnabled" ${rewardSettings.firstWinBonusEnabled ? "checked" : ""} />
          <span>${t("parent.progression.keepFirstWinBonus")}</span>
        </label>
        <label class="parent-checkbox">
          <input type="checkbox" data-parent-reward="milestoneRewardsEnabled" ${rewardSettings.milestoneRewardsEnabled ? "checked" : ""} />
          <span>${t("parent.progression.keepMilestones")}</span>
        </label>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>${t("parent.progression.boxesWaiting")}</span>
          <strong>${progress.rewardBoxes}</strong>
          <small>${t("parent.progression.openedSoFar", { count: progress.rewardBoxesOpened })}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.progression.boxesEarnedTotal")}</span>
          <strong>${progress.rewardBoxesEarned}</strong>
          <small>${t("parent.progression.totalWins", { count: progress.totalWins })}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.progression.currentStreak")}</span>
          <strong>${progress.currentStreak}</strong>
          <small>${t("parent.progression.bestStreak", { count: progress.bestStreak })}</small>
        </article>
      </div>
    </section>
  `;

  container.querySelectorAll("[data-parent-reward]").forEach((element) => {
    const eventName = element.type === "checkbox" || element.tagName === "SELECT" ? "change" : "input";
    element.addEventListener(eventName, () => {
      actions.updateParentRewardSetting(
        element.dataset.parentReward,
        element.type === "checkbox" ? element.checked : element.value,
      );
    });
  });
}
