/**
 * @file js/localization/localization_manager.js
 * @description Localization Manager for COSY World.
 * Monolingual Learning Architecture: resolves content in target language directly without bilingual translations.
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
     * Get active target language code.
     * @returns {string}
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Resolve text only in the active target language.
     * Missing translations return an empty string so callers can render an
     * unavailable-content state rather than silently switching languages.
     * @param {Object<string, string>|string} textObj
     * @param {string} [targetLang]
     * @returns {string}
     */
    getText(textObj, targetLang) {
        if (typeof textObj === 'string') return textObj;
        if (!textObj || typeof textObj !== 'object') return '';

        const lang = targetLang || this.currentLanguage;
        return typeof textObj[lang] === 'string' ? textObj[lang] : '';
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
