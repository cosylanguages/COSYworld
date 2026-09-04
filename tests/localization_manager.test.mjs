import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalizationManager } from '../js/localization/localization_manager.js';

test('LocalizationManager - resolves localized text and fallbacks', () => {
    const loc = new LocalizationManager({ defaultLanguage: 'en' });
    loc.setLanguage('fr');

    const localizedMap = {
        en: 'Living Room',
        fr: 'Salon',
        es: 'Sala de estar'
    };

    assert.equal(loc.getText(localizedMap), 'Salon');
    assert.equal(loc.getText(localizedMap, 'es'), 'Sala de estar');

    // Missing language fallback to 'en'
    assert.equal(loc.getText({ en: 'Hello' }, 'de'), 'Hello');
});

test('LocalizationManager - interpolates text templates', () => {
    const loc = new LocalizationManager();
    const result = loc.interpolate('Entered {location} district', { location: 'Market' });
    assert.equal(result, 'Entered Market district');
});
