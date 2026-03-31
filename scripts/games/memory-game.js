import { formatPoints } from "../ui/ui-kit.js";
import { t } from "../core/i18n.js";

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildDeck(cards) {
  const selected = shuffle(cards).slice(0, 6);
  const deck = selected.flatMap((card) => [
    { tileId: `${card.id}-a`, cardId: card.id, card },
    { tileId: `${card.id}-b`, cardId: card.id, card },
  ]);
  return shuffle(deck).map((tile) => ({
    ...tile,
    revealed: false,
    matched: false,
  }));
}

export function mountMemoryGame(container, { cards, onWin, onLose, playSound }) {
  let state = {
    status: "playing",
    timerMs: 45000,
    moves: 0,
    matches: 0,
    pendingMismatch: null,
    deck: buildDeck(cards),
  };

  let loopHandle = 0;
  let lastTick = performance.now();
  let finalized = false;

  function finalizeGame(status) {
    if (finalized) {
      return;
    }

    finalized = true;
    state = { ...state, status };

    if (status === "won") {
      onWin({
        moves: state.moves,
        timeLeftMs: state.timerMs,
        matches: state.matches,
      });
    } else {
      onLose({
        moves: state.moves,
        matches: state.matches,
      });
    }
  }

  function resolveMismatchIfReady() {
    if (state.pendingMismatch && state.pendingMismatch.remainingMs <= 0) {
      const hiddenSet = new Set(state.pendingMismatch.tileIds);
      state = {
        ...state,
        pendingMismatch: null,
        deck: state.deck.map((tile) =>
          hiddenSet.has(tile.tileId) ? { ...tile, revealed: false } : tile,
        ),
      };
    }
  }

  function tick(deltaMs) {
    if (state.status !== "playing") {
      return;
    }

    state = {
      ...state,
      timerMs: Math.max(0, state.timerMs - deltaMs),
      pendingMismatch: state.pendingMismatch
        ? {
            ...state.pendingMismatch,
            remainingMs: state.pendingMismatch.remainingMs - deltaMs,
          }
        : null,
    };

    resolveMismatchIfReady();

    if (state.timerMs <= 0) {
      finalizeGame("lost");
    }
  }

  function render() {
    container.innerHTML = `
      <div class="arena-frame">
        <div class="arena-topline">
          <div>
            <h3 class="arena-title">${t("play.memoryMatchTitle")}</h3>
            <p class="screen-note">${t("play.memoryMatchBody")}</p>
          </div>
          <div class="arena-stats">
            <span class="arena-stat">${t("play.statTime", { value: Math.ceil(state.timerMs / 1000) })}</span>
            <span class="arena-stat">${t("play.statMoves", { count: state.moves })}</span>
            <span class="arena-stat">${t("play.statPairs", { current: state.matches, total: 6 })}</span>
          </div>
        </div>
        <div class="game-surface">
          <div class="memory-grid">
            ${state.deck
              .map(
                (tile) => `
                  <div class="memory-tile ${tile.revealed ? "is-revealed" : ""} ${tile.matched ? "is-matched" : ""}">
                    <button class="tile-button" type="button" data-tile-id="${tile.tileId}" aria-label="${t("common.memoryTileAria")}">
                      <span class="tile-face tile-face--back"></span>
                      <span class="tile-face tile-face--front">
                        <span class="tile-card">
                          <span class="tile-card__icon" aria-hidden="true">${tile.card.icon}</span>
                          <span class="tile-card__word">${tile.card.word}</span>
                          <small>${t("common.pointsValue", { value: formatPoints(tile.card.points) })}</small>
                        </span>
                      </span>
                    </button>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll("[data-tile-id]").forEach((button) => {
      button.addEventListener("click", () => {
        flipTile(button.dataset.tileId);
      });
    });
  }

  function flipTile(tileId) {
    if (state.status !== "playing" || state.pendingMismatch) {
      return;
    }

    const tile = state.deck.find((entry) => entry.tileId === tileId);
    if (!tile || tile.revealed || tile.matched) {
      return;
    }

    playSound("click");

    const nextDeck = state.deck.map((entry) =>
      entry.tileId === tileId ? { ...entry, revealed: true } : entry,
    );
    const revealedTiles = nextDeck.filter((entry) => entry.revealed && !entry.matched);

    let nextState = {
      ...state,
      deck: nextDeck,
    };

    if (revealedTiles.length === 2) {
      const [first, second] = revealedTiles;
      nextState = {
        ...nextState,
        moves: state.moves + 1,
      };

      if (first.cardId === second.cardId) {
        playSound("success");
        nextState = {
          ...nextState,
          deck: nextDeck.map((entry) =>
            entry.cardId === first.cardId ? { ...entry, matched: true } : entry,
          ),
          matches: state.matches + 1,
        };
      } else {
        playSound("failure");
        nextState = {
          ...nextState,
          pendingMismatch: {
            tileIds: [first.tileId, second.tileId],
            remainingMs: 650,
          },
        };
      }
    }

    state = nextState;

    if (state.deck.every((entry) => entry.matched)) {
      finalizeGame("won");
    }

    render();
  }

  function runLoop(now) {
    const deltaMs = now - lastTick;
    lastTick = now;
    tick(deltaMs);
    render();
    loopHandle = window.requestAnimationFrame(runLoop);
  }

  render();
  loopHandle = window.requestAnimationFrame(runLoop);

  return {
    destroy() {
      window.cancelAnimationFrame(loopHandle);
    },
    advanceTime(milliseconds) {
      tick(milliseconds);
      render();
    },
    getDebugState() {
      return {
        game: "memory-match",
        status: state.status,
        timerMs: state.timerMs,
        moves: state.moves,
        matches: state.matches,
        revealed: state.deck.filter((tile) => tile.revealed).map((tile) => tile.card.word),
      };
    },
  };
}
