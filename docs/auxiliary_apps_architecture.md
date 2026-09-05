# 🛠️ Auxiliary Apps Architecture & Repository Separation Strategy

## Executive Summary
This document outlines the architectural recommendation and migration strategy for modular web tools (Conjugation Trainer, Grammatical Gender Trainer, and other micro-learning applications) in the COSY ecosystem.

---

## 🎯 Strategic Objective
Separate standalone web apps and utility tools from the core `COSYworld` RPG repository into **1 dedicated shared auxiliary applications repository** (`cosy-tools`).

---

## 🏛️ Architectural Comparison

| Criteria | Strategy A: Single Tools Repo (`cosy-tools`) | Strategy B: Monorepo (`COSYworld` + Tools) | Strategy C: N Standalone Repos |
| :--- | :--- | :--- | :--- |
| **Recommendation** | **Recommended** 🏆 | Alternative | Not Recommended |
| **Repo Overhead** | Low (1 Game Repo + 1 Tools Repo) | Medium (Complex build pipeline) | High (Repository sprawl) |
| **Separation of Concerns** | High (Game Engine separated from Web Tools) | Low (Engine & web apps mixed) | High |
| **Code & Style Sharing** | High (Shared CSS tokens & datasets across tools) | High | Low (Duplicated code across repos) |
| **Deployment Simplicity** | High (Independent static web app deployments) | Medium | Low |

---

## 📂 Proposed Repository Structure (`cosy-tools`)

```
cosy-tools/
├── index.html                  # Central hub for all COSY language web tools
├── css/
│   └── shared-ui.css           # Unified COSY design system tokens & styles
├── apps/
│   ├── conjugation/            # Verb Conjugation Trainer & Reference App
│   │   ├── index.html
│   │   └── app.js
│   ├── gender/                 # Grammatical Gender Trainer (der/die/das, le/la)
│   │   ├── index.html
│   │   └── app.js
│   └── flashcards/             # Spaced Repetition Flashcard Tool
│       ├── index.html
│       └── app.js
├── shared/
│   ├── js/
│   │   ├── tts_helper.js       # Shared Web Speech API voice synthesis
│   │   ├── widget_wrapper.js   # Shared Custom Element / iframe widget wrapper
│   │   └── storage.js          # Shared state & progress management
│   └── data/                   # Shared datasets across tools & target languages
│       ├── conjugations.json   # Verb conjugation tables (14 target languages)
│       └── genders.json        # Noun gender datasets with visual cues
├── manifest.json               # Web App Manifest for device installability
├── sw.js                       # Service Worker for offline accessibility
└── README.md                   # Setup & developer contribution guide
```

---

## 🔗 Integration with COSY World (`COSYworld`)

1. **Deep-Linking & Query Parameters**:
   - `COSYworld` NPC dialogues or minigames can link directly to specific tools with contextual parameters:
   - Example: `https://tools.cosylanguages.com/conjugation?lang=es&verb=hablar`

2. **Embeddable Widget Architecture**:
   - Web apps in `cosy-tools` can be embedded into the main website or third-party platforms as lightweight widgets (via Custom Web Components or `<iframe>` embeds).

3. **Offline Accessibility & Device Installability**:
   - Equipped with Progressive Web App (PWA) manifests and Service Worker caching (`sw.js`) so users can install apps to home screens and practice offline across devices.

4. **Monolingual Direct Immersion Principles**:
   - All auxiliary apps maintain COSY's core **Monolingual Learning Architecture** (no translation cards, direct visual/auditory context, 14 supported target languages).

5. **Unified Progress & XP Synchronization**:
   - Share LocalStorage keys (`cosy_player_progress`, `cosy_vocabulary_mastery`) so practice in `cosy-tools` can reward XP and unlock achievements in `COSYworld`.

---

## 🚀 Migration Strategy & Execution Plan

1. **Phase 1: Repository Initialization (`cosy-tools`)**:
   - Create the `cosy-tools` standalone Git repository.
   - Import shared COSY CSS tokens and UI components.

2. **Phase 2: App Extraction & Modularity**:
   - Extract Conjugation and Grammatical Gender modules into `/apps/conjugation` and `/apps/gender`.
   - Build central tools directory at `index.html`.

3. **Phase 3: Dataset Harmonization**:
   - Consolidate conjugation tables and noun gender metadata across all 14 target languages under `/shared/data`.

4. **Phase 4: Widget & PWA Offline Enablement**:
   - Add `widget_wrapper.js` for web widget embedding.
   - Configure `sw.js` and `manifest.json` for offline installation on mobile and desktop.

5. **Phase 5: Website Navigation & Cross-Links**:
   - Link `COSYworld` HUD and main site header to the new `cosy-tools` portal.
