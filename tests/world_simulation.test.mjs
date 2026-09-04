import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldSimulationEngine } from '../js/world/world_simulation.js';

test('WorldSimulationEngine - initializes default state and configuration', () => {
    const sim = new WorldSimulationEngine();
    assert.equal(sim.timeOfDay, 'morning');
    assert.equal(sim.hour, 8);
    assert.equal(sim.season, 'spring');
    assert.equal(sim.weather, 'clear');
    assert.equal(sim.getTimeString(), '08:00');
});

test('WorldSimulationEngine - time progression advances hours and updates time of day', () => {
    const sim = new WorldSimulationEngine();
    sim.timeScale = 3600; // 1 sec = 1 hour

    sim.update(2); // advance 2 hours (8 -> 10)
    assert.equal(sim.hour, 10);
    assert.equal(sim.timeOfDay, 'morning');

    sim.update(3); // advance 3 hours (10 -> 13)
    assert.equal(sim.hour, 13);
    assert.equal(sim.timeOfDay, 'afternoon');

    sim.update(6); // advance 6 hours (13 -> 19)
    assert.equal(sim.hour, 19);
    assert.equal(sim.timeOfDay, 'evening');

    sim.update(4); // advance 4 hours (19 -> 23)
    assert.equal(sim.hour, 23);
    assert.equal(sim.timeOfDay, 'night');
});

test('WorldSimulationEngine - supports direct setting of time, season, and weather', () => {
    const sim = new WorldSimulationEngine();

    sim.setTimeOfDay('night');
    assert.equal(sim.timeOfDay, 'night');
    assert.equal(sim.hour, 22);

    sim.setSeason('winter');
    assert.equal(sim.season, 'winter');

    sim.setWeather('snow');
    assert.equal(sim.weather, 'snow');
});

test('WorldSimulationEngine - smooth lighting calculations blend RGBA correctly', () => {
    const sim = new WorldSimulationEngine();
    sim.setTimeOfDay('night');
    sim.setSeason('winter');
    sim.setWeather('snow');

    const rgba = sim.getLightingRgba();
    assert.ok(rgba.startsWith('rgba('));
    assert.ok(rgba.endsWith(')'));
});

test('WorldSimulationEngine - triggers NPC schedule updates on hour ticks', () => {
    let scheduleUpdatedTime = null;
    const mockNpcEngine = {
        updateScheduleTick: (timeStr) => {
            scheduleUpdatedTime = timeStr;
        }
    };

    const mockGameEngine = {
        npcAIEngine: mockNpcEngine,
        audioManager: { playAmbience: () => {} },
        renderWorldViewport: () => {}
    };

    const sim = new WorldSimulationEngine({ gameEngine: mockGameEngine });
    sim.timeScale = 3600;
    sim.update(1); // advance 1 hour (8 -> 9)

    assert.equal(scheduleUpdatedTime, '09:00');
});

test('WorldSimulationEngine - state export and import', () => {
    const sim = new WorldSimulationEngine();
    sim.setTimeOfDay('evening');
    sim.setSeason('autumn');
    sim.setWeather('fog');

    const exported = sim.exportState();
    assert.equal(exported.timeOfDay, 'evening');
    assert.equal(exported.season, 'autumn');
    assert.equal(exported.weather, 'fog');

    const sim2 = new WorldSimulationEngine();
    sim2.importState(exported);
    assert.equal(sim2.timeOfDay, 'evening');
    assert.equal(sim2.season, 'autumn');
    assert.equal(sim2.weather, 'fog');
});
