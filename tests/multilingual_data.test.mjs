import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LocalizationManager } from '../js/localization/localization_manager.js';

test('Multilingual Engine Data - languages.json contains all 14 required languages', () => {
    const langFilePath = resolve(process.cwd(), 'data/languages/languages.json');
    const languages = JSON.parse(readFileSync(langFilePath, 'utf8'));

    const requiredCodes = ['en', 'fr', 'it', 'es', 'de', 'ru', 'el', 'pt', 'hy', 'ka', 'br', 'tt', 'ba', 'cv'];
    const loadedCodes = languages.map(l => l.code);

    for (const code of requiredCodes) {
        assert.ok(loadedCodes.includes(code), `Missing target language code: ${code}`);
    }
});

test('Multilingual Engine Data - vocabulary database entries share identical IDs across all 14 languages', () => {
    const vocabFilePath = resolve(process.cwd(), 'data/vocabulary/vocabulary_database.json');
    const vocabData = JSON.parse(readFileSync(vocabFilePath, 'utf8'));

    const requiredCodes = ['en', 'fr', 'it', 'es', 'de', 'ru', 'el', 'pt', 'hy', 'ka', 'br', 'tt', 'ba', 'cv'];

    for (const [vocabId, entry] of Object.entries(vocabData)) {
        assert.equal(entry.vocabId, vocabId);
        assert.ok(entry.translations, `Missing translations object for ${vocabId}`);

        for (const code of requiredCodes) {
            assert.ok(entry.translations[code], `Missing '${code}' translation for vocabulary ID: ${vocabId}`);
        }
    }
});

test('Multilingual Engine - instant language switching without engine modifications', () => {
    const locManager = new LocalizationManager({ defaultLanguage: 'en' });

    const doorObj = {
        en: "Door",
        fr: "Porte",
        it: "Porta",
        es: "Puerta",
        de: "Tür",
        ru: "Дверь",
        el: "Πόρτα",
        pt: "Porta",
        hy: "Դուռ",
        ka: "კარი",
        br: "Dor",
        tt: "Ишек",
        ba: "Ишек",
        cv: "Ашӑк"
    };

    assert.equal(locManager.getText(doorObj), "Door");

    locManager.setLanguage('fr');
    assert.equal(locManager.getText(doorObj), "Porte");

    locManager.setLanguage('tt');
    assert.equal(locManager.getText(doorObj), "Ишек");

    locManager.setLanguage('hy');
    assert.equal(locManager.getText(doorObj), "Դուռ");

    locManager.setLanguage('cv');
    assert.equal(locManager.getText(doorObj), "Ашӑк");
});
