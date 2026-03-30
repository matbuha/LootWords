import { renderCard, renderEmptyState } from "./ui-kit.js";

function renderGamePickup(game, actionsLabel) {
  return `
    <article class="game-pick-card">
      <div class="game-pick-card__top">
        <span class="game-pick-card__icon" aria-hidden="true">${game.icon}</span>
        <span class="small-label">${game.lengthLabel}</span>
      </div>
      <strong>${game.label}</strong>
      <p>${game.description}</p>
      <div class="game-pick-card__meta">
        <span>${game.energyLabel}</span>
        <span>${game.stats.wins}/${game.stats.plays} wins</span>
      </div>
      <button class="secondary-button" type="button" data-route="play" data-game="${game.id}">${actionsLabel}</button>
    </article>
  `;
}

function renderGameChoice(game) {
  return `
    <button class="game-choice game-choice--home game-choice--rich" type="button" data-route="play" data-game="${game.id}">
      <div class="game-choice__topline">
        <span class="game-choice__icon" aria-hidden="true">${game.icon}</span>
        <span class="small-label">${game.lengthLabel}</span>
      </div>
      <strong>${game.label}</strong>
      <span>${game.description}</span>
      <div class="game-choice__meta">
        <span>${game.energyLabel}</span>
        <span>${game.stats.wins}/${game.stats.plays} wins</span>
      </div>
      <div class="game-choice__footer">
        <span class="small-label">${game.rewardText}</span>
        <span class="game-choice__bonus">${game.isFirstWinAvailable ? "First win bonus ready" : "Loot ready"}</span>
      </div>
    </button>
  `;
}

export function renderHomeScreen(container, { progress, actions, newestCard }) {
  const stashLabel =
    progress.rewardBoxes > 0
      ? `${progress.rewardBoxes} reward ${progress.rewardBoxes === 1 ? "box" : "boxes"} ready`
      : "Win a mini-game to earn your next box";
  const playSummary = progress.playSummary;
  const recommendedGame = playSummary.recommendedGame;
  const randomGame = playSummary.randomGame;

  const newestMarkup = newestCard
    ? renderCard(newestCard, { locked: false, isNew: true })
    : renderEmptyState(
        "No loot yet",
        "Win a mini-game to earn your first reward box and start the collection.",
      );

  container.innerHTML = `
    <div class="screen-stack">
      <section class="hero-panel hero-panel--home">
        <div class="hero-copy">
          <span class="eyebrow">Treasure room online</span>
          <h1 class="headline">Quick loot runs, bigger streaks, and one more reward box waiting after every win.</h1>
          <p class="body-copy">
            Jump into a mini-game, earn a box, and keep growing a collectible English word album that feels earned.
          </p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-play-recommended="home">
              ${recommendedGame ? `Recommended: ${recommendedGame.label}` : "Start a loot run"}
            </button>
            <button class="secondary-button" type="button" data-play-random="home">
              ${randomGame ? `Random: ${randomGame.label}` : "Random game"}
            </button>
            <button class="ghost-button" type="button" data-route="reward">${progress.rewardBoxes > 0 ? "Open my box" : "See reward room"}</button>
          </div>
          <div class="hero-stats">
            <div class="stat-card stat-card--glow">
              <span>Collection progress</span>
              <strong>${progress.totalUnlocked}/${progress.totalCards}</strong>
              <small>${progress.completionPercent}% complete</small>
            </div>
            <div class="stat-card">
              <span>Reward stash</span>
              <strong>${progress.rewardBoxes}</strong>
              <small>${stashLabel}</small>
            </div>
            <div class="stat-card">
              <span>Current streak</span>
              <strong>${progress.currentStreak}</strong>
              <small>Best ${progress.bestStreak}</small>
            </div>
            <div class="stat-card">
              <span>Boxes earned</span>
              <strong>${progress.rewardBoxesEarned}</strong>
              <small>${playSummary.winsUntilMilestone} wins to next milestone</small>
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
                <span>Next milestone</span>
                <span>${playSummary.nextMilestoneTarget} wins</span>
              </div>
              <div class="showcase-card__emoji" aria-hidden="true">🏆</div>
              <div class="showcase-card__word">${playSummary.favoriteGame?.label ?? "Find your favorite"}</div>
              <div class="showcase-card__bottom">
                <span>${playSummary.gamesTried}/${playSummary.gameProgress.length} games tried</span>
                <span>${progress.totalWins} wins</span>
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
              <h2 class="section-title">Quick picks for this session</h2>
            </div>
            <p class="screen-note">The first win in a new game grants an extra reward box.</p>
          </div>
          <div class="game-pick-grid">
            ${recommendedGame ? renderGamePickup(recommendedGame, "Play recommended") : ""}
            ${randomGame ? renderGamePickup(randomGame, "Try random") : ""}
          </div>
        </div>
        <div class="section-panel section-panel--spotlight">
          <div class="screen-header">
            <div>
              <span class="small-label">Latest reveal</span>
              <h2 class="section-title">Newest card</h2>
            </div>
          </div>
          ${newestMarkup}
        </div>
      </section>

      <section class="section-panel section-panel--compact">
        <div class="screen-header">
          <div>
            <span class="small-label">Game shelf</span>
            <h2 class="section-title">Choose any loot run</h2>
          </div>
          <p class="screen-note">Fast rounds, different rhythms, and cleaner routes to more rewards.</p>
        </div>
        <div class="game-switcher game-switcher--grid">
          ${playSummary.gameProgress.map((game) => renderGameChoice(game)).join("")}
        </div>
      </section>

      <section class="two-column">
        <div class="section-panel">
          <div class="screen-header">
            <div>
              <span class="small-label">Progress</span>
              <h2 class="section-title">Album progress by category</h2>
            </div>
            <button class="ghost-button" type="button" data-route="learn">Review words</button>
          </div>
          <div class="category-progress">
            ${progress.categoryCounts
              .map(
                (entry) => `
                  <article class="progress-chip">
                    <strong>${entry.label}</strong>
                    <span>${entry.unlocked}/${entry.total} unlocked</span>
                    <div class="progress-bar">
                      <div class="progress-bar__fill" style="width:${entry.percent}%"></div>
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
              <span class="small-label">Replay loop</span>
              <h2 class="section-title">Why play one more round?</h2>
            </div>
          </div>
          <div class="session-loop">
            <article class="progress-chip">
              <strong>Reward boxes earned</strong>
              <span>${progress.rewardBoxesEarned} total</span>
            </article>
            <article class="progress-chip">
              <strong>Games won at least once</strong>
              <span>${playSummary.gamesWon}/${playSummary.gameProgress.length}</span>
            </article>
            <article class="progress-chip">
              <strong>Bonus stars</strong>
              <span>${progress.bonusStars} saved</span>
            </article>
            <article class="progress-chip">
              <strong>Next milestone prize</strong>
              <span>+${playSummary.milestoneBonusStars} stars at ${playSummary.nextMilestoneTarget} wins</span>
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
