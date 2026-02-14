let audioContext = null;
let isEnabled = false;

const initAudio = () => {
    if (audioContext) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioContext = new AudioContext();
        }
    } catch (e) {
        console.error('AudioContext support is missing', e);
    }
};

const resumeIfNeeded = () => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
};

export const playClick = () => {
    if (!isEnabled) return;
    initAudio();
    if (!audioContext) return;
    resumeIfNeeded();

    const t = audioContext.currentTime;

    // "Creamy" Switch Sound (Low Thock, minimal click)

    // 1. Botton-out (Low Sine)
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08); // Deep drop

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(t);
    osc.stop(t + 0.08);

    // 2. Soft Tactile Bump (Low-passed Saw)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    const filter2 = audioContext.createBiquadFilter();

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(120, t);

    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(400, t); // Cut off all high "clicky" freqs

    gain2.gain.setValueAtTime(0.1, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(audioContext.destination);

    osc2.start(t);
    osc2.stop(t + 0.05);
};

export const playError = () => {
    if (!isEnabled) return;
    initAudio();
    if (!audioContext) return;
    resumeIfNeeded();

    const t = audioContext.currentTime;

    // Muted Thud for error
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.1);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(t);
    osc.stop(t + 0.1);
};

export const toggleSound = () => {
    isEnabled = !isEnabled;
    // Visually confirm state if needed, but return for UI
    return isEnabled;
};

export const getSoundEnabled = () => isEnabled;
