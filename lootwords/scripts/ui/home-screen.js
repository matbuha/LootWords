import { GAME_CONFIG } from "../data/config.js";
import { renderCard, renderEmptyState } from "./ui-kit.js";

export function renderHomeScreen(container, { progress, actions, newestCard }) {
  const stashLabel =
    progress.rewardBoxes > 0
      ? `${progress.rewardBoxes} reward ${progress.rewardBoxes === 1 ? "box" : "boxes"} ready`
      : "Win a mini-game to earn your next box";

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
          <h1 class="headline">Play short games. Crack open loot. Keep the words you win.</h1>
          <p class="body-copy">
            LootWords turns every victory into a collectible noun card, so the learning material feels earned instead of assigned.
          </p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-route="play" data-game="memory-match">Start a loot run</button>
            <button class="secondary-button" type="button" data-route="reward">${progress.rewardBoxes > 0 ? "Open my box" : "See reward room"}</button>
            <button class="ghost-button" type="button" data-route="collection">Open album</button>
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
              <span>Total wins</span>
              <strong>${progress.totalWins}</strong>
              <small>${progress.recentCardIds.length} fresh cards</small>
            </div>
            <div class="stat-card">
              <span>Bonus stars</span>
              <strong>${progress.bonusStars}</strong>
              <small>Overflow reward bank</small>
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
                <span>Reward Card</span>
                <span>Legend Tier</span>
              </div>
              <div class="showcase-card__emoji" aria-hidden="true">🏆</div>
              <div class="showcase-card__word">Loot Rush</div>
              <div class="showcase-card__bottom">
                <span>Earned, not given</span>
                <span>1000 pts</span>
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

      <section class="section-panel section-panel--compact">
        <div class="screen-header">
          <div>
            <span class="small-label">Play next</span>
            <h2 class="section-title">Choose a quick loot run</h2>
          </div>
          <p class="screen-note">Fast rounds, strong feedback, one reward box per win.</p>
        </div>
        <div class="game-switcher">
          ${Object.values(GAME_CONFIG)
            .map(
              (game) => `
                <button class="game-choice game-choice--home" type="button" data-route="play" data-game="${game.id}">
                  <strong>${game.label}</strong>
                  <span>${game.description}</span>
                  <span class="small-label">${game.rewardText}</span>
                </button>
              `,
            )
            .join("")}
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
    </div>
  `;

  container.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigate(button.dataset.route, { game: button.dataset.game });
    });
  });

  return {
    destroy() {},
    getDebugState() {
      return {
        screen: "home",
        rewardBoxes: progress.rewardBoxes,
        totalUnlocked: progress.totalUnlocked,
      };
    },
  };
}
