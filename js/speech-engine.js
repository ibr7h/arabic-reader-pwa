const SETTINGS_KEY = 'arabic-reader:speech-settings';

export class ArabicSpeechEngine {
  constructor() {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    this.rate = Number(stored.rate || 0.78);
    this.voiceURI = stored.voiceURI || '';
    this.voices = [];
    this.listeners = new Set();
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

  speak(text, { queue = false, rate = this.rate } = {}) {
    if (!('speechSynthesis' in window) || !text) return Promise.resolve(false);
    if (!queue) speechSynthesis.cancel();

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
    speechSynthesis.cancel();
    for (const part of parts) {
      await this.speak(part, { queue: true, rate: Math.max(0.62, this.rate - 0.08) });
      await new Promise(resolve => setTimeout(resolve, pauseMs));
    }
  }
}
