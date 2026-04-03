import { getPlayablePool } from "../core/progression.js";
import { gameText, t } from "../core/i18n.js";
import { getGameDefinition } from "../games/game-registry.js";
import { renderEmptyState } from "./ui-kit.js";

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

function renderGameChoice(game, activeGameId) {
  return `
    <button class="game-choice game-choice--rich ${game.id === activeGameId ? "is-active" : ""}" type="button" data-route="play" data-game="${game.id}">
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

export function renderGameScreen(container, { route, cards, result, progress, actions, playSound }) {
  const playSummary = progress.playSummary;
  const gameId = getGameDefinition(route.game).id;
  const gameMeta = playSummary.gameProgress.find((game) => game.id === gameId) ?? getGameDefinition(gameId);
  const recommendedGame = playSummary.recommendedGame;
  const randomGame = playSummary.randomGame;
  const favoriteLabel = playSummary.favoriteGame ? gameText(playSummary.favoriteGame.id, "label") : t("play.stillPicking");
  const noActiveContent = progress.totalCards === 0;

  container.innerHTML = `
    <div class="screen-stack screen-stack--play">
      <section class="section-panel section-panel--compact section-panel--play-hub section-panel--play-hub-compact">
        <div class="screen-header screen-header--compact">
          <div>
            <span class="small-label">${t("play.title")}</span>
            <h2 class="section-title">${favoriteLabel}</h2>
          </div>
          <div class="button-row button-row--wrap">
            <button class="primary-button" type="button" data-play-recommended="${gameId}" ${noActiveContent ? "disabled" : ""}>
              ${recommendedGame ? t("play.playRecommended", { game: gameText(recommendedGame.id, "shortLabel") }) : t("home.playRecommended")}
            </button>
            <button class="secondary-button" type="button" data-play-random="${gameId}" ${noActiveContent ? "disabled" : ""}>
              ${randomGame ? t("play.playRandom", { game: gameText(randomGame.id, "shortLabel") }) : t("home.randomGame")}
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
          ${playSummary.gameProgress.map((game) => renderGameChoice(game, gameId)).join("")}
        </div>
      </section>

      <section class="arena-panel arena-panel--game">
        <div class="arena-summary">
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
        <div id="game-host"></div>
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
                  ${
                    result.status === "won"
                      ? t("play.winCopy")
                      : t("play.loseCopy")
                  }
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
      </section>
    </div>
  `;

  container.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.navigate(button.dataset.route, { game: button.dataset.game });
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

  container.querySelectorAll("[data-play-recommended]").forEach((button) => {
    button.addEventListener("click", () => {
      actions.playRecommendedGame(button.dataset.playRecommended);
    });
  });

  const gameHost = container.querySelector("#game-host");
  const playableCards = gameMeta.usesCardPool ? getPlayablePool(cards, gameMeta.minimumCardPool) : cards;
  const hasPlayableCardPool = !gameMeta.usesCardPool || playableCards.length > 0;

  let mountedGame = null;

  if (!hasPlayableCardPool) {
    gameHost.innerHTML = renderEmptyState(
      t("emptyState.noPlayablePoolTitle"),
      t("emptyState.noPlayablePoolBody"),
    );
  } else if (!(result && result.gameId === gameId)) {
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

  return {
    destroy() {
      mountedGame?.destroy?.();
    },
    advanceTime(milliseconds) {
      mountedGame?.advanceTime?.(milliseconds);
    },
    getDebugState() {
      return mountedGame?.getDebugState?.() ?? {
        screen: "play",
        gameId,
        status: result?.status ?? "overlay",
        totalPlays: playSummary.totalPlays,
      };
    },
  };
}
