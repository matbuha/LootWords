import { BOX_TAP_COUNT } from "../data/config.js";
import { renderDetailCard } from "./ui-kit.js";

export function renderRewardScreen(container, { rewardState, rewardCard, rewardBoxes, actions }) {
  const meter = Array.from({ length: BOX_TAP_COUNT }, (_, index) => index < rewardState.clicks);
  const boxStateClass = rewardState.reveal
    ? "reward-box--opened"
    : rewardState.clicks === 2
      ? "reward-box--tap-2"
      : rewardState.clicks === 1
        ? "reward-box--tap-1"
        : "";

  container.innerHTML = `
    <section class="reward-panel">
      <div class="reward-layout">
        <div class="reward-box-stage">
          <div class="screen-header">
            <div>
              <span class="small-label">Reward box</span>
              <h2 class="reward-title">Tap exactly three times to crack it open</h2>
            </div>
            <div class="hero-stats">
              <div class="stat-card">
                <span>Boxes ready</span>
                <strong>${rewardBoxes}</strong>
              </div>
            </div>
          </div>

          <div class="reward-box-wrap">
            <div class="reward-sparkles" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <button
              class="reward-box-button ${rewardBoxes > 0 && !rewardState.reveal ? "is-clickable" : ""}"
              type="button"
              ${rewardBoxes <= 0 || rewardState.reveal ? "disabled" : ""}
              data-reward-box="true"
              aria-label="Reward box"
            >
              <div class="reward-box ${boxStateClass}">
                <div class="reward-box__shine"></div>
                <div class="reward-box__base"></div>
                <div class="reward-box__lid"></div>
                <div class="reward-box__ribbon-v"></div>
                <div class="reward-box__ribbon-h"></div>
                <div class="reward-box__cracks">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </button>
          </div>

          <div class="reward-meter">
            ${meter.map((filled) => `<span class="${filled ? "is-filled" : ""}"></span>`).join("")}
          </div>
          <p class="reward-hint">
            ${
              rewardBoxes <= 0
                ? "No reward boxes are waiting. Win a mini-game to earn one."
                : rewardState.reveal
                  ? "The box is open. Reset the stage to crack the next one."
                  : `${BOX_TAP_COUNT - rewardState.clicks} taps left until the reveal.`
            }
          </p>
          <div class="cta-stack">
            ${
              rewardState.reveal
                ? `<button class="primary-button" type="button" data-reset-box="true">${rewardBoxes > 0 ? "Open another box" : "Reset reveal"}</button>`
                : `<button class="secondary-button" type="button" data-route="play" data-game="memory-match">Play for more boxes</button>`
            }
            <button class="ghost-button" type="button" data-route="collection">See collection</button>
          </div>
        </div>

        <div class="reward-reveal">
          <div>
            <span class="small-label">Reveal</span>
            <h3 class="section-title">Loot spotlight</h3>
          </div>
          ${
            rewardState.reveal?.type === "card" && rewardCard
              ? `
                <div class="reward-reveal__card">
                  ${renderDetailCard(rewardCard, { locked: false })}
                </div>
                <div class="celebration-card">
                  <p class="section-copy"><strong>${rewardCard.word}</strong> joins your collection. Use the Learn screen to review it and lock in the memory.</p>
                </div>
              `
              : rewardState.reveal?.type === "stars"
                ? `
                  <div class="celebration-card">
                    <span class="small-label">All cards collected</span>
                    <h3 class="section-title">Bonus stars instead</h3>
                    <p class="section-copy">Every card is already unlocked, so this reward box turned into ${rewardState.reveal.amount} bonus stars.</p>
                  </div>
                `
                : `
                  <div class="empty-state">
                    <h3 class="section-title">Waiting for the reveal</h3>
                    <p class="section-copy">Tap the box to build suspense, then watch the card burst onto the screen.</p>
                  </div>
                `
          }
        </div>
      </div>
    </section>
  `;

  container.querySelector("[data-reward-box]")?.addEventListener("click", () => {
    actions.tapRewardBox();
  });

  container.querySelector("[data-reset-box]")?.addEventListener("click", () => {
    actions.resetRewardReveal();
  });

  container.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigate(button.dataset.route, { game: button.dataset.game });
    });
  });

  return {
    destroy() {},
    getDebugState() {
      return {
        screen: "reward",
        rewardBoxes,
        clicks: rewardState.clicks,
        reveal: rewardState.reveal?.type ?? null,
      };
    },
  };
}
