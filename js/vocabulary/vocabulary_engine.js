/**
 * @file js/vocabulary/vocabulary_engine.js
 * @description JSON-driven Vocabulary Engine for COSY World.
 * Manages vocabulary entries indexed by unique vocabId, tracking multi-scene appearances,
 * SM-2 spaced repetition memory scheduling, and comprehensive learning statistics.
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

        /** @type {Map<string, Object>} Vocabulary entries database keyed by vocabId */
        this.vocabDatabase = new Map();

        /** @type {Map<string, Object>} Learning statistics and SM-2 state keyed by vocabId */
        this.learningStats = new Map();
    }

    /**
     * Normalizes a raw vocabulary entry to ensure all required fields are present.
     * Required fields: vocabId, translations, audio, difficulty, grammar, collocations,
     * exampleSentences, relatedQuests, relatedScenes, masteryLevel.
     *
     * @param {string} vocabId
     * @param {Object} rawData
     * @returns {Object} Normalized vocabulary entry
     */
    normalizeVocabularyEntry(vocabId, rawData) {
        if (!rawData || typeof rawData !== 'object') {
            throw new Error(`Invalid vocabulary data for ID: ${vocabId}`);
        }

        const normalized = {
            vocabId: rawData.vocabId || rawData.id || vocabId,
            translations: rawData.translations || rawData.words || { en: vocabId },
            audio: rawData.audio || rawData.soundCue || 'default_click',
            difficulty: rawData.difficulty || 'A0',
            grammar: rawData.grammar || rawData.grammarId || 'gt_there_is',
            collocations: Array.isArray(rawData.collocations) ? rawData.collocations : [],
            exampleSentences: rawData.exampleSentences || rawData.examples || {
                en: `This is a ${rawData.words?.en || 'word'}.`
            },
            relatedQuests: Array.isArray(rawData.relatedQuests) ? rawData.relatedQuests : (rawData.questId ? [rawData.questId] : []),
            relatedScenes: Array.isArray(rawData.relatedScenes)
                ? rawData.relatedScenes
                : (rawData.locationId ? [rawData.locationId] : ['apartment_living']),
            masteryLevel: typeof rawData.masteryLevel === 'number' ? rawData.masteryLevel : 0
        };

        return normalized;
    }

    /**
     * Register a single vocabulary entry.
     * @param {string} vocabId
     * @param {Object} data
     * @returns {Object}
     */
    registerVocabulary(vocabId, data) {
        const entry = this.normalizeVocabularyEntry(vocabId, data);
        this.vocabDatabase.set(entry.vocabId, entry);

        // Initialize learning statistics state if not already initialized
        if (!this.learningStats.has(entry.vocabId)) {
            this.learningStats.set(entry.vocabId, {
                vocabId: entry.vocabId,
                reviewCount: 0,
                correctCount: 0,
                streak: 0,
                interval: 1, // days
                easeFactor: 2.5,
                masteryLevel: entry.masteryLevel,
                lastReviewed: null,
                nextReviewDue: null
            });
        }

        return entry;
    }

    /**
     * Bulk register multiple vocabulary entries.
     * @param {Object.<string, Object>} dict
     */
    registerVocabularyDict(dict) {
        if (!dict || typeof dict !== 'object') return;
        for (const [id, data] of Object.entries(dict)) {
            this.registerVocabulary(id, data);
        }
    }

    /**
     * Get a vocabulary item by vocabId.
     * @param {string} vocabId
     * @returns {Object|null}
     */
    getVocabulary(vocabId) {
        return this.vocabDatabase.get(vocabId) || null;
    }

    /**
     * Record a review/interaction attempt for spaced repetition learning using SM-2 algorithm.
     *
     * @param {string} vocabId
     * @param {number} quality Grade quality from 0 (forgot completely) to 5 (perfect recall)
     * @returns {Object} Updated learning stats
     */
    recordReview(vocabId, quality = 4) {
        const stats = this.learningStats.get(vocabId) || {
            vocabId,
            reviewCount: 0,
            correctCount: 0,
            streak: 0,
            interval: 1,
            easeFactor: 2.5,
            masteryLevel: 0,
            lastReviewed: null,
            nextReviewDue: null
        };

        const now = Date.now();
        stats.reviewCount++;
        stats.lastReviewed = now;

        if (quality >= 3) {
            stats.correctCount++;
            stats.streak++;

            if (stats.streak === 1) {
                stats.interval = 1;
            } else if (stats.streak === 2) {
                stats.interval = 6;
            } else {
                stats.interval = Math.round(stats.interval * stats.easeFactor);
            }
        } else {
            stats.streak = 0;
            stats.interval = 1;
        }

        // Adjust SM-2 Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        stats.easeFactor = Math.max(1.3, stats.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

        // Calculate mastery level from 0 to 100
        stats.masteryLevel = Math.min(100, Math.round((stats.streak * 20) + (stats.correctCount * 5)));

        // Calculate next review timestamp
        stats.nextReviewDue = now + stats.interval * 86400000;

        this.learningStats.set(vocabId, stats);

        // Update entry's masteryLevel
        const entry = this.vocabDatabase.get(vocabId);
        if (entry) {
            entry.masteryLevel = stats.masteryLevel;
        }

        if (this.eventBus) {
            this.eventBus.emit('vocabularyReviewed', { vocabId, stats, quality });
        }

        return { ...stats };
    }

    /**
     * Get learning statistics for a specific vocabulary item or overall stats.
     * @param {string} [vocabId]
     * @returns {Object}
     */
    getStats(vocabId = null) {
        if (vocabId) {
            return this.learningStats.get(vocabId) || null;
        }

        let totalReviews = 0;
        let totalMastery = 0;
        let masteredCount = 0;

        for (const stats of this.learningStats.values()) {
            totalReviews += stats.reviewCount;
            totalMastery += stats.masteryLevel;
            if (stats.masteryLevel >= 80) {
                masteredCount++;
            }
        }

        const count = this.learningStats.size || 1;

        return {
            totalVocabulary: this.vocabDatabase.size,
            totalReviews,
            masteredCount,
            averageMastery: Math.round(totalMastery / count)
        };
    }

    /**
     * Find vocabulary entries present in a given scene/district.
     * @param {string} sceneId
     * @returns {Object[]}
     */
    getVocabularyForScene(sceneId) {
        const matches = [];
        for (const entry of this.vocabDatabase.values()) {
            if (entry.relatedScenes && entry.relatedScenes.includes(sceneId)) {
                matches.push(entry);
            }
        }
        return matches;
    }
}
