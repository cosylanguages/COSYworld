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
            body.innerHTML = gameData.grammarTree.map(g => {
                const isUnlocked = state.unlockedGrammar.has(g.id);
                return `
                    <div class="cw-item-card" style="${!isUnlocked ? 'opacity:0.5;' : ''}">
                        <div class="cw-item-title">
                            <span>${g.title}</span>
                            <span style="font-size:0.75rem; background:var(--tan-light); padding:0.2rem 0.5rem; border-radius:10px;">${g.cefr}</span>
                        </div>
                        <div class="cw-item-desc">${g.desc}</div>
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
