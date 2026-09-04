import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveManager } from '../js/save/save_manager.js';

test('SaveManager - returns default initial state', () => {
    const mgr = new SaveManager({ storageKey: 'TEST_COSY_KEY' });
    const state = mgr.loadInitialState();

    assert.equal(state.currentLocationId, 'apartment_living');
    assert.equal(state.currentLang, 'en');
    assert.ok(state.discoveredObjects instanceof Set);
    assert.ok(state.completedQuests instanceof Set);
});

test('SaveManager - saves and loads state correctly with mock LocalStorage', () => {
    const mockStore = new Map();
    globalThis.localStorage = {
        getItem: (k) => mockStore.get(k) || null,
        setItem: (k, v) => mockStore.set(k, v),
        removeItem: (k) => mockStore.delete(k)
    };

    const mgr = new SaveManager({ storageKey: 'TEST_SAVE_KEY' });
    const state = mgr.getDefaultState();
    state.xp = 150;
    state.discoveredObjects.add('key');

    mgr.saveState(state);

    const loaded = mgr.loadInitialState();
    assert.equal(loaded.xp, 150);
    assert.ok(loaded.discoveredObjects.has('key'));

    mgr.resetState();
    assert.equal(mockStore.has('TEST_SAVE_KEY'), false);
});
