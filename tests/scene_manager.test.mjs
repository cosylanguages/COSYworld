import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SceneManager } from '../js/scenes/scene_manager.js';
import { EventBus } from '../js/engine/event_bus.js';

const mockDistrictsData = JSON.parse(
    fs.readFileSync(new URL('../data/scenes/districts.json', import.meta.url))
);

test('SceneManager - initializes scene and switches location', async () => {
    const eventBus = new EventBus();
    const sceneMgr = new SceneManager({ eventBus });
    const gameData = { districts: mockDistrictsData };

    await sceneMgr.init('apartment_living', gameData);
    assert.equal(sceneMgr.currentSceneId, 'apartment_living');

    const state = { currentLocationId: 'apartment_living' };
    const switched = await sceneMgr.switchScene('town_square', state, gameData);

    assert.ok(switched);
    assert.equal(sceneMgr.currentSceneId, 'town_square');
    assert.equal(state.currentLocationId, 'town_square');
    assert.ok(sceneMgr.getHotspots().size > 0);
});
