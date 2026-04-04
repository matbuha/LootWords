import { t } from "../core/i18n.js";
import { formatPoints } from "../ui/ui-kit.js";

const TOTAL_ROUNDS = 5;
const REQUIRED_CORRECT = 4;
const REVEAL_STEP_MS = 850;
const POST_REVEAL_MS = 1700;
const FEEDBACK_MS = 850;
const OPTION_COUNT_DESKTOP = 4;
const OPTION_COUNT_MOBILE = 3;
const REVEAL_TILE_COUNT = 9;
const HIDDEN_TILE_COUNTS = [9, 7, 5, 3, 1, 0];

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function pickOptionCount(cards) {
  if (cards.length <= OPTION_COUNT_MOBILE) {
    return cards.length;
  }

  return window.matchMedia("(max-width: 560px)").matches ? OPTION_COUNT_MOBILE : OPTION_COUNT_DESKTOP;
}

function createRevealOrder() {
  return shuffle(Array.from({ length: REVEAL_TILE_COUNT }, (_, index) => index));
}

function getRoundCandidates(cards, usedTargetIds, optionCount) {
  const eligibleTargets = cards.filter((card) => card?.id && card?.word && !usedTargetIds.has(card.id));
  const targetSource = eligibleTargets.length ? eligibleTargets : cards.filter((card) => card?.id && card?.word);
  const target = shuffle(targetSource)[0] ?? null;
  if (!target) {
    return null;
  }

  const distractorPool = shuffle(cards.filter((card) => card?.id && card.id !== target.id && card.word));
  const distractors = [];
  const seenCategoryIds = new Set(target.category ? [target.category] : []);

  for (const card of distractorPool) {
    if (distractors.length >= optionCount - 1) {
      break;
    }

    if (!seenCategoryIds.has(card.category)) {
      distractors.push(card);
      if (card.category) {
        seenCategoryIds.add(card.category);
      }
    }
  }

  for (const card of distractorPool) {
    if (distractors.length >= optionCount - 1) {
      break;
    }

    if (!distractors.some((option) => option.id === card.id)) {
      distractors.push(card);
    }
  }

  const options = shuffle([target, ...distractors]).slice(0, optionCount);
  return {
    target,
    options,
    revealOrder: createRevealOrder(),
  };
}

function buildRounds(cards) {
  const optionCount = Math.max(2, pickOptionCount(cards));
  const rounds = [];
  const usedTargetIds = new Set();

  for (let index = 0; index < TOTAL_ROUNDS; index += 1) {
    const round = getRoundCandidates(cards, usedTargetIds, optionCount);
    if (!round || round.options.length < 2) {
      break;
    }
    rounds.push(round);
    usedTargetIds.add(round.target.id);
  }

  return rounds;
}

function createInitialState(cards) {
  const rounds = buildRounds(cards);
  return {
    status: rounds.length ? "playing" : "unavailable",
    rounds,
    roundIndex: 0,
    correctAnswers: 0,
    revealStep: 0,
    phase: rounds.length ? "revealing" : "idle",
    phaseMs: rounds.length ? REVEAL_STEP_MS : 0,
    selectedId: null,
    feedback: null,
  };
}

function getHiddenTileSet(round, revealStep) {
  const hiddenCount = HIDDEN_TILE_COUNTS[Math.min(revealStep, HIDDEN_TILE_COUNTS.length - 1)] ?? 0;
  return new Set(round.revealOrder.slice(0, hiddenCount));
}

export function mountImageRevealGame(
  container,
  { cards, onWin, onLose, playSound, speakEnglishWord },
) {
  let state = createInitialState(cards);
  let loopHandle = 0;
  let finalized = false;
  let pendingSpeechHandle = 0;
  let spokenResolvedToken = null;

  function clearPendingSpeech() {
    if (pendingSpeechHandle) {
      window.clearTimeout(pendingSpeechHandle);
      pendingSpeechHandle = 0;
    }
  }

  function currentRound() {
    return state.rounds[state.roundIndex] ?? null;
  }

  function speakResolvedTarget() {
    const round = currentRound();
    if (!round?.target?.word) {
      return;
    }

    clearPendingSpeech();
    pendingSpeechHandle = window.setTimeout(() => {
      speakEnglishWord?.(round.target.word);
    }, 40);
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
        correctAnswers: state.correctAnswers,
        totalRounds: state.rounds.length,
      });
      return;
    }

    onLose({
      correctAnswers: state.correctAnswers,
      totalRounds: state.rounds.length,
    });
  }

  function moveToNextRound() {
    const nextIndex = state.roundIndex + 1;
    if (nextIndex >= state.rounds.length) {
      finalize(state.correctAnswers >= REQUIRED_CORRECT ? "won" : "lost");
      return;
    }

    state = {
      ...state,
      roundIndex: nextIndex,
      revealStep: 0,
      phase: "revealing",
      phaseMs: REVEAL_STEP_MS,
      selectedId: null,
      feedback: null,
    };
    spokenResolvedToken = null;
  }

  function tick(deltaMs) {
    if (state.status !== "playing") {
      return false;
    }

    if (state.phase === "revealing") {
      state = {
        ...state,
        phaseMs: Math.max(0, state.phaseMs - deltaMs),
      };

      if (state.phaseMs > 0) {
        return false;
      }

      const nextStep = state.revealStep + 1;
      if (nextStep >= HIDDEN_TILE_COUNTS.length) {
        state = {
          ...state,
          revealStep: HIDDEN_TILE_COUNTS.length - 1,
          phase: "waiting-guess",
          phaseMs: POST_REVEAL_MS,
        };
        return true;
      }

      state = {
        ...state,
        revealStep: nextStep,
        phaseMs: REVEAL_STEP_MS,
      };
      return true;
    }

    if (state.phase === "waiting-guess") {
      state = {
        ...state,
        phaseMs: Math.max(0, state.phaseMs - deltaMs),
      };

      if (state.phaseMs === 0) {
        state = {
          ...state,
          phase: "feedback",
          selectedId: null,
          feedback: "timeout",
          phaseMs: FEEDBACK_MS,
        };
        return true;
      }

      return false;
    }

    if (state.phase === "feedback") {
      state = {
        ...state,
        phaseMs: Math.max(0, state.phaseMs - deltaMs),
      };

      if (state.phaseMs === 0) {
        moveToNextRound();
        return true;
      }
    }

    return false;
  }

  function render() {
    if (state.status === "unavailable") {
      container.innerHTML = `
        <div class="arena-frame arena-frame--image-reveal">
          <div class="game-empty-state">
            <h3>${t("play.imageRevealUnavailableTitle")}</h3>
            <p>${t("play.imageRevealUnavailableBody")}</p>
          </div>
        </div>
      `;
      return;
    }

    const round = currentRound();
    if (!round) {
      return;
    }

    const hiddenTiles = getHiddenTileSet(round, state.revealStep);
    const isResolved = state.phase === "feedback";
    const resolutionToken = isResolved ? `${state.roundIndex}:${round.target.id}:${state.feedback}` : null;
    if (resolutionToken && spokenResolvedToken !== resolutionToken) {
      spokenResolvedToken = resolutionToken;
      speakResolvedTarget();
    }

    container.innerHTML = `
      <div class="arena-frame arena-frame--image-reveal">
        <div class="arena-topline">
          <div>
            <h3 class="arena-title">${t("play.imageRevealTitle")}</h3>
            <p class="screen-note">${t("play.imageRevealBody")}</p>
          </div>
          <div class="arena-stats">
            <span class="arena-stat">${t("play.statRounds", { current: state.roundIndex + 1, total: state.rounds.length })}</span>
            <span class="arena-stat">${t("play.statCorrect", { current: state.correctAnswers, total: REQUIRED_CORRECT })}</span>
            <span class="arena-stat">${t("play.imageRevealClue", { value: state.revealStep + 1 })}</span>
          </div>
        </div>

        <div class="game-surface game-surface--image-reveal">
          <section class="image-reveal-status ${state.phase === "revealing" ? "is-revealing" : state.phase === "feedback" ? "is-feedback" : "is-guessing"}">
            <span class="small-label">${t("play.imageRevealEyebrow")}</span>
            <strong>
              ${
                state.phase === "revealing"
                  ? t("play.imageRevealWatch")
                  : state.phase === "feedback" && state.feedback === "correct"
                    ? t("play.imageRevealCorrect")
                    : state.phase === "feedback"
                      ? t("play.imageRevealMissed")
                      : t("play.imageRevealGuess")
              }
            </strong>
            <span>
              ${
                state.phase === "revealing"
                  ? t("play.imageRevealWatchBody")
                  : state.phase === "feedback" && state.feedback === "correct"
                    ? t("play.imageRevealCorrectBody", { word: round.target.word })
                    : state.phase === "feedback"
                      ? t("play.imageRevealMissedBody", { word: round.target.word })
                      : t("play.imageRevealGuessBody")
              }
            </span>
          </section>

          <div class="image-reveal-stage">
            <div class="image-reveal-target ${isResolved ? "is-revealed" : ""}">
              <div class="image-reveal-target__art" aria-hidden="true">${round.target.icon}</div>
              <div class="image-reveal-target__meta">
                <strong>${round.target.word}</strong>
                <small>${formatPoints(round.target.points)}</small>
              </div>
              <div class="image-reveal-mask" aria-hidden="true">
                ${Array.from({ length: REVEAL_TILE_COUNT }, (_, index) => `<span class="image-reveal-mask__tile ${hiddenTiles.has(index) && !isResolved ? "is-hidden" : "is-open"}"></span>`).join("")}
              </div>
            </div>
          </div>

          <div class="image-reveal-options">
            ${round.options
              .map((card) => {
                const optionState =
                  state.selectedId === card.id && state.feedback === "correct"
                    ? "is-correct"
                    : state.selectedId === card.id && state.feedback !== "correct"
                      ? "is-wrong"
                      : isResolved && card.id === round.target.id
                        ? "is-answer"
                        : "";

                const speakAttributes = isResolved ? `data-speak-word="${card.word}" lang="en"` : "";

                return `
                  <button class="image-reveal-option ${optionState}" type="button" data-image-reveal-card="${card.id}" ${speakAttributes}>
                    <span class="image-reveal-option__art" aria-hidden="true">${card.icon}</span>
                    <span class="image-reveal-option__meta">
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

    container.querySelectorAll("[data-image-reveal-card]").forEach((button) => {
      button.addEventListener("click", () => {
        handleChoice(button.dataset.imageRevealCard);
      });
    });
  }

  function handleChoice(cardId) {
    if (state.status !== "playing" || state.phase === "feedback") {
      return;
    }

    playSound("click");
    const round = currentRound();
    const isCorrect = cardId === round.target.id;

    state = {
      ...state,
      selectedId: cardId,
      feedback: isCorrect ? "correct" : "wrong",
      correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
      phase: "feedback",
      phaseMs: FEEDBACK_MS,
    };

    playSound(isCorrect ? "success" : "failure");
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
      if (changed || state.phase !== "revealing") {
        render();
      }
    },
    getDebugState() {
      const round = currentRound();
      return {
        game: "image-reveal",
        status: state.status,
        roundIndex: state.roundIndex + 1,
        totalRounds: state.rounds.length,
        correctAnswers: state.correctAnswers,
        phase: state.phase,
        revealStep: state.revealStep,
        target: round?.target?.word ?? null,
        options: round?.options?.map((card) => card.word) ?? [],
      };
    },
  };
}
