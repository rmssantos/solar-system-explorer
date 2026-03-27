import { i18n } from './i18n.js';
import * as storage from './utils/storage.js';

export class TTSManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.speaking = false;
        this.utterance = null;
        this.selectedVoiceName = storage.getItem('ttsVoice', null);
        this.rate = storage.getItem('ttsRate', 0.9);
        this.pitch = storage.getItem('ttsPitch', 1.1);

        // Voices load asynchronously in some browsers
        this._voices = [];
        if (this.isSupported()) {
            this._loadVoices();
            this.synth.addEventListener('voiceschanged', () => this._loadVoices());
        }
    }

    isSupported() {
        return 'speechSynthesis' in window;
    }

    _loadVoices() {
        this._voices = this.synth.getVoices();
    }

    /**
     * Get available voices filtered by current language
     */
    getVoicesForCurrentLang() {
        const langPrefix = i18n.lang === 'en' ? 'en' : 'pt';
        return this._voices.filter(v => v.lang.startsWith(langPrefix));
    }

    /**
     * Get ALL available voices (for settings UI)
     */
    getAllVoices() {
        return this._voices;
    }

    /**
     * Get the currently selected voice (or best default)
     */
    _getVoice() {
        const langPrefix = i18n.lang === 'en' ? 'en' : 'pt';
        const targetLang = i18n.lang === 'en' ? 'en-GB' : 'pt-PT';

        // Try saved preference first
        if (this.selectedVoiceName) {
            const saved = this._voices.find(v => v.name === this.selectedVoiceName && v.lang.startsWith(langPrefix));
            if (saved) return saved;
        }

        // Try to find a good default: prefer female voices (more friendly for kids)
        const langVoices = this._voices.filter(v => v.lang.startsWith(langPrefix));
        const exactMatch = langVoices.find(v => v.lang === targetLang);
        const femaleVoice = langVoices.find(v =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('microsoft') && !v.name.toLowerCase().includes('male')
        );

        return femaleVoice || exactMatch || langVoices[0] || null;
    }

    /**
     * Set preferred voice by name
     */
    setVoice(voiceName) {
        this.selectedVoiceName = voiceName;
        storage.setItem('ttsVoice', voiceName);
    }

    /**
     * Set speech rate (0.5 to 2.0)
     */
    setRate(rate) {
        this.rate = Math.max(0.5, Math.min(2.0, rate));
        storage.setItem('ttsRate', this.rate);
    }

    /**
     * Set speech pitch (0.5 to 2.0)
     */
    setPitch(pitch) {
        this.pitch = Math.max(0.5, Math.min(2.0, pitch));
        storage.setItem('ttsPitch', this.pitch);
    }

    speak(text) {
        if (!this.isSupported()) return;
        this.stop();
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.lang = i18n.lang === 'en' ? 'en-GB' : 'pt-PT';
        this.utterance.rate = this.rate;
        this.utterance.pitch = this.pitch;

        const voice = this._getVoice();
        if (voice) this.utterance.voice = voice;

        this.utterance.onend = () => { this.speaking = false; };
        this.utterance.onerror = () => { this.speaking = false; };
        this.synth.speak(this.utterance);
        this.speaking = true;
    }

    stop() {
        if (this.synth) this.synth.cancel();
        this.speaking = false;
    }

    toggle(text) {
        if (this.speaking) { this.stop(); return false; }
        this.speak(text); return true;
    }
}
