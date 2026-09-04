/**
 * games/cosy_world/js/dialogue/dialogue.js
 * Professional Dialogue Engine for COSY World.
 * Features:
 * - Branching dialogue tree node graphs
 * - Choice handlers with vocabulary rewards and grammar checks
 * - Voice speech playback with speed control (0.8x, 1.0x, 1.3x), slow toggle, and audio repeat
 * - Typing animation effect with configurable speed
 * - Animated portrait reactions (.cw-portrait-bounce)
 * - Relationship & friendship point system (+10 FP per chat, level tiers)
 * - Quest trigger integration
 * - Dialogue history log array
 * - Future voice recognition input hooks (SpeechRecognition / webkitSpeechRecognition API)
 */

export class DialogueManager {
    static typingInterval = null;
    static currentPlaybackRate = 1.0;
    static currentDialogueText = '';
    static dialogueHistory = [];

    static interactNPC(npcId, state, gameData, openModalFn, nodeIndex = 0) {
        const npc = gameData.npcs[npcId];
        if (!npc) return;

        // Increase friendship points on interaction
        state.npcRelationships[npcId] = (state.npcRelationships[npcId] || 0) + 10;
        const currentFP = state.npcRelationships[npcId];
        const currentLvl = Math.floor(currentFP / 50) + 1;

        const lang = state.currentLang;
        const dialogues = (npc.dialogues && npc.dialogues[lang]) || npc.dialogues.en || [];
        const dlg = dialogues[nodeIndex] || dialogues[0] || { text: '👋 Hello!', options: [] };

        this.currentDialogueText = dlg.text;

        // Record dialogue history
        this.dialogueHistory.push({
            npcName: npc.name,
            text: dlg.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Auto-speak text using speech synthesis
        this.speakText(dlg.text, lang, this.currentPlaybackRate);

        const body = document.getElementById('cw-modal-body');
        if (body) {
            body.innerHTML = `
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                    <div class="cw-portrait-bounce" style="font-size:3rem; background:var(--tan-light); padding:0.5rem; border-radius:50%; border:2px solid var(--border);">${npc.portrait || npc.avatar}</div>
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <h2 style="font-family:'Fraunces',serif; font-size:1.5rem; color:var(--ink); margin:0;">${npc.name}</h2>
                            <span style="font-size:0.8rem; background:#fef3c7; color:#b45309; padding:0.25rem 0.6rem; border-radius:12px; font-weight:700;">❤️ Level ${currentLvl} (${currentFP} FP)</span>
                        </div>
                        <div style="font-size:0.85rem; color:var(--teal); font-weight:700; margin-top:0.2rem;">${npc.role}</div>
                        ${npc.teachingRole ? `<div style="font-size:0.8rem; color:var(--ink-muted);">🎓 ${npc.teachingRole}</div>` : ''}
                    </div>
                </div>

                <!-- Speech Voice & Controls Bar -->
                <div class="cw-speech-controls" style="display:flex; align-items:center; justify-content:space-between; background:var(--tan-light); padding:0.5rem 0.75rem; border-radius:12px; margin-bottom:0.75rem; font-size:0.85rem; border:1px solid var(--border);">
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
                <div class="cw-item-card" style="font-size:1.15rem; font-weight:600; line-height:1.5; color:var(--ink); margin-bottom:1rem; min-height:60px;">
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

                ${npc.shopInventory && npc.shopInventory.length > 0 ? `
                    <div style="margin-bottom:1rem; padding:0.75rem; background:var(--tan-light); border-radius:12px; border:1px solid var(--border);">
                        <div style="font-weight:700; font-size:0.9rem; color:var(--ink); margin-bottom:0.5rem;">🛍️ Shop Inventory</div>
                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                            ${npc.shopInventory.map(item => `
                                <div style="background:white; padding:0.4rem 0.75rem; border-radius:10px; border:1px solid var(--border); font-size:0.85rem; font-weight:700;">
                                    ${item.emoji} ${item.name} (${item.price} XP)
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div id="cw-dialogue-options" style="display:none;">
                    ${dlg.options ? dlg.options.map(opt => `
                        <button class="btn-g-primary" type="button" style="width:100%; margin-bottom:0.5rem; font-size:1.05rem;" onclick="COSY_WORLD.handleBranchNode('${npcId}', ${opt.next !== undefined ? opt.next : -1}, '${opt.questId || ''}', ${opt.rewardXP || 0})">
                            ${opt.label} ${opt.rewardXP ? `(+${opt.rewardXP} XP ⭐)` : ''}
                        </button>
                    `).join('') : ''}

                    <button class="cw-btn-toggle" style="width:100%; margin-top:0.5rem; font-size:0.85rem;" type="button" onclick="COSY_WORLD.toggleDialogueHistory()">📜 View Dialogue History Log</button>
                    <button class="cw-btn-toggle" style="width:100%; margin-top:0.4rem; font-size:0.85rem;" type="button" onclick="COSY_WORLD.startVoiceRecognition()">🎙️ Practice Voice Input (Speech Rec)</button>
                </div>

                <div id="cw-dialogue-history-panel" style="display:none; margin-top:1rem; max-height:160px; overflow-y:auto; background:var(--tan-light); padding:0.75rem; border-radius:12px; border:1px solid var(--border); font-size:0.85rem;">
                    <div style="font-weight:700; margin-bottom:0.5rem;">📜 Conversation History</div>
                    ${this.dialogueHistory.map(h => `
                        <div style="margin-bottom:0.4rem; border-bottom:1px solid #e5e7eb; padding-bottom:0.25rem;">
                            <span style="font-weight:700; color:var(--teal);">${h.npcName}:</span> "${h.text}" <span style="font-size:0.75rem; color:var(--ink-muted);">(${h.timestamp})</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.typeText(dlg.text);

        if (openModalFn) openModalFn();
    }

    static handleBranchNode(npcId, nextNode, questId, rewardXP, engine) {
        if (rewardXP > 0 && engine) {
            engine.addXP(rewardXP);
        }

        if (questId && engine) {
            engine.completeQuest(questId);
        }

        if (nextNode >= 0 && engine) {
            this.interactNPC(npcId, engine.state, engine.data, () => engine.openModal(), nextNode);
        } else if (engine) {
            engine.closeModal();
        }
    }

    static typeText(fullText) {
        if (this.typingInterval) clearInterval(this.typingInterval);
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
        if (!('speechSynthesis' in window)) return;
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
