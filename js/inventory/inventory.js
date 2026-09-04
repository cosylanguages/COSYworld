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

        // Auto-speak target word for natural auditory acquisition
        if (speakTextFn) speakTextFn(word, lang);

        const body = document.getElementById('cw-modal-body');
        if (body) {
            body.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:4rem; margin-bottom:0.5rem;">${obj.emoji}</div>
                    <h2 style="font-family:'Fraunces',serif; font-size:2rem; color:var(--ink); margin-bottom:0.25rem;">${word}</h2>

                    <button class="btn-g-primary" type="button" style="margin-bottom:1.25rem; font-size:1.1rem; padding:0.6rem 1.25rem;" onclick="COSY_WORLD.speakText('${word.replace(/'/g, "\\'")}', '${lang}')">
                        🔊 Speak Target Word
                    </button>

                    <div class="cw-item-card" style="text-align:left; background:var(--tan-light); padding:1rem; border-radius:14px; margin-bottom:1rem;">
                        <div class="cw-item-title" style="font-size:1rem; color:var(--teal);">🎬 Visual Action Chain</div>
                        <div style="font-size:1.1rem; font-weight:700; color:var(--ink); margin-top:0.4rem;">${sequence}</div>
                    </div>

                    ${obj.actionChain ? `
                        <button class="btn-g-secondary" type="button" style="width:100%; margin-top:0.5rem;" onclick="COSY_WORLD.triggerActionChain('${obj.id}')">
                            ${obj.actionChain.actionIcon}
                        </button>
                    ` : ''}

                    ${state.showTranslations && obj.words.en ? `
                        <div style="font-size:0.85rem; color:var(--ink-muted); margin-top:1rem;">🌐 English Translation: ${obj.words.en}</div>
                    ` : ''}
                </div>
            `;
        }

        if (openModalFn) openModalFn();
        if (renderViewportFn) renderViewportFn();
        if (renderHudFn) renderHudFn();
    }
}
