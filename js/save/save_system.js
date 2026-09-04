/**
 * games/cosy_world/js/save/save_system.js
 * Forwarder class for backward compatibility with existing codebase imports.
 */

import { SaveManager, STORAGE_KEY } from './save_manager.js';

export class SaveSystem {
    static loadInitialState() {
        const mgr = new SaveManager();
        return mgr.loadInitialState();
    }

    static saveState(state) {
        const mgr = new SaveManager();
        mgr.saveState(state);
    }
}
