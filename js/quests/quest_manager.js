/**
 * COSYworld/js/quests/quest_manager.js
 * Quest Manager - Open-World RPG Mission System.
 * Supports 10 Quest Types: exploration, collect, photograph, conversation, shopping,
 * grammar, pronunciation, listening, directions, timed challenge.
 * Evaluates unlock conditions, tracks progress, awards rewards, and progresses Quest Chains.
 */

export class QuestManager {
    /**
     * Finds a quest definition by ID.
     */
    static getQuest(questId, gameData) {
        if (!gameData || !gameData.quests) return null;
        return gameData.quests.find(q => q.id === questId);
    }

    /**
     * Check if a quest's unlock conditions are met by the player state.
     */
    static checkUnlockConditions(quest, state) {
        if (!quest || !quest.unlockConditions) return true;
        const cond = quest.unlockConditions;

        // Player level condition
        if (cond.level && state.citizenLvl < cond.level) return false;

        // Prerequisite quest condition
        if (cond.prerequisiteQuest && (!state.completedQuests || !state.completedQuests.has(cond.prerequisiteQuest))) {
            return false;
        }

        // Discovered objects condition
        if (cond.discoveredObjects && Array.isArray(cond.discoveredObjects)) {
            const hasAll = cond.discoveredObjects.every(obj => state.discoveredObjects && state.discoveredObjects.has(obj));
            if (!hasAll) return false;
        }

        return true;
    }

    /**
     * Get all currently available or active quests for the player.
     */
    static getAvailableQuests(state, gameData) {
        if (!gameData || !gameData.quests) return [];
        return gameData.quests.filter(q => {
            const isCompleted = state.completedQuests && state.completedQuests.has(q.id);
            if (isCompleted) return false;
            return this.checkUnlockConditions(q, state);
        });
    }

    /**
     * Start/activate a quest if not already active or completed.
     */
    static startQuest(questId, state, gameData) {
        const quest = this.getQuest(questId, gameData);
        if (!quest) return false;

        if (!state.activeQuests) state.activeQuests = new Set();
        if (!state.completedQuests) state.completedQuests = new Set();

        if (state.completedQuests.has(questId)) return false;

        state.activeQuests.add(questId);

        // Initialize timed challenge if applicable
        if (quest.type === 'timed challenge' && quest.requirements && quest.requirements.timeLimitSeconds) {
            if (!state.timedQuests) state.timedQuests = {};
            state.timedQuests[questId] = {
                startTime: Date.now(),
                durationSeconds: quest.requirements.timeLimitSeconds,
                initialCount: state.discoveredObjects ? state.discoveredObjects.size : 0
            };
        }

        return true;
    }

    /**
     * Complete a quest, grant rewards (XP, vocabulary, grammar), and progress quest chains.
     */
    static completeQuest(questId, state, gameData, addXPFn = null, saveStateFn = null, renderHudFn = null, showToastFn = null, grammarEngine = null) {
        const quest = this.getQuest(questId, gameData);
        if (!quest) return;

        if (!state.completedQuests) state.completedQuests = new Set();
        if (!state.activeQuests) state.activeQuests = new Set();

        if (state.completedQuests.has(questId)) return;

        state.completedQuests.add(questId);
        state.activeQuests.delete(questId);

        // Clean up timed quest tracking if any
        if (state.timedQuests && state.timedQuests[questId]) {
            delete state.timedQuests[questId];
        }

        // 1. Award XP Reward
        const xpAmount = (quest.reward && quest.reward.xp) ? quest.reward.xp : (quest.xpReward || 50);
        if (addXPFn) addXPFn(xpAmount);

        // 2. Grant Vocabulary Rewards
        if (quest.reward && quest.reward.vocabulary && Array.isArray(quest.reward.vocabulary)) {
            quest.reward.vocabulary.forEach(objId => {
                if (state.discoveredObjects) state.discoveredObjects.add(objId);
            });
        }

        // 3. Unlock Grammar Rewards
        const grammarReward = (quest.reward && quest.reward.grammar) || quest.grammarUnlock;
        if (grammarReward) {
            if (Array.isArray(grammarReward)) {
                grammarReward.forEach(g => state.unlockedGrammar && state.unlockedGrammar.add(g));
            } else if (typeof grammarReward === 'string') {
                if (state.unlockedGrammar) state.unlockedGrammar.add(grammarReward);
            }
        }

        // Evaluate grammar engine unlocks
        const ge = grammarEngine || (typeof window !== 'undefined' && window.COSY_WORLD && window.COSY_WORLD.grammarEngine);
        if (ge && ge.checkGrammarUnlocks) {
            ge.checkGrammarUnlocks(state, gameData, (unlockedGp) => {
                if (showToastFn) {
                    setTimeout(() => {
                        showToastFn(`Grammar Unlocked: ${unlockedGp.title}! 🌳`);
                    }, 1200);
                }
            });
        }

        // 4. Progress Quest Chains automatically!
        if (quest.nextQuestId) {
            const nextQ = this.getQuest(quest.nextQuestId, gameData);
            if (nextQ) {
                this.startQuest(quest.nextQuestId, state, gameData);
                if (showToastFn) {
                    setTimeout(() => {
                        showToastFn(`New Quest Unlocked: ${nextQ.title}! 📜`);
                    }, 800);
                }
            }
        }

        if (saveStateFn) saveStateFn();
        if (renderHudFn) renderHudFn();
        if (showToastFn) showToastFn(`Quest Complete: ${quest.title}! 🎉 (+${xpAmount} XP)`);
    }

    /**
     * Check progress for all active quests when an event occurs.
     */
    static evaluateEvent(eventType, payload, state, gameData, completeQuestFn) {
        if (!state || !gameData || !gameData.quests) return;

        const activeList = Array.from(state.activeQuests || []);
        // Also auto-start available quests if no active quests
        const availableQuests = this.getAvailableQuests(state, gameData);
        availableQuests.forEach(q => state.activeQuests.add(q.id));

        const questsToCheck = Array.from(state.activeQuests);

        questsToCheck.forEach(qid => {
            const q = this.getQuest(qid, gameData);
            if (!q || state.completedQuests.has(qid)) return;

            const req = q.requirements || {};
            let isSatisfied = false;

            switch (q.type) {
                case 'exploration':
                case 'directions':
                    if (eventType === 'location_changed' && payload.locationId === req.targetLocation) {
                        isSatisfied = true;
                    }
                    break;

                case 'collect':
                case 'photograph':
                case 'shopping':
                    if (req.targetObjects && Array.isArray(req.targetObjects)) {
                        isSatisfied = req.targetObjects.every(objId => state.discoveredObjects && state.discoveredObjects.has(objId));
                    }
                    break;

                case 'conversation':
                    if (eventType === 'npc_interacted' && payload.npcId === req.targetNpc) {
                        isSatisfied = true;
                    }
                    break;

                case 'grammar':
                    if (req.exerciseId && state.completedExercises && state.completedExercises.has(req.exerciseId)) {
                        isSatisfied = true;
                    } else if (req.targetGrammarId && state.unlockedGrammar && state.unlockedGrammar.has(req.targetGrammarId)) {
                        isSatisfied = true;
                    }
                    break;

                case 'pronunciation':
                    if (eventType === 'pronunciation_practiced' && payload.npcId === req.targetNpc) {
                        isSatisfied = true;
                    }
                    break;

                case 'listening':
                    if (eventType === 'speech_listened' || (eventType === 'object_inspected' && req.targetObjects && req.targetObjects.includes(payload.objId))) {
                        isSatisfied = true;
                    }
                    break;

                case 'timed challenge':
                    if (req.targetCount && state.discoveredObjects) {
                        if (state.discoveredObjects.size >= req.targetCount) {
                            if (req.timeLimitSeconds && state.timedQuests && state.timedQuests[qid]) {
                                const elapsed = (Date.now() - state.timedQuests[qid].startTime) / 1000;
                                if (elapsed <= req.timeLimitSeconds) {
                                    isSatisfied = true;
                                }
                            } else {
                                isSatisfied = true;
                            }
                        }
                    }
                    break;

                default:
                    if (req.targetCount && state.discoveredObjects && state.discoveredObjects.size >= req.targetCount) {
                        isSatisfied = true;
                    }
                    break;
            }

            if (isSatisfied) {
                if (completeQuestFn) completeQuestFn(qid);
            }
        });
    }

    /**
     * Legacy helper method for backward compatibility.
     */
    static checkQuests(state, gameData, completeQuestFn) {
        this.evaluateEvent('state_check', {}, state, gameData, completeQuestFn);
    }
}
