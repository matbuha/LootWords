import {
  AUDIO_ASSET_PATHS,
  AUDIO_DEFAULT_SETTINGS,
  AUDIO_SFX,
  AUDIO_TRACKS,
} from "../data/config.js";
import { normalizeAudioSettings } from "./settings-manager.js";

const NOTES = {
  c4: 261.63,
  d4: 293.66,
  e4: 329.63,
  f4: 349.23,
  g4: 392.0,
  a4: 440.0,
  b4: 493.88,
  c5: 523.25,
  d5: 587.33,
  e5: 659.25,
  g5: 783.99,
  a5: 880.0,
};

const SFX_THROTTLES = {
  [AUDIO_SFX.click]: 55,
  [AUDIO_SFX.hover]: 120,
  [AUDIO_SFX.menuOpen]: 120,
  [AUDIO_SFX.screenTransition]: 140,
  [AUDIO_SFX.success]: 220,
  [AUDIO_SFX.failure]: 220,
  [AUDIO_SFX.rewardTap1]: 100,
  [AUDIO_SFX.rewardTap2]: 100,
  [AUDIO_SFX.rewardTap3]: 120,
  [AUDIO_SFX.rewardOpen]: 360,
  [AUDIO_SFX.cardReveal]: 420,
  [AUDIO_SFX.epicRevealAccent]: 520,
  [AUDIO_SFX.legendaryReveal]: 720,
  [AUDIO_SFX.cardSelect]: 90,
  [AUDIO_SFX.filterShift]: 90,
  [AUDIO_SFX.milestone]: 600,
  [AUDIO_SFX.newCardUnlocked]: 360,
};

const SFX_LEVELS = {
  [AUDIO_SFX.click]: 0.8,
  [AUDIO_SFX.hover]: 0.42,
  [AUDIO_SFX.menuOpen]: 0.7,
  [AUDIO_SFX.screenTransition]: 0.78,
  [AUDIO_SFX.success]: 0.95,
  [AUDIO_SFX.failure]: 0.82,
  [AUDIO_SFX.rewardTap1]: 0.86,
  [AUDIO_SFX.rewardTap2]: 0.9,
  [AUDIO_SFX.rewardTap3]: 0.92,
  [AUDIO_SFX.rewardOpen]: 1,
  [AUDIO_SFX.cardReveal]: 0.96,
  [AUDIO_SFX.epicRevealAccent]: 0.9,
  [AUDIO_SFX.legendaryReveal]: 1,
  [AUDIO_SFX.cardSelect]: 0.72,
  [AUDIO_SFX.filterShift]: 0.62,
  [AUDIO_SFX.milestone]: 0.9,
  [AUDIO_SFX.newCardUnlocked]: 0.74,
};

const SYNTH_SFX = {
  [AUDIO_SFX.click]: [
    { frequency: NOTES.e5, duration: 0.05, type: "triangle", gain: 0.022 },
  ],
  [AUDIO_SFX.hover]: [
    { frequency: NOTES.g4, duration: 0.04, type: "sine", gain: 0.012 },
  ],
  [AUDIO_SFX.menuOpen]: [
    { frequency: NOTES.c4, duration: 0.06, type: "triangle", gain: 0.018 },
    { frequency: NOTES.g4, duration: 0.07, type: "triangle", gain: 0.019 },
    { frequency: NOTES.c5, duration: 0.11, type: "triangle", gain: 0.022 },
  ],
  [AUDIO_SFX.screenTransition]: [
    { frequency: NOTES.a4, duration: 0.04, type: "triangle", gain: 0.016 },
    { frequency: NOTES.c5, duration: 0.05, type: "triangle", gain: 0.018 },
    { frequency: NOTES.d5, duration: 0.08, type: "triangle", gain: 0.02 },
  ],
  [AUDIO_SFX.success]: [
    { frequency: NOTES.c5, duration: 0.08, type: "triangle", gain: 0.02 },
    { frequency: NOTES.e5, duration: 0.1, type: "triangle", gain: 0.022 },
    { frequency: NOTES.g5, duration: 0.16, type: "triangle", gain: 0.024 },
  ],
  [AUDIO_SFX.failure]: [
    { frequency: NOTES.e4, duration: 0.08, type: "square", gain: 0.02 },
    { frequency: NOTES.c4, duration: 0.12, type: "square", gain: 0.019 },
  ],
  [AUDIO_SFX.rewardTap1]: [
    { frequency: 190, duration: 0.07, type: "square", gain: 0.026 },
    { frequency: 250, duration: 0.05, type: "triangle", gain: 0.016 },
  ],
  [AUDIO_SFX.rewardTap2]: [
    { frequency: 210, duration: 0.08, type: "square", gain: 0.03 },
    { frequency: 290, duration: 0.06, type: "sawtooth", gain: 0.018 },
    { frequency: NOTES.e4, duration: 0.07, type: "triangle", gain: 0.016 },
  ],
  [AUDIO_SFX.rewardTap3]: [
    { frequency: 165, duration: 0.08, type: "square", gain: 0.032 },
    { frequency: 225, duration: 0.07, type: "square", gain: 0.024 },
    { frequency: NOTES.g4, duration: 0.08, type: "triangle", gain: 0.018 },
  ],
  [AUDIO_SFX.rewardOpen]: [
    { frequency: NOTES.c4, duration: 0.05, type: "sawtooth", gain: 0.02 },
    { frequency: NOTES.g4, duration: 0.07, type: "sawtooth", gain: 0.022 },
    { frequency: NOTES.c5, duration: 0.12, type: "triangle", gain: 0.026 },
    { frequency: NOTES.e5, duration: 0.15, type: "triangle", gain: 0.028 },
  ],
  [AUDIO_SFX.cardReveal]: [
    { frequency: NOTES.g4, duration: 0.06, type: "triangle", gain: 0.016 },
    { frequency: NOTES.c5, duration: 0.08, type: "triangle", gain: 0.018 },
    { frequency: NOTES.e5, duration: 0.1, type: "triangle", gain: 0.02 },
    { frequency: NOTES.g5, duration: 0.18, type: "triangle", gain: 0.024 },
  ],
  [AUDIO_SFX.epicRevealAccent]: [
    { frequency: NOTES.a4, duration: 0.06, type: "triangle", gain: 0.018 },
    { frequency: NOTES.c5, duration: 0.08, type: "triangle", gain: 0.02 },
    { frequency: NOTES.e5, duration: 0.11, type: "triangle", gain: 0.022 },
    { frequency: NOTES.a5, duration: 0.18, type: "triangle", gain: 0.025 },
  ],
  [AUDIO_SFX.legendaryReveal]: [
    { frequency: NOTES.c5, duration: 0.08, type: "sawtooth", gain: 0.019 },
    { frequency: NOTES.e5, duration: 0.1, type: "triangle", gain: 0.022 },
    { frequency: NOTES.g5, duration: 0.13, type: "triangle", gain: 0.024 },
    { frequency: NOTES.c5 * 2, duration: 0.22, type: "triangle", gain: 0.028 },
  ],
  [AUDIO_SFX.cardSelect]: [
    { frequency: NOTES.d5, duration: 0.05, type: "triangle", gain: 0.016 },
    { frequency: NOTES.g5, duration: 0.08, type: "triangle", gain: 0.018 },
  ],
  [AUDIO_SFX.filterShift]: [
    { frequency: NOTES.g4, duration: 0.04, type: "triangle", gain: 0.014 },
    { frequency: NOTES.c5, duration: 0.06, type: "triangle", gain: 0.016 },
  ],
  [AUDIO_SFX.milestone]: [
    { frequency: NOTES.c4, duration: 0.06, type: "triangle", gain: 0.018 },
    { frequency: NOTES.e4, duration: 0.08, type: "triangle", gain: 0.02 },
    { frequency: NOTES.g4, duration: 0.1, type: "triangle", gain: 0.022 },
    { frequency: NOTES.c5, duration: 0.18, type: "triangle", gain: 0.024 },
  ],
  [AUDIO_SFX.newCardUnlocked]: [
    { frequency: NOTES.e5, duration: 0.05, type: "triangle", gain: 0.014 },
    { frequency: NOTES.g5, duration: 0.09, type: "triangle", gain: 0.018 },
  ],
};

const SYNTH_TRACKS = {
  [AUDIO_TRACKS.menu]: {
    loopDuration: 4.2,
    steps: [
      { offset: 0.0, frequency: NOTES.c4, duration: 0.34, type: "sine", gain: 0.012 },
      { offset: 0.52, frequency: NOTES.g4, duration: 0.18, type: "triangle", gain: 0.01 },
      { offset: 1.05, frequency: NOTES.e4, duration: 0.32, type: "sine", gain: 0.011 },
      { offset: 1.55, frequency: NOTES.c5, duration: 0.2, type: "triangle", gain: 0.01 },
      { offset: 2.14, frequency: NOTES.a4, duration: 0.28, type: "sine", gain: 0.01 },
      { offset: 2.64, frequency: NOTES.g4, duration: 0.18, type: "triangle", gain: 0.009 },
      { offset: 3.18, frequency: NOTES.e4, duration: 0.28, type: "sine", gain: 0.01 },
      { offset: 3.62, frequency: NOTES.c5, duration: 0.22, type: "triangle", gain: 0.011 },
    ],
  },
  [AUDIO_TRACKS.gameplay]: {
    loopDuration: 3.6,
    steps: [
      { offset: 0.0, frequency: NOTES.c4, duration: 0.16, type: "triangle", gain: 0.011 },
      { offset: 0.42, frequency: NOTES.e4, duration: 0.14, type: "triangle", gain: 0.012 },
      { offset: 0.84, frequency: NOTES.g4, duration: 0.16, type: "triangle", gain: 0.012 },
      { offset: 1.26, frequency: NOTES.a4, duration: 0.14, type: "triangle", gain: 0.011 },
      { offset: 1.7, frequency: NOTES.g4, duration: 0.16, type: "triangle", gain: 0.012 },
      { offset: 2.12, frequency: NOTES.e4, duration: 0.16, type: "triangle", gain: 0.011 },
      { offset: 2.54, frequency: NOTES.c5, duration: 0.18, type: "triangle", gain: 0.012 },
      { offset: 2.98, frequency: NOTES.g4, duration: 0.16, type: "triangle", gain: 0.011 },
    ],
  },
  [AUDIO_TRACKS.reward]: {
    loopDuration: 3.8,
    steps: [
      { offset: 0.0, frequency: NOTES.e4, duration: 0.22, type: "sine", gain: 0.011 },
      { offset: 0.5, frequency: NOTES.g4, duration: 0.18, type: "triangle", gain: 0.01 },
      { offset: 1.02, frequency: NOTES.c5, duration: 0.16, type: "triangle", gain: 0.011 },
      { offset: 1.54, frequency: NOTES.g4, duration: 0.2, type: "triangle", gain: 0.01 },
      { offset: 2.08, frequency: NOTES.a4, duration: 0.22, type: "sine", gain: 0.011 },
      { offset: 2.58, frequency: NOTES.c5, duration: 0.16, type: "triangle", gain: 0.011 },
      { offset: 3.06, frequency: NOTES.e5, duration: 0.22, type: "triangle", gain: 0.012 },
    ],
  },
};

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function createGainNode(context, gainValue, startTime, duration) {
  const gainNode = context.createGain();
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  return gainNode;
}

function scheduleNote(context, step, startTime, outputLevel) {
  const oscillator = context.createOscillator();
  oscillator.type = step.type ?? "triangle";
  oscillator.frequency.value = step.frequency;

  const duration = step.duration ?? 0.1;
  const gainNode = createGainNode(
    context,
    clamp01((step.gain ?? 0.018) * outputLevel),
    startTime,
    duration,
  );

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function createAudioManager({
  settings = AUDIO_DEFAULT_SETTINGS,
  assetMap = AUDIO_ASSET_PATHS,
} = {}) {
  let audioSettings = normalizeAudioSettings({ audio: settings });
  let audioContext = null;
  let hasUserInteraction = false;
  let currentTrackId = null;
  let musicPlayer = null;
  let synthMusicTimer = 0;
  let usingAssetMusic = false;

  const registeredAssets = { ...assetMap };
  const brokenAssets = new Set();
  const lastPlayedAt = new Map();

  function ensureContext() {
    if (!window.AudioContext) {
      return null;
    }

    if (!audioContext) {
      audioContext = new window.AudioContext();
    }

    return audioContext;
  }

  function clearSynthMusic() {
    if (synthMusicTimer) {
      window.clearTimeout(synthMusicTimer);
      synthMusicTimer = 0;
    }
  }

  function stopMusicPlayer() {
    if (!musicPlayer) {
      return;
    }

    musicPlayer.pause();
    musicPlayer.currentTime = 0;
    usingAssetMusic = false;
  }

  function shouldPlaySfx() {
    return hasUserInteraction && !audioSettings.muted && audioSettings.sfxEnabled;
  }

  function shouldPlayMusic() {
    return hasUserInteraction && !audioSettings.muted && audioSettings.musicEnabled && currentTrackId;
  }

  function shouldThrottle(assetId, overrideMs) {
    const throttleMs = overrideMs ?? SFX_THROTTLES[assetId] ?? 0;
    if (!throttleMs) {
      return false;
    }

    const now = window.performance.now();
    const lastPlayed = lastPlayedAt.get(assetId) ?? 0;
    if (now - lastPlayed < throttleMs) {
      return true;
    }

    lastPlayedAt.set(assetId, now);
    return false;
  }

  function playSynthSequence(assetId, options = {}) {
    if (!shouldPlaySfx()) {
      return false;
    }

    const sequence = SYNTH_SFX[assetId];
    const context = ensureContext();
    if (!sequence?.length || !context) {
      return false;
    }

    const outputLevel = clamp01(
      (options.volume ?? 1) * audioSettings.sfxVolume * (SFX_LEVELS[assetId] ?? 1),
    );
    const startBase = context.currentTime + (options.delayMs ?? 0) / 1000;
    let offset = 0;

    sequence.forEach((step) => {
      scheduleNote(context, step, startBase + offset, outputLevel);
      offset += step.spacing ?? step.duration * 0.72;
    });

    return true;
  }

  function playAssetSequence(assetId, options = {}) {
    const source = registeredAssets[assetId];
    if (!source || brokenAssets.has(assetId) || !shouldPlaySfx()) {
      return false;
    }

    const player = new window.Audio(source);
    player.preload = "auto";
    player.volume = clamp01(
      (options.volume ?? 1) * audioSettings.sfxVolume * (SFX_LEVELS[assetId] ?? 1),
    );

    const cleanup = () => {
      player.pause();
      player.src = "";
    };

    player.addEventListener(
      "error",
      () => {
        brokenAssets.add(assetId);
        cleanup();
        playSynthSequence(assetId, options);
      },
      { once: true },
    );

    try {
      const result = player.play();
      result?.catch(() => {
        brokenAssets.add(assetId);
        cleanup();
        playSynthSequence(assetId, options);
      });
      return true;
    } catch {
      brokenAssets.add(assetId);
      cleanup();
      return false;
    }
  }

  function scheduleSfx(assetId, options = {}) {
    if (!shouldPlaySfx()) {
      return false;
    }

    if (shouldThrottle(assetId, options.throttleMs)) {
      return false;
    }

    if (options.delayMs) {
      window.setTimeout(() => {
        scheduleSfx(assetId, { ...options, delayMs: 0, throttleMs: 0 });
      }, options.delayMs);
      return true;
    }

    if (playAssetSequence(assetId, options)) {
      return true;
    }

    return playSynthSequence(assetId, options);
  }

  function startSynthMusic(trackId) {
    clearSynthMusic();
    const pattern = SYNTH_TRACKS[trackId];
    const context = ensureContext();
    if (!pattern || !context || !shouldPlayMusic()) {
      return;
    }

    usingAssetMusic = false;

    const playLoop = () => {
      if (!shouldPlayMusic() || currentTrackId !== trackId) {
        return;
      }

      const startBase = context.currentTime + 0.04;
      pattern.steps.forEach((step) => {
        scheduleNote(
          context,
          step,
          startBase + step.offset,
          clamp01(audioSettings.musicVolume * 0.85),
        );
      });

      synthMusicTimer = window.setTimeout(playLoop, pattern.loopDuration * 1000);
    };

    playLoop();
  }

  function startAssetMusic(trackId) {
    const source = registeredAssets[trackId];
    if (!source || brokenAssets.has(trackId) || !shouldPlayMusic()) {
      startSynthMusic(trackId);
      return;
    }

    clearSynthMusic();

    if (!musicPlayer) {
      musicPlayer = new window.Audio();
      musicPlayer.loop = true;
      musicPlayer.preload = "auto";
    }

    musicPlayer.onended = null;
    musicPlayer.onerror = () => {
      brokenAssets.add(trackId);
      stopMusicPlayer();
      startSynthMusic(trackId);
    };

    if (musicPlayer.dataset.trackId !== trackId) {
      musicPlayer.src = source;
      musicPlayer.dataset.trackId = trackId;
    }

    musicPlayer.volume = clamp01(audioSettings.musicVolume);

    try {
      const result = musicPlayer.play();
      result?.catch(() => {
        brokenAssets.add(trackId);
        stopMusicPlayer();
        startSynthMusic(trackId);
      });
      usingAssetMusic = true;
    } catch {
      brokenAssets.add(trackId);
      stopMusicPlayer();
      startSynthMusic(trackId);
    }
  }

  function refreshMusic() {
    clearSynthMusic();

    if (!shouldPlayMusic()) {
      stopMusicPlayer();
      return;
    }

    stopMusicPlayer();
    startAssetMusic(currentTrackId);
  }

  async function unlock() {
    hasUserInteraction = true;
    const context = ensureContext();
    if (context?.state === "suspended") {
      try {
        await context.resume();
      } catch {
        // Browsers may still refuse resume until the next interaction; the app stays silent safely.
      }
    }

    refreshMusic();
  }

  function setSettings(nextSettings) {
    const previous = audioSettings;
    audioSettings = normalizeAudioSettings({ audio: nextSettings });

    if (musicPlayer) {
      musicPlayer.volume = clamp01(audioSettings.musicVolume);
    }

    const musicChanged =
      previous.muted !== audioSettings.muted ||
      previous.musicEnabled !== audioSettings.musicEnabled ||
      previous.musicVolume !== audioSettings.musicVolume;

    if (musicChanged) {
      refreshMusic();
    }
  }

  return {
    unlock,
    playSfx(assetId, options = {}) {
      return scheduleSfx(assetId, options);
    },
    setMusic(trackId) {
      if (currentTrackId === trackId) {
        return;
      }

      currentTrackId = trackId;
      refreshMusic();
    },
    stopMusic() {
      currentTrackId = null;
      clearSynthMusic();
      stopMusicPlayer();
    },
    registerAsset(assetId, source) {
      registeredAssets[assetId] = source;
      brokenAssets.delete(assetId);
      if (assetId === currentTrackId) {
        refreshMusic();
      }
    },
    setSettings,
    getDebugState() {
      return {
        unlocked: hasUserInteraction,
        currentTrackId,
        usingAssetMusic,
        brokenAssets: [...brokenAssets],
        settings: { ...audioSettings },
      };
    },
    destroy() {
      clearSynthMusic();
      stopMusicPlayer();
      if (audioContext?.state === "running") {
        audioContext.close().catch(() => {});
      }
    },
  };
}
