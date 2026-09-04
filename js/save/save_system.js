/**
 * games/cosy_world/js/save/save_system.js
 * Manages LocalStorage state persistence and recovery.
 */

const STORAGE_KEY = 'COSY_WORLD_STATE';

export class SaveSystem {
    static loadInitialState() {
        const defaultState = {
            currentLocationId: 'apartment_living',
            currentLang: 'en',
            xp: 0,
            citizenLvl: 1,
            discoveredObjects: new Set(),
            completedQuests: new Set(),
            activeQuests: new Set(['q1_key_door']),
            unlockedGrammar: new Set(['gt_greetings']),
            npcRelationships: {
                james_york: 0,
                ella_bronx: 0,
                anna: 0,
                lucas_baker: 0,
                marco_barista: 0
            },
            activeTab: 'quests',
            showGuidePointers: true,
            showTranslations: false
        };

        const savedState = localStorage.getItem(STORAGE_KEY);
        if (!savedState) return defaultState;

        try {
            const parsed = JSON.parse(savedState);
            return {
                ...defaultState,
                xp: parsed.xp || 0,
                citizenLvl: parsed.citizenLvl || 1,
                currentLocationId: parsed.currentLocationId || 'apartment_living',
                currentLang: parsed.currentLang || 'en',
                discoveredObjects: new Set(parsed.discoveredObjects || []),
                completedQuests: new Set(parsed.completedQuests || []),
                activeQuests: new Set(parsed.activeQuests || ['q1_key_door']),
                unlockedGrammar: new Set(parsed.unlockedGrammar || ['gt_greetings']),
                npcRelationships: parsed.npcRelationships || defaultState.npcRelationships,
                showGuidePointers: parsed.showGuidePointers !== undefined ? parsed.showGuidePointers : true,
                showTranslations: parsed.showTranslations !== undefined ? parsed.showTranslations : false
            };
        } catch (e) {
            console.warn('Could not parse saved COSY World state, using defaults:', e);
            return defaultState;
        }
    }

    static saveState(state) {
        const dataToSave = {
            xp: state.xp,
            citizenLvl: state.citizenLvl,
            currentLocationId: state.currentLocationId,
            currentLang: state.currentLang,
            discoveredObjects: Array.from(state.discoveredObjects),
            completedQuests: Array.from(state.completedQuests),
            activeQuests: Array.from(state.activeQuests),
            unlockedGrammar: Array.from(state.unlockedGrammar),
            npcRelationships: state.npcRelationships,
            showGuidePointers: state.showGuidePointers,
            showTranslations: state.showTranslations
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
}
