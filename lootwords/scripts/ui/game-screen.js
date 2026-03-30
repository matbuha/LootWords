import { GAME_CONFIG } from "../data/config.js";
import { getPlayablePool } from "../core/progression.js";
import { mountMemoryGame } from "../games/memory-game.js";
import { mountMatchGame } from "../games/match-game.js";

const GAME_MOUNTS = {
  "memory-match": mountMemoryGame,
  "picture-match": mountMatchGame,
};

export function renderGameScreen(container, { route, cards, result, actions, playSound }) {
  const gameId = route.game in GAME_CONFIG ? route.game : "memory-match";
  const gameMeta = GAME_CONFIG[gameId];

  container.innerHTML = `
    <div class="game-layout">
      <section class="section-panel">
        <div class="screen-header">
          <div>
            <span class="small-label">Play</span>
            <h2 class="section-title">Pick a mini-game and chase the next reward box</h2>
          </div>
          <p class="screen-note">Each win adds one reward box to your stash.</p>
        </div>
        <div class="game-switcher">
          ${Object.values(GAME_CONFIG)
            .map(
              (game) => `
                <button class="game-choice ${game.id === gameId ? "is-active" : ""}" type="button" data-route="play" data-game="${game.id}">
                  <strong>${game.label}</strong>
                  <span>${game.description}</span>
                  <span class="small-label">${game.rewardText}</span>
                </button>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="arena-panel">
        <div id="game-host"></div>
        ${
          result && result.gameId === gameId
            ? `
              <div class="game-overlay ${result.status === "won" ? "is-win" : "is-lose"}">
                <span class="small-label">${result.status === "won" ? "Victory" : "Try again"}</span>
                <h3 class="section-title">${result.status === "won" ? "Reward box earned" : "One more run"}</h3>
                <p class="section-copy">
                  ${
                    result.status === "won"
                      ? "You cleared the round. Head to the reward screen to crack open your new box."
                      : "The round ended before the goal. Reset and jump straight back in."
                  }
                </p>
                <div class="cta-stack">
                  ${
                    result.status === "won"
                      ? `<button class="primary-button" type="button" data-route="reward">Open reward box</button>`
                      : `<button class="primary-button" type="button" data-reset-game="true">Replay game</button>`
                  }
                  <button class="ghost-button" type="button" data-route="home">Back home</button>
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

  container.querySelector("[data-reset-game]")?.addEventListener("click", () => {
    actions.clearGameResult();
  });

  const gameHost = container.querySelector("#game-host");
  const mountGame = GAME_MOUNTS[gameId];
  const gamePool = getPlayablePool(cards, gameId === "memory-match" ? 6 : 4);
  const playableCards = gamePool;

  let mountedGame = null;

  if (!(result && result.gameId === gameId)) {
    mountedGame = mountGame(gameHost, {
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
      return mountedGame?.getDebugState?.() ?? { screen: "play", gameId, status: result?.status ?? "overlay" };
    },
  };
}
