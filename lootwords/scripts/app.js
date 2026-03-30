import {
  APP_NAME,
  AUDIO_CUES,
  AUDIO_TRACKS,
  BOX_TAP_COUNT,
  GAME_CONFIG,
  REWARD_REVEAL_DELAY_MS,
  ROUTES,
  ROUTE_SEQUENCE,
} from "./data/config.js";
import { getCardById, hydrateCards } from "./data/cards.js";
import { createAudioManager } from "./core/audio.js";
import { getReviewDeck, summarizeProgress } from "./core/progression.js";
import { openRewardBox, recordGameWin } from "./core/rewards.js";
import { createStore } from "./core/state.js";
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
  muted: store.getState().profile.settings.audioMuted,
});

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
  audio.setMuted(profile.settings.audioMuted);
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
  router.navigate(path, params);
}

const actions = {
  navigate,
  toggleMute() {
    const wasMuted = store.getState().profile.settings.audioMuted;

    commitState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        settings: {
          ...currentState.profile.settings,
          audioMuted: !currentState.profile.settings.audioMuted,
        },
      },
    }));

    if (wasMuted) {
      audio.play(AUDIO_CUES.click);
    }
  },
  updateCollectionFilters(partialFilters) {
    audio.play(AUDIO_CUES.click);
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
    audio.play(AUDIO_CUES.click);
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
    audio.play(AUDIO_CUES.click);
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        modalCardId: cardId,
      },
    }));
  },
  closeCardModal() {
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        modalCardId: null,
      },
    }));
  },
  selectLearnCard(cardId) {
    audio.play(AUDIO_CUES.click);
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        learnSelectedCardId: cardId,
      },
    }));
  },
  selectRelativeLearnCard(direction) {
    audio.play(AUDIO_CUES.click);

    const { reviewDeck, state } = deriveState();
    if (!reviewDeck.length) {
      return;
    }

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

    audio.play(AUDIO_CUES.boxTap);
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
      return;
    }

    clearRewardRevealTimeout();
    const cards = hydrateCards(profile);
    const rewardResult = openRewardBox(profile, cards);

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

    audio.play(AUDIO_CUES.boxOpen);

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
      audio.play(AUDIO_CUES.rewardReveal);
    }, REWARD_REVEAL_DELAY_MS);
  },
  resetRewardReveal() {
    clearRewardRevealTimeout();
    audio.play(AUDIO_CUES.click);
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
      audio.play(AUDIO_CUES.victory);
      commitState((currentState) => ({
        ...currentState,
        profile: recordGameWin(currentState.profile, result.gameId),
        session: {
          ...currentState.session,
          gameResult: result,
        },
      }));
      return;
    }

    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        gameResult: result,
      },
    }));
  },
  clearGameResult() {
    audio.play(AUDIO_CUES.click);
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

function renderShell({ progress, currentRoute, audioMuted, navMotion }) {
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
          <button class="mute-toggle" type="button" data-toggle-mute="true">${audioMuted ? "Sound Off" : "Sound On"}</button>
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
    audioMuted: state.profile.settings.audioMuted,
    navMotion: state.session.navMotion,
  });

  if (state.route.path === ROUTES.home && AUDIO_TRACKS.home) {
    audio.playMusic("home");
  } else {
    audio.stopMusic();
  }

  root.querySelector("[data-toggle-mute]")?.addEventListener("click", () => {
    actions.toggleMute();
  });

  root.querySelectorAll("[data-ui-click='true']").forEach((element) => {
    element.addEventListener("click", () => {
      audio.play(AUDIO_CUES.click);
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
    playSound(cueId) {
      audio.play(cueId);
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

window.render_game_to_text = () => {
  const { state, cards, progress } = deriveState();
  return JSON.stringify({
    route: state.route.path,
    routeGame: state.route.game,
    rewardBoxes: state.profile.rewardBoxes,
    totalUnlocked: progress.totalUnlocked,
    totalCards: progress.totalCards,
    totalWins: state.profile.totalWins,
    muted: state.profile.settings.audioMuted,
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
  audio.stopMusic();
});

renderApp();
