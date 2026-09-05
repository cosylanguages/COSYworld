/**
 * games/cosy_world/js/inventory/inventory.js
 * Object discovery and visual vocabulary encyclopedia component.
 */

export class InventoryManager {
    static inspectObject(objId, state, gameData, addXPFn, checkQuestsFn, speakTextFn, openModalFn, renderViewportFn, renderHudFn) {
        const obj = gameData.objects[objId];
        if (!obj) return;

        const lang = state.currentLang;
        const word = obj.words[lang] || obj.words.en || objId;
        const sequence = obj.visualSequence || `${obj.emoji} ${word}`;

        if (!state.discoveredObjects.has(objId)) {
            state.discoveredObjects.add(objId);
            if (addXPFn) addXPFn(15);
            if (checkQuestsFn) checkQuestsFn();
        }

        // Find rich vocabulary entry details if available
        const vocabEngine = typeof window !== 'undefined' && window.COSY_WORLD && window.COSY_WORLD.vocabularyEngine;
        const vocabEntry = obj.vocabId && vocabEngine ? vocabEngine.getVocabulary(obj.vocabId) : null;
        const vocabStats = obj.vocabId && vocabEngine ? vocabEngine.getStats(obj.vocabId) : null;

        // Find integrated grammar points for this object
        const integratedGrammar = (gameData.grammarTree || []).filter(gp =>
            gp.sceneIntegration && gp.sceneIntegration.objects && gp.sceneIntegration.objects.includes(objId)
        );

        // Auto-speak target word for natural auditory acquisition
        if (speakTextFn) speakTextFn(word, lang);

        const body = document.getElementById('cw-modal-body');
        if (body) {
            body.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:4rem; margin-bottom:0.5rem;">${obj.emoji}</div>
                    <h2 style="font-family:'Fraunces',serif; font-size:2rem; color:var(--text-main); margin-bottom:0.25rem;">${word}</h2>

                    <button class="btn-g-primary" type="button" style="margin-bottom:1rem; font-size:1.1rem; padding:0.6rem 1.25rem;" onclick="COSY_WORLD.speakText('${word.replace(/'/g, "\\'")}', '${lang}')">
                        🔊 Speak Target Word
                    </button>

                    <div class="cw-item-card" style="text-align:left; background:var(--bg-app); padding:1rem; border-radius:14px; margin-bottom:1rem;">
                        <div class="cw-item-title" style="font-size:1rem; color:var(--accent-teal);">🎬 Visual Action Chain</div>
                        <div style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-top:0.4rem;">${sequence}</div>
                    </div>

                    ${vocabEntry ? `
                        <div class="cw-item-card" style="text-align:left; background:#eff6ff; border:1px solid #bfdbfe; padding:0.75rem; border-radius:12px; margin-bottom:1rem;">
                            <div style="font-size:0.85rem; font-weight:700; color:#1e40af;">
                                🧠 Spaced Repetition Mastery: ${vocabStats?.masteryLevel || 0}% (CEFR ${vocabEntry.difficulty})
                            </div>
                            ${vocabEntry.collocations && vocabEntry.collocations.length > 0 ? `
                                <div style="font-size:0.8rem; color:#1e3a8a; margin-top:0.3rem;">
                                    <strong>Collocations:</strong> ${vocabEntry.collocations.join(', ')}
                                </div>
                            ` : ''}
                            ${vocabEntry.exampleSentences && (vocabEntry.exampleSentences[lang] || vocabEntry.exampleSentences.en) ? `
                                <div style="font-size:0.8rem; italic; color:#1e3a8a; margin-top:0.3rem;">
                                    "${vocabEntry.exampleSentences[lang] || vocabEntry.exampleSentences.en}"
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${integratedGrammar.length > 0 ? integratedGrammar.map(gp => {
                        const isUnlocked = state.unlockedGrammar && state.unlockedGrammar.has(gp.id);
                        return `
                            <div class="cw-item-card" style="text-align:left; background:${isUnlocked ? '#f0fdf4' : '#fffbe2'}; border:1px solid ${isUnlocked ? '#34d399' : '#fcd34d'}; padding:0.75rem; border-radius:12px; margin-bottom:1rem;">
                                <div style="font-size:0.85rem; font-weight:700; color:${isUnlocked ? '#065f46' : '#92400e'};">
                                    🌳 Grammar Focus: ${gp.title} (${gp.difficulty || 'A0'})
                                </div>
                                <div style="font-size:0.8rem; color:var(--text-main); margin-top:0.25rem;">
                                    ${gp.rule}
                                </div>
                                ${isUnlocked && gp.interactiveExercises && gp.interactiveExercises.length > 0 ? `
                                    <button type="button" class="btn-g-secondary" style="margin-top:0.5rem; font-size:0.8rem; width:100%;" onclick="COSY_WORLD.openGrammarExercise('${gp.interactiveExercises[0].id}')">
                                        🧩 Practice Grammar Exercise (+${gp.interactiveExercises[0].xpReward || 25} XP)
                                    </button>
                                ` : ''}
                            </div>
                        `;
                    }).join('') : ''}

                    ${obj.actionChain ? `
                        <button class="btn-g-secondary" type="button" style="width:100%; margin-top:0.5rem;" onclick="COSY_WORLD.triggerActionChain('${obj.id}')">
                            ${obj.actionChain.actionIcon}
                        </button>
                    ` : ''}

                    ${state.showTranslations && obj.words.en ? `
                        <div style="font-size:0.85rem; color:var(--text-muted); margin-top:1rem;">🌐 English Translation: ${obj.words.en}</div>
                    ` : ''}
                </div>
            `;
        }

        if (openModalFn) openModalFn();
        if (renderViewportFn) renderViewportFn();
        if (renderHudFn) renderHudFn();
    }
}
