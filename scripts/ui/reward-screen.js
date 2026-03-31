import { BOX_TAP_COUNT } from "../data/config.js";
import { t } from "../core/i18n.js";
import { renderDetailCard, renderEmptyState } from "./ui-kit.js";

function renderRewardCardShowcase(card, { isNew = false } = {}) {
  return `
    <div class="reward-reveal__card reward-reveal__card--showcase" data-rarity="${card.rarity}">
      <div class="reward-reveal__stage" data-rarity="${card.rarity}">
        <div class="reward-reveal__flash-disk" aria-hidden="true"></div>
        <div class="reward-reveal__trail" aria-hidden="true"></div>
        <div class="reward-reveal__burst" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="reward-reveal__launch">
          <div class="reward-reveal__spin">
            ${renderDetailCard(card, { locked: false, isNew })}
          </div>
          <div class="reward-reveal__shadow" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  `;
}

function getPhaseCopy(rewardState, rewardBoxes, activeCardCount) {
  if (rewardState.reveal?.type === "blocked" || activeCardCount === 0) {
    return {
      eyebrow: t("reward.contentPaused"),
      title: t("reward.rewardsNeedActiveCards"),
      hint: t("reward.contentPausedHint"),
    };
  }

  if (rewardState.phase === "opening") {
    return {
      eyebrow: t("reward.magicBurst"),
      title: t("reward.crackingOpen"),
      hint: t("reward.openingHint"),
    };
  }

  if (rewardState.phase === "revealed") {
    return {
      eyebrow: t("reward.revealComplete"),
      title: t("reward.newRewardLanded"),
      hint: rewardBoxes > 0 ? t("reward.anotherBoxWaiting") : t("reward.enjoyNewCard"),
    };
  }

  if (rewardBoxes <= 0) {
    return {
      eyebrow: t("reward.noBoxReady"),
      title: t("reward.refillRewardRoom"),
      hint: t("reward.refillHint"),
    };
  }

  if (rewardState.clicks === 2) {
    return {
      eyebrow: t("reward.almostOpen"),
      title: t("reward.oneMoreTap"),
      hint: t("reward.oneMoreTapHint"),
    };
  }

  if (rewardState.clicks === 1) {
    return {
      eyebrow: t("reward.somethingHappening"),
      title: t("reward.boxWakingUp"),
      hint: t("reward.firstCrackHint"),
    };
  }

  return {
    eyebrow: t("reward.rewardBox"),
    title: t("reward.tapThreeTimes"),
    hint: t("reward.tapHint"),
  };
}

export function renderRewardScreen(container, { rewardState, rewardCard, rewardBoxes, activeCardCount, actions }) {
  const meter = Array.from({ length: BOX_TAP_COUNT }, (_, index) => index < rewardState.clicks);
  const revealPhase = rewardState.phase ?? "idle";
  const phaseCopy = getPhaseCopy(rewardState, rewardBoxes, activeCardCount);
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
    { step: 1, label: t("reward.wake"), detail: t("reward.glowAndShake") },
    { step: 2, label: t("reward.charge"), detail: t("reward.cracksSpread") },
    { step: 3, label: t("reward.burst"), detail: t("reward.revealCard") },
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
    t("emptyState.waitingRevealTitle"),
    t("emptyState.waitingRevealBody"),
  );

  if (revealPhase === "opening") {
    revealMarkup = `
      <div class="reward-anticipation">
        <div class="reward-flash" aria-hidden="true"></div>
        <div class="reward-flare reward-flare--one" aria-hidden="true"></div>
        <div class="reward-flare reward-flare--two" aria-hidden="true"></div>
        <div class="reward-anticipation__copy">
          <span class="small-label">${t("reward.opening")}</span>
          <h3 class="section-title">${t("reward.aboutToBurstOut")}</h3>
          <p class="section-copy">${t("reward.revealPause")}</p>
        </div>
      </div>
    `;
  } else if (rewardState.reveal?.type === "card" && rewardCard) {
    revealMarkup = `
      ${renderRewardCardShowcase(rewardCard, { isNew: true })}
      <div class="celebration-card celebration-card--reward celebration-card--reward-info" data-rarity="${rewardCard.rarity}">
        <span class="card-fanfare">${t("reward.newCardUnlocked")}</span>
        <p class="section-copy">
          ${t("reward.joinedCollection", { word: rewardCard.word })}
        </p>
      </div>
    `;
  } else if (rewardState.reveal?.type === "stars") {
    revealMarkup = `
      <div class="celebration-card celebration-card--reward">
        <span class="small-label">${t("reward.allCardsCollected")}</span>
        <h3 class="section-title">${t("reward.bonusStarsInstead")}</h3>
        <p class="section-copy">${t("reward.transformedStars", { amount: rewardState.reveal.amount })}</p>
      </div>
    `;
  } else if (rewardState.reveal?.type === "duplicate" && rewardCard) {
    revealMarkup = `
      ${renderRewardCardShowcase(rewardCard)}
      <div class="celebration-card celebration-card--reward celebration-card--reward-info" data-rarity="${rewardCard.rarity}">
        <span class="small-label">${t("reward.duplicateReward")}</span>
        <h3 class="section-title">${t("reward.pulledAgain", { word: rewardCard.word })}</h3>
        <p class="section-copy">${t("reward.duplicateStars", { amount: rewardState.reveal.amount })}</p>
      </div>
    `;
  } else if (rewardState.reveal?.type === "message") {
    revealMarkup = `
      <div class="celebration-card celebration-card--reward">
        <span class="small-label">${t("reward.rewardNote")}</span>
        <h3 class="section-title">${rewardState.reveal.titleKey ? t(rewardState.reveal.titleKey) : rewardState.reveal.title}</h3>
        <p class="section-copy">${rewardState.reveal.detailKey ? t(rewardState.reveal.detailKey) : rewardState.reveal.detail}</p>
      </div>
    `;
  } else if (rewardState.reveal?.type === "blocked") {
    revealMarkup = `
      <div class="celebration-card celebration-card--reward">
        <span class="small-label">${t("reward.rewardBlocked")}</span>
        <h3 class="section-title">${rewardState.reveal.titleKey ? t(rewardState.reveal.titleKey) : rewardState.reveal.title}</h3>
        <p class="section-copy">${rewardState.reveal.detailKey ? t(rewardState.reveal.detailKey) : rewardState.reveal.detail}</p>
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
                <span>${t("reward.boxesReady")}</span>
                <strong>${rewardBoxes}</strong>
                <small>${rewardBoxes > 0 ? t("reward.stashWaiting") : t("reward.clearGameToRefill")}</small>
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
              ${rewardBoxes <= 0 || rewardState.reveal || revealPhase === "opening" || activeCardCount === 0 ? "disabled" : ""}
              data-reward-box="true"
              aria-label="${t("common.rewardBoxAria")}"
            >
              <div class="reward-box ${boxStateClass}" data-tension="${rewardState.clicks}">
                <div class="reward-box__impact" aria-hidden="true"></div>
                <div class="reward-box__pressure-rings" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="reward-box__embers" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
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
                ? `<button class="primary-button" type="button" data-reset-box="true">${rewardBoxes > 0 ? t("reward.queueNextBox") : t("reward.resetRewardRoom")}</button>`
                : `<button class="secondary-button" type="button" data-route="play" data-game="memory-match">${t("common.earnMoreBoxes")}</button>`
            }
            <button class="ghost-button" type="button" data-route="collection">${t("common.openAlbum")}</button>
          </div>
        </div>

        <div class="reward-reveal reward-reveal--${revealPhase}">
          <div>
            <span class="small-label">${t("reward.lootSpotlight")}</span>
            <h3 class="section-title">${t("reward.makeRewardSpecial")}</h3>
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
