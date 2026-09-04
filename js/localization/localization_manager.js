/**
 * @file js/localization/localization_manager.js
 * @description Localization Manager for COSY World.
 * Manages 14 target languages, language datasets, fallback resolution, and text interpolation without modifying game engine core.
 */

export class LocalizationManager {
    /**
     * @param {Object} [options]
     * @param {string} [options.defaultLanguage='en']
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.currentLanguage = options.defaultLanguage || 'en';
        this.defaultLanguage = options.defaultLanguage || 'en';
        this.eventBus = options.eventBus || null;
        /** @type {Array<{ code: string, label: string, flag: string }>} */
        this.supportedLanguages = [];
    }

    /**
     * Set active target language definitions.
     * @param {Array<{ code: string, label: string, flag: string }>} languagesList
     */
    setSupportedLanguages(languagesList) {
        if (Array.isArray(languagesList)) {
            this.supportedLanguages = languagesList;
        }
    }

    /**
     * Set target language code.
     * @param {string} langCode
     */
    setLanguage(langCode) {
        if (!langCode) return;
        const previous = this.currentLanguage;
        this.currentLanguage = langCode;

        if (this.eventBus && previous !== langCode) {
            this.eventBus.emit('languageChanged', {
                previous,
                current: langCode
            });
        }
    }

    /**
     * Get active language code.
     * @returns {string}
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Resolve localized text object for a given key or object map.
     * Handles fallback to default language 'en' if preferred language string is missing.
     * @param {Object<string, string>|string} textObj - e.g. { en: "Door", fr: "Porte" } or string
     * @param {string} [targetLang] - Optional override language
     * @returns {string}
     */
    getText(textObj, targetLang) {
        if (typeof textObj === 'string') return textObj;
        if (!textObj || typeof textObj !== 'object') return '';

        const lang = targetLang || this.currentLanguage;

        if (textObj[lang]) {
            return textObj[lang];
        }

        if (textObj[this.defaultLanguage]) {
            return textObj[this.defaultLanguage];
        }

        const keys = Object.keys(textObj);
        return keys.length > 0 ? textObj[keys[0]] : '';
    }

    /**
     * Helper for string format interpolation (e.g., "Hello {name}").
     * @param {string} template
     * @param {Object<string, any>} params
     * @returns {string}
     */
    interpolate(template, params = {}) {
        if (!template || typeof template !== 'string') return '';
        return template.replace(/\{(\w+)\}/g, (_, key) => {
            return params[key] !== undefined ? params[key] : `{${key}}`;
        });
    }
}
