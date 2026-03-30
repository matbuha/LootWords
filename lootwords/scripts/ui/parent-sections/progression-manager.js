export function renderProgressionManager(container, { parentSettings, progress, actions }) {
  const rewardSettings = parentSettings.rewards;

  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">Rewards & progression</span>
          <h2 class="section-title">Tune how often the child gets loot</h2>
        </div>
        <p class="screen-note">Changes here apply immediately to future wins, reward openings, and fallback behavior.</p>
      </div>

      <div class="parent-form-grid">
        <label class="parent-field">
          <span>Reward boxes per win</span>
          <select class="parent-select" data-parent-reward="rewardBoxesPerWin">
            ${[1, 2, 3]
              .map(
                (value) => `<option value="${value}" ${rewardSettings.rewardBoxesPerWin === value ? "selected" : ""}>${value}</option>`,
              )
              .join("")}
          </select>
        </label>

        <label class="parent-field">
          <span>Fallback behavior</span>
          <select class="parent-select" data-parent-reward="fallbackRewardType">
            <option value="stars" ${rewardSettings.fallbackRewardType === "stars" ? "selected" : ""}>Bonus stars</option>
            <option value="message" ${rewardSettings.fallbackRewardType === "message" ? "selected" : ""}>Message only</option>
          </select>
        </label>

        <label class="parent-field">
          <span>Fallback stars</span>
          <input class="parent-input" type="number" min="0" max="500" value="${rewardSettings.fallbackStars}" data-parent-reward="fallbackStars" />
        </label>

        <label class="parent-field">
          <span>Cards per reward reveal</span>
          <input class="parent-input" type="number" value="${rewardSettings.cardsPerRewardReveal}" disabled />
          <small class="parent-help">MVP stays at one collectible reveal per reward box.</small>
        </label>
      </div>

      <div class="parent-checkbox-list">
        <label class="parent-checkbox">
          <input type="checkbox" data-parent-reward="duplicateRewardsEnabled" ${rewardSettings.duplicateRewardsEnabled ? "checked" : ""} />
          <span>Allow duplicate rewards. Duplicate pulls convert into bonus stars instead of corrupting progress.</span>
        </label>
        <label class="parent-checkbox">
          <input type="checkbox" data-parent-reward="firstWinBonusEnabled" ${rewardSettings.firstWinBonusEnabled ? "checked" : ""} />
          <span>Keep the first-win bonus active for newly tried mini-games.</span>
        </label>
        <label class="parent-checkbox">
          <input type="checkbox" data-parent-reward="milestoneRewardsEnabled" ${rewardSettings.milestoneRewardsEnabled ? "checked" : ""} />
          <span>Keep every 5-win milestone star reward active.</span>
        </label>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>Reward boxes waiting</span>
          <strong>${progress.rewardBoxes}</strong>
          <small>${progress.rewardBoxesOpened} opened so far</small>
        </article>
        <article class="parent-stat-card">
          <span>Boxes earned total</span>
          <strong>${progress.rewardBoxesEarned}</strong>
          <small>${progress.totalWins} total wins</small>
        </article>
        <article class="parent-stat-card">
          <span>Current streak</span>
          <strong>${progress.currentStreak}</strong>
          <small>Best ${progress.bestStreak}</small>
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
