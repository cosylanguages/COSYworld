/**
 * games/cosy_world/js/audio/audio.js
 * Forwarder class for backward compatibility with existing codebase imports.
 */

import { AudioManager as CoreAudioManager } from './audio_manager.js';

export class AudioManager extends CoreAudioManager {
    constructor(options) {
        super(options);
    }
}
