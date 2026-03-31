import { AUDIO_DEFAULT_SETTINGS } from "../data/config.js";

function clampVolume(value, fallback) {
  const normalized = Number.parseFloat(value);
  if (Number.isNaN(normalized)) {
    return fallback;
  }

  return Math.max(0, Math.min(1, normalized));
}

export function normalizeAudioSettings(rawSettings = {}) {
  const rawAudio = rawSettings.audio && typeof rawSettings.audio === "object" ? rawSettings.audio : {};
  const legacyMuted = Boolean(rawSettings.audioMuted);
  const muted = typeof rawAudio.muted === "boolean" ? rawAudio.muted : legacyMuted;

  return {
    muted,
    musicEnabled:
      typeof rawAudio.musicEnabled === "boolean"
        ? rawAudio.musicEnabled
        : AUDIO_DEFAULT_SETTINGS.musicEnabled,
    sfxEnabled:
      typeof rawAudio.sfxEnabled === "boolean"
        ? rawAudio.sfxEnabled
        : AUDIO_DEFAULT_SETTINGS.sfxEnabled,
    musicVolume: clampVolume(rawAudio.musicVolume, AUDIO_DEFAULT_SETTINGS.musicVolume),
    sfxVolume: clampVolume(rawAudio.sfxVolume, AUDIO_DEFAULT_SETTINGS.sfxVolume),
  };
}

export function normalizeSettings(rawSettings = {}) {
  const audio = normalizeAudioSettings(rawSettings);

  return {
    audioMuted: audio.muted,
    audio,
  };
}

export function createDefaultSettings() {
  return normalizeSettings();
}

export function updateAudioSettings(currentSettings = {}, partialAudio = {}) {
  return normalizeSettings({
    ...currentSettings,
    audioMuted:
      typeof partialAudio.muted === "boolean"
        ? partialAudio.muted
        : currentSettings.audioMuted,
    audio: {
      ...(currentSettings.audio ?? {}),
      ...partialAudio,
    },
  });
}
