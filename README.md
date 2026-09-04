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
│   ├── engine/           # Core orchestrator, game loop, pub-sub event bus
│   ├── world/            # World manager, district logic, ambience
│   ├── scenes/           # SVG scene & hotspot renderer
│   ├── npc/              # NPC rendering & gesture handlers
│   ├── dialogue/         # Branching tree dialogue engine & Web Speech TTS
│   ├── quests/           # Mission evaluator & quest progression
│   ├── vocabulary/       # Object inspector & visual cause-effect chains
│   ├── grammar/          # Grammar tree unlocks & CEFR progression
│   ├── player/           # Citizen level, XP, statistics
│   ├── inventory/        # Discovered items & visual encyclopedia
│   ├── save/             # LocalStorage persistence & save recovery
│   └── utils/            # Helper functions & geometry math
├── data/
│   ├── languages/        # Target language definitions & flags
│   ├── vocabulary/       # Interactive object metadata across 14 languages
│   ├── grammar/          # Grammar node unlock definitions
│   ├── scenes/           # Spatial topology, SVG coordinates, door linkages
│   ├── npcs/             # NPC dialogue trees, gestures, roles
│   └── quests/           # Story quests, rewards, and conditions
├── assets/
│   ├── images/           # Scene backgrounds, custom graphics
│   ├── audio/            # Ambient soundscapes, audio effects
│   └── icons/            # SVG icons and emojis
└── docs/
    ├── architecture.md   # Core engine technical architecture
    ├── contributing.md   # Detailed developer contribution guidelines
    ├── game_design.md   # Inductive direct immersion design manifesto
    └── migration_report.md # Repository separation audit log
```

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
