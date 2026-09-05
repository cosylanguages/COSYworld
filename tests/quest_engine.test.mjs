import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { QuestEngine } from '../js/quests/quest_engine.js';

test('QuestEngine - category normalization', () => {
    assert.equal(QuestEngine.normalizeCategory('vocabulary'), 'vocabulary');
    assert.equal(QuestEngine.normalizeCategory('collect'), 'vocabulary');
    assert.equal(QuestEngine.normalizeCategory('grammar'), 'grammar');
    assert.equal(QuestEngine.normalizeCategory('listening'), 'listening');
    assert.equal(QuestEngine.normalizeCategory('speaking'), 'speaking');
    assert.equal(QuestEngine.normalizeCategory('pronunciation'), 'speaking');
    assert.equal(QuestEngine.normalizeCategory('conversation'), 'speaking');
    assert.equal(QuestEngine.normalizeCategory('reading'), 'reading');
    assert.equal(QuestEngine.normalizeCategory('exploration'), 'exploration');
    assert.equal(QuestEngine.normalizeCategory('timed challenge'), 'exploration');
    assert.equal(QuestEngine.normalizeCategory('shopping'), 'shopping');
    assert.equal(QuestEngine.normalizeCategory('cooking'), 'cooking');
    assert.equal(QuestEngine.normalizeCategory('photography'), 'photography');
    assert.equal(QuestEngine.normalizeCategory('photograph'), 'photography');
    assert.equal(QuestEngine.normalizeCategory('travel'), 'travel');
    assert.equal(QuestEngine.normalizeCategory('directions'), 'travel');
});

test('QuestEngine - JSON dataset covers all 10 required categories', () => {
    const rawData = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));
    const engine = new QuestEngine({ quests: rawData });

    const expectedCategories = [
        'vocabulary', 'grammar', 'listening', 'speaking', 'reading',
        'exploration', 'shopping', 'cooking', 'photography', 'travel'
    ];

    expectedCategories.forEach(cat => {
        const matching = engine.getQuestsByCategory(cat);
        assert.ok(matching.length > 0, `Dataset missing quest for category: ${cat}`);
    });
});

test('QuestEngine - chapter manifest covers the complete campaign', () => {
    const quests = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));
    const chapterData = JSON.parse(fs.readFileSync(path.resolve('data/config/chapters.json'), 'utf8'));
    const engine = new QuestEngine({ quests });
    engine.registerChapters(chapterData);

    assert.equal(engine.chapters.length, 12);
    for (const chapter of engine.chapters) {
        assert.match(chapter.id, /^ch(?:[1-9]|1[0-2])$/);
        assert.ok(engine.getQuest(chapter.startQuestId), `${chapter.id} start quest is missing`);
        assert.ok(engine.getQuest(chapter.completionQuestId), `${chapter.id} completion quest is missing`);
        assert.equal(engine.getQuest(chapter.completionQuestId).chapter, chapter.id);
    }

    const state = { completedQuests: new Set(['q_ch1_open_apartment']) };
    const progress = engine.getChapterProgress('ch1', state);
    assert.equal(progress.completed, true);
    assert.equal(progress.completionQuestId, 'q_ch1_open_apartment');

    const transitionState = {
        currentChapter: 'ch1',
        activeQuests: new Set(['q_ch1_open_apartment']),
        completedQuests: new Set(),
        discoveredObjects: new Set(),
        unlockedGrammar: new Set()
    };
    engine.completeQuest('q_ch1_open_apartment', transitionState);
    assert.equal(transitionState.currentChapter, 'ch2');
});

test('Pedagogical data - quest and dialogue references resolve', () => {
    const quests = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));
    const objects = JSON.parse(fs.readFileSync(path.resolve('data/vocabulary/objects.json'), 'utf8'));
    const vocabulary = JSON.parse(fs.readFileSync(path.resolve('data/vocabulary/vocabulary_database.json'), 'utf8'));
    const grammar = Object.fromEntries(JSON.parse(fs.readFileSync(path.resolve('data/grammar/grammar.json'), 'utf8')).map(entry => [entry.id, entry]));
    const sceneIds = new Set(Object.keys(JSON.parse(fs.readFileSync(path.resolve('data/scenes/districts.json'), 'utf8'))));

    for (const quest of quests) {
        assert.ok(['A0', 'A1'].includes(quest.difficulty), `${quest.id} exceeds the A0-A1 quest scope`);
        for (const objective of quest.objectives || []) {
            for (const objectId of objective.targetObjects || []) {
                assert.ok(objects[objectId], `${quest.id} references missing object ${objectId}`);
                if (objective.targetLocation) {
                    assert.equal(
                        objects[objectId].locationId,
                        objective.targetLocation,
                        `${quest.id}/${objectId} is outside target scene ${objective.targetLocation}`
                    );
                }
            }
            if (objective.targetLocation) assert.ok(sceneIds.has(objective.targetLocation), `${quest.id} references missing scene ${objective.targetLocation}`);
            if (objective.targetGrammarId) assert.ok(grammar[objective.targetGrammarId], `${quest.id} references missing grammar ${objective.targetGrammarId}`);
        }
    }

    const dialogueFiles = fs.readdirSync(path.resolve('data/dialogues')).filter(file => file.endsWith('.json'));
    for (const file of dialogueFiles) {
        const dialogue = JSON.parse(fs.readFileSync(path.resolve('data/dialogues', file), 'utf8'));
        for (const node of dialogue.nodes || []) {
            for (const option of node.playerOptions || []) {
                if (option.vocabId) assert.ok(vocabulary[option.vocabId] || objects[option.vocabId], `${file} references missing vocabulary ${option.vocabId}`);
                if (option.grammarId) assert.ok(grammar[option.grammarId], `${file} references missing grammar ${option.grammarId}`);
            }
        }
    }
});

test('QuestEngine - supports requirements, steps, objectives, rewards, dialogues, npcTriggers, and sceneTriggers', () => {
    const rawData = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));
    const engine = new QuestEngine({ quests: rawData });

    engine.quests.forEach(q => {
        assert.ok(q.id, 'Quest must have ID');
        assert.ok(q.category, `Quest ${q.id} missing category`);
        assert.ok(q.title, `Quest ${q.id} missing title`);
        assert.ok(q.requirements, `Quest ${q.id} missing requirements`);
        assert.ok(Array.isArray(q.steps) && q.steps.length > 0, `Quest ${q.id} missing steps`);
        assert.ok(Array.isArray(q.objectives) && q.objectives.length > 0, `Quest ${q.id} missing objectives`);
        assert.ok(q.rewards, `Quest ${q.id} missing rewards`);
        assert.ok(q.dialogues, `Quest ${q.id} missing dialogues`);
        assert.ok(Array.isArray(q.npcTriggers), `Quest ${q.id} missing npcTriggers`);
        assert.ok(Array.isArray(q.sceneTriggers), `Quest ${q.id} missing sceneTriggers`);
    });
});

test('QuestEngine - calculates quest progress and percentage correctly', () => {
    const engine = new QuestEngine();
    const mockQuest = {
        id: 'q_test_progress',
        category: 'cooking',
        title: 'Bake Pie',
        description: 'Bake a pie',
        objectives: [
            { id: 'o1', type: 'cooking', requiredCount: 1 },
            { id: 'o2', type: 'cooking', requiredCount: 1 }
        ],
        steps: [
            { id: 's1', description: 'Mix dough' },
            { id: 's2', description: 'Bake pie' }
        ],
        reward: { xp: 50 }
    };

    engine.registerQuests([mockQuest]);

    const state = {
        activeQuests: new Set(['q_test_progress']),
        completedQuests: new Set(),
        questProgress: {
            'q_test_progress': {
                completedSteps: ['s1'],
                completedObjectives: ['o1']
            }
        }
    };

    const progress = engine.getQuestProgress('q_test_progress', state);
    assert.equal(progress.percentage, 50);
    assert.equal(progress.isComplete, false);

    // Complete second objective
    state.completedQuests.add('q_test_progress');
    const finalProgress = engine.getQuestProgress('q_test_progress', state);
    assert.equal(finalProgress.percentage, 100);
    assert.equal(finalProgress.isComplete, true);
});

test('QuestEngine - NPC triggers and scene triggers evaluation', () => {
    const rawData = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));
    const engine = new QuestEngine({ quests: rawData });

    const state = {
        citizenLvl: 1,
        activeQuests: new Set(['q_explore_living']),
        completedQuests: new Set(),
        discoveredObjects: new Set(),
        xp: 0
    };

    let completedIds = [];
    const completeFn = (qid) => {
        completedIds.push(qid);
        engine.completeQuest(qid, state, null, (xp) => { state.xp += xp; });
    };

    // Trigger scene trigger for q_explore_living
    engine.triggerScene('apartment_living', null, 'enter', state, null, completeFn);
    assert.ok(completedIds.includes('q_explore_living'), 'q_explore_living should complete on scene trigger');
    assert.ok(state.completedQuests.has('q_explore_living'));

    // Next quest q_collect_key should be active now
    assert.ok(state.activeQuests.has('q_collect_key'));

    // Trigger scene trigger for q_collect_key with key hotspot
    state.discoveredObjects.add('key');
    engine.triggerScene('apartment_living', 'key', 'inspect', state, null, completeFn);
    assert.ok(completedIds.includes('q_collect_key'), 'q_collect_key should complete when key is inspected');
});

test('QuestEngine - retrieves stage dialogues correctly', () => {
    const rawData = JSON.parse(fs.readFileSync(path.resolve('data/quests/quests.json'), 'utf8'));
    const engine = new QuestEngine({ quests: rawData });

    const startDiag = engine.getDialogue('q_cooking_bread', 'start');
    const completeDiag = engine.getDialogue('q_cooking_bread', 'complete');

    assert.ok(startDiag.length > 0, 'Start dialogue should not be empty');
    assert.ok(completeDiag.length > 0, 'Complete dialogue should not be empty');
});
