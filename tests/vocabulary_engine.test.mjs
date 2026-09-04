import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { VocabularyEngine } from '../js/vocabulary/vocabulary_engine.js';

const mockVocabData = JSON.parse(
    fs.readFileSync(new URL('../data/vocabulary/vocabulary_database.json', import.meta.url))
);

test('VocabularyEngine - registers and normalizes vocabulary database entries', () => {
    const engine = new VocabularyEngine();
    engine.registerVocabularyDict(mockVocabData);

    assert.equal(engine.vocabDatabase.size, 6);
    assert.equal(engine.getVocabulary('vocab_door') !== null, true);

    const door = engine.getVocabulary('vocab_door');
    assert.equal(door.vocabId, 'vocab_door');
    assert.equal(door.difficulty, 'A0');
    assert.ok(door.translations.en);
    assert.ok(Array.isArray(door.collocations));
    assert.ok(door.exampleSentences.en);
    assert.ok(Array.isArray(door.relatedQuests));
    assert.ok(Array.isArray(door.relatedScenes));
    assert.equal(door.relatedScenes.length, 4);
});

test('VocabularyEngine - SM-2 spaced repetition updates mastery and review stats', () => {
    const engine = new VocabularyEngine();
    engine.registerVocabularyDict(mockVocabData);

    // Initial state check
    const initialStats = engine.getStats('vocab_key');
    assert.equal(initialStats.reviewCount, 0);
    assert.equal(initialStats.masteryLevel, 0);

    // Record review with quality 4 (good recall)
    const review1 = engine.recordReview('vocab_key', 4);
    assert.equal(review1.reviewCount, 1);
    assert.equal(review1.streak, 1);
    assert.ok(review1.masteryLevel > 0);

    // Record second review with quality 5 (perfect recall)
    const review2 = engine.recordReview('vocab_key', 5);
    assert.equal(review2.reviewCount, 2);
    assert.equal(review2.streak, 2);
    assert.ok(review2.masteryLevel > review1.masteryLevel);
});

test('VocabularyEngine - filters vocabulary present in multiple scenes', () => {
    const engine = new VocabularyEngine();
    engine.registerVocabularyDict(mockVocabData);

    const townSquareVocab = engine.getVocabularyForScene('town_square');
    assert.ok(townSquareVocab.some(v => v.vocabId === 'vocab_door'));

    const cafeVocab = engine.getVocabularyForScene('cafe');
    assert.ok(cafeVocab.some(v => v.vocabId === 'vocab_cup'));
    assert.ok(cafeVocab.some(v => v.vocabId === 'vocab_coffee'));
});
