/**
 * COSYworld/js/main.js
 * Entry point module for COSY World. Initializes engine instance and attaches window.COSY_WORLD.
 */

import { GameEngine } from './engine/core.js';

const engine = new GameEngine();

window.COSY_WORLD = engine;
window.COSY_WORLD.worldBuilder = engine.worldBuilder;
window.COSY_WORLD.buildingManager = engine.buildingManager;
window.COSY_WORLD.vocabularyEngine = engine.vocabularyEngine;
window.COSY_WORLD.npcAIEngine = engine.npcAIEngine;
window.COSY_WORLD.enterBuilding = (buildingId, entranceId) => engine.enterBuilding(buildingId, entranceId);
window.COSY_WORLD.exitBuilding = () => engine.exitBuilding();
window.COSY_WORLD.loadDLCFolder = async (folderPath) => {
    const res = await engine.worldBuilder.loadDLC(folderPath);
    engine.data.districts = engine.worldBuilder.exportDistrictsObject();
    engine.showToast(`DLC Loaded: ${folderPath} 📦`);
    return res;
};

document.addEventListener('DOMContentLoaded', () => {
    engine.init();
});

export default engine;
