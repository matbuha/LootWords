import {
  APP_NAME,
  FEEDBACK_EVENTS,
  GAME_CONFIG,
  REWARD_REVEAL_DELAY_MS,
  ROUTES,
  ROUTE_SEQUENCE,
} from "./data/config.js";
import { getCardById, hydrateCards } from "./data/cards.js";
import { createAudioManager } from "./core/audio-manager.js";
import { createAuthManager } from "./core/auth-manager.js";
import { createDailyChallengeManager } from "./core/daily-challenge-manager.js";
import {
  clearLastAppError,
  getLastAppError,
  renderAppSafely,
  renderScreenSafely,
  safeDestroyScreen,
} from "./core/error-boundary.js";
import { createEventBus } from "./core/event-bus.js";
import { createFeedbackManager } from "./core/feedback-manager.js";
import { importProfileFromJson, exportProfileToJson } from "./core/import-export-manager.js";
import { t } from "./core/i18n.js";
import { createLanguageManager } from "./core/language-manager.js";
import {
  advanceBoxOpeningSession,
  createEmptyBoxOpeningState,
} from "./core/box-opening-manager.js";
import { applyCursorSkin } from "./core/cursor-skin-manager.js";
import { getReviewDeck, summarizeProgress } from "./core/progression.js";
import { getRecommendedGameId } from "./core/game-session-manager.js";
import {
  DEFAULT_PARENT_SECTION,
  getChildModeCards,
  normalizeParentSection,
  PARENT_GATE_PHRASE,
  PARENT_SECRET_CLICK_TARGET,
  PARENT_SECRET_CLICK_WINDOW_MS,
  summarizeParentMode,
} from "./core/parent-mode.js";
import {
  resetAllChildProgress,
  resetCollectionProgress,
  resetRewardState,
  resetSettingsState,
} from "./core/reset-manager.js";
import { recordGameLoss, recordGameWin } from "./core/rewards.js";
import { createRecaptchaManager } from "./core/recaptcha-manager.js";
import { createSpeechManager } from "./core/speech-manager.js";
import { createStore } from "./core/state.js";
import { createUiEffects } from "./core/ui-effects.js";
import { updateAudioSettings, updateLanguageSettings, updateSpeechSettings } from "./core/settings-manager.js";
import { getRandomGameId } from "./games/game-registry.js";
import { createRouter, buildRoute } from "./router.js";
import {
  createInitialProfile,
  createPersistenceDescriptor,
  getLegacyArchiveInfo,
  loadScopedProfile,
  saveScopedProfile,
} from "./storage.js";
import { renderCollectionScreen } from "./ui/collection-screen.js";
import { renderGameScreen } from "./ui/game-screen.js";
import { renderHomeScreen } from "./ui/home-screen.js";
import { renderLearnScreen } from "./ui/learn-screen.js";
import { renderLanguageSelector, wireLanguageSelector } from "./ui/language-selector.js";
import { renderAuthModal, renderAuthTrigger } from "./ui/auth-modal.js";
import { renderParentScreen } from "./ui/parent-screen.js";
import { renderRewardScreen } from "./ui/reward-screen.js";
import { renderVoiceSelector, wireVoiceSelector } from "./ui/voice-selector.js";

const root = document.querySelector("#app");

function createRewardSession() {
  return {
    opening: createEmptyBoxOpeningState(),
    reveal: null,
    pendingReveal: null,
    phase: "idle",
  };
}

function createTransferState() {
  return {
    text: "",
    status: null,
  };
}

function createParentSession() {
  return {
    unlocked: false,
    gateInput: "",
    gateError: "",
    secretClicks: 0,
    secretWindowStartedAt: 0,
    section: DEFAULT_PARENT_SECTION,
    contentFilters: {
      search: "",
      category: "all",
      rarity: "all",
      unlocked: "all",
      availability: "all",
    },
    selectedCardId: null,
    transfer: createTransferState(),
    pendingReset: null,
  };
}

function createAuthUiState() {
  return {
    isOpen: false,
    mode: "signin",
    email: "",
    password: "",
    errorKey: "",
    infoKey: "",
    isSubmitting: false,
  };
}

const auth = createAuthManager();
const dailyChallenge = createDailyChallengeManager();
const recaptcha = createRecaptchaManager();

const store = createStore({
  profile: createInitialProfile(),
  auth: auth.getSnapshot(),
  dailyChallenge: dailyChallenge.getSnapshot(),
  recaptcha: recaptcha.getSnapshot(),
  persistence: {
    status: "loading",
    ...createPersistenceDescriptor(auth.getSnapshot()),
  },
  route: { path: ROUTES.home, game: null, challenge: null },
  session: {
    reward: createRewardSession(),
    gameResult: null,
    modalCardId: null,
    learnSelectedCardId: null,
    navMotion: "same",
    parent: createParentSession(),
    authUi: createAuthUiState(),
  },
});

const audio = createAudioManager({
  settings: store.getState().profile.settings.audio,
});
const speech = createSpeechManager(store.getState().profile.settings.speech);
const languageManager = createLanguageManager(store.getState().profile.settings.language);
const eventBus = createEventBus();
const feedback = createFeedbackManager({ audio, eventBus });
const uiEffects = createUiEffects();

let activeScreen = null;
let router = null;
let rewardRevealTimeout = 0;
let cleanupLanguageSelector = () => {};
let cleanupVoiceSelector = () => {};
let profileLoadToken = 0;
const cleanupAuthSubscription = auth.subscribe((authState) => {
  void syncProfileForAuth(authState);
});
const cleanupDailyChallengeSubscription = dailyChallenge.subscribe((dailyChallengeState) => {
  store.setState((currentState) => ({
    ...currentState,
    dailyChallenge: dailyChallengeState,
  }));
  renderApp();
});
const cleanupRecaptchaSubscription = recaptcha.subscribe((recaptchaState) => {
  store.setState((currentState) => ({
    ...currentState,
    recaptcha: recaptchaState,
  }));
  renderApp();
});
const cleanupSpeechSubscription = speech.subscribe(() => {
  renderApp();
});

function clearRewardRevealTimeout() {
  if (rewardRevealTimeout) {
    window.clearTimeout(rewardRevealTimeout);
    rewardRevealTimeout = 0;
  }
}

function deriveState() {
  const state = store.getState();
  const allCards = hydrateCards(state.profile);
  const cards = getChildModeCards(allCards, state.profile);
  const parentSummary = summarizeParentMode(allCards, state.profile);
  const progress = summarizeProgress(cards, state.profile, state.route.game);
  const activeCategoryIds = new Set(progress.categoryCounts.map((entry) => entry.id));
  const collectionFilters =
    state.profile.collectionFilters.category !== "all" &&
    !activeCategoryIds.has(state.profile.collectionFilters.category)
      ? {
          ...state.profile.collectionFilters,
          category: "all",
        }
      : state.profile.collectionFilters;
  const learnFilters =
    state.profile.learnFilters.category !== "all" && !activeCategoryIds.has(state.profile.learnFilters.category)
      ? {
          ...state.profile.learnFilters,
          category: "all",
        }
      : state.profile.learnFilters;
  const reviewDeck = getReviewDeck(cards, learnFilters);

  return {
    state,
    allCards,
    cards,
    parentSummary,
    progress,
    collectionFilters,
    learnFilters,
    reviewDeck,
    newestCard: progress.newestCard,
    modalCard: getCardById(cards, state.session.modalCardId),
    rewardCard:
      state.session.reward.reveal?.type === "card" || state.session.reward.reveal?.type === "duplicate"
        ? getCardById(allCards, state.session.reward.reveal.cardId)
        : null,
  };
}

function persistProfile(profile) {
  const authState = store.getState().auth;
  void saveScopedProfile(profile, authState);
  feedback.setAudioSettings(profile.settings.audio);
}

function commitState(updater) {
  const nextState = store.setState(updater);
  persistProfile(nextState.profile);
  renderApp();
  return nextState;
}

function updateSessionOnly(updater) {
  store.setState(updater);
  renderApp();
}

async function syncProfileForAuth(authState) {
  const nextToken = ++profileLoadToken;
  const loadingDescriptor = createPersistenceDescriptor(authState);

  store.setState((currentState) => ({
    ...currentState,
    auth: authState,
    profile: createInitialProfile(),
    persistence: {
      status: "loading",
      ...loadingDescriptor,
    },
    session: {
      ...currentState.session,
      reward: createRewardSession(),
      gameResult: null,
      modalCardId: null,
      learnSelectedCardId: null,
    },
  }));
  renderApp();

  const [nextProfile] = await Promise.all([
    loadScopedProfile(authState),
    dailyChallenge.syncAuthState(authState),
  ]);
  if (nextToken !== profileLoadToken) {
    return;
  }
  const readyDescriptor = createPersistenceDescriptor(authState);

  feedback.setAudioSettings(nextProfile.settings.audio);
  speech.setPreferredVoice(nextProfile.settings.speech?.voiceURI ?? null);

  store.setState((currentState) => ({
    ...currentState,
    auth: authState,
    profile: nextProfile,
    persistence: {
      status: "ready",
      ...readyDescriptor,
    },
  }));
  renderApp();
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

function patchLanguage(language) {
  return (currentState) => ({
    ...currentState,
    profile: {
      ...currentState.profile,
      settings: updateLanguageSettings(currentState.profile.settings, language),
    },
  });
}

function patchSpeechSettings(partialSpeech) {
  return (currentState) => ({
    ...currentState,
    profile: {
      ...currentState.profile,
      settings: updateSpeechSettings(currentState.profile.settings, partialSpeech),
    },
  });
}

function getResetDefinition(resetId) {
  const definitions = {
    "all-progress": {
      id: "all-progress",
      titleKey: "parent.reset.resetAllConfirm",
      detailKey: "parent.reset.resetAllDetail",
      apply: resetAllChildProgress,
    },
    collection: {
      id: "collection",
      titleKey: "parent.reset.resetCollectionConfirm",
      detailKey: "parent.reset.resetCollectionDetail",
      apply: resetCollectionProgress,
    },
    rewards: {
      id: "rewards",
      titleKey: "parent.reset.resetRewardsConfirm",
      detailKey: "parent.reset.resetRewardsDetail",
      apply: resetRewardState,
    },
    settings: {
      id: "settings",
      titleKey: "parent.reset.resetSettingsConfirm",
      detailKey: "parent.reset.resetSettingsDetail",
      apply: resetSettingsState,
    },
  };

  return definitions[resetId] ?? null;
}

const actions = {
  navigate,
  armParentModeTrigger(event) {
    const now = Date.now();
    const { parent } = store.getState().session;
    const withinWindow =
      parent.secretWindowStartedAt > 0 && now - parent.secretWindowStartedAt <= PARENT_SECRET_CLICK_WINDOW_MS;
    const nextClicks = withinWindow ? parent.secretClicks + 1 : 1;

    if (nextClicks >= PARENT_SECRET_CLICK_TARGET) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      commitState((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          parent: {
            ...currentState.session.parent,
            secretClicks: 0,
            secretWindowStartedAt: 0,
            gateInput: "",
            gateError: "",
            section: DEFAULT_PARENT_SECTION,
          },
        },
      }));
      navigate(ROUTES.parent, { section: DEFAULT_PARENT_SECTION });
      return true;
    }

    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          secretClicks: nextClicks,
          secretWindowStartedAt: withinWindow ? currentState.session.parent.secretWindowStartedAt : now,
        },
      },
    }));
    return false;
  },
  updateParentGateInput(value) {
    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          gateInput: value,
          gateError: "",
        },
      },
    }));
    renderApp();
  },
  submitParentGate() {
    const gateInput = store.getState().session.parent.gateInput.trim().toUpperCase();
    if (gateInput !== PARENT_GATE_PHRASE) {
      store.setState((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          parent: {
            ...currentState.session.parent,
            gateError: "parent.gate.failedBody",
          },
        },
      }));
      renderApp();
      return;
    }

    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          unlocked: true,
          gateInput: "",
          gateError: "",
          section: normalizeParentSection(currentState.route.section ?? DEFAULT_PARENT_SECTION),
        },
      },
    }));
  },
  exitParentMode() {
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: createParentSession(),
      },
    }));
    navigate(ROUTES.home);
  },
  navigateParentSection(section) {
    const normalizedSection = normalizeParentSection(section);
    commitState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          section: normalizedSection,
        },
      },
    }));
    navigate(ROUTES.parent, { section: normalizedSection });
  },
  updateParentContentFilters(partialFilters) {
    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          contentFilters: {
            ...currentState.session.parent.contentFilters,
            ...partialFilters,
          },
        },
      },
    }));
    renderApp();
  },
  selectParentCard(cardId) {
    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          selectedCardId: cardId,
        },
      },
    }));
    renderApp();
  },
  toggleParentCard(cardId) {
    commitState((currentState) => {
      const disabledIds = currentState.profile.parentMode.disabledCardIds.includes(cardId)
        ? currentState.profile.parentMode.disabledCardIds.filter((id) => id !== cardId)
        : [...currentState.profile.parentMode.disabledCardIds, cardId];

      return {
        ...currentState,
        profile: {
          ...currentState.profile,
          parentMode: {
            ...currentState.profile.parentMode,
            disabledCardIds: disabledIds,
          },
        },
      };
    });
  },
  toggleParentCategory(categoryId) {
    commitState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        parentMode: {
          ...currentState.profile.parentMode,
          categoryStates: {
            ...currentState.profile.parentMode.categoryStates,
            [categoryId]: !currentState.profile.parentMode.categoryStates[categoryId],
          },
        },
      },
    }));
  },
  updateParentRewardSetting(key, value) {
    const normalizedValue =
      typeof value === "boolean" ? value : /^[0-9]+$/.test(String(value)) ? Number.parseInt(value, 10) : value;

    commitState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        parentMode: {
          ...currentState.profile.parentMode,
          rewards: {
            ...currentState.profile.parentMode.rewards,
            [key]: normalizedValue,
          },
        },
      },
    }));
  },
  requestParentReset(resetId) {
    const definition = getResetDefinition(resetId);
    if (!definition) {
      return;
    }

    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          pendingReset: definition,
        },
      },
    }));
    renderApp();
  },
  cancelParentReset() {
    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          pendingReset: null,
        },
      },
    }));
    renderApp();
  },
  confirmParentReset(resetId) {
    const definition = getResetDefinition(resetId);
    if (!definition) {
      return;
    }

    commitState((currentState) => ({
      ...currentState,
      profile: definition.apply(currentState.profile),
      session: {
        ...currentState.session,
        reward: createRewardSession(),
        gameResult: null,
        modalCardId: null,
        learnSelectedCardId: null,
        parent: {
          ...currentState.session.parent,
          pendingReset: null,
          transfer: {
            ...currentState.session.parent.transfer,
            status: {
              kind: "success",
              titleKey: "parent.reset.resetDoneTitle",
              detailKey: definition.titleKey,
              lines: [],
            },
          },
        },
      },
    }));
  },
  updateParentTransferText(text) {
    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          transfer: {
            ...currentState.session.parent.transfer,
            text,
          },
        },
      },
    }));
  },
  clearParentTransferText() {
    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          transfer: createTransferState(),
        },
      },
    }));
    renderApp();
  },
  exportParentData() {
    const jsonText = exportProfileToJson(store.getState().profile);
    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        parent: {
          ...currentState.session.parent,
          transfer: {
            text: jsonText,
            status: {
              kind: "success",
              titleKey: "parent.transfer.exportReadyTitle",
              detailKey: "parent.transfer.exportReadyBody",
              lines: [],
            },
          },
        },
      },
    }));
    renderApp();
  },
  requestImportParentData() {
    const currentText = store.getState().session.parent.transfer.text;
    const result = importProfileFromJson(currentText);

    if (!result.ok) {
      store.setState((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          parent: {
            ...currentState.session.parent,
            transfer: {
              ...currentState.session.parent.transfer,
              status: {
                kind: "error",
                titleKey: "parent.transfer.importBlockedTitle",
                detailKey: "parent.transfer.importBlockedBody",
                lines: result.errors,
              },
            },
          },
        },
      }));
      renderApp();
      return;
    }

    commitState((currentState) => ({
      ...currentState,
      profile: result.profile,
      session: {
        ...currentState.session,
        reward: createRewardSession(),
        gameResult: null,
        modalCardId: null,
        learnSelectedCardId: null,
        parent: {
          ...currentState.session.parent,
          transfer: {
            ...currentState.session.parent.transfer,
            status: {
              kind: result.warnings.length ? "warning" : "success",
              titleKey: result.warnings.length
                ? "parent.transfer.importWarningTitle"
                : "parent.transfer.importSuccessTitle",
              detailKey: "parent.transfer.importAppliedBody",
              lines: result.warnings,
            },
          },
        },
      },
    }));
  },
  playRandomGame(currentGameId = null) {
    const nextGameId = getRandomGameId({
      excludeGameId: currentGameId ?? store.getState().route.game,
    });
    navigate(ROUTES.play, { game: nextGameId });
  },
  playRecommendedGame(currentGameId = null) {
    const nextGameId = getRecommendedGameId(
      store.getState().profile,
      currentGameId ?? store.getState().route.game,
    );
    navigate(ROUTES.play, { game: nextGameId });
  },
  async startDailyChallenge() {
    const authState = store.getState().auth;
    if (authState.mode !== "authenticated" || !authState.user?.uid) {
      actions.openAuthModal("signin");
      return;
    }

    const challengeSnapshot = await dailyChallenge.startCurrentChallenge(authState);
    if (!challengeSnapshot.canStart || !challengeSnapshot.definition?.gameId) {
      renderApp();
      return;
    }

    navigate(ROUTES.play, {
      game: challengeSnapshot.definition.gameId,
      challenge: "daily",
    });
  },
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
  setLanguage(language) {
    commitState(patchLanguage(language));
  },
  setSpeechVoice(voiceURI) {
    speech.setPreferredVoice(voiceURI);
    commitState(patchSpeechSettings({ voiceURI }));
  },
  openAuthModal(mode = "signin") {
    updateSessionOnly((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        authUi: {
          ...currentState.session.authUi,
          isOpen: true,
          mode: mode === "signup" ? "signup" : "signin",
          errorKey: "",
          infoKey: currentState.auth.needsSetup ? "auth.setupNeededBody" : "",
          isSubmitting: false,
        },
      },
    }));
  },
  closeAuthModal() {
    updateSessionOnly((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        authUi: createAuthUiState(),
      },
    }));
  },
  setAuthMode(mode) {
    updateSessionOnly((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        authUi: {
          ...currentState.session.authUi,
          mode: mode === "signup" ? "signup" : "signin",
          errorKey: "",
          infoKey: currentState.auth.needsSetup ? "auth.setupNeededBody" : "",
          password: "",
        },
      },
    }));
  },
  updateAuthField(field, value) {
    if (!["email", "password"].includes(field)) {
      return;
    }

    store.setState((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        authUi: {
          ...currentState.session.authUi,
          [field]: value,
          errorKey: "",
        },
      },
    }));
  },
  async submitAuth() {
    const currentState = store.getState();
    const { authUi } = currentState.session;
    const email = authUi.email.trim();
    const password = authUi.password;

    if (!email) {
      updateSessionOnly((nextState) => ({
        ...nextState,
        session: {
          ...nextState.session,
          authUi: {
            ...nextState.session.authUi,
            errorKey: "auth.errors.emailRequired",
          },
        },
      }));
      return;
    }

    if (!password) {
      updateSessionOnly((nextState) => ({
        ...nextState,
        session: {
          ...nextState.session,
          authUi: {
            ...nextState.session.authUi,
            errorKey: "auth.errors.passwordRequired",
          },
        },
      }));
      return;
    }

    if (authUi.mode === "signup" && password.length < 6) {
      updateSessionOnly((nextState) => ({
        ...nextState,
        session: {
          ...nextState.session,
          authUi: {
            ...nextState.session.authUi,
            errorKey: "auth.errors.weakPassword",
          },
        },
      }));
      return;
    }

    updateSessionOnly((nextState) => ({
      ...nextState,
      session: {
        ...nextState.session,
        authUi: {
          ...nextState.session.authUi,
          isSubmitting: true,
          errorKey: "",
          infoKey: "",
        },
      },
    }));

    const captchaResult = await recaptcha.getToken(authUi.mode === "signup" ? "signup" : "signin");
    if (!captchaResult.ok) {
      updateSessionOnly((nextState) => ({
        ...nextState,
        session: {
          ...nextState.session,
          authUi: {
            ...nextState.session.authUi,
            isSubmitting: false,
            errorKey: captchaResult.messageKey ?? "auth.errors.recaptchaUnavailable",
          },
        },
      }));
      return;
    }

    const result =
      authUi.mode === "signup"
        ? await auth.signUp(email, password)
        : await auth.signIn(email, password);

    if (!result.ok) {
      updateSessionOnly((nextState) => ({
        ...nextState,
        session: {
          ...nextState.session,
          authUi: {
            ...nextState.session.authUi,
            isSubmitting: false,
            errorKey: result.messageKey ?? "auth.errors.generic",
          },
        },
      }));
      return;
    }

    updateSessionOnly((nextState) => ({
      ...nextState,
      session: {
        ...nextState.session,
        authUi: createAuthUiState(),
      },
    }));
  },
  async signOutUser() {
    updateSessionOnly((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        authUi: {
          ...currentState.session.authUi,
          isSubmitting: true,
          errorKey: "",
          infoKey: "",
        },
      },
    }));

    const result = await auth.signOut();
    if (!result.ok) {
      updateSessionOnly((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          authUi: {
            ...currentState.session.authUi,
            isSubmitting: false,
            errorKey: result.messageKey ?? "auth.errors.generic",
          },
        },
      }));
      return;
    }

    updateSessionOnly((currentState) => ({
      ...currentState,
      session: {
        ...currentState.session,
        authUi: createAuthUiState(),
      },
    }));
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

    const activeCards = getChildModeCards(hydrateCards(profile), profile);
    if (!activeCards.length) {
      commitState((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          reward: {
            ...currentState.session.reward,
            reveal: {
              type: "blocked",
              titleKey: "emptyState.noActiveCardsTitle",
              detailKey: "reward.contentPausedHint",
            },
            phase: "revealed",
          },
        },
      }));
      return;
    }

    const openingResult = advanceBoxOpeningSession({
      profile,
      cards: activeCards,
      opening: session.reward.opening,
    });

    if (openingResult.status === "blocked") {
      updateSessionOnly((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          reward: {
            ...createRewardSession(),
            reveal: openingResult.reveal,
            phase: "revealed",
          },
        },
      }));
      return;
    }

    if (openingResult.status === "progress") {
      updateSessionOnly((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          reward: {
            ...currentState.session.reward,
            opening: openingResult.opening,
            pendingReveal: null,
            reveal: null,
            phase: openingResult.opening.stageClicks === 1 ? "warming" : "charged",
          },
        },
      }));

      feedback.trigger(
        openingResult.opening.stageClicks === 1 ? FEEDBACK_EVENTS.rewardTap1 : FEEDBACK_EVENTS.rewardTap2,
      );
      return;
    }

    if (openingResult.status === "upgraded") {
      updateSessionOnly((currentState) => ({
        ...currentState,
        session: {
          ...currentState.session,
          reward: {
            ...currentState.session.reward,
            opening: openingResult.opening,
            pendingReveal: null,
            reveal: null,
            phase: "upgraded",
          },
        },
      }));

      feedback.trigger(FEEDBACK_EVENTS.rewardTap3);
      return;
    }

    if (openingResult.status !== "resolved") {
      return;
    }

    feedback.trigger(FEEDBACK_EVENTS.rewardTap3);
    clearRewardRevealTimeout();

    const rewardResult = openingResult;
    const nextCards = hydrateCards(rewardResult.profile);
    const nextActiveCards = getChildModeCards(nextCards, rewardResult.profile);
    const revealedCard =
      rewardResult.reward.type === "card" || rewardResult.reward.type === "duplicate"
        ? getCardById(nextCards, rewardResult.reward.cardId)
        : null;
    const nextProgress = summarizeProgress(nextActiveCards, rewardResult.profile);
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
          opening: rewardResult.opening,
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
        audio: rewardResult.reward.type === "card" || rewardResult.reward.type === "duplicate",
      });

      if (rewardResult.reward.type === "card" && revealedCard) {
        feedback.trigger(FEEDBACK_EVENTS.newCardUnlocked, {
          rarity: revealedCard.rarity,
          audio: revealedCard.rarity !== "legend",
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
  async finishGame(result) {
    const currentState = store.getState();
    const isDailyChallengeRun =
      currentState.route.challenge === "daily" &&
      currentState.dailyChallenge.definition?.gameId === result.gameId &&
      currentState.auth.mode === "authenticated";

    if (result.status === "won") {
      let winSummary = null;
      let nextProfile = null;

      const { profile: baseProfile, summary } = recordGameWin(currentState.profile, result.gameId);
      nextProfile = baseProfile;
      winSummary = summary;

      if (isDailyChallengeRun) {
        const dailyResult = await dailyChallenge.resolveCurrentAttempt(currentState.auth, {
          gameId: result.gameId,
          succeeded: true,
          profile: baseProfile,
        });

        if (dailyResult.matched && dailyResult.profile) {
          nextProfile = dailyResult.profile;
          winSummary = {
            ...summary,
            dailyChallenge: {
              status: dailyResult.challengeState?.status ?? "completed",
              rewardGranted: Boolean(dailyResult.rewardGranted),
              boxesAwarded: dailyResult.rewardGranted
                ? dailyResult.challengeState?.rewardBoxesGranted ?? 1
                : 0,
            },
          };
        }
      }

      commitState((currentState) => {
        return {
          ...currentState,
          profile: nextProfile,
          session: {
            ...currentState.session,
            gameResult: {
              ...result,
              summary: winSummary,
            },
          },
        };
      });
      feedback.trigger(FEEDBACK_EVENTS.gameWin);

      if (winSummary?.reachedMilestone) {
        feedback.trigger(FEEDBACK_EVENTS.progressMilestone, {
          audioOptions: { delayMs: 140 },
        });
      }
      return;
    }

    if (isDailyChallengeRun) {
      await dailyChallenge.resolveCurrentAttempt(currentState.auth, {
        gameId: result.gameId,
        succeeded: false,
        profile: currentState.profile,
      });
    }

    commitState((currentState) => {
      const { profile, summary } = recordGameLoss(currentState.profile, result.gameId);

      return {
        ...currentState,
        profile,
        session: {
          ...currentState.session,
          gameResult: {
            ...result,
            summary,
          },
        },
      };
    });
    feedback.trigger(FEEDBACK_EVENTS.gameLose);
  },
  async clearGameResult() {
    feedback.trigger(FEEDBACK_EVENTS.buttonClick);
    const currentState = store.getState();
    if (currentState.route.challenge === "daily") {
      await dailyChallenge.startCurrentChallenge(currentState.auth);
    }
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
  [ROUTES.parent]: (container, context) => renderParentScreen(container, context),
};

function renderShell({
  progress,
  parentSummary,
  currentRoute,
  audioSettings,
  navMotion,
  speechOptions,
  selectedVoiceId,
  authState,
  recaptchaState,
  authUi,
}) {
  if (currentRoute.path === ROUTES.parent) {
    return `
      <div class="app-shell app-shell--parent">
        <div class="route-glow route-glow--parent" aria-hidden="true"></div>
        <header class="shell-topbar shell-topbar--parent">
          <div class="brand-lockup brand-lockup--parent">
            <span class="brand-mark" aria-hidden="true"></span>
            <span class="brand-copy">
              <strong>${APP_NAME} ${t("shell.parentMode")}</strong>
              <span>${t("shell.parentModeSubtitle")}</span>
            </span>
          </div>
          <div class="topbar-status topbar-status--parent">
            <span class="status-pill"><strong>${parentSummary.unlockedAllCount}</strong><span>${t("shell.unlocked")}</span></span>
            <span class="status-pill"><strong>${progress.rewardBoxes}</strong><span>${t("shell.stash")}</span></span>
            ${renderLanguageSelector(languageManager.getLanguage())}
            <button class="ghost-button" type="button" data-parent-exit-shell="true">${t("shell.exitParentMode")}</button>
          </div>
        </header>
        <main class="shell-main shell-main--${navMotion}" data-route="${currentRoute.path}">
          <div id="screen-root"></div>
        </main>
      </div>
    `;
  }

  return `
    <div class="app-shell app-shell--${currentRoute.path}">
      <div class="route-glow route-glow--${currentRoute.path}" aria-hidden="true"></div>
      <header class="shell-topbar">
        <a class="brand-lockup" href="${buildRoute(ROUTES.home)}" data-ui-click="true" data-parent-secret="true">
          <span class="brand-mark" aria-hidden="true"></span>
          <span class="brand-copy">
            <strong>${APP_NAME}</strong>
            <span>${t("shell.tagline")}</span>
          </span>
        </a>
        <div class="topbar-status">
          <span class="status-pill"><strong>${progress.rewardBoxes}</strong><span>${t("shell.boxes")}</span></span>
          <span class="status-pill"><strong>${progress.totalUnlocked}</strong><span>${t("shell.cards")}</span></span>
          <a
            class="ghost-button parent-entry-button"
            href="${buildRoute(ROUTES.parent, { section: DEFAULT_PARENT_SECTION })}"
            data-ui-click="true"
            aria-label="${t("shell.parentMode")}"
          >
            <span aria-hidden="true">🛡</span>
            <span class="parent-entry-button__label">${t("shell.parentMode")}</span>
          </a>
          ${renderLanguageSelector(languageManager.getLanguage())}
          ${renderVoiceSelector({
            selectedVoiceId,
            voiceOptions: speechOptions,
          })}
          ${renderAuthTrigger(authState)}
          <div class="audio-controls" aria-label="Audio controls">
            <button
              class="mute-toggle mute-toggle--icon ${audioSettings.muted ? "is-muted" : ""}"
              type="button"
              data-toggle-mute="true"
              aria-label="${audioSettings.muted ? t("shell.soundOff") : t("shell.soundOn")}"
              title="${audioSettings.muted ? t("shell.soundOff") : t("shell.soundOn")}"
            >
              <span aria-hidden="true">${audioSettings.muted ? "🔇" : "🔊"}</span>
            </button>
          </div>
        </div>
      </header>

      <main class="shell-main shell-main--${navMotion}" data-route="${currentRoute.path}">
        <div id="screen-root"></div>
      </main>
      ${renderAuthModal({ authState, recaptchaState, authUi })}
    </div>

    <nav class="shell-nav" aria-label="Primary navigation">
      ${[
        { route: ROUTES.home, label: t("shell.nav.home.label"), tag: t("shell.nav.home.tag") },
        { route: ROUTES.play, label: t("shell.nav.play.label"), tag: t("shell.nav.play.tag") },
        { route: ROUTES.reward, label: t("shell.nav.reward.label"), tag: t("shell.nav.reward.tag") },
        { route: ROUTES.collection, label: t("shell.nav.collection.label"), tag: t("shell.nav.collection.tag") },
        { route: ROUTES.learn, label: t("shell.nav.learn.label"), tag: t("shell.nav.learn.tag") },
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
  const currentRoute = store.getState().route.path;
  safeDestroyScreen(activeScreen, { routePath: currentRoute });
  activeScreen = null;
  cleanupLanguageSelector();
  cleanupLanguageSelector = () => {};
  cleanupVoiceSelector();
  cleanupVoiceSelector = () => {};
  clearLastAppError();

  let derived;
  try {
    derived = deriveState();
  } catch (error) {
    renderAppSafely({
      root,
      routePath: currentRoute,
      error,
    });
    return;
  }

  const {
    state,
    allCards,
    cards,
    parentSummary,
    progress,
    collectionFilters,
    learnFilters,
    newestCard,
    modalCard,
    rewardCard,
    reviewDeck,
  } = derived;
  const selectedLearnCard =
    reviewDeck.find((card) => card.id === state.session.learnSelectedCardId) ?? reviewDeck[0] ?? null;

  try {
    languageManager.setLanguage(state.profile.settings.language);
    speech.setPreferredVoice(state.profile.settings.speech?.voiceURI ?? null);
    applyCursorSkin(state.profile);
    document.body.dataset.route = state.route.path;

    root.innerHTML = renderShell({
      progress,
      parentSummary,
      currentRoute: state.route,
      audioSettings: state.profile.settings.audio,
      navMotion: state.session.navMotion,
      speechOptions: speech.getVoiceOptions(),
      selectedVoiceId: state.profile.settings.speech?.voiceURI ?? speech.getSelectedVoiceId(),
      authState: state.auth,
      recaptchaState: state.recaptcha,
      authUi: state.session.authUi,
    });

    feedback.syncRoute(state.route.path);
    document.body.classList.toggle("is-modal-open", state.session.authUi.isOpen);

    root.querySelector("[data-toggle-mute]")?.addEventListener("click", () => {
      actions.toggleMute();
    });

    root.querySelector("[data-parent-exit-shell]")?.addEventListener("click", () => {
      actions.exitParentMode();
    });

    cleanupLanguageSelector = wireLanguageSelector(root, {
      currentLanguage: state.profile.settings.language,
      onSelect(language) {
        actions.setLanguage(language);
      },
      onOpen() {
        feedback.trigger(FEEDBACK_EVENTS.buttonClick, {
          audioOptions: { throttleMs: 0 },
        });
      },
    });

    cleanupVoiceSelector = wireVoiceSelector(root, {
      currentVoiceId: state.profile.settings.speech?.voiceURI ?? speech.getSelectedVoiceId(),
      onSelect(voiceId) {
        actions.setSpeechVoice(voiceId);
      },
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

    root.querySelectorAll("[data-close-auth]").forEach((element) => {
      element.addEventListener("click", (event) => {
        if (element.dataset.closeAuth === "button" || event.target === element) {
          actions.closeAuthModal();
        }
      });
    });

    root.querySelectorAll("[data-auth-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        actions.setAuthMode(button.dataset.authMode);
      });
    });

    root.querySelectorAll("[data-auth-submit]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        actions.submitAuth();
      });
    });

    root.querySelectorAll(".auth-form__input").forEach((input) => {
      input.addEventListener("input", () => {
        actions.updateAuthField(input.name, input.value);
      });
    });

    root.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", () => {
        actions.signOutUser();
      });
    });

    root.querySelector("[data-parent-secret='true']")?.addEventListener("click", (event) => {
      actions.armParentModeTrigger(event);
    });

    const screenRoot = root.querySelector("#screen-root");
    const renderer = SCREEN_RENDERERS[state.route.path] ?? SCREEN_RENDERERS[ROUTES.home];

      activeScreen = renderScreenSafely({
      container: screenRoot,
      renderer,
      routePath: state.route.path,
        context: {
          language: state.profile.settings.language,
          route: state.route,
        allCards,
        cards,
        parentSummary,
        progress,
        newestCard,
        filters: collectionFilters,
        learnFilters,
        modalCard,
        rewardState: state.session.reward,
        rewardCard,
        rewardBoxes: state.profile.rewardBoxes,
        activeCardCount: parentSummary.activeCardCount,
        unlockedCards: reviewDeck,
        selectedCard: selectedLearnCard,
        result: state.session.gameResult,
        dailyChallenge: state.dailyChallenge,
        parentUi: state.session.parent,
        isUnlocked: state.session.parent.unlocked,
        profile: state.profile,
        authState: state.auth,
        actions,
        playSound(soundId, options) {
          feedback.playSound(soundId, options);
        },
        speakEnglishWord(word) {
          speech.speakWordInEnglish(word);
        },
      },
    });

    root.querySelectorAll("[data-open-auth]").forEach((button) => {
      button.addEventListener("click", () => {
        actions.openAuthModal(button.dataset.openAuth);
      });
    });

    uiEffects.apply(root);
  } catch (error) {
    document.body.classList.toggle("is-modal-open", false);
    renderAppSafely({
      root,
      routePath: state.route.path,
      error,
    });
  }
}

router = createRouter((route) => {
  const previousState = store.getState();
  const nextGame = route.path === ROUTES.play && route.game in GAME_CONFIG ? route.game : null;
  const nextChallenge = route.path === ROUTES.play ? route.challenge ?? null : null;
  const navMotion = getRouteMotion(previousState.route.path, route.path);
  const nextSection = normalizeParentSection(route.section ?? previousState.session.parent.section);

  if (route.path !== ROUTES.reward) {
    clearRewardRevealTimeout();
  }

  store.setState((currentState) => ({
    ...currentState,
    route: {
      ...route,
      game: nextGame,
      challenge: nextChallenge,
      section: route.path === ROUTES.parent ? nextSection : null,
    },
    session: {
      ...currentState.session,
      navMotion,
      modalCardId: route.path === ROUTES.collection ? currentState.session.modalCardId : null,
      gameResult:
        route.path === ROUTES.play &&
        nextGame &&
        currentState.session.gameResult?.gameId === nextGame &&
        (currentState.route.challenge ?? null) === nextChallenge
          ? currentState.session.gameResult
          : null,
      reward: route.path === ROUTES.reward ? currentState.session.reward : createRewardSession(),
      parent: {
        ...currentState.session.parent,
        section: nextSection,
      },
    },
  }));
  renderApp();
});

function primeAudioFromInteraction() {
  feedback.prime();
}

function handleCardSpeech(event) {
  const speakableTarget = event.target.closest?.("[data-speak-word]");
  if (!speakableTarget || !root.contains(speakableTarget)) {
    return;
  }

  speech.speakWordInEnglish(speakableTarget.dataset.speakWord);
}

function refreshDailyChallengeOnFocus() {
  const authState = auth.getSnapshot();
  if (authState.mode === "authenticated") {
    void dailyChallenge.refresh(authState);
  }
}

document.addEventListener("pointerdown", primeAudioFromInteraction, {
  passive: true,
  capture: true,
});
document.addEventListener("keydown", primeAudioFromInteraction, {
  capture: true,
});
root.addEventListener("click", handleCardSpeech, true);
window.addEventListener("focus", refreshDailyChallengeOnFocus);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    refreshDailyChallengeOnFocus();
  }
});

languageManager.apply();

window.render_game_to_text = () => {
  const { state, allCards, cards, parentSummary, progress } = deriveState();
  return JSON.stringify({
    language: state.profile.settings.language,
    direction: languageManager.getDirection(),
    route: state.route.path,
    routeGame: state.route.game,
    routeChallenge: state.route.challenge,
    routeSection: state.route.section,
    rewardBoxes: state.profile.rewardBoxes,
    rewardBoxesEarned: state.profile.rewardBoxesEarned,
    rewardBoxesOpened: state.profile.rewardBoxesOpened,
    totalUnlocked: progress.totalUnlocked,
    totalUnlockedAll: parentSummary.unlockedAllCount,
    totalUnlockedActive: parentSummary.unlockedActiveCount,
    totalUnlockedShelved: parentSummary.shelvedUnlockedCount,
    totalCards: progress.totalCards,
    totalCardsAll: allCards.length,
    activeCards: parentSummary.activeCardCount,
    totalWins: state.profile.totalWins,
    currentStreak: state.profile.currentStreak,
    bestStreak: state.profile.bestStreak,
    parentMode: {
      unlocked: state.session.parent.unlocked,
      section: state.session.parent.section,
      shelvedUnlocked: parentSummary.shelvedUnlockedCount,
    },
    audio: {
      muted: state.profile.settings.audio.muted,
      musicEnabled: state.profile.settings.audio.musicEnabled,
      sfxEnabled: state.profile.settings.audio.sfxEnabled,
      debug: feedback.getDebugState(),
    },
    speech: speech.getDebugState(),
    auth: state.auth,
    dailyChallenge: state.dailyChallenge,
    recaptcha: state.recaptcha,
    persistence: state.persistence,
    legacyArchive: getLegacyArchiveInfo(),
    reward: {
      clicks: state.session.reward.opening?.stageClicks ?? 0,
      totalClicks: state.session.reward.opening?.totalClicks ?? 0,
      currentRarity: state.session.reward.opening?.currentRarity ?? null,
      upgradeCount: state.session.reward.opening?.upgradeHistory?.length ?? 0,
      phase: state.session.reward.phase,
      reveal: state.session.reward.reveal,
    },
    playSummary: {
      totalPlays: progress.playSummary.totalPlays,
      gamesTried: progress.playSummary.gamesTried,
      gamesWon: progress.playSummary.gamesWon,
      nextMilestoneTarget: progress.playSummary.nextMilestoneTarget,
      winsUntilMilestone: progress.playSummary.winsUntilMilestone,
      recommendedGame: progress.playSummary.recommendedGame?.id ?? null,
      randomGame: progress.playSummary.randomGame?.id ?? null,
    },
    activeScreen: activeScreen?.getDebugState?.() ?? null,
    lastError: getLastAppError(),
    unlockedPreview: cards.filter((card) => card.unlocked).slice(0, 6).map((card) => card.word),
  });
};

window.advanceTime = (milliseconds) => {
  activeScreen?.advanceTime?.(milliseconds);
};

window.addEventListener("beforeunload", () => {
  clearRewardRevealTimeout();
  cleanupLanguageSelector();
  cleanupVoiceSelector();
  cleanupAuthSubscription();
  cleanupDailyChallengeSubscription();
  cleanupRecaptchaSubscription();
  cleanupSpeechSubscription();
  uiEffects.destroy();
  feedback.destroy();
  speech.destroy();
  auth.destroy();
  dailyChallenge.destroy();
  eventBus.clear();
});

root.innerHTML = `
  <div class="app-shell app-shell--loading">
    <main class="shell-main" data-route="loading">
      <section class="section-panel section-panel--compact" style="margin: auto; max-width: 520px;">
        <span class="small-label">LootWords</span>
        <h1 class="section-title">Loading your play session</h1>
        <p class="screen-note">Preparing the correct guest or account profile before the app opens.</p>
      </section>
    </main>
  </div>
`;

async function bootstrapApp() {
  await auth.init();
  await recaptcha.init();

  if (store.getState().persistence.status !== "ready") {
    await syncProfileForAuth(auth.getSnapshot());
  }
}

void bootstrapApp();
