/**
 * @file js/vocabulary/vocabulary_engine.js
 * @description Vocabulary Engine for COSY World.
 * Enforces Monolingual Learning Architecture without translation dictionaries.
 * Tracks SM-2 spaced-repetition statistics, scene vocabulary queries, and example sentences.
 */

export class VocabularyEngine {
    /**
     * @param {Object} [options]
     * @param {import('../engine/asset_manager.js').AssetManager} [options.assetManager]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.assetManager = options.assetManager || null;
        this.eventBus = options.eventBus || null;

        /** @type {Map<string, Object>} */
        this.vocabDatabase = new Map();

        /** @type {Map<string, { interval: number, repetition: number, efactor: number, lastReviewed: number, mastery: number }>} */
        this.spacedRepetitionState = new Map();
    }

    /**
     * Register vocabulary database object.
     * @param {Object<string, Object>} vocabDict
     */
    registerVocabularyDict(vocabDict) {
        if (!vocabDict || typeof vocabDict !== 'object') return;

        for (const [key, rawEntry] of Object.entries(vocabDict)) {
            const entry = this.normalizeEntry(key, rawEntry);
            this.vocabDatabase.set(entry.id, entry);
        }

        if (this.eventBus) {
            this.eventBus.emit('vocabularyDatabaseLoaded', { count: this.vocabDatabase.size });
        }
    }

    /**
     * Normalize raw JSON item to the Monolingual Learning Architecture schema.
     * @param {string} key
     * @param {Object} raw
     * @returns {Object}
     */
    normalizeEntry(key, raw = {}) {
        return {
            id: raw.id || key,
            word: raw.word || key.replace(/^vocab_/, ''),
            cefr: raw.cefr || raw.difficulty || 'A0',
            category: raw.category || 'general',
            scene: raw.scene || (raw.relatedScenes ? raw.relatedScenes[0] : 'general'),
            audio: raw.audio || `${raw.id || key}.mp3`,
            image: raw.image || `${raw.id || key}.webp`,
            examples: Array.isArray(raw.examples) ? raw.examples : (raw.exampleSentences ? Object.values(raw.exampleSentences) : []),
            related_words: Array.isArray(raw.related_words) ? raw.related_words : (raw.collocations || []),
            actions: Array.isArray(raw.actions) ? raw.actions : ['inspect', 'interact']
        };
    }

    /**
     * Get vocabulary entry by ID.
     * @param {string} vocabId
     * @returns {Object|null}
     */
    getEntry(vocabId) {
        return this.vocabDatabase.get(vocabId) || null;
    }

    /**
     * Get all registered vocabulary entries.
     * @returns {Object[]}
     */
    getAllEntries() {
        return Array.from(this.vocabDatabase.values());
    }

    /**
     * Filter vocabulary entries present in a specific scene.
     * @param {string} sceneId
     * @returns {Object[]}
     */
    getVocabularyForScene(sceneId) {
        if (!sceneId) return [];
        return Array.from(this.vocabDatabase.values()).filter(entry => entry.scene === sceneId);
    }

    /**
     * Update SuperMemo-2 (SM-2) spaced repetition parameters on review.
     * @param {string} vocabId
     * @param {number} quality - 0 to 5 scale rating.
     */
    recordReview(vocabId, quality = 4) {
        let state = this.spacedRepetitionState.get(vocabId) || {
            interval: 1,
            repetition: 0,
            efactor: 2.5,
            lastReviewed: Date.now(),
            mastery: 0
        };

        const q = Math.max(0, Math.min(5, quality));

        if (q >= 3) {
            if (state.repetition === 0) {
                state.interval = 1;
            } else if (state.repetition === 1) {
                state.interval = 6;
            } else {
                state.interval = Math.round(state.interval * state.efactor);
            }
            state.repetition += 1;
        } else {
            state.repetition = 0;
            state.interval = 1;
        }

        state.efactor = Math.max(1.3, state.efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
        state.mastery = Math.min(100, Math.round((state.repetition / 5) * 100));
        state.lastReviewed = Date.now();

        this.spacedRepetitionState.set(vocabId, state);

        if (this.eventBus) {
            this.eventBus.emit('vocabularyReviewed', {
                vocabId,
                quality: q,
                mastery: state.mastery,
                interval: state.interval
            });
        }

        return state;
    }

    /**
     * Get mastery percentage for a vocabulary item.
     * @param {string} vocabId
     * @returns {number}
     */
    getVocabularyMastery(vocabId) {
        const state = this.spacedRepetitionState.get(vocabId);
        return state ? state.mastery : 0;
    }
}
