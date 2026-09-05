import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BuildingManager } from '../js/world/building_system.js';

const mockBuildingsData = JSON.parse(
    fs.readFileSync(new URL('../data/buildings/buildings.json', import.meta.url))
);

test('BuildingManager - registers and normalizes raw building JSON data', () => {
    const manager = new BuildingManager();
    manager.registerBuildings(mockBuildingsData);

    assert.equal(manager.buildings.size, 4);
    assert.ok(manager.getBuilding('bakery_facade'));
    assert.ok(manager.getBuilding('school'));
    assert.ok(manager.getBuilding('hospital'));

    const bakery = manager.getBuilding('bakery_facade');
    assert.equal(bakery.id, 'bakery_facade');
    assert.ok(Array.isArray(bakery.entrances));
    assert.ok(Array.isArray(bakery.rooms));
    assert.ok(Array.isArray(bakery.npcs));
    assert.ok(Array.isArray(bakery.interactiveObjects));
    assert.ok(Array.isArray(bakery.quests));
    assert.equal(bakery.ambientAudio, 'piano');
});

test('BuildingManager - enters building and loads interior room independently', () => {
    const manager = new BuildingManager();
    manager.registerBuildings(mockBuildingsData);

    assert.equal(manager.getActiveBuildingState(), null);

    const activeState = manager.enterBuilding('bakery_facade');
    assert.ok(activeState);
    assert.equal(activeState.isInterior, true);
    assert.equal(activeState.buildingId, 'bakery_facade');
    assert.equal(activeState.currentRoomId, 'bakery_interior');
    assert.ok(activeState.room);
    assert.equal(activeState.room.ambientAudio, 'piano');
});

test('BuildingManager - switches school rooms without leaving the building', () => {
    const manager = new BuildingManager();
    manager.registerBuildings(mockBuildingsData);

    manager.enterBuilding('school');
    assert.equal(manager.getActiveBuildingState().currentRoomId, 'school_library');
    manager.switchRoom('computer_lab');
    assert.equal(manager.getActiveBuildingState().currentRoomId, 'computer_lab');
    manager.switchRoom('teacher_office');
    assert.equal(manager.getActiveBuildingState().currentRoomId, 'teacher_office');
    assert.equal(manager.getActiveBuildingState().isInterior, true);
});

test('BuildingManager - memory optimization purges distant rooms', () => {
    const manager = new BuildingManager();

    // Register 10 synthetic buildings with rooms
    for (let i = 0; i < 10; i++) {
        manager.registerBuilding(`building_${i}`, {
            id: `building_${i}`,
            rooms: [{ id: `room_${i}`, name: { en: `Room ${i}` } }]
        });
    }

    // Load rooms for 7 different buildings
    for (let i = 0; i < 7; i++) {
        manager.loadRoom(`building_${i}`, `room_${i}`);
    }

    // Max capacity in cache is set to 5 rooms
    assert.ok(manager.loadedRooms.size <= 5);
});

test('BuildingManager - exitBuilding resets active state seamlessly', () => {
    const manager = new BuildingManager();
    manager.registerBuildings(mockBuildingsData);

    manager.enterBuilding('cafe_facade');
    assert.ok(manager.getActiveBuildingState());

    const exited = manager.exitBuilding();
    assert.ok(exited);
    assert.equal(manager.getActiveBuildingState(), null);
});
