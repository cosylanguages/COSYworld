import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { GrammarEngine } from '../js/grammar/grammar_engine.js';

test('Grammar Data Schema - contains all required modular fields', () => {
    const rawData = fs.readFileSync(path.resolve('data/grammar/grammar.json'), 'utf8');
    const grammarTree = JSON.parse(rawData);

    assert.ok(Array.isArray(grammarTree), 'Grammar tree should be an array');
    assert.ok(grammarTree.length >= 4, 'Should contain at least 4 grammar points');

    const requiredKeys = [
        'id', 'title', 'rule', 'examples',
        'interactiveExercises', 'dialogues',
        'sceneIntegration', 'voice',
        'difficulty', 'unlockRequirements'
    ];

    grammarTree.forEach(gp => {
        requiredKeys.forEach(key => {
            assert.ok(key in gp, `Grammar point "${gp.id}" is missing required field "${key}"`);
        });

        // Verify structure of examples
        assert.ok(Array.isArray(gp.examples) && gp.examples.length > 0, `Grammar point "${gp.id}" should have examples`);
        assert.ok(gp.examples[0].text, `Example in "${gp.id}" missing text field`);

        // Verify structure of interactiveExercises
        assert.ok(Array.isArray(gp.interactiveExercises) && gp.interactiveExercises.length > 0, `Grammar point "${gp.id}" should have exercises`);
        assert.ok(gp.interactiveExercises[0].question, `Exercise in "${gp.id}" missing question`);

        // Verify scene integration
        assert.ok(gp.sceneIntegration.locationId, `Scene integration in "${gp.id}" missing locationId`);
    });
});

test('GrammarEngine - mission completion unlocks matching grammar point', () => {
    const rawGrammar = JSON.parse(fs.readFileSync(path.resolve('data/grammar/grammar.json'), 'utf8'));
    const rawQuests = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));

    const gameData = {
        grammarTree: rawGrammar,
        quests: rawQuests
    };

    const state = {
        citizenLvl: 1,
        completedQuests: new Set(),
        discoveredObjects: new Set(),
        unlockedGrammar: new Set()
    };

    const engine = new GrammarEngine();

    // Initial state: gt_greetings requires q1_key_door & key object
    let unlocked = engine.checkGrammarUnlocks(state, gameData);
    assert.equal(state.unlockedGrammar.has('gt_greetings'), false);

    // Complete mission q1_key_door and discover key
    state.completedQuests.add('q1_key_door');
    state.discoveredObjects.add('key');

    let newlyUnlocked = [];
    engine.checkGrammarUnlocks(state, gameData, (gp) => {
        newlyUnlocked.push(gp.id);
    });

    assert.ok(state.unlockedGrammar.has('gt_greetings'), 'gt_greetings should now be unlocked');
    assert.deepEqual(newlyUnlocked, ['gt_greetings']);
});

test('GrammarEngine - interactive exercise evaluation', () => {
    const rawGrammar = JSON.parse(fs.readFileSync(path.resolve('data/grammar/grammar.json'), 'utf8'));
    const gameData = { grammarTree: rawGrammar };

    const state = {
        completedExercises: new Set()
    };

    let addedXP = 0;
    const mockGameEngine = {
        addXP: (amount) => { addedXP += amount; }
    };

    const engine = new GrammarEngine(mockGameEngine);

    // Test Multiple Choice Exercise (ex_greetings_1)
    const resultChoice = engine.evaluateExercise('ex_greetings_1', 0, state, gameData);
    assert.equal(resultChoice.success, true);
    assert.equal(addedXP, 25);
    assert.ok(state.completedExercises.has('ex_greetings_1'));

    // Test wrong choice
    const resultWrong = engine.evaluateExercise('ex_greetings_1', 2, state, gameData);
    assert.equal(resultWrong.success, false);

    // Test Word Order Exercise (ex_greetings_2)
    const resultWordOrder = engine.evaluateExercise('ex_greetings_2', ['Hello', 'open', 'the', 'door'], state, gameData);
    assert.equal(resultWordOrder.success, true);
    assert.ok(state.completedExercises.has('ex_greetings_2'));
});

test('GrammarEngine - query scene, NPC, and object integration', () => {
    const rawGrammar = JSON.parse(fs.readFileSync(path.resolve('data/grammar/grammar.json'), 'utf8'));
    const gameData = { grammarTree: rawGrammar };

    const engine = new GrammarEngine();

    const apartmentGrammar = engine.getGrammarForScene('apartment_living', gameData);
    assert.ok(apartmentGrammar.length >= 2);
    assert.ok(apartmentGrammar.some(g => g.id === 'gt_greetings'));

    const jamesGrammar = engine.getGrammarForNPC('james_york', gameData);
    assert.ok(jamesGrammar.length >= 1);
    assert.ok(jamesGrammar.some(g => g.id === 'gt_greetings'));

    const keyGrammar = engine.getGrammarForObject('key', gameData);
    assert.ok(keyGrammar.length >= 1);
    assert.ok(keyGrammar.some(g => g.id === 'gt_greetings'));
});
