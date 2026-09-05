# 🌍 COSY World

> **Open-World Language Learning RPG** — Learn languages through direct immersion, interactive cause-and-effect chains, natural NPC dialogues, and realistic world exploration across 14 target languages.

---

## 🌟 Project Vision

COSY World is an independent, open-source language learning RPG built around **Inductive Direct Immersion ("Learn by Living, Not by Translating")**. Instead of flashcard memorization or text translation, players acquire language naturally by interacting with everyday objects, observing cause-and-effect visual sequences, conversing with local town NPCs, and completing contextual missions in COSY Town.

---

## 🚀 Getting Started

### Prerequisites
COSY World runs 100% in modern browsers using native ES Modules, CSS3, and HTML5 SVG rendering. No build tools or Node.js servers are required to run or play the game.

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/cosylanguages/COSYworld.git
   cd COSYworld
   ```
2. Serve the directory using any static web server:
   ```bash
   npx http-server -p 8080 .
   # or
   python3 -m http.server 8080
   ```
3. Open `http://localhost:8080` in your web browser.

---

## 📂 Repository Structure

```
COSYworld/
├── index.html            # Main game entry point & DOM layout shell
├── css/
│   ├── main.css          # Design system tokens, stage card, SVG viewport
│   └── ui.css            # HUD sidebar, modals, controls, stats badges
├── js/
│   ├── audio/            # Spatial audio, sound synthesis, multi-channel soundscape
│   ├── camera/           # Viewport camera pan, zoom, and dynamic target tracking
│   ├── dialogue/         # Branching tree dialogue engine & Web Speech TTS
│   ├── engine/           # Core orchestrator, game loop, pub-sub event bus
│   ├── grammar/          # Grammar tree unlocks & CEFR progression
│   ├── input/            # Keyboard, touch, and pointer input handling
│   ├── inventory/        # Discovered items & visual encyclopedia
│   ├── localization/     # Dynamic target-language text resolution
│   ├── minigames/        # Interactive mini-game framework and loaders
│   ├── npc/              # NPC AI schedule system, rendering & gesture handlers
│   ├── player/           # Citizen level, XP, statistics
│   ├── quests/           # Mission evaluator & quest progression
│   ├── save/             # LocalStorage persistence & save recovery
│   ├── scenes/           # SVG scene & hotspot renderer
│   ├── ui/               # HUD interface tabs, modals, and notifications
│   ├── utils/            # Helper functions & geometry math
│   ├── vocabulary/       # Object inspector & visual cause-effect chains
│   └── world/            # World manager, district streaming, simulation & maps
├── data/
│   ├── buildings/        # Outdoor district building metadata and hotspots
│   ├── config/           # Game configuration, achievements, and system settings
│   ├── dialogues/        # Branching NPC dialogue tree datasets
│   ├── dlc/              # Expansion packs and downloadable content manifests
│   ├── grammar/          # Grammar node unlock definitions
│   ├── grammar_patterns/ # Interactive grammar pattern exercise datasets
│   ├── interiors/        # Modular interior room layouts and object placements
│   ├── languages/        # Target language definitions & flags
│   ├── minigames/        # Mini-game configuration and quiz question datasets
│   ├── npcs/             # NPC profiles, schedules, expressions, and roles
│   ├── quests/           # Story quests, rewards, and conditions
│   ├── scenes/           # Spatial topology, SVG coordinates, door linkages
│   ├── situations/       # Contextual real-world social interaction scenarios
│   ├── vocabulary/       # Interactive object metadata across 14 languages
│   └── world/            # Simulation settings, time, weather, and world state
├── assets/
│   ├── images/           # Scene backgrounds, custom graphics
│   ├── audio/            # Ambient soundscapes, audio effects
│   └── icons/            # SVG icons and emojis
└── docs/
    ├── architecture.md   # Core engine technical architecture
    ├── auxiliary_apps_architecture.md # COSYtools architecture & separation guide
    ├── contributing.md   # Detailed developer contribution guidelines
    └── game_design.md   # Inductive direct immersion design manifesto
```

---

## 🧰 COSY Ecosystem & Auxiliary Tools

In addition to the RPG immersion engine in `COSYworld`, auxiliary language tools (such as verb conjugation trainers, grammatical gender practice tools, and verb reference matrices) are maintained in a dedicated companion repository:

- **COSYtools**: [https://github.com/cosylanguages/COSYtools](https://github.com/cosylanguages/COSYtools)

For architectural details on how `COSYworld` integrates with `COSYtools`, see [`docs/auxiliary_apps_architecture.md`](docs/auxiliary_apps_architecture.md).

---

## 🤝 Contribution Guide

We welcome contributions from game developers, language educators, translators, and open-source enthusiasts!

### Allowed Contributions
- 🏙️ **New Scenes & Districts**: Expand COSY Town with new locations (Market, Library, Park, Station).
- 📚 **Vocabulary & Objects**: Add real-world items with 14-language translations and visual cause-effect chains.
- 💬 **NPCs & Dialogues**: Author multi-node branching dialogue trees with voice reactions and quests.
- 🌐 **Translations & Localization**: Improve or expand support across target languages.
- 🐛 **Bug Fixes & Mini-Games**: Enhance engine performance, UI accessibility, or interactive mini-games.

### Require Maintainer Approval
- Engine core architecture modifications (`js/engine/core.js`).
- Educational methodology or CEFR progression framework updates.
- Save system schema breaking changes.

Please refer to [`CONTRIBUTING.md`](CONTRIBUTING.md) for detailed guidelines.

---

## 🗺️ Roadmap

- [x] Independent repository migration & standalone architecture
- [x] Core 14-language Direct Immersion Engine
- [x] Interactive SVG World Stage with Hotspots & NPCs
- [x] Branching Dialogue Engine with Speech Synthesis TTS
- [ ] District Expansion: City Market, Train Station, High School
- [ ] Web Speech API Voice Recognition for Speech Practice
- [ ] Offline PWA Service Worker caching
