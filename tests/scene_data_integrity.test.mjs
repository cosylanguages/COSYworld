import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const scenes = JSON.parse(
    fs.readFileSync(new URL('../data/scenes/districts.json', import.meta.url))
);
const assets = JSON.parse(
    fs.readFileSync(new URL('../data/config/assets.json', import.meta.url))
).assetManifest.images;
const kitchenLayers = JSON.parse(
    fs.readFileSync(new URL('../assets/images/kitchen/layers.json', import.meta.url))
);
const kitchenBackgroundPath = new URL('../assets/images/kitchen/background.webp', import.meta.url);

const catalogScenes = Object.values(scenes).filter(scene => Array.isArray(scene.catalog));

test('Scene data - all neighbor links resolve to registered districts', () => {
    for (const scene of Object.values(scenes)) {
        for (const neighborId of scene.neighbors || []) {
            assert.ok(scenes[neighborId], `${scene.id} references missing neighbor ${neighborId}`);
        }
    }
});

test('Scene data - declared background images match the asset manifest', () => {
    for (const scene of Object.values(scenes)) {
        if (!scene.backgroundImage) continue;
        const manifestKey = `${scene.id}_background`;
        assert.equal(
            assets[manifestKey],
            scene.backgroundImage,
            `${scene.id} background is missing or out of sync`
        );
    }
});

test('Scene data - catalog scenes contain beginner vocabulary', () => {
    assert.ok(catalogScenes.length >= 30);
    for (const scene of catalogScenes) {
        assert.ok(scene.catalog.length >= 20, `${scene.id} has fewer than 20 catalog terms`);
    }
});

test('Scene data - kitchen layer manifest matches the active scene', () => {
    const kitchen = scenes.apartment_kitchen;
    assert.deepEqual(
        kitchen.imageLayers.map(layer => layer.id),
        kitchenLayers.layers.map(layer => layer.id)
    );
    assert.equal(kitchen.hotspotsPath, 'assets/images/kitchen/hotspots.json');
});

test('Scene data - kitchen background is a local WebP asset', () => {
    assert.equal(fs.existsSync(kitchenBackgroundPath), true);
    const signature = fs.readFileSync(kitchenBackgroundPath).subarray(0, 12).toString('ascii');
    assert.equal(signature.startsWith('RIFF'), true);
    assert.equal(signature.slice(8, 12), 'WEBP');
});
