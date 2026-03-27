import { i18n } from './i18n.js';

export class TTSManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.speaking = false;
        this.utterance = null;
    }

    isSupported() {
        return 'speechSynthesis' in window;
    }

    speak(text) {
        if (!this.isSupported()) return;
        this.stop();
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.lang = i18n.lang === 'en' ? 'en-GB' : 'pt-PT';
        this.utterance.rate = 0.9;
        this.utterance.pitch = 1.1; // Slightly higher for kids
        this.utterance.onend = () => { this.speaking = false; };
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
