/**
 * @file js/world/world_builder.js
 * @description Dynamic JSON-driven World Builder for COSY World.
 * Generates and manages districts completely from JSON schema definitions.
 *
 * Each district definition contains:
 * - roads
 * - buildings
 * - NPCs
 * - music
 * - weather
 * - ambientSounds
 * - connections (doors / portals / neighbors)
 *
 * Supports unlimited districts and dynamic DLC-like expansion by simply registering
 * JSON files or folder manifests without hardcoded maps.
 */

export class WorldBuilder {
    /**
     * @param {Object} [options]
     * @param {import('../engine/asset_manager.js').AssetManager} [options.assetManager]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.assetManager = options.assetManager || null;
        this.eventBus = options.eventBus || null;
        /** @type {Map<string, Object>} Registered districts keyed by district/scene ID */
        this.districts = new Map();
        /** @type {Set<string>} Registered DLC package identifiers */
        this.loadedDLCs = new Set();
    }

    /**
     * Validates and normalizes a raw district JSON object to guarantee all required fields exist.
     * @param {string} districtId
     * @param {Object} rawData
     * @returns {Object} Normalized district object
     */
    normalizeDistrict(districtId, rawData) {
        if (!rawData || typeof rawData !== 'object') {
            throw new Error(`Invalid district data provided for ID: ${districtId}`);
        }

        const normalized = {
            id: rawData.id || districtId,
            district: rawData.district || 'COSY Town',
            level: rawData.level || 'A0',
            icon: rawData.icon || '🏙️',
            name: rawData.name || { en: districtId },
            viewBox: rawData.viewBox || '0 0 800 500',
            worldX: rawData.worldX ?? 0,
            worldY: rawData.worldY ?? 0,
            worldWidth: rawData.worldWidth ?? 800,
            worldHeight: rawData.worldHeight ?? 500,

            // Core required components
            roads: Array.isArray(rawData.roads) ? rawData.roads : [],
            buildings: Array.isArray(rawData.buildings) ? rawData.buildings : [],
            npcs: Array.isArray(rawData.npcs) ? rawData.npcs : [],
            npcSpawns: Array.isArray(rawData.npcSpawns) ? rawData.npcSpawns : [],
            music: rawData.music || 'none',
            weather: rawData.weather || 'clear',
            ambientSounds: Array.isArray(rawData.ambientSounds)
                ? rawData.ambientSounds
                : (rawData.ambientSounds ? [rawData.ambientSounds] : [rawData.music || 'none']),
            connections: Array.isArray(rawData.connections)
                ? rawData.connections
                : (Array.isArray(rawData.doors) ? rawData.doors : []),

            // Neighbor connections & hotspots
            neighbors: Array.isArray(rawData.neighbors) ? rawData.neighbors : [],
            doors: Array.isArray(rawData.doors) ? rawData.doors : [],
            objects: Array.isArray(rawData.objects) ? rawData.objects : [],
            assets: rawData.assets || {}
        };

        // Guarantee doors and connections stay in sync
        if (normalized.doors.length > 0 && normalized.connections.length === 0) {
            normalized.connections = [...normalized.doors];
        } else if (normalized.connections.length > 0 && normalized.doors.length === 0) {
            normalized.doors = [...normalized.connections];
        }

        // Derive neighbors automatically from connections if not explicitly listed
        if (normalized.neighbors.length === 0 && normalized.connections.length > 0) {
            const targetIds = normalized.connections
                .map(conn => conn.targetId)
                .filter(Boolean);
            normalized.neighbors = [...new Set(targetIds)];
        }

        return normalized;
    }

    /**
     * Registers a single district JSON object into the world.
     * @param {string} id
     * @param {Object} districtData
     * @returns {Object} Normalized district object
     */
    registerDistrict(id, districtData) {
        const normalized = this.normalizeDistrict(id, districtData);
        this.districts.set(normalized.id, normalized);

        if (this.eventBus) {
            this.eventBus.emit('districtRegistered', { id: normalized.id, district: normalized });
        }

        return normalized;
    }

    /**
     * Bulk registers a map or object containing multiple district JSON definitions.
     * @param {Object.<string, Object>} districtsDict
     */
    registerDistricts(districtsDict) {
        if (!districtsDict || typeof districtsDict !== 'object') return;
        for (const [id, data] of Object.entries(districtsDict)) {
            this.registerDistrict(id, data);
        }
    }

    /**
     * Loads district definitions from a JSON file path.
     * @param {string} jsonPath
     * @returns {Promise<Map<string, Object>>}
     */
    async loadDistrictFile(jsonPath) {
        let jsonContent = null;
        if (this.assetManager) {
            jsonContent = await this.assetManager.loadJson(jsonPath);
        } else if (typeof fetch !== 'undefined') {
            const res = await fetch(jsonPath);
            jsonContent = await res.json();
        }

        if (jsonContent) {
            if (jsonContent.id) {
                // Single district file
                this.registerDistrict(jsonContent.id, jsonContent);
            } else {
                // Multi-district collection
                this.registerDistricts(jsonContent);
            }
        }

        return this.districts;
    }

    /**
     * Loads a DLC package from a JSON folder manifest or path.
     * Allows seamless expansion simply by adding DLC JSON folders.
     *
     * @param {string} dlcFolderPath - e.g. "data/dlc/market"
     * @param {Object} [manifestData] - Optional pre-loaded manifest object
     */
    async loadDLC(dlcFolderPath, manifestData = null) {
        const cleanPath = dlcFolderPath.replace(/\/$/, '');
        const manifestPath = `${cleanPath}/manifest.json`;

        let manifest = manifestData;
        if (!manifest) {
            if (this.assetManager) {
                manifest = await this.assetManager.loadJson(manifestPath);
            } else if (typeof fetch !== 'undefined') {
                const res = await fetch(manifestPath);
                manifest = await res.json();
            }
        }

        if (!manifest) {
            throw new Error(`Failed to load DLC manifest from ${manifestPath}`);
        }

        const dlcId = manifest.id || cleanPath;
        if (this.loadedDLCs.has(dlcId)) {
            return { dlcId, loaded: false, reason: 'Already loaded' };
        }

        // Load districts defined in DLC manifest
        const loadedDistricts = [];
        if (Array.isArray(manifest.districts)) {
            for (const districtRef of manifest.districts) {
                if (typeof districtRef === 'string') {
                    const filePath = districtRef.startsWith('data/') || districtRef.startsWith('/')
                        ? districtRef
                        : `${cleanPath}/${districtRef}`;
                    await this.loadDistrictFile(filePath);
                } else if (districtRef && districtRef.id) {
                    this.registerDistrict(districtRef.id, districtRef);
                    loadedDistricts.push(districtRef.id);
                }
            }
        } else if (manifest.districtData) {
            this.registerDistricts(manifest.districtData);
        }

        this.loadedDLCs.add(dlcId);

        if (this.eventBus) {
            this.eventBus.emit('dlcLoaded', { dlcId, manifest, loadedDistricts });
        }

        return { dlcId, loaded: true, manifest };
    }

    /**
     * Retrieves a district definition by ID.
     * @param {string} id
     * @returns {Object|null}
     */
    getDistrict(id) {
        return this.districts.get(id) || null;
    }

    /**
     * Returns all registered district definitions as a standard dictionary object.
     * @returns {Object.<string, Object>}
     */
    exportDistrictsObject() {
        const obj = {};
        for (const [id, dist] of this.districts.entries()) {
            obj[id] = dist;
        }
        return obj;
    }

    /**
     * Check if a district ID exists.
     * @param {string} id
     * @returns {boolean}
     */
    hasDistrict(id) {
        return this.districts.has(id);
    }

    /**
     * Returns total count of loaded districts.
     * @returns {number}
     */
    getDistrictCount() {
        return this.districts.size;
    }
}
