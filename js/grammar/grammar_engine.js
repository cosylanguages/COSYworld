/**
 * COSYworld/js/grammar/grammar_engine.js
 * Grammar Engine - Modular Inductive Grammar System.
 * Connects grammar acquisition directly to gameplay, quests, scene integration, audio voice synthesis, and interactive exercises.
 */

export class GrammarEngine {
    constructor(gameEngine = null) {
        this.gameEngine = gameEngine;
    }

    /**
     * Check unlock requirements for all grammar points against current player state.
     * @param {Object} state - Player save state.
     * @param {Object} gameData - Global game data containing grammarTree & quests.
     * @param {Function} onUnlockCallback - Optional callback when a new grammar point is unlocked.
     * @returns {Array} List of newly unlocked grammar points.
     */
    checkGrammarUnlocks(state, gameData, onUnlockCallback = null) {
        if (!gameData || !gameData.grammarTree || !state) return [];

        if (!state.unlockedGrammar) {
            state.unlockedGrammar = new Set(['gt_greetings']);
        }

        const newlyUnlocked = [];

        gameData.grammarTree.forEach(gp => {
            if (state.unlockedGrammar.has(gp.id)) return;

            const reqs = gp.unlockRequirements;
            if (!reqs) return;

            // Check level requirement
            if (reqs.level && state.citizenLvl < reqs.level) return;

            // Check completed quests requirement
            if (reqs.quests && Array.isArray(reqs.quests)) {
                const questsMet = reqs.quests.every(qid => state.completedQuests.has(qid));
                if (!questsMet) return;
            }

            // Check discovered objects requirement
            if (reqs.discoveredObjects && Array.isArray(reqs.discoveredObjects)) {
                const objsMet = reqs.discoveredObjects.every(objId => state.discoveredObjects.has(objId));
                if (!objsMet) return;
            }

            // Requirements met! Unlock grammar point.
            state.unlockedGrammar.add(gp.id);
            newlyUnlocked.push(gp);

            if (onUnlockCallback) {
                onUnlockCallback(gp);
            }
        });

        return newlyUnlocked;
    }

    /**
     * Finds interactive exercise by ID across all grammar points.
     */
    findExercise(exerciseId, gameData) {
        if (!gameData || !gameData.grammarTree) return null;
        for (const gp of gameData.grammarTree) {
            if (!gp.interactiveExercises) continue;
            const ex = gp.interactiveExercises.find(e => e.id === exerciseId);
            if (ex) return { exercise: ex, grammarPoint: gp };
        }
        return null;
    }

    /**
     * Evaluate an interactive exercise submission.
     */
    evaluateExercise(exerciseId, userAnswer, state, gameData) {
        const found = this.findExercise(exerciseId, gameData);
        if (!found) return { success: false, explanation: 'Exercise not found.' };

        const { exercise, grammarPoint } = found;

        if (!state.completedExercises) {
            state.completedExercises = new Set();
        }

        let isCorrect = false;

        if (exercise.type === 'multiple_choice') {
            isCorrect = Number(userAnswer) === exercise.correct;
        } else if (exercise.type === 'word_order') {
            if (Array.isArray(userAnswer) && Array.isArray(exercise.correctOrder)) {
                isCorrect = userAnswer.join(' ').toLowerCase() === exercise.correctOrder.join(' ').toLowerCase();
            } else if (typeof userAnswer === 'string') {
                isCorrect = userAnswer.trim().toLowerCase() === exercise.correctOrder.join(' ').toLowerCase();
            }
        }

        if (isCorrect) {
            const isFirstTime = !state.completedExercises.has(exerciseId);
            state.completedExercises.add(exerciseId);

            const xpReward = isFirstTime ? (exercise.xpReward || 25) : 10;
            if (this.gameEngine && this.gameEngine.addXP) {
                this.gameEngine.addXP(xpReward);
            }

            return {
                success: true,
                isFirstTime,
                xpReward,
                explanation: exercise.explanation,
                grammarTitle: grammarPoint.title
            };
        } else {
            return {
                success: false,
                explanation: exercise.explanation,
                grammarTitle: grammarPoint.title
            };
        }
    }

    /**
     * Speak example or exercise text using Web Speech Synthesis.
     */
    speakExample(text, lang = 'en', voiceConfig = {}) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const langCodes = {
            en: 'en-US', fr: 'fr-FR', it: 'it-IT', es: 'es-ES', de: 'de-DE',
            ru: 'ru-RU', el: 'el-GR', pt: 'pt-PT', hy: 'hy-AM', ka: 'ka-GE'
        };

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCodes[lang] || 'en-US';
        utterance.rate = voiceConfig.rate || 1.0;
        utterance.pitch = voiceConfig.pitch || 1.0;

        window.speechSynthesis.speak(utterance);
    }

    /**
     * Query grammar points integrated with a specific location / district.
     */
    getGrammarForScene(locationId, gameData) {
        if (!gameData || !gameData.grammarTree) return [];
        return gameData.grammarTree.filter(gp => gp.sceneIntegration && gp.sceneIntegration.locationId === locationId);
    }

    /**
     * Query grammar points integrated with an NPC.
     */
    getGrammarForNPC(npcId, gameData) {
        if (!gameData || !gameData.grammarTree) return [];
        return gameData.grammarTree.filter(gp =>
            gp.sceneIntegration && gp.sceneIntegration.npcs && gp.sceneIntegration.npcs.includes(npcId)
        );
    }

    /**
     * Query grammar points integrated with a hotspot object.
     */
    getGrammarForObject(objId, gameData) {
        if (!gameData || !gameData.grammarTree) return [];
        return gameData.grammarTree.filter(gp =>
            gp.sceneIntegration && gp.sceneIntegration.objects && gp.sceneIntegration.objects.includes(objId)
        );
    }
}
