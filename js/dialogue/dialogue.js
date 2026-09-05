/**
 * @file js/dialogue/dialogue.js
 * @description Professional JSON-driven Dialogue Engine for COSY World.
 * Features:
 * - Standardized branching dialogue tree graphs loaded per-scene / per-NPC from JSON datasets
 * - Choice consequences (XP rewards, relationship/friendship changes, quest triggers)
 * - Voice speech playback with speed control (0.8x, 1.0x, 1.3x), slow toggle, and audio repeat
 * - Typing animation effect with configurable speed
 * - Emotion portraits (happy, excited, curious, busy, neutral)
 * - Future AI integration hook (`generateAIDialogue`)
 * - Dialogue history log array
 * - Multilingual support across target languages
 */

export class DialogueManager {
    static typingInterval = null;
    static currentPlaybackRate = 1.0;
    static currentDialogueText = '';
    static dialogueHistory = [];

    /**
     * Future AI integration hook for dynamic NPC response generation.
     * Can be extended to connect to an external LLM/AI dialogue service.
     *
     * @param {string} npcId
     * @param {string} userPrompt
     * @param {Object} context
     * @returns {Promise<Object>}
     */
    static async generateAIDialogue(npcId, userPrompt, context = {}) {
        return {
            text: `[AI NPC Response] That's fascinating! Let's continue exploring ${context.locationId || 'COSY Town'}.`,
            emotion: 'curious',
            options: [
                { label: '👍 Tell me more!', next: 0, rewardXP: 10 }
            ]
        };
    }

    /**
     * Open interactive dialogue session with an NPC.
     * Supports both sync and async per-scene dialogue tree loading.
     */
    static async interactNPC(npcId, state, gameData, openModalFn, nodeTarget = 0) {
        if (!gameData || !gameData.npcs) return;
        const npc = gameData.npcs[npcId];
        if (!npc) return;

        const sceneId = state ? state.currentLocationId : null;
        const treeKey = `${npcId}_${sceneId}`;

        if (!gameData.dialogueTrees) {
            gameData.dialogueTrees = {};
        }

        let dialogueTree = gameData.dialogueTrees[treeKey] || null;

        if (!dialogueTree && sceneId) {
            try {
                if (gameData.assetManager && typeof gameData.assetManager.loadJson === 'function') {
                    dialogueTree = await gameData.assetManager.loadJson(`data/dialogues/${npcId}_${sceneId}.json`).catch(() => null);
                } else if (typeof fetch !== 'undefined') {
                    const res = await fetch(`data/dialogues/${npcId}_${sceneId}.json`).catch(() => null);
                    if (res && res.ok) {
                        dialogueTree = await res.json().catch(() => null);
                    }
                }
                if (dialogueTree) {
                    gameData.dialogueTrees[treeKey] = dialogueTree;
                }
            } catch (err) {
                // Fallback gracefully to embedded NPC dialogues if file missing
            }
        }

        const npcAIEngine = typeof window !== 'undefined' && window.COSY_WORLD && window.COSY_WORLD.npcAIEngine;

        if (npcAIEngine) {
            npcAIEngine.recordConversation(npcId, 'Interacted with player', 10);
            state.npcRelationships[npcId] = npcAIEngine.getNPC(npcId)?.friendshipPoints || (state.npcRelationships[npcId] || 0) + 10;
        } else if (state && state.npcRelationships) {
            state.npcRelationships[npcId] = (state.npcRelationships[npcId] || 0) + 10;
        }

        const currentFP = (state && state.npcRelationships && state.npcRelationships[npcId]) || 0;
        const currentLvl = Math.floor(currentFP / 50) + 1;

        const lang = state ? (state.currentLang || 'en') : 'en';

        // Find dialogue node in per-scene tree or fallback to npc.dialogues
        let dlg = null;
        let nodes = [];

        if (dialogueTree && Array.isArray(dialogueTree.nodes)) {
            nodes = dialogueTree.nodes;
            if (typeof nodeTarget === 'string') {
                dlg = nodes.find(n => n.id === nodeTarget);
            }
            if (!dlg && (typeof nodeTarget === 'number' || !isNaN(nodeTarget))) {
                const idx = parseInt(nodeTarget, 10);
                dlg = nodes[idx];
            }
            if (!dlg) {
                dlg = nodes[0];
            }
        }

        if (!dlg) {
            const dialogues = (npc.dialogues && (npc.dialogues[lang] || npc.dialogues.en)) || [];
            if (typeof nodeTarget === 'string') {
                dlg = dialogues.find(n => n.id === nodeTarget || String(n.id) === nodeTarget);
            }
            if (!dlg && (typeof nodeTarget === 'number' || !isNaN(nodeTarget))) {
                const idx = parseInt(nodeTarget, 10);
                dlg = dialogues[idx];
            }
            if (!dlg) {
                dlg = dialogues[0] || { text: '👋 Hello!', options: [], emotion: 'happy' };
            }
        }

        const dlgText = dlg.npcLine || dlg.text || '👋 Hello!';
        const options = dlg.playerOptions || dlg.options || [];

        // Determine emotion portrait (happy, excited, curious, busy, neutral)
        const emotionPortraits = {
            happy: '😊',
            excited: '😄',
            curious: '🤔',
            busy: '💼',
            neutral: '😐'
        };
        const emotionKey = dlg.emotion || npc.currentMood;
        const emotionEmoji = npc.expressions?.[emotionKey] || emotionPortraits[emotionKey] || npc.portrait || npc.avatar || '👤';

        // Determine AI reaction greeting if at root node
        const isRoot = (nodeTarget === 0 || nodeTarget === 'node_0' || nodeTarget === (nodes[0]?.id));
        const aiReaction = (isRoot && npcAIEngine) ? npcAIEngine.getReactionToPlayer(npcId, state) : null;
        const dialogueText = (isRoot && aiReaction) ? `${aiReaction.greeting} ${dlgText}` : dlgText;

        this.currentDialogueText = dialogueText;

        // Record dialogue history
        this.dialogueHistory.push({
            npcName: npc.name,
            text: dialogueText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Auto-speak text using Web Speech API TTS
        this.speakText(dlgText, lang, dlg.speechRate || this.currentPlaybackRate);

        const body = typeof document !== 'undefined' ? document.getElementById('cw-modal-body') : null;
        if (body) {
            body.innerHTML = `
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                    <div class="cw-portrait-bounce" style="font-size:3rem; background:var(--bg-app); padding:0.5rem; border-radius:50%; border:2px solid var(--border-subtle);">
                        ${emotionEmoji} ${npc.portrait || npc.avatar}
                    </div>
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <h2 style="font-family:'Fraunces',serif; font-size:1.5rem; color:var(--text-main); margin:0;">${npc.name}</h2>
                            <span style="font-size:0.8rem; background:#fef3c7; color:#b45309; padding:0.25rem 0.6rem; border-radius:12px; font-weight:700;">
                                ❤️ Level ${currentLvl} (${currentFP} FP)
                            </span>
                        </div>
                        <div style="font-size:0.85rem; color:var(--accent-teal); font-weight:700; margin-top:0.2rem;">${npc.role || npc.occupation}</div>
                        ${npc.teachingRole ? `<div style="font-size:0.8rem; color:var(--text-muted);">🎓 ${npc.teachingRole}</div>` : ''}
                    </div>
                </div>

                <!-- Speech Voice & Controls Bar -->
                <div class="cw-speech-controls" style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-app); padding:0.5rem 0.75rem; border-radius:12px; margin-bottom:0.75rem; font-size:0.85rem; border:1px solid var(--border-subtle);">
                    <div style="display:flex; gap:0.4rem; align-items:center;">
                        <button class="cw-btn-toggle" style="padding:0.2rem 0.6rem; font-size:0.8rem;" type="button" onclick="COSY_WORLD.repeatSpeech()">🔊 Repeat</button>
                        <button class="cw-btn-toggle" style="padding:0.2rem 0.6rem; font-size:0.8rem;" type="button" onclick="COSY_WORLD.toggleSlowSpeech()">🐢 Slow (0.7x)</button>
                    </div>
                    <div style="display:flex; gap:0.3rem; align-items:center;">
                        <span style="font-weight:700;">Speed:</span>
                        <button class="cw-btn-toggle" style="padding:0.2rem 0.5rem; font-size:0.75rem;" type="button" onclick="COSY_WORLD.setSpeechSpeed(0.8)">0.8x</button>
                        <button class="cw-btn-toggle" style="padding:0.2rem 0.5rem; font-size:0.75rem;" type="button" onclick="COSY_WORLD.setSpeechSpeed(1.0)">1.0x</button>
                        <button class="cw-btn-toggle" style="padding:0.2rem 0.5rem; font-size:0.75rem;" type="button" onclick="COSY_WORLD.setSpeechSpeed(1.3)">1.3x</button>
                    </div>
                </div>

                <!-- Typing Animation Text Container -->
                <div class="cw-item-card" style="font-size:1.15rem; font-weight:600; line-height:1.5; color:var(--text-main); margin-bottom:1rem; min-height:60px;">
                    <span id="cw-typing-box"></span><span class="cw-typing-cursor">|</span>
                </div>

                ${dlg.grammarCheck ? `
                    <div style="font-size:0.85rem; background:#eff6ff; color:#1e40af; padding:0.5rem 0.75rem; border-radius:10px; margin-bottom:0.75rem; border:1px solid #bfdbfe;">
                        🧩 Grammar Rule: <strong>${dlg.grammarCheck}</strong>
                    </div>
                ` : ''}

                ${dlg.visualAction ? `
                    <div style="text-align:center; font-size:1.5rem; margin-bottom:1rem; padding:0.5rem; background:#f0fdf4; border-radius:12px; border:1px solid #10b981;">
                        ${dlg.visualAction}
                    </div>
                ` : ''}

                <div id="cw-dialogue-options" style="display:none;">
                    ${options ? options.map(opt => {
                        const targetNext = opt.nextNodeId !== undefined ? opt.nextNodeId : (opt.next !== undefined ? opt.next : -1);
                        const questId = opt.rewardQuestId || opt.questId || '';
                        const nextArg = typeof targetNext === 'string' ? `'${targetNext}'` : targetNext;
                        const label = opt.text || opt.label || '';
                        return `
                        <button class="btn-g-primary" type="button" style="width:100%; margin-bottom:0.5rem; font-size:1.05rem;" onclick="COSY_WORLD.handleBranchNode('${npcId}', ${nextArg}, '${questId}', ${opt.rewardXP || 0}, ${opt.friendshipGain || 0})">
                            ${label} ${opt.rewardXP ? `(+${opt.rewardXP} XP ⭐)` : ''} ${opt.friendshipGain ? `(+${opt.friendshipGain} ❤️)` : ''}
                        </button>
                    `}).join('') : ''}

                    <button class="cw-btn-toggle" style="width:100%; margin-top:0.5rem; font-size:0.85rem;" type="button" onclick="COSY_WORLD.toggleDialogueHistory()">📜 View Dialogue History Log</button>
                    <button class="cw-btn-toggle" style="width:100%; margin-top:0.4rem; font-size:0.85rem;" type="button" onclick="COSY_WORLD.startVoiceRecognition()">🎙️ Practice Voice Input (Speech Rec)</button>
                </div>

                <div id="cw-dialogue-history-panel" style="display:none; margin-top:1rem; max-height:160px; overflow-y:auto; background:var(--bg-app); padding:0.75rem; border-radius:12px; border:1px solid var(--border-subtle); font-size:0.85rem;">
                    <div style="font-weight:700; margin-bottom:0.5rem;">📜 Conversation History</div>
                    ${this.dialogueHistory.map(h => `
                        <div style="margin-bottom:0.4rem; border-bottom:1px solid #e5e7eb; padding-bottom:0.25rem;">
                            <span style="font-weight:700; color:var(--accent-teal);">${h.npcName}:</span> "${h.text}" <span style="font-size:0.75rem; color:var(--text-muted);">(${h.timestamp})</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.typeText(dlgText);

        if (openModalFn) openModalFn();
    }

    /**
     * Handle choice consequences (XP, friendship gains, quest completions, branching nodes).
     */
    static handleBranchNode(npcId, nextNode, questId, rewardXP, friendshipGain = 0, engine = null) {
        if (!engine && typeof window !== 'undefined' && window.COSY_WORLD) {
            engine = window.COSY_WORLD.engine || window.COSY_WORLD;
        }

        if (rewardXP > 0 && engine && typeof engine.addXP === 'function') {
            engine.addXP(rewardXP);
        }

        if (friendshipGain > 0 && engine && engine.state) {
            engine.state.npcRelationships[npcId] = (engine.state.npcRelationships[npcId] || 0) + friendshipGain;
            if (engine.npcAIEngine) {
                const npc = engine.npcAIEngine.getNPC(npcId);
                if (npc) npc.friendshipPoints += friendshipGain;
            }
        }

        if (questId && engine && typeof engine.completeQuest === 'function') {
            engine.completeQuest(questId);
        }

        if (nextNode !== null && nextNode !== undefined && nextNode !== -1 && engine) {
            this.interactNPC(npcId, engine.state, engine.data, () => engine.openModal(), nextNode);
        } else if (engine && typeof engine.closeModal === 'function') {
            engine.closeModal();
        }
    }

    static typeText(fullText) {
        if (this.typingInterval) clearInterval(this.typingInterval);
        if (typeof document === 'undefined') return;
        const box = document.getElementById('cw-typing-box');
        const opts = document.getElementById('cw-dialogue-options');
        if (!box) return;

        box.textContent = '';
        let index = 0;

        this.typingInterval = setInterval(() => {
            if (index < fullText.length) {
                box.textContent += fullText.charAt(index);
                index++;
            } else {
                clearInterval(this.typingInterval);
                if (opts) opts.style.display = 'block';
            }
        }, 30);
    }

    static speakText(text, lang, rate = 1.0) {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const langCodes = { en: 'en-US', fr: 'fr-FR', it: 'it-IT', es: 'es-ES', de: 'de-DE', ru: 'ru-RU', el: 'el-GR' };
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCodes[lang] || 'en-US';
        utterance.rate = rate;
        window.speechSynthesis.speak(utterance);
    }

    static repeatSpeech(lang = 'en') {
        if (this.currentDialogueText) {
            this.speakText(this.currentDialogueText, lang, this.currentPlaybackRate);
        }
    }

    static toggleSlowSpeech(lang = 'en') {
        this.currentPlaybackRate = this.currentPlaybackRate === 0.7 ? 1.0 : 0.7;
        this.repeatSpeech(lang);
    }

    static setSpeechSpeed(speed, lang = 'en') {
        this.currentPlaybackRate = speed;
        this.repeatSpeech(lang);
    }

    static toggleDialogueHistory() {
        const panel = document.getElementById('cw-dialogue-history-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    static startVoiceRecognition() {
        if (typeof window === 'undefined') return;
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            alert('Voice recognition speech input requires a Web Speech API compatible browser.');
            return;
        }

        const recognition = new SpeechRec();
        recognition.lang = 'en-US';
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            alert(`🎙️ Speech Recognized: "${transcript}"! Great pronunciation effort! ⭐`);
        };
    }
}
