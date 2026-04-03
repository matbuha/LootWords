function normalizeWord(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isEnglishVoice(voice) {
  return Boolean(voice?.lang && voice.lang.toLowerCase().startsWith("en"));
}

function rankVoice(voice) {
  const lang = voice.lang?.toLowerCase() ?? "";
  let score = 0;

  if (lang === "en-us") {
    score += 6;
  } else if (lang === "en-gb") {
    score += 5;
  } else if (lang.startsWith("en")) {
    score += 4;
  }

  if (voice.default) {
    score += 3;
  }

  if (voice.localService) {
    score += 2;
  }

  return score;
}

function getVoiceId(voice) {
  return voice?.voiceURI || voice?.name || null;
}

function buildVoiceOptions(voices) {
  return voices
    .slice()
    .sort((left, right) => rankVoice(right) - rankVoice(left))
    .map((voice) => ({
      id: getVoiceId(voice),
      label: voice.name,
      lang: voice.lang,
      default: Boolean(voice.default),
      localService: Boolean(voice.localService),
    }));
}

export function createSpeechManager(initialSettings = {}) {
  const synth = window.speechSynthesis ?? null;
  let englishVoices = [];
  let selectedVoice = null;
  let preferredVoiceId = typeof initialSettings.voiceURI === "string" ? initialSettings.voiceURI : null;
  let lastWord = "";
  let lastSpokenAt = 0;
  let lastRequest = {
    word: null,
    lang: null,
    voice: null,
    success: false,
    error: null,
  };

  function refreshVoices() {
    if (!synth) {
      englishVoices = [];
      selectedVoice = null;
      return;
    }

    englishVoices = synth.getVoices().filter(isEnglishVoice);
    selectedVoice =
      englishVoices.find((voice) => getVoiceId(voice) === preferredVoiceId) ??
      englishVoices
        .slice()
        .sort((left, right) => rankVoice(right) - rankVoice(left))[0] ??
      null;
  }

  function handleVoicesChanged() {
    refreshVoices();
  }

  refreshVoices();
  synth?.addEventListener?.("voiceschanged", handleVoicesChanged);

  return {
    getVoiceOptions() {
      refreshVoices();
      return buildVoiceOptions(englishVoices);
    },
    setPreferredVoice(voiceId) {
      preferredVoiceId = typeof voiceId === "string" && voiceId.trim() ? voiceId.trim() : null;
      refreshVoices();
      return preferredVoiceId;
    },
    getSelectedVoiceId() {
      return getVoiceId(selectedVoice);
    },
    speakWordInEnglish(rawWord) {
      const word = normalizeWord(rawWord);
      if (!synth || !word) {
        lastRequest = {
          word,
          lang: "en-US",
          voice: null,
          success: false,
          error: !synth ? "speech-unsupported" : "missing-word",
        };
        return false;
      }

      const now = window.performance.now();
      if (word === lastWord && now - lastSpokenAt < 120) {
        return false;
      }

      lastWord = word;
      lastSpokenAt = now;

      refreshVoices();

      try {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = selectedVoice?.lang ?? "en-US";
        utterance.voice = selectedVoice ?? null;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        synth.speak(utterance);
        lastRequest = {
          word,
          lang: utterance.lang,
          voice: utterance.voice?.name ?? selectedVoice?.name ?? null,
          success: true,
          error: null,
        };
        return true;
      } catch (error) {
        lastRequest = {
          word,
          lang: selectedVoice?.lang ?? "en-US",
          voice: selectedVoice?.name ?? null,
          success: false,
          error: String(error),
        };
        return false;
      }
    },
    stop() {
      synth?.cancel?.();
    },
    getDebugState() {
      return {
        supported: Boolean(synth),
        englishVoiceCount: englishVoices.length,
        selectedVoice: selectedVoice?.name ?? null,
        selectedVoiceId: getVoiceId(selectedVoice),
        preferredVoiceId,
        lastRequest,
      };
    },
    destroy() {
      synth?.removeEventListener?.("voiceschanged", handleVoicesChanged);
      synth?.cancel?.();
    },
  };
}
