/**
 * games/cosy_world/js/quests/quest_manager.js
 * Quest tracking, evaluation, and reward completion logic.
 */

export class QuestManager {
    static completeQuest(questId, state, gameData, addXPFn, saveStateFn, renderHudFn, showToastFn) {
        const q = gameData.quests.find(quest => quest.id === questId);
        if (!q || state.completedQuests.has(questId)) return;

        state.completedQuests.add(questId);
        state.activeQuests.delete(questId);

        if (addXPFn) addXPFn(q.xpReward);

        if (q.grammarUnlock) {
            state.unlockedGrammar.add(q.grammarUnlock);
        }

        if (saveStateFn) saveStateFn();
        if (renderHudFn) renderHudFn();
        if (showToastFn) showToastFn(`Quest Complete: ${q.title}! 🎉`);
    }

    static checkQuests(state, gameData, completeQuestFn) {
        gameData.quests.forEach(q => {
            if (state.completedQuests.has(q.id)) return;

            if (q.type === 'Vocabulary Hunt' && q.targetCount) {
                if (state.discoveredObjects.size >= q.targetCount) {
                    if (completeQuestFn) completeQuestFn(q.id);
                }
            }
        });
    }
}
