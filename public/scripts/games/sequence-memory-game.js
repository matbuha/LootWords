import { t } from "../core/i18n.js";
import { formatPoints } from "../ui/ui-kit.js";

const ROUND_SEQUENCE_LENGTHS = [2, 3, 4];
const VISIBLE_CARD_COUNT = 4;
const PREVIEW_SHOW_MS = 820;
const PREVIEW_GAP_MS = 250;
const SUCCESS_STEP_MS = 320;
const ROUND_CLEAR_MS = 620;
const FAILURE_REVEAL_MS = 700;

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildRounds(cards) {
  const validCards = cards.filter((card) => card?.id && card?.word && card?.icon);
  if (validCards.length < VISIBLE_CARD_COUNT) {
    return [];
  }

  return ROUND_SEQUENCE_LENGTHS.map((sequenceLength) => {
    const visibleCards = shuffle(validCards).slice(0, VISIBLE_CARD_COUNT);
    const sequence = shuffle(visibleCards).slice(0, sequenceLength);
    return {
      visibleCards,
      sequence,
    };
  });
}

function createInitialState(cards) {
  const rounds = buildRounds(cards);
  return {
    status: rounds.length ? "playing" : "unavailable",
    rounds,
    roundIndex: 0,
    phase: rounds.length ? "preview" : "idle",
    previewIndex: 0,
    previewVisible: true,
    phaseMs: rounds.length ? PREVIEW_SHOW_MS : 0,
    inputIndex: 0,
    selectedId: null,
    feedback: null,
    revealedSequenceIds: [],
  };
}

export function mountSequenceMemoryGame(
  container,
  { cards, onWin, onLose, playSound, speakEnglishWord, onLearningEvent },
) {
  let state = createInitialState(cards);
  let loopHandle = 0;
  let finalized = false;
  let pendingSpeechHandle = 0;
  let lastPreviewToken = null;

  function currentRound() {
    return state.rounds[state.roundIndex] ?? null;
  }

  function clearPendingSpeech() {
    if (pendingSpeechHandle) {
      window.clearTimeout(pendingSpeechHandle);
      pendingSpeechHandle = 0;
    }
  }

  function speakPreviewCard(card) {
    if (!card?.word) {
      return;
    }

    clearPendingSpeech();
    pendingSpeechHandle = window.setTimeout(() => {
      speakEnglishWord?.(card.word);
    }, 50);
  }

  function enterInputPhase() {
    state = {
      ...state,
      phase: "input",
      phaseMs: 0,
      previewVisible: false,
      inputIndex: 0,
      selectedId: null,
      feedback: null,
      revealedSequenceIds: [],
    };
    lastPreviewToken = null;
  }

  function moveToNextRound() {
    const nextIndex = state.roundIndex + 1;
    if (nextIndex >= state.rounds.length) {
      finalize("won");
      return;
    }

    state = {
      ...state,
      roundIndex: nextIndex,
      phase: "preview",
      previewIndex: 0,
      previewVisible: true,
      phaseMs: PREVIEW_SHOW_MS,
      inputIndex: 0,
      selectedId: null,
      feedback: null,
      revealedSequenceIds: [],
    };
    lastPreviewToken = null;
    render();
    speakCurrentPreviewCardIfNeeded();
  }

  function finalize(status) {
    if (finalized) {
      return;
    }

    finalized = true;
    clearPendingSpeech();
    state = { ...state, status };

    if (status === "won") {
      onWin({
        roundsCleared: state.rounds.length,
      });
      return;
    }

    onLose({
      roundIndex: state.roundIndex + 1,
      completedSteps: state.inputIndex,
    });
  }

  function speakCurrentPreviewCardIfNeeded() {
    if (state.phase !== "preview" || !state.previewVisible) {
      return;
    }

    const round = currentRound();
    const card = round?.sequence[state.previewIndex] ?? null;
    const token = `${state.roundIndex}:${state.previewIndex}:${card?.id ?? "none"}`;
    if (token === lastPreviewToken) {
      return;
    }

    lastPreviewToken = token;
    speakPreviewCard(card);
  }

  function tick(deltaMs) {
    if (state.status !== "playing") {
      return false;
    }

    if (state.phase === "preview") {
      state = {
        ...state,
        phaseMs: Math.max(0, state.phaseMs - deltaMs),
      };

      if (state.phaseMs > 0) {
        return false;
      }

      const round = currentRound();
      if (!round) {
        return false;
      }

      if (state.previewVisible) {
        state = {
          ...state,
          previewVisible: false,
          phaseMs: PREVIEW_GAP_MS,
        };
        return true;
      }

      const nextPreviewIndex = state.previewIndex + 1;
      if (nextPreviewIndex >= round.sequence.length) {
        enterInputPhase();
        return true;
      }

      state = {
        ...state,
        previewIndex: nextPreviewIndex,
        previewVisible: true,
        phaseMs: PREVIEW_SHOW_MS,
      };
      speakCurrentPreviewCardIfNeeded();
      return true;
    }

    if (state.phase === "success-step" || state.phase === "round-clear" || state.phase === "failure") {
      state = {
        ...state,
        phaseMs: Math.max(0, state.phaseMs - deltaMs),
      };

      if (state.phaseMs > 0) {
        return false;
      }

      if (state.phase === "success-step") {
        state = {
          ...state,
          phase: "input",
          selectedId: null,
          feedback: null,
          phaseMs: 0,
        };
        return true;
      }

      if (state.phase === "round-clear") {
        moveToNextRound();
        return true;
      }

      if (state.phase === "failure") {
        finalize("lost");
        return true;
      }
    }

    return false;
  }

  function render() {
    if (state.status === "unavailable") {
      container.innerHTML = `
        <div class="arena-frame arena-frame--sequence-memory">
          <div class="game-empty-state">
            <h3>${t("play.sequenceMemoryUnavailableTitle")}</h3>
            <p>${t("play.sequenceMemoryUnavailableBody")}</p>
          </div>
        </div>
      `;
      return;
    }

    const round = currentRound();
    if (!round) {
      return;
    }

    const activePreviewCardId =
      state.phase === "preview" && state.previewVisible ? round.sequence[state.previewIndex]?.id ?? null : null;

    const statusCopy =
      state.phase === "preview"
        ? t("play.sequenceMemoryWatch")
        : state.phase === "failure"
          ? t("play.sequenceMemoryWrong")
          : state.phase === "round-clear"
            ? t("play.sequenceMemoryRoundClear")
            : t("play.sequenceMemoryRepeat");

    container.innerHTML = `
      <div class="arena-frame arena-frame--sequence-memory">
        <div class="arena-topline">
          <div>
            <h3 class="arena-title">${t("play.sequenceMemoryTitle")}</h3>
            <p class="screen-note">${t("play.sequenceMemoryBody")}</p>
          </div>
          <div class="arena-stats">
            <span class="arena-stat">${t("play.statRounds", { current: state.roundIndex + 1, total: state.rounds.length })}</span>
            <span class="arena-stat">${t("play.sequenceMemoryLength", { value: round.sequence.length })}</span>
            <span class="arena-stat">${t("play.sequenceMemoryStep", { current: state.inputIndex + (state.phase === "round-clear" ? 1 : 0), total: round.sequence.length })}</span>
          </div>
        </div>

        <div class="game-surface game-surface--sequence-memory">
          <section class="sequence-memory-status ${state.phase === "preview" ? "is-preview" : "is-input"}">
            <span class="small-label">${t("play.sequenceMemoryEyebrow")}</span>
            <strong>${statusCopy}</strong>
            <span>
              ${
                state.phase === "preview"
                  ? t("play.sequenceMemoryWatchBody")
                  : t("play.sequenceMemoryRepeatBody", { current: state.inputIndex + 1, total: round.sequence.length })
              }
            </span>
          </section>

          <div class="sequence-memory-grid">
            ${round.visibleCards
              .map((card) => {
                const isPreviewActive = activePreviewCardId === card.id;
                const isCorrectStep = state.phase === "success-step" && state.selectedId === card.id;
                const isWrongStep = state.phase === "failure" && state.selectedId === card.id;
                const isRevealStep = state.phase === "failure" && round.sequence[state.inputIndex]?.id === card.id;
                const speakAttributes = state.phase !== "preview" ? `data-speak-word="${card.word}" lang="en"` : "";

                return `
                  <button
                    class="sequence-card ${isPreviewActive ? "is-preview-active" : ""} ${isCorrectStep ? "is-correct" : ""} ${isWrongStep ? "is-wrong" : ""} ${isRevealStep ? "is-answer" : ""}"
                    type="button"
                    data-sequence-card="${card.id}"
                    ${speakAttributes}
                  >
                    <span class="sequence-card__art" aria-hidden="true">${card.icon}</span>
                    <span class="sequence-card__meta">
                      <strong>${card.word}</strong>
                      <small>${formatPoints(card.points)}</small>
                    </span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll("[data-sequence-card]").forEach((button) => {
      button.addEventListener("click", () => {
        handleInput(button.dataset.sequenceCard);
      });
    });

    speakCurrentPreviewCardIfNeeded();
  }

  function handleInput(cardId) {
    if (state.status !== "playing" || state.phase !== "input") {
      return;
    }

    playSound("click");
    const round = currentRound();
    const expectedCard = round?.sequence[state.inputIndex] ?? null;
    if (!expectedCard) {
      return;
    }

    if (cardId === expectedCard.id) {
      playSound("success");
      const nextInputIndex = state.inputIndex + 1;
      onLearningEvent?.({
        source: "sequence-memory.correct",
        cardId,
        gameId: "sequence-memory",
        roundId: `${state.roundIndex}:${state.inputIndex}:${cardId}`,
        occurredAt: new Date().toISOString(),
      });
      state = {
        ...state,
        inputIndex: nextInputIndex,
        selectedId: cardId,
        feedback: "correct",
        phase: nextInputIndex >= round.sequence.length ? "round-clear" : "success-step",
        phaseMs: nextInputIndex >= round.sequence.length ? ROUND_CLEAR_MS : SUCCESS_STEP_MS,
      };
      render();
      return;
    }

    playSound("failure");
    state = {
      ...state,
      selectedId: cardId,
      feedback: "wrong",
      phase: "failure",
      phaseMs: FAILURE_REVEAL_MS,
      revealedSequenceIds: round.sequence.map((card) => card.id),
    };
    render();
  }

  function runLoop() {
    if (tick(100)) {
      render();
    }
  }

  render();
  if (state.status === "playing") {
    loopHandle = window.setInterval(runLoop, 100);
  }

  return {
    destroy() {
      window.clearInterval(loopHandle);
      clearPendingSpeech();
    },
    advanceTime(milliseconds) {
      if (state.status !== "playing") {
        return;
      }

      const changed = tick(milliseconds);
      if (changed || state.phase !== "input") {
        render();
      }
    },
    getDebugState() {
      const round = currentRound();
      return {
        game: "sequence-memory",
        status: state.status,
        roundIndex: state.roundIndex + 1,
        totalRounds: state.rounds.length,
        phase: state.phase,
        previewIndex: state.previewIndex,
        inputIndex: state.inputIndex,
        visibleCards: round?.visibleCards?.map((card) => card.word) ?? [],
        sequence: round?.sequence?.map((card) => card.word) ?? [],
      };
    },
  };
}
