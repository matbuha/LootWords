import { formatPoints } from "../ui-kit.js";

export function renderProgressTools(container, { parentSummary, progress, profile }) {
  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">Child progress</span>
          <h2 class="section-title">See what the child has unlocked and played</h2>
        </div>
        <p class="screen-note">This view helps a parent understand learning coverage, reward pacing, and replay habits at a glance.</p>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>Unlocked cards</span>
          <strong>${parentSummary.unlockedAllCount}/${profile.pointsByCardId ? Object.keys(profile.pointsByCardId).length : 0}</strong>
          <small>${progress.completionPercent}% of the active pool</small>
        </article>
        <article class="parent-stat-card">
          <span>Reward boxes opened</span>
          <strong>${progress.rewardBoxesOpened}</strong>
          <small>${progress.rewardBoxes} still waiting</small>
        </article>
        <article class="parent-stat-card">
          <span>Total wins</span>
          <strong>${progress.totalWins}</strong>
          <small>${progress.playSummary.totalPlays} total rounds played</small>
        </article>
        <article class="parent-stat-card">
          <span>Recent unlocks</span>
          <strong>${parentSummary.recentUnlocks.length}</strong>
          <small>Latest cards appear below</small>
        </article>
      </div>

      <div class="parent-two-column">
        <div class="parent-list">
          <div class="screen-header">
            <div>
              <span class="small-label">By category</span>
              <h3 class="section-title">Unlocked coverage</h3>
            </div>
          </div>
          ${parentSummary.categoryStats
            .map(
              (entry) => `
                <article class="parent-row-card">
                  <div class="parent-row-card__copy">
                    <strong>${entry.icon} ${entry.label}</strong>
                    <span>${entry.unlockedCount}/${entry.totalCards} unlocked</span>
                    <small>${entry.active ? `${entry.activeUnlocked} visible in child mode` : `${entry.shelvedUnlocked} shelved while off`}</small>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>

        <div class="parent-list">
          <div class="screen-header">
            <div>
              <span class="small-label">By rarity and game</span>
              <h3 class="section-title">Collection and play stats</h3>
            </div>
          </div>
          ${parentSummary.rarityStats
            .map(
              (entry) => `
                <article class="parent-row-card">
                  <div class="parent-row-card__copy">
                    <strong>${entry.label}</strong>
                    <span>${entry.unlocked}/${entry.total} unlocked</span>
                    <small>${entry.active} active in child mode</small>
                  </div>
                </article>
              `,
            )
            .join("")}
          ${progress.playSummary.gameProgress
            .map(
              (game) => `
                <article class="parent-row-card">
                  <div class="parent-row-card__copy">
                    <strong>${game.icon} ${game.label}</strong>
                    <span>${game.stats.wins} wins / ${game.stats.losses} losses</span>
                    <small>${game.stats.plays} total plays</small>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>

      <div class="parent-list">
        <div class="screen-header">
          <div>
            <span class="small-label">Recent unlocks</span>
            <h3 class="section-title">Latest rewards</h3>
          </div>
        </div>
        ${
          parentSummary.recentUnlocks.length
            ? parentSummary.recentUnlocks
                .map(
                  (card) => `
                    <article class="parent-row-card">
                      <div class="parent-row-card__copy">
                        <strong>${card.icon} ${card.word}</strong>
                        <span>${formatPoints(card.points)} pts</span>
                        <small>${card.discoveredAt ? new Date(card.discoveredAt).toLocaleString("en-US") : "No discovery timestamp"}</small>
                      </div>
                    </article>
                  `,
                )
                .join("")
            : `<div class="parent-empty-inline">No cards have been unlocked yet.</div>`
        }
      </div>
    </section>
  `;
}
