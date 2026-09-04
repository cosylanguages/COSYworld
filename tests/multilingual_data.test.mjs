import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LocalizationManager } from '../js/localization/localization_manager.js';

test('Multilingual Engine Data - languages.json contains all 14 required target languages', () => {
    const langFilePath = resolve(process.cwd(), 'data/languages/languages.json');
    const languages = JSON.parse(readFileSync(langFilePath, 'utf8'));

    const requiredCodes = ['en', 'fr', 'it', 'es', 'de', 'ru', 'el', 'pt', 'hy', 'ka', 'br', 'tt', 'ba', 'cv'];
    const loadedCodes = languages.map(l => l.code);

    for (const code of requiredCodes) {
        assert.ok(loadedCodes.includes(code), `Missing target language code: ${code}`);
    }
});

test('Monolingual Architecture - vocabulary entries follow the target-language schema without translation dictionaries', () => {
    const vocabFilePath = resolve(process.cwd(), 'data/vocabulary/vocabulary_database.json');
    const vocabData = JSON.parse(readFileSync(vocabFilePath, 'utf8'));

    for (const [key, entry] of Object.entries(vocabData)) {
        assert.ok(entry.id, `Entry ${key} must have an id`);
        assert.ok(entry.word, `Entry ${key} must have a target word`);
        assert.ok(entry.cefr, `Entry ${key} must have a cefr level`);
        assert.ok(Array.isArray(entry.examples), `Entry ${key} must have examples array`);
        assert.equal(entry.translations, undefined, `Entry ${key} must NOT contain a translation dictionary`);
    }
});

test('LocalizationManager - resolves target language text directly without translation dictionary dependency', () => {
    const locManager = new LocalizationManager({ defaultLanguage: 'en' });

    assert.equal(locManager.getText("Apple"), "Apple");
    assert.equal(locManager.getText({ en: "Door" }), "Door");
});
