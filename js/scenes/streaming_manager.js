/**
 * js/scenes/streaming_manager.js
 * Streaming World Manager for COSY Town.
 *
 * Capabilities:
 * - Continuous spatial tracking of player across world grid coordinates.
 * - Automatic background lazy loading of adjacent districts.
 * - Purging/unloading of distant district assets to optimize memory and maintain 60 FPS.
 * - Seamless boundary crossing without loading screens.
 */

export class StreamingWorldManager {
    constructor() {
        this.loadedDistricts = new Map();
        this.activeDistrictId = 'apartment_living';
        this.isStreaming = false;
        this.loadingQueue = new Set();
        this.fpsCounter = {
            frames: 0,
            lastTime: performance.now(),
            fps: 60
        };
    }

    /**
     * Initializes streaming for initial location.
     */
    async initStreaming(initialLocationId, gameData) {
        this.activeDistrictId = initialLocationId || 'apartment_living';
        await this.loadDistrict(this.activeDistrictId, gameData);
        await this.preloadAdjacentDistricts(this.activeDistrictId, gameData);
    }

    /**
     * Loads a district into active memory cache if not already loaded.
     */
    async loadDistrict(districtId, gameData) {
        if (this.loadedDistricts.has(districtId)) {
            return this.loadedDistricts.get(districtId);
        }

        const districtData = gameData?.districts?.[districtId];
        if (!districtData) return null;

        this.loadingQueue.add(districtId);

        // Simulate async micro-chunk load for non-blocking rendering
        await new Promise(resolve => setTimeout(resolve, 0));

        this.loadedDistricts.set(districtId, districtData);
        this.loadingQueue.delete(districtId);
        return districtData;
    }

    /**
     * Lazy loads adjacent districts in background.
     */
    async preloadAdjacentDistricts(districtId, gameData) {
        const district = gameData?.districts?.[districtId];
        if (!district || !district.neighbors) return;

        const loadPromises = district.neighbors.map(neighborId => {
            if (!this.loadedDistricts.has(neighborId) && !this.loadingQueue.has(neighborId)) {
                return this.loadDistrict(neighborId, gameData);
            }
            return Promise.resolve();
        });

        await Promise.all(loadPromises);
    }

    /**
     * Unloads distant districts beyond immediate neighbors to preserve memory & 60 FPS performance.
     */
    unloadDistantDistricts(activeDistrictId, gameData) {
        const activeDistrict = gameData?.districts?.[activeDistrictId];
        if (!activeDistrict) return;

        const keepSet = new Set([
            activeDistrictId,
            ...(activeDistrict.neighbors || [])
        ]);

        for (const [districtId] of this.loadedDistricts.entries()) {
            if (!keepSet.has(districtId)) {
                this.loadedDistricts.delete(districtId);
            }
        }
    }

    /**
     * Calculates required visible active + adjacent districts for seamless multi-viewport rendering.
     */
    getVisibleDistricts(activeDistrictId, gameData) {
        const active = this.loadedDistricts.get(activeDistrictId) || gameData?.districts?.[activeDistrictId];
        if (!active) return [];

        const visible = [active];
        if (active.neighbors) {
            active.neighbors.forEach(neighborId => {
                const neighbor = this.loadedDistricts.get(neighborId) || gameData?.districts?.[neighborId];
                if (neighbor) {
                    visible.push(neighbor);
                }
            });
        }
        return visible;
    }

    /**
     * Smoothly checks player world position and transitions active district seamlessly if crossing bounds.
     */
    checkBoundaryCrossing(currentLocId, localX, localY, gameData) {
        const currentLoc = gameData?.districts?.[currentLocId];
        if (!currentLoc) return null;

        // Bounding checks based on local viewport coordinates (0 to 800 width, 0 to 500 height)
        let nextLocId = null;

        if (localX < 30) {
            const leftDoor = currentLoc.doors?.find(d => d.x <= 50);
            if (leftDoor) nextLocId = leftDoor.targetId;
        } else if (localX > 730) {
            const rightDoor = currentLoc.doors?.find(d => d.x >= 700);
            if (rightDoor) nextLocId = rightDoor.targetId;
        } else if (localY > 440) {
            const bottomDoor = currentLoc.doors?.find(d => d.y >= 350);
            if (bottomDoor) nextLocId = bottomDoor.targetId;
        } else if (localY < 60) {
            const topDoor = currentLoc.doors?.find(d => d.y <= 100);
            if (topDoor) nextLocId = topDoor.targetId;
        }

        return nextLocId;
    }

    /**
     * FPS monitor to track frame rate stability.
     */
    updateFPS(now) {
        this.fpsCounter.frames++;
        const elapsed = now - this.fpsCounter.lastTime;
        if (elapsed >= 1000) {
            this.fpsCounter.fps = Math.round((this.fpsCounter.frames * 1000) / elapsed);
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastTime = now;
        }
        return this.fpsCounter.fps;
    }
}
