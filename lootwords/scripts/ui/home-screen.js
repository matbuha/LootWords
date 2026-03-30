import { GAME_CONFIG } from "../data/config.js";
import { renderCard } from "./ui-kit.js";

export function renderHomeScreen(container, { progress, actions, newestCard }) {
  const newestMarkup = newestCard
    ? renderCard(newestCard, { locked: false })
    : `
        <div class="empty-state">
          <h3 class="section-title">No loot yet</h3>
          <p class="section-copy">Win a mini-game to earn your first reward box and start the collection.</p>
        </div>
      `;

  container.innerHTML = `
    <div class="screen-stack">
      <section class="hero-panel">
        <div class="hero-copy">
          <span class="eyebrow">Reward first. Learn while playing.</span>
          <h1 class="headline">Collect shiny word cards from fast mini-games.</h1>
          <p class="body-copy">
            Every win unlocks a reward box. Crack it open in three taps and add a new noun card to your loot room.
          </p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-route="play" data-game="memory-match">Play now</button>
            <button class="secondary-button" type="button" data-route="reward">Open reward box</button>
            <button class="ghost-button" type="button" data-route="collection">See collection</button>
          </div>
          <div class="hero-stats">
            <div class="stat-card">
              <span>Cards unlocked</span>
              <strong>${progress.totalUnlocked}/${progress.totalCards}</strong>
            </div>
            <div class="stat-card">
              <span>Reward boxes</span>
              <strong>${progress.rewardBoxes}</strong>
            </div>
            <div class="stat-card">
              <span>Total wins</span>
              <strong>${progress.totalWins}</strong>
            </div>
            <div class="stat-card">
              <span>Bonus stars</span>
              <strong>${progress.bonusStars}</strong>
            </div>
          </div>
        </div>
        <div class="hero-art">
          <div class="vault-scene">
            <div class="vault-ring"></div>
            <div class="showcase-card">
              <div class="showcase-card__top">
                <span>Loot Card</span>
                <span>Epic</span>
              </div>
              <div class="showcase-card__emoji" aria-hidden="true">💎</div>
              <div class="showcase-card__word">Treasure</div>
              <div class="showcase-card__bottom">
                <span>Fantasy</span>
                <span>801 pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-panel">
        <div class="screen-header">
          <div>
            <span class="small-label">Mini-games</span>
            <h2 class="section-title">Choose a quick loot run</h2>
          </div>
          <p class="screen-note">Keep rounds short, shiny, and replayable.</p>
        </div>
        <div class="game-switcher">
          ${Object.values(GAME_CONFIG)
            .map(
              (game) => `
                <button class="game-choice" type="button" data-route="play" data-game="${game.id}">
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
              <h2 class="section-title">Loot room progress</h2>
            </div>
            <button class="ghost-button" type="button" data-route="learn">Learn words</button>
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
