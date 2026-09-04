import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { QuestManager } from '../js/quests/quest_manager.js';

test('Quest Data Schema - contains all 10 quest types with required fields', () => {
    const rawData = fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8');
    const quests = JSON.parse(rawData);

    assert.ok(Array.isArray(quests), 'Quests should be an array');
    assert.ok(quests.length >= 10, 'Should contain at least 10 quests');

    const expectedTypes = new Set([
        'exploration', 'collect', 'photograph', 'conversation',
        'shopping', 'grammar', 'pronunciation', 'listening',
        'directions', 'timed challenge'
    ]);

    const foundTypes = new Set(quests.map(q => q.type));

    expectedTypes.forEach(type => {
        assert.ok(foundTypes.has(type), `Quest dataset missing quest type: ${type}`);
    });

    const requiredFields = ['id', 'type', 'title', 'description', 'difficulty', 'requirements', 'reward', 'unlockConditions'];

    quests.forEach(q => {
        requiredFields.forEach(field => {
            assert.ok(field in q, `Quest "${q.id}" missing required field "${field}"`);
        });

        assert.ok('xp' in q.reward, `Quest "${q.id}" reward missing xp`);
    });
});

test('QuestManager - unlock conditions evaluation', () => {
    const rawQuests = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));
    const gameData = { quests: rawQuests };

    const stateLevel1 = {
        citizenLvl: 1,
        completedQuests: new Set(),
        discoveredObjects: new Set()
    };

    const exploreQuest = QuestManager.getQuest('q_explore_living', gameData);
    assert.ok(QuestManager.checkUnlockConditions(exploreQuest, stateLevel1));

    const chainedQuest = QuestManager.getQuest('q_collect_key', gameData);
    assert.equal(QuestManager.checkUnlockConditions(chainedQuest, stateLevel1), false, 'Chained quest should be locked initially');

    // Complete prerequisite quest
    stateLevel1.completedQuests.add('q_explore_living');
    assert.equal(QuestManager.checkUnlockConditions(chainedQuest, stateLevel1), true, 'Chained quest should unlock after prerequisite quest completion');
});

test('QuestManager - event evaluation and quest chain progression', () => {
    const rawQuests = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));
    const gameData = { quests: rawQuests };

    const state = {
        citizenLvl: 1,
        activeQuests: new Set(['q_explore_living']),
        completedQuests: new Set(),
        discoveredObjects: new Set(),
        unlockedGrammar: new Set(),
        xp: 0
    };

    let completedQuestIds = [];
    const completeFn = (qid) => {
        completedQuestIds.push(qid);
        QuestManager.completeQuest(qid, state, gameData, (xp) => { state.xp += xp; });
    };

    // Evaluate location changed to apartment_living
    QuestManager.evaluateEvent('location_changed', { locationId: 'apartment_living' }, state, gameData, completeFn);

    assert.ok(completedQuestIds.includes('q_explore_living'), 'q_explore_living should be completed');
    assert.ok(state.completedQuests.has('q_explore_living'));
    assert.ok(state.xp >= 40, 'XP reward should be added');

    // Quest chain: q_collect_key should be automatically started as active quest
    assert.ok(state.activeQuests.has('q_collect_key'), 'q_collect_key should be auto-started by quest chain');
});

test('QuestManager - evaluate different quest types', () => {
    const rawQuests = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));
    const gameData = { quests: rawQuests };

    const state = {
        citizenLvl: 1,
        activeQuests: new Set(['q_convo_ella', 'q_listening_fountain']),
        completedQuests: new Set(),
        discoveredObjects: new Set(['fountain']),
        unlockedGrammar: new Set(),
        xp: 0
    };

    let completed = [];
    const completeFn = (qid) => {
        completed.push(qid);
        QuestManager.completeQuest(qid, state, gameData);
    };

    // Evaluate conversation
    QuestManager.evaluateEvent('npc_interacted', { npcId: 'ella_bronx' }, state, gameData, completeFn);
    assert.ok(completed.includes('q_convo_ella'));

    // Evaluate listening
    QuestManager.evaluateEvent('speech_listened', { objId: 'fountain' }, state, gameData, completeFn);
    assert.ok(completed.includes('q_listening_fountain'));
});
