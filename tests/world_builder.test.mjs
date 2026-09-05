import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WorldBuilder } from '../js/world/world_builder.js';

const mockDistrictsData = JSON.parse(
    fs.readFileSync(new URL('../data/scenes/districts.json', import.meta.url))
);

test('WorldBuilder - registers and normalizes raw district JSON data', () => {
    const builder = new WorldBuilder();
    builder.registerDistricts(mockDistrictsData);

    assert.ok(builder.getDistrictCount() >= 6);
    assert.equal(builder.hasDistrict('apartment_living'), true);

    const living = builder.getDistrict('apartment_living');
    assert.ok(Array.isArray(living.roads));
    assert.ok(Array.isArray(living.buildings));
    assert.ok(Array.isArray(living.npcs));
    assert.ok(Array.isArray(living.ambientSounds));
    assert.ok(Array.isArray(living.connections));
    assert.equal(living.music, 'piano');
    assert.equal(living.weather, 'clear');

    const townEntrance = builder.getDistrict('town_entrance');
    assert.equal(townEntrance.backgroundImage, 'assets/images/scenes/town_entrance.jpg');
});

test('WorldBuilder - normalizes missing fields gracefully', () => {
    const builder = new WorldBuilder();
    const normalized = builder.registerDistrict('minimal_district', {
        id: 'minimal_district',
        district: 'Test Area'
    });

    assert.equal(normalized.id, 'minimal_district');
    assert.deepEqual(normalized.roads, []);
    assert.deepEqual(normalized.buildings, []);
    assert.deepEqual(normalized.npcs, []);
    assert.equal(normalized.music, 'none');
    assert.equal(normalized.weather, 'clear');
    assert.deepEqual(normalized.ambientSounds, ['none']);
    assert.deepEqual(normalized.connections, []);
});

test('WorldBuilder - loads DLC manifest and expands district data seamlessly', async () => {
    const builder = new WorldBuilder();

    const mockManifest = {
        id: 'dlc_market',
        districts: [
            {
                id: 'market_square',
                district: 'Market District',
                roads: [{ x: 0, y: 320, width: 800, height: 180, type: 'cobblestone' }],
                buildings: [{ id: 'stall', x: 100, y: 100, width: 200, height: 150, color: '#f00', label: 'Stall' }],
                npcs: ['vendor'],
                music: 'cafe',
                weather: 'clear',
                ambientSounds: ['cafe', 'chatter'],
                connections: [{ targetId: 'town_square', x: 360, y: 20, width: 80, height: 80 }]
            }
        ]
    };

    const res = await builder.loadDLC('data/dlc/market', mockManifest);
    assert.equal(res.loaded, true);
    assert.equal(builder.hasDistrict('market_square'), true);

    const market = builder.getDistrict('market_square');
    assert.equal(market.district, 'Market District');
    assert.equal(market.roads.length, 1);
    assert.equal(market.buildings.length, 1);
    assert.equal(market.npcs[0], 'vendor');
    assert.equal(market.music, 'cafe');
    assert.equal(market.weather, 'clear');
    assert.deepEqual(market.ambientSounds, ['cafe', 'chatter']);
    assert.equal(market.connections.length, 1);
});
