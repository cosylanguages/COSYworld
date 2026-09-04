import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MinigameFramework } from '../js/minigames/minigame_framework.js';

test('MinigameFramework - loads and registers all 10 minigame types', () => {
    const rawData = JSON.parse(fs.readFileSync(path.resolve('data/minigames/minigames.json'), 'utf8'));
    const framework = new MinigameFramework();
    framework.loadMinigamesFromJson(rawData);

    assert.equal(framework.minigames.length, 10);

    const expectedTypes = [
        'scene_match', 'memory', 'word_search', 'pronunciation',
        'listening', 'dialogue', 'crossword', 'object_hunt',
        'drag_drop', 'sentence_builder'
    ];

    expectedTypes.forEach(t => {
        const found = framework.getMinigamesByType(t);
        assert.ok(found.length > 0, `Minigame dataset missing type: ${t}`);
    });
});

test('MinigameFramework - evaluates answers and auto-synchronizes progress', () => {
    const rawData = JSON.parse(fs.readFileSync(path.resolve('data/minigames/minigames.json'), 'utf8'));
    const framework = new MinigameFramework();
    framework.loadMinigamesFromJson(rawData);

    const state = {
        xp: 0,
        completedMinigames: new Set(),
        discoveredObjects: new Set(),
        unlockedGrammar: new Set()
    };

    const mockEngine = {
        addXP: (amount) => { state.xp += amount; },
        saveState: () => {},
        checkQuests: () => {}
    };

    framework.gameEngine = mockEngine;

    // Test Scene Match evaluation
    const evalResult = framework.evaluateMinigame('mg_scene_match_1', 'apartment_living', state, null);
    assert.equal(evalResult.success, true);
    assert.ok(state.xp >= 50, 'XP should auto-sync upon completion');
    assert.ok(state.discoveredObjects.has('sofa'), 'Vocabulary rewards should auto-sync');

    // Test Sentence Builder evaluation
    const sbResult = framework.evaluateMinigame('mg_sentence_builder_1', ['Where', 'is', 'the', 'bakery?'], state, null);
    assert.equal(sbResult.success, true);
    assert.ok(state.unlockedGrammar.has('gt_greetings'), 'Grammar unlocks should auto-sync');
});
