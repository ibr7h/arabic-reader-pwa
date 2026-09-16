export const SoundEngine = {
  isMuted: false,
  audioContext: null,
  initialized: false,
  _speechGeneration: 0,

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioContext = new AudioCtx();
      this.initialized = true;
    } catch (e) {
      console.warn('تعذر تهيئة Web Audio:', e);
    }
  },

  _tone(freq, startOffset = 0, duration = 0.09, gainValue = 0.05) {
    if (this.isMuted) return;
    this.init();
    const ctx = this.audioContext;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const start = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  },

  playSnap() {
    if (this.isMuted) return;
    this._tone(523.25, 0, 0.07, 0.035);
    this._tone(783.99, 0.01, 0.07, 0.025);
  },

  playVictory() {
    if (this.isMuted) return;
    [392.0, 523.25, 659.25, 783.99].forEach((f, i) => this._tone(f, i * 0.08, i === 3 ? 0.16 : 0.09, 0.045));
  },

  normalizeSpeechText(text) { return String(text ?? '').replace(/ـ/g, '').replace(/\s+/g, ' ').trim(); },

  _createArabicUtterance(text) {
    const utterance = new SpeechSynthesisUtterance(this.normalizeSpeechText(text));
    utterance.lang = 'ar-SA';
    utterance.rate = 0.82;
    utterance.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang?.toLowerCase().startsWith('ar') || /arabic/i.test(v.name || ''));
    if (arVoice) utterance.voice = arVoice;
    return utterance;
  },

  _speakOnce(text) {
    return new Promise(resolve => {
      if (this.isMuted || !('speechSynthesis' in window)) return resolve(false);
      const clean = this.normalizeSpeechText(text);
      if (!clean) return resolve(false);
      const utterance = this._createArabicUtterance(clean);
      let settled = false;
      const finish = ok => { if (!settled) { settled = true; resolve(ok); } };
      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);
      window.speechSynthesis.speak(utterance);
      setTimeout(() => finish(true), Math.max(2200, clean.length * 420));
    });
  },

  speakArabic(text) {
    if (this.isMuted || !('speechSynthesis' in window)) return Promise.resolve(false);
    this._speechGeneration += 1;
    window.speechSynthesis.cancel();
    return this._speakOnce(text);
  },

  async speakSequence(items, onStep) {
    if (this.isMuted || !('speechSynthesis' in window)) return;
    const sequence = Array.from(items || []).filter(Boolean);
    if (!sequence.length) return;
    const generation = ++this._speechGeneration;
    window.speechSynthesis.cancel();
    for (let i = 0; i < sequence.length; i++) {
      if (generation !== this._speechGeneration) return;
      if (typeof onStep === 'function') onStep(i, sequence[i]);
      await this._speakOnce(sequence[i]);
      if (generation !== this._speechGeneration) return;
      await new Promise(resolve => setTimeout(resolve, 120));
    }
  },

  stopSpeech() {
    this._speechGeneration += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
};
