/**
 * @file js/camera/camera_manager.js
 * @description Camera Manager for COSY World.
 * Manages 2D viewport pan/zoom, target tracking, coordinate translation, and boundary clamping.
 */

import { clamp, lerp } from '../utils/math.js';

export class CameraManager {
    /**
     * @param {Object} [options]
     * @param {number} [options.x=0]
     * @param {number} [options.y=0]
     * @param {number} [options.zoom=1]
     * @param {Object} [options.bounds]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.zoom = options.zoom || 1;
        this.minZoom = options.minZoom || 0.5;
        this.maxZoom = options.maxZoom || 2.5;
        this.smoothFactor = options.smoothFactor || 0.1;
        this.bounds = options.bounds || { minX: 0, maxX: 800, minY: 0, maxY: 500 };
        this.target = null;
        this.eventBus = options.eventBus || null;
    }

    /**
     * Set camera target object with x, y coordinates to smoothly follow.
     * @param {{ x: number, y: number }|null} target
     */
    setTarget(target) {
        this.target = target;
    }

    /**
     * Instantly center camera on position.
     * @param {number} x
     * @param {number} y
     */
    setPosition(x, y) {
        this.x = clamp(x, this.bounds.minX, this.bounds.maxX);
        this.y = clamp(y, this.bounds.minY, this.bounds.maxY);
        if (this.eventBus) {
            this.eventBus.emit('cameraMoved', { x: this.x, y: this.y, zoom: this.zoom });
        }
    }

    /**
     * Set zoom level within allowed [minZoom, maxZoom] range.
     * @param {number} zoomLevel
     */
    setZoom(zoomLevel) {
        this.zoom = clamp(zoomLevel, this.minZoom, this.maxZoom);
        if (this.eventBus) {
            this.eventBus.emit('cameraZoomed', { zoom: this.zoom });
        }
    }

    /**
     * Update camera position per frame toward target.
     * @param {number} [dt=0.016]
     */
    update(dt = 0.016) {
        if (!this.target) return;

        const targetX = clamp(this.target.x, this.bounds.minX, this.bounds.maxX);
        const targetY = clamp(this.target.y, this.bounds.minY, this.bounds.maxY);

        const factor = Math.min(1, this.smoothFactor * (dt * 60));
        this.x = lerp(this.x, targetX, factor);
        this.y = lerp(this.y, targetY, factor);
    }

    /**
     * Transform world point to screen point taking zoom and camera pan into account.
     * @param {number} worldX
     * @param {number} worldY
     * @returns {{ x: number, y: number }}
     */
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.zoom,
            y: (worldY - this.y) * this.zoom
        };
    }
}
