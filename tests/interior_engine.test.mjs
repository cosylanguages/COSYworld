import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { InteriorEngine } from '../js/world/interior_engine.js';

const mockRoomsData = JSON.parse(
    fs.readFileSync(new URL('../data/interiors/rooms.json', import.meta.url))
);

test('InteriorEngine - registers and normalizes modular rooms dataset', () => {
    const engine = new InteriorEngine();
    engine.registerRooms(mockRoomsData);

    assert.equal(engine.rooms.size, 10);
    assert.equal(engine.hasRoom('living_room'), true);
    assert.equal(engine.hasRoom('hospital'), true);
    assert.equal(engine.hasRoom('library'), true);

    const classroom = engine.getRoom('classroom');
    assert.equal(classroom.type, 'classroom');
    assert.ok(classroom.background.wallColor);
    assert.ok(Array.isArray(classroom.hotspots));
    assert.ok(Array.isArray(classroom.interactiveObjects));
    assert.ok(Array.isArray(classroom.ambientSounds));
    assert.ok(classroom.lightingProfile);
});

test('InteriorEngine - normalizes missing room fields with default fallbacks', () => {
    const engine = new InteriorEngine();
    const room = engine.registerRoom('minimal_room', {
        id: 'minimal_room'
    });

    assert.equal(room.id, 'minimal_room');
    assert.ok(room.background.wallColor);
    assert.deepEqual(room.hotspots, []);
    assert.deepEqual(room.npcs, []);
    assert.deepEqual(room.interactiveObjects, []);
    assert.deepEqual(room.ambientSounds, ['piano']);
    assert.ok(room.lightingProfile.color);
});
