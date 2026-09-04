# COSY World Technical Architecture

## Overview
COSY World is built as a lightweight, modular vanilla JavaScript web application structured around ES6 modules and HTML5 SVG rendering.

---

## Core Engine Architecture (`js/engine/core.js`)

`GameEngine` acts as the master orchestrator:
1. **Pub-Sub Event Bus**: `on(event, fn)`, `off(event, fn)`, `emit(event, payload)` decoupled components.
2. **Asynchronous Dataset Loader**: Fetches JSON configuration files from `data/` at initialization:
   - `data/languages/languages.json`
   - `data/scenes/districts.json`
   - `data/vocabulary/objects.json`
   - `data/npcs/npcs.json`
   - `data/quests/quests.json`
   - `data/grammar/grammar.json`
3. **Game Loop**: `requestAnimationFrame` loop with delta time calculations for animation and camera clamping.
4. **State Persistence**: `SaveSystem` serializes player progression, discovered items, unlocked grammar, and NPC relationships to `LocalStorage`.

---

## Rendering Pipeline (`js/scenes/scene_renderer.js`)

- **SVG Stage Rendering**: Renders SVG interactive canvas dynamically based on location definitions in `data/scenes/districts.json`.
- **Hotspots Engine**: Render object elements with interactive glowing pulse overlays (`.cw-hotspot.pulse`), accessibility focus rings, and click triggers.
- **NPC Engine**: Render character avatars, role labels, gesture states, and friendship badges.

---

## Dialogue Engine (`js/dialogue/dialogue.js`)

- **Node Graph Decision Trees**: Branching choice paths defined in JSON.
- **Audio TTS Integration**: `SpeechSynthesisUtterance` Web Speech API integration with variable playback speed controls (0.8x, 1.0x, 1.3x) and language ISO code mappings.
- **Typing Effect**: Text stream animation with cursor indicators.
