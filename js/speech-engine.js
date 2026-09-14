const SETTINGS_KEY = 'arabic-reader:speech-settings';

const RECORDED_AUDIO = {
  'بَاء': './assets/audio/ba/name.mp3',
  'بَ': './assets/audio/ba/fatha.mp3',
  'بُ': './assets/audio/ba/damma.mp3',
  'بِ': './assets/audio/ba/kasra.mp3',
  'بَا': './assets/audio/ba/long-a.mp3',
  'بُو': './assets/audio/ba/long-u.mp3',
  'بِي': './assets/audio/ba/long-i.mp3',
  'كَ': './assets/audio/blend/ka.mp3',
  'تَ': './assets/audio/blend/ta.mp3',
  'كَتَبَ': './assets/audio/words/kataba.mp3',
  'بَابٌ': './assets/audio/words/babun.mp3',
  'بَيْتٌ': './assets/audio/words/baytun.mp3',
  'حَبْلٌ': './assets/audio/words/hablun.mp3',
  'كِتَابٌ': './assets/audio/words/kitabun.mp3'
};

export class ArabicSpeechEngine {
  constructor() {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    this.rate = Number(stored.rate || 0.78);
    this.voiceURI = stored.voiceURI || '';
    this.voices = [];
    this.listeners = new Set();
    this.currentAudio = null;
    this.refreshVoices();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener?.('voiceschanged', () => this.refreshVoices());
    }
  }

  refreshVoices() {
    if (!('speechSynthesis' in window)) return;
    this.voices = speechSynthesis.getVoices().filter(v => /^ar(?:-|$)/i.test(v.lang));
    if (!this.voiceURI && this.voices.length) {
      const preferred = this.voices.find(v => /^ar-SA$/i.test(v.lang)) || this.voices[0];
      this.voiceURI = preferred.voiceURI;
      this.persist();
    }
    this.listeners.forEach(fn => fn(this.voices));
  }

  onVoicesChanged(fn) {
    this.listeners.add(fn);
    fn(this.voices);
    return () => this.listeners.delete(fn);
  }

  get selectedVoice() {
    return this.voices.find(v => v.voiceURI === this.voiceURI) || this.voices[0] || null;
  }

  setVoice(voiceURI) {
    this.voiceURI = voiceURI;
    this.persist();
  }

  setRate(rate) {
    this.rate = Number(rate);
    this.persist();
  }

  persist() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ rate: this.rate, voiceURI: this.voiceURI }));
  }

  stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  async playRecorded(text) {
    const src = RECORDED_AUDIO[text];
    if (!src) return false;

    try {
      const head = await fetch(src, { method: 'HEAD', cache: 'no-store' });
      if (!head.ok) return false;
    } catch {
      return false;
    }

    return new Promise(resolve => {
      const audio = new Audio(src);
      this.currentAudio = audio;
      audio.preload = 'auto';
      audio.onended = () => {
        this.currentAudio = null;
        resolve(true);
      };
      audio.onerror = () => {
        this.currentAudio = null;
        resolve(false);
      };
      audio.play().catch(() => {
        this.currentAudio = null;
        resolve(false);
      });
    });
  }

  async speak(text, { queue = false, rate = this.rate, preferRecorded = true } = {}) {
    if (!text) return false;
    if (!queue) this.stop();

    if (preferRecorded) {
      const played = await this.playRecorded(text);
      if (played) return true;
    }

    if (!('speechSynthesis' in window)) return false;

    return new Promise(resolve => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.selectedVoice?.lang || 'ar-SA';
      utterance.rate = Number(rate);
      utterance.pitch = 1;
      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      speechSynthesis.speak(utterance);
    });
  }

  async speakSequence(parts, pauseMs = 250) {
    this.stop();
    for (const part of parts) {
      await this.speak(part, { queue: true, rate: Math.max(0.62, this.rate - 0.08) });
      await new Promise(resolve => setTimeout(resolve, pauseMs));
    }
  }
}
