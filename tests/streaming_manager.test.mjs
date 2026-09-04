import test from 'node:test';
import assert from 'node:assert/strict';
import { StreamingWorldManager } from '../js/scenes/streaming_manager.js';
import fs from 'node:fs';

const mockDistrictsData = JSON.parse(
    fs.readFileSync(new URL('../data/scenes/districts.json', import.meta.url))
);

const mockGameData = {
    districts: mockDistrictsData
};

test('StreamingWorldManager - lazy loads active district', async () => {
    const manager = new StreamingWorldManager();
    assert.equal(manager.loadedDistricts.has('apartment_living'), false);

    await manager.loadDistrict('apartment_living', mockGameData);
    assert.equal(manager.loadedDistricts.has('apartment_living'), true);
    assert.equal(manager.loadedDistricts.get('apartment_living').id, 'apartment_living');
});

test('StreamingWorldManager - automatically preloads adjacent neighbor districts', async () => {
    const manager = new StreamingWorldManager();
    await manager.initStreaming('apartment_living', mockGameData);

    assert.equal(manager.loadedDistricts.has('apartment_living'), true);
    assert.equal(manager.loadedDistricts.has('apartment_kitchen'), true);
    assert.equal(manager.loadedDistricts.has('apartment_bedroom'), true);
    assert.equal(manager.loadedDistricts.has('town_square'), true);
});

test('StreamingWorldManager - unloads distant districts beyond immediate neighbors', async () => {
    const manager = new StreamingWorldManager();
    await manager.initStreaming('apartment_living', mockGameData);

    // Pre-load a distant district (e.g. bakery)
    await manager.loadDistrict('bakery', mockGameData);
    assert.equal(manager.loadedDistricts.has('bakery'), true);

    // Unload distant districts for 'apartment_living'
    manager.unloadDistantDistricts('apartment_living', mockGameData);
    assert.equal(manager.loadedDistricts.has('bakery'), false);
    assert.equal(manager.loadedDistricts.has('apartment_living'), true);
    assert.equal(manager.loadedDistricts.has('town_square'), true);
});

test('StreamingWorldManager - checks boundary crossing without loading screen', () => {
    const manager = new StreamingWorldManager();

    // Player walks to left border in apartment living room -> transitions to kitchen
    const transitionLeft = manager.checkBoundaryCrossing('apartment_living', 20, 250, mockGameData);
    assert.equal(transitionLeft, 'apartment_kitchen');

    // Player stays in center -> no transition
    const noTransition = manager.checkBoundaryCrossing('apartment_living', 400, 250, mockGameData);
    assert.equal(noTransition, null);
});
