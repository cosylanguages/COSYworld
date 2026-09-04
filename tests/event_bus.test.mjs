import test from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../js/engine/event_bus.js';

test('EventBus - subscribe and emit event', () => {
    const bus = new EventBus();
    let received = null;

    bus.on('testEvent', (data) => {
        received = data;
    });

    bus.emit('testEvent', { foo: 'bar' });
    assert.deepEqual(received, { foo: 'bar' });
});

test('EventBus - once listener is called only once', () => {
    const bus = new EventBus();
    let count = 0;

    bus.once('singleEvent', () => {
        count++;
    });

    bus.emit('singleEvent');
    bus.emit('singleEvent');

    assert.equal(count, 1);
});

test('EventBus - unsubscribe removes callback', () => {
    const bus = new EventBus();
    let count = 0;
    const cb = () => count++;

    const unsubscribe = bus.on('myEvent', cb);
    bus.emit('myEvent');
    assert.equal(count, 1);

    unsubscribe();
    bus.emit('myEvent');
    assert.equal(count, 1);
});

test('EventBus - clear removes listeners', () => {
    const bus = new EventBus();
    bus.on('ev1', () => {});
    bus.on('ev2', () => {});

    assert.equal(bus.has('ev1'), true);
    assert.equal(bus.has('ev2'), true);

    bus.clear('ev1');
    assert.equal(bus.has('ev1'), false);
    assert.equal(bus.has('ev2'), true);

    bus.clear();
    assert.equal(bus.has('ev2'), false);
});
