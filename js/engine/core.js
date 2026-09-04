/**
 * js/engine/core.js
 * Core engine orchestrator connecting independent system managers.
 */

import { EventBus } from './event_bus.js';
import { AssetManager } from './asset_manager.js';
import { SaveManager } from '../save/save_manager.js';
import { LocalizationManager } from '../localization/localization_manager.js';
import { InputManager } from '../input/input_manager.js';
import { CameraManager } from '../camera/camera_manager.js';
import { AudioManager } from '../audio/audio_manager.js';
import { SceneManager } from '../scenes/scene_manager.js';
import { StreamingWorldManager } from '../scenes/streaming_manager.js';
import { WorldBuilder } from '../world/world_builder.js';
import { BuildingManager } from '../world/building_system.js';
import { InteriorEngine } from '../world/interior_engine.js';
import { WorldMap } from '../world/world_map.js';
import { WorldSimulationEngine } from '../world/world_simulation.js';
import { MinigameFramework } from '../minigames/minigame_framework.js';
import { VocabularyEngine } from '../vocabulary/vocabulary_engine.js';
import { NPCAIEngine } from '../npc/npc_ai_engine.js';
import { StatsManager } from '../player/stats.js';
import { SceneRenderer } from '../scenes/scene_renderer.js';
import { InventoryManager } from '../inventory/inventory.js';
import { DialogueManager } from '../dialogue/dialogue.js';
import { QuestEngine } from '../quests/quest_engine.js';
import { QuestManager } from '../quests/quest_manager.js';
import { GrammarEngine } from '../grammar/grammar_engine.js';
import { ModalManager } from '../ui/modal.js';
import { HUDManager } from '../ui/hud.js';
import { checkCollision as checkAABBCollision } from '../utils/math.js';

export class GameEngine {
    constructor() {
        this.eventBus = new EventBus();
        this.saveManager = new SaveManager({ eventBus: this.eventBus });
        this.state = this.saveManager.loadInitialState();

        this.assetManager = new AssetManager();
        this.localizationManager = new LocalizationManager({
            defaultLanguage: this.state.currentLang || 'en',
            eventBus: this.eventBus
        });

        this.inputManager = new InputManager({ eventBus: this.eventBus });
        this.cameraManager = new CameraManager({ eventBus: this.eventBus });
        this.audioManager = new AudioManager({ eventBus: this.eventBus });

        this.npcAIEngine = new NPCAIEngine({
            eventBus: this.eventBus
        });

        this.vocabularyEngine = new VocabularyEngine({
            assetManager: this.assetManager,
            eventBus: this.eventBus
        });

        this.interiorEngine = new InteriorEngine({
            assetManager: this.assetManager,
            eventBus: this.eventBus
        });

        this.worldBuilder = new WorldBuilder({
            assetManager: this.assetManager,
            eventBus: this.eventBus
        });

        this.buildingManager = new BuildingManager({
            assetManager: this.assetManager,
            eventBus: this.eventBus,
            interiorEngine: this.interiorEngine
        });

        this.streamingManager = new StreamingWorldManager();
        this.sceneManager = new SceneManager({
            eventBus: this.eventBus,
            streamingManager: this.streamingManager
        });

        this.grammarEngine = new GrammarEngine(this);
        this.questEngine = new QuestEngine({ gameEngine: this, eventBus: this.eventBus });
        this.worldMap = new WorldMap({ gameEngine: this });
        this.worldSimulation = new WorldSimulationEngine({ gameEngine: this, eventBus: this.eventBus });
        this.minigameFramework = new MinigameFramework({ gameEngine: this, eventBus: this.eventBus });

        this.data = {
            languages: [],
            districts: {},
            objects: {},
            npcs: {},
            quests: [],
            grammarTree: []
        };

        // Player world position & loop flags
        this.playerWorldPos = { x: 400, y: 250 };
        this.cameraManager.setTarget(this.playerWorldPos);
        this.isLoopRunning = false;
        this.lastFrameTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

        this.dialogueManager = DialogueManager;

        // Forward compatibility aliases for audio
        this.audio = this.audioManager;

        // Footstep tracking parameters
        this._lastFootstepX = this.playerWorldPos.x;
        this._lastFootstepY = this.playerWorldPos.y;

        // Wire EventBus listeners for decoupling
        this._setupEventSubscriptions();
    }

    /**
     * @private
     */
    _setupEventSubscriptions() {
        this.eventBus.on('escapePressed', () => this.closeModal());
        this.eventBus.on('swipe', (data) => this.emit('swipe', data));
        this.eventBus.on('languageChanged', (evt) => {
            if (evt && evt.current) {
                this.state.currentLang = evt.current;
                this.saveState();
            }
        });
    }

    async init() {
        try {
            await this.loadData();
            this.localizationManager.setSupportedLanguages(this.data.languages || []);
            await this.sceneManager.init(this.state.currentLocationId, this.data);
            this.inputManager.init();
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

    /* Event System (Pub/Sub) backwards compatibility bridge */
    on(event, fn) {
        return this.eventBus.on(event, fn);
    }

    off(event, fn) {
        this.eventBus.off(event, fn);
    }

    emit(event, payload) {
        this.eventBus.emit(event, payload);
    }

    /* Asset & JSON Preloader using AssetManager & WorldBuilder */
    async loadData() {
        const basePath = 'data';
        const [languagesRes, districtsRes, objectsRes, npcsRes, questsRes, grammarRes, buildingsRes, roomsRes, vocabDbRes, minigamesJsonRes, worldSimRes] = await Promise.all([
            this.assetManager.loadJson(`${basePath}/languages/languages.json`),
            this.assetManager.loadJson(`${basePath}/scenes/districts.json`),
            this.assetManager.loadJson(`${basePath}/vocabulary/objects.json`),
            this.assetManager.loadJson(`${basePath}/npcs/npcs.json`),
            this.assetManager.loadJson(`${basePath}/quests/quests.json`),
            this.assetManager.loadJson(`${basePath}/grammar/grammar.json`),
            this.assetManager.loadJson(`${basePath}/buildings/buildings.json`).catch(() => ({})),
            this.assetManager.loadJson(`${basePath}/interiors/rooms.json`).catch(() => ({})),
            this.assetManager.loadJson(`${basePath}/vocabulary/vocabulary_database.json`).catch(() => ({})),
            this.assetManager.loadJson(`${basePath}/minigames/minigames.json`).catch(() => ([])),
            this.assetManager.loadJson(`${basePath}/world/world_simulation.json`).catch(() => ({}))
        ]);

        if (npcsRes) {
            this.npcAIEngine.registerNPCsDict(npcsRes);
        }

        if (vocabDbRes) {
            this.vocabularyEngine.registerVocabularyDict(vocabDbRes);
        }

        if (roomsRes) {
            this.interiorEngine.registerRooms(roomsRes);
        }

        if (worldSimRes) {
            this.worldSimulation.loadConfigFromJson(worldSimRes);
        }

        this.worldBuilder.registerDistricts(districtsRes);
        if (buildingsRes) {
            this.buildingManager.registerBuildings(buildingsRes);
        }

        this.data.languages = languagesRes;
        this.data.districts = this.worldBuilder.exportDistrictsObject();
        this.data.buildings = buildingsRes || {};
        this.data.objects = objectsRes;
        this.data.npcs = npcsRes;
        this.data.quests = questsRes;
        this.questEngine.loadQuestsFromJson(questsRes);
        this.data.grammarTree = grammarRes;

        if (minigamesJsonRes) {
            this.minigameFramework.loadMinigamesFromJson(minigamesJsonRes);
        } else if (typeof arguments !== 'undefined' && Array.isArray(arguments[0])) {
            this.minigameFramework.loadMinigamesFromJson(arguments[0]);
        }

        if (!this.state.visitedLocations) this.state.visitedLocations = new Set();
        if (this.state.visitedLocations.add) this.state.visitedLocations.add(this.state.currentLocationId || 'apartment_living');

        // Check grammar unlocks on load
        this.grammarEngine.checkGrammarUnlocks(this.state, this.data);

        // Evaluate quests on load
        this.checkQuests('init');

        if (typeof window !== 'undefined') {
            window.COSY_WORLD_DATA = this.data;
        }
        this.emit('dataLoaded', this.data);
    }

    /* Game Loop & Delta Time (Maintaining 60 FPS continuous streaming) */
    startGameLoop() {
        if (this.isLoopRunning) return;
        this.isLoopRunning = true;
        this.lastFrameTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

        const loop = (now) => {
            const dt = (now - this.lastFrameTime) / 1000;
            this.lastFrameTime = now;
            this.streamingManager.updateFPS(now);
            this.update(dt);
            if (this.isLoopRunning && typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(loop);
            }
        };

        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(loop);
        }
    }

    update(dt) {
        let moved = false;
        const speed = 250 * dt;

        if (this.inputManager.isKeyDown('ArrowLeft') || this.inputManager.isKeyDown('a')) {
            this.playerWorldPos.x -= speed;
            moved = true;
        }
        if (this.inputManager.isKeyDown('ArrowRight') || this.inputManager.isKeyDown('d')) {
            this.playerWorldPos.x += speed;
            moved = true;
        }
        if (this.inputManager.isKeyDown('ArrowUp') || this.inputManager.isKeyDown('w')) {
            this.playerWorldPos.y -= speed;
            moved = true;
        }
        if (this.inputManager.isKeyDown('ArrowDown') || this.inputManager.isKeyDown('s')) {
            this.playerWorldPos.y += speed;
            moved = true;
        }

        // Keep local position clamped inside viewport bounds
        this.playerWorldPos.x = Math.max(10, Math.min(790, this.playerWorldPos.x));
        this.playerWorldPos.y = Math.max(10, Math.min(490, this.playerWorldPos.y));

        this.worldSimulation.update(dt);
        this.state.worldSim = {
            timeOfDay: this.worldSimulation.timeOfDay,
            season: this.worldSimulation.season,
            weather: this.worldSimulation.weather,
            timeString: this.worldSimulation.getTimeString(),
            lightingRgba: this.worldSimulation.getLightingRgba()
        };

        // Sync weather audio
        this.audioManager.updateWeatherAudio(this.worldSimulation.weather, 0.8);

        // Update audio spatial listener position
        this.audioManager.setListenerPosition(this.playerWorldPos.x, this.playerWorldPos.y);

        this.cameraManager.update(dt);

        if (moved) {
            const stepDist = Math.hypot(this.playerWorldPos.x - this._lastFootstepX, this.playerWorldPos.y - this._lastFootstepY);
            if (stepDist > 30) {
                const surface = (this.state.currentLocationId && this.state.currentLocationId.includes('apartment')) ? 'wood' : 'stone';
                this.audioManager.playFootstep(surface, 1.0);
                this._lastFootstepX = this.playerWorldPos.x;
                this._lastFootstepY = this.playerWorldPos.y;
            }
        }

        if (moved) {
            // Check boundary crossing into adjacent district without loading screens
            const boundaryTarget = this.streamingManager.checkBoundaryCrossing(
                this.state.currentLocationId,
                this.playerWorldPos.x,
                this.playerWorldPos.y,
                this.data
            );

            if (boundaryTarget) {
                this.switchLocation(boundaryTarget, false);
                this.playerWorldPos.x = 400;
                this.playerWorldPos.y = 250;
            }
        }

        this.emit('tick', dt);
    }

    /* Input Listener Setup */
    bindInputListeners() {
        this.inputManager.init();
    }

    /* Collision Detection Helper */
    checkCollision(rect1, rect2) {
        return checkAABBCollision(rect1, rect2);
    }

    /* Save & Load System */
    saveState() {
        this.saveManager.saveState(this.state);
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
        if (typeof document === 'undefined') return;
        const sel = document.getElementById('cw-lang-sel');
        if (!sel || !this.data.languages) return;

        sel.innerHTML = this.data.languages.map(l => `
            <option value="${l.code}" ${l.code === this.state.currentLang ? 'selected' : ''}>${l.flag} ${l.label}</option>
        `).join('');
    }

    changeLanguage(code) {
        this.localizationManager.setLanguage(code);
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

    async switchLocation(locationId, showToastAlert = true) {
        const loc = await this.sceneManager.switchScene(locationId, this.state, this.data);
        if (!loc) return;

        if (!this.state.visitedLocations) this.state.visitedLocations = new Set();
        if (this.state.visitedLocations.add) this.state.visitedLocations.add(locationId);

        this.saveState();

        if (loc.music || loc.ambientSounds) {
            if (typeof document !== 'undefined') {
                const soundSel = document.getElementById('cw-sound-sel');
                if (soundSel) soundSel.value = loc.music || (loc.ambientSounds && loc.ambientSounds[0]) || 'none';
            }
            this.audioManager.setDistrictAudio(loc.music, loc.ambientSounds);
        }

        await this.renderWorldViewport();
        if (showToastAlert) {
            const locName = this.localizationManager.getText(loc.name);
            this.showToast(`Entered ${locName} 🚪`);
        }
        this.checkQuests('location_changed', { locationId });
        this.emit('locationChanged', locationId);
    }

    async enterBuilding(buildingId, entranceId = null) {
        const activeState = this.buildingManager.enterBuilding(buildingId, entranceId);
        if (!activeState) return;

        this.audioManager.setDistrictAudio(activeState.room.ambientAudio);
        await this.renderWorldViewport();
        const roomName = this.localizationManager.getText(activeState.room.name);
        this.showToast(`Entered ${roomName} 🚪`);
    }

    async exitBuilding() {
        const exited = this.buildingManager.exitBuilding();
        if (!exited) return;

        const loc = this.data.districts[this.state.currentLocationId];
        if (loc) {
            this.audioManager.setDistrictAudio(loc.music, loc.ambientSounds);
        }
        await this.renderWorldViewport();
        this.showToast(`Stepped Outside 🌤️`);
    }

    async renderWorldViewport() {
        await this.sceneManager.render(this.state, this.data, this.buildingManager);
    }

    inspectObject(objId) {
        const obj = this.data.objects[objId];
        if (obj && obj.vocabId) {
            this.vocabularyEngine.recordReview(obj.vocabId, 4);
        }

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

    handleBranchNode(npcId, nextNode, questId, rewardXP, friendshipGain = 0) {
        DialogueManager.handleBranchNode(npcId, nextNode, questId, rewardXP, friendshipGain, this);
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

    /* Interactive World Map & Fast Travel Methods */
    openWorldMap() {
        if (typeof document === 'undefined') return;
        const body = document.getElementById('cw-modal-body');
        if (!body) return;

        body.innerHTML = this.worldMap.renderMapHtml(this.state, this.data);
        this.openModal();

        const container = document.getElementById('cw-map-viewport-container');
        if (container) {
            this.worldMap.attachInteractions(container);
        }
    }

    refreshWorldMapUI() {
        if (typeof document === 'undefined') return;
        const body = document.getElementById('cw-modal-body');
        if (!body) return;

        body.innerHTML = this.worldMap.renderMapHtml(this.state, this.data);
        const container = document.getElementById('cw-map-viewport-container');
        if (container) {
            this.worldMap.attachInteractions(container);
        }
    }

    refreshWorldMapCanvas() {
        if (typeof document === 'undefined') return;
        const canvas = document.getElementById('cw-map-canvas-inner');
        if (!canvas) return;
        canvas.style.transform = `translate(${this.worldMap.pan.x}px, ${this.worldMap.pan.y}px) scale(${this.worldMap.zoom})`;
    }

    /* Minigame Launcher & Auto-Sync Methods */
    openMinigameLauncher() {
        if (typeof document === 'undefined') return;
        const body = document.getElementById('cw-modal-body');
        if (!body) return;

        body.innerHTML = this.minigameFramework.renderLauncherHtml(this.state, this.data);
        this.openModal();
    }

    launchMinigameUI(minigameId) {
        const mg = this.minigameFramework.getMinigame(minigameId);
        if (!mg) return;

        if (mg.type === 'sentence_builder' && mg.content.question) {
            this.openGrammarExercise(mg.content.exerciseId || 'ex_greetings_1');
            return;
        }

        const result = this.minigameFramework.evaluateMinigame(minigameId, true, this.state, this.data);
        if (typeof document === 'undefined') return;

        const body = document.getElementById('cw-modal-body');
        if (body) {
            body.innerHTML = `
                <div style="padding:1rem; text-align:center;">
                    <div style="font-size:2.5rem; margin-bottom:0.5rem;">🎉</div>
                    <h2 style="font-family:'Fraunces',serif; font-size:1.5rem; color:var(--text-main); margin-bottom:0.5rem;">
                        ${mg.title} Completed!
                    </h2>
                    <p style="font-size:0.95rem; color:var(--text-muted); margin-bottom:1rem;">
                        ${result.explanation}
                    </p>
                    <div style="font-size:1.1rem; font-weight:700; color:var(--blue-primary); margin-bottom:1.5rem;">
                        +${result.reward ? result.reward.xp : 50} XP Earned! ⭐
                    </div>
                    <button type="button" class="btn-g-primary" onclick="COSY_WORLD.closeModal()">Awesome! ✨</button>
                </div>
            `;
        }
    }

    async fastTravel(targetLocationId) {
        if (!this.worldMap.isVisited(targetLocationId, this.state)) {
            this.showToast(`Location locked! Discover it first on foot. 🔒`);
            return;
        }

        this.closeModal();
        await this.switchLocation(targetLocationId, false);
        const targetName = (this.data.districts && this.data.districts[targetLocationId]) ? this.data.districts[targetLocationId].name.en : targetLocationId;
        this.showToast(`Fast traveled to ${targetName}! 🚀`);
    }

    /* Grammar Engine Integration Methods */
    speakGrammarExample(text, lang = null) {
        const targetLang = lang || this.state.currentLang;
        this.grammarEngine.speakExample(text, targetLang);
    }

    openGrammarExercise(exerciseId) {
        if (typeof document === 'undefined') return;
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
            if (typeof window !== 'undefined') window._cwWordOrderAnswer = [];
        }

        this.openModal();
    }

    addWordToAnswer(word) {
        if (typeof window === 'undefined') return;
        if (!window._cwWordOrderAnswer) window._cwWordOrderAnswer = [];
        window._cwWordOrderAnswer.push(word);
        const sb = document.getElementById('cw-sentence-builder');
        if (sb) sb.textContent = window._cwWordOrderAnswer.join(' ');
    }

    clearWordBuilder() {
        if (typeof window === 'undefined') return;
        window._cwWordOrderAnswer = [];
        const sb = document.getElementById('cw-sentence-builder');
        if (sb) sb.textContent = '';
    }

    submitWordOrderExercise(exerciseId) {
        const answer = (typeof window !== 'undefined' && window._cwWordOrderAnswer) ? window._cwWordOrderAnswer.join(' ') : '';
        this.submitGrammarExercise(exerciseId, answer);
    }

    submitGrammarExercise(exerciseId, userAnswer) {
        const result = this.grammarEngine.evaluateExercise(exerciseId, userAnswer, this.state, this.data);
        if (typeof document === 'undefined') return;

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
        this.audioManager.speakText(text, lang);
    }

    playAmbience(type) {
        this.audioManager.playAmbience(type);
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
