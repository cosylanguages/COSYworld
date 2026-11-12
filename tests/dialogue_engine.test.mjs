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

test('DialogueManager - does not substitute English dialogue for a missing target-language entry', async () => {
    let modalOpened = false;
    DialogueManager.currentDialogueText = 'previous dialogue';

    await DialogueManager.interactNPC(
        'test_npc',
        { currentLang: 'fr', currentLocationId: 'town', npcRelationships: {} },
        { npcs: { test_npc: { name: 'Personnage', dialogues: { en: [{ text: 'Hello there!' }] } } } },
        () => { modalOpened = true; }
    );

    assert.equal(DialogueManager.currentDialogueText, '');
    assert.equal(modalOpened, true);
});

test('DialogueManager - speech recognition follows the selected target language', () => {
    const previousWindow = globalThis.window;
    const previousAlert = globalThis.alert;
    let recognitionInstance;
    const alerts = [];

    globalThis.window = {
        SpeechRecognition: class {
            constructor() { recognitionInstance = this; }
            start() {}
        }
    };
    globalThis.alert = (message) => alerts.push(message);
    DialogueManager.currentLanguage = 'fr';

    try {
        DialogueManager.startVoiceRecognition();
        assert.equal(recognitionInstance.lang, 'fr-FR');
        recognitionInstance.onresult({ results: [[{ transcript: 'Bonjour' }]] });
        assert.match(alerts[0], /Parole reconnue/);
        assert.match(alerts[0], /Bonjour/);
    } finally {
        if (previousWindow === undefined) delete globalThis.window;
        else globalThis.window = previousWindow;
        if (previousAlert === undefined) delete globalThis.alert;
        else globalThis.alert = previousAlert;
        DialogueManager.currentLanguage = 'en';
    }
});

test('DialogueManager - rejects legacy English scene trees for non-English learners', async () => {
    let modalOpened = false;
    DialogueManager.currentDialogueText = 'previous dialogue';

    await DialogueManager.interactNPC(
        'test_npc',
        { currentLang: 'fr', currentLocationId: 'town', npcRelationships: {} },
        {
            npcs: { test_npc: { name: 'Personnage', dialogues: { en: [{ text: 'Hello there!' }] } } },
            assetManager: {
                loadJson: async () => ({
                    npcId: 'test_npc',
                    sceneId: 'town',
                    nodes: [{ id: 'node_0', npcLine: 'Hello from an English scene tree!' }]
                })
            }
        },
        () => { modalOpened = true; }
    );

    assert.equal(DialogueManager.currentDialogueText, '');
    assert.equal(modalOpened, true);
});
