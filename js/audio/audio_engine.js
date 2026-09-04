/**
 * @file js/audio/audio_engine.js
 * @description Complete Audio Engine for COSY World.
 * Supports Web Audio API synthesis, multi-channel volume controls, music & ambience crossfading,
 * procedural surface footsteps, weather synthesis, location-based 2D spatial audio,
 * NPC speech & pronunciation, and Web Speech API Voice Recognition.
 */

export class VoiceRecognitionManager {
    constructor(options = {}) {
        this.eventBus = options.eventBus || null;
        this.isListening = false;
        this.recognition = null;
        this.lastTranscript = '';
        this.confidence = 0;

        this._initRecognition();
    }

    _initRecognition() {
        if (typeof window === 'undefined') return;
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) return;

        try {
            this.recognition = new SpeechRec();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                if (this.eventBus) this.eventBus.emit('voiceRecognitionStart');
            };

            this.recognition.onresult = (event) => {
                if (event.results && event.results[0] && event.results[0][0]) {
                    const result = event.results[0][0];
                    this.lastTranscript = result.transcript;
                    this.confidence = result.confidence || 0.9;

                    if (this.eventBus) {
                        this.eventBus.emit('voiceRecognitionResult', {
                            transcript: this.lastTranscript,
                            confidence: this.confidence
                        });
                    }
                }
            };

            this.recognition.onerror = (err) => {
                this.isListening = false;
                if (this.eventBus) this.eventBus.emit('voiceRecognitionError', { error: err.error });
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.eventBus) this.eventBus.emit('voiceRecognitionEnd');
            };
        } catch (e) {
            console.warn('SpeechRecognition initialization failed:', e);
        }
    }

    isSupported() {
        return !!this.recognition || (typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
    }

    startListening(lang = 'en-US') {
        if (!this.recognition) this._initRecognition();
        if (!this.recognition) {
            if (this.eventBus) this.eventBus.emit('voiceRecognitionError', { error: 'not_supported' });
            return false;
        }

        try {
            this.recognition.lang = lang;
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (e) {
            console.warn('Voice recognition failed to start:', e);
            return false;
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) { /* ignore */ }
            this.isListening = false;
        }
    }
}

export class AudioEngine {
    constructor(options = {}) {
        this.eventBus = options.eventBus || null;

        /** @type {AudioContext|null} */
        this.audioCtx = null;

        // Channel volume levels (0.0 to 1.0)
        this.volumes = {
            master: 1.0,
            music: 0.8,
            ambient: 0.7,
            voice: 0.9,
            footsteps: 0.6,
            weather: 0.7,
            sfx: 0.8
        };

        // Active nodes & state
        this.currentMusic = { trackId: 'none', gainNode: null, oscNode: null };
        this.currentAmbience = { type: 'none', gainNode: null, oscNode: null };
        this.weatherAudio = { type: 'clear', intensity: 0, gainNode: null, noiseNode: null };

        // Listener & Spatial sources
        this.listenerPos = { x: 400, y: 250 };
        this.spatialSources = new Map();

        // Voice Recognition instance
        this.voiceRecognition = new VoiceRecognitionManager({ eventBus: this.eventBus });

        // Language code map for TTS
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
            br: 'pt-BR'
        };

        this._initAudioContext();
    }

    _initAudioContext() {
        if (typeof window === 'undefined') return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            try {
                this.audioCtx = new AudioCtx();
            } catch (e) {
                console.warn('AudioContext creation failed:', e);
            }
        }
    }

    getEffectiveVolume(channel) {
        const channelVol = this.volumes[channel] !== undefined ? this.volumes[channel] : 1.0;
        return Math.max(0, Math.min(1, this.volumes.master * channelVol));
    }

    setVolume(channel, value) {
        const clamped = Math.max(0, Math.min(1, value));
        if (this.volumes[channel] !== undefined) {
            this.volumes[channel] = clamped;
            this._updateChannelGains();
            if (this.eventBus) {
                this.eventBus.emit('volumeChanged', { channel, value: clamped });
            }
        }
    }

    getVolume(channel) {
        return this.volumes[channel] !== undefined ? this.volumes[channel] : 1.0;
    }

    _updateChannelGains() {
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;

        if (this.currentMusic.gainNode) {
            this.currentMusic.gainNode.gain.setValueAtTime(this.getEffectiveVolume('music') * 0.1, now);
        }
        if (this.currentAmbience.gainNode) {
            this.currentAmbience.gainNode.gain.setValueAtTime(this.getEffectiveVolume('ambient') * 0.08, now);
        }
        if (this.weatherAudio.gainNode) {
            this.weatherAudio.gainNode.gain.setValueAtTime(this.getEffectiveVolume('weather') * 0.06 * this.weatherAudio.intensity, now);
        }
    }

    /* Music & Crossfading */
    crossfadeMusic(newTrackId, duration = 1.0) {
        if (this.currentMusic.trackId === newTrackId) return;

        const oldMusic = this.currentMusic;
        this.currentMusic = { trackId: newTrackId, gainNode: null, oscNode: null };

        if (this.eventBus) {
            this.eventBus.emit('musicChanged', { trackId: newTrackId, duration });
        }

        if (!this.audioCtx || newTrackId === 'none') {
            if (oldMusic.oscNode) {
                try { oldMusic.oscNode.stop(); } catch (e) {}
            }
            return;
        }

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const frequencies = { piano: 261.63, acoustic: 329.63, jazz: 220.0, relaxing: 196.0 };

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(frequencies[newTrackId] || 220, this.audioCtx.currentTime);

            const targetGain = this.getEffectiveVolume('music') * 0.08;
            gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(targetGain, this.audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();

            this.currentMusic.oscNode = osc;
            this.currentMusic.gainNode = gain;

            if (oldMusic.gainNode && oldMusic.oscNode) {
                oldMusic.gainNode.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
                setTimeout(() => {
                    try { oldMusic.oscNode.stop(); } catch (e) {}
                }, duration * 1000);
            }
        } catch (e) {
            console.warn('Crossfade music synthesis failed:', e);
        }
    }

    /* Ambience & Crossfading */
    crossfadeAmbience(newType, duration = 1.0) {
        if (this.currentAmbience.type === newType) return;

        const oldAmbience = this.currentAmbience;
        this.currentAmbience = { type: newType, gainNode: null, oscNode: null };

        if (this.eventBus) {
            this.eventBus.emit('ambienceChanged', { type: newType, duration });
        }

        if (!this.audioCtx || newType === 'none') {
            if (oldAmbience.oscNode) {
                try { oldAmbience.oscNode.stop(); } catch (e) {}
            }
            return;
        }

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const frequencies = { cafe: 293.66, nature: 174.61, rain: 130.81, ocean: 110.0 };

            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequencies[newType] || 174.61, this.audioCtx.currentTime);

            const targetGain = this.getEffectiveVolume('ambient') * 0.06;
            gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(targetGain, this.audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();

            this.currentAmbience.oscNode = osc;
            this.currentAmbience.gainNode = gain;

            if (oldAmbience.gainNode && oldAmbience.oscNode) {
                oldAmbience.gainNode.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
                setTimeout(() => {
                    try { oldAmbience.oscNode.stop(); } catch (e) {}
                }, duration * 1000);
            }
        } catch (e) {
            console.warn('Crossfade ambience synthesis failed:', e);
        }
    }

    /* Procedural Footsteps */
    playFootstep(surface = 'wood', velocity = 1.0) {
        if (this.getEffectiveVolume('footsteps') <= 0) return;

        if (this.eventBus) {
            this.eventBus.emit('footstepPlayed', { surface, velocity });
        }

        if (!this.audioCtx) return;

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const now = this.audioCtx.currentTime;

            const surfaceFreqs = {
                wood: 120,
                grass: 240,
                stone: 80,
                carpet: 180,
                tile: 320,
                water: 150
            };

            const freq = (surfaceFreqs[surface] || 120) * (0.9 + Math.random() * 0.2);
            osc.type = surface === 'grass' ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, now);

            const vol = this.getEffectiveVolume('footsteps') * 0.05 * velocity;
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {
            /* Web Audio not active or blocked */
        }
    }

    /* Weather Synthesis */
    updateWeatherAudio(weatherType = 'clear', intensity = 1.0) {
        this.weatherAudio.type = weatherType;
        this.weatherAudio.intensity = Math.max(0, Math.min(1, intensity));

        if (this.eventBus) {
            this.eventBus.emit('weatherAudioUpdated', { weatherType, intensity });
        }

        if (!this.audioCtx || weatherType === 'clear' || weatherType === 'clouds' || intensity <= 0) {
            if (this.weatherAudio.noiseNode) {
                try { this.weatherAudio.noiseNode.stop(); } catch (e) {}
                this.weatherAudio.noiseNode = null;
            }
            return;
        }

        try {
            if (this.weatherAudio.noiseNode) {
                try { this.weatherAudio.noiseNode.stop(); } catch (e) {}
            }

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const now = this.audioCtx.currentTime;

            const weatherFreqs = {
                rain: 160,
                snow: 220,
                fog: 90,
                thunder: 60
            };

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(weatherFreqs[weatherType] || 150, now);

            const vol = this.getEffectiveVolume('weather') * 0.04 * this.weatherAudio.intensity;
            gain.gain.setValueAtTime(vol, now);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);

            this.weatherAudio.noiseNode = osc;
            this.weatherAudio.gainNode = gain;
        } catch (e) {
            console.warn('Weather audio synthesis error:', e);
        }
    }

    /* Location-Based 2D Spatial Audio */
    setListenerPosition(x, y) {
        this.listenerPos = { x, y };
    }

    addSpatialSource(sourceId, options = {}) {
        const source = {
            id: sourceId,
            x: options.x || 0,
            y: options.y || 0,
            maxDistance: options.maxDistance || 500,
            refDistance: options.refDistance || 50,
            type: options.type || 'sfx'
        };
        this.spatialSources.set(sourceId, source);
        return source;
    }

    updateSpatialSource(sourceId, x, y) {
        const source = this.spatialSources.get(sourceId);
        if (source) {
            source.x = x;
            source.y = y;
        }
    }

    calculateSpatialGainAndPan(sourceX, sourceY, maxDistance = 500) {
        const dx = sourceX - this.listenerPos.x;
        const dy = sourceY - this.listenerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= maxDistance) {
            return { gain: 0, pan: 0 };
        }

        const gain = Math.max(0, 1 - (distance / maxDistance));
        const pan = Math.max(-1, Math.min(1, dx / (maxDistance / 2)));

        return { gain, pan, distance };
    }

    /* NPC Voices & Pronunciation Audio (Web Speech API) */
    speakNPCVoice(text, voiceProfile = {}, lang = 'en') {
        if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (this.getEffectiveVolume('voice') <= 0) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.languageCodes[lang] || 'en-US';
        utterance.rate = voiceProfile.rate || 0.95;
        utterance.pitch = voiceProfile.pitch || 1.0;

        if (this.eventBus) {
            this.eventBus.emit('npcVoiceStart', { text, voiceProfile, lang });
        }

        utterance.onend = () => {
            if (this.eventBus) {
                this.eventBus.emit('npcVoiceEnd', { text });
            }
        };

        window.speechSynthesis.speak(utterance);
    }

    speakPronunciation(word, lang = 'en', slowMode = false) {
        this.speakNPCVoice(word, {
            rate: slowMode ? 0.6 : 0.9,
            pitch: 1.0
        }, lang);
    }

    /* Voice Recognition Integration */
    startVoiceRecognition(lang = 'en-US') {
        return this.voiceRecognition.startListening(lang);
    }

    stopVoiceRecognition() {
        this.voiceRecognition.stopListening();
    }

    stopAll() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (this.currentMusic.oscNode) {
            try { this.currentMusic.oscNode.stop(); } catch (e) {}
        }
        if (this.currentAmbience.oscNode) {
            try { this.currentAmbience.oscNode.stop(); } catch (e) {}
        }
        if (this.weatherAudio.noiseNode) {
            try { this.weatherAudio.noiseNode.stop(); } catch (e) {}
        }
        this.voiceRecognition.stopListening();
    }
}
