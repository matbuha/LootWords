import {
  APP_NAME,
  AUDIO_SFX,
  BOX_TAP_COUNT,
  FEEDBACK_EVENTS,
  GAME_CONFIG,
  REWARD_REVEAL_DELAY_MS,
  ROUTES,
  ROUTE_SEQUENCE,
} from "./data/config.js";
import { getCardById, hydrateCards } from "./data/cards.js";
import { createAudioManager } from "./core/audio-manager.js";
import { createEventBus } from "./core/event-bus.js";
import { createFeedbackManager } from "./core/feedback-manager.js";
import { getReviewDeck, summarizeProgress } from "./core/progression.js";
import { openRewardBox, recordGameWin } from "./core/rewards.js";
import { createStore } from "./core/state.js";
import { updateAudioSettings } from "./core/settings-manager.js";
import { createRouter, buildRoute } from "./router.js";
import { loadProfile, saveProfile } from "./storage.js";
import { renderCollectionScreen } from "./ui/collection-screen.js";
import { renderGameScreen } from "./ui/game-screen.js";
import { renderHomeScreen } from "./ui/home-screen.js";
import { renderLearnScreen } from "./ui/learn-screen.js";
import { renderRewardScreen } from "./ui/reward-screen.js";

const root = document.querySelector("#app");

function createRewardSession() {
  return {
    clicks: 0,
    reveal: null,
    pendingReveal: null,
    phase: "idle",
  };
}

const store = createStore({
  profile: loadProfile(),
  route: { path: ROUTES.home, game: "memory-match" },
  session: {
    reward: createRewardSession(),
    gameResult: null,
    modalCardId: null,
    learnSelectedCardId: null,
    navMotion: "same",
  },
});

const audio = createAudioManager({
  settings: store.getState().profile.settings.audio,
});
const eventBus = createEventBus();
const feedback = createFeedbackManager({ audio, eventBus });

let activeScreen = null;
let router = null;
let rewardRevealTimeout = 0;

function clearRewardRevealTimeout() {
  if (rewardRevealTimeout) {
    window.clearTimeout(rewardRevealTimeout);
    rewardRevealTimeout = 0;
  }
}

function deriveState() {
  const state = store.getState();
  const cards = hydrateCards(state.profile);
  const progress = summarizeProgress(cards, state.profile);
  const reviewDeck = getReviewDeck(cards, state.profile.learnFilters);

  return {
    state,
    cards,
    progress,
    reviewDeck,
    newestCard: progress.newestCard,
    modalCard: getCardById(cards, state.session.modalCardId),
    rewardCard:
      state.session.reward.reveal?.type === "card"
        ? getCardById(cards, state.session.reward.reveal.cardId)
        : null,
  };
}

function persistProfile(profile) {
  saveProfile(profile);
  feedback.setAudioSettings(profile.settings.audio);
}

function commitState(updater) {
  const nextState = store.setState(updater);
  persistProfile(nextState.profile);
  renderApp();
  return nextState;
}

function getRouteMotion(fromRoute, toRoute) {
  const fromIndex = ROUTE_SEQUENCE.indexOf(fromRoute);
  const toIndex = ROUTE_SEQUENCE.indexOf(toRoute);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return "same";
  }

  return toIndex > fromIndex ? "forward" : "backward";
}

function navigate(path, params = {}) {
  feedback.trigger(FEEDBACK_EVENTS.buttonClick);
  router.navigate(path, params);
}

function patchAudioSettings(partialAudio) {
  return (currentState) => ({
    ...currentState,
    profile: {
      ...currentState.profile,
      settings: updateAudioSettings(currentState.profile.settings, partialAudio),
    },
  });
}

const actions = {
  navigate,
  toggleMute() {
    const { settings } = store.getState().profile;
    const wasMuted = settings.audio.muted;

    commitState(patchAudioSettings({ muted: !wasMuted }));

    if (wasMuted) {
      feedback.trigger(FEEDBACK_EVENTS.buttonClick, {
        audioOptions: { throttleMs: 0 },
      });
    }
  },
  toggleMusic() {
    const { settings } = store.getState().profile;
    const nextEnabled = !settings.audio.musicEnabled;

    commitState(patchAudioSettings({ musicEnabled: nextEnabled }));

    if (!settings.audio.muted && nextEnabled) {
      feedback.trigger(FEEDBACK_EVENTS.buttonClick, {
        audioOptions: { throttleMs: 0 },
      });
    }
  },
  toggleSfx() {
    const { settings } = store.getState().profile;
    const nextEnabled = !settings.audio.sfxEnabled;

    commitState(patchAudioSettings({ sfxEnabled: nextEnabled }));

    if (!settings.audio.muted && nextEnabled) {
      feedback.trigger(FEEDBACK_EVENTS.buttonClick, {
        audioOptions: { throttleMs: 0 },
      });
    }
  },
  updateCollectionFilters(partialFilters) {
    feedback.trigger(FEEDBACK_EVENTS.filterChange);
    commitState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        collectionFilters: {
          ...currentState.profile.collectionFilters,
          ...partialFilters,
        },
      },
    }));
  },
  updateLearnFilters(partialFilters) {
    feedback.trigger(FEEDBACK_EVENTS.filterChange);
    commitState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        learnFilters: {
          ...currentState.profile.learnFilters,
          ...partialFilters,
        },
      },
      session: {
        ...currentState.session,
        learnSelectedCardId: null,
      },
    }));
  },
  openCardModal(cardId) {
    feedback.trigger(FEEDBACK_EVENTS.collectionCardSelect);
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        modalCardId: cardId,
      },
    }));
  },
  closeCardModal() {
    feedback.trigger(FEEDBACK_EVENTS.buttonClick);
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        modalCardId: null,
      },
    }));
  },
  selectLearnCard(cardId) {
    feedback.trigger(FEEDBACK_EVENTS.collectionCardSelect);
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        learnSelectedCardId: cardId,
      },
    }));
  },
  selectRelativeLearnCard(direction) {
    const { reviewDeck, state } = deriveState();
    if (!reviewDeck.length) {
      return;
    }

    feedback.trigger(FEEDBACK_EVENTS.collectionCardSelect);

    const currentId = state.session.learnSelectedCardId ?? reviewDeck[0].id;
    const currentIndex = Math.max(0, reviewDeck.findIndex((card) => card.id === currentId));
    const nextIndex = (currentIndex + direction + reviewDeck.length) % reviewDeck.length;

    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        learnSelectedCardId: reviewDeck[nextIndex].id,
      },
    }));
  },
  tapRewardBox() {
    const { profile, session } = store.getState();
    if (profile.rewardBoxes <= 0 || session.reward.reveal || session.reward.phase === "opening") {
      return;
    }

    const nextClicks = session.reward.clicks + 1;

    if (nextClicks < BOX_TAP_COUNT) {
      commitState((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          reward: {
            ...currentState.session.reward,
            clicks: nextClicks,
            phase: nextClicks === 1 ? "warming" : "charged",
          },
        },
      }));

      feedback.trigger(
        nextClicks === 1 ? FEEDBACK_EVENTS.rewardTap1 : FEEDBACK_EVENTS.rewardTap2,
      );
      return;
    }

    feedback.trigger(FEEDBACK_EVENTS.rewardTap3);
    clearRewardRevealTimeout();

    const cards = hydrateCards(profile);
    const rewardResult = openRewardBox(profile, cards);
    const nextCards = hydrateCards(rewardResult.profile);
    const revealedCard =
      rewardResult.reward.type === "card"
        ? getCardById(nextCards, rewardResult.reward.cardId)
        : null;
    const nextProgress = summarizeProgress(nextCards, rewardResult.profile);
    const reachedAlbumMilestone =
      rewardResult.reward.type === "card" &&
      nextProgress.totalUnlocked > 0 &&
      nextProgress.totalUnlocked % 10 === 0;

    commitState((currentState) => ({
      ...currentState,
      profile: rewardResult.profile,
      session: {
        ...currentState.session,
        reward: {
          clicks: BOX_TAP_COUNT,
          reveal: null,
          pendingReveal: rewardResult.reward,
          phase: "opening",
        },
      },
    }));

    window.setTimeout(() => {
      feedback.trigger(FEEDBACK_EVENTS.rewardOpen);
    }, 140);

    rewardRevealTimeout = window.setTimeout(() => {
      rewardRevealTimeout = 0;
      commitState((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          reward: {
            ...currentState.session.reward,
            reveal: currentState.session.reward.pendingReveal,
            pendingReveal: null,
            phase: "revealed",
          },
        },
      }));

      feedback.trigger(FEEDBACK_EVENTS.cardReveal, {
        rarity: revealedCard?.rarity,
        audio: rewardResult.reward.type === "card",
      });

      if (revealedCard) {
        feedback.trigger(FEEDBACK_EVENTS.newCardUnlocked, {
          rarity: revealedCard.rarity,
          audio: revealedCard.rarity !== "legendary",
          audioOptions: { delayMs: 120 },
        });
      }

      if (reachedAlbumMilestone) {
        feedback.trigger(FEEDBACK_EVENTS.progressMilestone, {
          audioOptions: { delayMs: 240 },
        });
      }
    }, REWARD_REVEAL_DELAY_MS);
  },
  resetRewardReveal() {
    clearRewardRevealTimeout();
    feedback.trigger(FEEDBACK_EVENTS.buttonClick);
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        reward: createRewardSession(),
      },
    }));
  },
  finishGame(result) {
    if (result.status === "won") {
      commitState((currentState) => ({
        ...currentState,
        profile: recordGameWin(currentState.profile, result.gameId),
        session: {
          ...currentState.session,
          gameResult: result,
        },
      }));
      feedback.trigger(FEEDBACK_EVENTS.gameWin);
      return;
    }

    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        gameResult: result,
      },
    }));
    feedback.trigger(FEEDBACK_EVENTS.gameLose);
  },
  clearGameResult() {
    feedback.trigger(FEEDBACK_EVENTS.buttonClick);
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        gameResult: null,
      },
    }));
  },
};

const SCREEN_RENDERERS = {
  [ROUTES.home]: (container, context) => renderHomeScreen(container, context),
  [ROUTES.collection]: (container, context) => renderCollectionScreen(container, context),
  [ROUTES.reward]: (container, context) => renderRewardScreen(container, context),
  [ROUTES.learn]: (container, context) => renderLearnScreen(container, context),
  [ROUTES.play]: (container, context) => renderGameScreen(container, context),
};

function renderShell({ progress, currentRoute, audioSettings, navMotion }) {
  return `
    <div class="app-shell app-shell--${currentRoute.path}">
      <div class="route-glow route-glow--${currentRoute.path}" aria-hidden="true"></div>
      <header class="shell-topbar">
        <a class="brand-lockup" href="${buildRoute(ROUTES.home)}" data-ui-click="true">
          <span class="brand-mark" aria-hidden="true"></span>
          <span class="brand-copy">
            <strong>${APP_NAME}</strong>
            <span>Loot boxes turn into English word cards.</span>
          </span>
        </a>
        <div class="topbar-status">
          <span class="status-pill"><strong>${progress.rewardBoxes}</strong><span>boxes</span></span>
          <span class="status-pill"><strong>${progress.totalUnlocked}</strong><span>cards</span></span>
          <div class="audio-controls" aria-label="Audio controls">
            <button class="mute-toggle ${audioSettings.muted ? "is-muted" : ""}" type="button" data-toggle-mute="true">
              ${audioSettings.muted ? "Sound Off" : "Sound On"}
            </button>
            <button
              class="mute-toggle mute-toggle--sub ${audioSettings.musicEnabled ? "is-on" : "is-off"}"
              type="button"
              data-toggle-audio="music"
            >
              Music ${audioSettings.musicEnabled ? "On" : "Off"}
            </button>
            <button
              class="mute-toggle mute-toggle--sub ${audioSettings.sfxEnabled ? "is-on" : "is-off"}"
              type="button"
              data-toggle-audio="sfx"
            >
              SFX ${audioSettings.sfxEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>
      </header>

      <main class="shell-main shell-main--${navMotion}" data-route="${currentRoute.path}">
        <div id="screen-root"></div>
      </main>
    </div>

    <nav class="shell-nav" aria-label="Primary navigation">
      ${[
        { route: ROUTES.home, label: "Home", tag: "Hub" },
        { route: ROUTES.play, label: "Play", tag: "Games", params: { game: currentRoute.game } },
        { route: ROUTES.reward, label: "Reward", tag: "Boxes" },
        { route: ROUTES.collection, label: "Collection", tag: "Cards" },
        { route: ROUTES.learn, label: "Learn", tag: "Review" },
      ]
        .map(
          (item) => `
            <a class="nav-link ${currentRoute.path === item.route ? "is-active" : ""}" href="${buildRoute(item.route, item.params ?? {})}" data-ui-click="true">
              <strong>${item.label}</strong>
              <span class="nav-link__tag">${item.tag}</span>
            </a>
          `,
        )
        .join("")}
    </nav>
  `;
}

function renderApp() {
  activeScreen?.destroy?.();

  const { state, cards, progress, newestCard, modalCard, rewardCard, reviewDeck } = deriveState();
  const selectedLearnCard =
    reviewDeck.find((card) => card.id === state.session.learnSelectedCardId) ?? reviewDeck[0] ?? null;

  document.body.dataset.route = state.route.path;

  root.innerHTML = renderShell({
    progress,
    currentRoute: state.route,
    audioSettings: state.profile.settings.audio,
    navMotion: state.session.navMotion,
  });

  feedback.syncRoute(state.route.path);

  root.querySelector("[data-toggle-mute]")?.addEventListener("click", () => {
    actions.toggleMute();
  });

  root.querySelectorAll("[data-toggle-audio]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.toggleAudio === "music") {
        actions.toggleMusic();
        return;
      }

      actions.toggleSfx();
    });
  });

  root.querySelectorAll("[data-ui-click='true']").forEach((element) => {
    element.addEventListener("click", () => {
      feedback.trigger(FEEDBACK_EVENTS.buttonClick);
    });
  });

  const screenRoot = root.querySelector("#screen-root");
  const renderer = SCREEN_RENDERERS[state.route.path] ?? SCREEN_RENDERERS[ROUTES.home];

  activeScreen = renderer(screenRoot, {
    route: state.route,
    cards,
    progress,
    newestCard,
    filters: state.profile.collectionFilters,
    learnFilters: state.profile.learnFilters,
    modalCard,
    rewardState: state.session.reward,
    rewardCard,
    rewardBoxes: state.profile.rewardBoxes,
    unlockedCards: reviewDeck,
    selectedCard: selectedLearnCard,
    result: state.session.gameResult,
    actions,
    playSound(soundId, options) {
      feedback.playSound(soundId, options);
    },
  });
}

router = createRouter((route) => {
  const previousState = store.getState();
  const nextGame = route.game in GAME_CONFIG ? route.game : "memory-match";
  const navMotion = getRouteMotion(previousState.route.path, route.path);

  if (route.path !== ROUTES.reward) {
    clearRewardRevealTimeout();
  }

  store.setState((currentState) => ({
    ...currentState,
    route: {
      ...route,
      game: nextGame,
    },
    session: {
      ...currentState.session,
      navMotion,
      modalCardId: route.path === ROUTES.collection ? currentState.session.modalCardId : null,
      gameResult: route.path === ROUTES.play ? currentState.session.gameResult : null,
      reward: route.path === ROUTES.reward ? currentState.session.reward : createRewardSession(),
    },
  }));
  renderApp();
});

function primeAudioFromInteraction() {
  feedback.prime();
}

document.addEventListener("pointerdown", primeAudioFromInteraction, {
  passive: true,
  capture: true,
});
document.addEventListener("keydown", primeAudioFromInteraction, {
  capture: true,
});

window.render_game_to_text = () => {
  const { state, cards, progress } = deriveState();
  return JSON.stringify({
    route: state.route.path,
    routeGame: state.route.game,
    rewardBoxes: state.profile.rewardBoxes,
    totalUnlocked: progress.totalUnlocked,
    totalCards: progress.totalCards,
    totalWins: state.profile.totalWins,
    audio: {
      muted: state.profile.settings.audio.muted,
      musicEnabled: state.profile.settings.audio.musicEnabled,
      sfxEnabled: state.profile.settings.audio.sfxEnabled,
      debug: feedback.getDebugState(),
    },
    reward: {
      clicks: state.session.reward.clicks,
      phase: state.session.reward.phase,
      reveal: state.session.reward.reveal,
    },
    activeScreen: activeScreen?.getDebugState?.() ?? null,
    unlockedPreview: cards.filter((card) => card.unlocked).slice(0, 6).map((card) => card.word),
  });
};

window.advanceTime = (milliseconds) => {
  activeScreen?.advanceTime?.(milliseconds);
};

window.addEventListener("beforeunload", () => {
  clearRewardRevealTimeout();
  feedback.destroy();
  eventBus.clear();
});

renderApp();
