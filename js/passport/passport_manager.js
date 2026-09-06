/**
 * @file js/passport/passport_manager.js
 * @description Integration module for COSY Passport progress export and import.
 */

import {
    exportPassport,
    importPassport,
    downloadPassport,
    loadPassportFromFile
} from 'https://raw.githubusercontent.com/cosylanguages/COSYlanguages/1bfa1e032d2b1ec9703e5679a5509ba8661cb787/shared/js/passport.js';

export class PassportManager {
    /**
     * Export COSYworld state as a COSY Passport JSON file.
     * @param {Object} state - Game engine state.
     */
    static exportCOSYWorldPassport(state) {
        if (!state) return;

        const progressEntries = [
            {
                source: 'COSYworld',
                item: 'citizen_level',
                value: state.citizenLvl || 1
            },
            {
                source: 'COSYworld',
                item: 'xp',
                value: state.xp || 0
            }
        ];

        const completedQuests = Array.from(state.completedQuests || []);
        for (const questId of completedQuests) {
            progressEntries.push({
                source: 'COSYworld',
                item: `quest.${questId}`,
                value: true
            });
        }

        const passportObj = exportPassport(null, {
            source: 'COSYworld',
            progress: progressEntries
        }, state.currentLang || 'en');

        downloadPassport(passportObj, 'cosy-passport-world.json');
        return passportObj;
    }

    /**
     * Import COSY Passport JSON file and update COSYworld state for entries matching source "COSYworld".
     * @param {HTMLInputElement|File} input - File element or File object.
     * @param {Object} currentState - Game engine state to update.
     * @returns {Promise<Object>} Updated fields summary.
     */
    static async importCOSYWorldPassport(input, currentState) {
        if (!currentState) {
            throw new Error('No state provided for passport import');
        }

        const json = await loadPassportFromFile(input);
        const result = importPassport(json, 'COSYworld');

        if (!result.valid) {
            throw new Error(result.error || 'Invalid passport data');
        }

        let updatedLevel = null;
        let updatedXP = null;
        const importedQuests = [];

        for (const entry of result.progress) {
            if (!entry || entry.source !== 'COSYworld' || !entry.item) continue;

            if (entry.item === 'citizen_level') {
                const lvl = Number(entry.value);
                if (!isNaN(lvl) && lvl > 0) {
                    currentState.citizenLvl = lvl;
                    updatedLevel = lvl;
                }
            } else if (entry.item === 'xp') {
                const xp = Number(entry.value);
                if (!isNaN(xp) && xp >= 0) {
                    currentState.xp = xp;
                    updatedXP = xp;
                }
            } else if (entry.item.startsWith('quest.')) {
                const questId = entry.item.replace(/^quest\./, '');
                if (questId && (entry.value === true || entry.value === 1 || entry.value === 'completed')) {
                    if (!currentState.completedQuests) {
                        currentState.completedQuests = new Set();
                    }
                    currentState.completedQuests.add(questId);
                    importedQuests.push(questId);
                }
            }
        }

        return {
            valid: true,
            updatedLevel,
            updatedXP,
            importedQuestsCount: importedQuests.length,
            language: result.language
        };
    }
}
