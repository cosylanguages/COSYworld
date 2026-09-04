/**
 * @file js/audio/audio_manager.js
 * @description Audio Manager wrapper extending AudioEngine for COSY World backward compatibility.
 */

import { AudioEngine } from './audio_engine.js';

export class AudioManager extends AudioEngine {
    /**
     * @param {Object} [options]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        super(options);
    }

    /**
     * Legacy speakText method mapping to NPC voice / TTS.
     * @param {string} text
     * @param {string} [lang='en']
     * @param {number} [rate=0.9]
     */
    speakText(text, lang = 'en', rate = 0.9) {
        this.speakNPCVoice(text, { rate, pitch: 1.0 }, lang);
    }

    /**
     * Set active district audio parameters.
     * @param {string} music
     * @param {string[]} [ambientSounds=[]]
     */
    setDistrictAudio(music, ambientSounds = []) {
        if (music && music !== 'none') {
            this.crossfadeMusic(music, 1.5);
        }
        const ambType = ambientSounds.length > 0 ? ambientSounds[0] : 'none';
        this.crossfadeAmbience(ambType, 1.5);
    }

    /**
     * Legacy playAmbience compatibility method.
     * @param {string} type
     */
    playAmbience(type) {
        this.crossfadeAmbience(type, 1.0);
    }
}
