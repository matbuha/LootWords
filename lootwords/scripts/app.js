import { APP_NAME, AUDIO_CUES, BOX_TAP_COUNT, GAME_CONFIG, ROUTES } from "./data/config.js";
import { getCardById, hydrateCards } from "./data/cards.js";
import { createAudioManager } from "./core/audio.js";
import { summarizeProgress } from "./core/progression.js";
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

const store = createStore({
  profile: loadProfile(),
  route: { path: ROUTES.home, game: "memory-match" },
  session: {
    reward: {
      clicks: 0,
      reveal: null,
    },
    gameResult: null,
    modalCardId: null,
    learnSelectedCardId: null,
  },
});

const audio = createAudioManager({
  muted: store.getState().profile.settings.audioMuted,
});

let activeScreen = null;
let router = null;

function deriveState() {
  const state = store.getState();
  const cards = hydrateCards(state.profile);
  const progress = summarizeProgress(cards, state.profile);

  return {
    state,
    cards,
    progress,
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
  tapRewardBox() {
    const { profile, session } = store.getState();
    if (profile.rewardBoxes <= 0 || session.reward.reveal) {
      return;
    }

    audio.play(AUDIO_CUES.boxTap);

    if (session.reward.clicks + 1 < BOX_TAP_COUNT) {
      commitState((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          reward: {
            ...currentState.session.reward,
            clicks: currentState.session.reward.clicks + 1,
          },
        },
      }));
      return;
    }

    const cards = hydrateCards(profile);
    const rewardResult = openRewardBox(profile, cards);

    commitState((currentState) => ({
      ...currentState,
      profile: rewardResult.profile,
      session: {
        ...currentState.session,
        reward: {
          clicks: BOX_TAP_COUNT,
          reveal: rewardResult.reward,
        },
      },
    }));

    audio.play(AUDIO_CUES.boxOpen);
    window.setTimeout(() => audio.play(AUDIO_CUES.rewardReveal), 120);
  },
  resetRewardReveal() {
    audio.play(AUDIO_CUES.click);
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        reward: {
          clicks: 0,
          reveal: null,
        },
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

function renderShell({ progress, currentRoute, audioMuted }) {
  return `
    <div class="app-shell">
      <header class="shell-topbar">
        <a class="brand-lockup" href="${buildRoute(ROUTES.home)}">
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

      <main class="shell-main">
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
            <a class="nav-link ${currentRoute.path === item.route ? "is-active" : ""}" href="${buildRoute(item.route, item.params ?? {})}">
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

  const { state, cards, progress, newestCard, modalCard, rewardCard } = deriveState();
  root.innerHTML = renderShell({
    progress,
    currentRoute: state.route,
    audioMuted: state.profile.settings.audioMuted,
  });

  root.querySelector("[data-toggle-mute]")?.addEventListener("click", () => {
    actions.toggleMute();
  });

  const screenRoot = root.querySelector("#screen-root");
  const renderer = SCREEN_RENDERERS[state.route.path] ?? SCREEN_RENDERERS[ROUTES.home];
  const unlockedCards = cards.filter((card) => card.unlocked);
  const selectedLearnCard =
    getCardById(cards, state.session.learnSelectedCardId) ?? unlockedCards[0] ?? null;

  activeScreen = renderer(screenRoot, {
    route: state.route,
    cards,
    progress,
    newestCard,
    filters: state.profile.collectionFilters,
    modalCard,
    rewardState: state.session.reward,
    rewardCard,
    rewardBoxes: state.profile.rewardBoxes,
    unlockedCards,
    selectedCard: selectedLearnCard,
    result: state.session.gameResult,
    actions,
    playSound(cueId) {
      audio.play(cueId);
    },
  });
}

router = createRouter((route) => {
  const nextGame = route.game in GAME_CONFIG ? route.game : "memory-match";
  store.setState((currentState) => ({
    ...currentState,
    route: {
      ...route,
      game: nextGame,
    },
    session: {
      ...currentState.session,
      modalCardId: route.path === ROUTES.collection ? currentState.session.modalCardId : null,
      gameResult: route.path === ROUTES.play ? currentState.session.gameResult : null,
      reward:
        route.path === ROUTES.reward
          ? currentState.session.reward
          : {
              clicks: 0,
              reveal: null,
            },
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
    reward: state.session.reward,
    activeScreen: activeScreen?.getDebugState?.() ?? null,
    unlockedPreview: cards.filter((card) => card.unlocked).slice(0, 6).map((card) => card.word),
  });
};

window.advanceTime = (milliseconds) => {
  activeScreen?.advanceTime?.(milliseconds);
};

renderApp();
