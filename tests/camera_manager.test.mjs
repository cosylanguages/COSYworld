import test from 'node:test';
import assert from 'node:assert/strict';
import { CameraManager } from '../js/camera/camera_manager.js';

test('CameraManager - setPosition clamps within bounds', () => {
    const camera = new CameraManager({
        bounds: { minX: 0, maxX: 500, minY: 0, maxY: 300 }
    });

    camera.setPosition(600, -50);
    assert.equal(camera.x, 500);
    assert.equal(camera.y, 0);
});

test('CameraManager - setZoom clamps within min/max zoom', () => {
    const camera = new CameraManager({ minZoom: 0.5, maxZoom: 2.0 });

    camera.setZoom(3.5);
    assert.equal(camera.zoom, 2.0);

    camera.setZoom(0.1);
    assert.equal(camera.zoom, 0.5);
});

test('CameraManager - smooth updates toward target', () => {
    const target = { x: 200, y: 100 };
    const camera = new CameraManager({ smoothFactor: 0.5 });
    camera.setTarget(target);

    camera.update(0.016);
    assert.ok(camera.x > 0 && camera.x <= 200);
    assert.ok(camera.y > 0 && camera.y <= 100);
});
