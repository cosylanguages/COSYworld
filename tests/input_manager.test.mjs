import test from 'node:test';
import assert from 'node:assert/strict';
import { InputManager } from '../js/input/input_manager.js';
import { EventBus } from '../js/engine/event_bus.js';

test('InputManager - tracks key down and key up states', () => {
    const eventBus = new EventBus();
    const inputManager = new InputManager({ eventBus });

    let lastKeyDown = null;
    eventBus.on('keyDown', (data) => {
        lastKeyDown = data.key;
    });

    inputManager._onKeyDown({ key: 'a' });
    assert.equal(inputManager.isKeyDown('a'), true);
    assert.equal(lastKeyDown, 'a');

    inputManager._onKeyUp({ key: 'a' });
    assert.equal(inputManager.isKeyDown('a'), false);
});

test('InputManager - detects swipe gestures', () => {
    const eventBus = new EventBus();
    const inputManager = new InputManager({ eventBus });

    let swipeData = null;
    eventBus.on('swipe', (data) => {
        swipeData = data;
    });

    inputManager._onTouchStart({ touches: [{ clientX: 100, clientY: 100 }] });
    inputManager._onTouchEnd({ changedTouches: [{ clientX: 200, clientY: 100 }] });

    assert.ok(swipeData);
    assert.equal(swipeData.dx, 100);
    assert.equal(swipeData.dy, 0);
});
