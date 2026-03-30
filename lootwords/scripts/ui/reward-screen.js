import { BOX_TAP_COUNT } from "../data/config.js";
import { renderDetailCard, renderEmptyState } from "./ui-kit.js";

function getPhaseCopy(rewardState, rewardBoxes) {
  if (rewardState.phase === "opening") {
    return {
      eyebrow: "Magic burst",
      title: "The box is cracking open",
      hint: "Hold for the reveal. This pause is the payoff tension before the card arrives.",
    };
  }

  if (rewardState.phase === "revealed") {
    return {
      eyebrow: "Reveal complete",
      title: "A new reward landed in your album",
      hint: rewardBoxes > 0 ? "Another reward box is still waiting in the stash." : "Use the collection and learn screens to enjoy the new card.",
    };
  }

  if (rewardBoxes <= 0) {
    return {
      eyebrow: "No box ready",
      title: "Win a mini-game to refill the reward room",
      hint: "No reward boxes are waiting. A victory instantly adds a new one to the stash.",
    };
  }

  if (rewardState.clicks === 2) {
    return {
      eyebrow: "Almost open",
      title: "One more tap for the burst reveal",
      hint: "The glow is peaking. The third tap will crack the lid and launch the reward.",
    };
  }

  if (rewardState.clicks === 1) {
    return {
      eyebrow: "Something is happening",
      title: "The box is waking up",
      hint: "A first crack appeared. Tap again to build more pressure.",
    };
  }

  return {
    eyebrow: "Reward box",
    title: "Tap exactly three times to crack it open",
    hint: "Three taps. Rising glow. Final burst. Keep it tight and satisfying.",
  };
}

export function renderRewardScreen(container, { rewardState, rewardCard, rewardBoxes, actions }) {
  const meter = Array.from({ length: BOX_TAP_COUNT }, (_, index) => index < rewardState.clicks);
  const revealPhase = rewardState.phase ?? "idle";
  const phaseCopy = getPhaseCopy(rewardState, rewardBoxes);
  const boxStateClass =
    revealPhase === "opening"
      ? "reward-box--opening"
      : revealPhase === "revealed"
        ? "reward-box--opened"
        : rewardState.clicks === 2
          ? "reward-box--tap-2"
          : rewardState.clicks === 1
            ? "reward-box--tap-1"
            : "reward-box--idle";

  const stageMarkup = [
    { step: 1, label: "Wake", detail: "Glow and shake" },
    { step: 2, label: "Charge", detail: "Cracks spread" },
    { step: 3, label: "Burst", detail: "Reveal the card" },
  ]
    .map(
      (entry) => `
        <div class="reward-stage ${rewardState.clicks >= entry.step ? "is-complete" : ""} ${rewardState.clicks + 1 === entry.step && !rewardState.reveal ? "is-current" : ""}">
          <strong>${entry.step}</strong>
          <span>${entry.label}</span>
          <small>${entry.detail}</small>
        </div>
      `,
    )
    .join("");

  let revealMarkup = renderEmptyState(
    "Waiting for the reveal",
    "Tap the box to build suspense, then watch the card burst onto the screen.",
  );

  if (revealPhase === "opening") {
    revealMarkup = `
      <div class="reward-anticipation">
        <div class="reward-flash" aria-hidden="true"></div>
        <div class="reward-flare reward-flare--one" aria-hidden="true"></div>
        <div class="reward-flare reward-flare--two" aria-hidden="true"></div>
        <div class="reward-anticipation__copy">
          <span class="small-label">Opening...</span>
          <h3 class="section-title">The card is about to burst out</h3>
          <p class="section-copy">A short pause makes the reward feel earned. The reveal is being staged right now.</p>
        </div>
      </div>
    `;
  } else if (rewardState.reveal?.type === "card" && rewardCard) {
    revealMarkup = `
      <div class="reward-reveal__card reward-reveal__card--showcase">
        <div class="reward-reveal__burst" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        ${renderDetailCard(rewardCard, { locked: false, isNew: true })}
      </div>
      <div class="celebration-card celebration-card--reward">
        <span class="card-fanfare">New card unlocked</span>
        <p class="section-copy">
          <strong>${rewardCard.word}</strong> just joined your collection. Jump to Learn to say it out loud, or open the album to see it in the full inventory.
        </p>
      </div>
    `;
  } else if (rewardState.reveal?.type === "stars") {
    revealMarkup = `
      <div class="celebration-card celebration-card--reward">
        <span class="small-label">All cards collected</span>
        <h3 class="section-title">Bonus stars instead</h3>
        <p class="section-copy">Every card is already unlocked, so this reward box transformed into ${rewardState.reveal.amount} bonus stars.</p>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="reward-panel reward-panel--${revealPhase}">
      <div class="reward-layout">
        <div class="reward-box-stage">
          <div class="screen-header">
            <div>
              <span class="small-label">${phaseCopy.eyebrow}</span>
              <h2 class="reward-title">${phaseCopy.title}</h2>
            </div>
            <div class="hero-stats">
              <div class="stat-card stat-card--glow">
                <span>Boxes ready</span>
                <strong>${rewardBoxes}</strong>
                <small>${rewardBoxes > 0 ? "Your stash is waiting" : "Clear a game to refill it"}</small>
              </div>
            </div>
          </div>

          <div class="reward-box-wrap">
            <div class="reward-sparkles" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="reward-stage-trail" aria-hidden="true"></div>
            <button
              class="reward-box-button ${rewardBoxes > 0 && !rewardState.reveal && revealPhase !== "opening" ? "is-clickable" : ""}"
              type="button"
              ${rewardBoxes <= 0 || rewardState.reveal || revealPhase === "opening" ? "disabled" : ""}
              data-reward-box="true"
              aria-label="Reward box"
            >
              <div class="reward-box ${boxStateClass}">
                <div class="reward-box__shine"></div>
                <div class="reward-box__glow"></div>
                <div class="reward-box__aura"></div>
                <div class="reward-box__base"></div>
                <div class="reward-box__lid"></div>
                <div class="reward-box__ribbon-v"></div>
                <div class="reward-box__ribbon-h"></div>
                <div class="reward-box__cracks">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="reward-box__burst-lines" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </button>
          </div>

          <div class="reward-stage-list">
            ${stageMarkup}
          </div>
          <div class="reward-meter">
            ${meter.map((filled) => `<span class="${filled ? "is-filled" : ""}"></span>`).join("")}
          </div>
          <p class="reward-hint">${phaseCopy.hint}</p>
          <div class="cta-stack">
            ${
              rewardState.reveal
                ? `<button class="primary-button" type="button" data-reset-box="true">${rewardBoxes > 0 ? "Queue the next box" : "Reset reward room"}</button>`
                : `<button class="secondary-button" type="button" data-route="play" data-game="memory-match">Earn more boxes</button>`
            }
            <button class="ghost-button" type="button" data-route="collection">Open album</button>
          </div>
        </div>

        <div class="reward-reveal">
          <div>
            <span class="small-label">Loot spotlight</span>
            <h3 class="section-title">Make the reward feel special</h3>
          </div>
          ${revealMarkup}
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
        phase: revealPhase,
        reveal: rewardState.reveal?.type ?? null,
      };
    },
  };
}
