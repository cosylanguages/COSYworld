/**
 * COSYworld/js/quests/quest_engine.js
 * Quest Engine - Modular RPG & Direct Immersion Quest System.
 * Supports 10 Categories: Vocabulary, Grammar, Listening, Speaking, Reading, Exploration, Shopping, Cooking, Photography, Travel.
 * Handles requirements, steps, objectives, progress, rewards, dialogues, NPC triggers, and scene triggers from JSON.
 */

export class QuestEngine {
    constructor(options = {}) {
        this.gameEngine = options.gameEngine || null;
        this.eventBus = options.eventBus || null;
        this.questsMap = new Map();
        this.quests = [];

        if (options.quests) {
            this.registerQuests(options.quests);
        }
    }

    /**
     * Map aliases and normalize raw category strings to standard 10 categories.
     */
    static normalizeCategory(catStr = '') {
        const lower = String(catStr).toLowerCase().trim();
        switch (lower) {
            case 'vocabulary':
            case 'collect':
            case 'vocab':
                return 'vocabulary';
            case 'grammar':
                return 'grammar';
            case 'listening':
            case 'listen':
                return 'listening';
            case 'speaking':
            case 'pronunciation':
            case 'speech':
            case 'conversation':
                return 'speaking';
            case 'reading':
            case 'read':
                return 'reading';
            case 'exploration':
            case 'explore':
            case 'timed challenge':
                return 'exploration';
            case 'shopping':
            case 'shop':
                return 'shopping';
            case 'cooking':
            case 'cook':
                return 'cooking';
            case 'photography':
            case 'photograph':
            case 'photo':
                return 'photography';
            case 'travel':
            case 'directions':
            case 'navigate':
                return 'travel';
            default:
                return lower || 'exploration';
        }
    }

    /**
     * Register and normalize an array of quest JSON objects.
     */
    registerQuests(questsArray) {
        if (!Array.isArray(questsArray)) return;
        this.quests = [];
        this.questsMap.clear();

        questsArray.forEach(q => {
            const normalized = this.normalizeQuest(q);
            this.quests.push(normalized);
            this.questsMap.set(normalized.id, normalized);
        });
    }

    /**
     * Load quests directly from JSON array or object.
     */
    loadQuestsFromJson(jsonData) {
        const questList = Array.isArray(jsonData) ? jsonData : (jsonData && jsonData.quests ? jsonData.quests : []);
        this.registerQuests(questList);
        return this.quests;
    }

    /**
     * Normalize a single quest JSON object ensuring defaults for all supported fields.
     */
    normalizeQuest(raw) {
        const id = raw.id || `q_${Math.random().toString(36).substring(2, 9)}`;
        const rawType = raw.type || raw.category || 'exploration';
        const category = QuestEngine.normalizeCategory(raw.category || rawType);
        const title = raw.title || 'Untitled Quest';
        const description = raw.description || '';
        const difficulty = raw.difficulty || 'A0';

        // Merge unlockConditions and requirements
        const rawReqs = raw.requirements || {};
        const rawCond = raw.unlockConditions || {};
        const requirements = {
            level: rawCond.level || rawReqs.level || 1,
            prerequisiteQuest: rawCond.prerequisiteQuest || rawReqs.prerequisiteQuest || raw.prerequisiteQuest || null,
            discoveredObjects: rawCond.discoveredObjects || rawReqs.discoveredObjects || rawReqs.targetObjects || [],
            targetLocation: rawReqs.targetLocation || rawCond.targetLocation || null,
            targetNpc: rawReqs.targetNpc || rawCond.targetNpc || raw.NPC || null,
            targetGrammarId: rawReqs.targetGrammarId || null,
            exerciseId: rawReqs.exerciseId || null,
            action: rawReqs.action || null,
            targetCount: rawReqs.targetCount || null,
            timeLimitSeconds: rawReqs.timeLimitSeconds || null
        };

        // Objectives normalize
        let objectives = [];
        if (Array.isArray(raw.objectives) && raw.objectives.length > 0) {
            objectives = raw.objectives.map((obj, i) => ({
                id: obj.id || `obj_${i + 1}`,
                type: obj.type || category,
                description: obj.description || description,
                targetLocation: obj.targetLocation || requirements.targetLocation,
                targetObjects: obj.targetObjects || (obj.targetObject ? [obj.targetObject] : requirements.discoveredObjects),
                targetNpc: obj.targetNpc || requirements.targetNpc,
                targetGrammarId: obj.targetGrammarId || requirements.targetGrammarId,
                exerciseId: obj.exerciseId || requirements.exerciseId,
                action: obj.action || requirements.action,
                requiredCount: obj.requiredCount || obj.targetCount || requirements.targetCount || (obj.targetObjects ? obj.targetObjects.length : 1)
            }));
        } else {
            // Auto-derive single default objective from requirements
            objectives = [{
                id: 'obj_1',
                type: category,
                description: description,
                targetLocation: requirements.targetLocation,
                targetObjects: requirements.discoveredObjects,
                targetNpc: requirements.targetNpc,
                targetGrammarId: requirements.targetGrammarId,
                exerciseId: requirements.exerciseId,
                action: requirements.action,
                requiredCount: requirements.targetCount || (requirements.discoveredObjects ? requirements.discoveredObjects.length : 1)
            }];
        }

        // Steps normalize
        let steps = [];
        if (Array.isArray(raw.steps) && raw.steps.length > 0) {
            steps = raw.steps.map((s, i) => ({
                id: s.id || `step_${i + 1}`,
                description: s.description || `Step ${i + 1}`,
                target: s.target || null,
                objectiveId: s.objectiveId || (objectives[i] ? objectives[i].id : objectives[0].id)
            }));
        } else {
            steps = objectives.map((obj, i) => ({
                id: `step_${i + 1}`,
                description: obj.description || title,
                target: obj.targetLocation || obj.targetNpc || (obj.targetObjects ? obj.targetObjects.join(', ') : null),
                objectiveId: obj.id
            }));
        }

        // Rewards normalize
        const rawRew = raw.reward || raw.rewards || {};
        const rewards = {
            xp: rawRew.xp || raw.xpReward || 50,
            vocabulary: Array.isArray(rawRew.vocabulary) ? rawRew.vocabulary : (rawRew.vocabulary ? [rawRew.vocabulary] : []),
            grammar: Array.isArray(rawRew.grammar) ? rawRew.grammar : (rawRew.grammar ? [rawRew.grammar] : (raw.grammarUnlock ? [raw.grammarUnlock] : [])),
            gold: rawRew.gold || 0,
            items: Array.isArray(rawRew.items) ? rawRew.items : (rawRew.items ? [rawRew.items] : [])
        };

        // Dialogues normalize
        let dialogues = {
            start: 'A new quest awaits!',
            progress: 'Keep going!',
            complete: 'Quest completed! Well done!'
        };

        if (typeof raw.dialogues === 'string') {
            dialogues.start = raw.dialogues;
            dialogues.progress = raw.dialogues;
            dialogues.complete = raw.dialogues;
        } else if (raw.dialogues && typeof raw.dialogues === 'object') {
            dialogues = {
                start: raw.dialogues.start || dialogues.start,
                progress: raw.dialogues.progress || dialogues.progress,
                complete: raw.dialogues.complete || dialogues.complete
            };
        }

        // NPC Triggers normalize
        let npcTriggers = [];
        if (Array.isArray(raw.npcTriggers)) {
            npcTriggers = raw.npcTriggers.map(trig => ({
                npcId: trig.npcId || requirements.targetNpc,
                action: trig.action || 'talk',
                stepId: trig.stepId || null,
                objectiveId: trig.objectiveId || null
            }));
        } else if (requirements.targetNpc) {
            npcTriggers = [{
                npcId: requirements.targetNpc,
                action: requirements.action || 'talk',
                stepId: null,
                objectiveId: null
            }];
        }

        // Scene Triggers normalize
        let sceneTriggers = [];
        if (Array.isArray(raw.sceneTriggers)) {
            sceneTriggers = raw.sceneTriggers.map(trig => ({
                locationId: trig.locationId || requirements.targetLocation,
                hotspotId: trig.hotspotId || null,
                action: trig.action || 'enter',
                stepId: trig.stepId || null,
                objectiveId: trig.objectiveId || null
            }));
        } else if (requirements.targetLocation) {
            sceneTriggers = [{
                locationId: requirements.targetLocation,
                hotspotId: null,
                action: 'enter',
                stepId: null,
                objectiveId: null
            }];
        }

        return {
            id,
            category,
            type: rawType,
            title,
            description,
            difficulty,
            NPC: raw.NPC || requirements.targetNpc,
            requirements,
            unlockConditions: rawCond.level || rawCond.prerequisiteQuest ? rawCond : {
                level: requirements.level,
                prerequisiteQuest: requirements.prerequisiteQuest,
                discoveredObjects: requirements.discoveredObjects
            },
            steps,
            objectives,
            reward: rewards,
            rewards,
            dialogues,
            npcTriggers,
            sceneTriggers,
            nextQuestId: raw.nextQuestId || null
        };
    }

    /**
     * Get quest definition by ID.
     */
    getQuest(questId, gameData = null) {
        if (this.questsMap.has(questId)) {
            return this.questsMap.get(questId);
        }
        if (gameData && Array.isArray(gameData.quests)) {
            const found = gameData.quests.find(q => q.id === questId);
            if (found) return this.normalizeQuest(found);
        }
        return null;
    }

    /**
     * Get all quests matching a specific category.
     */
    getQuestsByCategory(category) {
        const normCategory = QuestEngine.normalizeCategory(category);
        return this.quests.filter(q => q.category === normCategory);
    }

    /**
     * Check if unlock conditions / requirements for a quest are satisfied.
     */
    checkUnlockConditions(quest, state) {
        if (!quest || !state) return true;
        const cond = quest.unlockConditions || quest.requirements || {};

        if (cond.level && (state.citizenLvl || 1) < cond.level) {
            return false;
        }

        if (cond.prerequisiteQuest) {
            const completed = state.completedQuests && (
                state.completedQuests.has ? state.completedQuests.has(cond.prerequisiteQuest) : state.completedQuests.includes(cond.prerequisiteQuest)
            );
            if (!completed) return false;
        }

        if (cond.discoveredObjects && Array.isArray(cond.discoveredObjects) && cond.discoveredObjects.length > 0) {
            const hasAll = cond.discoveredObjects.every(obj => state.discoveredObjects && (
                state.discoveredObjects.has ? state.discoveredObjects.has(obj) : state.discoveredObjects.includes(obj)
            ));
            if (!hasAll) return false;
        }

        return true;
    }

    /**
     * Get all currently available quests for player.
     */
    getAvailableQuests(state, gameData = null) {
        const questList = (this.quests.length > 0) ? this.quests : (gameData && gameData.quests ? gameData.quests.map(q => this.normalizeQuest(q)) : []);
        return questList.filter(q => {
            const isCompleted = state.completedQuests && (
                state.completedQuests.has ? state.completedQuests.has(q.id) : state.completedQuests.includes(q.id)
            );
            if (isCompleted) return false;
            return this.checkUnlockConditions(q, state);
        });
    }

    /**
     * Get active quests list.
     */
    getActiveQuests(state, gameData = null) {
        if (!state || !state.activeQuests) return [];
        const activeIds = state.activeQuests.has ? Array.from(state.activeQuests) : state.activeQuests;
        return activeIds.map(qid => this.getQuest(qid, gameData)).filter(Boolean);
    }

    /**
     * Start a quest.
     */
    startQuest(questId, state, gameData = null) {
        const quest = this.getQuest(questId, gameData);
        if (!quest) return false;

        if (!state.activeQuests) state.activeQuests = new Set();
        if (!state.completedQuests) state.completedQuests = new Set();
        if (!state.questProgress) state.questProgress = {};

        const isCompleted = state.completedQuests.has ? state.completedQuests.has(questId) : state.completedQuests.includes(questId);
        if (isCompleted) return false;

        if (state.activeQuests.add) {
            state.activeQuests.add(questId);
        } else if (!state.activeQuests.includes(questId)) {
            state.activeQuests.push(questId);
        }

        // Initialize progress state
        if (!state.questProgress[questId]) {
            state.questProgress[questId] = {
                questId,
                status: 'active',
                currentStepIndex: 0,
                completedSteps: [],
                completedObjectives: [],
                objectiveCounts: {},
                startTime: Date.now()
            };
        }

        if (quest.requirements && quest.requirements.timeLimitSeconds) {
            if (!state.timedQuests) state.timedQuests = {};
            state.timedQuests[questId] = {
                startTime: Date.now(),
                durationSeconds: quest.requirements.timeLimitSeconds,
                initialCount: state.discoveredObjects ? (state.discoveredObjects.size || state.discoveredObjects.length) : 0
            };
        }

        return true;
    }

    /**
     * Calculate detailed progress for a quest (0-100%, step status, objective breakdown).
     */
    getQuestProgress(questId, state) {
        const quest = this.getQuest(questId);
        if (!quest) {
            return { questId, percentage: 0, currentStep: 0, totalSteps: 0, completedSteps: 0, isComplete: false };
        }

        const isCompleted = state && state.completedQuests && (
            state.completedQuests.has ? state.completedQuests.has(questId) : state.completedQuests.includes(questId)
        );

        if (isCompleted) {
            return {
                questId,
                status: 'completed',
                percentage: 100,
                currentStepIndex: quest.steps.length,
                totalSteps: quest.steps.length,
                completedSteps: quest.steps.map(s => s.id),
                completedObjectives: quest.objectives.map(o => o.id),
                isComplete: true
            };
        }

        const prog = (state && state.questProgress && state.questProgress[questId]) || {
            currentStepIndex: 0,
            completedSteps: [],
            completedObjectives: [],
            objectiveCounts: {}
        };

        const totalObjectives = quest.objectives.length || 1;
        const completedObjCount = (prog.completedObjectives || []).length;
        const totalSteps = quest.steps.length || 1;
        const completedStepCount = (prog.completedSteps || []).length;

        let percentage = Math.round((completedObjCount / totalObjectives) * 100);
        if (percentage > 100) percentage = 100;

        return {
            questId,
            status: 'active',
            percentage,
            currentStepIndex: prog.currentStepIndex || 0,
            totalSteps,
            completedSteps: prog.completedSteps || [],
            completedObjectives: prog.completedObjectives || [],
            objectiveCounts: prog.objectiveCounts || {},
            isComplete: percentage >= 100
        };
    }

    /**
     * Trigger NPC interaction evaluation.
     */
    triggerNpc(npcId, action, state, gameData = null, completeFn = null) {
        return this.evaluateEvent('npc_interacted', { npcId, action }, state, gameData, completeFn);
    }

    /**
     * Trigger Scene / Hotspot interaction evaluation.
     */
    triggerScene(locationId, hotspotId, action, state, gameData = null, completeFn = null) {
        return this.evaluateEvent('scene_interacted', { locationId, hotspotId, action }, state, gameData, completeFn);
    }

    /**
     * Get quest dialogue text for start/progress/complete states.
     */
    getDialogue(questId, stage = 'start') {
        const quest = this.getQuest(questId);
        if (!quest || !quest.dialogues) return '';

        if (typeof quest.dialogues === 'string') return quest.dialogues;
        return quest.dialogues[stage] || quest.dialogues.start || '';
    }

    /**
     * Complete quest and grant all rewards (XP, vocabulary, grammar, gold, items).
     */
    completeQuest(questId, state, gameData = null, addXPFn = null, saveStateFn = null, renderHudFn = null, showToastFn = null, grammarEngine = null) {
        const quest = this.getQuest(questId, gameData);
        if (!quest || !state) return;

        if (!state.completedQuests) state.completedQuests = new Set();
        if (!state.activeQuests) state.activeQuests = new Set();

        const isCompleted = state.completedQuests.has ? state.completedQuests.has(questId) : state.completedQuests.includes(questId);
        if (isCompleted) return;

        if (state.completedQuests.add) {
            state.completedQuests.add(questId);
        } else if (!state.completedQuests.includes(questId)) {
            state.completedQuests.push(questId);
        }

        if (state.activeQuests.delete) {
            state.activeQuests.delete(questId);
        } else {
            const idx = state.activeQuests.indexOf(questId);
            if (idx !== -1) state.activeQuests.splice(idx, 1);
        }

        if (state.timedQuests && state.timedQuests[questId]) {
            delete state.timedQuests[questId];
        }

        // Update quest progress object to complete
        if (!state.questProgress) state.questProgress = {};
        state.questProgress[questId] = {
            questId,
            status: 'completed',
            completedSteps: quest.steps.map(s => s.id),
            completedObjectives: quest.objectives.map(o => o.id),
            completionTime: Date.now()
        };

        // 1. Rewards: XP
        const rewards = quest.rewards || quest.reward || {};
        const xpAmount = rewards.xp || quest.xpReward || 50;
        if (addXPFn) addXPFn(xpAmount);

        // 2. Rewards: Vocabulary
        if (rewards.vocabulary && Array.isArray(rewards.vocabulary)) {
            rewards.vocabulary.forEach(objId => {
                if (state.discoveredObjects) {
                    if (state.discoveredObjects.add) state.discoveredObjects.add(objId);
                    else if (!state.discoveredObjects.includes(objId)) state.discoveredObjects.push(objId);
                }
            });
        }

        // 3. Rewards: Grammar
        const grammarReward = rewards.grammar;
        if (grammarReward) {
            const gList = Array.isArray(grammarReward) ? grammarReward : [grammarReward];
            gList.forEach(g => {
                if (state.unlockedGrammar) {
                    if (state.unlockedGrammar.add) state.unlockedGrammar.add(g);
                    else if (!state.unlockedGrammar.includes(g)) state.unlockedGrammar.push(g);
                }
            });
        }

        // Evaluate grammar engine unlocks if available
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

        // 4. Progress Quest Chains automatically
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

        if (this.eventBus) {
            this.eventBus.emit('questCompleted', { questId, quest, rewards });
        }
    }

    /**
     * Core event evaluation for progress and completion across all quest categories.
     */
    evaluateEvent(eventType, payload = {}, state, gameData = null, completeQuestFn = null) {
        if (!state) return;

        // Auto-start available quests if activeQuests is empty or to ensure available quests are tracked
        const availableQuests = this.getAvailableQuests(state, gameData);
        availableQuests.forEach(q => this.startQuest(q.id, state, gameData));

        const activeList = state.activeQuests ? (state.activeQuests.has ? Array.from(state.activeQuests) : state.activeQuests) : [];

        activeList.forEach(qid => {
            const q = this.getQuest(qid, gameData);
            if (!q) return;

            const isCompleted = state.completedQuests && (
                state.completedQuests.has ? state.completedQuests.has(qid) : state.completedQuests.includes(qid)
            );
            if (isCompleted) return;

            const req = q.requirements || {};
            let isSatisfied = false;

            // Check category specific triggers & generic checks
            switch (q.category) {
                case 'exploration':
                case 'travel':
                    if (eventType === 'location_changed' || eventType === 'scene_interacted') {
                        if (payload.locationId === req.targetLocation || (req.targetLocation && payload.locationId === req.targetLocation)) {
                            isSatisfied = true;
                        }
                    }
                    break;

                case 'vocabulary':
                case 'photography':
                case 'cooking':
                case 'reading':
                    if (eventType === 'object_inspected' || eventType === 'scene_interacted' || eventType === 'item_cooked' || eventType === 'notice_read') {
                        if (req.targetObjects && Array.isArray(req.targetObjects) && req.targetObjects.length > 0) {
                            isSatisfied = req.targetObjects.every(objId => state.discoveredObjects && (
                                state.discoveredObjects.has ? state.discoveredObjects.has(objId) : state.discoveredObjects.includes(objId)
                            ));
                        } else if (payload.objId && req.targetObjects && req.targetObjects.includes(payload.objId)) {
                            isSatisfied = true;
                        }
                    }
                    break;

                case 'shopping':
                    if (eventType === 'item_purchased' || eventType === 'object_inspected') {
                        if (req.targetObjects && Array.isArray(req.targetObjects)) {
                            isSatisfied = req.targetObjects.every(objId => state.discoveredObjects && (
                                state.discoveredObjects.has ? state.discoveredObjects.has(objId) : state.discoveredObjects.includes(objId)
                            ));
                        }
                    }
                    break;

                case 'speaking':
                case 'listening':
                    if (eventType === 'npc_interacted' || eventType === 'speech_listened' || eventType === 'pronunciation_practiced' || eventType === 'object_inspected') {
                        if (req.targetNpc && payload.npcId === req.targetNpc) {
                            isSatisfied = true;
                        } else if (eventType === 'speech_listened' || (eventType === 'object_inspected' && req.targetObjects && req.targetObjects.includes(payload.objId))) {
                            isSatisfied = true;
                        }
                    }
                    break;

                case 'grammar':
                    if (eventType === 'exercise_completed' && req.exerciseId && state.completedExercises) {
                        const hasEx = state.completedExercises.has ? state.completedExercises.has(req.exerciseId) : state.completedExercises.includes(req.exerciseId);
                        if (hasEx) isSatisfied = true;
                    } else if (req.targetGrammarId && state.unlockedGrammar) {
                        const hasGrammar = state.unlockedGrammar.has ? state.unlockedGrammar.has(req.targetGrammarId) : state.unlockedGrammar.includes(req.targetGrammarId);
                        if (hasGrammar) isSatisfied = true;
                    }
                    break;

                default:
                    break;
            }

            // Check NPC triggers explicitly
            if (!isSatisfied && eventType === 'npc_interacted' && q.npcTriggers && q.npcTriggers.length > 0) {
                const matchNpc = q.npcTriggers.some(trig => trig.npcId === payload.npcId && (!trig.action || trig.action === payload.action || payload.action === 'talk'));
                if (matchNpc) isSatisfied = true;
            }

            // Check Scene triggers explicitly
            if (!isSatisfied && (eventType === 'scene_interacted' || eventType === 'location_changed') && q.sceneTriggers && q.sceneTriggers.length > 0) {
                const matchScene = q.sceneTriggers.some(trig => trig.locationId === payload.locationId && (!trig.hotspotId || trig.hotspotId === payload.hotspotId));
                if (matchScene) isSatisfied = true;
            }

            // Check Timed Challenge limits
            if (!isSatisfied && q.type === 'timed challenge') {
                if (req.targetCount && state.discoveredObjects) {
                    const count = state.discoveredObjects.size || state.discoveredObjects.length || 0;
                    if (count >= req.targetCount) {
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
            }

            // Check general targetCount requirement fallback
            if (!isSatisfied && req.targetCount && state.discoveredObjects) {
                const count = state.discoveredObjects.size || state.discoveredObjects.length || 0;
                if (count >= req.targetCount) {
                    isSatisfied = true;
                }
            }

            if (isSatisfied) {
                if (completeQuestFn) {
                    completeQuestFn(qid);
                } else {
                    this.completeQuest(qid, state, gameData);
                }
            }
        });
    }
}
