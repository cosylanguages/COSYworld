/**
 * @file js/save/save_manager.js
 * @description Save Manager for COSY World.
 * Manages LocalStorage state persistence, state schema validation, auto-save listeners, and export/import.
 */

export const STORAGE_KEY = 'COSY_WORLD_STATE';

export class SaveManager {
    /**
     * @param {Object} [options]
     * @param {string} [options.storageKey]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.storageKey = options.storageKey || STORAGE_KEY;
        this.eventBus = options.eventBus || null;
    }

    /**
     * Return default initial game state structure.
     * @returns {Object}
     */
    getDefaultState() {
        return {
            currentLocationId: 'apartment_living',
            currentLang: 'en',
            xp: 0,
            citizenLvl: 1,
            coins: 100,
            visitedLocations: new Set(['apartment_living']),
            discoveredObjects: new Set(),
            completedQuests: new Set(),
            activeQuests: new Set(['q1_key_door']),
            unlockedGrammar: new Set(['gt_greetings']),
            unlockedRecipes: new Set(['recipe_baguette']),
            discoveredLandmarks: new Set(),
            completedExercises: new Set(),
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
    }

    /**
     * Load initial state from LocalStorage or fall back to defaults.
     * @returns {Object} State object with native JavaScript Sets restored.
     */
    loadInitialState() {
        const defaultState = this.getDefaultState();
        let savedRaw = null;

        try {
            if (typeof localStorage !== 'undefined') {
                savedRaw = localStorage.getItem(this.storageKey);
            }
        } catch (e) {
            console.warn('LocalStorage access unavailable:', e);
        }

        if (!savedRaw) return defaultState;

        try {
            const parsed = JSON.parse(savedRaw);
            return {
                ...defaultState,
                xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
                citizenLvl: typeof parsed.citizenLvl === 'number' ? parsed.citizenLvl : 1,
                coins: typeof parsed.coins === 'number' ? parsed.coins : 100,
                currentLocationId: parsed.currentLocationId || defaultState.currentLocationId,
                currentLang: parsed.currentLang || defaultState.currentLang,
                visitedLocations: new Set(parsed.visitedLocations || [parsed.currentLocationId || 'apartment_living']),
                discoveredObjects: new Set(parsed.discoveredObjects || []),
                completedQuests: new Set(parsed.completedQuests || []),
                activeQuests: new Set(parsed.activeQuests || defaultState.activeQuests),
                unlockedGrammar: new Set(parsed.unlockedGrammar || defaultState.unlockedGrammar),
                unlockedRecipes: new Set(parsed.unlockedRecipes || defaultState.unlockedRecipes),
                discoveredLandmarks: new Set(parsed.discoveredLandmarks || []),
                completedExercises: new Set(parsed.completedExercises || []),
                npcRelationships: parsed.npcRelationships || defaultState.npcRelationships,
                activeTab: parsed.activeTab || defaultState.activeTab,
                showGuidePointers: parsed.showGuidePointers !== undefined ? parsed.showGuidePointers : true,
                showTranslations: parsed.showTranslations !== undefined ? parsed.showTranslations : false
            };
        } catch (e) {
            console.warn('Failed to parse saved state, reverting to defaults:', e);
            return defaultState;
        }
    }

    /**
     * Save state to LocalStorage.
     * @param {Object} state - Game state object.
     */
    saveState(state) {
        if (!state) return;

        const dataToSave = {
            xp: state.xp,
            citizenLvl: state.citizenLvl,
            coins: state.coins !== undefined ? state.coins : 100,
            currentLocationId: state.currentLocationId,
            currentLang: state.currentLang,
            visitedLocations: Array.from(state.visitedLocations || []),
            discoveredObjects: Array.from(state.discoveredObjects || []),
            completedQuests: Array.from(state.completedQuests || []),
            activeQuests: Array.from(state.activeQuests || []),
            unlockedGrammar: Array.from(state.unlockedGrammar || []),
            unlockedRecipes: Array.from(state.unlockedRecipes || []),
            discoveredLandmarks: Array.from(state.discoveredLandmarks || []),
            completedExercises: Array.from(state.completedExercises || []),
            npcRelationships: state.npcRelationships,
            activeTab: state.activeTab,
            showGuidePointers: state.showGuidePointers,
            showTranslations: state.showTranslations,
            updatedAt: Date.now()
        };

        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            }
        } catch (e) {
            console.error('Failed to save state to LocalStorage:', e);
        }

        if (this.eventBus) {
            this.eventBus.emit('stateSaved', state);
        }
    }

    /**
     * Clear saved state from LocalStorage and return fresh default state.
     * @returns {Object}
     */
    resetState() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(this.storageKey);
            }
        } catch (e) {
            console.error('Failed to clear LocalStorage:', e);
        }
        return this.getDefaultState();
    }
}
