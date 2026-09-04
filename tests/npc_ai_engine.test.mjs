import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NPCAIEngine } from '../js/npc/npc_ai_engine.js';

const mockNPCsData = JSON.parse(
    fs.readFileSync(new URL('../data/npcs/npcs.json', import.meta.url))
);

test('NPCAIEngine - registers and normalizes realistic NPC AI fields', () => {
    const aiEngine = new NPCAIEngine();
    aiEngine.registerNPCsDict(mockNPCsData);

    assert.ok(aiEngine.npcs.size >= 8);
    const dylan = aiEngine.getNPC('dylan_chef');

    assert.equal(dylan.id, 'dylan_chef');
    assert.equal(dylan.personality, 'extrovert');
    assert.equal(dylan.currentMood, 'happy');
    assert.equal(dylan.occupation, 'Executive Chef');
    assert.ok(Array.isArray(dylan.dailySchedule));
    assert.ok(Array.isArray(dylan.conversationHistory));
    assert.ok(Array.isArray(dylan.questHistory));
});

test('NPCAIEngine - autonomous daily schedule tick relocates NPCs', () => {
    const aiEngine = new NPCAIEngine();
    aiEngine.registerNPCsDict(mockNPCsData);

    const dylan = aiEngine.getNPC('dylan_chef');

    // Simulate clock ticking to 08:00
    aiEngine.updateScheduleTick('08:00');
    assert.equal(dylan.location, 'cafe');

    // Simulate clock ticking to 12:00
    aiEngine.updateScheduleTick('12:00');
    assert.equal(dylan.location, 'restaurant');
    assert.equal(dylan.currentActivity, 'Cooking lunch specials');
});

test('NPCAIEngine - autonomous NPC-to-NPC proximity interactions', () => {
    const aiEngine = new NPCAIEngine();
    aiEngine.registerNPCsDict(mockNPCsData);

    // Relocate Thomas and Diana to town_square at the same time
    aiEngine.updateScheduleTick('18:00'); // Thomas -> town_square
    aiEngine.updateScheduleTick('19:00'); // Diana -> town_square

    assert.ok(aiEngine.npcInteractions.length > 0);
    const lastInteraction = aiEngine.npcInteractions[aiEngine.npcInteractions.length - 1];
    assert.equal(lastInteraction.location, 'town_square');
});

test('NPCAIEngine - dynamic player reaction greeting & friendship progression', () => {
    const aiEngine = new NPCAIEngine();
    aiEngine.registerNPCsDict(mockNPCsData);

    const initialReaction = aiEngine.getReactionToPlayer('dylan_chef');
    assert.ok(initialReaction.greeting);

    // Record player conversations to build friendship
    aiEngine.recordConversation('dylan_chef', 'Hello Dylan!', 50); // Level 2
    const level2Reaction = aiEngine.getReactionToPlayer('dylan_chef');
    assert.equal(level2Reaction.relationshipLevel, 2);

    aiEngine.recordConversation('dylan_chef', 'Great soup!', 50); // Level 3 (total 100 FP)
    const level3Reaction = aiEngine.getReactionToPlayer('dylan_chef');
    assert.equal(level3Reaction.relationshipLevel, 3);
    assert.equal(level3Reaction.mood, 'excited');
});
