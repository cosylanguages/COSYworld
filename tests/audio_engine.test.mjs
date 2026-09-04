import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioEngine } from '../js/audio/audio_engine.js';
import { EventBus } from '../js/engine/event_bus.js';

test('AudioEngine - multi-channel volume control and effective gain calculation', () => {
    const eventBus = new EventBus();
    const audio = new AudioEngine({ eventBus });

    let volumeEvt = null;
    eventBus.on('volumeChanged', (data) => {
        volumeEvt = data;
    });

    assert.equal(audio.getVolume('music'), 0.8);
    assert.equal(audio.getEffectiveVolume('music'), 0.8);

    audio.setVolume('music', 0.5);
    assert.equal(audio.getVolume('music'), 0.5);
    assert.deepEqual(volumeEvt, { channel: 'music', value: 0.5 });

    audio.setVolume('master', 0.5);
    // Effective volume = master (0.5) * music (0.5) = 0.25
    assert.equal(audio.getEffectiveVolume('music'), 0.25);
});

test('AudioEngine - crossfading music and ambience emits events', () => {
    const eventBus = new EventBus();
    const audio = new AudioEngine({ eventBus });

    let musicEvt = null;
    let ambienceEvt = null;

    eventBus.on('musicChanged', (d) => { musicEvt = d; });
    eventBus.on('ambienceChanged', (d) => { ambienceEvt = d; });

    audio.crossfadeMusic('piano', 1.5);
    assert.equal(audio.currentMusic.trackId, 'piano');
    assert.deepEqual(musicEvt, { trackId: 'piano', duration: 1.5 });

    audio.crossfadeAmbience('rain', 2.0);
    assert.equal(audio.currentAmbience.type, 'rain');
    assert.deepEqual(ambienceEvt, { type: 'rain', duration: 2.0 });
});

test('AudioEngine - procedural footstep triggers footstepPlayed event', () => {
    const eventBus = new EventBus();
    const audio = new AudioEngine({ eventBus });

    let footstepEvt = null;
    eventBus.on('footstepPlayed', (d) => { footstepEvt = d; });

    audio.playFootstep('wood', 1.0);
    assert.deepEqual(footstepEvt, { surface: 'wood', velocity: 1.0 });
});

test('AudioEngine - weather audio updates type, intensity, and emits event', () => {
    const eventBus = new EventBus();
    const audio = new AudioEngine({ eventBus });

    let weatherEvt = null;
    eventBus.on('weatherAudioUpdated', (d) => { weatherEvt = d; });

    audio.updateWeatherAudio('rain', 0.8);
    assert.equal(audio.weatherAudio.type, 'rain');
    assert.equal(audio.weatherAudio.intensity, 0.8);
    assert.deepEqual(weatherEvt, { weatherType: 'rain', intensity: 0.8 });
});

test('AudioEngine - calculates 2D location-based spatial gain and pan', () => {
    const audio = new AudioEngine();
    audio.setListenerPosition(400, 250);

    // Source directly on top of listener
    const center = audio.calculateSpatialGainAndPan(400, 250, 500);
    assert.equal(center.gain, 1.0);
    assert.equal(center.pan, 0.0);

    // Source to the right
    const right = audio.calculateSpatialGainAndPan(650, 250, 500);
    assert.equal(right.gain, 0.5);
    assert.equal(right.pan, 1.0);

    // Source out of range
    const outOfRange = audio.calculateSpatialGainAndPan(1000, 1000, 500);
    assert.equal(outOfRange.gain, 0);
});

test('AudioEngine - voice recognition manager initial state and fallback', () => {
    const eventBus = new EventBus();
    const audio = new AudioEngine({ eventBus });

    assert.equal(audio.voiceRecognition.isListening, false);
    assert.equal(typeof audio.startVoiceRecognition, 'function');
});
