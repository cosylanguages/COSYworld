import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalizationManager } from '../js/localization/localization_manager.js';

test('LocalizationManager - resolves only the active target language', () => {
    const loc = new LocalizationManager({ defaultLanguage: 'en' });
    loc.setLanguage('fr');

    const localizedMap = {
        en: 'Living Room',
        fr: 'Salon',
        es: 'Sala de estar'
    };

    assert.equal(loc.getText(localizedMap), 'Salon');
    assert.equal(loc.getText(localizedMap, 'es'), 'Sala de estar');

    // Missing target-language content must not silently switch to English or another language.
    assert.equal(loc.getText({ en: 'Hello' }, 'de'), '');
    assert.equal(loc.getText({ fr: 'Bonjour', es: 'Hola' }, 'de'), '');
    assert.equal(loc.getText({}), '');
});

test('LocalizationManager - interpolates text templates', () => {
    const loc = new LocalizationManager();
    const result = loc.interpolate('Entered {location} district', { location: 'Market' });
    assert.equal(result, 'Entered Market district');
});
