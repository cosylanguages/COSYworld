/**
 * games/cosy_world/js/ui/hud.js
 * Sidebar HUD tabs (Quests, Vocabulary Encyclopedia, Grammar Tree, NPCs) and toast messaging.
 */

export class HUDManager {
    static switchTab(tabName, btnEl, state, renderHudFn) {
        state.activeTab = tabName;
        document.querySelectorAll('.cw-hud-btn').forEach(b => b.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');
        if (renderHudFn) renderHudFn();
    }

    static renderHudTab(state, gameData, inspectObjectFn) {
        const body = document.getElementById('cw-hud-tab-body');
        if (!body) return;

        const lang = state.currentLang;

        if (state.activeTab === 'quests') {
            body.innerHTML = gameData.quests.map(q => {
                const isDone = state.completedQuests.has(q.id);
                return `
                    <div class="cw-item-card" style="${isDone ? 'opacity:0.6;' : ''}">
                        <div class="cw-item-title">
                            <span>${q.title}</span>
                            <span>${isDone ? '✅ Done' : `⭐ ${q.xpReward} XP`}</span>
                        </div>
                        <div class="cw-item-desc">${q.description}</div>
                        ${q.grammarUnlock ? `
                            <div style="margin-top:0.4rem; font-size:0.75rem; color:var(--teal); font-weight:700;">
                                🌳 Unlocks Grammar Point
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else if (state.activeTab === 'vocab') {
            const disc = Array.from(state.discoveredObjects);
            if (disc.length === 0) {
                body.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--ink-muted);">No objects discovered yet! Click items in rooms to build your visual encyclopedia.</div>`;
                return;
            }
            body.innerHTML = disc.map(objId => {
                const obj = gameData.objects[objId];
                if (!obj) return '';
                const word = obj.words[lang] || obj.words.en || objId;
                return `
                    <div class="cw-item-card" style="cursor:pointer;" onclick="COSY_WORLD.inspectObject('${objId}')">
                        <div class="cw-item-title">
                            <span>${obj.emoji} ${word}</span>
                            <span style="font-size:0.8rem; color:var(--teal);">🔊 Speak</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else if (state.activeTab === 'grammar') {
            if (!gameData.grammarTree || gameData.grammarTree.length === 0) {
                body.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--ink-muted);">No grammar points loaded.</div>`;
                return;
            }

            body.innerHTML = gameData.grammarTree.map(g => {
                const isUnlocked = state.unlockedGrammar && state.unlockedGrammar.has(g.id);
                const cefrLevel = g.difficulty || g.cefr || 'A0';

                let unlockReqText = '';
                if (!isUnlocked && g.unlockRequirements && g.unlockRequirements.quests) {
                    const reqQuests = g.unlockRequirements.quests.map(qid => {
                        const q = gameData.quests.find(item => item.id === qid);
                        return q ? q.title : qid;
                    }).join(', ');
                    unlockReqText = `🎯 Learn by completing mission: <strong>${reqQuests}</strong>`;
                }

                const exCount = g.interactiveExercises ? g.interactiveExercises.length : 0;
                const completedExCount = g.interactiveExercises ? g.interactiveExercises.filter(e => state.completedExercises && state.completedExercises.has(e.id)).length : 0;

                return `
                    <div class="cw-item-card" style="${!isUnlocked ? 'opacity:0.75; background:#f3f4f6;' : 'border-left: 4px solid var(--teal);'}">
                        <div class="cw-item-title" style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                            <span style="font-weight:700; color:var(--ink);">${g.title}</span>
                            <div style="display:flex; gap:0.3rem;">
                                <span style="font-size:0.75rem; background:var(--tan-light); padding:0.2rem 0.5rem; border-radius:10px; font-weight:700;">${cefrLevel}</span>
                                <span style="font-size:0.75rem; background:${isUnlocked ? '#d1fae5' : '#fee2e2'}; color:${isUnlocked ? '#065f46' : '#991b1b'}; padding:0.2rem 0.5rem; border-radius:10px; font-weight:700;">
                                    ${isUnlocked ? '✅ Unlocked' : '🔒 Locked'}
                                </span>
                            </div>
                        </div>

                        <div class="cw-item-desc" style="margin-top:0.5rem; font-size:0.85rem; color:var(--ink);">
                            <strong>Rule:</strong> ${g.rule || g.desc || ''}
                        </div>

                        ${isUnlocked && g.examples && g.examples.length > 0 ? `
                            <div style="margin-top:0.6rem; background:var(--tan-light); padding:0.5rem; border-radius:8px; font-size:0.8rem;">
                                <div style="font-weight:700; color:var(--teal); margin-bottom:0.2rem;">💬 Example:</div>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span>${g.examples[0].text}</span>
                                    <button type="button" class="cw-btn-toggle" style="padding:0.15rem 0.4rem; font-size:0.7rem;" onclick="COSY_WORLD.speakGrammarExample('${g.examples[0].text.replace(/'/g, "\\'")}', '${state.currentLang}')">🔊</button>
                                </div>
                                ${g.examples[0].targetLang && g.examples[0].targetLang[lang] ? `
                                    <div style="font-size:0.75rem; color:var(--ink-muted); margin-top:0.28rem;">${g.examples[0].targetLang[lang]}</div>
                                ` : ''}
                            </div>
                        ` : ''}

                        ${isUnlocked && exCount > 0 ? `
                            <div style="margin-top:0.6rem; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.75rem; font-weight:700; color:var(--ink-muted);">Exercises: ${completedExCount}/${exCount} Done</span>
                                <button type="button" class="btn-g-primary" style="padding:0.25rem 0.6rem; font-size:0.8rem;" onclick="COSY_WORLD.openGrammarExercise('${g.interactiveExercises[0].id}')">
                                    🧩 Practice Exercise
                                </button>
                            </div>
                        ` : ''}

                        ${!isUnlocked && unlockReqText ? `
                            <div style="margin-top:0.6rem; font-size:0.8rem; background:#fef3c7; color:#92400e; padding:0.4rem 0.6rem; border-radius:8px;">
                                ${unlockReqText}
                            </div>
                        ` : ''}

                        ${g.sceneIntegration ? `
                            <div style="margin-top:0.5rem; font-size:0.75rem; color:var(--teal); font-weight:600; cursor:pointer;" onclick="COSY_WORLD.switchLocation('${g.sceneIntegration.locationId}')">
                                📍 Integrated in ${g.sceneIntegration.district || 'COSY Town'} (${g.sceneIntegration.locationId}) ➔
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else if (state.activeTab === 'npcs') {
            body.innerHTML = Object.keys(gameData.npcs).map(npcId => {
                const npc = gameData.npcs[npcId];
                return `
                    <div class="cw-item-card" style="cursor:pointer;" onclick="COSY_WORLD.switchLocation('town_square')">
                        <div class="cw-item-title">
                            <span>${npc.avatar} ${npc.name}</span>
                            <span style="font-size:0.8rem; color:var(--teal);">Talk 💬</span>
                        </div>
                        <div class="cw-item-desc">${npc.role}</div>
                    </div>
                `;
            }).join('');
        }
    }

    static showToast(msg) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 2500);
    }
}
