import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager } from '../js/audio/audio_manager.js';
import { EventBus } from '../js/engine/event_bus.js';

test('AudioManager - emits ambienceChanged event on playAmbience', () => {
    const eventBus = new EventBus();
    const audio = new AudioManager({ eventBus });

    let emitted = null;
    eventBus.on('ambienceChanged', (data) => {
        emitted = data;
    });

    audio.playAmbience('piano');
    assert.deepEqual(emitted, { type: 'piano', duration: 1.0 });

    audio.playAmbience('none');
    assert.deepEqual(emitted, { type: 'none', duration: 1.0 });
});

test('AudioManager - setDistrictAudio triggers crossfades correctly', () => {
    const eventBus = new EventBus();
    const audio = new AudioManager({ eventBus });

    let musicEmitted = null;
    let ambienceEmitted = null;

    eventBus.on('musicChanged', (d) => { musicEmitted = d; });
    eventBus.on('ambienceChanged', (d) => { ambienceEmitted = d; });

    audio.setDistrictAudio('acoustic', ['cafe']);
    assert.deepEqual(musicEmitted, { trackId: 'acoustic', duration: 1.5 });
    assert.deepEqual(ambienceEmitted, { type: 'cafe', duration: 1.5 });
});
