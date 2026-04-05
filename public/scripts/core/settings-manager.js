import { AUDIO_DEFAULT_SETTINGS } from "../data/config.js";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "../data/translations.js";

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

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

function normalizeSpeechSettings(rawSettings = {}) {
  const rawSpeech = rawSettings.speech && typeof rawSettings.speech === "object" ? rawSettings.speech : {};
  const voiceURI = typeof rawSpeech.voiceURI === "string" && rawSpeech.voiceURI.trim()
    ? rawSpeech.voiceURI.trim()
    : null;

  return {
    voiceURI,
  };
}

export function normalizeSettings(rawSettings = {}) {
  const audio = normalizeAudioSettings(rawSettings);
  const speech = normalizeSpeechSettings(rawSettings);

  return {
    language: normalizeLanguage(rawSettings.language),
    audioMuted: audio.muted,
    audio,
    speech,
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

export function updateLanguageSettings(currentSettings = {}, language) {
  return normalizeSettings({
    ...currentSettings,
    language,
  });
}

export function updateSpeechSettings(currentSettings = {}, partialSpeech = {}) {
  return normalizeSettings({
    ...currentSettings,
    speech: {
      ...(currentSettings.speech ?? {}),
      ...partialSpeech,
    },
  });
}
