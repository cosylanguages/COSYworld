/**
 * COSYworld/js/main.js
 * Entry point module for COSY World. Initializes engine instance and attaches window.COSY_WORLD.
 */

import { GameEngine } from './engine/core.js';

const engine = new GameEngine();

window.COSY_WORLD = engine;

document.addEventListener('DOMContentLoaded', () => {
    engine.init();
});

export default engine;
