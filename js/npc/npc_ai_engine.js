/**
 * @file js/npc/npc_ai_engine.js
 * @description Realistic NPC AI System for COSY World.
 * Manages daily schedule navigation, personalities, relationship/friendship tracking,
 * mood states, autonomous movement across districts, NPC-to-NPC interactions,
 * player reaction logic, and conversation & quest history logs.
 */

export class NPCAIEngine {
    /**
     * @param {Object} [options]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.eventBus = options.eventBus || null;

        /** @type {Map<string, Object>} Registered active NPCs keyed by NPC ID */
        this.npcs = new Map();

        /** @type {Object[]} Active NPC-to-NPC interaction log */
        this.npcInteractions = [];
    }

    /**
     * Normalizes an NPC definition to guarantee all realistic AI fields exist.
     * Required properties: dailySchedule, personality, relationshipLevel, currentMood,
     * friendshipPoints, location, occupation, favoriteCafe, favoritePark,
     * conversationHistory, questHistory.
     *
     * @param {string} npcId
     * @param {Object} rawData
     * @returns {Object} Normalized NPC
     */
    normalizeNPC(npcId, rawData) {
        if (!rawData || typeof rawData !== 'object') {
            throw new Error(`Invalid NPC data for ID: ${npcId}`);
        }

        const normalized = {
            id: rawData.id || npcId,
            name: rawData.name || npcId,
            portrait: rawData.portrait || rawData.avatar || '👤',
            avatar: rawData.avatar || rawData.portrait || '👤',
            role: rawData.role || 'Town Resident',
            occupation: rawData.occupation || rawData.role || 'Resident',
            teachingRole: rawData.teachingRole || 'Language Guide',

            // Personality and Preferences
            personality: rawData.personality || 'friendly', // extrovert, introvert, friendly, curious, studious
            favoriteCafe: rawData.favoriteCafe || 'cafe',
            favoritePark: rawData.favoritePark || 'town_square',

            // Dynamic State
            relationshipLevel: typeof rawData.relationshipLevel === 'number' ? rawData.relationshipLevel : 1,
            friendshipPoints: typeof rawData.friendshipPoints === 'number' ? rawData.friendshipPoints : 0,
            currentMood: rawData.currentMood || 'happy', // happy, neutral, curious, busy, excited
            location: rawData.location || rawData.position3D?.location || 'town_square',
            position3D: rawData.position3D || { x: 200, y: 300, z: 0 },

            // Daily Schedule Routine
            dailySchedule: Array.isArray(rawData.dailySchedule) ? rawData.dailySchedule : [
                { time: '08:00', location: 'town_square', activity: 'Morning walk' },
                { time: '12:00', location: rawData.favoriteCafe || 'cafe', activity: 'Enjoying coffee' },
                { time: '18:00', location: rawData.favoritePark || 'town_square', activity: 'Evening relaxation' }
            ],

            // History Logs
            conversationHistory: Array.isArray(rawData.conversationHistory) ? rawData.conversationHistory : [],
            questHistory: Array.isArray(rawData.questHistory) ? rawData.questHistory : (rawData.quests || []),

            // Dialogues & Inventory
            dialogues: rawData.dialogues || {},
            shopInventory: Array.isArray(rawData.shopInventory) ? rawData.shopInventory : []
        };

        return normalized;
    }

    /**
     * Register a single NPC definition into the AI Engine.
     * @param {string} npcId
     * @param {Object} npcData
     * @returns {Object}
     */
    registerNPC(npcId, npcData) {
        const normalized = this.normalizeNPC(npcId, npcData);
        this.npcs.set(normalized.id, normalized);

        if (this.eventBus) {
            this.eventBus.emit('npcRegistered', { id: normalized.id, npc: normalized });
        }

        return normalized;
    }

    /**
     * Bulk register multiple NPC definitions.
     * @param {Object.<string, Object>} dict
     */
    registerNPCsDict(dict) {
        if (!dict || typeof dict !== 'object') return;
        for (const [id, data] of Object.entries(dict)) {
            this.registerNPC(id, data);
        }
    }

    /**
     * Get registered NPC by ID.
     * @param {string} id
     * @returns {Object|null}
     */
    getNPC(id) {
        return this.npcs.get(id) || null;
    }

    /**
     * Update NPC daily schedule and autonomous location transitions based on simulated time.
     * @param {string} timeString HH:MM format (e.g. "08:00")
     */
    updateScheduleTick(timeString) {
        for (const npc of this.npcs.values()) {
            if (!npc.dailySchedule) continue;

            const matchingTask = npc.dailySchedule.find(s => s.time === timeString);
            if (matchingTask) {
                const previousLocation = npc.location;
                npc.location = matchingTask.location;
                npc.currentActivity = matchingTask.activity;

                if (this.eventBus && previousLocation !== npc.location) {
                    this.eventBus.emit('npcRelocated', {
                        npcId: npc.id,
                        from: previousLocation,
                        to: npc.location,
                        activity: matchingTask.activity
                    });
                }
            }
        }

        // Trigger autonomous NPC-to-NPC interactions for NPCs in same location
        this.checkNPCInteractions();
    }

    /**
     * Autonomous NPC-to-NPC interaction check when NPCs share the same location.
     */
    checkNPCInteractions() {
        const locationGroups = new Map();

        for (const npc of this.npcs.values()) {
            const loc = npc.location || 'town_square';
            if (!locationGroups.has(loc)) {
                locationGroups.set(loc, []);
            }
            locationGroups.get(loc).push(npc);
        }

        for (const [loc, group] of locationGroups.entries()) {
            if (group.length >= 2) {
                const npc1 = group[0];
                const npc2 = group[1];

                const interactionNote = `${npc1.name} and ${npc2.name} are chatting at ${loc}.`;
                this.npcInteractions.push({
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    location: loc,
                    npc1: npc1.id,
                    npc2: npc2.id,
                    note: interactionNote
                });

                // Positive interaction boosts mood
                npc1.currentMood = 'happy';
                npc2.currentMood = 'happy';

                if (this.eventBus) {
                    this.eventBus.emit('npcInteraction', { npc1: npc1.id, npc2: npc2.id, location: loc, note: interactionNote });
                }
            }
        }
    }

    /**
     * Generate dynamic NPC reaction to the player based on relationship level, mood, and personality.
     *
     * @param {string} npcId
     * @param {Object} [playerState]
     * @returns {Object} Reaction message & mood state
     */
    getReactionToPlayer(npcId, playerState = {}) {
        const npc = this.getNPC(npcId);
        if (!npc) {
            return { greeting: '👋 Hello!', mood: 'neutral' };
        }

        const fp = npc.friendshipPoints || 0;
        const level = Math.floor(fp / 50) + 1;

        let greeting = `👋 Hello player!`;

        if (level >= 3) {
            greeting = `🤗 Wonderful to see my dear friend again! How can I help you today?`;
            npc.currentMood = 'excited';
        } else if (level === 2) {
            greeting = `😊 Hey there! Great to see you back around ${npc.location || 'town'}!`;
            npc.currentMood = 'happy';
        } else {
            if (npc.personality === 'extrovert') {
                greeting = `👋 Hey! Welcome! Ready for a new discovery?`;
            } else if (npc.personality === 'introvert') {
                greeting = `… Oh, hello there. Welcome.`;
            } else {
                greeting = `👋 Hello! Welcome to ${npc.location || 'COSY Town'}!`;
            }
        }

        return {
            greeting,
            mood: npc.currentMood,
            friendshipPoints: npc.friendshipPoints,
            relationshipLevel: level
        };
    }

    /**
     * Record conversation history for an NPC.
     * @param {string} npcId
     * @param {string} text
     * @param {number} [fpGain=10]
     */
    recordConversation(npcId, text, fpGain = 10) {
        const npc = this.getNPC(npcId);
        if (!npc) return;

        npc.friendshipPoints += fpGain;
        npc.relationshipLevel = Math.floor(npc.friendshipPoints / 50) + 1;

        npc.conversationHistory.push({
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text,
            friendshipPoints: npc.friendshipPoints
        });

        if (this.eventBus) {
            this.eventBus.emit('npcConversationRecorded', { npcId, text, fp: npc.friendshipPoints });
        }
    }

    /**
     * Export all NPCs as dictionary object.
     * @returns {Object.<string, Object>}
     */
    exportNPCsDict() {
        const dict = {};
        for (const [id, npc] of this.npcs.entries()) {
            dict[id] = npc;
        }
        return dict;
    }
}
