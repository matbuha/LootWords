const CUE_SEQUENCES = {
  click: [
    { frequency: 620, duration: 0.06, type: "triangle", gain: 0.025 },
  ],
  boxTap: [
    { frequency: 220, duration: 0.07, type: "square", gain: 0.03 },
    { frequency: 170, duration: 0.05, type: "square", gain: 0.02 },
  ],
  boxOpen: [
    { frequency: 420, duration: 0.08, type: "sawtooth", gain: 0.03 },
    { frequency: 620, duration: 0.1, type: "triangle", gain: 0.028 },
    { frequency: 820, duration: 0.16, type: "triangle", gain: 0.028 },
  ],
  rewardReveal: [
    { frequency: 520, duration: 0.1, type: "triangle", gain: 0.025 },
    { frequency: 680, duration: 0.12, type: "triangle", gain: 0.025 },
    { frequency: 920, duration: 0.18, type: "triangle", gain: 0.03 },
  ],
  victory: [
    { frequency: 420, duration: 0.1, type: "triangle", gain: 0.024 },
    { frequency: 560, duration: 0.12, type: "triangle", gain: 0.024 },
    { frequency: 760, duration: 0.16, type: "triangle", gain: 0.024 },
    { frequency: 980, duration: 0.2, type: "triangle", gain: 0.026 },
  ],
};

export function createAudioManager({ muted = false } = {}) {
  let isMuted = muted;
  let audioContext = null;

  function ensureContext() {
    if (!audioContext) {
      audioContext = new window.AudioContext();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return audioContext;
  }

  function playCue(cueId) {
    if (isMuted || !window.AudioContext) {
      return;
    }

    const cue = CUE_SEQUENCES[cueId];
    if (!cue?.length) {
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

      offset += step.duration * 0.78;
    });
  }

  return {
    play: playCue,
    setMuted(value) {
      isMuted = Boolean(value);
    },
    isMuted() {
      return isMuted;
    },
  };
}
