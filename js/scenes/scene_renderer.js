/**
 * games/cosy_world/js/scenes/scene_renderer.js
 * SVG scene and interactive stage rendering component for COSY World.
 * Hotspot & NPC Engine renders pulse/glow animations, accessibility focus rings, relationship badges, and interactive NPC gesture states.
 * Supports streaming open-world rendering for seamless district transitions.
 */

export class SceneRenderer {
    static loadedSceneCache = new Map();

    static async lazyLoadScene(locationId, gameData) {
        if (this.loadedSceneCache.has(locationId)) {
            return this.loadedSceneCache.get(locationId);
        }

        const loc = gameData.districts[locationId];
        if (!loc) return null;

        this.loadedSceneCache.set(locationId, loc);
        return loc;
    }

    static async renderWorldViewport(state, gameData, streamingManager = null, buildingManager = null) {
        const svg = document.getElementById('cw-world-svg');
        const titleEl = document.getElementById('cw-location-title');
        const districtEl = document.getElementById('cw-district-name');

        if (!svg || !gameData) return;

        const activeBuilding = buildingManager ? buildingManager.getActiveBuildingState() : null;

        // Render Interior Room if player is inside a building
        if (activeBuilding && activeBuilding.isInterior && activeBuilding.room) {
            const room = activeBuilding.room;
            const lang = state.currentLang;
            const roomName = (room.name && (room.name[lang] || room.name.en)) || room.name || 'Building Interior';

            if (titleEl) titleEl.textContent = `${room.image || '🚪'} ${roomName}`;
            if (districtEl) districtEl.textContent = activeBuilding.buildingName?.en || 'Building Interior';

            const bg = room.background || {};
            const wallFill = bg.wallColor || '#f8fafc';
            const floorFill = bg.floorColor || '#e2e8f0';
            const dividerFill = bg.dividerColor || '#cbd5e1';

            let roomHtml = `
                <g id="building-room-${room.id}">
                    <rect x="0" y="0" width="800" height="340" fill="${wallFill}" />
                    <rect x="0" y="340" width="800" height="160" fill="${floorFill}" />
                    <line x1="0" y1="340" x2="800" y2="340" stroke="${dividerFill}" stroke-width="4" />

                    <!-- Exit Door -->
                    <g class="cw-door-portal" tabindex="0" role="button" aria-label="Exit Building" onclick="COSY_WORLD.exitBuilding()" onkeydown="if(event.key==='Enter'||event.key===' '){COSY_WORLD.exitBuilding();}">
                        <rect x="20" y="180" width="70" height="220" rx="6" fill="#475569" />
                        <rect x="25" y="155" width="60" height="22" rx="4" fill="#1e293b" />
                        <text x="55" y="170" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Exit 🚪</text>
                    </g>
            `;

            // Render Hotspots in room
            if (room.hotspots) {
                room.hotspots.forEach(hs => {
                    roomHtml += `
                        <g class="cw-obj-hotspot" tabindex="0" role="button" aria-label="${hs.label || 'Hotspot'}" onclick="COSY_WORLD.inspectObject('${hs.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){COSY_WORLD.inspectObject('${hs.id}');}">
                            <rect class="hit-box" x="${hs.x}" y="${hs.y}" width="${hs.width}" height="${hs.height}" fill="rgba(99, 102, 241, 0.2)" rx="6" stroke="#6366f1" stroke-dasharray="4 2" />
                            <text x="${hs.x + hs.width / 2}" y="${hs.y + hs.height / 2 + 5}" fill="#1e293b" font-size="12" font-weight="bold" text-anchor="middle">${hs.label || '📍'}</text>
                        </g>
                    `;
                });
            }

            // Interactive objects in room
            if (room.interactiveObjects) {
                room.interactiveObjects.forEach(objId => {
                    const obj = gameData.objects[objId];
                    if (!obj) return;
                    const word = obj.words[lang] || obj.words.en || objId;
                    const isDiscovered = state.discoveredObjects.has(objId);

                    roomHtml += `
                        <g class="cw-obj-hotspot" tabindex="0" role="button" aria-label="Inspect ${word}" onclick="COSY_WORLD.inspectObject('${objId}')" onkeydown="if(event.key==='Enter'||event.key===' '){COSY_WORLD.inspectObject('${objId}');}">
                            <rect class="hit-box" x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" />
                            <text x="${obj.x + obj.width / 2}" y="${obj.y + obj.height / 2 + 8}" font-size="28" text-anchor="middle">${obj.emoji}</text>
                            <rect x="${obj.labelX - word.length * 4 - 8}" y="${obj.labelY - 14}" width="${word.length * 8 + 16}" height="20" rx="10" fill="${isDiscovered ? '#10b981' : '#1e293b'}" opacity="0.9" />
                            <text x="${obj.labelX}" y="${obj.labelY}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${word}</text>
                        </g>
                    `;
                });
            }

            // NPCs in room
            if (room.npcSpawns) {
                room.npcSpawns.forEach(spawn => {
                    const npc = gameData.npcs[spawn.npcId];
                    if (!npc) return;
                    roomHtml += `
                        <g class="cw-npc-hotspot" tabindex="0" role="button" aria-label="Talk to ${npc.name}" onclick="COSY_WORLD.interactNPC('${spawn.npcId}')" onkeydown="if(event.key==='Enter'||event.key===' '){COSY_WORLD.interactNPC('${spawn.npcId}');}">
                            <circle class="npc-hit" cx="${spawn.x}" cy="${spawn.y}" r="32" />
                            <text x="${spawn.x}" y="${spawn.y + 10}" font-size="32" text-anchor="middle">${npc.portrait || npc.avatar}</text>
                            <rect x="${spawn.x - 40}" y="${spawn.y + 38}" width="80" height="20" rx="10" fill="#f59e0b" />
                            <text x="${spawn.x}" y="${spawn.y + 52}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${npc.name}</text>
                        </g>
                    `;
                });
            }

            // Room Lighting Overlay Profile
            const lp = room.lightingProfile || {};
            const lightTint = lp.color || 'rgba(0,0,0,0)';
            roomHtml += `<rect x="0" y="0" width="800" height="500" fill="${lightTint}" pointer-events="none" />`;

            roomHtml += `</g>`;
            svg.innerHTML = roomHtml;
            svg.style.opacity = '1';
            return;
        }

        const activeId = state.currentLocationId;
        const loc = await this.lazyLoadScene(activeId, gameData);
        if (!loc) return;

        const lang = state.currentLang;
        if (titleEl) titleEl.textContent = `${loc.icon} ${loc.name[lang] || loc.name.en}`;
        if (districtEl) districtEl.textContent = loc.district;

        // Obtain visible streaming districts
        let visibleDistricts = [loc];
        if (streamingManager) {
            visibleDistricts = streamingManager.getVisibleDistricts(activeId, gameData);
        }

        let html = ``;

        // Render each loaded district at its offset location
        visibleDistricts.forEach(dist => {
            const isCurrent = dist.id === activeId;
            const offsetX = (dist.worldX ?? 0) - (loc.worldX ?? 0);
            const offsetY = (dist.worldY ?? 0) - (loc.worldY ?? 0);

            html += `<g id="district-group-${dist.id}" transform="translate(${offsetX}, ${offsetY})" opacity="${isCurrent ? '1' : '0.85'}">`;

            // Background Wall & Base Floor
            html += `
                <rect x="0" y="0" width="800" height="340" fill="#f5f0eb" />
                <rect x="0" y="340" width="800" height="160" fill="#e8ded1" />
                <line x1="0" y1="340" x2="800" y2="340" stroke="#d4c5b3" stroke-width="4" />
            `;

            // Render Roads dynamically from JSON
            if (dist.roads) {
                dist.roads.forEach(r => {
                    const roadFills = {
                        cobblestone: '#d1d5db',
                        wooden_floor: '#e5e7eb',
                        tile_floor: '#f3f4f6'
                    };
                    html += `
                        <rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${roadFills[r.type] || '#e8ded1'}" rx="4" />
                        <line x1="${r.x}" y1="${r.y}" x2="${r.x + r.width}" y2="${r.y}" stroke="#9ca3af" stroke-width="2" stroke-dasharray="8 4" />
                    `;
                });
            }

            // Render Buildings dynamically from JSON
            if (dist.buildings) {
                dist.buildings.forEach(b => {
                    const hasBuildingSystem = buildingManager && buildingManager.getBuilding(b.id);
                    const clickableAttr = hasBuildingSystem
                        ? `tabindex="0" role="button" aria-label="Enter ${b.label}" onclick="COSY_WORLD.enterBuilding('${b.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){COSY_WORLD.enterBuilding('${b.id}');}" style="cursor:pointer;"`
                        : ``;

                    html += `
                        <g class="cw-building-group" ${clickableAttr}>
                            <rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="${b.color}" rx="8" opacity="0.85" stroke="#1e293b" stroke-width="2" />
                            <text x="${b.x + b.width / 2}" y="${b.y + b.height / 2 - 10}" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">${b.label}</text>
                            ${hasBuildingSystem ? `
                                <rect x="${b.x + b.width / 2 - 20}" y="${b.y + b.height - 35}" width="40" height="30" fill="#1e293b" rx="4" />
                                <text x="${b.x + b.width / 2}" y="${b.y + b.height - 16}" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">ENTER</text>
                            ` : ''}
                        </g>
                    `;
                });
            }

            // Render Connections / Doors dynamically from JSON
            const connectionsList = dist.connections || dist.doors || [];
            if (connectionsList) {
                connectionsList.forEach(d => {
                    const doorLabel = (d.labels && (d.labels[lang] || d.labels.en)) || d.label || 'Door';
                    html += `
                        <g class="cw-door-portal" tabindex="0" role="button" aria-label="Enter ${doorLabel}" onclick="COSY_WORLD.switchLocation('${d.targetId}')" onkeydown="if(event.key==='Enter'||event.key===' '){COSY_WORLD.switchLocation('${d.targetId}');}">
                            <rect x="${d.x}" y="${d.y}" width="${d.width}" height="${d.height}" rx="6" />
                            <rect x="${d.x + 5}" y="${d.labelY || d.y - 25}" width="${d.width - 10}" height="22" rx="4" fill="#1e293b" />
                            <text x="${d.x + d.width / 2}" y="${(d.labelY || d.y - 25) + 15}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${doorLabel}</text>
                        </g>
                    `;
                });
            }

            // Render Hotspots dynamically from JSON
            if (dist.objects) {
                dist.objects.forEach((objId, idx) => {
                    const obj = gameData.objects[objId];
                    if (!obj) return;
                    const word = obj.words[lang] || obj.words.en || objId;
                    const isDiscovered = state.discoveredObjects.has(objId);
                    const animClass = obj.animation === 'pulse' ? 'cw-hotspot-pulse' : (obj.animation === 'glow' ? 'cw-hotspot-glow' : '');

                    html += `
                        <g class="cw-obj-hotspot ${animClass}" tabindex="0" role="button" aria-label="Inspect ${word}" onclick="COSY_WORLD.inspectObject('${objId}')" onkeydown="if(event.key==='Enter'||event.key===' '){COSY_WORLD.inspectObject('${objId}');}">
                            <rect class="hit-box" x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" />
                            <text x="${obj.x + obj.width / 2}" y="${obj.y + obj.height / 2 + 8}" font-size="28" text-anchor="middle">${obj.emoji}</text>

                            ${state.showGuidePointers && idx === 0 && !isDiscovered ? `
                                <text x="${obj.x + obj.width / 2}" y="${obj.y - 12}" font-size="20" text-anchor="middle" class="cw-hand-pointer">👇</text>
                            ` : ''}

                            <rect x="${obj.labelX - word.length * 4 - 8}" y="${obj.labelY - 14}" width="${word.length * 8 + 16}" height="20" rx="10" fill="${isDiscovered ? '#10b981' : '#1e293b'}" opacity="0.9" />
                            <text x="${obj.labelX}" y="${obj.labelY}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${word}</text>
                        </g>
                    `;
                });
            }

            // Render NPC Spawns
            const npcList = dist.npcSpawns || (dist.npcs ? dist.npcs.map((id, idx) => ({ npcId: id, x: 200 + idx * 150, y: 300 })) : []);
            npcList.forEach(spawn => {
                const npc = gameData.npcs[spawn.npcId];
                if (!npc) return;
                const posX = spawn.x || (npc.position3D ? npc.position3D.x : 200);
                const posY = spawn.y || (npc.position3D ? npc.position3D.y : 300);
                const fp = state.npcRelationships[spawn.npcId] || npc.friendshipPoints || 0;
                const lvl = Math.floor(fp / 50) + 1;
                const moodIcon = npc.currentMood === 'happy' ? '😊' : (npc.currentMood === 'excited' ? '🔥' : '💬');

                html += `
                    <g class="cw-npc-hotspot" tabindex="0" role="button" aria-label="Talk to ${npc.name}" onclick="COSY_WORLD.interactNPC('${spawn.npcId}')" onkeydown="if(event.key==='Enter'||event.key===' '){COSY_WORLD.interactNPC('${spawn.npcId}');}">
                        <circle class="npc-hit" cx="${posX}" cy="${posY}" r="32" />
                        <text x="${posX}" y="${posY + 10}" font-size="32" text-anchor="middle">${npc.portrait || npc.avatar}</text>

                        <text x="${posX + 25}" y="${posY - 20}" font-size="18" text-anchor="middle">${moodIcon}</text>

                        <rect x="${posX - 40}" y="${posY + 38}" width="80" height="20" rx="10" fill="#f59e0b" />
                        <text x="${posX}" y="${posY + 52}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${npc.name} Lvl ${lvl}</text>
                    </g>
                `;
            });

            // Weather Overlay
            if (dist.weather === 'rain') {
                html += `
                    <g class="cw-weather-rain" opacity="0.4">
                        <line x1="100" y1="20" x2="90" y2="120" stroke="#3b82f6" stroke-width="2" stroke-dasharray="10 20" />
                        <line x1="250" y1="10" x2="240" y2="110" stroke="#3b82f6" stroke-width="2" stroke-dasharray="10 20" />
                        <line x1="450" y1="30" x2="440" y2="130" stroke="#3b82f6" stroke-width="2" stroke-dasharray="10 20" />
                        <line x1="650" y1="15" x2="640" y2="115" stroke="#3b82f6" stroke-width="2" stroke-dasharray="10 20" />
                    </g>
                `;
            }

            html += `</g>`;
        });

        // Weather Visual Overlays
        const currentWeather = (state.worldSim && state.worldSim.weather) || loc.weather || 'clear';
        const currentSeason = (state.worldSim && state.worldSim.season) || 'spring';

        if (currentWeather === 'rain') {
            html += `
                <g class="cw-weather-rain" opacity="0.6" pointer-events="none">
                    <line x1="80" y1="10" x2="70" y2="130" stroke="#3b82f6" stroke-width="2" stroke-dasharray="12 24" />
                    <line x1="220" y1="5" x2="210" y2="125" stroke="#3b82f6" stroke-width="2" stroke-dasharray="12 24" />
                    <line x1="380" y1="20" x2="370" y2="140" stroke="#3b82f6" stroke-width="2" stroke-dasharray="12 24" />
                    <line x1="540" y1="10" x2="530" y2="130" stroke="#3b82f6" stroke-width="2" stroke-dasharray="12 24" />
                    <line x1="700" y1="25" x2="690" y2="145" stroke="#3b82f6" stroke-width="2" stroke-dasharray="12 24" />
                </g>
            `;
        } else if (currentWeather === 'snow') {
            html += `
                <g class="cw-weather-snow" opacity="0.75" pointer-events="none">
                    <circle cx="100" cy="50" r="4" fill="#ffffff" />
                    <circle cx="260" cy="110" r="3" fill="#ffffff" />
                    <circle cx="420" cy="70" r="5" fill="#ffffff" />
                    <circle cx="580" cy="130" r="3" fill="#ffffff" />
                    <circle cx="740" cy="60" r="4" fill="#ffffff" />
                </g>
            `;
        } else if (currentWeather === 'fog') {
            html += `
                <g class="cw-weather-fog" pointer-events="none">
                    <rect x="0" y="0" width="800" height="500" fill="rgba(241, 245, 249, 0.45)" />
                </g>
            `;
        } else if (currentWeather === 'clouds') {
            html += `
                <g class="cw-weather-clouds" opacity="0.3" pointer-events="none">
                    <path d="M 50 80 Q 80 50 120 80 Q 150 50 190 80 Q 220 100 190 120 L 50 120 Z" fill="#94a3b8" />
                    <path d="M 450 60 Q 480 30 520 60 Q 550 30 590 60 Q 620 80 590 100 L 450 100 Z" fill="#94a3b8" />
                </g>
            `;
        }

        // Season Specific Particle Accents
        if (currentSeason === 'spring') {
            html += `
                <g class="cw-season-spring" pointer-events="none" opacity="0.6">
                    <text x="140" y="180" font-size="16">🌸</text>
                    <text x="620" y="220" font-size="16">🌸</text>
                </g>
            `;
        } else if (currentSeason === 'autumn') {
            html += `
                <g class="cw-season-autumn" pointer-events="none" opacity="0.7">
                    <text x="180" y="160" font-size="16">🍁</text>
                    <text x="540" y="240" font-size="16">🍂</text>
                </g>
            `;
        }

        const timeOfDayColors = {
            morning: 'rgba(254, 243, 199, 0.15)',
            afternoon: 'rgba(255, 255, 255, 0)',
            evening: 'rgba(251, 146, 60, 0.2)',
            night: 'rgba(30, 41, 59, 0.45)'
        };

        // Smooth Lighting Filter Blend from WorldSimulationEngine or fallback
        const lightingFill = (state.worldSim && state.worldSim.lightingRgba) ? state.worldSim.lightingRgba : (timeOfDayColors[loc.timeOfDay] || 'rgba(0,0,0,0)');
        html += `<rect x="0" y="0" width="800" height="500" fill="${lightingFill}" pointer-events="none" />`;

        svg.innerHTML = html;
        svg.style.opacity = '1';
    }
}
