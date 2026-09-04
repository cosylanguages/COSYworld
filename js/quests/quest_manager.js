/**
 * COSYworld/js/quests/quest_manager.js
 * Quest Manager - Compatibility wrapper around QuestEngine.
 * Bridges static QuestManager API calls directly to QuestEngine.
 */

import { QuestEngine } from './quest_engine.js';

const sharedEngine = new QuestEngine();

export class QuestManager {
    /**
     * Get or initialize shared QuestEngine instance.
     */
    static getEngine(gameData = null) {
        if (gameData && Array.isArray(gameData.quests)) {
            sharedEngine.registerQuests(gameData.quests);
        }
        return sharedEngine;
    }

    /**
     * Finds a quest definition by ID.
     */
    static getQuest(questId, gameData = null) {
        const engine = this.getEngine(gameData);
        return engine.getQuest(questId, gameData);
    }

    /**
     * Check if a quest's unlock conditions are met by the player state.
     */
    static checkUnlockConditions(quest, state) {
        return sharedEngine.checkUnlockConditions(quest, state);
    }

    /**
     * Get all currently available quests for the player.
     */
    static getAvailableQuests(state, gameData = null) {
        const engine = this.getEngine(gameData);
        return engine.getAvailableQuests(state, gameData);
    }

    /**
     * Start/activate a quest.
     */
    static startQuest(questId, state, gameData = null) {
        const engine = this.getEngine(gameData);
        return engine.startQuest(questId, state, gameData);
    }

    /**
     * Complete a quest, grant rewards (XP, vocabulary, grammar), and progress quest chains.
     */
    static completeQuest(questId, state, gameData = null, addXPFn = null, saveStateFn = null, renderHudFn = null, showToastFn = null, grammarEngine = null) {
        const engine = this.getEngine(gameData);
        return engine.completeQuest(questId, state, gameData, addXPFn, saveStateFn, renderHudFn, showToastFn, grammarEngine);
    }

    /**
     * Check progress for all active quests when an event occurs.
     */
    static evaluateEvent(eventType, payload = {}, state, gameData = null, completeQuestFn = null) {
        const engine = this.getEngine(gameData);
        return engine.evaluateEvent(eventType, payload, state, gameData, completeQuestFn);
    }

    /**
     * Legacy helper method for backward compatibility.
     */
    static checkQuests(state, gameData = null, completeQuestFn = null) {
        this.evaluateEvent('state_check', {}, state, gameData, completeQuestFn);
    }
}
