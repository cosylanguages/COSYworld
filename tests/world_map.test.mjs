import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WorldMap } from '../js/world/world_map.js';

test('WorldMap - zoom and pan calculations', () => {
    const map = new WorldMap();
    assert.equal(map.zoom, 1.0);

    map.zoomIn();
    assert.equal(map.zoom, 1.25);

    map.zoomOut();
    assert.equal(map.zoom, 1.0);

    map.setPan(100, -50);
    assert.deepEqual(map.pan, { x: 100, y: -50 });

    map.panBy(-20, 30);
    assert.deepEqual(map.pan, { x: 80, y: -20 });

    map.resetView();
    assert.equal(map.zoom, 1.0);
    assert.deepEqual(map.pan, { x: 0, y: 0 });
});

test('WorldMap - visited location evaluation', () => {
    const map = new WorldMap();
    const state = {
        currentLocationId: 'apartment_living',
        visitedLocations: new Set(['apartment_living', 'town_square'])
    };

    assert.equal(map.isVisited('apartment_living', state), true);
    assert.equal(map.isVisited('town_square', state), true);
    assert.equal(map.isVisited('bakery', state), false);
});

test('WorldMap - retrieves topology, NPCs, and quest markers per location', () => {
    const districtsData = JSON.parse(fs.readFileSync(path.resolve('data/scenes/districts.json'), 'utf8'));
    const npcsData = JSON.parse(fs.readFileSync(path.resolve('data/npcs/npcs.json'), 'utf8'));
    const questsData = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));

    const gameData = {
        districts: districtsData,
        npcs: npcsData,
        quests: questsData
    };

    const map = new WorldMap();
    const topology = map.getMapTopology(gameData);

    assert.ok('Residential District' in topology.districts);
    assert.ok('City Centre' in topology.districts);
    assert.ok('town_square' in topology.locations);

    const npcsInSquare = map.getNPCsAtLocation('town_square', gameData);
    assert.ok(npcsInSquare.length >= 2, 'Town Square should contain NPCs');

    const state = {
        currentLocationId: 'apartment_living',
        visitedLocations: new Set(['apartment_living', 'town_square']),
        activeQuests: new Set(['q_directions_bakery'])
    };

    const html = map.renderMapHtml(state, gameData);
    assert.ok(html.includes('COSY Town World Map'), 'HTML should contain title');
    assert.ok(html.includes('Zoom In'), 'HTML should contain controls');
    assert.ok(html.includes('Residential District'), 'HTML should render districts');
    assert.ok(html.includes('Fast Travel'), 'HTML should contain Fast Travel buttons');
});
