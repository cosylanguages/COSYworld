/**
 * @file js/utils/math.js
 * @description Mathematics and geometry utility functions for collision detection, clamping, lerp, and vector operations.
 */

/**
 * Axis-Aligned Bounding Box (AABB) collision detection between two rectangular bounds.
 * @param {{ x: number, y: number, width: number, height: number }} rect1
 * @param {{ x: number, y: number, width: number, height: number }} rect2
 * @returns {boolean} True if rect1 overlaps rect2.
 */
export function checkCollision(rect1, rect2) {
    if (!rect1 || !rect2) return false;
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * Clamp a number value within [min, max] range.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

/**
 * Linear interpolation between start and end by factor t.
 * @param {number} start
 * @param {number} end
 * @param {number} t Factor [0, 1]
 * @returns {number}
 */
export function lerp(start, end, t) {
    return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Calculate Euclidean distance between two 2D points.
 * @param {{ x: number, y: number }} p1
 * @param {{ x: number, y: number }} p2
 * @returns {number}
 */
export function distance2D(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.hypot(dx, dy);
}
