/**
 * @file js/engine/event_bus.js
 * @description Decoupled publish-subscribe event bus system.
 * Allows independent game systems to communicate asynchronously without direct coupling.
 */

export class EventBus {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this.listeners = new Map();
        /** @type {Array<{ event: string, payload: any, timestamp: number }>} */
        this.history = [];
        this.maxHistorySize = 100;
    }

    /**
     * Subscribe to an event.
     * @param {string} event - Name of the event.
     * @param {Function} callback - Event handler function.
     * @returns {Function} Unsubscribe function for convenience.
     */
    on(event, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('EventBus callback must be a function');
        }
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once.
     * @param {string} event - Name of the event.
     * @param {Function} callback - Event handler function.
     */
    once(event, callback) {
        const wrapper = (payload) => {
            this.off(event, wrapper);
            callback(payload);
        };
        this.on(event, wrapper);
    }

    /**
     * Unsubscribe a callback from an event.
     * @param {string} event - Name of the event.
     * @param {Function} callback - Event handler function to remove.
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const set = this.listeners.get(event);
        set.delete(callback);
        if (set.size === 0) {
            this.listeners.delete(event);
        }
    }

    /**
     * Emit an event with payload.
     * @param {string} event - Name of the event.
     * @param {any} [payload] - Event payload data.
     */
    emit(event, payload) {
        // Record event in history
        this.history.push({ event, payload, timestamp: Date.now() });
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        if (!this.listeners.has(event)) return;
        const set = this.listeners.get(event);
        set.forEach(callback => {
            try {
                callback(payload);
            } catch (err) {
                console.error(`Error in EventBus listener for "${event}":`, err);
            }
        });
    }

    /**
     * Clear all listeners or specific event listeners.
     * @param {string} [event] - Optional event name to clear.
     */
    clear(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Check if an event has subscribers.
     * @param {string} event - Name of the event.
     * @returns {boolean}
     */
    has(event) {
        return this.listeners.has(event) && this.listeners.get(event).size > 0;
    }
}
