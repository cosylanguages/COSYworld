/**
 * @file js/engine/asset_manager.js
 * @description Centralized, scalable Asset Manager for COSY World.
 * Handles fetching, caching, preloading, and index-manifest lookup for JSON datasets, images, and audio assets.
 * Future-proofed for thousands of game assets via chunking and lazy-loading.
 */

export class AssetManager {
    /**
     * @param {Object} [config] - Optional configuration override.
     */
    constructor(config = {}) {
        this.basePath = config.basePath || 'data/';
        /** @type {Map<string, any>} Cached assets indexed by key or path */
        this.cache = new Map();
        /** @type {Map<string, Promise<any>>} Active loading promises to avoid duplicate fetches */
        this.loadingPromises = new Map();
        /** @type {Object} Manifest directory for scalable indexing */
        this.manifest = {
            images: {},
            audio: {},
            data: {}
        };
    }

    /**
     * Set asset manifest for indexed key lookups.
     * @param {Object} manifest
     */
    setManifest(manifest) {
        if (!manifest) return;
        this.manifest = { ...this.manifest, ...manifest };
    }

    /**
     * Load JSON dataset from path or cached entry.
     * @param {string} relativePath - Relative path under basePath or full path.
     * @returns {Promise<any>} Parsed JSON content.
     */
    async loadJson(relativePath) {
        const fullPath = relativePath.startsWith('http') || relativePath.startsWith('/') || relativePath.startsWith('data/')
            ? relativePath
            : `${this.basePath}${relativePath}`;

        if (this.cache.has(fullPath)) {
            return this.cache.get(fullPath);
        }

        if (this.loadingPromises.has(fullPath)) {
            return this.loadingPromises.get(fullPath);
        }

        const fetchPromise = (async () => {
            try {
                const response = await fetch(fullPath);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status} loading ${fullPath}`);
                }
                const data = await response.json();
                this.cache.set(fullPath, data);
                this.loadingPromises.delete(fullPath);
                return data;
            } catch (err) {
                this.loadingPromises.delete(fullPath);
                console.error(`AssetManager failed to load JSON: ${fullPath}`, err);
                throw err;
            }
        })();

        this.loadingPromises.set(fullPath, fetchPromise);
        return fetchPromise;
    }

    /**
     * Preload multiple JSON files in parallel.
     * @param {string[]} paths - List of relative JSON paths.
     * @returns {Promise<Map<string, any>>} Map of loaded assets keyed by path.
     */
    async preloadJsonFiles(paths) {
        const results = await Promise.all(paths.map(p => this.loadJson(p)));
        const map = new Map();
        paths.forEach((p, idx) => map.set(p, results[idx]));
        return map;
    }

    /**
     * Get a cached asset.
     * @param {string} pathOrKey
     * @returns {any|null}
     */
    get(pathOrKey) {
        if (this.cache.has(pathOrKey)) {
            return this.cache.get(pathOrKey);
        }
        const fullPath = `${this.basePath}${pathOrKey}`;
        return this.cache.get(fullPath) || null;
    }

    /**
     * Unload an asset from cache to free memory.
     * @param {string} pathOrKey
     * @returns {boolean} Whether an asset was deleted.
     */
    unload(pathOrKey) {
        const fullPath = pathOrKey.startsWith(this.basePath) ? pathOrKey : `${this.basePath}${pathOrKey}`;
        const result1 = this.cache.delete(pathOrKey);
        const result2 = this.cache.delete(fullPath);
        return result1 || result2;
    }

    /**
     * Clear all cached assets.
     */
    clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
    }
}
