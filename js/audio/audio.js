/**
 * games/cosy_world/js/audio/audio.js
 * Handles ambient sound synthesis using Web Audio API and Speech Synthesis TTS.
 */

export class AudioManager {
    constructor() {
        this.audioCtx = null;
        this.ambientOsc = null;
    }

    speakText(text, lang) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const langCodes = { en: 'en-US', fr: 'fr-FR', it: 'it-IT', es: 'es-ES', de: 'de-DE', ru: 'ru-RU', el: 'el-GR' };
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCodes[lang] || 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }

    playAmbience(type) {
        if (type === 'none') {
            if (this.ambientOsc) {
                this.ambientOsc.stop();
                this.ambientOsc = null;
            }
            return;
        }

        if (!this.audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        }

        if (!this.audioCtx) return;

        if (this.ambientOsc) {
            this.ambientOsc.stop();
            this.ambientOsc = null;
        }

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(type === 'piano' ? 220 : 330, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            this.ambientOsc = osc;
        } catch (e) {
            console.warn('Web Audio synthesis not supported or blocked:', e);
        }
    }
}
