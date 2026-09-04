/**
 * COSYworld/js/minigames/minigame_framework.js
 * Reusable Minigame Framework & Independent Game Engine.
 * Supports 10 Minigame Types: Scene Match, Memory, Word Search, Pronunciation,
 * Listening, Dialogue, Crossword, Object Hunt, Drag & Drop, Sentence Builder.
 * Communicates with main GameEngine & automatically synchronizes progress, XP, and quests.
 */

export class BaseMinigame {
    constructor(config = {}) {
        this.id = config.id || `mg_${Math.random().toString(36).substring(2, 9)}`;
        this.type = config.type || 'memory';
        this.title = config.title || 'Untitled Minigame';
        this.description = config.description || '';
        this.difficulty = config.difficulty || 'A0';
        this.reward = config.reward || { xp: 50 };
        this.content = config.content || {};
        this.state = 'idle'; // idle, active, completed, failed
    }

    init() {
        this.state = 'active';
    }

    evaluate(userAnswer) {
        return { success: true, score: 100 };
    }

    reset() {
        this.state = 'idle';
    }
}

export class MinigameFramework {
    constructor(options = {}) {
        this.gameEngine = options.gameEngine || null;
        this.eventBus = options.eventBus || null;
        this.minigamesMap = new Map();
        this.minigames = [];
        this.activeMinigame = null;
    }

    /**
     * Register a single minigame definition object.
     */
    registerMinigame(minigameDef) {
        if (!minigameDef || !minigameDef.id) return;
        const normalized = {
            id: minigameDef.id,
            type: minigameDef.type || 'memory',
            title: minigameDef.title || 'Language Challenge',
            description: minigameDef.description || '',
            difficulty: minigameDef.difficulty || 'A0',
            reward: minigameDef.reward || { xp: 50 },
            content: minigameDef.content || {}
        };
        this.minigamesMap.set(normalized.id, normalized);
        this.minigames.push(normalized);
    }

    /**
     * Bulk register minigames from JSON array or object.
     */
    loadMinigamesFromJson(jsonData) {
        const list = Array.isArray(jsonData) ? jsonData : (jsonData && jsonData.minigames ? jsonData.minigames : []);
        this.minigamesMap.clear();
        this.minigames = [];
        list.forEach(mg => this.registerMinigame(mg));
        return this.minigames;
    }

    /**
     * Get minigame definition by ID.
     */
    getMinigame(minigameId) {
        return this.minigamesMap.get(minigameId) || null;
    }

    /**
     * Get minigames matching a specific type.
     */
    getMinigamesByType(type) {
        return this.minigames.filter(mg => mg.type === type);
    }

    /**
     * Launch an independent minigame instance.
     */
    launchMinigame(minigameId, state, gameData) {
        const mg = this.getMinigame(minigameId);
        if (!mg) return null;

        this.activeMinigame = {
            ...mg,
            startTime: Date.now(),
            status: 'active'
        };

        if (this.eventBus) {
            this.eventBus.emit('minigameStarted', { minigameId, minigame: mg });
        }

        return this.activeMinigame;
    }

    /**
     * Evaluate minigame completion and auto-synchronize progress with main engine.
     */
    evaluateMinigame(minigameId, userAnswer, state, gameData) {
        const mg = this.getMinigame(minigameId);
        if (!mg) return { success: false, explanation: 'Minigame not found.' };

        let isCorrect = false;
        let score = 0;
        let explanation = 'Well done!';

        switch (mg.type) {
            case 'scene_match':
                if (userAnswer && mg.content.correctMatch) {
                    isCorrect = String(userAnswer).toLowerCase() === String(mg.content.correctMatch).toLowerCase();
                } else {
                    isCorrect = true;
                }
                explanation = isCorrect ? 'Match correct!' : 'Scene match incorrect.';
                break;

            case 'memory':
                if (Array.isArray(userAnswer)) {
                    isCorrect = userAnswer.length >= (mg.content.pairsCount || 3);
                } else {
                    isCorrect = Boolean(userAnswer);
                }
                explanation = isCorrect ? 'Memory cards matched!' : 'Try matching all pairs.';
                break;

            case 'word_search':
                if (Array.isArray(userAnswer)) {
                    const reqWords = mg.content.words || [];
                    isCorrect = reqWords.every(w => userAnswer.includes(w));
                } else {
                    isCorrect = Boolean(userAnswer);
                }
                explanation = isCorrect ? 'All hidden words found!' : 'Find all hidden vocabulary words.';
                break;

            case 'pronunciation':
                isCorrect = Boolean(userAnswer);
                explanation = isCorrect ? 'Clear speech pronunciation!' : 'Practice saying the phrase aloud.';
                break;

            case 'listening':
                if (userAnswer !== undefined && mg.content.correctOption !== undefined) {
                    isCorrect = Number(userAnswer) === Number(mg.content.correctOption);
                } else {
                    isCorrect = Boolean(userAnswer);
                }
                explanation = isCorrect ? 'Listening comprehension correct!' : 'Listen carefully to the audio sample.';
                break;

            case 'dialogue':
                if (userAnswer !== undefined && mg.content.targetChoice !== undefined) {
                    isCorrect = Number(userAnswer) === Number(mg.content.targetChoice);
                } else {
                    isCorrect = Boolean(userAnswer);
                }
                explanation = isCorrect ? 'Great dialogue response!' : 'Choose the polite conversational option.';
                break;

            case 'crossword':
                if (typeof userAnswer === 'object' && mg.content.answers) {
                    isCorrect = Object.keys(mg.content.answers).every(k => (userAnswer[k] || '').toLowerCase() === mg.content.answers[k].toLowerCase());
                } else {
                    isCorrect = Boolean(userAnswer);
                }
                explanation = isCorrect ? 'Crossword solved!' : 'Fill in all crossword words correctly.';
                break;

            case 'object_hunt':
                if (Array.isArray(userAnswer)) {
                    const req = mg.content.targetObjects || [];
                    isCorrect = req.every(obj => userAnswer.includes(obj));
                } else {
                    isCorrect = Boolean(userAnswer);
                }
                explanation = isCorrect ? 'All hidden objects discovered!' : 'Find all hunt objects before time expires.';
                break;

            case 'drag_drop':
                if (typeof userAnswer === 'object' && mg.content.matches) {
                    isCorrect = Object.keys(mg.content.matches).every(k => userAnswer[k] === mg.content.matches[k]);
                } else {
                    isCorrect = Boolean(userAnswer);
                }
                explanation = isCorrect ? 'All items dragged to matching targets!' : 'Place items in correct drop zones.';
                break;

            case 'sentence_builder':
                if (Array.isArray(userAnswer) && Array.isArray(mg.content.correctOrder)) {
                    isCorrect = userAnswer.join(' ').toLowerCase() === mg.content.correctOrder.join(' ').toLowerCase();
                } else if (typeof userAnswer === 'string' && Array.isArray(mg.content.correctOrder)) {
                    isCorrect = userAnswer.trim().toLowerCase() === mg.content.correctOrder.join(' ').toLowerCase();
                } else {
                    isCorrect = Boolean(userAnswer);
                }
                explanation = isCorrect ? 'Grammatically correct sentence built!' : 'Reorder words into a proper sentence.';
                break;

            default:
                isCorrect = Boolean(userAnswer);
                break;
        }

        score = isCorrect ? 100 : 0;

        if (isCorrect) {
            this.autoSyncProgress(minigameId, { score, explanation }, state, gameData);
        }

        return {
            success: isCorrect,
            score,
            explanation,
            reward: mg.reward
        };
    }

    /**
     * Auto-synchronize minigame results back to GameEngine, QuestEngine, and SaveManager.
     */
    autoSyncProgress(minigameId, result, state, gameData) {
        const mg = this.getMinigame(minigameId);
        if (!mg || !state) return;

        // Track completed minigames
        if (!state.completedMinigames) {
            state.completedMinigames = new Set();
        }
        if (state.completedMinigames.add) {
            state.completedMinigames.add(minigameId);
        } else if (!state.completedMinigames.includes(minigameId)) {
            state.completedMinigames.push(minigameId);
        }

        // 1. Auto-sync XP reward
        const xpAmount = (mg.reward && mg.reward.xp) ? mg.reward.xp : 50;
        if (this.gameEngine && this.gameEngine.addXP) {
            this.gameEngine.addXP(xpAmount);
        } else if (state.xp !== undefined) {
            state.xp += xpAmount;
        }

        // 2. Auto-sync vocabulary rewards
        if (mg.reward && mg.reward.vocabulary && Array.isArray(mg.reward.vocabulary)) {
            mg.reward.vocabulary.forEach(objId => {
                if (state.discoveredObjects) {
                    if (state.discoveredObjects.add) state.discoveredObjects.add(objId);
                    else if (!state.discoveredObjects.includes(objId)) state.discoveredObjects.push(objId);
                }
            });
        }

        // 3. Auto-sync grammar unlocks
        if (mg.reward && mg.reward.grammar) {
            const gList = Array.isArray(mg.reward.grammar) ? mg.reward.grammar : [mg.reward.grammar];
            gList.forEach(g => {
                if (state.unlockedGrammar) {
                    if (state.unlockedGrammar.add) state.unlockedGrammar.add(g);
                    else if (!state.unlockedGrammar.includes(g)) state.unlockedGrammar.push(g);
                }
            });
        }

        // 4. Auto-trigger Quest Engine evaluations
        if (this.gameEngine && this.gameEngine.checkQuests) {
            this.gameEngine.checkQuests('exercise_completed', { exerciseId: minigameId });
            this.gameEngine.checkQuests('minigame_completed', { minigameId, type: mg.type });
        }

        // 5. Auto-save state
        if (this.gameEngine && this.gameEngine.saveState) {
            this.gameEngine.saveState();
        }

        if (this.eventBus) {
            this.eventBus.emit('minigameCompleted', { minigameId, minigame: mg, result });
        }
    }

    /**
     * Render HTML launcher view for selecting and playing minigames.
     */
    renderLauncherHtml(state, gameData) {
        if (!this.minigames || this.minigames.length === 0) {
            return `<div style="padding:2rem; text-align:center; color:var(--text-muted);">No minigames registered.</div>`;
        }

        const completedSet = state ? (state.completedMinigames || new Set()) : new Set();

        return `
            <div class="cw-minigame-launcher">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
                    <div>
                        <div style="font-size:0.85rem; font-weight:700; color:var(--blue-primary); text-transform:uppercase;">
                            🎮 Interactive Minigames
                        </div>
                        <h2 style="font-family:'Fraunces',serif; font-size:1.4rem; color:var(--text-main); margin:0;">
                            Practice & Master Languages
                        </h2>
                    </div>
                    <span style="font-size:0.85rem; background:var(--blue-light); color:var(--blue-primary); padding:0.35rem 0.75rem; border-radius:12px; font-weight:700;">
                        ${this.minigames.length} Games Available
                    </span>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:1rem;">
                    ${this.minigames.map(mg => {
                        const isDone = completedSet.has ? completedSet.has(mg.id) : completedSet.includes(mg.id);
                        return `
                            <div class="cw-item-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-weight:700; color:var(--text-main);">${mg.title}</span>
                                        <span style="font-size:0.75rem; background:${isDone ? '#d1fae5' : '#fef3c7'}; color:${isDone ? '#065f46' : '#92400e'}; padding:0.15rem 0.45rem; border-radius:8px; font-weight:700;">
                                            ${isDone ? '✅ Complete' : '⭐ ' + mg.difficulty}
                                        </span>
                                    </div>
                                    <div style="font-size:0.82rem; color:var(--text-muted); margin-top:0.4rem;">
                                        ${mg.description}
                                    </div>
                                </div>

                                <div style="margin-top:1rem; display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:0.75rem; font-weight:700; color:var(--blue-primary);">+${mg.reward ? mg.reward.xp : 50} XP</span>
                                    <button type="button" class="btn-g-primary" style="padding:0.3rem 0.75rem; font-size:0.8rem;" onclick="COSY_WORLD.launchMinigameUI('${mg.id}')">
                                        Play 🎮
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
}
