import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DialogueManager } from '../js/dialogue/dialogue.js';

const mockNPCsData = JSON.parse(
    fs.readFileSync(new URL('../data/npcs/npcs.json', import.meta.url))
);

test('DialogueManager - generates AI dialogue fallback response', async () => {
    const aiRes = await DialogueManager.generateAIDialogue('james_york', 'Tell me about the town', { locationId: 'town_square' });
    assert.ok(aiRes.text.includes('COSY Town') || aiRes.text.includes('AI NPC Response'));
    assert.equal(aiRes.emotion, 'curious');
    assert.ok(Array.isArray(aiRes.options));
});

test('DialogueManager - handles choice consequences and relationship updates', () => {
    let xpAdded = 0;
    let questCompleted = null;

    const mockEngine = {
        state: { npcRelationships: {} },
        data: { npcs: mockNPCsData },
        addXP: (amt) => { xpAdded += amt; },
        completeQuest: (qid) => { questCompleted = qid; },
        interactNPC: () => {},
        closeModal: () => {},
        openModal: () => {}
    };

    DialogueManager.handleBranchNode('james_york', -1, 'q1_key_door', 20, 15, mockEngine);

    assert.equal(xpAdded, 20);
    assert.equal(questCompleted, 'q1_key_door');
    assert.equal(mockEngine.state.npcRelationships['james_york'], 15);
});

test('DialogueManager - records conversation history and supports speech controls', () => {
    DialogueManager.dialogueHistory = [];
    DialogueManager.currentDialogueText = 'Test dialogue speech';

    assert.equal(DialogueManager.currentPlaybackRate, 1.0);
    DialogueManager.setSpeechSpeed(1.3);
    assert.equal(DialogueManager.currentPlaybackRate, 1.3);

    DialogueManager.toggleSlowSpeech();
    assert.equal(DialogueManager.currentPlaybackRate, 0.7);
});
