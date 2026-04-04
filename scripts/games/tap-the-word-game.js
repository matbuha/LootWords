import { t } from "../core/i18n.js";
import { formatPoints } from "../ui/ui-kit.js";

const TOTAL_ROUNDS = 5;
const REQUIRED_CORRECT_ANSWERS = 4;
const ROUND_TIMER_MS = 40000;
const FEEDBACK_DELAY_MS = 850;
const ROUND_OPTIONS_DESKTOP = 4;
const ROUND_OPTIONS_MOBILE = 3;

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function pickOptionCount(cards) {
  if (cards.length <= ROUND_OPTIONS_MOBILE) {
    return cards.length;
  }

  return window.matchMedia("(max-width: 560px)").matches ? ROUND_OPTIONS_MOBILE : ROUND_OPTIONS_DESKTOP;
}

function getRoundCandidates(cards, usedTargetIds, optionCount) {
  const eligibleTargets = cards.filter((card) => card?.id && card?.word && !usedTargetIds.has(card.id));
  const targetSource = eligibleTargets.length ? eligibleTargets : cards.filter((card) => card?.id && card?.word);
  const target = shuffle(targetSource)[0] ?? null;

  if (!target) {
    return null;
  }

  const distractorPool = shuffle(
    cards.filter((card) => card?.id && card.id !== target.id && card.word),
  );

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
    timerMs: ROUND_TIMER_MS,
    rounds,
    roundIndex: 0,
    correctAnswers: 0,
    answered: false,
    selectedId: null,
    feedback: null,
    feedbackMs: 0,
  };
}

export function mountTapTheWordGame(
  container,
  { cards, onWin, onLose, playSound, speakEnglishWord },
) {
  let state = createInitialState(cards);
  let loopHandle = 0;
  let finalized = false;
  let lastSpokenRoundId = null;
  let pendingSpeechHandle = 0;

  function clearPendingSpeech() {
    if (pendingSpeechHandle) {
      window.clearTimeout(pendingSpeechHandle);
      pendingSpeechHandle = 0;
    }
  }

  function currentRound() {
    return state.rounds[state.roundIndex] ?? null;
  }

  function speakTargetWord() {
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
    state = { ...state, status };
    clearPendingSpeech();

    if (status === "won") {
      onWin({
        timeLeftMs: state.timerMs,
        correctAnswers: state.correctAnswers,
        totalRounds: state.rounds.length,
      });
      return;
    }

    onLose({
      roundIndex: state.roundIndex + (state.answered ? 1 : 0),
      correctAnswers: state.correctAnswers,
      totalRounds: state.rounds.length,
    });
  }

  function moveToNextRound() {
    const nextIndex = state.roundIndex + 1;
    if (nextIndex >= state.rounds.length) {
      finalize(state.correctAnswers >= REQUIRED_CORRECT_ANSWERS ? "won" : "lost");
      return;
    }

    state = {
      ...state,
      roundIndex: nextIndex,
      answered: false,
      selectedId: null,
      feedback: null,
      feedbackMs: 0,
    };

    lastSpokenRoundId = null;
    render();
    speakTargetWord();
  }

  function tick(deltaMs) {
    if (state.status !== "playing") {
      return false;
    }

    const previousSecond = Math.ceil(state.timerMs / 1000);
    const previousFeedbackMs = state.feedbackMs;
    state = {
      ...state,
      timerMs: Math.max(0, state.timerMs - deltaMs),
      feedbackMs: Math.max(0, state.feedbackMs - deltaMs),
    };

    if (previousFeedbackMs > 0 && state.feedbackMs === 0 && state.answered) {
      moveToNextRound();
      return true;
    }

    if (state.timerMs <= 0) {
      finalize("lost");
      return true;
    }

    return Math.ceil(state.timerMs / 1000) !== previousSecond;
  }

  function render() {
    if (state.status === "unavailable") {
      container.innerHTML = `
        <div class="arena-frame arena-frame--tap-word">
          <div class="game-empty-state">
            <h3>${t("play.tapWordUnavailableTitle")}</h3>
            <p>${t("play.tapWordUnavailableBody")}</p>
          </div>
        </div>
      `;
      return;
    }

    const round = currentRound();
    if (!round) {
      return;
    }

    const answerProgress = `${state.roundIndex + 1}/${state.rounds.length}`;

    container.innerHTML = `
      <div class="arena-frame arena-frame--tap-word">
        <div class="arena-topline">
          <div>
            <h3 class="arena-title">${t("play.tapWordTitle")}</h3>
            <p class="screen-note">${t("play.tapWordBody")}</p>
          </div>
          <div class="arena-stats">
            <span class="arena-stat">${t("play.statRounds", { current: state.roundIndex + 1, total: state.rounds.length })}</span>
            <span class="arena-stat">${t("play.statCorrect", { current: state.correctAnswers, total: REQUIRED_CORRECT_ANSWERS })}</span>
            <span class="arena-stat">${t("play.statTime", { value: Math.ceil(state.timerMs / 1000) })}</span>
          </div>
        </div>

        <div class="game-surface game-surface--tap-word">
          <section class="tap-word-prompt" aria-live="polite">
            <div class="tap-word-prompt__copy">
              <span class="small-label">${t("play.tapWordListenPrompt")}</span>
              <strong>${t("play.tapWordPromptTitle")}</strong>
              <span>${t("play.tapWordProgress", { current: answerProgress, needed: REQUIRED_CORRECT_ANSWERS })}</span>
            </div>
            <button class="secondary-button tap-word-prompt__repeat" type="button" data-repeat-target="true">
              ${t("play.tapWordRepeat")}
            </button>
          </section>

          <div class="tap-word-grid" data-tap-word-grid="true">
            ${round.options
              .map((option) => {
                const optionState =
                  state.selectedId === option.id && state.feedback === "correct"
                    ? "is-correct"
                    : state.selectedId === option.id && state.feedback === "wrong"
                      ? "is-wrong"
                      : state.answered && state.feedback === "wrong" && option.id === round.target.id
                        ? "is-answer"
                        : "";

                return `
                  <button
                    class="tap-word-option ${optionState}"
                    type="button"
                    data-card-id="${option.id}"
                    data-speak-word="${option.word}"
                    lang="en"
                  >
                    <span class="tap-word-option__art" aria-hidden="true">${option.icon}</span>
                    <span class="tap-word-option__meta">
                      <strong>${option.word}</strong>
                      <small>${formatPoints(option.points)}</small>
                    </span>
                  </button>
                `;
              })
              .join("")}
          </div>

          <div class="tap-word-feedback ${state.feedback ? `is-${state.feedback}` : ""}" aria-live="polite">
            ${
              state.feedback === "correct"
                ? t("play.tapWordCorrect")
                : state.feedback === "wrong"
                  ? t("play.tapWordWrong", { word: round.target.word })
                  : t("play.tapWordHint")
            }
          </div>
        </div>
      </div>
    `;

    container.querySelector("[data-repeat-target='true']")?.addEventListener("click", () => {
      playSound("click");
      speakTargetWord();
    });

    container.querySelectorAll("[data-card-id]").forEach((button) => {
      button.addEventListener("click", () => {
        handleChoice(button.dataset.cardId);
      });
    });

    const roundIdentity = `${state.roundIndex}:${round.target.id}`;
    if (!state.answered && lastSpokenRoundId !== roundIdentity) {
      lastSpokenRoundId = roundIdentity;
      speakTargetWord();
    }
  }

  function handleChoice(cardId) {
    if (state.status !== "playing" || state.answered) {
      return;
    }

    playSound("click");
    const round = currentRound();
    const isCorrect = cardId === round.target.id;

    state = {
      ...state,
      answered: true,
      selectedId: cardId,
      feedback: isCorrect ? "correct" : "wrong",
      feedbackMs: FEEDBACK_DELAY_MS,
      correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
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
      if (changed || state.feedbackMs > 0) {
        render();
      }
    },
    getDebugState() {
      return {
        game: "tap-the-word",
        status: state.status,
        timerMs: state.timerMs,
        roundIndex: state.roundIndex + 1,
        totalRounds: state.rounds.length,
        correctAnswers: state.correctAnswers,
        answered: state.answered,
        target: currentRound()?.target?.word ?? null,
        options: currentRound()?.options?.map((card) => card.word) ?? [],
      };
    },
  };
}
