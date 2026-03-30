import { getPlayablePool } from "../core/progression.js";
import { getGameDefinition } from "../games/game-registry.js";
import { renderEmptyState } from "./ui-kit.js";

function formatVictoryLabel(key) {
  return key
    .replace(/Ms$/, "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatVictoryValue(key, value) {
  if (key.endsWith("Ms") && typeof value === "number") {
    return `${Math.max(0, Math.round(value / 1000))}s`;
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
      `<div class="victory-chip victory-chip--reward"><span>Reward boxes</span><strong>+${result.summary.boxesAwarded}</strong></div>`,
      `<div class="victory-chip"><span>Streak</span><strong>${result.summary.currentStreak}</strong></div>`,
      `<div class="victory-chip"><span>Total wins</span><strong>${result.summary.totalWins}</strong></div>`,
    ];

    if (result.summary.firstWinBonusBoxes > 0) {
      rewardChips.push(
        `<div class="victory-chip victory-chip--bonus"><span>First win bonus</span><strong>+${result.summary.firstWinBonusBoxes} box</strong></div>`,
      );
    }

    if (result.summary.milestoneBonusStars > 0) {
      rewardChips.push(
        `<div class="victory-chip victory-chip--bonus"><span>Milestone stars</span><strong>+${result.summary.milestoneBonusStars}</strong></div>`,
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
      <div class="victory-chip"><span>Best streak</span><strong>${result.summary.bestStreak}</strong></div>
      <div class="victory-chip"><span>Losses here</span><strong>${result.summary.lossCount}</strong></div>
      ${
        result.summary.streakEnded
          ? `<div class="victory-chip victory-chip--bonus"><span>Streak reset</span><strong>Back to 0</strong></div>`
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
        <span class="game-choice__bonus">${game.isFirstWinAvailable ? "First win bonus ready" : "Loot run ready"}</span>
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
  const favoriteLabel = playSummary.favoriteGame ? playSummary.favoriteGame.label : "Still picking a favorite";
  const noActiveContent = progress.totalCards === 0;

  container.innerHTML = `
    <div class="game-layout">
      <section class="section-panel section-panel--compact section-panel--play-hub">
        <div class="screen-header">
          <div>
            <span class="small-label">Play lab</span>
            <h2 class="section-title">Pick a fast loot run and chase the next reveal</h2>
          </div>
          <p class="screen-note">Short rounds, immediate restart, and better rewards when you branch out.</p>
        </div>

        <div class="session-strip">
          <article class="session-chip session-chip--glow">
            <span>Current streak</span>
            <strong>${progress.currentStreak}</strong>
            <small>Best ${progress.bestStreak}</small>
          </article>
          <article class="session-chip">
            <span>Games tried</span>
            <strong>${playSummary.gamesTried}/${playSummary.gameProgress.length}</strong>
            <small>${playSummary.totalPlays} total rounds</small>
          </article>
          <article class="session-chip">
            <span>Next milestone</span>
            <strong>${playSummary.nextMilestoneTarget} wins</strong>
            <small>${playSummary.winsUntilMilestone} win${playSummary.winsUntilMilestone === 1 ? "" : "s"} to go</small>
          </article>
          <article class="session-chip">
            <span>Favorite game</span>
            <strong>${favoriteLabel}</strong>
            <small>${progress.rewardBoxesEarned} boxes earned so far</small>
          </article>
        </div>

        <div class="play-quick-row">
          <button class="primary-button" type="button" data-play-recommended="${gameId}" ${noActiveContent ? "disabled" : ""}>
            ${recommendedGame ? `Recommended: ${recommendedGame.shortLabel}` : "Play recommended"}
          </button>
          <button class="secondary-button" type="button" data-play-random="${gameId}" ${noActiveContent ? "disabled" : ""}>
            ${randomGame ? `Random: ${randomGame.shortLabel}` : "Random game"}
          </button>
          <button class="ghost-button" type="button" data-route="reward">
            ${progress.rewardBoxes > 0 ? `Open ${progress.rewardBoxes} box${progress.rewardBoxes === 1 ? "" : "es"}` : "Reward room"}
          </button>
        </div>

        <div class="game-switcher game-switcher--grid">
          ${playSummary.gameProgress.map((game) => renderGameChoice(game, gameId)).join("")}
        </div>
      </section>

      <section class="arena-panel arena-panel--game">
        <div class="arena-summary">
          <div>
            <span class="small-label">${gameMeta.icon} ${gameMeta.energyLabel}</span>
            <h3 class="section-title">${gameMeta.label}</h3>
            <p class="screen-note">${gameMeta.description}</p>
          </div>
          <div class="arena-summary__stats">
            <span class="arena-stat">${gameMeta.stats.wins}/${gameMeta.stats.plays} wins</span>
            <span class="arena-stat">${gameMeta.lengthLabel}</span>
            <span class="arena-stat">${gameMeta.isFirstWinAvailable ? `First win: +${playSummary.firstWinBonusBoxes} box` : "Bonus claimed"}</span>
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
                <span class="small-label">${result.status === "won" ? "Victory" : "Round over"}</span>
                <h3 class="section-title">${result.status === "won" ? "Reward box secured" : "Jump right back in"}</h3>
                <p class="section-copy">
                  ${
                    result.status === "won"
                      ? "That round paid off. Cash in the reward now, replay this game, or jump to a fresh challenge."
                      : "This run missed the goal, but the next round is one tap away."
                  }
                </p>
                ${renderOutcomeSummary(result)}
                ${result.status === "won" ? renderVictoryStats(result) : ""}
                <div class="cta-stack">
                  ${
                    result.status === "won"
                      ? `<button class="primary-button" type="button" data-route="reward">Open reward box</button>`
                      : `<button class="primary-button" type="button" data-reset-game="true">Replay game</button>`
                  }
                  <button class="secondary-button" type="button" data-reset-game="true">Play this game again</button>
                  <button class="ghost-button" type="button" data-play-random="${gameId}">Try a random game</button>
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
      "No active word cards are available",
      "A parent has turned off the current vocabulary pool. Parent Mode can re-enable categories or cards so this game can hand out word rewards again.",
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
