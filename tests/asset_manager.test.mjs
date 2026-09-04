import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { AssetManager } from '../js/engine/asset_manager.js';

test('AssetManager - loads and caches JSON files', async () => {
    const manager = new AssetManager();
    // Inject mock fetch for Node environment testing
    globalThis.fetch = async (url) => {
        const relative = url.toString().replace(/^data\//, '');
        const absolutePath = path.resolve('data', relative);
        const content = fs.readFileSync(absolutePath, 'utf8');
        return {
            ok: true,
            status: 200,
            json: async () => JSON.parse(content)
        };
    };

    const relativePath = 'languages/languages.json';

    const data = await manager.loadJson(relativePath);
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);

    // Verify cache hit
    const cachedData = manager.get('data/' + relativePath);
    assert.strictEqual(cachedData, data);
});

test('AssetManager - preload multiple JSON files', async () => {
    const manager = new AssetManager();
    const files = [
        'languages/languages.json',
        'quests/quests.json'
    ];

    const map = await manager.preloadJsonFiles(files);
    assert.equal(map.size, 2);
    assert.ok(map.has('languages/languages.json'));
    assert.ok(map.has('quests/quests.json'));
});

test('AssetManager - unload and clear cache', async () => {
    const manager = new AssetManager();
    const relativePath = 'languages/languages.json';

    await manager.loadJson(relativePath);
    assert.ok(manager.get(relativePath) !== null);

    manager.unload(relativePath);
    assert.strictEqual(manager.get(relativePath), null);
});
