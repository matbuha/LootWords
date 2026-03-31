import { t } from "../core/i18n.js";

function randomPadIndex(previousIndex) {
  let nextIndex = Math.floor(Math.random() * 9);
  if (nextIndex === previousIndex) {
    nextIndex = (nextIndex + 3) % 9;
  }
  return nextIndex;
}

export function mountReactionGame(container, { onWin, onLose, playSound }) {
  let state = {
    status: "playing",
    timerMs: 16000,
    goalHits: 10,
    hits: 0,
    misses: 0,
    combo: 0,
    bestCombo: 0,
    activePad: 4,
    targetTtlMs: 900,
    pulseMs: 0,
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
        hits: state.hits,
        bestCombo: state.bestCombo,
        timeLeftMs: state.timerMs,
      });
      return;
    }

    onLose({
      hits: state.hits,
      misses: state.misses,
      bestCombo: state.bestCombo,
    });
  }

  function spawnNextTarget() {
    state = {
      ...state,
      activePad: randomPadIndex(state.activePad),
      targetTtlMs: 860,
      pulseMs: 220,
    };
  }

  function tick(deltaMs) {
    if (state.status !== "playing") {
      return;
    }

    state = {
      ...state,
      timerMs: Math.max(0, state.timerMs - deltaMs),
      targetTtlMs: Math.max(0, state.targetTtlMs - deltaMs),
      pulseMs: Math.max(0, state.pulseMs - deltaMs),
    };

    if (state.hits >= state.goalHits) {
      finalize("won");
      return;
    }

    if (state.targetTtlMs === 0) {
      state = {
        ...state,
        combo: 0,
        misses: state.misses + 1,
      };
      spawnNextTarget();
    }

    if (state.timerMs <= 0) {
      finalize(state.hits >= state.goalHits ? "won" : "lost");
    }
  }

  function render() {
    container.innerHTML = `
      <div class="arena-frame">
        <div class="arena-topline">
          <div>
            <h3 class="arena-title">${t("play.lootPopTitle")}</h3>
            <p class="screen-note">${t("play.lootPopBody")}</p>
          </div>
          <div class="arena-stats">
            <span class="arena-stat">${t("play.statTime", { value: Math.ceil(state.timerMs / 1000) })}</span>
            <span class="arena-stat">${t("play.statHits", { current: state.hits, total: state.goalHits })}</span>
            <span class="arena-stat">${t("play.statCombo", { count: state.combo })}</span>
          </div>
        </div>
        <div class="game-surface">
          <div class="reaction-stage">
            <div class="reaction-stage__summary">
              <div class="target-card target-card--reaction">
                <div class="target-card__icon" aria-hidden="true">💥</div>
                <div class="target-card__copy">
                  <span class="small-label">${t("play.lootCombo")}</span>
                  <strong>${state.bestCombo}</strong>
                  <span>${t("play.bestCombo")}</span>
                </div>
                <div class="target-card__meta">${t("play.statMisses", { count: state.misses })}</div>
              </div>
            </div>

            <div class="reaction-grid">
              ${Array.from({ length: 9 }, (_, index) => {
                const isActive = index === state.activePad;
                return `
                  <button
                    class="reaction-pad ${isActive ? "is-active" : ""} ${state.pulseMs > 0 && isActive ? "is-pulsing" : ""}"
                    type="button"
                    data-pad-index="${index}"
                    aria-label="${t("common.lootTargetPadAria")}"
                  >
                    <span class="reaction-pad__core" aria-hidden="true">${isActive ? "✨" : ""}</span>
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll("[data-pad-index]").forEach((button) => {
      button.addEventListener("click", () => {
        handleTap(Number(button.dataset.padIndex));
      });
    });
  }

  function handleTap(index) {
    if (state.status !== "playing") {
      return;
    }

    if (index !== state.activePad) {
      playSound("click");
      return;
    }

    playSound("success");
    const nextCombo = state.combo + 1;
    state = {
      ...state,
      hits: state.hits + 1,
      combo: nextCombo,
      bestCombo: Math.max(state.bestCombo, nextCombo),
    };

    if (state.hits >= state.goalHits) {
      finalize("won");
      render();
      return;
    }

    spawnNextTarget();
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
        game: "loot-pop",
        status: state.status,
        timerMs: state.timerMs,
        hits: state.hits,
        goalHits: state.goalHits,
        combo: state.combo,
        activePad: state.activePad,
      };
    },
  };
}
