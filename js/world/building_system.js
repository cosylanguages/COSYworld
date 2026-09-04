/**
 * @file js/world/building_system.js
 * @description JSON-driven Building System for COSY World.
 * Manages building exteriors, interior rooms, entrances, NPCs, interactive objects, quests,
 * and ambient audio with independent room loading and memory optimization.
 */

export class BuildingManager {
    /**
     * @param {Object} [options]
     * @param {import('../engine/asset_manager.js').AssetManager} [options.assetManager]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.assetManager = options.assetManager || null;
        this.eventBus = options.eventBus || null;

        /** @type {Map<string, Object>} Registered buildings keyed by building ID */
        this.buildings = new Map();

        /** @type {Map<string, Object>} Active loaded rooms keyed by "buildingId:roomId" to optimize memory */
        this.loadedRooms = new Map();

        /** @type {Object|null} Currently active building interior state */
        this.activeBuildingState = null;
    }

    /**
     * Normalizes building JSON data to guarantee all required properties exist.
     * @param {string} buildingId
     * @param {Object} rawData
     * @returns {Object}
     */
    normalizeBuilding(buildingId, rawData) {
        if (!rawData || typeof rawData !== 'object') {
            throw new Error(`Invalid building data provided for ID: ${buildingId}`);
        }

        const normalized = {
            id: rawData.id || buildingId,
            name: rawData.name || { en: buildingId },
            image: rawData.image || '🏢',
            districtId: rawData.districtId || null,
            exterior: rawData.exterior || {
                x: rawData.x ?? 100,
                y: rawData.y ?? 100,
                width: rawData.width ?? 180,
                height: rawData.height ?? 180,
                color: rawData.color || '#3b82f6',
                label: rawData.label || rawData.name?.en || buildingId
            },
            entrances: Array.isArray(rawData.entrances) ? rawData.entrances : [],
            rooms: Array.isArray(rawData.rooms)
                ? rawData.rooms
                : (rawData.rooms && typeof rawData.rooms === 'object' ? Object.values(rawData.rooms) : []),
            npcs: Array.isArray(rawData.npcs) ? rawData.npcs : [],
            interactiveObjects: Array.isArray(rawData.interactiveObjects)
                ? rawData.interactiveObjects
                : (Array.isArray(rawData.objects) ? rawData.objects : []),
            quests: Array.isArray(rawData.quests) ? rawData.quests : [],
            ambientAudio: rawData.ambientAudio || rawData.music || 'piano'
        };

        // Standardize entrances fallback if empty
        if (normalized.entrances.length === 0) {
            normalized.entrances.push({
                id: 'main_entrance',
                label: 'Main Entrance',
                targetRoomId: normalized.rooms[0]?.id || 'main_room',
                x: normalized.exterior.x + normalized.exterior.width / 2 - 25,
                y: normalized.exterior.y + normalized.exterior.height - 40,
                width: 50,
                height: 40
            });
        }

        return normalized;
    }

    /**
     * Register a single building definition.
     * @param {string} id
     * @param {Object} buildingData
     * @returns {Object} Normalized building
     */
    registerBuilding(id, buildingData) {
        const normalized = this.normalizeBuilding(id, buildingData);
        this.buildings.set(normalized.id, normalized);
        if (this.eventBus) {
            this.eventBus.emit('buildingRegistered', { id: normalized.id, building: normalized });
        }
        return normalized;
    }

    /**
     * Bulk register multiple building definitions.
     * @param {Object.<string, Object>} buildingsDict
     */
    registerBuildings(buildingsDict) {
        if (!buildingsDict || typeof buildingsDict !== 'object') return;
        for (const [id, data] of Object.entries(buildingsDict)) {
            this.registerBuilding(id, data);
        }
    }

    /**
     * Loads a room independently into memory.
     * Unloads inactive rooms beyond capacity to maintain lightweight memory footprint.
     *
     * @param {string} buildingId
     * @param {string} roomId
     * @returns {Object|null}
     */
    loadRoom(buildingId, roomId) {
        const building = this.buildings.get(buildingId);
        if (!building) return null;

        const roomDef = building.rooms.find(r => r.id === roomId) || building.rooms[0];
        if (!roomDef) return null;

        const cacheKey = `${buildingId}:${roomDef.id}`;

        // Return cached room if already in active memory
        if (this.loadedRooms.has(cacheKey)) {
            return this.loadedRooms.get(cacheKey);
        }

        const normalizedRoom = {
            id: roomDef.id,
            buildingId: building.id,
            name: roomDef.name || building.name,
            image: roomDef.image || building.image,
            viewBox: roomDef.viewBox || '0 0 800 500',
            ambientAudio: roomDef.ambientAudio || building.ambientAudio,
            exits: roomDef.exits || [{ targetDistrictId: building.districtId, x: 20, y: 180, width: 70, height: 220 }],
            npcs: roomDef.npcs || building.npcs || [],
            npcSpawns: roomDef.npcSpawns || (building.npcs ? building.npcs.map((n, i) => ({ npcId: n, x: 200 + i * 120, y: 300 })) : []),
            interactiveObjects: roomDef.interactiveObjects || roomDef.objects || building.interactiveObjects || [],
            quests: roomDef.quests || building.quests || [],
            walls: roomDef.walls || [],
            floors: roomDef.floors || []
        };

        // Memory optimization: unload unused rooms if limit reached (e.g. max 5 active rooms)
        if (this.loadedRooms.size >= 5) {
            this.purgeDistantRooms(cacheKey);
        }

        this.loadedRooms.set(cacheKey, normalizedRoom);

        if (this.eventBus) {
            this.eventBus.emit('roomLoaded', { buildingId, roomId: roomDef.id, room: normalizedRoom });
        }

        return normalizedRoom;
    }

    /**
     * Unload rooms from memory to keep memory usage minimal.
     * @param {string} currentCacheKey
     */
    purgeDistantRooms(currentCacheKey) {
        for (const key of this.loadedRooms.keys()) {
            if (key !== currentCacheKey) {
                this.loadedRooms.delete(key);
            }
        }
    }

    /**
     * Enter a building exterior into an interior room with smooth transition state.
     * @param {string} buildingId
     * @param {string} [entranceId]
     * @returns {Object|null} Active interior state
     */
    enterBuilding(buildingId, entranceId = null) {
        const building = this.buildings.get(buildingId);
        if (!building) return null;

        const entrance = entranceId
            ? building.entrances.find(e => e.id === entranceId)
            : building.entrances[0];

        const targetRoomId = entrance?.targetRoomId || building.rooms[0]?.id || 'main';
        const room = this.loadRoom(buildingId, targetRoomId);

        this.activeBuildingState = {
            buildingId: building.id,
            buildingName: building.name,
            currentRoomId: room.id,
            room,
            isInterior: true
        };

        if (this.eventBus) {
            this.eventBus.emit('enteredBuilding', {
                buildingId,
                room,
                ambientAudio: room.ambientAudio
            });
        }

        return this.activeBuildingState;
    }

    /**
     * Leave a building interior and return to district exterior seamlessly.
     * @returns {Object|null}
     */
    exitBuilding() {
        if (!this.activeBuildingState) return null;

        const previousState = { ...this.activeBuildingState };
        this.activeBuildingState = null;

        if (this.eventBus) {
            this.eventBus.emit('exitedBuilding', {
                buildingId: previousState.buildingId
            });
        }

        return previousState;
    }

    /**
     * Get active building interior state or null if outdoors.
     * @returns {Object|null}
     */
    getActiveBuildingState() {
        return this.activeBuildingState;
    }

    /**
     * Get registered building by ID.
     * @param {string} id
     * @returns {Object|null}
     */
    getBuilding(id) {
        return this.buildings.get(id) || null;
    }
}
