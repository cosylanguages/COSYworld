/**
 * COSYworld/js/world/world_map.js
 * World Map - Interactive SVG & Canvas Cartography System.
 * Supports Zoom, Pan, District Names, Building Names, Visited Locations,
 * Current Player Position, NPC Positions, Quest Markers, and Fast Travel.
 */

export class WorldMap {
    constructor(options = {}) {
        this.gameEngine = options.gameEngine || null;
        this.zoom = 1.0;
        this.minZoom = 0.6;
        this.maxZoom = 2.5;
        this.pan = { x: 0, y: 0 };
        this.isPanning = false;
        this.dragStart = { x: 0, y: 0 };
    }

    /**
     * Check if a location has been visited by the player.
     */
    isVisited(locationId, state) {
        if (!state) return false;
        // Current location is always visited
        if (state.currentLocationId === locationId) return true;
        if (!state.visitedLocations) return false;
        return state.visitedLocations.has ? state.visitedLocations.has(locationId) : state.visitedLocations.includes(locationId);
    }

    isUnlocked(state) {
        if (!state) return false;
        if (state.mapUnlocked === true) return true;
        const completed = state.completedQuests;
        return completed && (completed.has
            ? (completed.has('q_directions_bakery') || completed.has('q_ch4_city_map_master'))
            : (completed.includes('q_directions_bakery') || completed.includes('q_ch4_city_map_master')));
    }

    getCompassDirection(fromLocationId, toLocationId, gameData) {
        const from = gameData?.districts?.[fromLocationId];
        const to = gameData?.districts?.[toLocationId];
        if (!from || !to) return null;
        const dx = (to.worldX || 0) - (from.worldX || 0);
        const dy = (to.worldY || 0) - (from.worldY || 0);
        if (dx === 0 && dy === 0) return 'here';
        const horizontal = dx > 0 ? 'east' : dx < 0 ? 'west' : '';
        const vertical = dy > 0 ? 'south' : dy < 0 ? 'north' : '';
        return [vertical, horizontal].filter(Boolean).join('-');
    }

    findRoute(fromLocationId, toLocationId, gameData) {
        if (!gameData?.districts?.[fromLocationId] || !gameData?.districts?.[toLocationId]) return [];
        const queue = [[fromLocationId]];
        const visited = new Set([fromLocationId]);
        while (queue.length) {
            const route = queue.shift();
            const current = gameData.districts[route[route.length - 1]];
            if (route[route.length - 1] === toLocationId) return route;
            for (const neighbor of current.neighbors || []) {
                if (!visited.has(neighbor) && gameData.districts[neighbor]) {
                    visited.add(neighbor);
                    queue.push([...route, neighbor]);
                }
            }
        }
        return [];
    }

    /**
     * Zoom controls
     */
    zoomIn() {
        this.zoom = Math.min(this.maxZoom, Number((this.zoom + 0.25).toFixed(2)));
        return this.zoom;
    }

    zoomOut() {
        this.zoom = Math.max(this.minZoom, Number((this.zoom - 0.25).toFixed(2)));
        return this.zoom;
    }

    resetView() {
        this.zoom = 1.0;
        this.pan = { x: 0, y: 0 };
    }

    /**
     * Pan controls
     */
    setPan(x, y) {
        this.pan = { x, y };
    }

    panBy(dx, dy) {
        this.pan.x += dx;
        this.pan.y += dy;
    }

    /**
     * Get NPCs present in a specific location.
     */
    getNPCsAtLocation(locationId, gameData) {
        if (!gameData || !gameData.districts) return [];
        const loc = gameData.districts[locationId];
        if (!loc) return [];

        const npcIds = loc.npcs || (loc.npcSpawns ? loc.npcSpawns.map(n => n.npcId) : []);
        return npcIds.map(id => gameData.npcs[id]).filter(Boolean);
    }

    /**
     * Get active or available quest targets associated with a location.
     */
    getQuestsAtLocation(locationId, state, gameData) {
        if (!gameData || !gameData.quests || !state) return [];
        const activeIds = state.activeQuests ? (state.activeQuests.has ? Array.from(state.activeQuests) : state.activeQuests) : [];

        return gameData.quests.filter(q => {
            if (!activeIds.includes(q.id)) return false;
            const req = q.requirements || {};
            if (req.targetLocation === locationId) return true;
            if (q.sceneTriggers && q.sceneTriggers.some(trig => trig.locationId === locationId)) return true;
            return false;
        });
    }

    /**
     * Calculate district bounds and layout topology.
     */
    getMapTopology(gameData) {
        if (!gameData || !gameData.districts) return { districts: {}, locations: {} };

        const districts = {};
        const locations = {};

        Object.keys(gameData.districts).forEach(id => {
            const loc = gameData.districts[id];
            const distName = loc.district || 'Unassigned District';

            if (!districts[distName]) {
                districts[distName] = {
                    name: distName,
                    locations: []
                };
            }

            districts[distName].locations.push(id);

            locations[id] = {
                id,
                name: (loc.name && loc.name.en) ? loc.name.en : id,
                icon: loc.icon || '📍',
                district: distName,
                worldX: loc.worldX || 0,
                worldY: loc.worldY || 0,
                buildings: loc.buildings || [],
                doors: loc.doors || []
            };
        });

        return { districts, locations };
    }

    /**
     * Render the interactive world map UI inside the modal element.
     */
    renderMapHtml(state, gameData) {
        const { districts, locations } = this.getMapTopology(gameData);
        const currLocId = state.currentLocationId || 'apartment_living';

        const transformStyle = `transform: translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom}); transform-origin: center center; transition: transform 0.15s ease-out;`;

        let html = `
            <div class="cw-world-map-modal">
                <div class="cw-map-toolbar">
                    <div style="font-family:'Fraunces',serif; font-size:1.3rem; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:0.5rem;">
                        <span>🗺️</span> COSY Town World Map
                    </div>
                    <div class="cw-map-controls">
                        <button type="button" class="cw-btn-toggle" onclick="COSY_WORLD.worldMap.zoomIn(); COSY_WORLD.refreshWorldMapUI();" title="Zoom In">➕ Zoom In</button>
                        <button type="button" class="cw-btn-toggle" onclick="COSY_WORLD.worldMap.zoomOut(); COSY_WORLD.refreshWorldMapUI();" title="Zoom Out">➖ Zoom Out</button>
                        <button type="button" class="cw-btn-toggle" onclick="COSY_WORLD.worldMap.resetView(); COSY_WORLD.refreshWorldMapUI();" title="Reset View">🎯 Reset</button>
                        <span style="font-size:0.85rem; font-weight:700; color:var(--blue-primary); margin-left:0.5rem;">${Math.round(this.zoom * 100)}%</span>
                    </div>
                </div>

                <div class="cw-map-viewport" id="cw-map-viewport-container" style="overflow:hidden; position:relative; background:#0f172a; border-radius:16px; border:2px solid var(--border-subtle); height:420px; cursor:grab;">
                    <div class="cw-map-canvas" id="cw-map-canvas-inner" style="${transformStyle} position:absolute; width:100%; height:100%; display:flex; justify-content:center; align-items:center; padding:2rem;">

                        <div class="cw-map-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem; width:100%; max-width:900px;">
                            ${Object.keys(districts).map(distName => {
                                const dist = districts[distName];
                                return `
                                    <div class="cw-district-card" style="background:rgba(30, 41, 59, 0.85); backdrop-filter:blur(8px); border:2px solid rgba(255, 255, 255, 0.15); border-radius:14px; padding:1rem; box-shadow:0 10px 25px rgba(0,0,0,0.3);">
                                        <div style="font-size:0.95rem; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.75rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.4rem; display:flex; justify-content:space-between; align-items:center;">
                                            <span>🏙️ ${distName}</span>
                                            <span style="font-size:0.75rem; color:#94a3b8; font-weight:600;">${dist.locations.length} Locations</span>
                                        </div>

                                        <div style="display:flex; flex-direction:column; gap:0.75rem;">
                                            ${dist.locations.map(locId => {
                                                const loc = locations[locId];
                                                const visited = this.isVisited(locId, state);
                                                const isCurrent = (locId === currLocId);
                                                const npcs = this.getNPCsAtLocation(locId, gameData);
                                                const quests = this.getQuestsAtLocation(locId, state, gameData);

                                                return `
                                                    <div class="cw-map-node ${isCurrent ? 'current-node' : ''} ${visited ? 'visited-node' : 'unvisited-node'}"
                                                         style="background:${isCurrent ? '#1e3a8a' : (visited ? '#1e293b' : '#334155')}; border:2px solid ${isCurrent ? '#60a5fa' : (visited ? '#475569' : '#1e293b')}; border-radius:10px; padding:0.75rem; color:white; transition:all 0.2s ease;">

                                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                                            <div style="display:flex; align-items:center; gap:0.5rem; font-weight:700;">
                                                                <span style="font-size:1.2rem;">${loc.icon}</span>
                                                                <span style="font-size:0.95rem; color:${visited ? '#ffffff' : '#94a3b8'};">${visited ? loc.name : '??? (Undiscovered)'}</span>
                                                            </div>

                                                            ${isCurrent ? `
                                                                <span class="cw-beacon-pulse" style="background:#3b82f6; color:white; font-size:0.7rem; font-weight:800; padding:0.2rem 0.5rem; border-radius:10px; box-shadow:0 0 10px #3b82f6;">
                                                                    📍 You Are Here
                                                                </span>
                                                            ` : (visited ? `
                                                                <button type="button" class="btn-g-primary" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="COSY_WORLD.fastTravel('${locId}')">
                                                                    🚀 Fast Travel
                                                                </button>
                                                            ` : `
                                                                <span style="font-size:0.7rem; background:#475569; color:#cbd5e1; padding:0.2rem 0.5rem; border-radius:10px;">🔒 Locked</span>
                                                            `)}
                                                        </div>

                                                        ${visited && loc.buildings && loc.buildings.length > 0 ? `
                                                            <div style="margin-top:0.4rem; font-size:0.75rem; color:#cbd5e1; display:flex; gap:0.4rem; flex-wrap:wrap;">
                                                                <span style="font-weight:700; color:#94a3b8;">Buildings:</span>
                                                                ${loc.buildings.map(b => `<span style="background:rgba(255,255,255,0.1); padding:0.1rem 0.4rem; border-radius:4px;">${b.label || b.id}</span>`).join(' ')}
                                                            </div>
                                                        ` : ''}

                                                        ${visited && npcs.length > 0 ? `
                                                            <div style="margin-top:0.4rem; font-size:0.75rem; color:#fde047; display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
                                                                <span style="font-weight:700;">NPCs:</span>
                                                                ${npcs.map(n => `<span style="background:rgba(250, 204, 21, 0.2); border:1px solid rgba(250, 204, 21, 0.4); padding:0.1rem 0.4rem; border-radius:6px; color:#fef08a;">${n.avatar || '👤'} ${n.name}</span>`).join(' ')}
                                                            </div>
                                                        ` : ''}

                                                        ${visited && quests.length > 0 ? `
                                                            <div style="margin-top:0.4rem; font-size:0.75rem; color:#60a5fa; display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
                                                                <span style="font-weight:700;">Active Missions:</span>
                                                                ${quests.map(q => `<span style="background:rgba(96, 165, 250, 0.2); border:1px solid rgba(96, 165, 250, 0.4); padding:0.1rem 0.4rem; border-radius:6px; color:#bfdbfe;">📜 ${q.title}</span>`).join(' ')}
                                                            </div>
                                                        ` : ''}

                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                    </div>
                </div>

                <div style="margin-top:1rem; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--text-muted);">
                    <div>💡 <strong>Tip:</strong> Click and drag to pan the map view. Use mouse wheel or buttons to zoom.</div>
                    <button type="button" class="cw-btn-toggle" onclick="COSY_WORLD.closeModal()">Close Map ✕</button>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Attach pan mouse drag and wheel zoom listeners to map viewport.
     */
    attachInteractions(containerEl) {
        if (!containerEl) return;

        let isDragging = false;
        let startX = 0;
        let startY = 0;

        containerEl.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - this.pan.x;
            startY = e.clientY - this.pan.y;
            containerEl.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            this.pan.x = e.clientX - startX;
            this.pan.y = e.clientY - startY;
            if (typeof window !== 'undefined' && window.COSY_WORLD) {
                window.COSY_WORLD.refreshWorldMapCanvas();
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                containerEl.style.cursor = 'grab';
            }
        });

        containerEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
            if (typeof window !== 'undefined' && window.COSY_WORLD) {
                window.COSY_WORLD.refreshWorldMapUI();
            }
        }, { passive: false });
    }
}
