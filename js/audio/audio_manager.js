/**
 * @file js/audio/audio_manager.js
 * @description Audio Manager for COSY World.
 * Manages Web Audio API ambient synthesis, Web Speech API TTS synthesis, and audio event dispatching.
 */

export class AudioManager {
    /**
     * @param {Object} [options]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.eventBus = options.eventBus || null;
        /** @type {AudioContext|null} */
        this.audioCtx = null;
        /** @type {OscillatorNode|null} */
        this.ambientOsc = null;
        this.currentAmbienceType = 'none';

        this.languageCodes = {
            en: 'en-US',
            fr: 'fr-FR',
            it: 'it-IT',
            es: 'es-ES',
            de: 'de-DE',
            ru: 'ru-RU',
            el: 'el-GR',
            pt: 'pt-PT',
            hy: 'hy-AM',
            ka: 'ka-GE',
            br: 'pt-BR',
            tt: 'tt-RU',
            ba: 'ba-RU',
            cv: 'cv-RU'
        };
    }

    /**
     * Speak text using Web Speech Synthesis API.
     * @param {string} text - Text string to speak.
     * @param {string} [lang='en'] - Target language code.
     * @param {number} [rate=0.9] - Speech playback rate.
     */
    speakText(text, lang = 'en', rate = 0.9) {
        if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.languageCodes[lang] || 'en-US';
        utterance.rate = rate;

        if (this.eventBus) {
            this.eventBus.emit('speechStarted', { text, lang, rate });
        }

        utterance.onend = () => {
            if (this.eventBus) {
                this.eventBus.emit('speechEnded', { text, lang });
            }
        };

        window.speechSynthesis.speak(utterance);
    }

    /**
     * Play or change background ambience synthesis.
     * @param {string} type - 'piano', 'cafe', 'nature', 'rain', or 'none'.
     */
    playAmbience(type) {
        this.currentAmbienceType = type;

        if (this.eventBus) {
            this.eventBus.emit('ambienceChanged', { type });
        }

        if (type === 'none') {
            if (this.ambientOsc) {
                try { this.ambientOsc.stop(); } catch (e) { /* ignore */ }
                this.ambientOsc = null;
            }
            return;
        }

        if (typeof window === 'undefined') return;

        if (!this.audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        }

        if (!this.audioCtx) return;

        if (this.ambientOsc) {
            try { this.ambientOsc.stop(); } catch (e) { /* ignore */ }
            this.ambientOsc = null;
        }

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';

            const frequencies = {
                piano: 220,
                cafe: 330,
                nature: 293.66,
                rain: 174.61
            };

            osc.frequency.setValueAtTime(frequencies[type] || 220, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            this.ambientOsc = osc;
        } catch (e) {
            console.warn('Web Audio synthesis not supported or blocked:', e);
        }
    }

    /**
     * Stop all active audio.
     */
    stopAll() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (this.ambientOsc) {
            try { this.ambientOsc.stop(); } catch (e) { /* ignore */ }
            this.ambientOsc = null;
        }
    }
}
