/**
 * @file js/scenes/scene_manager.js
 * @description Scene Manager for COSY World.
 * Manages scene lifecycle, district transitions, hotspots, and integration with SceneRenderer and StreamingWorldManager.
 */

import { SceneRenderer } from './scene_renderer.js';
import { StreamingWorldManager } from './streaming_manager.js';

export class SceneManager {
    /**
     * @param {Object} [options]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     * @param {StreamingWorldManager} [options.streamingManager]
     */
    constructor(options = {}) {
        this.eventBus = options.eventBus || null;
        this.streamingManager = options.streamingManager || new StreamingWorldManager();
        this.currentSceneId = null;
        /** @type {Map<string, Object>} Active scene hotspot registry */
        this.hotspots = new Map();
    }

    /**
     * Initialize scene manager with starting location.
     * @param {string} initialLocationId
     * @param {Object} gameData
     */
    async init(initialLocationId, gameData) {
        this.currentSceneId = initialLocationId || 'apartment_living';
        await this.streamingManager.initStreaming(this.currentSceneId, gameData);
        if (this.eventBus) {
            this.eventBus.emit('sceneInitialized', { locationId: this.currentSceneId });
        }
    }

    /**
     * Switch active scene location with streaming transition.
     * @param {string} locationId
     * @param {Object} state
     * @param {Object} gameData
     * @returns {Promise<Object|null>} The loaded district dataset or null.
     */
    async switchScene(locationId, state, gameData) {
        if (!gameData || !gameData.districts || !gameData.districts[locationId]) {
            return null;
        }

        const district = gameData.districts[locationId];
        const previous = this.currentSceneId;
        this.currentSceneId = locationId;
        state.currentLocationId = locationId;

        // Perform streaming loads & unloads
        await this.streamingManager.loadDistrict(locationId, gameData);
        await this.preloadAdjacent(locationId, gameData);
        this.streamingManager.unloadDistantDistricts(locationId, gameData);

        // Register hotspots for current district
        this._registerHotspots(district);

        if (this.eventBus) {
            this.eventBus.emit('sceneChanged', {
                previous,
                current: locationId,
                district
            });
        }

        return district;
    }

    /**
     * Render the active viewport scene using SceneRenderer.
     * @param {Object} state
     * @param {Object} gameData
     */
    async render(state, gameData, buildingManager = null) {
        await SceneRenderer.renderWorldViewport(state, gameData, this.streamingManager, buildingManager);
    }

    /**
     * Preload adjacent neighboring scenes.
     * @param {string} locationId
     * @param {Object} gameData
     */
    async preloadAdjacent(locationId, gameData) {
        await this.streamingManager.preloadAdjacentDistricts(locationId, gameData);
    }

    /**
     * Get registered hotspots for current active scene.
     * @returns {Map<string, Object>}
     */
    getHotspots() {
        return this.hotspots;
    }

    /**
     * @private
     */
    _registerHotspots(district) {
        this.hotspots.clear();
        if (!district || !Array.isArray(district.objects)) return;
        district.objects.forEach(obj => {
            if (typeof obj === 'string') {
                this.hotspots.set(obj, { id: obj });
            } else if (obj && obj.id) {
                this.hotspots.set(obj.id, obj);
            }
        });
    }
}
