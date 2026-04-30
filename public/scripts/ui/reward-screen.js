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
        <div class="reward-reveal__launch" data-rarity="${card.rarity}">
          <div class="reward-reveal__spin">
            ${renderDetailCard(card, { locked: false, isNew })}
          </div>
          <div class="reward-reveal__shadow" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  `;
}

function renderRewardTokenShowcase(reward, { title, detail, eyebrow }) {
  return `
    <div class="celebration-card celebration-card--reward celebration-card--reward-info reward-token-card" data-rarity="${reward.rarity ?? "common"}">
      <div class="reward-token-card__icon" aria-hidden="true">${reward.itemIcon ?? "✨"}</div>
      <span class="small-label">${eyebrow}</span>
      <h3 class="section-title">${title}</h3>
      <p class="section-copy">${detail}</p>
    </div>
  `;
}

function getRewardRarityStage(rewardState, rewardCard) {
  return (
    rewardState.opening?.currentRarity ??
    rewardState.pendingReveal?.rarity ??
    rewardState.reveal?.rarity ??
    rewardCard?.rarity ??
    "dormant"
  );
}

function getBoxStateClass(rewardState, revealPhase) {
  if (revealPhase === "opening") {
    return "reward-box--opening";
  }

  if (revealPhase === "revealed") {
    return "reward-box--opened";
  }

  if (revealPhase === "upgraded") {
    return "reward-box--upgraded";
  }

  const stageClicks = rewardState.opening?.stageClicks ?? 0;
  if (stageClicks <= 0) {
    return "reward-box--idle";
  }

  return `reward-box--tap-${Math.min(stageClicks, Math.max(1, BOX_TAP_COUNT - 1))}`;
}

function getPhaseCopy(rewardState, rewardBoxes, activeCardCount) {
  const currentRarity = rewardState.opening?.currentRarity ?? null;
  const rarityLabel = currentRarity ? t(`rarities.${currentRarity}`) : "";
  const stageClicks = rewardState.opening?.stageClicks ?? 0;

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
      hint: rewardBoxes > 0 ? t("reward.anotherBoxWaiting") : t("reward.enjoyNewLoot"),
    };
  }

  if (rewardBoxes <= 0) {
    return {
      eyebrow: t("reward.noBoxReady"),
      title: t("reward.refillRewardRoom"),
      hint: t("reward.refillHint"),
    };
  }

  if (rewardState.phase === "upgraded") {
    return {
      eyebrow: t("reward.rarityUpgraded"),
      title: t("reward.upgradedToRarity", { rarity: rarityLabel }),
      hint: t("reward.upgradeContinueHint", { count: BOX_TAP_COUNT }),
    };
  }

  if (stageClicks >= BOX_TAP_COUNT - 1) {
    return {
      eyebrow: t("reward.almostOpen"),
      title: t("reward.finalTapBurst"),
      hint:
        currentRarity === "legend"
          ? t("reward.finalTapBurstHint")
          : t("reward.finalTapStageHint", { rarity: rarityLabel }),
    };
  }

  if (stageClicks === 1) {
    return {
      eyebrow: rarityLabel ? t("reward.currentStage", { rarity: rarityLabel }) : t("reward.somethingHappening"),
      title: t("reward.boxWakingUp"),
      hint: t("reward.currentStageHint", {
        rarity: rarityLabel,
        remaining: BOX_TAP_COUNT - stageClicks,
      }),
    };
  }

  if (stageClicks > 1) {
    return {
      eyebrow: rarityLabel ? t("reward.currentStage", { rarity: rarityLabel }) : t("reward.magicBurst"),
      title: t("reward.pressureBuilding"),
      hint: t("reward.currentStageHint", {
        rarity: rarityLabel,
        remaining: BOX_TAP_COUNT - stageClicks,
      }),
    };
  }

  return {
    eyebrow: t("reward.rewardBox"),
    title: t("reward.tapExactCount", { count: BOX_TAP_COUNT }),
    hint: t("reward.tapHint", { count: BOX_TAP_COUNT }),
  };
}

export function renderRewardScreen(container, { rewardState, rewardCard, rewardBoxes, activeCardCount, actions }) {
  const stageClicks = rewardState.opening?.stageClicks ?? 0;
  const meter = Array.from({ length: BOX_TAP_COUNT }, (_, index) => index < stageClicks);
  const revealPhase = rewardState.phase ?? "idle";
  const phaseCopy = getPhaseCopy(rewardState, rewardBoxes, activeCardCount);
  const boxStateClass = getBoxStateClass(rewardState, revealPhase);
  const cinematicActive = revealPhase !== "revealed" && (Boolean(rewardState.opening) || revealPhase === "opening");
  const cinematicRarity = getRewardRarityStage(rewardState, rewardCard);
  const upgradeCount = rewardState.opening?.upgradeHistory?.length ?? 0;
  const rarityLabel = rewardState.opening?.currentRarity ? t(`rarities.${rewardState.opening.currentRarity}`) : "";
  const stageStatusMarkup = rewardState.opening
    ? `
      <div class="reward-stage-status" data-rarity="${rewardState.opening.currentRarity}">
        <span class="small-label">${t("reward.currentStage", { rarity: rarityLabel })}</span>
        <strong>${rarityLabel}</strong>
        <small>${
          upgradeCount > 0
            ? t("reward.upgradesCount", { count: upgradeCount })
            : t("reward.baseStage")
        }</small>
      </div>
    `
    : "";

  const boxVisualStage = revealPhase === "idle" && stageClicks === 0 ? "dormant" : cinematicRarity;

  document.body.classList.toggle("has-reward-cinematic", cinematicActive);

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
  } else if (rewardState.reveal?.type === "coins") {
    revealMarkup = `
      <div class="celebration-card celebration-card--reward celebration-card--reward-info" data-rarity="${rewardState.reveal.rarity}">
        <span class="small-label">${t("reward.types.coins")}</span>
        <h3 class="section-title">${t("reward.coinRewardTitle", { amount: rewardState.reveal.amount })}</h3>
        <p class="section-copy">${t("reward.coinRewardDetail", { amount: rewardState.reveal.amount })}</p>
      </div>
    `;
  } else if (rewardState.reveal?.type === "sticker") {
    revealMarkup = renderRewardTokenShowcase(rewardState.reveal, {
      eyebrow: t("reward.types.sticker"),
      title: t("reward.stickerRewardTitle", {
        item: rewardState.reveal.itemName ?? rewardState.reveal.itemLabel ?? rewardState.reveal.itemId,
      }),
      detail: t("reward.stickerRewardDetail", {
        item: rewardState.reveal.itemName ?? rewardState.reveal.itemLabel ?? rewardState.reveal.itemId,
      }),
    });
  } else if (rewardState.reveal?.type === "sticker-duplicate") {
    revealMarkup = renderRewardTokenShowcase(rewardState.reveal, {
      eyebrow: t("reward.types.sticker"),
      title: t("reward.stickerDuplicateTitle", {
        item: rewardState.reveal.itemName ?? rewardState.reveal.itemLabel ?? rewardState.reveal.itemId,
      }),
      detail: t("reward.stickerDuplicateDetail", {
        item: rewardState.reveal.itemName ?? rewardState.reveal.itemLabel ?? rewardState.reveal.itemId,
        amount: rewardState.reveal.amount,
      }),
    });
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
  } else if (rewardState.reveal) {
    revealMarkup = `
      <div class="celebration-card celebration-card--reward celebration-card--reward-info" data-rarity="${rewardState.reveal.rarity}">
        <span class="small-label">${rewardState.reveal.typeLabelKey ? t(rewardState.reveal.typeLabelKey) : t("reward.rewardNote")}</span>
        <h3 class="section-title">${t("reward.rewardUnlockedTitle")}</h3>
        <p class="section-copy">${t("reward.rewardUnlockedDetail", { item: rewardState.reveal.itemLabel ?? rewardState.reveal.itemId ?? t("reward.rewardNote") })}</p>
      </div>
    `;
  }

  container.innerHTML = `
    <section
      class="reward-panel reward-panel--${revealPhase} ${cinematicActive ? "reward-panel--cinematic" : ""}"
      data-reward-rarity="${boxVisualStage}"
      data-reward-clicks="${stageClicks}"
    >
      <div class="reward-layout">
        <div class="reward-box-stage">
          <div class="screen-header">
            <div>
              <span class="small-label">${phaseCopy.eyebrow}</span>
              <h2 class="reward-title">${phaseCopy.title}</h2>
            </div>
            <div class="hero-stats hero-stats--compact">
              <div class="stat-card stat-card--glow">
                <span>${t("reward.boxesReady")}</span>
                <strong>${rewardBoxes}</strong>
                <small>${rewardBoxes > 0 ? t("reward.stashWaiting") : t("reward.clearGameToRefill")}</small>
              </div>
            </div>
          </div>

          ${stageStatusMarkup}
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
              data-cinematic="${cinematicActive ? "true" : "false"}"
              aria-label="${t("common.rewardBoxAria")}"
            >
              <div class="reward-box ${boxStateClass}" data-tension="${stageClicks}" data-rarity="${boxVisualStage}">
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

          <div class="reward-meter">
            ${meter.map((filled) => `<span class="${filled ? "is-filled" : ""}"></span>`).join("")}
          </div>
          <p class="reward-hint">${phaseCopy.hint}</p>
          <div class="button-row button-row--wrap reward-actions">
            ${
              rewardState.reveal
                ? `<button class="primary-button" type="button" data-reset-box="true">${rewardBoxes > 0 ? t("reward.queueNextBox") : t("reward.resetRewardRoom")}</button>`
                : `<button class="secondary-button" type="button" data-route="play" data-game="memory-match">${t("common.earnMoreBoxes")}</button>`
            }
            <button class="ghost-button" type="button" data-route="collection">${t("common.openAlbum")}</button>
          </div>
        </div>

        <div class="reward-reveal reward-reveal--${revealPhase}">
          <div class="reward-reveal__header">
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
    destroy() {
      document.body.classList.remove("has-reward-cinematic");
    },
    getDebugState() {
      return {
        screen: "reward",
        rewardBoxes,
        clicks: stageClicks,
        currentRarity: rewardState.opening?.currentRarity ?? null,
        upgradeCount,
        phase: revealPhase,
        reveal: rewardState.reveal?.type ?? null,
      };
    },
  };
}
