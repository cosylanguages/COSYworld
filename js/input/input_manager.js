/**
 * @file js/input/input_manager.js
 * @description Input Manager for COSY World.
 * Normalizes keyboard, touch, swipe, and mouse events and emits event notifications via EventBus.
 */

export class InputManager {
    /**
     * @param {Object} [options]
     * @param {import('../engine/event_bus.js').EventBus} [options.eventBus]
     */
    constructor(options = {}) {
        this.eventBus = options.eventBus || null;
        /** @type {Object<string, boolean>} */
        this.keysPressed = {};
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 50;
        this.isListening = false;

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);
    }

    /**
     * Bind global window/document DOM input event listeners.
     */
    init() {
        if (this.isListening || typeof window === 'undefined') return;

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        window.addEventListener('touchstart', this._onTouchStart, { passive: true });
        window.addEventListener('touchend', this._onTouchEnd, { passive: true });

        this.isListening = true;
    }

    /**
     * Remove event listeners.
     */
    destroy() {
        if (!this.isListening || typeof window === 'undefined') return;

        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('touchstart', this._onTouchStart);
        window.removeEventListener('touchend', this._onTouchEnd);

        this.isListening = false;
        this.keysPressed = {};
    }

    /**
     * Check if a specific key is currently held down.
     * @param {string} key
     * @returns {boolean}
     */
    isKeyDown(key) {
        return !!this.keysPressed[key];
    }

    /**
     * @private
     */
    _onKeyDown(e) {
        this.keysPressed[e.key] = true;
        if (this.eventBus) {
            this.eventBus.emit('keyDown', { key: e.key, originalEvent: e });
            if (e.key === 'Escape') {
                this.eventBus.emit('escapePressed');
            }
        }
    }

    /**
     * @private
     */
    _onKeyUp(e) {
        this.keysPressed[e.key] = false;
        if (this.eventBus) {
            this.eventBus.emit('keyUp', { key: e.key, originalEvent: e });
        }
    }

    /**
     * @private
     */
    _onTouchStart(e) {
        if (e.touches && e.touches.length > 0) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }
    }

    /**
     * @private
     */
    _onTouchEnd(e) {
        if (e.changedTouches && e.changedTouches.length > 0) {
            const dx = e.changedTouches[0].clientX - this.touchStartX;
            const dy = e.changedTouches[0].clientY - this.touchStartY;

            if (Math.abs(dx) > this.swipeThreshold || Math.abs(dy) > this.swipeThreshold) {
                if (this.eventBus) {
                    this.eventBus.emit('swipe', { dx, dy });
                }
            }
        }
    }
}
