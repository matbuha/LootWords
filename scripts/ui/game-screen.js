import { getPlayablePool } from "../core/progression.js";
import { gameText, t } from "../core/i18n.js";
import { getGameDefinition } from "../games/game-registry.js";
import { renderEmptyState } from "./ui-kit.js";

const COUNTDOWN_STEP_MS = 100;
const COUNTDOWN_START_MS = 3400;

function formatVictoryLabel(key) {
  const mapping = {
    timeLeftMs: t("play.timeLeftLabel"),
    roundsCleared: t("play.roundsClearedLabel"),
    heartsLeft: t("play.heartsLeftLabel"),
    bestChain: t("play.bestChainLabel"),
    hits: t("play.hitsLabel"),
    bestCombo: t("play.bestComboLabel"),
    moves: t("play.movesLabel"),
    matches: t("play.matchesLabel"),
    roundIndex: t("play.roundsClearedLabel"),
    misses: t("play.missesLabel"),
  };

  return mapping[key] ?? key;
}

function formatVictoryValue(key, value) {
  if (key.endsWith("Ms") && typeof value === "number") {
    return t("play.statTime", { value: Math.max(0, Math.round(value / 1000)) }).replace(/^[^:：]*[:：]\s*/, "");
  }

  return String(value);
}

function renderVictoryStats(result) {
  if (!result?.details) {
    return "";
  }

  const detailRows = Object.entries(result.details)
    .map(
      ([key, value]) => `
        <div class="victory-chip">
          <span>${formatVictoryLabel(key)}</span>
          <strong>${formatVictoryValue(key, value)}</strong>
        </div>
      `,
    )
    .join("");

  return `
    <div class="victory-chip-row">
      ${detailRows}
    </div>
  `;
}

function renderOutcomeSummary(result) {
  if (!result?.summary) {
    return "";
  }

  if (result.status === "won") {
    const rewardChips = [
      `<div class="victory-chip victory-chip--reward"><span>${t("play.rewardBoxes")}</span><strong>+${result.summary.boxesAwarded}</strong></div>`,
      `<div class="victory-chip"><span>${t("play.streak")}</span><strong>${result.summary.currentStreak}</strong></div>`,
      `<div class="victory-chip"><span>${t("play.totalWins")}</span><strong>${result.summary.totalWins}</strong></div>`,
    ];

    if (result.summary.firstWinBonusBoxes > 0) {
      rewardChips.push(
        `<div class="victory-chip victory-chip--bonus"><span>${t("play.firstWinBonusReward")}</span><strong>+${result.summary.firstWinBonusBoxes}</strong></div>`,
      );
    }

    if (result.summary.milestoneBonusStars > 0) {
      rewardChips.push(
        `<div class="victory-chip victory-chip--bonus"><span>${t("play.milestoneStars")}</span><strong>+${result.summary.milestoneBonusStars}</strong></div>`,
      );
    }

    return `
      <div class="victory-chip-row victory-chip-row--rewards">
        ${rewardChips.join("")}
      </div>
    `;
  }

  return `
    <div class="victory-chip-row victory-chip-row--rewards">
      <div class="victory-chip"><span>${t("play.bestStreak")}</span><strong>${result.summary.bestStreak}</strong></div>
      <div class="victory-chip"><span>${t("play.lossesHere")}</span><strong>${result.summary.lossCount}</strong></div>
      ${
        result.summary.streakEnded
          ? `<div class="victory-chip victory-chip--bonus"><span>${t("play.streakReset")}</span><strong>${t("play.backToZero")}</strong></div>`
          : ""
      }
    </div>
  `;
}

function renderGameChoice(game) {
  return `
    <button class="game-choice game-choice--rich" type="button" data-play-select="${game.id}">
      <div class="game-choice__topline">
        <span class="game-choice__icon" aria-hidden="true">${game.icon}</span>
        <span class="small-label">${gameText(game.id, "lengthLabel")}</span>
      </div>
      <strong>${gameText(game.id, "label")}</strong>
      <span>${gameText(game.id, "description")}</span>
      <div class="game-choice__meta">
        <span>${gameText(game.id, "energyLabel")}</span>
        <span>${game.stats.wins}/${game.stats.plays}</span>
      </div>
      <div class="game-choice__footer">
        <span class="small-label">${gameText(game.id, "rewardText")}</span>
        <span class="game-choice__bonus">${game.isFirstWinAvailable ? t("play.bonusReady") : t("play.lootRunReady")}</span>
      </div>
    </button>
  `;
}

function getCountdownDisplay(remainingMs) {
  if (remainingMs > 2400) {
    return "3";
  }

  if (remainingMs > 1400) {
    return "2";
  }

  if (remainingMs > 400) {
    return "1";
  }

  return t("play.countdownStart");
}

function renderSelectionView(container, { playSummary, progress, actions }) {
  const favoriteLabel = playSummary.favoriteGame ? gameText(playSummary.favoriteGame.id, "label") : t("play.stillPicking");

  container.innerHTML = `
    <div class="screen-stack screen-stack--play-selection">
      <section class="section-panel section-panel--compact section-panel--play-hub section-panel--play-hub-compact">
        <div class="screen-header screen-header--compact">
          <div>
            <span class="small-label">${t("play.title")}</span>
            <h2 class="section-title">${favoriteLabel}</h2>
            <p class="screen-note">${t("play.selectionBody")}</p>
          </div>
          <div class="button-row button-row--wrap">
            <button class="primary-button" type="button" data-play-recommended="${playSummary.recommendedGame?.id ?? ""}">
              ${playSummary.recommendedGame ? t("play.playRecommended", { game: gameText(playSummary.recommendedGame.id, "shortLabel") }) : t("home.playRecommended")}
            </button>
            <button class="secondary-button" type="button" data-play-random="${playSummary.randomGame?.id ?? ""}">
              ${playSummary.randomGame ? t("play.playRandom", { game: gameText(playSummary.randomGame.id, "shortLabel") }) : t("home.randomGame")}
            </button>
            <button class="ghost-button" type="button" data-route="reward">
              ${progress.rewardBoxes > 0 ? t("play.openBoxes", { count: progress.rewardBoxes }) : t("play.rewardRoom")}
            </button>
          </div>
        </div>

        <div class="session-strip session-strip--compact">
          <article class="session-chip session-chip--glow">
            <span>${t("home.currentStreak")}</span>
            <strong data-count-to="${progress.currentStreak}" data-count-key="game-current-streak">${progress.currentStreak}</strong>
            <small>${t("common.bestValue", { value: progress.bestStreak })}</small>
          </article>
          <article class="session-chip">
            <span>${t("play.nextMilestone")}</span>
            <strong data-count-to="${playSummary.nextMilestoneTarget}" data-count-key="game-next-milestone">${playSummary.nextMilestoneTarget}</strong>
            <small>${t("play.winsToGo", { count: playSummary.winsUntilMilestone })}</small>
          </article>
        </div>

        <div class="game-switcher game-switcher--grid game-switcher--compact">
          ${playSummary.gameProgress.map((game) => renderGameChoice(game)).join("")}
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll("[data-play-select]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigate("play", { game: button.dataset.playSelect });
    });
  });

  container.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigate(button.dataset.route);
    });
  });

  container.querySelectorAll("[data-play-random]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.playRandomGame(button.dataset.playRandom || null);
    });
  });

  container.querySelectorAll("[data-play-recommended]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.playRecommendedGame(button.dataset.playRecommended || null);
    });
  });

  return {
    destroy() {},
    advanceTime() {},
    getDebugState() {
      return {
        screen: "play-selection",
        totalPlays: playSummary.totalPlays,
        recommendedGameId: playSummary.recommendedGame?.id ?? null,
      };
    },
  };
}

export function renderGameScreen(container, { route, cards, result, progress, actions, playSound }) {
  const playSummary = progress.playSummary;
  const gameId = route.game ? getGameDefinition(route.game).id : null;

  if (!gameId) {
    return renderSelectionView(container, {
      playSummary,
      progress,
      actions,
    });
  }

  const gameMeta = playSummary.gameProgress.find((game) => game.id === gameId) ?? getGameDefinition(gameId);
  const playableCards = gameMeta.usesCardPool ? getPlayablePool(cards, gameMeta.minimumCardPool) : cards;
  const hasPlayableCardPool = !gameMeta.usesCardPool || playableCards.length > 0;

  container.innerHTML = `
    <div class="screen-stack screen-stack--play-active">
      <section class="arena-panel arena-panel--game arena-panel--game-focus">
        <div class="play-active__top">
          <button class="ghost-button play-active__back" type="button" data-play-back="true">${t("play.backToGames")}</button>
          <button class="ghost-button" type="button" data-route="reward">
            ${progress.rewardBoxes > 0 ? t("play.openBoxes", { count: progress.rewardBoxes }) : t("play.rewardRoom")}
          </button>
        </div>

        <div class="arena-summary arena-summary--focus">
          <div>
            <span class="small-label">${t("play.playLab")}</span>
            <h3 class="section-title">${gameText(gameMeta.id, "label")}</h3>
            <p class="screen-note">${gameText(gameMeta.id, "description")}</p>
          </div>
          <div class="arena-summary__stats">
            <span class="arena-stat">${gameMeta.icon} ${gameText(gameMeta.id, "energyLabel")}</span>
            <span class="arena-stat">${gameText(gameMeta.id, "lengthLabel")}</span>
            <span class="arena-stat">${gameMeta.stats.wins}/${gameMeta.stats.plays}</span>
          </div>
        </div>

        <div class="play-active__game-wrap">
          <div id="game-host"></div>
          <div class="game-countdown" data-game-countdown hidden>
            <div class="game-countdown__halo" aria-hidden="true"></div>
            <span class="small-label">${t("play.countdownLabel")}</span>
            <strong class="game-countdown__value">3</strong>
            <span class="game-countdown__copy">${t("play.countdownBody")}</span>
          </div>
          ${
            result && result.gameId === gameId
              ? `
                <div class="game-overlay ${result.status === "won" ? "is-win" : "is-lose"}">
                  <div class="game-overlay__sparkles" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="small-label">${result.status === "won" ? t("play.victory") : t("play.roundOver")}</span>
                  <h3 class="section-title">${result.status === "won" ? t("play.rewardSecured") : t("play.jumpBackIn")}</h3>
                  <p class="section-copy">
                    ${result.status === "won" ? t("play.winCopy") : t("play.loseCopy")}
                  </p>
                  ${renderOutcomeSummary(result)}
                  ${result.status === "won" ? renderVictoryStats(result) : ""}
                  <div class="cta-stack">
                    ${
                      result.status === "won"
                        ? `<button class="primary-button" type="button" data-route="reward">${t("play.openRewardBox")}</button>`
                        : `<button class="primary-button" type="button" data-reset-game="true">${t("play.replayGame")}</button>`
                    }
                    <button class="secondary-button" type="button" data-reset-game="true">${t("play.playThisGameAgain")}</button>
                    <button class="ghost-button" type="button" data-play-random="${gameId}">${t("play.tryRandomGame")}</button>
                  </div>
                </div>
              `
              : ""
          }
        </div>
      </section>
    </div>
  `;

  container.querySelector("[data-play-back]")?.addEventListener("click", () => {
    actions.navigate("play");
  });

  container.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigate(button.dataset.route);
    });
  });

  container.querySelectorAll("[data-reset-game]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.clearGameResult();
    });
  });

  container.querySelectorAll("[data-play-random]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.playRandomGame(button.dataset.playRandom);
    });
  });

  const countdownNode = container.querySelector("[data-game-countdown]");
  const countdownValueNode = countdownNode?.querySelector(".game-countdown__value");
  const countdownCopyNode = countdownNode?.querySelector(".game-countdown__copy");
  const gameHost = container.querySelector("#game-host");

  let mountedGame = null;
  let countdownHandle = 0;
  let countdownRemainingMs = result || !hasPlayableCardPool ? 0 : COUNTDOWN_START_MS;

  function renderCountdown() {
    if (!countdownNode) {
      return;
    }

    if (countdownRemainingMs <= 0 || result || !hasPlayableCardPool) {
      countdownNode.hidden = true;
      countdownNode.classList.add("is-hidden");
      return;
    }

    const displayValue = getCountdownDisplay(countdownRemainingMs);
    countdownNode.hidden = false;
    countdownNode.classList.remove("is-hidden");
    countdownNode.dataset.phase = displayValue === t("play.countdownStart") ? "start" : "countdown";
    countdownValueNode.textContent = displayValue;
    countdownCopyNode.textContent =
      displayValue === t("play.countdownStart") ? t("play.countdownGo") : t("play.countdownBody");
  }

  function mountSelectedGame() {
    if (mountedGame || result || !hasPlayableCardPool) {
      return;
    }

    mountedGame = gameMeta.mount(gameHost, {
      cards: playableCards,
      playSound,
      onWin(details) {
        actions.finishGame({ status: "won", gameId, details });
      },
      onLose(details) {
        actions.finishGame({ status: "lost", gameId, details });
      },
    });
  }

  function stepCountdown(deltaMs) {
    if (countdownRemainingMs <= 0 || result || !hasPlayableCardPool) {
      return false;
    }

    const previousValue = getCountdownDisplay(countdownRemainingMs);
    countdownRemainingMs = Math.max(0, countdownRemainingMs - deltaMs);
    const nextValue = countdownRemainingMs > 0 ? getCountdownDisplay(countdownRemainingMs) : null;

    if (countdownRemainingMs <= 0) {
      renderCountdown();
      mountSelectedGame();
      return true;
    }

    if (previousValue !== nextValue) {
      renderCountdown();
      return true;
    }

    return false;
  }

  if (!hasPlayableCardPool) {
    gameHost.innerHTML = renderEmptyState(
      t("emptyState.noPlayablePoolTitle"),
      t("emptyState.noPlayablePoolBody"),
    );
    renderCountdown();
  } else if (result && result.gameId === gameId) {
    renderCountdown();
  } else {
    renderCountdown();
    countdownHandle = window.setInterval(() => {
      stepCountdown(COUNTDOWN_STEP_MS);
    }, COUNTDOWN_STEP_MS);
  }

  if (!result) {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  return {
    destroy() {
      window.clearInterval(countdownHandle);
      mountedGame?.destroy?.();
    },
    advanceTime(milliseconds) {
      if (countdownRemainingMs > 0 && !result && hasPlayableCardPool) {
        const previousRemainingMs = countdownRemainingMs;
        stepCountdown(milliseconds);

        if (previousRemainingMs > 0 && countdownRemainingMs <= 0) {
          const leftoverMs = Math.max(0, milliseconds - previousRemainingMs);
          if (leftoverMs > 0) {
            mountedGame?.advanceTime?.(leftoverMs);
          }
        }
        return;
      }

      mountedGame?.advanceTime?.(milliseconds);
    },
    getDebugState() {
      return (
        mountedGame?.getDebugState?.() ?? {
          screen: "play-active",
          gameId,
          countdownRemainingMs,
          status: result?.status ?? (countdownRemainingMs > 0 ? "countdown" : "ready"),
          totalPlays: playSummary.totalPlays,
        }
      );
    },
  };
}
