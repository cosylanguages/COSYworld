/**
 * @file js/world/interior_engine.js
 * @description Modular, JSON-driven Interior Engine for COSY World.
 * Manages modular rooms (Living Room, Kitchen, Bedroom, Bathroom, Cafe, Restaurant, Classroom, Office, Hospital, Library)
 * with background styling, hotspots, NPCs, interactive objects, ambient sounds, and lighting profiles.
 */

export class InteriorEngine {
    /**
     * @param {Object} [options]
     * @param {import('../engine/asset_manager.js').AssetManager} [options.assetManager]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.assetManager = options.assetManager || null;
        this.eventBus = options.eventBus || null;

        /** @type {Map<string, Object>} Modular rooms registry keyed by room ID */
        this.rooms = new Map();
    }

    /**
     * Normalizes room JSON definition to ensure all required fields are present.
     * Required properties: background, hotspots, npcs, interactiveObjects, ambientSounds, lightingProfile.
     *
     * @param {string} roomId
     * @param {Object} rawData
     * @returns {Object} Normalized room data
     */
    normalizeRoom(roomId, rawData) {
        if (!rawData || typeof rawData !== 'object') {
            throw new Error(`Invalid room data for ID: ${roomId}`);
        }

        const normalized = {
            id: rawData.id || roomId,
            type: rawData.type || 'generic',
            name: rawData.name || { en: roomId },
            image: rawData.image || '🚪',
            viewBox: rawData.viewBox || '0 0 800 500',

            // 1. Background (wall color, floor color, decorative structures)
            background: rawData.background || {
                wallColor: '#f8fafc',
                floorColor: '#e2e8f0',
                dividerColor: '#cbd5e1',
                decorations: []
            },

            // 2. Hotspots (trigger zones, portals, inspection points)
            hotspots: Array.isArray(rawData.hotspots) ? rawData.hotspots : [],

            // 3. NPCs and spawn positions
            npcs: Array.isArray(rawData.npcs) ? rawData.npcs : [],
            npcSpawns: Array.isArray(rawData.npcSpawns)
                ? rawData.npcSpawns
                : (Array.isArray(rawData.npcs) ? rawData.npcs.map((npcId, i) => ({ npcId, x: 200 + i * 140, y: 300 })) : []),

            // 4. Interactive Objects
            interactiveObjects: Array.isArray(rawData.interactiveObjects)
                ? rawData.interactiveObjects
                : (Array.isArray(rawData.objects) ? rawData.objects : []),

            // 5. Ambient Sounds & Music
            ambientAudio: rawData.ambientAudio || (Array.isArray(rawData.ambientSounds) ? rawData.ambientSounds[0] : 'piano'),
            ambientSounds: Array.isArray(rawData.ambientSounds)
                ? rawData.ambientSounds
                : (rawData.ambientAudio ? [rawData.ambientAudio] : (rawData.music ? [rawData.music] : ['piano'])),

            // 6. Lighting Profile (tint, opacity, filter effect)
            lightingProfile: rawData.lightingProfile || {
                type: rawData.lighting || 'cozy',
                color: 'rgba(254, 243, 199, 0.1)',
                opacity: 0.1
            }
        };

        return normalized;
    }

    /**
     * Register a single room definition.
     * @param {string} id
     * @param {Object} roomData
     * @returns {Object}
     */
    registerRoom(id, roomData) {
        const normalized = this.normalizeRoom(id, roomData);
        this.rooms.set(normalized.id, normalized);
        if (this.eventBus) {
            this.eventBus.emit('roomRegistered', { id: normalized.id, room: normalized });
        }
        return normalized;
    }

    /**
     * Bulk register multiple room definitions.
     * @param {Object.<string, Object>} roomsDict
     */
    registerRooms(roomsDict) {
        if (!roomsDict || typeof roomsDict !== 'object') return;
        for (const [id, data] of Object.entries(roomsDict)) {
            this.registerRoom(id, data);
        }
    }

    /**
     * Retrieve a room definition by ID.
     * @param {string} id
     * @returns {Object|null}
     */
    getRoom(id) {
        return this.rooms.get(id) || null;
    }

    /**
     * Check if room exists.
     * @param {string} id
     * @returns {boolean}
     */
    hasRoom(id) {
        return this.rooms.has(id);
    }

    /**
     * Returns all registered rooms.
     * @returns {Object.<string, Object>}
     */
    exportRoomsObject() {
        const obj = {};
        for (const [id, room] of this.rooms.entries()) {
            obj[id] = room;
        }
        return obj;
    }
}
