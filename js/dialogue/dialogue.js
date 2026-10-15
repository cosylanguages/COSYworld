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
    static currentLanguage = 'en';
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
        this.currentLanguage = lang;

        // Keep learner-facing controls in the selected dialogue language. For
        // unsupported languages, use icon-only labels rather than English text.
        const controlLabels = {
            en: { repeat: 'Repeat', slow: 'Slow', speed: 'Speed', grammar: 'Grammar Rule', history: 'View Dialogue History Log', voice: 'Practice Voice Input (Speech Rec)', historyTitle: 'Conversation History', voiceUnavailable: 'Voice recognition requires a compatible browser.', voiceRecognized: 'Speech recognized:' },
            fr: { repeat: 'Répéter', slow: 'Lent', speed: 'Vitesse', grammar: 'Règle de grammaire', history: 'Voir l’historique du dialogue', voice: 'Pratiquer la reconnaissance vocale', historyTitle: 'Historique de la conversation', voiceUnavailable: 'La reconnaissance vocale nécessite un navigateur compatible.', voiceRecognized: 'Parole reconnue :' },
            it: { repeat: 'Ripeti', slow: 'Lento', speed: 'Velocità', grammar: 'Regola grammaticale', history: 'Visualizza cronologia del dialogo', voice: 'Esercita il riconoscimento vocale', historyTitle: 'Cronologia della conversazione', voiceUnavailable: 'Il riconoscimento vocale richiede un browser compatibile.', voiceRecognized: 'Discorso riconosciuto:' },
            es: { repeat: 'Repetir', slow: 'Lento', speed: 'Velocidad', grammar: 'Regla gramatical', history: 'Ver historial del diálogo', voice: 'Practicar reconocimiento de voz', historyTitle: 'Historial de conversación', voiceUnavailable: 'El reconocimiento de voz requiere un navegador compatible.', voiceRecognized: 'Habla reconocida:' },
            de: { repeat: 'Wiederholen', slow: 'Langsam', speed: 'Geschwindigkeit', grammar: 'Grammatikregel', history: 'Dialogverlauf anzeigen', voice: 'Spracheingabe üben', historyTitle: 'Gesprächsverlauf', voiceUnavailable: 'Die Spracherkennung erfordert einen kompatiblen Browser.', voiceRecognized: 'Sprache erkannt:' },
            ru: { repeat: 'Повторить', slow: 'Медленно', speed: 'Скорость', grammar: 'Правило грамматики', history: 'История диалога', voice: 'Практика распознавания речи', historyTitle: 'История разговора', voiceUnavailable: 'Для распознавания речи нужен совместимый браузер.', voiceRecognized: 'Речь распознана:' },
            el: { repeat: 'Επανάληψη', slow: 'Αργά', speed: 'Ταχύτητα', grammar: 'Γραμματικός κανόνας', history: 'Ιστορικό διαλόγου', voice: 'Εξάσκηση φωνητικής εισόδου', historyTitle: 'Ιστορικό συνομιλίας', voiceUnavailable: 'Η αναγνώριση ομιλίας απαιτεί συμβατό πρόγραμμα περιήγησης.', voiceRecognized: 'Αναγνωρισμένη ομιλία:' },
            pt: { repeat: 'Repetir', slow: 'Lento', speed: 'Velocidade', grammar: 'Regra gramatical', history: 'Ver histórico do diálogo', voice: 'Praticar reconhecimento de voz', historyTitle: 'Histórico da conversa', voiceUnavailable: 'O reconhecimento de voz requer um navegador compatível.', voiceRecognized: 'Fala reconhecida:' }
        };
        const labels = controlLabels[lang] || { repeat: '🔊', slow: '🐢', speed: '⏩', grammar: '🧩', history: '📜', voice: '🎙️', historyTitle: '📜', voiceUnavailable: '⚠️', voiceRecognized: '🎙️' };

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
            // Dialogue trees may be target-language specific; never substitute English
            // NPC dialogue when the requested language has no matching entry.
            const dialogues = (npc.dialogues && Array.isArray(npc.dialogues[lang]))
                ? npc.dialogues[lang]
                : [];
            if (typeof nodeTarget === 'string') {
                dlg = dialogues.find(n => n.id === nodeTarget || String(n.id) === nodeTarget);
            }
            if (!dlg && (typeof nodeTarget === 'number' || !isNaN(nodeTarget))) {
                const idx = parseInt(nodeTarget, 10);
                dlg = dialogues[idx];
            }
            if (!dlg && dialogues.length > 0) {
                dlg = dialogues[0];
            }
        }

        if (!dlg || !(dlg.npcLine || dlg.text)) {
            const unavailableMessages = {
                en: 'Dialogue is not available in this language yet.',
                fr: 'Le dialogue n’est pas encore disponible dans cette langue.',
                it: 'Il dialogo non è ancora disponibile in questa lingua.',
                es: 'El diálogo todavía no está disponible en este idioma.',
                de: 'Der Dialog ist in dieser Sprache noch nicht verfügbar.',
                ru: 'Диалог пока недоступен на этом языке.',
                el: 'Ο διάλογος δεν είναι ακόμη διαθέσιμος σε αυτή τη γλώσσα.',
                pt: 'O diálogo ainda não está disponível neste idioma.',
                hy: 'Երկխոսությունն այս լեզվով դեռ հասանելի չէ։',
                ka: 'დიალოგი ამ ენაზე ჯერ ხელმისაწვდომი არ არის.',
                br: 'Ar c’henel a zo dihegerz c’hoazh er yezh-mañ.',
                tt: 'Бу телдә диалог әлегә юк.',
                ba: 'Был телдә диалог әлегә юҡ.',
                cv: 'Куҫҫӑн калаҫу кунта халӑха ҫук.'
            };
            this.currentDialogueText = '';
            const body = typeof document !== 'undefined' ? document.getElementById('cw-modal-body') : null;
            if (body) {
                const message = unavailableMessages[lang] || '⚠️';
                body.textContent = message;
            }
            if (openModalFn) openModalFn();
            return;
        }

        const dlgText = dlg.npcLine || dlg.text;
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
        // AI greetings are currently generated in English; omit them from target-language
        // dialogue until the generator can return verified localized content.
        const dialogueText = dlgText;

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
                        <button class="cw-btn-toggle" style="padding:0.2rem 0.6rem; font-size:0.8rem;" type="button" onclick="COSY_WORLD.repeatSpeech()">🔊 ${labels.repeat}</button>
                        <button class="cw-btn-toggle" style="padding:0.2rem 0.6rem; font-size:0.8rem;" type="button" onclick="COSY_WORLD.toggleSlowSpeech()">🐢 ${labels.slow} (0.7x)</button>
                    </div>
                    <div style="display:flex; gap:0.3rem; align-items:center;">
                        <span style="font-weight:700;">${labels.speed}:</span>
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
                        ${labels.grammar}: <strong>${dlg.grammarCheck}</strong>
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

                    <button class="cw-btn-toggle" style="width:100%; margin-top:0.5rem; font-size:0.85rem;" type="button" onclick="COSY_WORLD.toggleDialogueHistory()">📜 ${labels.history}</button>
                    <button class="cw-btn-toggle" style="width:100%; margin-top:0.4rem; font-size:0.85rem;" type="button" onclick="COSY_WORLD.startVoiceRecognition()">🎙️ ${labels.voice}</button>
                </div>

                <div id="cw-dialogue-history-panel" style="display:none; margin-top:1rem; max-height:160px; overflow-y:auto; background:var(--bg-app); padding:0.75rem; border-radius:12px; border:1px solid var(--border-subtle); font-size:0.85rem;">
                    <div style="font-weight:700; margin-bottom:0.5rem;">📜 ${labels.historyTitle}</div>
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

    static repeatSpeech(lang = this.currentLanguage) {
        if (this.currentDialogueText) {
            this.speakText(this.currentDialogueText, lang, this.currentPlaybackRate);
        }
    }

    static toggleSlowSpeech(lang = this.currentLanguage) {
        this.currentPlaybackRate = this.currentPlaybackRate === 0.7 ? 1.0 : 0.7;
        this.repeatSpeech(lang);
    }

    static setSpeechSpeed(speed, lang = this.currentLanguage) {
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
            const unavailable = {
                en: 'Voice recognition requires a compatible browser.',
                fr: 'La reconnaissance vocale nécessite un navigateur compatible.',
                it: 'Il riconoscimento vocale richiede un browser compatibile.',
                es: 'El reconocimiento de voz requiere un navegador compatible.',
                de: 'Die Spracherkennung erfordert einen kompatiblen Browser.',
                ru: 'Для распознавания речи нужен совместимый браузер.',
                el: 'Η αναγνώριση ομιλίας απαιτεί συμβατό πρόγραμμα περιήγησης.',
                pt: 'O reconhecimento de voz requer um navegador compatível.'
            };
            alert(unavailable[this.currentLanguage] || '⚠️');
            return;
        }

        const recognition = new SpeechRec();
        const speechLangs = { en: 'en-US', fr: 'fr-FR', it: 'it-IT', es: 'es-ES', de: 'de-DE', ru: 'ru-RU', el: 'el-GR', pt: 'pt-PT' };
        recognition.lang = speechLangs[this.currentLanguage] || this.currentLanguage;
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const recognized = {
                en: 'Speech recognized:',
                fr: 'Parole reconnue :',
                it: 'Discorso riconosciuto:',
                es: 'Habla reconocida:',
                de: 'Sprache erkannt:',
                ru: 'Речь распознана:',
                el: 'Αναγνωρισμένη ομιλία:',
                pt: 'Fala reconhecida:'
            };
            alert(`🎙️ ${recognized[this.currentLanguage] || '🎙️'} "${transcript}" ⭐`);
        };
    }
}
