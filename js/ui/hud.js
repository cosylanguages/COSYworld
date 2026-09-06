/**
 * games/cosy_world/js/ui/hud.js
 * Sidebar HUD tabs (Quests, Vocabulary Encyclopedia, Grammar Tree, NPCs) and toast messaging.
 */

/**
 * Helper to generate outbound handoff URLs for COSYtools and COSYgames.
 */
function buildHandoffUrl(targetApp, lang = 'en', level = 'A1', topic = '') {
    const baseUrl = targetApp === 'COSYgames'
        ? 'https://cosylanguages.github.io/COSYgames/'
        : 'https://cosylanguages.github.io/COSYtools/';
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);
    if (level) params.set('level', level);
    if (topic) {
        const cleanTopic = topic.replace(/^gt_/, '');
        params.set('topic', cleanTopic);
    }
    return `${baseUrl}?${params.toString()}`;
}

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

        // Environmental Simulation Header Bar
        const worldSim = state.worldSim || { timeString: '08:00', timeOfDay: 'morning', season: 'spring', weather: 'clear' };
        const simIcons = {
            morning: '🌅 Morning',
            afternoon: '☀️ Afternoon',
            evening: '🌆 Evening',
            night: '🌙 Night'
        };
        const seasonIcons = {
            spring: '🌸 Spring',
            summer: '🌻 Summer',
            autumn: '🍁 Autumn',
            winter: '❄️ Winter'
        };
        const weatherIcons = {
            clear: '☀️ Clear',
            rain: '🌧️ Rain',
            snow: '🌨️ Snow',
            fog: '🌫️ Fog',
            clouds: '☁️ Clouds'
        };

        const envHeaderHtml = `
            <div style="background:var(--blue-light); border:1px solid var(--border-subtle); padding:0.6rem 0.8rem; border-radius:12px; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; font-weight:700; color:var(--text-main);">
                <div>⏰ ${worldSim.timeString || '08:00'} (${simIcons[worldSim.timeOfDay] || '🌅 Morning'})</div>
                <div>${seasonIcons[worldSim.season] || '🌸 Spring'} • ${weatherIcons[worldSim.weather] || '☀️ Clear'}</div>
            </div>
            <div style="background:#f8fafc; border:1px solid var(--border-subtle); padding:0.6rem 0.8rem; border-radius:12px; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <div style="font-size:0.8rem; font-weight:700; color:var(--text-main);">📘 COSY Passport</div>
                <div style="display:flex; gap:0.4rem;">
                    <button class="cw-btn-toggle" type="button" style="padding:0.35rem 0.75rem; font-size:0.8rem; min-height:44px;" onclick="COSY_WORLD.exportPassport()">📥 Export</button>
                    <button class="cw-btn-toggle" type="button" style="padding:0.35rem 0.75rem; font-size:0.8rem; min-height:44px;" onclick="document.getElementById('cw-passport-file-input').click()">📤 Import</button>
                    <input type="file" id="cw-passport-file-input" accept=".json" style="display:none;" onchange="COSY_WORLD.importPassport(event)">
                </div>
            </div>
        `;

        if (state.activeTab === 'quests') {
            if (!gameData.quests || gameData.quests.length === 0) {
                body.innerHTML = envHeaderHtml + `<div style="text-align:center; padding:2rem; color:var(--text-muted);">No quests loaded.</div>`;
                return;
            }

            const typeIcons = {
                exploration: '🗺️',
                collect: '📦',
                photograph: '📸',
                conversation: '💬',
                shopping: '🛍️',
                grammar: '🧩',
                pronunciation: '🗣️',
                listening: '👂',
                directions: '🧭',
                'timed challenge': '⚡'
            };

            const chapters = Array.isArray(gameData.chapters) ? gameData.chapters : [];
            const renderQuestCards = (quests) => quests.map(q => {
                const isDone = state.completedQuests && state.completedQuests.has(q.id);
                const isActive = state.activeQuests && state.activeQuests.has(q.id);
                const typeIcon = typeIcons[q.type] || '📜';
                const npc = q.NPC ? gameData.npcs[q.NPC] : null;

                const xpReward = (q.reward && q.reward.xp) || q.xpReward || 50;
                const vocabReward = (q.reward && q.reward.vocabulary) ? q.reward.vocabulary.length : 0;
                const grammarReward = (q.reward && q.reward.grammar) || q.grammarUnlock;

                const nextQuest = q.nextQuestId ? gameData.quests.find(item => item.id === q.nextQuestId) : null;

                return `
                    <div class="cw-item-card" style="${isDone ? 'opacity:0.65;' : (isActive ? 'border-left: 4px solid var(--blue-primary);' : '')}">
                        <div class="cw-item-title" style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                            <span style="font-weight:700; color:var(--text-main);">${q.title}</span>
                            <div style="display:flex; gap:0.3rem; flex-wrap:wrap;">
                                <span style="font-size:0.75rem; background:var(--blue-light); color:var(--blue-primary); padding:0.2rem 0.5rem; border-radius:10px; font-weight:700;">
                                    ${typeIcon} ${q.type || 'Quest'}
                                </span>
                                <span style="font-size:0.75rem; background:${isDone ? '#d1fae5' : (isActive ? '#dbeafe' : '#fef3c7')}; color:${isDone ? '#065f46' : (isActive ? '#1e40af' : '#92400e')}; padding:0.2rem 0.5rem; border-radius:10px; font-weight:700;">
                                    ${isDone ? '✅ Complete' : (isActive ? '🔥 Active' : '📜 Available')}
                                </span>
                            </div>
                        </div>

                        <div class="cw-item-desc" style="margin-top:0.4rem;">
                            ${q.description}
                        </div>

                        ${npc ? `
                            <div style="margin-top:0.4rem; font-size:0.8rem; font-weight:600; color:var(--text-muted);">
                                👤 NPC Mentor: ${npc.avatar || '👤'} ${npc.name} (${npc.role})
                            </div>
                        ` : ''}

                        <div style="margin-top:0.5rem; display:flex; gap:0.5rem; flex-wrap:wrap; font-size:0.75rem; font-weight:700;">
                            <span style="background:#f3f4f6; padding:0.2rem 0.5rem; border-radius:8px; color:var(--text-main);">⭐ +${xpReward} XP</span>
                            ${vocabReward > 0 ? `<span style="background:#eff6ff; color:#1d4ed8; padding:0.2rem 0.5rem; border-radius:8px;">📚 +${vocabReward} Vocab</span>` : ''}
                            ${grammarReward ? `<span style="background:#f0fdf4; color:#15803d; padding:0.2rem 0.5rem; border-radius:8px;">🌳 Unlocks Grammar</span>` : ''}
                        </div>

                        ${grammarReward ? `
                            <div style="margin-top:0.5rem; display:flex; gap:0.4rem; flex-wrap:wrap;">
                                <a href="${buildHandoffUrl('COSYtools', lang, q.difficulty || 'A1', grammarReward)}" target="_blank" rel="noopener" class="cw-btn-toggle" style="padding:0.35rem 0.75rem; font-size:0.78rem; min-height:44px; text-decoration:none;">🧰 COSYtools Reference ↗</a>
                                <a href="${buildHandoffUrl('COSYgames', lang, q.difficulty || 'A1', grammarReward)}" target="_blank" rel="noopener" class="cw-btn-toggle" style="padding:0.35rem 0.75rem; font-size:0.78rem; min-height:44px; text-decoration:none;">🎮 Practice Game ↗</a>
                            </div>
                        ` : ''}

                        ${nextQuest ? `
                            <div style="margin-top:0.5rem; font-size:0.75rem; color:var(--blue-primary); font-weight:600;">
                                🔗 Quest Chain: Leads to "${nextQuest.title}"
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            const chapterSections = chapters.map(chapter => {
                const chapterQuests = gameData.quests.filter(quest => quest.chapter === chapter.id);
                if (chapterQuests.length === 0) return '';
                const completedCount = chapterQuests.filter(quest => state.completedQuests?.has(quest.id)).length;
                const isCurrent = state.currentChapter === chapter.id;
                const chapterComplete = chapter.completionQuestId && state.completedQuests?.has(chapter.completionQuestId);

                return `
                    <section style="margin-bottom:1.25rem;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem; margin-bottom:0.5rem; padding-bottom:0.45rem; border-bottom:2px solid ${isCurrent ? 'var(--accent-amber)' : 'var(--border-subtle)'};">
                            <div>
                                <div style="font-weight:800; color:var(--blue-primary);">Chapter ${chapter.number}: ${chapter.title}</div>
                                <div style="font-size:0.76rem; color:var(--text-muted);">${chapter.focus}</div>
                            </div>
                            <span style="font-size:0.75rem; white-space:nowrap; color:${chapterComplete ? '#065f46' : 'var(--text-muted)'};">${chapterComplete ? '✅ Complete' : `${completedCount}/${chapterQuests.length}`}</span>
                        </div>
                        ${renderQuestCards(chapterQuests)}
                    </section>
                `;
            }).join('');

            const ungroupedQuests = gameData.quests.filter(quest => !chapters.some(chapter => chapter.id === quest.chapter));
            body.innerHTML = envHeaderHtml + chapterSections + (ungroupedQuests.length ? renderQuestCards(ungroupedQuests) : '');
        } else if (state.activeTab === 'vocab') {
            const disc = Array.from(state.discoveredObjects || []);
            if (disc.length === 0) {
                body.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">No objects discovered yet! Click items in rooms to build your visual encyclopedia.</div>`;
                return;
            }

            const vocabEngine = typeof window !== 'undefined' && window.COSY_WORLD && window.COSY_WORLD.vocabularyEngine;
            const overallStats = vocabEngine ? vocabEngine.getStats() : null;

            let html = ``;
            if (overallStats) {
                html += `
                    <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:0.75rem; border-radius:12px; margin-bottom:1rem; font-size:0.85rem; color:#1e40af;">
                        <div style="font-weight:700; margin-bottom:0.25rem;">📊 Spaced Repetition Overview</div>
                        <div>Mastered Words: <strong>${overallStats.masteredCount} / ${overallStats.totalVocabulary}</strong> • Avg Mastery: <strong>${overallStats.averageMastery}%</strong></div>
                    </div>
                `;
            }

            html += disc.map(objId => {
                const obj = gameData.objects[objId];
                if (!obj) return '';
                const word = obj.words[lang] || obj.words.en || objId;
                const vocabEntry = obj.vocabId && vocabEngine ? vocabEngine.getVocabulary(obj.vocabId) : null;
                const vocabStats = obj.vocabId && vocabEngine ? vocabEngine.getStats(obj.vocabId) : null;

                return `
                    <div class="cw-item-card" style="cursor:pointer;" onclick="COSY_WORLD.inspectObject('${objId}')">
                        <div class="cw-item-title" style="display:flex; justify-content:space-between; align-items:center;">
                            <span>${obj.emoji} ${word}</span>
                            <span style="font-size:0.8rem; color:var(--blue-primary);">🔊 Review</span>
                        </div>
                        ${vocabEntry ? `
                            <div style="margin-top:0.4rem; font-size:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                                <span style="background:#dbeafe; color:#1e40af; padding:0.15rem 0.4rem; border-radius:6px; font-weight:700;">
                                    🧠 ${vocabStats?.masteryLevel || 0}% Mastery
                                </span>
                                <span style="background:#f3f4f6; color:#374151; padding:0.15rem 0.4rem; border-radius:6px; font-weight:700;">
                                    CEFR ${vocabEntry.difficulty}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            body.innerHTML = html;
        } else if (state.activeTab === 'grammar') {
            if (!gameData.grammarTree || gameData.grammarTree.length === 0) {
                body.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">No grammar points loaded.</div>`;
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
                    <div class="cw-item-card" style="${!isUnlocked ? 'opacity:0.75; background:#f8fafc;' : 'border-left: 4px solid var(--blue-primary);'}">
                        <div class="cw-item-title" style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                            <span style="font-weight:700; color:var(--text-main);">${g.title}</span>
                            <div style="display:flex; gap:0.3rem;">
                                <span style="font-size:0.75rem; background:var(--blue-light); color:var(--blue-primary); padding:0.2rem 0.5rem; border-radius:10px; font-weight:700;">${cefrLevel}</span>
                                <span style="font-size:0.75rem; background:${isUnlocked ? '#d1fae5' : '#fee2e2'}; color:${isUnlocked ? '#065f46' : '#991b1b'}; padding:0.2rem 0.5rem; border-radius:10px; font-weight:700;">
                                    ${isUnlocked ? '✅ Unlocked' : '🔒 Locked'}
                                </span>
                            </div>
                        </div>

                        <div class="cw-item-desc" style="margin-top:0.5rem; font-size:0.85rem; color:var(--text-main);">
                            <strong>Rule:</strong> ${g.rule || g.desc || ''}
                        </div>

                        ${isUnlocked && g.examples && g.examples.length > 0 ? `
                            <div style="margin-top:0.6rem; background:var(--blue-light); padding:0.5rem; border-radius:8px; font-size:0.8rem;">
                                <div style="font-weight:700; color:var(--blue-primary); margin-bottom:0.2rem;">💬 Example:</div>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span>${g.examples[0].text}</span>
                                    <button type="button" class="cw-btn-toggle" style="padding:0.25rem 0.5rem; font-size:0.8rem; min-height:44px;" onclick="COSY_WORLD.speakGrammarExample('${g.examples[0].text.replace(/'/g, "\\'")}', '${state.currentLang}')">🔊</button>
                                </div>
                                ${g.examples[0].targetLang && g.examples[0].targetLang[lang] ? `
                                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.28rem;">${g.examples[0].targetLang[lang]}</div>
                                ` : ''}
                            </div>
                        ` : ''}

                        ${isUnlocked && exCount > 0 ? `
                            <div style="margin-top:0.6rem; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Exercises: ${completedExCount}/${exCount} Done</span>
                                <button type="button" class="btn-g-primary" style="padding:0.25rem 0.6rem; font-size:0.8rem;" onclick="COSY_WORLD.openGrammarExercise('${g.interactiveExercises[0].id}')">
                                    🧩 Practice Exercise
                                </button>
                            </div>
                        ` : ''}

                        ${isUnlocked ? `
                            <div style="margin-top:0.6rem; display:flex; gap:0.4rem; flex-wrap:wrap; border-top:1px dashed var(--border-subtle); padding-top:0.5rem;">
                                <a href="${buildHandoffUrl('COSYtools', lang, cefrLevel, g.id)}" target="_blank" rel="noopener" class="cw-btn-toggle" style="padding:0.35rem 0.75rem; font-size:0.78rem; min-height:44px; text-decoration:none;">🧰 Reference Engine ↗</a>
                                <a href="${buildHandoffUrl('COSYgames', lang, cefrLevel, g.id)}" target="_blank" rel="noopener" class="cw-btn-toggle" style="padding:0.35rem 0.75rem; font-size:0.78rem; min-height:44px; text-decoration:none;">🎮 Practice Minigame ↗</a>
                            </div>
                        ` : ''}

                        ${!isUnlocked && unlockReqText ? `
                            <div style="margin-top:0.6rem; font-size:0.8rem; background:#fef3c7; color:#92400e; padding:0.4rem 0.6rem; border-radius:8px;">
                                ${unlockReqText}
                            </div>
                        ` : ''}

                        ${g.sceneIntegration ? `
                            <div style="margin-top:0.5rem; font-size:0.75rem; color:var(--blue-primary); font-weight:600; cursor:pointer;" onclick="COSY_WORLD.switchLocation('${g.sceneIntegration.locationId}')">
                                📍 Integrated in ${g.sceneIntegration.district || 'COSY Town'} (${g.sceneIntegration.locationId}) ➔
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else if (state.activeTab === 'npcs' || state.activeTab === 'friends') {
            body.innerHTML = Object.keys(gameData.npcs).map(npcId => {
                const npc = gameData.npcs[npcId];
                const fp = (state.npcRelationships && state.npcRelationships[npcId] !== undefined)
                    ? state.npcRelationships[npcId]
                    : (npc.friendshipPoints || 0);

                let relationshipTitle = 'Acquaintance';
                if (fp >= 80) relationshipTitle = 'Best Friend ❤️';
                else if (fp >= 50) relationshipTitle = 'Good Friend 💛';
                else if (fp >= 20) relationshipTitle = 'Friend 😊';

                const primaryLocation = (npc.dailySchedule && npc.dailySchedule[0] && npc.dailySchedule[0].location) || 'town_square';

                return `
                    <div class="cw-item-card" style="cursor:pointer;" onclick="COSY_WORLD.switchLocation('${primaryLocation}')">
                        <div class="cw-item-title" style="display:flex; justify-content:space-between; align-items:center;">
                            <span>${npc.avatar || '👤'} ${npc.name}</span>
                            <span style="font-size:0.75rem; background:#fef2f2; color:#be123c; padding:0.2rem 0.5rem; border-radius:10px; font-weight:700;">
                                ❤️ ${fp} FP (${relationshipTitle})
                            </span>
                        </div>
                        <div class="cw-item-desc" style="margin-top:0.4rem;">
                            <strong>Role:</strong> ${npc.role}
                        </div>
                        <div style="margin-top:0.4rem; font-size:0.75rem; color:var(--blue-primary); font-weight:600;">
                            📍 Primary Location: ${primaryLocation} ➔
                        </div>
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
