import test from 'node:test';
import assert from 'node:assert/strict';
import { VocabularyEngine } from '../js/vocabulary/vocabulary_engine.js';

test('VocabularyEngine - registers and normalizes monolingual vocabulary database entries', () => {
    const engine = new VocabularyEngine();

    engine.registerVocabularyDict({
        apple: {
            id: 'apple',
            word: 'apple',
            cefr: 'A0',
            category: 'food',
            scene: 'kitchen',
            examples: ['I eat an apple.'],
            related_words: ['fruit'],
            actions: ['eat']
        }
    });

    const entry = engine.getEntry('apple');
    assert.ok(entry);
    assert.equal(entry.word, 'apple');
    assert.equal(entry.cefr, 'A0');
    assert.equal(entry.category, 'food');
    assert.deepEqual(entry.examples, ['I eat an apple.']);
    assert.equal(entry.translations, undefined);
});

test('VocabularyEngine - SM-2 spaced repetition updates mastery and review stats', () => {
    const engine = new VocabularyEngine();
    const stats = engine.recordReview('apple', 5);

    assert.equal(stats.repetition, 1);
    assert.equal(stats.interval, 1);
    assert.equal(engine.getVocabularyMastery('apple'), 20);
});
