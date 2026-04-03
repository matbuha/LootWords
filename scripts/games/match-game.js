import { formatPoints } from "../ui/ui-kit.js";
import { categoryLabel, t } from "../core/i18n.js";

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function createRound(cards) {
  const options = shuffle(cards).slice(0, 4);
  const target = options[Math.floor(Math.random() * options.length)];
  return {
    options,
    target,
    selectedId: null,
    feedback: null,
  };
}

export function mountMatchGame(container, { cards, onWin, onLose, playSound }) {
  let state = {
    status: "playing",
    timerMs: 35000,
    roundIndex: 1,
    totalRounds: 5,
    hearts: 3,
    currentRound: createRound(cards),
    feedbackMs: 0,
  };

  let loopHandle = 0;
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
        timeLeftMs: state.timerMs,
      });
    } else {
      onLose({
        roundIndex: state.roundIndex,
        heartsLeft: state.hearts,
      });
    }
  }

  function tick(deltaMs) {
    if (state.status !== "playing") {
      return false;
    }

    const previousSecond = Math.ceil(state.timerMs / 1000);
    const previousFeedbackMs = state.feedbackMs;
    const previousRoundIndex = state.roundIndex;
    let nextState = {
      ...state,
      timerMs: Math.max(0, state.timerMs - deltaMs),
      feedbackMs: Math.max(0, state.feedbackMs - deltaMs),
    };

    if (state.feedbackMs > 0 && nextState.feedbackMs === 0 && state.currentRound.feedback === "correct") {
      if (state.roundIndex >= state.totalRounds) {
        state = nextState;
        finalize("won");
        return;
      }

      nextState = {
        ...nextState,
        roundIndex: state.roundIndex + 1,
        currentRound: createRound(cards),
      };
    }

    if (nextState.feedbackMs === 0 && nextState.currentRound.feedback === "wrong") {
      nextState = {
        ...nextState,
        currentRound: {
          ...nextState.currentRound,
          feedback: null,
          selectedId: null,
        },
      };
    }

    state = nextState;

    if (state.timerMs <= 0 || state.hearts <= 0) {
      finalize("lost");
    }

    return (
      Math.ceil(state.timerMs / 1000) !== previousSecond ||
      (previousFeedbackMs > 0 && state.feedbackMs === 0) ||
      state.roundIndex !== previousRoundIndex ||
      state.status !== "playing"
    );
  }

  function render() {
    const { target, options, selectedId, feedback } = state.currentRound;

    container.innerHTML = `
      <div class="arena-frame">
        <div class="arena-topline">
          <div>
            <h3 class="arena-title">${t("play.treasureMatchTitle")}</h3>
            <p class="screen-note">${t("play.treasureMatchBody")}</p>
          </div>
          <div class="arena-stats">
            <span class="arena-stat">${t("play.statRounds", { current: state.roundIndex, total: state.totalRounds })}</span>
            <span class="arena-stat">${t("play.statHearts", { value: "❤️".repeat(state.hearts) })}</span>
            <span class="arena-stat">${t("play.statTime", { value: Math.ceil(state.timerMs / 1000) })}</span>
          </div>
        </div>
        <div class="game-surface">
          <div class="match-stage">
            <div class="target-card">
              <div class="target-card__icon" aria-hidden="true">${target.icon}</div>
              <div class="target-card__copy">
                <span class="small-label">${t("common.targetCard")}</span>
                <strong>${target.word}</strong>
                <span>${categoryLabel(target.category)}</span>
              </div>
              <div class="target-card__meta">${t("common.pointsValue", { value: formatPoints(target.points) })}</div>
            </div>
            <div class="match-options">
              ${options
                .map((option) => {
                  const optionState =
                    selectedId === option.id && feedback === "wrong"
                      ? "is-wrong"
                      : selectedId === option.id && feedback === "correct"
                        ? "is-correct"
                        : "";

                  return `
                    <button class="match-option ${optionState}" type="button" data-card-id="${option.id}">
                      <span class="tile-card">
                        <span class="tile-card__icon" aria-hidden="true">${option.icon}</span>
                        <span class="tile-card__word">${option.word}</span>
                        <small>${t("common.pointsValue", { value: formatPoints(option.points) })}</small>
                      </span>
                    </button>
                  `;
                })
                .join("")}
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
    if (state.status !== "playing" || state.feedbackMs > 0) {
      return;
    }

    playSound("click");
    const isCorrect = cardId === state.currentRound.target.id;

    if (isCorrect) {
      playSound("success");
      state = {
        ...state,
        currentRound: {
          ...state.currentRound,
          selectedId: cardId,
          feedback: "correct",
        },
        feedbackMs: 500,
      };
    } else {
      playSound("failure");
      state = {
        ...state,
        hearts: state.hearts - 1,
        currentRound: {
          ...state.currentRound,
          selectedId: cardId,
          feedback: "wrong",
        },
        feedbackMs: 650,
      };
    }

    render();
  }

  function runLoop() {
    if (tick(100)) {
      render();
    }
  }

  render();
  loopHandle = window.setInterval(runLoop, 100);

  return {
    destroy() {
      window.clearInterval(loopHandle);
    },
    advanceTime(milliseconds) {
      tick(milliseconds);
      render();
    },
    getDebugState() {
      return {
        game: "picture-match",
        status: state.status,
        timerMs: state.timerMs,
        roundIndex: state.roundIndex,
        hearts: state.hearts,
        target: state.currentRound.target.word,
        options: state.currentRound.options.map((card) => card.word),
      };
    },
  };
}
