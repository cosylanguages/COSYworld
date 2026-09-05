# 🛠️ Auxiliary Apps Architecture & Repository Separation Strategy

## Executive Summary
This document outlines the architectural recommendation and separation roadmap for modular web tools (Conjugation Trainer, Grammatical Gender Trainer, and other micro-learning applications) in the COSY ecosystem.

---

## 🎯 Strategic Objective
Separate standalone web apps and utility tools from the core `COSYworld` RPG repository into **1 dedicated shared auxiliary applications repository** (e.g., `cosy-tools` or `cosy-apps`).

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
│   │   └── storage.js          # Shared state & progress management
│   └── data/                   # Shared datasets across tools & target languages
│       ├── conjugations.json   # Verb conjugation tables (14 target languages)
│       └── genders.json        # Noun gender datasets with visual cues
└── README.md                   # Setup & developer contribution guide
```

---

## 🔗 Integration with COSY World (`COSYworld`)

1. **Deep-Linking & Query Parameters**:
   - `COSYworld` NPC dialogues or minigames can link directly to specific tools with contextual parameters:
   - Example: `https://tools.cosylanguages.com/conjugation?lang=es&verb=hablar`

2. **Monolingual Direct Immersion Principles**:
   - All auxiliary apps maintain COSY's core **Monolingual Learning Architecture** (no translation cards, direct visual/auditory context, 14 supported target languages).

3. **Unified Progress & XP Synchronization**:
   - Share LocalStorage keys (`cosy_player_progress`, `cosy_vocabulary_mastery`) so practice in `cosy-tools` can reward XP and unlock achievements in `COSYworld`.

---

## 🚀 Migration Steps & Next Actions

1. **Initialize `cosy-tools` Repository**: Create new Git repository with shared COSY CSS tokens.
2. **Extract Conjugation & Gender Modules**: Move conjugation and gender practice utilities into dedicated app folders.
3. **Harmonize Data Schemas**: Standardize JSON schemas for verbs, conjugations, and noun genders across 14 target languages.
4. **Update Web Navigation & Links**: Connect the main COSY website and RPG game HUD to `cosy-tools` apps.
