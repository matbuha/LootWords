import {
  AUDIO_EVENT_SFX,
  AUDIO_RARITY_ACCENTS,
  AUDIO_ROUTE_TRACKS,
  FEEDBACK_EVENTS,
  ROUTES,
} from "../data/config.js";

const FEEDBACK_CLASSES = {
  [FEEDBACK_EVENTS.screenTransition]: { className: "is-feedback-transition", duration: 260 },
  [FEEDBACK_EVENTS.gameWin]: { className: "is-feedback-victory", duration: 1100 },
  [FEEDBACK_EVENTS.gameLose]: { className: "is-feedback-defeat", duration: 650 },
  [FEEDBACK_EVENTS.rewardTap1]: { className: "is-feedback-reward-tap-1", duration: 240 },
  [FEEDBACK_EVENTS.rewardTap2]: { className: "is-feedback-reward-tap-2", duration: 260 },
  [FEEDBACK_EVENTS.rewardTap3]: { className: "is-feedback-reward-tap-3", duration: 300 },
  [FEEDBACK_EVENTS.rewardOpen]: { className: "is-feedback-reward-burst", duration: 900 },
  [FEEDBACK_EVENTS.cardReveal]: { className: "is-feedback-card-reveal", duration: 980 },
  [FEEDBACK_EVENTS.progressMilestone]: { className: "is-feedback-milestone", duration: 960 },
  [FEEDBACK_EVENTS.newCardUnlocked]: { className: "is-feedback-new-card", duration: 780 },
};

export function createFeedbackManager({ audio, eventBus, surface = document.body } = {}) {
  const timers = new Map();
  let currentRoute = null;

  function pulse(className, duration) {
    if (!className || !surface) {
      return;
    }

    surface.classList.add(className);

    if (timers.has(className)) {
      window.clearTimeout(timers.get(className));
    }

    const timeoutId = window.setTimeout(() => {
      surface.classList.remove(className);
      timers.delete(className);
    }, duration);

    timers.set(className, timeoutId);
  }

  function trigger(type, payload = {}) {
    eventBus?.emit(type, payload);

    const sfxId = AUDIO_EVENT_SFX[type];
    if (sfxId && payload.audio !== false) {
      audio.playSfx(sfxId, payload.audioOptions);
    }

    const visual = FEEDBACK_CLASSES[type];
    if (visual) {
      pulse(visual.className, payload.duration ?? visual.duration);
    }

    if (type === FEEDBACK_EVENTS.cardReveal && payload.rarity) {
      const rarityAccent = AUDIO_RARITY_ACCENTS[payload.rarity];
      if (rarityAccent) {
        audio.playSfx(rarityAccent, {
          delayMs: payload.rarity === "legend" ? 140 : 90,
        });
      }

      if (payload.rarity === "epic" || payload.rarity === "mythic") {
        pulse("is-feedback-epic", 980);
      }

      if (payload.rarity === "legend") {
        pulse("is-feedback-legendary", 1400);
      }
    }
  }

  function syncRoute(routePath) {
    const isInitialRoute = currentRoute === null;
    const routeChanged = currentRoute !== routePath;

    currentRoute = routePath;
    audio.setMusic(AUDIO_ROUTE_TRACKS[routePath] ?? null);

    if (!routeChanged || isInitialRoute) {
      return;
    }

    trigger(FEEDBACK_EVENTS.screenTransition, {
      audio: routePath === ROUTES.play,
    });

    if (routePath !== ROUTES.play) {
      trigger(FEEDBACK_EVENTS.menuOpen, {
        audioOptions: { throttleMs: 180 },
      });
    }
  }

  return {
    trigger,
    syncRoute,
    prime() {
      audio.unlock();
    },
    playSound(soundId, options = {}) {
      audio.playSfx(soundId, options);
    },
    setAudioSettings(settings) {
      audio.setSettings(settings);
    },
    getDebugState() {
      return {
        route: currentRoute,
        audio: audio.getDebugState(),
      };
    },
    destroy() {
      timers.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timers.clear();
      audio.destroy();
    },
  };
}
