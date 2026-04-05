import { formatPoints } from "../ui-kit.js";
import { categoryLabel, formatDate, gameText, rarityLabel, t } from "../../core/i18n.js";

export function renderProgressTools(container, { parentSummary, progress, profile }) {
  container.innerHTML = `
    <section class="parent-section">
      <div class="screen-header">
        <div>
          <span class="small-label">${t("parent.progress.eyebrow")}</span>
          <h2 class="section-title">${t("parent.progress.title")}</h2>
        </div>
        <p class="screen-note">${t("parent.progress.note")}</p>
      </div>

      <div class="parent-stat-grid">
        <article class="parent-stat-card">
          <span>${t("parent.progress.unlockedCards")}</span>
          <strong>${parentSummary.unlockedAllCount}/${profile.pointsByCardId ? Object.keys(profile.pointsByCardId).length : 0}</strong>
          <small>${t("parent.progress.activePoolPercent", { percent: progress.completionPercent })}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.progress.rewardBoxesOpened")}</span>
          <strong>${progress.rewardBoxesOpened}</strong>
          <small>${t("parent.progress.stillWaiting", { count: progress.rewardBoxes })}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.progress.totalWins")}</span>
          <strong>${progress.totalWins}</strong>
          <small>${t("parent.progress.totalRoundsPlayed", { count: progress.playSummary.totalPlays })}</small>
        </article>
        <article class="parent-stat-card">
          <span>${t("parent.progress.recentUnlocks")}</span>
          <strong>${parentSummary.recentUnlocks.length}</strong>
          <small>${t("parent.progress.latestCardsBelow")}</small>
        </article>
      </div>

      <div class="parent-two-column">
        <div class="parent-list">
          <div class="screen-header">
            <div>
              <span class="small-label">${t("parent.progress.byCategory")}</span>
              <h3 class="section-title">${t("parent.progress.unlockedCoverage")}</h3>
            </div>
          </div>
          ${parentSummary.categoryStats
            .map(
              (entry) => `
                <article class="parent-row-card">
                  <div class="parent-row-card__copy">
                    <strong>${entry.icon} ${categoryLabel(entry.id)}</strong>
                    <span>${t("parent.progress.unlockedCount", { current: entry.unlockedCount, total: entry.totalCards })}</span>
                    <small>${entry.active ? t("parent.progress.visibleInChildMode", { count: entry.activeUnlocked }) : t("parent.progress.shelvedWhileOff", { count: entry.shelvedUnlocked })}</small>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>

        <div class="parent-list">
          <div class="screen-header">
            <div>
              <span class="small-label">${t("parent.progress.byRarityAndGame")}</span>
              <h3 class="section-title">${t("parent.progress.collectionAndPlayStats")}</h3>
            </div>
          </div>
          ${parentSummary.rarityStats
            .map(
              (entry) => `
                <article class="parent-row-card">
                  <div class="parent-row-card__copy">
                    <strong>${rarityLabel(entry.id)}</strong>
                    <span>${t("parent.progress.unlockedCount", { current: entry.unlocked, total: entry.total })}</span>
                    <small>${t("parent.progress.activeInChildMode", { count: entry.active })}</small>
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
                    <strong>${game.icon} ${gameText(game.id, "label")}</strong>
                    <span>${t("parent.progress.winsLosses", { wins: game.stats.wins, losses: game.stats.losses })}</span>
                    <small>${t("parent.progress.totalPlays", { count: game.stats.plays })}</small>
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
            <span class="small-label">${t("parent.progress.recentUnlocks")}</span>
            <h3 class="section-title">${t("parent.progress.latestRewards")}</h3>
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
                        <span>${t("common.pointsValue", { value: formatPoints(card.points) })}</span>
                        <small>${card.discoveredAt ? formatDate(card.discoveredAt) : t("parent.progress.noDiscoveryTimestamp")}</small>
                      </div>
                    </article>
                  `,
                )
                .join("")
            : `<div class="parent-empty-inline">${t("emptyState.noRecentUnlocks")}</div>`
        }
      </div>
    </section>
  `;
}
