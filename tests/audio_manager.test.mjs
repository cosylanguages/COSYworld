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
    assert.deepEqual(emitted, { type: 'piano' });

    audio.playAmbience('none');
    assert.deepEqual(emitted, { type: 'none' });
});
