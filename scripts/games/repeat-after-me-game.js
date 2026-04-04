import { t } from "../core/i18n.js";
import { formatPoints } from "../ui/ui-kit.js";

const TOTAL_ROUNDS = 5;

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
  const shuffled = shuffle(validCards);
  if (!shuffled.length) {
    return [];
  }

  const rounds = [];
  for (let index = 0; index < TOTAL_ROUNDS; index += 1) {
    rounds.push(shuffled[index % shuffled.length]);
  }

  return rounds;
}

function createInitialState(cards) {
  const rounds = buildRounds(cards);
  return {
    status: rounds.length ? "playing" : "unavailable",
    rounds,
    roundIndex: 0,
    completedRounds: 0,
    transitionMs: 0,
  };
}

export function mountRepeatAfterMeGame(
  container,
  { cards, onWin, playSound, speakEnglishWord },
) {
  let state = createInitialState(cards);
  let finalized = false;
  let lastSpokenRoundId = null;
  let pendingSpeechHandle = 0;
  let loopHandle = 0;

  function currentCard() {
    return state.rounds[state.roundIndex] ?? null;
  }

  function clearPendingSpeech() {
    if (pendingSpeechHandle) {
      window.clearTimeout(pendingSpeechHandle);
      pendingSpeechHandle = 0;
    }
  }

  function speakCurrentWord() {
    const card = currentCard();
    if (!card?.word) {
      return;
    }

    clearPendingSpeech();
    pendingSpeechHandle = window.setTimeout(() => {
      speakEnglishWord?.(card.word);
    }, 40);
  }

  function finalize() {
    if (finalized) {
      return;
    }

    finalized = true;
    clearPendingSpeech();
    state = { ...state, status: "won" };
    onWin({
      roundsCleared: state.completedRounds,
      totalRounds: state.rounds.length,
    });
  }

  function moveToNextRound() {
    const nextIndex = state.roundIndex + 1;
    if (nextIndex >= state.rounds.length) {
      finalize();
      return;
    }

    state = {
      ...state,
      roundIndex: nextIndex,
      transitionMs: 0,
    };
    lastSpokenRoundId = null;
    render();
    speakCurrentWord();
  }

  function render() {
    if (state.status === "unavailable") {
      container.innerHTML = `
        <div class="arena-frame arena-frame--repeat-after-me">
          <div class="game-empty-state">
            <h3>${t("play.repeatAfterMeUnavailableTitle")}</h3>
            <p>${t("play.repeatAfterMeUnavailableBody")}</p>
          </div>
        </div>
      `;
      return;
    }

    const card = currentCard();
    if (!card) {
      return;
    }

    container.innerHTML = `
      <div class="arena-frame arena-frame--repeat-after-me">
        <div class="arena-topline">
          <div>
            <h3 class="arena-title">${t("play.repeatAfterMeTitle")}</h3>
            <p class="screen-note">${t("play.repeatAfterMeBody")}</p>
          </div>
          <div class="arena-stats">
            <span class="arena-stat">${t("play.statRounds", { current: state.roundIndex + 1, total: state.rounds.length })}</span>
            <span class="arena-stat">${t("play.repeatAfterMeSpoken", { value: state.completedRounds })}</span>
          </div>
        </div>

        <div class="game-surface game-surface--repeat-after-me">
          <section class="repeat-stage">
            <div class="repeat-stage__prompt">
              <span class="small-label">${t("play.repeatAfterMePromptEyebrow")}</span>
              <strong>${t("play.repeatAfterMePromptTitle")}</strong>
              <span>${t("play.repeatAfterMePromptBody")}</span>
            </div>

            <button
              class="repeat-card ${state.transitionMs > 0 ? "is-transitioning" : ""}"
              type="button"
              data-repeat-card="true"
              data-speak-word="${card.word}"
              lang="en"
            >
              <span class="repeat-card__art" aria-hidden="true">${card.icon}</span>
              <span class="repeat-card__meta">
                <strong>${card.word}</strong>
                <small>${formatPoints(card.points)}</small>
              </span>
            </button>

            <div class="repeat-stage__actions">
              <button class="secondary-button repeat-stage__repeat" type="button" data-repeat-word="true">
                ${t("play.repeatAfterMeHearAgain")}
              </button>
              <button class="primary-button repeat-stage__next" type="button" data-repeat-next="true">
                ${
                  state.roundIndex + 1 >= state.rounds.length
                    ? t("play.repeatAfterMeFinish")
                    : t("play.repeatAfterMeSaidIt")
                }
              </button>
            </div>
          </section>
        </div>
      </div>
    `;

    container.querySelector("[data-repeat-word='true']")?.addEventListener("click", () => {
      playSound("click");
      speakCurrentWord();
    });

    container.querySelector("[data-repeat-card='true']")?.addEventListener("click", () => {
      playSound("card-select");
      speakCurrentWord();
    });

    container.querySelector("[data-repeat-next='true']")?.addEventListener("click", () => {
      handleContinue();
    });

    const roundIdentity = `${state.roundIndex}:${card.id}`;
    if (lastSpokenRoundId !== roundIdentity) {
      lastSpokenRoundId = roundIdentity;
      speakCurrentWord();
    }
  }

  function handleContinue() {
    if (state.status !== "playing" || state.transitionMs > 0) {
      return;
    }

    playSound("success");
    state = {
      ...state,
      completedRounds: state.completedRounds + 1,
      transitionMs: 420,
    };
    render();
  }

  function tick(deltaMs) {
    if (state.status !== "playing" || state.transitionMs <= 0) {
      return false;
    }

    state = {
      ...state,
      transitionMs: Math.max(0, state.transitionMs - deltaMs),
    };

    if (state.transitionMs === 0) {
      moveToNextRound();
      return true;
    }

    return false;
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
      if (changed || state.transitionMs > 0) {
        render();
      }
    },
    getDebugState() {
      return {
        game: "repeat-after-me",
        status: state.status,
        roundIndex: state.roundIndex + 1,
        totalRounds: state.rounds.length,
        completedRounds: state.completedRounds,
        currentWord: currentCard()?.word ?? null,
      };
    },
  };
}
