import { renderCard, renderEmptyState } from "./ui-kit.js";
import { categoryLabel, gameText, t } from "../core/i18n.js";

function renderGamePickup(game, actionsLabel, disabled = false) {
  return `
    <article class="game-pick-card">
      <div class="game-pick-card__top">
        <span class="game-pick-card__icon" aria-hidden="true">${game.icon}</span>
        <span class="small-label">${gameText(game.id, "lengthLabel")}</span>
      </div>
      <strong>${gameText(game.id, "label")}</strong>
      <p>${gameText(game.id, "description")}</p>
      <div class="game-pick-card__meta">
        <span>${gameText(game.id, "energyLabel")}</span>
        <span>${t("home.gamesTried", { current: game.stats.wins, total: game.stats.plays })}</span>
      </div>
      <button class="secondary-button" type="button" data-route="play" data-game="${game.id}" ${disabled ? "disabled" : ""}>${actionsLabel}</button>
    </article>
  `;
}

function renderGameChoice(game, disabled = false) {
  return `
    <button class="game-choice game-choice--home game-choice--rich" type="button" data-route="play" data-game="${game.id}" ${disabled ? "disabled" : ""}>
      <div class="game-choice__topline">
        <span class="game-choice__icon" aria-hidden="true">${game.icon}</span>
        <span class="small-label">${gameText(game.id, "lengthLabel")}</span>
      </div>
      <strong>${gameText(game.id, "label")}</strong>
      <span>${gameText(game.id, "description")}</span>
      <div class="game-choice__meta">
        <span>${gameText(game.id, "energyLabel")}</span>
        <span>${t("home.gamesTried", { current: game.stats.wins, total: game.stats.plays })}</span>
      </div>
      <div class="game-choice__footer">
        <span class="small-label">${gameText(game.id, "rewardText")}</span>
        <span class="game-choice__bonus">${game.isFirstWinAvailable ? t("play.bonusReady") : t("play.lootRunReady")}</span>
      </div>
    </button>
  `;
}

export function renderHomeScreen(container, { progress, actions, newestCard }) {
  const noActiveContent = progress.totalCards === 0;
  const stashLabel =
    progress.rewardBoxes > 0
      ? t("home.rewardBoxesReady", { count: progress.rewardBoxes })
      : t("home.winForNextBox");
  const playSummary = progress.playSummary;
  const recommendedGame = playSummary.recommendedGame;
  const randomGame = playSummary.randomGame;

  const newestMarkup = newestCard
    ? renderCard(newestCard, { locked: false, isNew: true })
    : renderEmptyState(
        t("emptyState.noLootYetTitle"),
        t("emptyState.noLootYetBody"),
      );

  container.innerHTML = `
    <div class="screen-stack">
      <section class="hero-panel hero-panel--home ${progress.rewardBoxes > 0 ? "hero-panel--stash-ready" : ""}">
        <div class="hero-copy">
          <span class="eyebrow">${t("home.eyebrow")}</span>
          <h1 class="headline">${t("home.title")}</h1>
          <p class="body-copy">
            ${t("home.body")}
          </p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-play-recommended="home" ${noActiveContent ? "disabled" : ""}>
              ${recommendedGame ? t("home.recommended", { game: gameText(recommendedGame.id, "label") }) : t("home.startLootRun")}
            </button>
            <button class="secondary-button" type="button" data-play-random="home" ${noActiveContent ? "disabled" : ""}>
              ${randomGame ? t("home.random", { game: gameText(randomGame.id, "label") }) : t("home.randomGame")}
            </button>
            <button class="ghost-button" type="button" data-route="reward">${progress.rewardBoxes > 0 ? t("home.openMyBox") : t("home.seeRewardRoom")}</button>
          </div>
          ${
            noActiveContent
              ? `<div class="parent-warning">${t("home.noActiveWarning")}</div>`
              : ""
          }
          <div class="hero-stats">
            <div class="stat-card stat-card--glow">
              <span>${t("home.collectionProgress")}</span>
              <strong>${progress.totalUnlocked}/${progress.totalCards}</strong>
              <small>${t("collection.albumComplete", { percent: progress.completionPercent })}</small>
            </div>
            <div class="stat-card">
              <span>${t("home.rewardStash")}</span>
              <strong data-count-to="${progress.rewardBoxes}" data-count-key="home-reward-boxes">${progress.rewardBoxes}</strong>
              <small>${stashLabel}</small>
            </div>
            <div class="stat-card">
              <span>${t("home.currentStreak")}</span>
              <strong data-count-to="${progress.currentStreak}" data-count-key="home-current-streak">${progress.currentStreak}</strong>
              <small>${t("common.bestValue", { value: progress.bestStreak })}</small>
            </div>
            <div class="stat-card">
              <span>${t("home.boxesEarned")}</span>
              <strong data-count-to="${progress.rewardBoxesEarned}" data-count-key="home-boxes-earned">${progress.rewardBoxesEarned}</strong>
              <small>${t("home.nextMilestoneWins", { count: playSummary.winsUntilMilestone })}</small>
            </div>
          </div>
        </div>
        <div class="hero-art">
          <div class="vault-scene">
            <div class="vault-ring"></div>
            <div class="vault-orbit vault-orbit--one"></div>
            <div class="vault-orbit vault-orbit--two"></div>
            <div class="showcase-card">
              <div class="showcase-card__top">
                <span>${t("home.nextMilestone")}</span>
                <span>${t("play.totalWins", { count: playSummary.nextMilestoneTarget })}</span>
              </div>
              <div class="showcase-card__emoji" aria-hidden="true">🏆</div>
              <div class="showcase-card__word">${playSummary.favoriteGame ? gameText(playSummary.favoriteGame.id, "label") : t("home.findFavorite")}</div>
              <div class="showcase-card__bottom">
                <span>${t("home.gamesTried", { current: playSummary.gamesTried, total: playSummary.gameProgress.length })}</span>
                <span>${t("home.totalWins", { count: progress.totalWins })}</span>
              </div>
            </div>
            <div class="vault-box-mini" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </section>

      <section class="two-column two-column--play-picks">
        <div class="section-panel">
          <div class="screen-header">
            <div>
              <span class="small-label">Play next</span>
              <span class="small-label">${t("home.playNext")}</span>
              <h2 class="section-title">${t("home.quickPicks")}</h2>
            </div>
            <p class="screen-note">${t("home.firstWinBonus")}</p>
          </div>
          <div class="game-pick-grid">
            ${recommendedGame ? renderGamePickup(recommendedGame, t("home.playRecommended"), noActiveContent) : ""}
            ${randomGame ? renderGamePickup(randomGame, t("home.tryRandom"), noActiveContent) : ""}
          </div>
        </div>
        <div class="section-panel section-panel--spotlight">
          <div class="screen-header">
            <div>
              <span class="small-label">${t("home.latestReveal")}</span>
              <h2 class="section-title">${t("home.newestCard")}</h2>
            </div>
          </div>
          ${newestMarkup}
        </div>
      </section>

      <section class="section-panel section-panel--compact">
        <div class="screen-header">
            <div>
              <span class="small-label">${t("home.gameShelf")}</span>
              <h2 class="section-title">${t("home.chooseLootRun")}</h2>
            </div>
          <p class="screen-note">${t("home.gameShelfNote")}</p>
        </div>
        <div class="game-switcher game-switcher--grid">
          ${playSummary.gameProgress.map((game) => renderGameChoice(game, noActiveContent)).join("")}
        </div>
      </section>

      <section class="two-column">
        <div class="section-panel">
          <div class="screen-header">
            <div>
              <span class="small-label">${t("home.progress")}</span>
              <h2 class="section-title">${t("home.albumProgressByCategory")}</h2>
            </div>
            <button class="ghost-button" type="button" data-route="learn">${t("common.reviewWords")}</button>
          </div>
          <div class="category-progress">
            ${progress.categoryCounts
              .map(
                (entry) => `
                  <article class="progress-chip">
                    <strong>${categoryLabel(entry.id)}</strong>
                    <span>${t("home.activeInView", { unlocked: entry.unlocked, total: entry.total })}</span>
                    <div class="progress-bar">
                      <div class="progress-bar__fill" data-progress-fill="${(entry.percent / 100).toFixed(3)}" style="--progress-target:${(entry.percent / 100).toFixed(3)}"></div>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
        <div class="section-panel">
          <div class="screen-header">
            <div>
              <span class="small-label">${t("home.replayLoop")}</span>
              <h2 class="section-title">${t("home.replayLoopTitle")}</h2>
            </div>
          </div>
          <div class="session-loop">
            <article class="progress-chip">
              <strong>${t("home.rewardBoxesEarned")}</strong>
              <span>${t("common.totalSuffix", { value: progress.rewardBoxesEarned })}</span>
            </article>
            <article class="progress-chip">
              <strong>${t("home.gamesWonAtLeastOnce")}</strong>
              <span>${playSummary.gamesWon}/${playSummary.gameProgress.length}</span>
            </article>
            <article class="progress-chip">
              <strong>${t("home.bonusStars")}</strong>
              <span>${t("common.totalSuffix", { value: progress.bonusStars })}</span>
            </article>
            <article class="progress-chip">
              <strong>${t("home.nextMilestonePrize")}</strong>
              <span>${t("home.milestoneStars", { count: playSummary.milestoneBonusStars, target: playSummary.nextMilestoneTarget })}</span>
            </article>
          </div>
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigate(button.dataset.route, { game: button.dataset.game });
    });
  });

  container.querySelectorAll("[data-play-random]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.playRandomGame(button.dataset.playRandom);
    });
  });

  container.querySelectorAll("[data-play-recommended]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.playRecommendedGame(button.dataset.playRecommended);
    });
  });

  return {
    destroy() {},
    getDebugState() {
      return {
        screen: "home",
        rewardBoxes: progress.rewardBoxes,
        totalUnlocked: progress.totalUnlocked,
        recommendedGame: recommendedGame?.id ?? null,
        randomGame: randomGame?.id ?? null,
      };
    },
  };
}
