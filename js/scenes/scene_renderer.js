/**
 * games/cosy_world/js/scenes/scene_renderer.js
 * SVG scene and interactive stage rendering component for COSY World.
 * Hotspot & NPC Engine renders pulse/glow animations, accessibility focus rings, relationship badges, and interactive NPC gesture states.
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

    static async renderWorldViewport(state, gameData) {
        const svg = document.getElementById('cw-world-svg');
        const titleEl = document.getElementById('cw-location-title');
        const districtEl = document.getElementById('cw-district-name');

        if (!svg || !gameData) return;

        svg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        svg.style.opacity = '0.3';

        const loc = await this.lazyLoadScene(state.currentLocationId, gameData);
        if (!loc) return;

        const lang = state.currentLang;
        if (titleEl) titleEl.textContent = `${loc.icon} ${loc.name[lang] || loc.name.en}`;
        if (districtEl) districtEl.textContent = loc.district;

        const timeOfDayColors = {
            morning: 'rgba(254, 243, 199, 0.2)',
            afternoon: 'rgba(255, 255, 255, 0)',
            sunset: 'rgba(251, 146, 60, 0.25)',
            night: 'rgba(30, 41, 59, 0.5)'
        };
        const lightingFill = timeOfDayColors[loc.timeOfDay] || 'rgba(0,0,0,0)';

        let html = `
            <!-- Background Wall & Base Floor -->
            <rect x="0" y="0" width="800" height="340" fill="#f5f0eb" />
            <rect x="0" y="340" width="800" height="160" fill="#e8ded1" />
            <line x1="0" y1="340" x2="800" y2="340" stroke="#d4c5b3" stroke-width="4" />
        `;

        // Render Roads dynamically from JSON
        if (loc.roads) {
            loc.roads.forEach(r => {
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
        if (loc.buildings) {
            loc.buildings.forEach(b => {
                html += `
                    <g class="cw-building-group">
                        <rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="${b.color}" rx="8" opacity="0.85" stroke="#1e293b" stroke-width="2" />
                        <text x="${b.x + b.width / 2}" y="${b.y + b.height / 2}" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">${b.label}</text>
                    </g>
                `;
            });
        }

        // Render Doors / Portals dynamically from JSON
        if (loc.doors) {
            loc.doors.forEach(d => {
                const doorLabel = d.labels[lang] || d.labels.en || 'Door';
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
        if (loc.objects) {
            loc.objects.forEach((objId, idx) => {
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

        // Render NPC Spawns dynamically with relationship level indicators
        const npcList = loc.npcSpawns || (loc.npcs ? loc.npcs.map((id, idx) => ({ npcId: id, x: 200 + idx * 150, y: 300 })) : []);
        npcList.forEach(spawn => {
            const npc = gameData.npcs[spawn.npcId];
            if (!npc) return;
            const posX = spawn.x || (npc.position3D ? npc.position3D.x : 200);
            const posY = spawn.y || (npc.position3D ? npc.position3D.y : 300);
            const fp = state.npcRelationships[spawn.npcId] || 0;
            const lvl = Math.floor(fp / 50) + 1;

            html += `
                <g class="cw-npc-hotspot" tabindex="0" role="button" aria-label="Talk to ${npc.name}" onclick="COSY_WORLD.interactNPC('${spawn.npcId}')" onkeydown="if(event.key==='Enter'||event.key===' '){COSY_WORLD.interactNPC('${spawn.npcId}');}">
                    <circle class="npc-hit" cx="${posX}" cy="${posY}" r="32" />
                    <text x="${posX}" y="${posY + 10}" font-size="32" text-anchor="middle">${npc.portrait || npc.avatar}</text>

                    ${state.showGuidePointers ? `
                        <text x="${posX + 25}" y="${posY - 20}" font-size="18" text-anchor="middle">💬</text>
                    ` : ''}

                    <rect x="${posX - 40}" y="${posY + 38}" width="80" height="20" rx="10" fill="#f59e0b" />
                    <text x="${posX}" y="${posY + 52}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${npc.name} Lvl ${lvl}</text>
                </g>
            `;
        });

        // Weather Effect Overlay
        if (loc.weather === 'rain') {
            html += `
                <g class="cw-weather-rain" opacity="0.4">
                    <line x1="100" y1="20" x2="90" y2="120" stroke="#3b82f6" stroke-width="2" stroke-dasharray="10 20" />
                    <line x1="250" y1="10" x2="240" y2="110" stroke="#3b82f6" stroke-width="2" stroke-dasharray="10 20" />
                    <line x1="450" y1="30" x2="440" y2="130" stroke="#3b82f6" stroke-width="2" stroke-dasharray="10 20" />
                    <line x1="650" y1="15" x2="640" y2="115" stroke="#3b82f6" stroke-width="2" stroke-dasharray="10 20" />
                </g>
            `;
        }

        // Time of Day Lighting Filter
        html += `<rect x="0" y="0" width="800" height="500" fill="${lightingFill}" pointer-events="none" />`;

        svg.innerHTML = html;

        setTimeout(() => {
            svg.style.opacity = '1';
        }, 50);
    }
}
