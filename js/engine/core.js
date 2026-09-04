/**
 * games/cosy_world/js/engine/core.js
 * Core engine orchestrator that fetches JSON game datasets and coordinates components.
 *
 * Engine Capabilities Supported:
 * - Professional Dialogue Engine (branching tree nodes, speech rate 0.8x/1.0x/1.3x, repeat, slow toggle, typing animation, history log, speech rec input)
 * - Hotspot Engine (glow, pulse, ARIA accessibility, keyboard & click interaction)
 * - Scene loading & transition (100% data-driven from JSON with lazy loading)
 * - Asset preloading & JSON configuration parsing
 * - Publish-subscribe event system
 * - RequestAnimationFrame game loop & delta time
 * - Axis-Aligned Bounding Box (AABB) collision detection
 * - Camera movement, pan/zoom, and bounds clamping
 * - LocalStorage save/load state persistence
 * - Multi-lingual localization across 14 target languages
 * - Dynamic World Manager (roads, buildings, weather, ambient music, time of day)
 * - Modular Inductive Grammar Engine (mission-driven grammar unlocks, interactive exercises, scene integration, audio voice synthesis)
 * - Comprehensive Quest Manager (10 quest types, unlock conditions, quest chains, XP/vocab/grammar rewards)
 */

import { SaveSystem } from '../save/save_system.js';
import { StatsManager } from '../player/stats.js';
import { AudioManager } from '../audio/audio.js';
import { SceneRenderer } from '../scenes/scene_renderer.js';
import { InventoryManager } from '../inventory/inventory.js';
import { DialogueManager } from '../dialogue/dialogue.js';
import { QuestManager } from '../quests/quest_manager.js';
import { GrammarEngine } from '../grammar/grammar_engine.js';
import { ModalManager } from '../ui/modal.js';
import { HUDManager } from '../ui/hud.js';

export class GameEngine {
    constructor() {
        this.state = SaveSystem.loadInitialState();
        this.data = {
            languages: [],
            districts: {},
            objects: {},
            npcs: {},
            quests: [],
            grammarTree: []
        };
        this.audio = new AudioManager();
        this.grammarEngine = new GrammarEngine(this);
        this.eventListeners = {};
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.keysPressed = {};
        this.isLoopRunning = false;
        this.lastFrameTime = performance.now();
    }

    async init() {
        try {
            await this.loadData();
            this.bindInputListeners();
            this.startGameLoop();
            this.populateLanguageSelector();
            this.updatePlayerStats();
            await this.renderWorldViewport();
            this.renderHudTab();
        } catch (e) {
            console.error('Failed to initialize COSY World Engine:', e);
        }
    }

    /* Event System (Pub/Sub) */
    on(event, fn) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(fn);
    }

    off(event, fn) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== fn);
    }

    emit(event, payload) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event].forEach(fn => fn(payload));
    }

    /* Asset & JSON Preloader */
    async loadData() {
        const basePath = 'data';
        const [languagesRes, districtsRes, objectsRes, npcsRes, questsRes, grammarRes] = await Promise.all([
            fetch(`${basePath}/languages/languages.json`).then(r => r.json()),
            fetch(`${basePath}/scenes/districts.json`).then(r => r.json()),
            fetch(`${basePath}/vocabulary/objects.json`).then(r => r.json()),
            fetch(`${basePath}/npcs/npcs.json`).then(r => r.json()),
            fetch(`${basePath}/quests/quests.json`).then(r => r.json()),
            fetch(`${basePath}/grammar/grammar.json`).then(r => r.json())
        ]);

        this.data.languages = languagesRes;
        this.data.districts = districtsRes;
        this.data.objects = objectsRes;
        this.data.npcs = npcsRes;
        this.data.quests = questsRes;
        this.data.grammarTree = grammarRes;

        // Check grammar unlocks on load
        this.grammarEngine.checkGrammarUnlocks(this.state, this.data);

        // Evaluate quests on load
        this.checkQuests('init');

        window.COSY_WORLD_DATA = this.data;
        this.emit('dataLoaded', this.data);
    }

    /* Game Loop & Delta Time */
    startGameLoop() {
        if (this.isLoopRunning) return;
        this.isLoopRunning = true;
        this.lastFrameTime = performance.now();

        const loop = (now) => {
            const dt = (now - this.lastFrameTime) / 1000;
            this.lastFrameTime = now;
            this.update(dt);
            if (this.isLoopRunning) {
                requestAnimationFrame(loop);
            }
        };
        requestAnimationFrame(loop);
    }

    update(dt) {
        if (this.keysPressed['ArrowLeft'] || this.keysPressed['a']) this.camera.x = Math.max(this.camera.x - 200 * dt, -50);
        if (this.keysPressed['ArrowRight'] || this.keysPressed['d']) this.camera.x = Math.min(this.camera.x + 200 * dt, 50);
        if (this.keysPressed['ArrowUp'] || this.keysPressed['w']) this.camera.y = Math.max(this.camera.y - 200 * dt, -50);
        if (this.keysPressed['ArrowDown'] || this.keysPressed['s']) this.camera.y = Math.min(this.camera.y + 200 * dt, 50);

        this.emit('tick', dt);
    }

    /* Keyboard & Touch Gesture Controls */
    bindInputListeners() {
        window.addEventListener('keydown', (e) => {
            this.keysPressed[e.key] = true;
            if (e.key === 'Escape') this.closeModal();
        });
        window.addEventListener('keyup', (e) => {
            this.keysPressed[e.key] = false;
        });

        let touchStartX = 0;
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0) {
                const dx = e.changedTouches[0].clientX - touchStartX;
                const dy = e.changedTouches[0].clientY - touchStartY;
                if (Math.abs(dx) > 50 || Math.abs(dy) > 50) {
                    this.emit('swipe', { dx, dy });
                }
            }
        }, { passive: true });
    }

    /* Collision Detection Helper (AABB) */
    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    /* Save & Load System */
    saveState() {
        SaveSystem.saveState(this.state);
        this.emit('stateSaved', this.state);
    }

    toggleGuidePointers() {
        this.state.showGuidePointers = !this.state.showGuidePointers;
        this.saveState();
        this.renderWorldViewport();
        this.showToast(this.state.showGuidePointers ? 'Visual Guide Pointers ON 👉' : 'Visual Guide Pointers OFF 🕶️');
    }

    toggleTranslations() {
        this.state.showTranslations = !this.state.showTranslations;
        this.saveState();
        this.renderHudTab();
        this.showToast(this.state.showTranslations ? 'Translations ON (Accessibility) 🌐' : 'Direct Immersion Mode ON 🎯');
    }

    populateLanguageSelector() {
        const sel = document.getElementById('cw-lang-sel');
        if (!sel || !this.data.languages) return;

        sel.innerHTML = this.data.languages.map(l => `
            <option value="${l.code}" ${l.code === this.state.currentLang ? 'selected' : ''}>${l.flag} ${l.label}</option>
        `).join('');
    }

    changeLanguage(code) {
        this.state.currentLang = code;
        this.saveState();
        this.renderWorldViewport();
        this.renderHudTab();
        this.showToast(`Target Language: ${code.toUpperCase()} 🌍`);
    }

    updatePlayerStats() {
        StatsManager.updatePlayerStats(this.state);
    }

    addXP(amount) {
        StatsManager.addXP(this.state, amount, (msg) => this.showToast(msg));
        this.saveState();
    }

    async switchLocation(locationId) {
        const loc = this.data.districts[locationId];
        if (!loc) return;

        this.state.currentLocationId = locationId;
        this.saveState();

        if (loc.music) {
            const soundSel = document.getElementById('cw-sound-sel');
            if (soundSel) soundSel.value = loc.music;
            this.playAmbience(loc.music);
        }

        await this.renderWorldViewport();
        this.showToast(`Entered ${loc.name[this.state.currentLang] || loc.name.en} 🚪`);
        this.checkQuests('location_changed', { locationId });
        this.emit('locationChanged', locationId);
    }

    async renderWorldViewport() {
        await SceneRenderer.renderWorldViewport(this.state, this.data);
    }

    inspectObject(objId) {
        InventoryManager.inspectObject(
            objId,
            this.state,
            this.data,
            (amount) => this.addXP(amount),
            () => this.checkQuests('object_inspected', { objId }),
            (text, lang) => this.speakText(text, lang),
            () => this.openModal(),
            () => this.renderWorldViewport(),
            () => this.renderHudTab()
        );
        this.checkQuests('object_inspected', { objId });
        this.emit('hotspotInspected', objId);
    }

    triggerActionChain(objId) {
        const obj = this.data.objects[objId];
        if (!obj || !obj.actionChain) return;

        this.showToast(`Action Triggered: ${obj.actionChain.actionIcon}! ✨`);
        this.closeModal();

        if (obj.actionChain.nextObject === 'door_lock') {
            this.completeQuest('q1_key_door');
            this.completeQuest('q_collect_key');
        }
    }

    interactNPC(npcId) {
        DialogueManager.interactNPC(
            npcId,
            this.state,
            this.data,
            () => this.openModal()
        );
        this.checkQuests('npc_interacted', { npcId });
    }

    handleDialogueOption(npcId, questId) {
        if (questId && this.data.quests.find(q => q.id === questId)) {
            if (!this.state.completedQuests.has(questId)) {
                this.state.activeQuests.add(questId);
                this.completeQuest(questId);
            }
        }
        this.closeModal();
    }

    handleBranchNode(npcId, nextNode, questId, rewardXP) {
        DialogueManager.handleBranchNode(npcId, nextNode, questId, rewardXP, this);
    }

    repeatSpeech() {
        DialogueManager.repeatSpeech(this.state.currentLang);
        if (this.data && this.data.npcs) {
            const currentNpc = Object.keys(this.data.npcs)[0];
            this.checkQuests('pronunciation_practiced', { npcId: currentNpc });
        }
    }

    toggleSlowSpeech() {
        DialogueManager.toggleSlowSpeech(this.state.currentLang);
    }

    setSpeechSpeed(speed) {
        DialogueManager.setSpeechSpeed(speed, this.state.currentLang);
    }

    toggleDialogueHistory() {
        DialogueManager.toggleDialogueHistory();
    }

    startVoiceRecognition() {
        DialogueManager.startVoiceRecognition();
    }

    completeQuest(questId) {
        QuestManager.completeQuest(
            questId,
            this.state,
            this.data,
            (amount) => this.addXP(amount),
            () => this.saveState(),
            () => this.renderHudTab(),
            (msg) => this.showToast(msg),
            this.grammarEngine
        );
    }

    checkQuests(eventType = 'general', payload = {}) {
        QuestManager.evaluateEvent(
            eventType,
            payload,
            this.state,
            this.data,
            (qid) => this.completeQuest(qid)
        );
    }

    /* Grammar Engine Integration Methods */
    speakGrammarExample(text, lang = null) {
        const targetLang = lang || this.state.currentLang;
        this.grammarEngine.speakExample(text, targetLang);
    }

    openGrammarExercise(exerciseId) {
        const found = this.grammarEngine.findExercise(exerciseId, this.data);
        if (!found) return;

        const { exercise, grammarPoint } = found;
        const body = document.getElementById('cw-modal-body');
        if (!body) return;

        if (exercise.type === 'multiple_choice') {
            body.innerHTML = `
                <div style="padding:0.5rem;">
                    <div style="font-size:0.85rem; font-weight:700; color:var(--blue-primary); margin-bottom:0.25rem;">
                        🧩 Interactive Grammar Practice • ${grammarPoint.title}
                    </div>
                    <h2 style="font-family:'Fraunces',serif; font-size:1.4rem; color:var(--text-main); margin-bottom:1rem;">
                        ${exercise.question}
                    </h2>

                    <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.25rem;">
                        ${exercise.options.map((opt, idx) => `
                            <button class="btn-g-secondary" type="button" style="text-align:left; font-size:1rem; padding:0.75rem 1rem;" onclick="COSY_WORLD.submitGrammarExercise('${exercise.id}', ${idx})">
                                ${['A', 'B', 'C', 'D'][idx]}. ${opt}
                            </button>
                        `).join('')}
                    </div>

                    <div id="cw-exercise-feedback" style="display:none; padding:0.75rem; border-radius:10px; font-size:0.9rem; font-weight:600;"></div>
                </div>
            `;
        } else if (exercise.type === 'word_order') {
            const words = exercise.words || [];
            body.innerHTML = `
                <div style="padding:0.5rem;">
                    <div style="font-size:0.85rem; font-weight:700; color:var(--blue-primary); margin-bottom:0.25rem;">
                        🧩 Word Reordering Exercise • ${grammarPoint.title}
                    </div>
                    <h2 style="font-family:'Fraunces',serif; font-size:1.4rem; color:var(--text-main); margin-bottom:1rem;">
                        ${exercise.question}
                    </h2>

                    <div style="background:var(--blue-light); padding:1rem; border-radius:12px; margin-bottom:1rem;">
                        <div id="cw-word-bank" style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
                            ${words.map(w => `
                                <button type="button" class="cw-btn-toggle" style="font-size:1rem; padding:0.4rem 0.8rem;" onclick="COSY_WORLD.addWordToAnswer('${w.replace(/'/g, "\\'")}')">${w}</button>
                            `).join('')}
                        </div>
                        <div style="font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.4rem;">Your Sentence:</div>
                        <div id="cw-sentence-builder" style="min-height:40px; background:white; border:2px dashed var(--border-subtle); border-radius:8px; padding:0.5rem; font-size:1.1rem; font-weight:700; color:var(--text-main);"></div>
                    </div>

                    <div style="display:flex; gap:0.5rem;">
                        <button type="button" class="cw-btn-toggle" style="flex:1;" onclick="COSY_WORLD.clearWordBuilder()">Clear 🔄</button>
                        <button type="button" class="btn-g-primary" style="flex:2;" onclick="COSY_WORLD.submitWordOrderExercise('${exercise.id}')">Submit Answer ✨</button>
                    </div>

                    <div id="cw-exercise-feedback" style="display:none; margin-top:1rem; padding:0.75rem; border-radius:10px; font-size:0.9rem; font-weight:600;"></div>
                </div>
            `;
            window._cwWordOrderAnswer = [];
        }

        this.openModal();
    }

    addWordToAnswer(word) {
        if (!window._cwWordOrderAnswer) window._cwWordOrderAnswer = [];
        window._cwWordOrderAnswer.push(word);
        const sb = document.getElementById('cw-sentence-builder');
        if (sb) sb.textContent = window._cwWordOrderAnswer.join(' ');
    }

    clearWordBuilder() {
        window._cwWordOrderAnswer = [];
        const sb = document.getElementById('cw-sentence-builder');
        if (sb) sb.textContent = '';
    }

    submitWordOrderExercise(exerciseId) {
        const answer = window._cwWordOrderAnswer ? window._cwWordOrderAnswer.join(' ') : '';
        this.submitGrammarExercise(exerciseId, answer);
    }

    submitGrammarExercise(exerciseId, userAnswer) {
        const result = this.grammarEngine.evaluateExercise(exerciseId, userAnswer, this.state, this.data);
        const fb = document.getElementById('cw-exercise-feedback');

        if (fb) {
            fb.style.display = 'block';
            if (result.success) {
                fb.style.background = '#d1fae5';
                fb.style.color = '#065f46';
                fb.style.border = '1px solid #34d399';
                fb.innerHTML = `🎉 Correct! +${result.xpReward} XP ⭐<br><span style="font-weight:normal; font-size:0.85rem;">${result.explanation}</span>`;
            } else {
                fb.style.background = '#fee2e2';
                fb.style.color = '#991b1b';
                fb.style.border = '1px solid #f87171';
                fb.innerHTML = `❌ Try again!<br><span style="font-weight:normal; font-size:0.85rem;">${result.explanation}</span>`;
            }
        }

        if (result.success) {
            this.checkQuests('exercise_completed', { exerciseId });
            this.saveState();
            this.renderHudTab();
            setTimeout(() => {
                this.closeModal();
            }, 1800);
        }
    }

    speakText(text, lang) {
        this.audio.speakText(text, lang);
    }

    playAmbience(type) {
        this.audio.playAmbience(type);
    }

    switchTab(tabName, btnEl) {
        HUDManager.switchTab(tabName, btnEl, this.state, () => this.renderHudTab());
    }

    renderHudTab() {
        HUDManager.renderHudTab(this.state, this.data, (objId) => this.inspectObject(objId));
    }

    openModal() {
        ModalManager.openModal();
    }

    closeModal() {
        ModalManager.closeModal();
    }

    showToast(msg) {
        HUDManager.showToast(msg);
    }
}
