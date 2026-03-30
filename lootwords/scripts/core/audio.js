import { AUDIO_ASSET_PATHS } from "../data/config.js";

const CUE_SEQUENCES = {
  click: [
    { frequency: 620, duration: 0.06, type: "triangle", gain: 0.025 },
  ],
  boxTap: [
    { frequency: 220, duration: 0.07, type: "square", gain: 0.03 },
    { frequency: 170, duration: 0.05, type: "square", gain: 0.02 },
  ],
  boxOpen: [
    { frequency: 300, duration: 0.05, type: "sawtooth", gain: 0.025 },
    { frequency: 420, duration: 0.08, type: "sawtooth", gain: 0.03 },
    { frequency: 620, duration: 0.1, type: "triangle", gain: 0.03 },
    { frequency: 860, duration: 0.18, type: "triangle", gain: 0.032 },
  ],
  rewardReveal: [
    { frequency: 420, duration: 0.08, type: "triangle", gain: 0.02 },
    { frequency: 620, duration: 0.1, type: "triangle", gain: 0.024 },
    { frequency: 920, duration: 0.16, type: "triangle", gain: 0.03 },
    { frequency: 1200, duration: 0.22, type: "triangle", gain: 0.032 },
  ],
  victory: [
    { frequency: 420, duration: 0.1, type: "triangle", gain: 0.024 },
    { frequency: 560, duration: 0.12, type: "triangle", gain: 0.024 },
    { frequency: 760, duration: 0.16, type: "triangle", gain: 0.026 },
    { frequency: 980, duration: 0.2, type: "triangle", gain: 0.028 },
  ],
};

export function createAudioManager({ muted = false, assetMap = AUDIO_ASSET_PATHS } = {}) {
  let isMuted = muted;
  let audioContext = null;
  let currentMusic = null;
  const registeredAssets = { ...assetMap };
  const cachedPlayers = new Map();

  function ensureContext() {
    if (!audioContext) {
      audioContext = new window.AudioContext();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return audioContext;
  }

  function getAudioPlayer(assetId) {
    const source = registeredAssets[assetId];
    if (!source) {
      return null;
    }

    if (!cachedPlayers.has(assetId)) {
      const player = new window.Audio(source);
      player.preload = "auto";
      player.addEventListener("error", () => {
        cachedPlayers.delete(assetId);
      });
      cachedPlayers.set(assetId, player);
    }

    return cachedPlayers.get(assetId);
  }

  function playSynthCue(cueId) {
    const cue = CUE_SEQUENCES[cueId];
    if (!cue?.length || !window.AudioContext) {
      return;
    }

    const context = ensureContext();
    let offset = 0;

    cue.forEach((step) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = step.type;
      oscillator.frequency.value = step.frequency;

      const startTime = context.currentTime + offset;
      const endTime = startTime + step.duration;

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(step.gain, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(endTime);

      offset += step.duration * 0.76;
    });
  }

  function playCue(cueId) {
    if (isMuted) {
      return;
    }

    const player = getAudioPlayer(cueId);
    if (player) {
      try {
        player.currentTime = 0;
        player.play().catch(() => playSynthCue(cueId));
        return;
      } catch {
        playSynthCue(cueId);
        return;
      }
    }

    playSynthCue(cueId);
  }

  function playMusic(trackId) {
    if (isMuted) {
      return;
    }

    const player = getAudioPlayer(trackId);
    if (!player) {
      return;
    }

    if (currentMusic && currentMusic !== player) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
    }

    currentMusic = player;
    currentMusic.loop = true;
    currentMusic.volume = 0.35;
    currentMusic.play().catch(() => {});
  }

  function stopMusic() {
    if (!currentMusic) {
      return;
    }

    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
  }

  return {
    play: playCue,
    playMusic,
    stopMusic,
    registerAsset(assetId, source) {
      registeredAssets[assetId] = source;
      cachedPlayers.delete(assetId);
    },
    setMuted(value) {
      isMuted = Boolean(value);
      if (isMuted) {
        stopMusic();
      }
    },
    isMuted() {
      return isMuted;
    },
  };
}
