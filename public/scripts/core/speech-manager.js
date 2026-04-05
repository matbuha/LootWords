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
  let bootstrapAttempts = 0;
  let bootstrapHandle = 0;
  let lastWord = "";
  let lastSpokenAt = 0;
  const listeners = new Set();
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
      return false;
    }

    const previousVoiceIds = englishVoices.map(getVoiceId).join("|");
    const previousSelectedVoiceId = getVoiceId(selectedVoice);
    englishVoices = synth.getVoices().filter(isEnglishVoice);
    selectedVoice =
      englishVoices.find((voice) => getVoiceId(voice) === preferredVoiceId) ??
      englishVoices
        .slice()
        .sort((left, right) => rankVoice(right) - rankVoice(left))[0] ??
      null;
    const nextVoiceIds = englishVoices.map(getVoiceId).join("|");
    const nextSelectedVoiceId = getVoiceId(selectedVoice);

    return previousVoiceIds !== nextVoiceIds || previousSelectedVoiceId !== nextSelectedVoiceId;
  }

  function notifyListeners() {
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.warn("LootWords speech listener failed.", error);
      }
    });
  }

  function scheduleBootstrapRefresh() {
    if (!synth || bootstrapAttempts >= 8) {
      return;
    }

    bootstrapHandle = window.setTimeout(() => {
      bootstrapAttempts += 1;
      const changed = refreshVoices();
      if (changed) {
        notifyListeners();
      }

      if (!englishVoices.length) {
        scheduleBootstrapRefresh();
      }
    }, bootstrapAttempts < 2 ? 120 : 320);
  }

  function handleVoicesChanged() {
    if (refreshVoices()) {
      notifyListeners();
    }
  }

  refreshVoices();
  scheduleBootstrapRefresh();
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
    subscribe(listener) {
      if (typeof listener !== "function") {
        return () => {};
      }

      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
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
      window.clearTimeout(bootstrapHandle);
      listeners.clear();
      synth?.removeEventListener?.("voiceschanged", handleVoicesChanged);
      synth?.cancel?.();
    },
  };
}
