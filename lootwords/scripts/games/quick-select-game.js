import { formatPoints } from "../ui/ui-kit.js";

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function createRound(cards) {
  const options = shuffle(cards).slice(0, 6);
  const target = options[Math.floor(Math.random() * options.length)];

  return {
    target,
    options: shuffle(options),
    phase: "preview",
    previewMs: 1100,
    feedback: null,
    feedbackMs: 0,
    selectedId: null,
  };
}

export function mountFlashFindGame(container, { cards, onWin, onLose, playSound }) {
  let state = {
    status: "playing",
    timerMs: 30000,
    hearts: 3,
    roundIndex: 1,
    totalRounds: 5,
    bestChain: 0,
    chain: 0,
    currentRound: createRound(cards),
  };

  let loopHandle = 0;
  let lastTick = performance.now();
  let finalized = false;

  function finalize(status) {
    if (finalized) {
      return;
    }

    finalized = true;
    state = { ...state, status };

    if (status === "won") {
      onWin({
        roundsCleared: state.totalRounds,
        heartsLeft: state.hearts,
        bestChain: state.bestChain,
        timeLeftMs: state.timerMs,
      });
      return;
    }

    onLose({
      roundIndex: state.roundIndex,
      heartsLeft: state.hearts,
      bestChain: state.bestChain,
    });
  }

  function advanceRound() {
    if (state.roundIndex >= state.totalRounds) {
      finalize("won");
      return;
    }

    state = {
      ...state,
      roundIndex: state.roundIndex + 1,
      currentRound: createRound(cards),
    };
  }

  function tick(deltaMs) {
    if (state.status !== "playing") {
      return;
    }

    const nextTimer = Math.max(0, state.timerMs - deltaMs);
    const currentRound =
      state.currentRound.phase === "preview"
        ? {
            ...state.currentRound,
            previewMs: Math.max(0, state.currentRound.previewMs - deltaMs),
          }
        : state.currentRound.feedbackMs > 0
          ? {
              ...state.currentRound,
              feedbackMs: Math.max(0, state.currentRound.feedbackMs - deltaMs),
            }
          : state.currentRound;

    state = {
      ...state,
      timerMs: nextTimer,
      currentRound,
    };

    if (state.currentRound.phase === "preview" && state.currentRound.previewMs === 0) {
      state = {
        ...state,
        currentRound: {
          ...state.currentRound,
          phase: "choose",
        },
      };
    }

    if (state.currentRound.phase === "feedback" && state.currentRound.feedbackMs === 0) {
      if (state.currentRound.feedback === "correct") {
        advanceRound();
      } else if (state.hearts <= 0) {
        finalize("lost");
      } else {
        state = {
          ...state,
          currentRound: createRound(cards),
        };
      }
    }

    if (state.timerMs <= 0) {
      finalize(state.roundIndex > state.totalRounds ? "won" : "lost");
    }
  }

  function renderOptions() {
    return state.currentRound.options
      .map((card) => {
        const optionState =
          state.currentRound.selectedId === card.id && state.currentRound.feedback === "correct"
            ? "is-correct"
            : state.currentRound.selectedId === card.id && state.currentRound.feedback === "wrong"
              ? "is-wrong"
              : "";

        return `
          <button class="match-option flash-option ${optionState}" type="button" data-card-id="${card.id}">
            <span class="tile-card">
              <span class="tile-card__icon" aria-hidden="true">${card.icon}</span>
              <span class="tile-card__word">${card.word}</span>
              <small>${formatPoints(card.points)} pts</small>
            </span>
          </button>
        `;
      })
      .join("");
  }

  function render() {
    const previewPhase = state.currentRound.phase === "preview";
    const prompt = previewPhase
      ? "Watch this card carefully."
      : state.currentRound.feedback === "wrong"
        ? "That was not the flashed card. A new one is coming."
        : "Tap the same card you just saw.";

    container.innerHTML = `
      <div class="arena-frame">
        <div class="arena-topline">
          <div>
            <h3 class="arena-title">Flash Find</h3>
            <p class="screen-note">A target card flashes first. Lock it in, then tap the same card from the loot spread.</p>
          </div>
          <div class="arena-stats">
            <span class="arena-stat">Round: ${state.roundIndex}/${state.totalRounds}</span>
            <span class="arena-stat">Hearts: ${"❤️".repeat(state.hearts)}</span>
            <span class="arena-stat">Time: ${Math.ceil(state.timerMs / 1000)}s</span>
          </div>
        </div>
        <div class="game-surface">
          <div class="flash-find-stage">
            <div class="flash-find-stage__spotlight ${previewPhase ? "is-preview" : "is-hidden"}">
              <div class="target-card target-card--spotlight">
                <div class="target-card__icon" aria-hidden="true">${state.currentRound.target.icon}</div>
                <div class="target-card__copy">
                  <span class="small-label">Remember this</span>
                  <strong>${state.currentRound.target.word}</strong>
                  <span>${formatPoints(state.currentRound.target.points)} pts</span>
                </div>
                <div class="target-card__meta">${previewPhase ? "Preview" : "Hidden"}</div>
              </div>
            </div>

            <div class="flash-find-stage__prompt">
              <span class="small-label">${previewPhase ? "Preview" : "Find it"}</span>
              <strong>${prompt}</strong>
              <span>Best chain: ${state.bestChain}</span>
            </div>

            <div class="match-options flash-options">
              ${renderOptions()}
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll("[data-card-id]").forEach((button) => {
      button.addEventListener("click", () => {
        handleChoice(button.dataset.cardId);
      });
    });
  }

  function handleChoice(cardId) {
    if (state.status !== "playing" || state.currentRound.phase !== "choose") {
      return;
    }

    playSound("click");
    const isCorrect = cardId === state.currentRound.target.id;
    const nextChain = isCorrect ? state.chain + 1 : 0;

    if (isCorrect) {
      playSound("success");
    } else {
      playSound("failure");
    }

    state = {
      ...state,
      hearts: isCorrect ? state.hearts : state.hearts - 1,
      chain: nextChain,
      bestChain: Math.max(state.bestChain, nextChain),
      currentRound: {
        ...state.currentRound,
        phase: "feedback",
        selectedId: cardId,
        feedback: isCorrect ? "correct" : "wrong",
        feedbackMs: isCorrect ? 420 : 560,
      },
    };

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
        game: "flash-find",
        status: state.status,
        timerMs: state.timerMs,
        roundIndex: state.roundIndex,
        hearts: state.hearts,
        phase: state.currentRound.phase,
        target: state.currentRound.target.word,
      };
    },
  };
}
